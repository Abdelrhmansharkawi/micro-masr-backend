const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const jwt = require('jsonwebtoken');
const Notification = require('../models/notificationModel');

const signToken = (id, role) => {
	return jwt.sign({ id, role }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

// Register
exports.register = async (req, res) => {
	try {
		const { fullName, email, password, phone, role } = req.body;

		const user = await User.create({
			fullName,
			email,
			password,
			phone,
			role: 'user',
		});

		console.log(req.body);

		const token = signToken(user._id, user.role);
		user.password = undefined;

		res.status(201).json({
			status: 'success',
			token,
			data: {
				user,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err.message,
		});
	}
};

//Login
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// 1) Check if email & password exist
		if (!email || !password) {
			return res.status(400).json({
				status: 'fail',
				message: 'Please provide email and password',
			});
		}

		// 2) Get user + password
		const user = await User.findOne({ email }).select('+password');

		// 3) Check if user exists & password correct
		if (!user || !(await user.correctPassword(password, user.password))) {
			return res.status(401).json({
				status: 'fail',
				message: 'Incorrect email or password',
			});
		}

		// 4) Send token
		const token = signToken(user._id, user.role);

		res.status(200).json({
			status: 'success',
			token,
		});
	} catch (err) {
		res.status(500).json({
			status: 'error',
			message: err.message,
		});
	}
};

// GET current user + unread notification count
exports.getMe = async (req, res) => {
	try {
		const user = req.user;

		const unreadCount = await Notification.countDocuments({
			user: user._id,
			isRead: false,
		});

		const tripsCount = await Booking.countDocuments({
			user: user._id,
			status: 'completed',
		});

		// Extract first name (handles Arabic names)
		const firstName = user.fullName.split(' ')[0];

		res.status(200).json({
			status: 'success',
			data: {
				user: {
					id: user._id,
					fullName: user.fullName,
					firstName,
					email: user.email,
					phone: user.phone,
					role: user.role,
					profileImage: user.profileImage,
					rating: user.rating,
					balance: user.balance,
					isVerified: user.isVerified,
				},
				unreadNotificationCount: unreadCount,
				tripsCount: tripsCount,
			},
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};

exports.updateMe = async (req, res) => {
	try {
		const { fullName, phone, email, profileImage } = req.body;
		const updates = {};
		if (fullName !== undefined) updates.fullName = fullName;
		if (phone !== undefined) updates.phone = phone;
		if (email !== undefined) updates.email = email;
		if (profileImage !== undefined) updates.profileImage = profileImage;

		const user = await User.findByIdAndUpdate(req.user._id, updates, {
			returnDocument: 'after',
			runValidators: true,
		}).select('-password');

		res.status(200).json({
			status: 'success',
			data: { user },
		});
	} catch (err) {
		res.status(400).json({ status: 'fail', message: err.message });
	}
};

exports.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				status: 'fail',
				message: 'Please provide current password and new password',
			});
		}

		const user = await User.findById(req.user._id).select('+password');
		if (!(await user.correctPassword(currentPassword, user.password))) {
			return res.status(401).json({
				status: 'fail',
				message: 'Current password is incorrect',
			});
		}

		user.password = newPassword;
		await user.save();

		res.status(200).json({
			status: 'success',
			message: 'Password updated successfully',
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
