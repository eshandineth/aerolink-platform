const express = require('express');
const cors = require('cors');
const baggageRoutes = require('./routes/baggage');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'baggage-service' });
});

app.use('/api/v1/baggage', baggageRoutes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Baggage Service running on port ${PORT}`));
}

module.exports = app;
