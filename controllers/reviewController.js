const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const Trip = require('../models/tripModel');
const Driver = require('../models/driverModel');
const User = require('../models/userModel');

exports.createReview = async (req, res) => {
	try {
		const { tripId, rating, comment, tags, tipAmount } = req.body;
		const userId = req.user._id;

		// 1. Verify booking exists for this user & trip, and trip is completed
		const booking = await Booking.findOne({
			user: userId,
			trip: tripId,
			status: 'confirmed',
		});
		if (!booking) {
			return res
				.status(403)
				.json({ status: 'fail', message: 'You did not book this trip' });
		}

		const trip = await Trip.findById(tripId);
		//if (!trip || trip.status !== 'completed') {
		//	return res
		//		.status(400)
		//		.json({ status: 'fail', message: 'Trip is not completed yet' });
		//}

		// 2. Check if review already exists
		/*const existing = await Review.findOne({ user: userId, trip: tripId });
		if (existing) {
			return res
				.status(400)
				.json({ status: 'fail', message: 'You already reviewed this trip' });
		}*/

		// 3. Create review
		const review = await Review.create({
			user: userId,
			driver: trip.driver,
			trip: tripId,
			rating,
			comment,
			tags: tags || [], // store as array of strings
		});

		// 4. Update driver's average rating
		const allDriverReviews = await Review.find({ driver: trip.driver });
		const avgRating =
			allDriverReviews.reduce((sum, r) => sum + r.rating, 0) /
			allDriverReviews.length;
		await Driver.findByIdAndUpdate(trip.driver, { rating: avgRating });

		// 5. Handle tip (add to driver's balance)
		if (tipAmount && tipAmount > 0) {
			const driverUser = await User.findById(trip.driver.user);
			if (driverUser) {
				driverUser.balance += tipAmount;
				await driverUser.save();
			}
			// Optionally create a separate transaction record
		}

		res.status(201).json({ status: 'success', data: review });
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
		console.error('❌ Review creation error:', err);
	}
};
