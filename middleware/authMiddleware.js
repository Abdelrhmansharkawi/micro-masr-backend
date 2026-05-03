const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Driver = require('../models/driverModel');

exports.protect = async (req, res, next) => {
	try {
		let token;
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			token = req.headers.authorization.split(' ')[1];
		}

		if (!token) {
			return res.status(401).json({
				status: 'fail',
				message: 'You are not logged in',
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return res.status(401).json({
				status: 'fail',
				message: 'User no longer exists',
			});
		}

		req.user = currentUser;
		next();
	} catch (err) {
		return res.status(401).json({
			status: 'fail',
			message: 'Invalid or expired token',
		});
	}
};

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				status: 'fail',
				message: 'You are not logged in',
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				status: 'fail',
				message: 'You do not have permission to perform this action',
			});
		}

		next();
	};
};
