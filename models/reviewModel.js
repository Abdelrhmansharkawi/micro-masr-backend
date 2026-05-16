const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Driver',
			required: true,
		},

		trip: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Trip',
		},

		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true,
		},
		
		tags: {
			type: [String],
			default: [],
		},

		comment: String,
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Review', reviewSchema);
