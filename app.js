const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes.js');
const tripRoutes = require('./routes/tripRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes');
const savedPlaceRoutes = require('./routes/savedPlaceRoutes.js');
const popularDestinationRoutes = require('./routes/popularDestinationRoutes.js');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(express.json());

app.use(
	cors({
		origin: '*',
	}),
);

app.get('/', (req, res) => {
	res.status(200).json({
		status: 'success',
		message: 'API is running',
	});
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/places', savedPlaceRoutes);
app.use('/api/v1/destinations', popularDestinationRoutes);
app.use('/api/v1/bookings', bookingRoutes);

module.exports = app;
