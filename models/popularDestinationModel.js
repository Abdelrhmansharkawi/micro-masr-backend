
const mongoose = require('mongoose');
const pointSchema = new mongoose.Schema({
	type: { type: String, enum: ['Point'], default: 'Point' },
	coordinates: { type: [Number], required: true },
});

const popularDestinationSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		address: String,
		location: pointSchema,
		icon: String, 
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

module.exports = mongoose.model('PopularDestination', popularDestinationSchema);
