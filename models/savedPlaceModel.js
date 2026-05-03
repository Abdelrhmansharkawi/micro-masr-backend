const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
	type: { type: String, enum: ['Point'], default: 'Point' },
	coordinates: { type: [Number], required: true }, // [lng, lat]
});

const savedPlaceSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: [true, 'Place name is required'],
			trim: true,
		},
		address: String,
		location: pointSchema,
		type: {
			type: String,
			enum: ['home', 'work', 'other'],
			default: 'other',
		},
	},
	{ timestamps: true },
);

savedPlaceSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SavedPlace', savedPlaceSchema);
