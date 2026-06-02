const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { publishEvent } = require('../services/eventBridge');
const axios = require('axios');

const router = express.Router();

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: process.env.AWS_REGION || 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'aerolink-bookings';

const CircuitBreaker = require('opossum');

// For the Saga pattern, we pretend to hit a payment gateway
const simulatePayment = async (amount, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('Payment gateway declined the card.'));
      else resolve({ transactionId: uuidv4(), status: 'SUCCESS' });
    }, 1000); // 1 second delay to simulate network latency
  });
};

// CIRCUIT BREAKER IMPLEMENTATION
const breakerOptions = {
  timeout: 3000, // If our payment gateway takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 10000 // After 10 seconds, try again
};

const paymentCircuitBreaker = new CircuitBreaker(simulatePayment, breakerOptions);

paymentCircuitBreaker.fallback(() => {
  return { transactionId: 'FALLBACK-TXN', status: 'FAILED_BUT_HANDLED_BY_CIRCUIT_BREAKER' };
});

paymentCircuitBreaker.on('open', () => console.warn(`[CIRCUIT BREAKER] 🚨 OPEN! Payment gateway is down. Preventing cascading failures.`));
paymentCircuitBreaker.on('halfOpen', () => console.info(`[CIRCUIT BREAKER] ⏳ HALF-OPEN. Testing if payment gateway is back online...`));
paymentCircuitBreaker.on('close', () => console.info(`[CIRCUIT BREAKER] ✅ CLOSED. Payment gateway recovered.`));

// Get booked seats for a flight
router.get('/flight/:flightId/seats', async (req, res) => {
  try {
    const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'flightId = :f AND #s <> :cancelled AND #s <> :failed',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { 
        ':f': req.params.flightId,
        ':cancelled': 'CANCELLED',
        ':failed': 'FAILED'
      }
    });
    const response = await docClient.send(command);
    const bookedSeats = response.Items.map(item => item.seatId);
    res.status(200).json(bookedSeats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve booked seats' });
  }
});

router.post('/', async (req, res) => {
  const { userId, flightId, price, seatId, simulatePaymentFailure = false } = req.body;
  const bookingId = uuidv4().substring(0,8).toUpperCase();
  
  // SAGA PATTERN IMPLEMENTATION
  // A Saga handles distributed transactions by managing steps and rollbacks
  let sagaState = 'STARTED';

  try {
    // PRE-CHECK: Is the seat already booked?
    const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const seatCheck = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'flightId = :f AND seatId = :seat AND #s <> :cancelled AND #s <> :failed',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { 
        ':f': flightId,
        ':seat': seatId,
        ':cancelled': 'CANCELLED',
        ':failed': 'FAILED'
      }
    }));
    
    if (seatCheck.Items && seatCheck.Items.length > 0) {
      return res.status(409).json({ error: 'Seat is already booked by another passenger.' });
    }

    // Step 1: Create Booking (PENDING)
    console.log(`[SAGA] Step 1: Creating pending booking ${bookingId}`);
    const bookingData = {
      bookingId, userId, flightId, price, seatId, status: 'PENDING', createdAt: new Date().toISOString()
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: bookingData }));
    sagaState = 'BOOKING_CREATED';

    // Step 2: Process Payment (Simulation via Circuit Breaker)
    console.log(`[SAGA] Step 2: Processing payment for ${bookingId} via Circuit Breaker`);
    const paymentResult = await paymentCircuitBreaker.fire(price, simulatePaymentFailure);
    
    if (paymentResult.status === 'FAILED_BUT_HANDLED_BY_CIRCUIT_BREAKER') {
      throw new Error('Circuit breaker is OPEN or payment timed out. Payment rejected safely.');
    }
    
    sagaState = 'PAYMENT_PROCESSED';

    // Step 3: Confirm Booking
    console.log(`[SAGA] Step 3: Confirming booking ${bookingId}`);
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { bookingId },
      UpdateExpression: 'SET #s = :s, transactionId = :t',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': 'CONFIRMED', ':t': paymentResult.transactionId }
    }));
    
    // Step 4: Publish Success Event to sync with other microservices (Event-Driven)
    await publishEvent('booking.confirmed', { bookingId, flightId, userId });

    res.status(201).json({ message: 'Booking confirmed', bookingId, transactionId: paymentResult.transactionId });

  } catch (error) {
    console.error(`[SAGA] Transaction failed at state ${sagaState}. Rolling back... Error: ${error.message}`);
    
    // ROLLBACK PROCEDURES (Compensation logic)
    if (sagaState === 'BOOKING_CREATED') {
      console.log(`[SAGA ROLLBACK] Cancelling pending booking ${bookingId}`);
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { bookingId },
        UpdateExpression: 'SET #s = :s',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':s': 'FAILED' }
      }));
    }

    // Publish Failure Event so downstream services know
    await publishEvent('booking.failed', { bookingId, flightId, userId, reason: error.message });

    res.status(500).json({ error: 'Booking failed during transaction', reason: error.message });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { bookingId: req.params.id }
    }));
    if (!response.Item) return res.status(404).json({ error: 'Booking not found' });
    res.status(200).json(response.Item);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve booking' });
  }
});

// Get bookings by User ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
    const response = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'UserBookingsIndex',
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: { ':u': req.params.userId }
    }));
    res.status(200).json(response.Items || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve user bookings' });
  }
});

// Cancel Booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const response = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { bookingId },
      UpdateExpression: 'SET #s = :s',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': 'CANCELLED' },
      ReturnValues: 'ALL_NEW'
    }));
    
    // Publish Event so Flight Service can release the seat
    await publishEvent('booking.cancelled', { bookingId, flightId: response.Attributes.flightId, userId: response.Attributes.userId });
    
    res.status(200).json(response.Attributes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not cancel booking' });
  }
});
// Check-In (with passport details, 24hr before departure only)
router.patch('/:id/checkin', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { passportNumber, nationality, dateOfBirth } = req.body;

    if (!passportNumber || !nationality || !dateOfBirth) {
      return res.status(400).json({ error: 'Passport number, nationality, and date of birth are required.' });
    }

    // Get the booking first
    const booking = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { bookingId } }));
    if (!booking.Item) return res.status(404).json({ error: 'Booking not found' });
    if (booking.Item.status === 'CHECKED_IN') return res.status(400).json({ error: 'Already checked in.' });
    if (booking.Item.status === 'CANCELLED') return res.status(400).json({ error: 'Cannot check in a cancelled booking.' });

    // 24-hour check: fetch flight departure time
    try {
      const flightRes = await require('axios').get(`http://flight-service:3000/flights/${booking.Item.flightId}`);
      const departureTime = new Date(flightRes.data.departureTime);
      const now = new Date();
      const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilDeparture > 24) {
        return res.status(400).json({ error: `Check-in opens 24 hours before departure. Your flight departs in ${Math.round(hoursUntilDeparture)} hours.` });
      }
      if (hoursUntilDeparture < 0) {
        return res.status(400).json({ error: 'This flight has already departed.' });
      }
    } catch (e) {
      // If flight service is unreachable, allow check-in anyway (for demo purposes)
      console.warn('Could not validate departure time, allowing check-in:', e.message);
    }

    const response = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { bookingId },
      UpdateExpression: 'SET #s = :s, passportNumber = :pp, nationality = :nat, dateOfBirth = :dob, checkedInAt = :t',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { 
        ':s': 'CHECKED_IN',
        ':pp': passportNumber,
        ':nat': nationality,
        ':dob': dateOfBirth,
        ':t': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }));

    await publishEvent('booking.checked_in', { bookingId, flightId: booking.Item.flightId, userId: booking.Item.userId });

    res.status(200).json(response.Attributes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Check-in failed' });
  }
});

module.exports = router;
