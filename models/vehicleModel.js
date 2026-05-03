const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
	{
		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Driver',
			required: true,
		},

		plateNumber: {
			type: String,
			required: true,
			unique: true,
		},

		model: {
			type: String,
			required: true,
		},

		color: String,

		seatsCount: {
			type: Number,
			required: true,
			min: 1,
		},


		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
