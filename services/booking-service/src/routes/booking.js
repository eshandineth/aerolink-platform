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

// For the Saga pattern, we pretend to hit a payment gateway
const simulatePayment = async (amount, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('Payment gateway declined the card.'));
      else resolve({ transactionId: uuidv4(), status: 'SUCCESS' });
    }, 1000); // 1 second delay to simulate network latency
  });
};

router.post('/', async (req, res) => {
  const { userId, flightId, price, simulatePaymentFailure = false } = req.body;
  const bookingId = uuidv4();
  
  // SAGA PATTERN IMPLEMENTATION
  // A Saga handles distributed transactions by managing steps and rollbacks
  let sagaState = 'STARTED';

  try {
    // Step 1: Create Booking (PENDING)
    console.log(`[SAGA] Step 1: Creating pending booking ${bookingId}`);
    const bookingData = {
      bookingId, userId, flightId, price, status: 'PENDING', createdAt: new Date().toISOString()
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: bookingData }));
    sagaState = 'BOOKING_CREATED';

    // Step 2: Process Payment (Simulation)
    console.log(`[SAGA] Step 2: Processing payment for ${bookingId}`);
    const paymentResult = await simulatePayment(price, simulatePaymentFailure);
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

module.exports = router;
