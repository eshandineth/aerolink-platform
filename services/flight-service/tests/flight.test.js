const request = require('supertest');
const express = require('express');
const flightRoutes = require('../src/routes/flight');

const app = express();
app.use(express.json());
app.use('/flights', flightRoutes);

// Mock the DynamoDB DocumentClient
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const mDynamoDBDocumentClient = {
    send: jest.fn().mockImplementation((command) => {
      if (command.constructor.name === 'ScanCommand') {
        return Promise.resolve({
          Items: [
            { flightId: 'AL-123', origin: 'JFK', destination: 'LHR', price: 450 }
          ]
        });
      }
      return Promise.resolve({});
    }),
  };
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => mDynamoDBDocumentClient)
    },
    ScanCommand: class ScanCommand {},
    PutCommand: class PutCommand {},
    GetCommand: class GetCommand {},
    UpdateCommand: class UpdateCommand {},
    DeleteCommand: class DeleteCommand {}
  };
});

describe('Flight API Endpoints', () => {
  it('GET /flights should return a list of flights', async () => {
    const res = await request(app).get('/flights');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('flightId');
    expect(res.body[0].origin).toEqual('JFK');
  });

  it('POST /flights should create a new flight', async () => {
    const res = await request(app)
      .post('/flights')
      .send({
        flightNumber: 'AL-999',
        origin: 'DXB',
        destination: 'LAX',
        departureTime: '2026-12-01T10:00:00.000Z',
        arrivalTime: '2026-12-01T22:00:00.000Z',
        price: 800,
        totalSeats: 200
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('flightId');
  });
});
