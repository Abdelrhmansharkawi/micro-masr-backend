const Booking = require('../models/bookingModel');
const Trip = require('../models/tripModel');

exports.createBooking = async (req, res) => {
	try {
		const { tripId, seats, pickupPoint, dropoffPoint } = req.body;

		if (!seats || !Array.isArray(seats) || seats.length === 0) {
			return res.status(400).json({
				status: 'fail',
				message: 'Please provide seat numbers',
			});
		}

		const uniqueSeats = [...new Set(seats)];
		if (uniqueSeats.length !== seats.length) {
			return res.status(400).json({
				status: 'fail',
				message: 'Duplicate seat numbers are not allowed',
			});
		}

		const trip = await Trip.findById(tripId).populate('vehicle');
		if (!trip) {
			return res
				.status(404)
				.json({ status: 'fail', message: 'Trip not found' });
		}

		if (seats.some((seat) => seat < 0 || seat >= trip.totalSeats)) {
			return res.status(400).json({
				status: 'fail',
				message: 'Invalid seat numbers',
			});
		}

		const existingBookings = await Booking.find({
			trip: tripId,
			status: 'confirmed',
		}).select('seats');

		const allBookedSeats = existingBookings.reduce(
			(acc, b) => acc.concat(b.seats),
			[],
		);

		const conflict = seats.some((seat) => allBookedSeats.includes(seat));
		if (conflict) {
			return res.status(400).json({
				status: 'fail',
				message: 'One or more seats are already booked',
			});
		}

		const totalPrice = seats.length * trip.price;

		const booking = await Booking.create({
			user: req.user.id,
			trip: tripId,
			seats,
			seatsBooked: seats.length,
			totalPrice,
			pickupPoint,
			dropoffPoint,
			paymentStatus: 'pending',
		});

		const updatedBookedCount = allBookedSeats.length + seats.length;
		trip.availableSeats = trip.totalSeats - updatedBookedCount;
		await trip.save();

		res.status(201).json({
			status: 'success',
			data: booking,
		});
	} catch (err) {
		res.status(400).json({ status: 'fail', message: err.message });
	}
};
