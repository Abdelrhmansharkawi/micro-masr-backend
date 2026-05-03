const User = require('../models/userModel');
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
		const user = req.user; // already set by 'protect' middleware

		const unreadCount = await Notification.countDocuments({
			user: user._id,
			isRead: false,
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
					isVerified: user.isVerified,
				},
				unreadNotificationCount: unreadCount,
			},
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
