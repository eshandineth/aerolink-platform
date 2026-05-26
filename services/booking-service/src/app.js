const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/booking');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'booking-service' });
});

app.use('/api/v1/bookings', bookingRoutes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
}

module.exports = app;
