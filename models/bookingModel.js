const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		trip: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Trip',
			required: true,
		},

		pickupPoint: {
			name: String,
			location: {
				type: {
					type: String,
					enum: ['Point'],
					default: 'Point',
				},
				coordinates: [Number],
			},
		},

		dropoffPoint: {
			name: String,
			location: {
				type: {
					type: String,
					enum: ['Point'],
					default: 'Point',
				},
				coordinates: [Number],
			},
		},

		seatsBooked: {
			type: Number,
			required: true,
			min: 1,
		},

		totalPrice: {
			type: Number,
			required: true,
		},

		status: {
			type: String,
			enum: ['confirmed', 'cancelled', 'completed'],
			default: 'confirmed',
		},

		paymentStatus: {
			type: String,
			enum: ['pending', 'paid', 'refunded'],
			default: 'pending',
		},

		seats: {
			type: [Number],
			required: true,
			validate: {
				validator: function (arr) {
					return arr.length > 0 && arr.length === this.seatsBooked;
				},
				message: 'عدد المقاعد لا يتطابق مع الأرقام المدخلة',
			},
		},
	},

	{ timestamps: true },
);


module.exports = mongoose.model('Booking', bookingSchema);
