const request = require('supertest');

// Mock AWS X-Ray before requiring app
jest.mock('aws-xray-sdk', () => ({
  express: {
    openSegment: () => (req, res, next) => next(),
    closeSegment: () => (req, res, next) => next()
  },
  captureAWS: (client) => client,
  captureAsyncFunc: (name, fn) => fn,
}));

// Mock EventBridge
jest.mock('../src/services/eventBridge', () => ({
  publishEvent: jest.fn().mockResolvedValue({ FailedEntryCount: 0 })
}));

// Mock DynamoDB
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const mockSend = jest.fn();
  return {
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({ send: mockSend })
    },
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
    UpdateCommand: jest.fn(),
    __mockSend: mockSend
  };
});

const app = require('../src/app');
const { __mockSend } = require('@aws-sdk/lib-dynamodb');
const { publishEvent } = require('../src/services/eventBridge');

describe('Booking Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Health Check
  describe('GET /health', () => {
    it('should return 200 with UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('booking-service');
    });
  });

  // Test 2: Saga Pattern - Successful Booking
  describe('POST /api/v1/bookings - Saga Pattern Success', () => {
    it('should confirm booking when payment succeeds (Saga Steps 1-3)', async () => {
      // Mock DynamoDB: PutCommand (Step 1) and UpdateCommand (Step 3) succeed
      __mockSend.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/bookings')
        .send({
          userId: 'user-test',
          flightId: 'AL-7023',
          price: 450,
          simulatePaymentFailure: false
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Booking confirmed');
      expect(res.body).toHaveProperty('bookingId');
      expect(res.body).toHaveProperty('transactionId');

      // Verify EventBridge event was published
      expect(publishEvent).toHaveBeenCalledWith(
        'booking.confirmed',
        expect.objectContaining({
          flightId: 'AL-7023',
          userId: 'user-test'
        })
      );
    });
  });

  // Test 3: Saga Pattern - Payment Failure with Rollback
  describe('POST /api/v1/bookings - Saga Pattern Rollback', () => {
    it('should rollback booking when payment fails (Compensating Transaction)', async () => {
      // Mock DynamoDB: PutCommand succeeds, then UpdateCommand for rollback succeeds
      __mockSend.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/bookings')
        .send({
          userId: 'user-test',
          flightId: 'AL-7023',
          price: 450,
          simulatePaymentFailure: true  // <-- Trigger failure
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Booking failed during transaction');
      expect(res.body.reason).toContain('Payment gateway declined');

      // Verify failure event was published
      expect(publishEvent).toHaveBeenCalledWith(
        'booking.failed',
        expect.objectContaining({
          flightId: 'AL-7023',
          reason: expect.stringContaining('declined')
        })
      );
    });
  });

  // Test 4: Saga Pattern - Database Failure
  describe('POST /api/v1/bookings - Database Failure', () => {
    it('should handle DynamoDB errors gracefully', async () => {
      __mockSend.mockRejectedValue(new Error('DynamoDB connection failed'));

      const res = await request(app)
        .post('/api/v1/bookings')
        .send({
          userId: 'user-test',
          flightId: 'AL-7023',
          price: 450,
          simulatePaymentFailure: false
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Booking failed during transaction');
    });
  });

  // Test 5: Get Booking by ID
  describe('GET /api/v1/bookings/:id', () => {
    it('should return 404 if booking not found', async () => {
      __mockSend.mockResolvedValue({ Item: null });

      const res = await request(app).get('/api/v1/bookings/nonexistent-id');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Booking not found');
    });

    it('should return booking if found', async () => {
      const mockBooking = {
        bookingId: 'test-123',
        userId: 'user-test',
        flightId: 'AL-7023',
        status: 'CONFIRMED'
      };
      __mockSend.mockResolvedValue({ Item: mockBooking });

      const res = await request(app).get('/api/v1/bookings/test-123');
      expect(res.statusCode).toBe(200);
      expect(res.body.bookingId).toBe('test-123');
      expect(res.body.status).toBe('CONFIRMED');
    });
  });
});
