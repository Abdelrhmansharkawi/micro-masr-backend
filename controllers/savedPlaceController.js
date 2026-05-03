// controllers/savedPlaceController.js
const SavedPlace = require('../models/savedPlaceModel');

//get user places
exports.getMyPlaces = async (req, res) => {
	try {
		const places = await SavedPlace.find({ user: req.user.id });
		res.status(200).json({
			status: 'success',
			data: places,
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};

// add new place
exports.addPlace = async (req, res) => {
	try {
		const { name, address, location, type } = req.body;

		const place = await SavedPlace.create({
			user: req.user.id,
			name,
			address,
			location,
			type: type || 'other',
		});

		res.status(201).json({
			status: 'success',
			data: place,
		});
	} catch (err) {
		res.status(400).json({ status: 'fail', message: err.message });
	}
};

// delete places
exports.deletePlace = async (req, res) => {
	try {
		const place = await SavedPlace.findOneAndDelete({
			_id: req.params.id,
			user: req.user.id,
		});
		if (!place) {
			return res
				.status(404)
				.json({ status: 'fail', message: 'Place not found' });
		}
		res.status(204).json({ status: 'success', data: null });
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
