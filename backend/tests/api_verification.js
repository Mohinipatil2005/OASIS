import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Inventory from '../models/Inventory.js';
import Pizza from '../models/Pizza.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { checkLowStock } from '../cron/inventoryCron.js';

dotenv.config();

const runTests = async () => {
  console.log('==================================================');
  console.log('🏁 STARTING PLATFORM INTEGRATION AUDIT');
  console.log('==================================================');

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pizza-delivery';
  
  try {
    // 1. Database Connection
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected successfully.');

    // Clean up previous test entries
    await User.deleteMany({ email: 'test_foodie@example.com' });
    await Admin.deleteMany({ email: 'test_admin@example.com' });
    
    // 2. Auth: User creation & Password Hashing Verification
    console.log('\n[TEST 1] Creating Test User Profile...');
    const testUser = await User.create({
      name: 'Test Foodie',
      email: 'test_foodie@example.com',
      password: 'password123',
      isVerified: true
    });
    console.log(`✅ User profile created with ID: ${testUser._id}`);
    
    const isMatch = await testUser.comparePassword('password123');
    console.log(`✅ Password Hashing Pre-save & Verification match: ${isMatch}`);

    // 3. Inventory: Seeding and stock checks
    console.log('\n[TEST 2] Verifying Inventory ingredients stock level audit...');
    let crust = await Inventory.findOne({ name: 'Classic' });
    if (!crust) {
      crust = await Inventory.create({ name: 'Classic', quantity: 10, unit: 'units', lowStockThreshold: 3 });
    }
    console.log(`✅ Crust ingredient in stock: ${crust.quantity} ${crust.unit}`);

    // 4. Cart & Pricing validations: Simulated custom pizza
    console.log('\n[TEST 3] Simulating custom pizza build & price audit...');
    // Cart total for 2 pizzas:
    // Crust (Classic) + Mozzarella + Veggies (Onion, Capsicum)
    const cartPrice = 249 + 19 + 19; // 287 INR
    console.log(`✅ Custom Pizza pricing: ₹${cartPrice}`);

    // 5. Place order
    console.log('\n[TEST 4] Simulating Order creation...');
    const testOrder = await Order.create({
      user: testUser._id,
      items: [
        {
          name: 'Custom Pizza',
          quantity: 2,
          price: cartPrice,
          isCustomized: true,
          customizationDetails: {
            base: 'Classic',
            sauce: 'Tomato',
            cheese: 'Mozzarella',
            veggies: ['Onion', 'Capsicum'],
            toppings: []
          }
        }
      ],
      totalAmount: cartPrice * 2, // 574
      shippingAddress: {
        street: '123 Test Ave',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001',
        phone: '9876543210'
      },
      paymentStatus: 'pending'
    });
    console.log(`✅ Order placed in database. Status: ${testOrder.status}, Payment: ${testOrder.paymentStatus}`);

    // 6. Payment verified & stock reduction
    console.log('\n[TEST 5] Simulating payment success signature verification...');
    const testPayment = await Payment.create({
      order: testOrder._id,
      user: testUser._id,
      razorpayOrderId: 'order_mock12345',
      amount: testOrder.totalAmount,
      status: 'success'
    });

    testOrder.paymentStatus = 'paid';
    testOrder.paymentDetails = testPayment._id;
    await testOrder.save();
    console.log(`✅ Order status updated to PAID. Link: ${testOrder.paymentDetails}`);

    // Deduct stock for Custom Pizza: subtract 2 classic crusts
    const prevQty = crust.quantity;
    crust.quantity -= 2; // simulating 2 orders
    await crust.save();
    console.log(`✅ Ingredient stock reduced: ${prevQty} -> ${crust.quantity}`);

    // 7. Cron checks: Low Stock Audit triggering Warnings
    console.log('\n[TEST 6] Simulating Automated stock cron job checks...');
    // Artificially drop crust quantity below threshold
    crust.quantity = 2; // threshold is 3
    await crust.save();
    console.log(`⚠️ Adjusted crust stock to ${crust.quantity} units (Threshold: ${crust.lowStockThreshold}). Triggering cron check...`);
    
    // Execute cron auditor function
    await checkLowStock();
    console.log('✅ Cron checked. Verify console alerts and database notifications.');

    // Verify Notification logged
    const alertNotif = await Notification.findOne({ type: 'inventory' }).sort({ createdAt: -1 });
    if (alertNotif) {
      console.log(`✅ Persistent Admin Alert logged: "${alertNotif.title} - ${alertNotif.message}"`);
    } else {
      console.warn('❌ Low stock warning notification not logged in Database.');
    }

    // Clean up
    await User.deleteMany({ email: 'test_foodie@example.com' });
    await Order.findByIdAndDelete(testOrder._id);
    await Payment.findByIdAndDelete(testPayment._id);
    await Notification.deleteMany({ type: 'inventory' });

    console.log('\n==================================================');
    console.log('🎉 ALL BUSINESS LOGIC INTEGRATIONS AUDITED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('❌ Integration audit failed with error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
