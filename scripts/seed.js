import connectDB from '../src/lib/db.js';
import { Category, Product, Settings, User, Supplier, Purchase, Return, Notification, ActivityLog, Brand, Sale, Customer } from '../src/models/index.js';
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

    // Create additional users
    const managerHash = await bcrypt.hash('manager123', 12);
    await User.findOneAndUpdate(
      { email: 'manager@smartpos.com' },
      {
        email: 'manager@smartpos.com',
        name: 'Store Manager',
        passwordHash: managerHash,
        role: 'MANAGER',
      },
      { upsert: true, new: true }
    );

    const cashierHash = await bcrypt.hash('cashier123', 12);
    await User.findOneAndUpdate(
      { email: 'cashier@smartpos.com' },
      {
        email: 'cashier@smartpos.com',
        name: 'Cashier User',
        passwordHash: cashierHash,
        role: 'CASHIER',
      },
      { upsert: true, new: true }
    );
    console.log('Additional users created/updated');

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

    // Create brands
    const brands = [
      { name: 'Apple', description: 'Apple Inc. products', logoUrl: 'https://example.com/apple-logo.png' },
      { name: 'Samsung', description: 'Samsung Electronics products', logoUrl: 'https://example.com/samsung-logo.png' },
      { name: 'Nike', description: 'Nike sportswear and equipment', logoUrl: 'https://example.com/nike-logo.png' },
      { name: 'Adidas', description: 'Adidas sportswear and equipment', logoUrl: 'https://example.com/adidas-logo.png' },
      { name: 'Sony', description: 'Sony electronics', logoUrl: 'https://example.com/sony-logo.png' },
      { name: 'LG', description: 'LG electronics and appliances', logoUrl: 'https://example.com/lg-logo.png' },
      { name: 'Dell', description: 'Dell computers and accessories', logoUrl: 'https://example.com/dell-logo.png' },
      { name: 'HP', description: 'HP computers and printers', logoUrl: 'https://example.com/hp-logo.png' },
    ];

    const createdBrands = [];
    for (const brand of brands) {
      const b = await Brand.findOneAndUpdate(
        { name: brand.name },
        brand,
        { upsert: true, new: true }
      );
      createdBrands.push(b);
      console.log(`Brand created/updated: ${brand.name}`);
    }

    // Create suppliers
    const suppliers = [
      {
        name: 'TechDistributors Inc.',
        company: 'TechDistributors Inc.',
        email: 'orders@techdistributors.com',
        phone: '+1-555-0100',
        address: '123 Tech Park Drive, San Francisco, CA 94105',
        contactPerson: 'John Smith',
        taxId: 'TX-12345678',
        paymentTerms: 30,
        dueAmount: 15000.00,
        isActive: true,
        notes: 'Primary electronics supplier',
      },
      {
        name: 'FashionWholesale Co.',
        company: 'FashionWholesale Co.',
        email: 'sales@fashionwholesale.com',
        phone: '+1-555-0200',
        address: '456 Fashion Avenue, Los Angeles, CA 90001',
        contactPerson: 'Jane Doe',
        taxId: 'TX-87654321',
        paymentTerms: 45,
        dueAmount: 8500.00,
        isActive: true,
        notes: 'Clothing and apparel supplier',
      },
      {
        name: 'FreshFoods Distribution',
        company: 'FreshFoods Distribution LLC',
        email: 'orders@freshfoods.com',
        phone: '+1-555-0300',
        address: '789 Market Street, Chicago, IL 60601',
        contactPerson: 'Mike Johnson',
        taxId: 'TX-11223344',
        paymentTerms: 15,
        dueAmount: 3200.00,
        isActive: true,
        notes: 'Food and beverages supplier',
      },
      {
        name: 'HomeEssentials Supply',
        company: 'HomeEssentials Supply Co.',
        email: 'procurement@homeessentials.com',
        phone: '+1-555-0400',
        address: '321 Industrial Blvd, Houston, TX 77001',
        contactPerson: 'Sarah Wilson',
        taxId: 'TX-55667788',
        paymentTerms: 30,
        dueAmount: 0.00,
        isActive: true,
        notes: 'Home and garden products',
      },
      {
        name: 'SportsGear Pro',
        company: 'SportsGear Pro Distributors',
        email: 'orders@sportsgearpro.com',
        phone: '+1-555-0500',
        address: '654 Athletic Way, Denver, CO 80201',
        contactPerson: 'Tom Brown',
        taxId: 'TX-99887766',
        paymentTerms: 30,
        dueAmount: 5500.00,
        isActive: true,
        notes: 'Sports and outdoor equipment',
      },
    ];

    const createdSuppliers = [];
    for (const sup of suppliers) {
      const supplier = await Supplier.findOneAndUpdate(
        { email: sup.email },
        sup,
        { upsert: true, new: true }
      );
      createdSuppliers.push(supplier);
      console.log(`Supplier created/updated: ${sup.name}`);
    }

    // Create products
    const products = [
      // Electronics
      { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with A17 Pro chip', sku: 'IPH15PRO-128', barcode: '1234567890123', price: 999.99, cost: 750.00, stock: 25, minStock: 5, categoryId: createdCategories[0]._id, brandId: createdBrands[0]._id },
      { name: 'Samsung Galaxy S24', description: 'Android flagship with AI features', sku: 'SAMS24-256', barcode: '1234567890124', price: 899.99, cost: 650.00, stock: 20, minStock: 5, categoryId: createdCategories[0]._id, brandId: createdBrands[1]._id },
      { name: 'MacBook Air M3', description: '13-inch laptop with M3 chip', sku: 'MBA-M3-256', barcode: '1234567890125', price: 1299.99, cost: 950.00, stock: 10, minStock: 3, categoryId: createdCategories[0]._id, brandId: createdBrands[0]._id },
      { name: 'AirPods Pro 2', description: 'Wireless earbuds with ANC', sku: 'APP2-USBC', barcode: '1234567890126', price: 249.99, cost: 150.00, stock: 50, minStock: 10, categoryId: createdCategories[0]._id, brandId: createdBrands[0]._id },
      { name: 'iPad Air 11"', description: 'Tablet with M2 chip', sku: 'IPAD-AIR-11', barcode: '1234567890127', price: 599.99, cost: 400.00, stock: 15, minStock: 5, categoryId: createdCategories[0]._id, brandId: createdBrands[0]._id },
      { name: 'Sony WH-1000XM5', description: 'Noise-canceling wireless headphones', sku: 'SONY-WH1000XM5', barcode: '1234567890153', price: 399.99, cost: 250.00, stock: 30, minStock: 8, categoryId: createdCategories[0]._id, brandId: createdBrands[4]._id },
      { name: 'LG 55" OLED TV', description: '4K OLED Smart TV', sku: 'LG-OLED-55', barcode: '1234567890154', price: 1499.99, cost: 1000.00, stock: 5, minStock: 2, categoryId: createdCategories[0]._id, brandId: createdBrands[5]._id },
      { name: 'Dell XPS 13', description: 'Ultra-portable laptop', sku: 'DELL-XPS13', barcode: '1234567890155', price: 1199.99, cost: 850.00, stock: 8, minStock: 3, categoryId: createdCategories[0]._id, brandId: createdBrands[6]._id },

      // Clothing
      { name: 'Classic T-Shirt', description: '100% cotton crew neck t-shirt', sku: 'TEE-CLASSIC-M', barcode: '1234567890128', price: 19.99, cost: 8.00, stock: 100, minStock: 20, categoryId: createdCategories[1]._id, brandId: createdBrands[2]._id },
      { name: 'Slim Fit Jeans', description: 'Modern slim fit denim jeans', sku: 'JEANS-SLIM-32', barcode: '1234567890129', price: 59.99, cost: 25.00, stock: 50, minStock: 10, categoryId: createdCategories[1]._id, brandId: createdBrands[2]._id },
      { name: 'Hooded Sweatshirt', description: 'Comfortable fleece hoodie', sku: 'HOODIE-FLEECE-L', barcode: '1234567890130', price: 44.99, cost: 18.00, stock: 75, minStock: 15, categoryId: createdCategories[1]._id, brandId: createdBrands[3]._id },
      { name: 'Running Shoes', description: 'Lightweight athletic running shoes', sku: 'SHOES-RUN-10', barcode: '1234567890131', price: 89.99, cost: 40.00, stock: 30, minStock: 8, categoryId: createdCategories[1]._id, brandId: createdBrands[2]._id },
      { name: 'Baseball Cap', description: 'Adjustable cotton baseball cap', sku: 'CAP-BASEBALL', barcode: '1234567890132', price: 24.99, cost: 10.00, stock: 60, minStock: 12, categoryId: createdCategories[1]._id, brandId: createdBrands[3]._id },
      { name: 'Adidas Track Jacket', description: 'Classic 3-stripe track jacket', sku: 'ADIDAS-TRACK-M', barcode: '1234567890156', price: 79.99, cost: 35.00, stock: 25, minStock: 5, categoryId: createdCategories[1]._id, brandId: createdBrands[3]._id },
      { name: 'Nike Dri-FIT Shirt', description: 'Moisture-wicking athletic shirt', sku: 'NIKE-DRIFIT-L', barcode: '1234567890157', price: 34.99, cost: 15.00, stock: 40, minStock: 10, categoryId: createdCategories[1]._id, brandId: createdBrands[2]._id },

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

      // Low stock items for testing
      { name: 'Low Stock Test Item', description: 'Test item with low stock', sku: 'LOW-STOCK-001', barcode: '1234567890158', price: 9.99, cost: 5.00, stock: 3, minStock: 10, categoryId: createdCategories[0]._id },
      { name: 'Out of Stock Item', description: 'Test item out of stock', sku: 'OUT-STOCK-001', barcode: '1234567890159', price: 19.99, cost: 10.00, stock: 0, minStock: 5, categoryId: createdCategories[1]._id },
    ];

    for (const prod of products) {
      await Product.findOneAndUpdate(
        { sku: prod.sku },
        prod,
        { upsert: true, new: true }
      );
      console.log(`Product created/updated: ${prod.name}`);
    }

    // Create sample purchases
    const adminUser = await User.findOne({ email: 'admin@smartpos.com' }).lean();
    const managerUser = await User.findOne({ email: 'manager@smartpos.com' }).lean();

    const sampleProducts = await Product.find().limit(10).lean();
    const supplierProducts = await Product.find({ categoryId: createdCategories[0]._id }).limit(5).lean();

    if (sampleProducts.length > 0 && createdSuppliers.length > 0 && adminUser) {
      // Purchase 1 - Received
      const purchaseItems1 = supplierProducts.slice(0, 3).map(p => ({
        productId: p._id,
        productName: p.name,
        sku: p.sku,
        quantity: 10,
        unitCost: p.cost,
        total: p.cost * 10,
      }));
      const subtotal1 = purchaseItems1.reduce((sum, item) => sum + item.total, 0);
      const tax1 = subtotal1 * 0.085;
      const total1 = subtotal1 + tax1;

      await Purchase.findOneAndUpdate(
        { purchaseNumber: 'PO240115-0001' },
        {
          purchaseNumber: 'PO240115-0001',
          supplierId: createdSuppliers[0]._id,
          supplierName: createdSuppliers[0].name,
          items: purchaseItems1,
          subtotal: subtotal1,
          tax: tax1,
          discount: 0,
          discountType: 'percentage',
          total: total1,
          userId: adminUser._id,
          expectedDate: new Date('2024-01-20'),
          receivedDate: new Date('2024-01-18'),
          notes: 'Regular restock order',
          status: 'RECEIVED',
          paymentStatus: 'PAID',
          paidAmount: total1,
        },
        { upsert: true, new: true }
      );

      // Purchase 2 - Pending
      const purchaseItems2 = supplierProducts.slice(1, 4).map(p => ({
        productId: p._id,
        productName: p.name,
        sku: p.sku,
        quantity: 5,
        unitCost: p.cost,
        total: p.cost * 5,
      }));
      const subtotal2 = purchaseItems2.reduce((sum, item) => sum + item.total, 0);
      const tax2 = subtotal2 * 0.085;
      const total2 = subtotal2 + tax2;

      await Purchase.findOneAndUpdate(
        { purchaseNumber: 'PO240120-0002' },
        {
          purchaseNumber: 'PO240120-0002',
          supplierId: createdSuppliers[1]._id,
          supplierName: createdSuppliers[1].name,
          items: purchaseItems2,
          subtotal: subtotal2,
          tax: tax2,
          discount: 0,
          discountType: 'percentage',
          total: total2,
          userId: managerUser?._id || adminUser._id,
          expectedDate: new Date('2024-02-01'),
          notes: 'Seasonal clothing order',
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          paidAmount: 0,
        },
        { upsert: true, new: true }
      );

      // Purchase 3 - Received
      const purchaseItems3 = [
        { productId: sampleProducts[0]._id, productName: sampleProducts[0].name, sku: sampleProducts[0].sku, quantity: 20, unitCost: sampleProducts[0].cost, total: sampleProducts[0].cost * 20 },
        { productId: sampleProducts[1]._id, productName: sampleProducts[1].name, sku: sampleProducts[1].sku, quantity: 15, unitCost: sampleProducts[1].cost, total: sampleProducts[1].cost * 15 },
      ];
      const subtotal3 = purchaseItems3.reduce((sum, item) => sum + item.total, 0);
      const tax3 = subtotal3 * 0.085;
      const total3 = subtotal3 + tax3;

      await Purchase.findOneAndUpdate(
        { purchaseNumber: 'PO240201-0003' },
        {
          purchaseNumber: 'PO240201-0003',
          supplierId: createdSuppliers[2]._id,
          supplierName: createdSuppliers[2].name,
          items: purchaseItems3,
          subtotal: subtotal3,
          tax: tax3,
          discount: 0,
          discountType: 'percentage',
          total: total3,
          userId: adminUser._id,
          expectedDate: new Date('2024-02-05'),
          receivedDate: new Date('2024-02-03'),
          notes: 'Food & beverages restock',
          status: 'RECEIVED',
          paymentStatus: 'PARTIAL',
          paidAmount: total3 * 0.5,
        },
        { upsert: true, new: true }
      );
      console.log('Sample purchases created');
    }

    // Create sample sales
    const sampleProductsForSales = await Product.find({ isActive: true }).limit(20).lean();
    const sampleCustomer = await Customer.findOne({ email: 'walkin@test.com' });
    if (!sampleCustomer) {
      const walkInCustomer = await Customer.create({
        name: 'Walk-in Customer',
        email: 'walkin@test.com',
        phone: 'N/A',
        totalSpent: 0,
        loyaltyPoints: 0,
        visitCount: 0,
      });
      console.log('Sample customer created');
    }

    const walkInCust = await Customer.findOne({ email: 'walkin@test.com' }).lean();
    if (sampleProductsForSales.length > 0 && adminUser) {
      // Sale 1
      const sale1Items = sampleProductsForSales.slice(0, 3).map(p => ({
        productId: p._id,
        productName: p.name,
        sku: p.sku,
        quantity: 2,
        price: p.price,
        cost: p.cost,
        total: p.price * 2,
      }));
      const subtotal1 = sale1Items.reduce((sum, i) => sum + i.total, 0);
      const tax1 = subtotal1 * 0.085;
      const total1 = subtotal1 + tax1;

      await Sale.findOneAndUpdate(
        { saleNumber: 'SAL240920-0001' },
        {
          saleNumber: 'SAL240920-0001',
          userId: adminUser._id,
          items: sale1Items,
          subtotal: subtotal1,
          tax: tax1,
          discount: 0,
          discountType: 'percentage',
          total: total1,
          paymentMethod: 'CARD',
          status: 'COMPLETED',
          customerId: walkInCust?._id,
          notes: 'Regular customer purchase',
        },
        { upsert: true, new: true, timestamps: { createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 86400000) } }
      );

      // Sale 2
      const sale2Items = sampleProductsForSales.slice(2, 5).map(p => ({
        productId: p._id,
        productName: p.name,
        sku: p.sku,
        quantity: 1,
        price: p.price,
        cost: p.cost,
        total: p.price,
      }));
      const subtotal2 = sale2Items.reduce((sum, i) => sum + i.total, 0);
      const tax2 = subtotal2 * 0.085;
      const total2 = subtotal2 + tax2;

      await Sale.findOneAndUpdate(
        { saleNumber: 'SAL240921-0002' },
        {
          saleNumber: 'SAL240921-0002',
          userId: adminUser._id,
          items: sale2Items,
          subtotal: subtotal2,
          tax: tax2,
          discount: subtotal2 * 0.1,
          discountType: 'percentage',
          total: total2 - subtotal2 * 0.1,
          paymentMethod: 'CASH',
          status: 'COMPLETED',
          customerId: walkInCust?._id,
          notes: 'Walk-in customer',
        },
        { upsert: true, new: true, timestamps: { createdAt: new Date(Date.now() - 172800000), updatedAt: new Date(Date.now() - 172800000) } }
      );
      console.log('Sample sales created');
    }

    // Create sample returns
    const sales = await Sale.find({ status: 'COMPLETED' }).limit(5).lean();
    if (sales.length > 0 && adminUser) {
      const sale = sales[0];
      const returnItems = sale.items.slice(0, 2).map(item => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        saleId: sale._id,
        saleNumber: sale.saleNumber,
        quantity: Math.min(2, item.quantity),
        price: item.price,
        total: item.price * Math.min(2, item.quantity),
        reason: 'Customer changed mind',
      }));

      const returnSubtotal = returnItems.reduce((sum, item) => sum + item.total, 0);
      const returnTax = returnSubtotal * (sale.tax / sale.subtotal);
      const returnTotal = returnSubtotal + returnTax;

      await Return.findOneAndUpdate(
        { returnNumber: 'RET240120-0001' },
        {
          returnNumber: 'RET240120-0001',
          saleId: sale._id,
          saleNumber: sale.saleNumber,
          customerId: sale.customerId,
          customerName: sale.customerId ? 'John Customer' : undefined,
          items: returnItems,
          subtotal: returnSubtotal,
          tax: returnTax,
          total: returnTotal,
          refundMethod: 'ORIGINAL',
          userId: adminUser._id,
          notes: 'Return within 30-day policy',
          status: 'COMPLETED',
        },
        { upsert: true, new: true }
      );

      // Another pending return
      if (sales.length > 1) {
        const sale2 = sales[1];
        const returnItems2 = sale2.items.slice(0, 1).map(item => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          saleId: sale2._id,
          saleNumber: sale2.saleNumber,
          quantity: 1,
          price: item.price,
          total: item.price,
          reason: 'Defective product',
        }));

        const returnSubtotal2 = returnItems2.reduce((sum, item) => sum + item.total, 0);
        const returnTax2 = returnSubtotal2 * (sale2.tax / sale2.subtotal);
        const returnTotal2 = returnSubtotal2 + returnTax2;

        await Return.findOneAndUpdate(
          { returnNumber: 'RET240125-0002' },
          {
            returnNumber: 'RET240125-0002',
            saleId: sale2._id,
            saleNumber: sale2.saleNumber,
            customerId: sale2.customerId,
            customerName: sale2.customerId ? 'Jane Customer' : undefined,
            items: returnItems2,
            subtotal: returnSubtotal2,
            tax: returnTax2,
            total: returnTotal2,
            refundMethod: 'STORE_CREDIT',
            userId: adminUser._id,
            notes: 'Product defective - store credit issued',
            status: 'PENDING',
          },
          { upsert: true, new: true }
        );
      }
      console.log('Sample returns created');
    }

    // Create sample notifications
    if (adminUser) {
      const notifications = [
        {
          userId: adminUser._id,
          title: 'Welcome to Smart POS!',
          message: 'Your Smart POS system is ready to use. Start by adding products and making your first sale.',
          type: 'INFO',
          isRead: false,
          relatedEntity: 'USER',
        },
        {
          userId: adminUser._id,
          title: 'Low Stock Alert',
          message: 'iPhone 15 Pro is running low (5 units remaining). Consider placing a purchase order.',
          type: 'LOW_STOCK',
          isRead: false,
          relatedEntity: 'PRODUCT',
          relatedEntityId: sampleProducts[0]?._id,
          actionUrl: '/dashboard/inventory',
        },
        {
          userId: adminUser._id,
          title: 'New Purchase Order',
          message: 'Purchase order PO240120-0002 has been created for FashionWholesale Co.',
          type: 'PURCHASE_RECEIVED',
          isRead: false,
          relatedEntity: 'PURCHASE',
          actionUrl: '/dashboard/purchases',
        },
        {
          userId: adminUser._id,
          title: 'Payment Due',
          message: 'TechDistributors Inc. has $15,000 due. Payment terms: Net 30.',
          type: 'PAYMENT_DUE',
          isRead: false,
          relatedEntity: 'SUPPLIER',
          relatedEntityId: createdSuppliers[0]?._id,
          actionUrl: '/dashboard/suppliers',
        },
        {
          userId: adminUser._id,
          title: 'Return Request',
          message: 'New return request RET240125-0002 for sale SAL240115-0001',
          type: 'RETURN_REQUEST',
          isRead: true,
          readAt: new Date(Date.now() - 86400000),
          relatedEntity: 'RETURN',
          actionUrl: '/dashboard/returns',
        },
        {
          userId: adminUser._id,
          title: 'Sale Completed',
          message: 'Sale #SAL240115-0001 completed for $1,299.98',
          type: 'NEW_ORDER',
          isRead: true,
          readAt: new Date(Date.now() - 172800000),
          relatedEntity: 'SALE',
          relatedEntityId: sales[0]?._id,
          actionUrl: '/sales',
        },
      ];

      for (const notif of notifications) {
        await Notification.findOneAndUpdate(
          { userId: notif.userId, title: notif.title, createdAt: { $gte: new Date(Date.now() - 86400000 * 30) } },
          notif,
          { upsert: true, new: true }
        );
      }
      console.log('Sample notifications created');
    }

    // Create sample activity logs
    if (adminUser) {
      const activityLogs = [
        {
          userId: adminUser._id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          action: 'LOGIN',
          entity: 'USER',
          entityId: adminUser._id,
          entityName: adminUser.name,
          details: 'User logged in from dashboard',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          userId: adminUser._id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          action: 'CREATE_PRODUCT',
          entity: 'PRODUCT',
          entityId: sampleProducts[0]?._id,
          entityName: sampleProducts[0]?.name,
          details: 'Created new product: iPhone 15 Pro',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 7200000),
        },
        {
          userId: adminUser._id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          action: 'CREATE_PURCHASE',
          entity: 'PURCHASE',
          entityId: (await Purchase.findOne({ purchaseNumber: 'PO240115-0001' }).lean())?._id,
          entityName: 'PO240115-0001',
          details: 'Created purchase order PO240115-0001 for supplier TechDistributors Inc.',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 10800000),
        },
        {
          userId: adminUser._id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          action: 'RECEIVE_PURCHASE',
          entity: 'PURCHASE',
          entityId: (await Purchase.findOne({ purchaseNumber: 'PO240115-0001' }).lean())?._id,
          entityName: 'PO240115-0001',
          details: 'Received purchase PO240115-0001 from TechDistributors Inc.',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 14400000),
        },
        {
          userId: adminUser._id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          action: 'CREATE_SALE',
          entity: 'SALE',
          entityId: sales[0]?._id,
          entityName: sales[0]?.saleNumber,
          details: `Completed sale ${sales[0]?.saleNumber} for $${sales[0]?.total?.toFixed(2)}`,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 18000000),
        },
        {
          userId: adminUser._id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          action: 'CREATE_RETURN',
          entity: 'RETURN',
          entityId: (await Return.findOne({ returnNumber: 'RET240120-0001' }).lean())?._id,
          entityName: 'RET240120-0001',
          details: 'Created return RET240120-0001 for sale SAL240115-0001',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 21600000),
        },
        {
          userId: adminUser._id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          action: 'CREATE_SUPPLIER',
          entity: 'SUPPLIER',
          entityId: createdSuppliers[0]?._id,
          entityName: createdSuppliers[0]?.name,
          details: 'Added new supplier: TechDistributors Inc.',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 25200000),
        },
        {
          userId: adminUser._id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          action: 'UPDATE_SETTINGS',
          entity: 'SETTINGS',
          entityId: 'settings',
          entityName: 'Store Settings',
          details: 'Updated tax rate to 8.5%',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - 28800000),
        },
      ];

      for (const log of activityLogs) {
        await ActivityLog.findOneAndUpdate(
          { userId: log.userId, action: log.action, entity: log.entity, entityId: log.entityId, createdAt: { $gte: new Date(Date.now() - 86400000 * 30) } },
          log,
          { upsert: true, new: true }
        );
      }
      console.log('Sample activity logs created');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();