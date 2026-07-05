// controllers/trackingController.js
const Trip = require('../models/tripModel');
const Booking = require('../models/bookingModel');

// Distance in meters between two [lng, lat] points (haversine)
const _distanceMeters = (coordsA, coordsB) => {
	if (!coordsA || !coordsB) return Infinity;
	const [lng1, lat1] = coordsA;
	const [lng2, lat2] = coordsB;
	const R = 6371000; // Earth radius in meters
	const toRad = (deg) => (deg * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const ARRIVED_THRESHOLD_METERS = 200;

exports.getTrackingInfo = async (req, res) => {
	try {
		const tripId = req.params.id;
		const userId = req.user._id;

		const trip = await Trip.findById(tripId)
			.populate({
				path: 'driver',
				populate: { path: 'user', select: 'fullName phone rating' },
			})
			.populate('vehicle', 'plateNumber model color');

		if (!trip) {
			return res
				.status(404)
				.json({ status: 'fail', message: 'الرحلة غير موجودة' });
		}

		const booking = await Booking.findOne({
			trip: tripId,
			user: userId,
			status: 'confirmed',
		});

		if (!booking) {
			return res
				.status(403)
				.json({ status: 'fail', message: 'ليس لديك حجز مؤكد في هذه الرحلة' });
		}

		let currentStep = 'onWay'; //  onWay, arrived, inTrip, reached
		let remainingMinutes = 6;

		if (trip.status === 'ongoing') {
			const driverCoords =
				trip.currentLocation?.coordinates ||
				trip.startLocation?.location?.coordinates;
			const pickupCoords =
				booking.pickupPoint?.coordinates ||
				booking.pickupPoint?.location?.coordinates;

			const distanceToPickup = _distanceMeters(driverCoords, pickupCoords);

			if (distanceToPickup <= ARRIVED_THRESHOLD_METERS) {
				currentStep = 'arrived';
			} else {
				currentStep = 'inTrip';
			}
		} else if (trip.status === 'completed') {
			currentStep = 'reached';
		}

		res.status(200).json({
			status: 'success',
			data: {
				tripId: trip._id,
				driver: {
					fullName: trip.driver.user.fullName,
					phone: trip.driver.user.phone,
					rating: trip.driver.user.rating,
					vehicle: {
						plateNumber: trip.vehicle.plateNumber,
						model: trip.vehicle.model,
						color: trip.vehicle.color,
					},
				},
				booking: {
					totalPrice: booking.totalPrice,
					currency: 'EGP',
				},
				currentStep,
				remainingMinutes,
				driverLocation: trip.currentLocation || trip.startLocation.location,
				pickupPoint: booking.pickupPoint,
				dropoffPoint: booking.dropoffPoint,
			},
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
