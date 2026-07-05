exports.getMapsConfig = (req, res) => {
	const apiKey = process.env.GOOGLE_MAPS_API_KEY;
	if (!apiKey) {
		return res.status(500).json({
			status: 'error',
			message: 'Google Maps API key not configured on server',
		});
	}
	// Optionally, you can restrict this endpoint to authenticated users only
	res.json({
		googleMapsApiKey: apiKey,
	});
};
