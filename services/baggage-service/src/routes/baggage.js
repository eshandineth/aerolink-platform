const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { publishEvent } = require('../services/eventBridge');

const router = express.Router();
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: process.env.AWS_REGION || 'us-east-1'
}));

const TABLE_NAME = 'aerolink-baggage';

// Check-in new baggage
router.post('/checkin', async (req, res) => {
  try {
    const { bookingId, flightId, passengerId, weight } = req.body;
    const baggageId = uuidv4().substring(0,8).toUpperCase();
    
    const baggageData = {
      baggageId, bookingId, flightId, passengerId, weight,
      status: 'CHECKED_IN', timestamp: new Date().toISOString()
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: baggageData }));
    await publishEvent('baggage.checked_in', baggageData);

    res.status(201).json(baggageData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check-in baggage' });
  }
});

// Update baggage status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const baggageId = req.params.id;

    // Verify baggage exists first to prevent creating ghost items
    const getRes = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { baggageId } }));
    if (!getRes.Item) {
      return res.status(404).json({ error: 'Baggage not found! Are you sure you did not accidentally paste your PNR instead of your Baggage ID?' });
    }

    const response = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { baggageId },
      UpdateExpression: 'SET #s = :s, #t = :t',
      ExpressionAttributeNames: { '#s': 'status', '#t': 'timestamp' },
      ExpressionAttributeValues: { ':s': status, ':t': new Date().toISOString() },
      ReturnValues: 'ALL_NEW'
    }));

    await publishEvent('baggage.status_updated', response.Attributes);
    res.status(200).json(response.Attributes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update baggage status' });
  }
});

// Get baggage by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { baggageId: req.params.id }
    }));
    if (!response.Item) return res.status(404).json({ error: 'Baggage not found' });
    res.status(200).json(response.Item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve baggage' });
  }
});

// Get baggage by Booking ID
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
    const response = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'BookingBaggageIndex',
      KeyConditionExpression: 'bookingId = :b',
      ExpressionAttributeValues: { ':b': req.params.bookingId }
    }));
    if (!response.Items || response.Items.length === 0) {
      return res.status(404).json({ error: 'No baggage found for this booking' });
    }
    // Return the latest baggage record if multiple
    res.status(200).json(response.Items[response.Items.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve baggage by booking ID' });
  }
});

// Get all baggage (Admin)
router.get('/', async (req, res) => {
  try {
    const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const response = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    res.status(200).json(response.Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve all baggage' });
  }
});

module.exports = router;
