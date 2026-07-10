import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import Inventory from '../models/Inventory.js';
import Pizza from '../models/Pizza.js';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

dotenv.config();

const ingredientsData = [
  // Bases
  { name: 'Thin Crust', quantity: 50, unit: 'units', lowStockThreshold: 10 },
  { name: 'Cheese Burst', quantity: 50, unit: 'units', lowStockThreshold: 10 },
  { name: 'Classic', quantity: 50, unit: 'units', lowStockThreshold: 10 },
  { name: 'Whole Wheat', quantity: 50, unit: 'units', lowStockThreshold: 10 },
  { name: 'Stuffed Crust', quantity: 50, unit: 'units', lowStockThreshold: 10 },

  // Sauces
  { name: 'Tomato Sauce', quantity: 1000, unit: 'ml', lowStockThreshold: 200 },
  { name: 'Spicy Sauce', quantity: 1000, unit: 'ml', lowStockThreshold: 200 },
  { name: 'Garlic Sauce', quantity: 1000, unit: 'ml', lowStockThreshold: 200 },
  { name: 'BBQ Sauce', quantity: 1000, unit: 'ml', lowStockThreshold: 200 },
  { name: 'Pesto Sauce', quantity: 1000, unit: 'ml', lowStockThreshold: 200 },

  // Cheeses
  { name: 'Mozzarella', quantity: 2000, unit: 'grams', lowStockThreshold: 500 },
  { name: 'Cheddar', quantity: 1500, unit: 'grams', lowStockThreshold: 300 },
  { name: 'Parmesan', quantity: 1000, unit: 'grams', lowStockThreshold: 200 },
  { name: 'Vegan', quantity: 1000, unit: 'grams', lowStockThreshold: 200 },
  { name: 'Extra Cheese', quantity: 2000, unit: 'grams', lowStockThreshold: 500 },

  // Veggies
  { name: 'Onion', quantity: 3000, unit: 'grams', lowStockThreshold: 400 },
  { name: 'Capsicum', quantity: 3000, unit: 'grams', lowStockThreshold: 400 },
  { name: 'Corn', quantity: 2000, unit: 'grams', lowStockThreshold: 300 },
  { name: 'Olives', quantity: 1500, unit: 'grams', lowStockThreshold: 200 },
  { name: 'Mushroom', quantity: 2000, unit: 'grams', lowStockThreshold: 300 },
  { name: 'Paneer', quantity: 1500, unit: 'grams', lowStockThreshold: 200 },
  { name: 'Tomato', quantity: 3000, unit: 'grams', lowStockThreshold: 400 },
  { name: 'Jalapeno', quantity: 1500, unit: 'grams', lowStockThreshold: 200 },

  // Toppings
  { name: 'Chicken', quantity: 2500, unit: 'grams', lowStockThreshold: 500 },
  { name: 'Pepperoni', quantity: 2000, unit: 'grams', lowStockThreshold: 400 },
  { name: 'Bacon', quantity: 1500, unit: 'grams', lowStockThreshold: 300 },
  { name: 'Sausage', quantity: 2000, unit: 'grams', lowStockThreshold: 400 }
];

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Checking database seeding requirements...');
    
    // 1. Seed Admin Account (Ensure default admin exists with correct hashed password)
    await Admin.deleteMany({ email: 'admin@pizza.com' });
    console.log('[Seeder] Seeding default admin account...');
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@pizza.com',
      password: 'adminpassword', // Will be pre-save hashed
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
    });
    console.log('[Seeder] Default Admin account created successfully! Credentials: admin@pizza.com / adminpassword');

    // 2. Seed Raw Inventory Ingredients if empty
    const inventoryCount = await Inventory.countDocuments({});
    if (inventoryCount === 0) {
      console.log('[Seeder] Inventory empty. Seeding basic ingredients...');
      await Inventory.insertMany(ingredientsData);
      console.log('[Seeder] Seeding of raw ingredients complete.');
    }

    // 3. Seed Default Pizzas if empty
    const pizzaCount = await Pizza.countDocuments({});
    if (pizzaCount === 0) {
      console.log('[Seeder] Pizza catalog empty. Seeding menu pizzas...');

      // Fetch created inventory documents to obtain ObjectIds for recipes
      const dbCrust = await Inventory.findOne({ name: 'Classic' });
      const dbTomato = await Inventory.findOne({ name: 'Tomato Sauce' });
      const dbMozz = await Inventory.findOne({ name: 'Mozzarella' });
      const dbPepperoni = await Inventory.findOne({ name: 'Pepperoni' });
      const dbOnion = await Inventory.findOne({ name: 'Onion' });
      const dbCapsicum = await Inventory.findOne({ name: 'Capsicum' });
      const dbMushroom = await Inventory.findOne({ name: 'Mushroom' });
      const dbChicken = await Inventory.findOne({ name: 'Chicken' });
      const dbJalapeno = await Inventory.findOne({ name: 'Jalapeno' });
      const dbSpicy = await Inventory.findOne({ name: 'Spicy Sauce' });
      const dbPaneer = await Inventory.findOne({ name: 'Paneer' });

      const seedPizzas = [
        {
          name: "Classic Veg Pocket",
          description: "Crispy folded pocket stuffed with golden sweet corn, mozzarella, and dynamic herbs. (Zepto Style)",
          price: 79,
          image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop",
          category: "Meals Under 99",
          isCustomizable: false,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 30 }
          ]
        },
        {
          name: "Indi Paneer Maxxx",
          description: "Spicy tandoori marinade paneer cubes layered with capsicum, red onions, and hot green chilies. (Domino's Style)",
          price: 339,
          image: "http://localhost:5173/paneer_max_pizza.png",
          category: "Paneer Maxxx",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 },
            { ingredient: dbPaneer._id, quantityRequired: 100 }
          ]
        },
        {
          name: "Chicken Maxxx Feast",
          description: "Loaded with grilled chicken chunks, chicken sausages, and double melted mozzarella. (Domino's Style)",
          price: 459,
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=600&w=600&auto=format&fit=crop",
          category: "Chicken Maxxx",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbSpicy._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 },
            { ingredient: dbChicken._id, quantityRequired: 120 }
          ]
        },
        {
          name: "Detroit Crispy Pepperoni",
          description: "A giant square double-crust pizza loaded from edge to edge with premium pepperoni slices. (Photo Match)",
          price: 529,
          image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=600&auto=format&fit=crop",
          category: "Big Big Pizza",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 },
            { ingredient: dbPepperoni._id, quantityRequired: 120 }
          ]
        },
        {
          name: "Double Cheese Margherita",
          description: "A classic veg delight! Thick layer of Mozzarella and Cheddar cheese over fresh tomato sauce. (Domino's Style)",
          price: 239,
          image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop",
          category: "Veg Pizza",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 }
          ]
        },
        {
          name: "Farmhouse Fresh Veggie",
          description: "Gourmet veg toppings: crunchy capsicum, red onions, mushrooms, and sweet corn on hand-tossed base. (Domino's Style)",
          price: 299,
          image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=600&w=600&auto=format&fit=crop",
          category: "Veg Pizza",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 },
            { ingredient: dbOnion._id, quantityRequired: 40 },
            { ingredient: dbCapsicum._id, quantityRequired: 40 },
            { ingredient: dbMushroom._id, quantityRequired: 40 }
          ]
        },
        {
          name: "Indi Barbecue Chicken",
          description: "Tender BBQ grilled chicken chunks, red onions, jalapenos, and sweet BBQ sauce. (Photo Match)",
          price: 439,
          image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600&auto=format&fit=crop",
          category: "Non-Veg Pizza",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbSpicy._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 },
            { ingredient: dbChicken._id, quantityRequired: 100 }
          ]
        },
        {
          name: "Cheesy Onion Pizza Mania",
          description: "Budget personal cheese pizza topped with sweet onions and a pinch of green herbs. (Domino's Style)",
          price: 69,
          image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop",
          category: "Pizza Mania",
          isCustomizable: false,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 30 }
          ]
        },
        {
          name: "BOGO Margherita Crazy Deal",
          description: "Two personal size classic Margherita pizzas at the cost of one. Instant crazy deal combo. (Zepto Style)",
          price: 189,
          image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=600&auto=format&fit=crop",
          category: "Crazy Deals",
          isCustomizable: false,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 }
          ]
        },
        {
          name: "Salami & Artichoke Sourdough",
          description: "Fermented sourdough crust topped with salami slices, artichoke hearts, olives, and fresh basil leaves. (Photo Match)",
          price: 449,
          image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=600&w=600&auto=format&fit=crop",
          category: "Sourdough Range",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 }
          ]
        },
        {
          name: "Double Pizza Party Combo",
          description: "Perfect for parties: 2 medium pizzas, 1 garlic breadsticks, and a chilled Pepsi bottle. (Domino's Style)",
          price: 599,
          image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop",
          category: "Party Combos",
          isCustomizable: false,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 2 }
          ]
        },
        {
          name: "Crispy Chicken Wings Feast",
          description: "Feast of 6 pieces golden crispy chicken wings served with hot spicy garlic dips. (Zepto Style)",
          price: 169,
          image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop",
          category: "Chicken Feast",
          isCustomizable: false,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 }
          ]
        },
        {
          name: "Classic Garlic Breadsticks",
          description: "Freshly baked garlic breadsticks brushed with melted butter and sprinkled with oregano. (Domino's Style)",
          price: 119,
          image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?q=80&w=600&auto=format&fit=crop",
          category: "Garlic Breads & Dips",
          isCustomizable: false,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 }
          ]
        },
        {
          name: "Cilantro Pineapple Bacon",
          description: "A tropical favorite! Sliced bacon, sweet golden pineapple chunks, purple onions, and fresh cilantro. (Photo Match)",
          price: 399,
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop",
          category: "Non-Veg Pizza",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 }
          ]
        },
        {
          name: "Tuscan Tomato Chicken",
          description: "Thin crust pizza topped with grilled chicken breast slices, cherry tomatoes, and basil leaves. (Photo Match)",
          price: 499,
          image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop",
          category: "Chicken Maxxx",
          isCustomizable: true,
          ingredients: [
            { ingredient: dbCrust._id, quantityRequired: 1 },
            { ingredient: dbTomato._id, quantityRequired: 50 },
            { ingredient: dbMozz._id, quantityRequired: 150 },
            { ingredient: dbChicken._id, quantityRequired: 100 }
          ]
        }
      ];

      await Pizza.insertMany(seedPizzas);
    }
    
    // Always update "Indi Paneer Maxxx" image to the custom asset
    await Pizza.updateOne(
      { name: "Indi Paneer Maxxx" },
      { $set: { image: "http://localhost:5173/paneer_max_pizza.png" } }
    );
    
    console.log('[Seeder] Database check completed.');
  } catch (error) {
    console.error('Error running Database Seeder:', error.message);
  }
};
