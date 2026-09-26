import connectDB from '../src/lib/db.js';
import { Category, Product, Settings, User } from '../src/models/index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create settings
    await Settings.findByIdAndUpdate(
      'settings',
      {
        storeName: 'Smart POS',
        taxRate: 8.5,
        currency: 'USD',
        receiptFooter: 'Thank you for shopping with us!',
      },
      { upsert: true, new: true }
    );
    console.log('Settings created/updated');

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    await User.findOneAndUpdate(
      { email: 'admin@smartpos.com' },
      {
        email: 'admin@smartpos.com',
        name: 'Admin User',
        passwordHash,
        role: 'ADMIN',
      },
      { upsert: true, new: true }
    );
    console.log('Admin user created/updated');

    // Create categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Food & Beverages', description: 'Groceries, snacks, and drinks' },
      { name: 'Home & Garden', description: 'Household items and garden supplies' },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
      { name: 'Beauty & Health', description: 'Cosmetics, skincare, and health products' },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const category = await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true, new: true }
      );
      createdCategories.push(category);
      console.log(`Category created/updated: ${cat.name}`);
    }

    // Create products
    const products = [
      // Electronics
      { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with A17 Pro chip', sku: 'IPH15PRO-128', barcode: '1234567890123', price: 999.99, cost: 750.00, stock: 25, minStock: 5, categoryId: createdCategories[0]._id },
      { name: 'Samsung Galaxy S24', description: 'Android flagship with AI features', sku: 'SAMS24-256', barcode: '1234567890124', price: 899.99, cost: 650.00, stock: 20, minStock: 5, categoryId: createdCategories[0]._id },
      { name: 'MacBook Air M3', description: '13-inch laptop with M3 chip', sku: 'MBA-M3-256', barcode: '1234567890125', price: 1299.99, cost: 950.00, stock: 10, minStock: 3, categoryId: createdCategories[0]._id },
      { name: 'AirPods Pro 2', description: 'Wireless earbuds with ANC', sku: 'APP2-USBC', barcode: '1234567890126', price: 249.99, cost: 150.00, stock: 50, minStock: 10, categoryId: createdCategories[0]._id },
      { name: 'iPad Air 11"', description: 'Tablet with M2 chip', sku: 'IPAD-AIR-11', barcode: '1234567890127', price: 599.99, cost: 400.00, stock: 15, minStock: 5, categoryId: createdCategories[0]._id },

      // Clothing
      { name: 'Classic T-Shirt', description: '100% cotton crew neck t-shirt', sku: 'TEE-CLASSIC-M', barcode: '1234567890128', price: 19.99, cost: 8.00, stock: 100, minStock: 20, categoryId: createdCategories[1]._id },
      { name: 'Slim Fit Jeans', description: 'Modern slim fit denim jeans', sku: 'JEANS-SLIM-32', barcode: '1234567890129', price: 59.99, cost: 25.00, stock: 50, minStock: 10, categoryId: createdCategories[1]._id },
      { name: 'Hooded Sweatshirt', description: 'Comfortable fleece hoodie', sku: 'HOODIE-FLEECE-L', barcode: '1234567890130', price: 44.99, cost: 18.00, stock: 75, minStock: 15, categoryId: createdCategories[1]._id },
      { name: 'Running Shoes', description: 'Lightweight athletic running shoes', sku: 'SHOES-RUN-10', barcode: '1234567890131', price: 89.99, cost: 40.00, stock: 30, minStock: 8, categoryId: createdCategories[1]._id },
      { name: 'Baseball Cap', description: 'Adjustable cotton baseball cap', sku: 'CAP-BASEBALL', barcode: '1234567890132', price: 24.99, cost: 10.00, stock: 60, minStock: 12, categoryId: createdCategories[1]._id },

      // Food & Beverages
      { name: 'Organic Coffee Beans', description: '1lb bag of premium arabica beans', sku: 'COFFEE-ORG-1LB', barcode: '1234567890133', price: 14.99, cost: 7.00, stock: 40, minStock: 10, categoryId: createdCategories[2]._id },
      { name: 'Artisan Bread', description: 'Freshly baked sourdough loaf', sku: 'BREAD-SOURDOUGH', barcode: '1234567890134', price: 5.99, cost: 2.50, stock: 20, minStock: 5, categoryId: createdCategories[2]._id },
      { name: 'Dark Chocolate Bar', description: '72% cacao single origin chocolate', sku: 'CHOC-DARK-72', barcode: '1234567890135', price: 4.99, cost: 2.00, stock: 80, minStock: 15, categoryId: createdCategories[2]._id },
      { name: 'Sparkling Water 12pk', description: 'Natural flavored sparkling water', sku: 'WATER-SPARK-12', barcode: '1234567890136', price: 8.99, cost: 4.00, stock: 60, minStock: 12, categoryId: createdCategories[2]._id },
      { name: 'Granola Bars 6ct', description: 'Honey oat granola bars', sku: 'GRANOLA-HONEY-6', barcode: '1234567890137', price: 3.99, cost: 1.80, stock: 100, minStock: 20, categoryId: createdCategories[2]._id },

      // Home & Garden
      { name: 'LED Desk Lamp', description: 'Adjustable brightness desk lamp', sku: 'LAMP-DESK-LED', barcode: '1234567890138', price: 34.99, cost: 15.00, stock: 35, minStock: 8, categoryId: createdCategories[3]._id },
      { name: 'Throw Blanket', description: 'Soft microfiber throw blanket', sku: 'BLANKET-THROW', barcode: '1234567890139', price: 29.99, cost: 12.00, stock: 45, minStock: 10, categoryId: createdCategories[3]._id },
      { name: 'Plant Pot Set', description: 'Set of 3 ceramic plant pots', sku: 'POT-CERAMIC-3', barcode: '1234567890140', price: 24.99, cost: 10.00, stock: 30, minStock: 6, categoryId: createdCategories[3]._id },
      { name: 'Scented Candle', description: 'Lavender vanilla scented candle', sku: 'CANDLE-LAV-VAN', barcode: '1234567890141', price: 18.99, cost: 8.00, stock: 50, minStock: 10, categoryId: createdCategories[3]._id },
      { name: 'Wall Clock', description: 'Minimalist silent wall clock', sku: 'CLOCK-WALL-MIN', barcode: '1234567890142', price: 22.99, cost: 10.00, stock: 25, minStock: 5, categoryId: createdCategories[3]._id },

      // Sports & Outdoors
      { name: 'Yoga Mat', description: 'Non-slip exercise yoga mat', sku: 'YOGA-MAT-PRO', barcode: '1234567890143', price: 29.99, cost: 12.00, stock: 40, minStock: 8, categoryId: createdCategories[4]._id },
      { name: 'Dumbbell Set', description: 'Adjustable dumbbell pair 5-50 lbs', sku: 'DUMBBELL-ADJ', barcode: '1234567890144', price: 199.99, cost: 100.00, stock: 10, minStock: 2, categoryId: createdCategories[4]._id },
      { name: 'Resistance Bands', description: 'Set of 5 resistance bands', sku: 'BANDS-RESIST-5', barcode: '1234567890145', price: 19.99, cost: 8.00, stock: 60, minStock: 12, categoryId: createdCategories[4]._id },
      { name: 'Water Bottle', description: 'Insulated stainless steel 32oz', sku: 'BOTTLE-INSUL-32', barcode: '1234567890146', price: 24.99, cost: 10.00, stock: 70, minStock: 15, categoryId: createdCategories[4]._id },
      { name: 'Tennis Racket', description: 'Beginner friendly tennis racket', sku: 'RACKET-TENNIS', barcode: '1234567890147', price: 79.99, cost: 35.00, stock: 15, minStock: 3, categoryId: createdCategories[4]._id },

      // Beauty & Health
      { name: 'Face Moisturizer', description: 'Daily hydrating face cream', sku: 'MOIST-FACE-DAILY', barcode: '1234567890148', price: 22.99, cost: 10.00, stock: 40, minStock: 8, categoryId: createdCategories[5]._id },
      { name: 'Vitamin D3 5000 IU', description: 'High potency vitamin D3 softgels', sku: 'VIT-D3-5000', barcode: '1234567890149', price: 14.99, cost: 6.00, stock: 80, minStock: 15, categoryId: createdCategories[5]._id },
      { name: 'Electric Toothbrush', description: 'Sonic rechargeable toothbrush', sku: 'TOOTHBRUSH-SONIC', barcode: '1234567890150', price: 49.99, cost: 25.00, stock: 20, minStock: 5, categoryId: createdCategories[5]._id },
      { name: 'Hair Dryer', description: 'Professional ionic hair dryer', sku: 'DRYER-IONIC-PRO', barcode: '1234567890151', price: 89.99, cost: 45.00, stock: 15, minStock: 3, categoryId: createdCategories[5]._id },
      { name: 'Sunscreen SPF 50', description: 'Broad spectrum face sunscreen', sku: 'SUNSCREEN-SPF50', barcode: '1234567890152', price: 16.99, cost: 7.00, stock: 50, minStock: 10, categoryId: createdCategories[5]._id },
    ];

    for (const prod of products) {
      await Product.findOneAndUpdate(
        { sku: prod.sku },
        prod,
        { upsert: true, new: true }
      );
      console.log(`Product created/updated: ${prod.name}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();