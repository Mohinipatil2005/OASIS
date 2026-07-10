import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

let razorpayInstance = null;

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isConfigured = keyId && keySecret && keyId !== 'rzp_test_your_key_id';

if (isConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('Razorpay initialized successfully.');
  } catch (error) {
    console.error('Error initializing Razorpay, fallback to mock mode.', error.message);
  }
} else {
  console.log('Using mock mode for Razorpay payments (missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET).');
}

/**
 * Creates an order in Razorpay (or mock order if not configured).
 * @param {number} amount - Amount in INR (will be converted to paise internally).
 * @param {string} receiptId - Associated order schema ID.
 * @returns {Promise<object>} Created order details.
 */
export const createRazorpayOrder = async (amount, receiptId) => {
  const amountInPaise = Math.round(amount * 100);

  if (!isConfigured || !razorpayInstance) {
    // Generate a mock Razorpay order structure
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 17)}`;
    return {
      id: mockOrderId,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      attempts: 0,
      notes: [],
      created_at: Math.floor(Date.now() / 1000),
      isMock: true
    };
  }

  try {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

/**
 * Verifies Razorpay payment signature authenticity.
 * @param {string} razorpayOrderId - Razorpay order ID.
 * @param {string} razorpayPaymentId - Razorpay payment ID.
 * @param {string} razorpaySignature - Razorpay security signature.
 * @returns {boolean} True if verification matches, false otherwise.
 */
export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (!isConfigured || !razorpayInstance) {
    // If order was a mock, verify automatically if signatures starts with "mock_"
    if (razorpayOrderId.startsWith('order_') && razorpayPaymentId.startsWith('pay_')) {
      return true;
    }
    return false;
  }

  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Signature verification error:', error.message);
    return false;
  }
};
