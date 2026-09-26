# Smart POS - Inventory & Point of Sale System

A modern, full-featured Point of Sale (POS) system built with Next.js 15, MongoDB, and Tailwind CSS. Designed for retail businesses to manage sales, inventory, customers, and analytics.

## Features

### 🛒 Point of Sale
- Intuitive product grid with search and category filtering
- Real-time cart with quantity management
- Multiple payment methods (Cash, Card, Mobile, Other)
- Discount support (percentage and fixed amount)
- Tax calculation
- Customer association
- Receipt generation

### 📦 Inventory Management
- Product CRUD operations (Create, Read, Update, Delete)
- SKU and barcode tracking
- Stock level monitoring with low-stock alerts
- Category organization
- Product images support
- Cost and price tracking for margin analysis

### 👥 Customer Management
- Customer profiles with contact information
- Purchase history tracking
- Loyalty points system
- Total spent and visit count analytics

### 📊 Sales & Analytics
- Sales history with filtering and pagination
- Daily revenue trends
- Top-selling products
- Sales by category and payment method
- Average order value
- Unique customer tracking

### ⚙️ Settings
- Store configuration (name, tax rate, currency)
- Receipt customization
- Theme support (Light/Dark/System)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB with Mongoose ODM
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Language**: JavaScript (ES Modules)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd smart-pos
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your MongoDB connection in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/smart-pos
```

5. Seed the database with sample data:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login
After seeding, you can log in with:
- **Email**: admin@smartpos.com
- **Password**: admin123

## Project Structure

```
smart-pos/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── products/      # Product endpoints
│   │   │   ├── categories/    # Category endpoints
│   │   │   ├── sales/         # Sales endpoints
│   │   │   ├── customers/     # Customer endpoints
│   │   │   ├── settings/      # Settings endpoints
│   │   │   └── reports/       # Reports/analytics endpoints
│   │   ├── products/          # Products management page
│   │   ├── sales/             # Sales history page
│   │   ├── customers/         # Customers page
│   │   ├── settings/          # Settings page
│   │   ├── reports/           # Analytics dashboard
│   │   ├── layout.js          # Root layout
│   │   ├── page.jsx           # Main POS page
│   │   ├── globals.css        # Global styles
│   │   └── providers.jsx      # Context providers
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── DropdownMenu.jsx
│   │   ├── pos/              # POS-specific components
│   │   │   ├── ProductGrid.jsx
│   │   │   └── Cart.jsx
│   │   └── layout/           # Layout components
│   │       ├── Header.jsx
│   │       └── Sidebar.jsx
│   ├── lib/
│   │   ├── db.js             # MongoDB connection
│   │   └── utils.js          # Utility functions
│   ├── models/               # Mongoose models
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Sale.js
│   │   ├── Customer.js
│   │   ├── Settings.js
│   │   └── index.js
│   └── stores/
│       └── posStore.js       # Zustand stores
├── scripts/
│   └── seed.js               # Database seeding script
├── public/                   # Static assets
├── package.json
├── next.config.mjs
├── jsconfig.json
├── .env.example
└── README.md
```

## API Endpoints

### Products
- `GET /api/products` - List products (with search, filter, pagination)
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Sales
- `GET /api/sales` - List sales (with filters, pagination)
- `POST /api/sales` - Create sale (processes payment, updates inventory)
- `GET /api/sales/:id` - Get sale details
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Customers
- `GET /api/customers` - List customers (with search, pagination)
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Settings
- `GET /api/settings` - Get store settings
- `PUT /api/settings` - Update store settings

### Reports
- `GET /api/reports` - Get analytics data (summary, trends, top products, etc.)

## Data Models

### Product
- name, description, sku (unique), barcode (unique)
- price, cost, stock, minStock
- categoryId (ref), imageUrl, isActive

### Category
- name (unique), description

### Sale
- saleNumber (unique), userId (ref), items[]
- subtotal, tax, discount, discountType, total
- paymentMethod, status, customerId (ref), notes

### Customer
- name, email, phone, address
- loyaltyPoints, totalSpent, visitCount, lastVisit

### Settings (Singleton)
- storeName, taxRate, currency, receiptFooter

### User
- email (unique), name, passwordHash, role (ADMIN/MANAGER/CASHIER)

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and feature requests, please open a GitHub issue.