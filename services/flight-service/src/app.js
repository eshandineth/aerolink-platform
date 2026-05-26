const express = require('express');
const cors = require('cors');
const flightRoutes = require('./routes/flight');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'flight-service' });
});

// Routes
app.use('/api/v1/flights', flightRoutes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Flight Service running on port ${PORT}`));
}

module.exports = app;
