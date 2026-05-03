const mongoose = require('mongoose');
const Vehicle = require('./vehicleModel');

const pointSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ['Point'],
		default: 'Point',
	},
	coordinates: {
		type: [Number], // [lng, lat]
		required: true,
	},
});

const stopSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	location: {
		type: pointSchema,
		required: true,
	},
	order: Number,
});

const tripSchema = new mongoose.Schema(
	{
		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Driver',
			required: true,
		},

		vehicle: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Vehicle',
			required: true,
		},

		title: {
			type: String,
			required: true,
		},

		startLocation: {
			name: String,
			location: pointSchema,
		},

		endLocation: {
			name: String,
			location: pointSchema,
		},

		stops: [stopSchema],

		currentLocation: {
			type: pointSchema,
		},

		departureTime: {
			type: Date,
			required: true,
		},

		estimatedDuration: {
			type: Number, // in minutes
			required: true,
		},

		price: {
			type: Number,
			required: true,
		},

		totalSeats: {
			type: Number,
			required: true,
		},

		availableSeats: {
			type: Number,
			required: true,
		},

		routePolyline: String,

		status: {
			type: String,
			enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
			default: 'scheduled',
		},
	},
	{ timestamps: true },
);

tripSchema.pre('save', async function () {
	if (this.isNew || this.isModified('vehicle')) {
		const vehicle = await Vehicle.findById(this.vehicle);
		if (vehicle) {
			this.totalSeats = vehicle.seatsCount;
			if (this.isNew) {
				this.availableSeats = vehicle.seatsCount;
			}
		}
	}

});

// Geospatial indexes
tripSchema.index({ 'startLocation.location': '2dsphere' });
tripSchema.index({ 'endLocation.location': '2dsphere' });

module.exports = mongoose.model('Trip', tripSchema);
