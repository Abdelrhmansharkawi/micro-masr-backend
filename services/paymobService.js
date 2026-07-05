const axios = require('axios');

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_BASE_URL = process.env.PAYMOB_BASE_URL;

class PaymobService {
	// Step 1: Get authentication token
	async getAuthToken() {
		console.log('🔑 Getting auth token...');
		const response = await axios.post(`${PAYMOB_BASE_URL}/auth/tokens`, {
			api_key: PAYMOB_API_KEY,
		});
		console.log('✅ Auth token obtained');
		return response.data.token;
	}

	// Step 2: Register an order
	async registerOrder(token, amount, userId) {
		const payload = {
			auth_token: token,
			delivery_needed: false,
			amount_cents: Math.round(amount * 100),
			currency: 'EGP',
			merchant_order_id: `order_${userId}_${Date.now()}`,
			items: [],
		};

		console.log('📦 Register Order Payload:', JSON.stringify(payload, null, 2));

		const response = await axios.post(
			`${PAYMOB_BASE_URL}/ecommerce/orders`,
			payload,
			{ headers: { 'Content-Type': 'application/json' } },
		);

		console.log('✅ Order registered, ID:', response.data.id);
		return response.data.id;
	}

	// Step 3: Generate payment key
	async getPaymentKey(token, orderId, integrationId, amount, userData) {
		const payload = {
			auth_token: token,
			amount_cents: Math.round(amount * 100), 
			expiration: 3600,
			order_id: orderId,
			integration_id: integrationId,
			currency: 'EGP',
			billing_data: {
				first_name: userData.firstName || 'User',
				last_name:
					userData.lastName && userData.lastName.trim() !== ''
						? userData.lastName
						: 'N/A',
				email: userData.email || 'customer@example.com',
				phone_number: userData.phone || '01000000000',
				apartment: '1', 
				floor: '1',
				street: 'Main St',
				building: '1',
				city: 'Cairo',
				state: 'Cairo',
				country: 'EG',
			},
		};

		console.log('🔑 Payment Key Payload:', JSON.stringify(payload, null, 2));

		const response = await axios.post(
			`${PAYMOB_BASE_URL}/acceptance/payment_keys`,
			payload,
			{ headers: { 'Content-Type': 'application/json' } },
		);

		console.log('✅ Payment token generated');
		return response.data.token;
	}

	// Full payment initiation
	async initiatePayment(amount, integrationId, userId, userData) {
		try {
			const token = await this.getAuthToken();
			const orderId = await this.registerOrder(token, amount, userId);
			const paymentToken = await this.getPaymentKey(
				token,
				orderId,
				integrationId,
				amount, 
				userData,
			);
			return {
				paymentToken,
				orderId,
				integrationId,
			};
		} catch (error) {
			console.error('❌ Paymob Error Status:', error.response?.status);
			console.error(
				'❌ Paymob Error Data:',
				JSON.stringify(error.response?.data, null, 2),
			);
			console.error('❌ Paymob Error Headers:', error.response?.headers);
			throw new Error('Payment initiation failed');
		}
	}
}

module.exports = new PaymobService();
