exports.getPopularDestinations = (req, res) => {
	const destinations = [
		{
			name: 'مطار القاهرة',
			address: 'شارع المطار، النزهة',
			coordinates: [31.4056, 30.1122],
		},
		{
			name: 'الجامعة',
			address: 'جامعة القاهرة، الجيزة',
			coordinates: [31.2085, 30.0275],
		},
		{
			name: 'محطة مصر',
			address: 'ميدان رمسيس',
			coordinates: [31.2484, 30.0636],
		},
	];
	res.status(200).json({ status: 'success', data: destinations });
};
