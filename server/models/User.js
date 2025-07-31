const mongoose = require('mongoose');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, // Ensures no two users can share the same email
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true, 
    select: false // Excludes password from query results by default for security
  },
  phone: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  wishlist: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }
}, {
  // Mongoose option to automatically manage createdAt and updatedAt timestamps.
  // This adds `createdAt` and `updatedAt` fields to your documents.
  timestamps: true 
});

// Create and export the User model based on the schema
module.exports = mongoose.model('User', userSchema);

// CRITICAL FIX: The redundant mongoose.connect() call has been removed.
// The database connection is now correctly handled only once in your main app.js file.
