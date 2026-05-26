const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const router = express.Router();

// DynamoDB Setup
const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: process.env.AWS_REGION || 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'aerolink-users';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'passenger', name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        userId: email, // Using email as PK for easy lookup
        password: hashedPassword,
        role,
        name
      },
      ConditionExpression: 'attribute_not_exists(userId)'
    });

    await docClient.send(command);
    res.status(201).json({ message: 'User registered successfully', userId: email });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId: email } 
    });

    const response = await docClient.send(command);
    const user = response.Item;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
