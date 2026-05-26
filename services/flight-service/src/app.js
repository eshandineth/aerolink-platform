const express = require('express');
const cors = require('cors');
const AWSXRay = require('aws-xray-sdk');
const flightRoutes = require('./routes/flight');

const app = express();

// AWS X-Ray Instrumentation for Distributed Tracing
app.use(AWSXRay.express.openSegment('FlightService'));

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'flight-service' });
});

// Routes
app.use('/api/v1/flights', flightRoutes);

// AWS X-Ray Error Handler
app.use(AWSXRay.express.closeSegment());

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  // Structured JSON Logging for CloudWatch
  app.listen(PORT, () => console.log(JSON.stringify({
    level: 'INFO',
    message: `Flight Service running on port ${PORT}`,
    timestamp: new Date().toISOString()
  })));
}

module.exports = app;
