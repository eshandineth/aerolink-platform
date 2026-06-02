const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { publishEvent } = require('../services/eventBridge');

const router = express.Router();

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: process.env.AWS_REGION || 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'aerolink-flights';

// Get all flights
router.get('/', async (req, res) => {
  try {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await docClient.send(command);
    res.status(200).json(response.Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve flights' });
  }
});

// Get flight by ID
router.get('/:id', async (req, res) => {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { flightId: req.params.id }
    });
    const response = await docClient.send(command);
    
    if (!response.Item) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.status(200).json(response.Item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve flight' });
  }
});

// Create a new flight (Publishes event to EventBridge)
router.post('/', async (req, res) => {
  try {
    const { flightNumber, origin, destination, departureTime, arrivalTime, price, totalSeats } = req.body;
    const flightId = uuidv4();
    
    const flightData = {
      flightId,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      price,
      totalSeats,
      availableSeats: totalSeats,
      status: 'SCHEDULED'
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: flightData
    });
    await docClient.send(command);

    // Publish Event
    await publishEvent('flight.created', flightData);

    res.status(201).json(flightData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create flight' });
  }
});

// Update a flight
router.put('/:id', async (req, res) => {
  try {
    const { origin, destination, price, departureTime } = req.body;
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        flightId: req.params.id,
        origin,
        destination,
        price,
        departureTime,
        // In a real app we'd fetch the existing and merge, but for this demo we'll just require full data or keep it simple
        // Let's use UpdateCommand instead to just update specific fields
      }
    });
    // Wait, UpdateCommand is better.
    const updateCommand = new (require('@aws-sdk/lib-dynamodb').UpdateCommand)({
      TableName: TABLE_NAME,
      Key: { flightId: req.params.id },
      UpdateExpression: 'SET origin = :o, destination = :d, price = :p, departureTime = :t',
      ExpressionAttributeValues: {
        ':o': origin,
        ':d': destination,
        ':p': price,
        ':t': departureTime
      },
      ReturnValues: 'ALL_NEW'
    });
    
    const response = await docClient.send(updateCommand);
    res.status(200).json(response.Attributes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update flight' });
  }
});

// Delete a flight
router.delete('/:id', async (req, res) => {
  try {
    const command = new (require('@aws-sdk/lib-dynamodb').DeleteCommand)({
      TableName: TABLE_NAME,
      Key: { flightId: req.params.id }
    });
    await docClient.send(command);
    res.status(200).json({ message: 'Flight deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not delete flight' });
  }
});

module.exports = router;
