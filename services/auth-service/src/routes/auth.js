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

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 default: passenger
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: User already exists
 */
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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', async (req, res) => {
  try {
    const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await docClient.send(command);
    
    // Strip passwords before returning
    const users = response.Items.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve users' });
  }
});

module.exports = router;
