const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: [true, 'Full name is required'],
			trim: true,
		},

		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
		},

		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: 6,
			select: false,
		},

		phone: {
			type: String,
			required: true,
		},

		role: {
			type: String,
			enum: ['user', 'driver', 'admin'],
			default: 'user',
		},

		profileImage: String,

		isVerified: {
			type: Boolean,
			default: false,
		},

		rating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
	},
	{ timestamps: true },
);



// Hash password
userSchema.pre('save', async function () {
	if (!this.isModified('password')) return;

	this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword,
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

// Generate JWT (optional but clean)
userSchema.methods.generateToken = function () {
	return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

module.exports = mongoose.model('User', userSchema);
