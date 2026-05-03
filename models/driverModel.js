const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},

		nationalId: {
			type: String,
			required: true,
		},

		licenseNumber: {
			type: String,
			required: true,
		},

		licenseExpiry: {
			type: Date,
			required: true,
		},

		isApproved: {
			type: Boolean,
			default: false,
		},

		rating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},

		totalTrips: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Driver', driverSchema);
