const Trip = require('../models/tripModel');
const Vehicle = require('../models/vehicleModel');
const Driver = require('../models/driverModel');
const Booking = require('../models/bookingModel');

// Helper to extract lat/lng from a GeoJSON location object
const _extractLatLng = (location) => {
	if (!location || !location.location || !location.location.coordinates) {
		return { lat: null, lng: null };
	}
	const [lng, lat] = location.location.coordinates;
	return { lat, lng };
};

exports.getAvailableTrips = async (req, res) => {
	try {
		const { from, to, date } = req.query;

		const query = { status: 'scheduled' };

		if (date) {
			const parsedDate = new Date(date);
			if (isNaN(parsedDate.getTime())) {
				return res.status(400).json({
					status: 'fail',
					message: 'Invalid date format',
				});
			}
			query.departureTime = { $gte: parsedDate };
		}

		if (from && from.trim() !== '') {
			query['startLocation.name'] = { $regex: from.trim(), $options: 'i' };
		}

		if (to && to.trim() !== '') {
			query['endLocation.name'] = { $regex: to.trim(), $options: 'i' };
		}

		const trips = await Trip.find(query)
			.populate('vehicle')
			.populate({
				path: 'driver',
				populate: { path: 'user', select: 'fullName rating' },
			})
			.sort('departureTime');

		// Transform each trip to include startLat, startLng, endLat, endLng
		const formattedTrips = trips.map((trip) => {
			const start = _extractLatLng(trip.startLocation);
			const end = _extractLatLng(trip.endLocation);
			return {
				...trip.toObject(),
				startLat: start.lat,
				startLng: start.lng,
				endLat: end.lat,
				endLng: end.lng,
			};
		});

		res.status(200).json({
			status: 'success',
			results: formattedTrips.length,
			data: formattedTrips,
		});
	} catch (err) {
		res.status(500).json({
			status: 'error',
			message: err.message,
		});
	}
};

// Get nearby trips
exports.getNearbyTrips = async (req, res) => {
	try {
		const { lat, lng, distance = 5 } = req.query;

		if (!lat || !lng) {
			return res.status(400).json({
				status: 'fail',
				message: 'Please provide lat and lng',
			});
		}

		const latNum = parseFloat(lat);
		const lngNum = parseFloat(lng);
		const distanceNum = parseFloat(distance);

		if (isNaN(latNum) || isNaN(lngNum) || isNaN(distanceNum)) {
			return res.status(400).json({
				status: 'fail',
				message: 'lat, lng, and distance must be valid numbers',
			});
		}

		const radius = distanceNum / 6378.1; // Earth radius in KM

		const trips = await Trip.find({
			'startLocation.location': {
				$geoWithin: {
					$centerSphere: [[lngNum, latNum], radius],
				},
			},
			status: 'scheduled',
		})
			.populate('vehicle')
			.populate({
				path: 'driver',
				populate: {
					path: 'user',
					select: 'fullName rating',
				},
			});

		// Transform each trip
		const formattedTrips = trips.map((trip) => {
			const start = _extractLatLng(trip.startLocation);
			const end = _extractLatLng(trip.endLocation);
			return {
				...trip.toObject(),
				startLat: start.lat,
				startLng: start.lng,
				endLat: end.lat,
				endLng: end.lng,
			};
		});

		res.status(200).json({
			status: 'success',
			results: formattedTrips.length,
			data: formattedTrips,
		});
	} catch (err) {
		res.status(500).json({
			status: 'error',
			message: err.message,
		});
	}
};

exports.getTripById = async (req, res) => {
	try {
		const trip = await Trip.findById(req.params.id)
			.populate({
				path: 'driver',
				populate: { path: 'user', select: 'fullName rating' },
			})
			.populate('vehicle');

		if (!trip) {
			return res.status(404).json({
				status: 'fail',
				message: 'Trip not found',
			});
		}

		const start = _extractLatLng(trip.startLocation);
		const end = _extractLatLng(trip.endLocation);
		const tripObj = {
			...trip.toObject(),
			startLat: start.lat,
			startLng: start.lng,
			endLat: end.lat,
			endLng: end.lng,
		};

		res.status(200).json({
			status: 'success',
			data: tripObj,
		});
	} catch (err) {
		res.status(500).json({
			status: 'error',
			message: err.message,
		});
	}
};

exports.getTripSeats = async (req, res) => {
	try {
		const trip = await Trip.findById(req.params.id);
		if (!trip) {
			return res
				.status(404)
				.json({ status: 'fail', message: 'Trip not found' });
		}

		const bookings = await Booking.find({
			trip: trip._id,
			status: 'confirmed',
		}).select('seats');

		const bookedSeats = bookings.reduce((all, booking) => {
			return all.concat(booking.seats);
		}, []);

		res.status(200).json({
			status: 'success',
			data: {
				totalSeats: trip.totalSeats,
				bookedSeats,
			},
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};

exports.completeTrip = async (req, res) => {
	try {
		const tripId = req.params.id;
		const trip = await Trip.findById(tripId).populate('driver');

		if (!trip) {
			return res
				.status(404)
				.json({ status: 'fail', message: 'Trip not found' });
		}

		// Only the driver who owns the trip can complete it
		if (trip.driver.user.toString() !== req.user._id.toString()) {
			return res
				.status(403)
				.json({ status: 'fail', message: 'Not authorized' });
		}

		if (trip.status !== 'ongoing') {
			return res
				.status(400)
				.json({ status: 'fail', message: 'Trip is not ongoing' });
		}

		trip.status = 'completed';
		await trip.save();

		// Increment driver's totalTrips
		const Driver = require('../models/driverModel');
		await Driver.findByIdAndUpdate(trip.driver._id, {
			$inc: { totalTrips: 1 },
		});

		res.status(200).json({
			status: 'success',
			data: { tripId: trip._id, status: 'completed' },
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
