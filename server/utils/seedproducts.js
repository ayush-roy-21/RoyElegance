const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Floral Embroidered Kurti',
    description: 'Elegant floral embroidery on soft cotton fabric. Perfect for festive and casual occasions.',
    price: 1299,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['floral', 'embroidered', 'cotton', 'festive'],
    category: null, // Set this to a valid category ObjectId if you have categories
    stockQuantity: 20,
    featured: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Pink', 'White'],
  },
  {
    name: 'Silk Anarkali Kurti',
    description: 'Luxurious silk Anarkali with golden zari work. A timeless classic for special events.',
    price: 1599,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['silk', 'anarkali', 'zari', 'party'],
    category: null,
    stockQuantity: 15,
    featured: false,
    sizes: ['M', 'L', 'XL'],
    colors: ['Blue', 'Gold'],
  },
  {
    name: 'Cotton Printed Kurti',
    description: 'Breathable cotton kurti with vibrant prints. Ideal for daily wear and summer comfort.',
    price: 899,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['cotton', 'printed', 'casual', 'summer'],
    category: null,
    stockQuantity: 30,
    featured: false,
    sizes: ['S', 'M', 'L'],
    colors: ['Yellow', 'Green'],
  },
  {
    name: 'Designer Embroidered Kurti',
    description: 'Premium designer kurti with intricate embroidery and modern silhouette.',
    price: 2199,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['designer', 'embroidered', 'premium'],
    category: null,
    stockQuantity: 10,
    featured: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Red', 'Black'],
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roys-elegance', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Optionally clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${inserted.length} products!`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedProducts();
