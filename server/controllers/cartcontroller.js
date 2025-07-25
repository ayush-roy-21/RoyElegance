const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images stockQuantity');
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    let subtotal = 0;
    let totalItems = 0;
    cart.items.forEach(item => {
      if (item.product) {
        subtotal += item.product.price * item.quantity;
        totalItems += item.quantity;
      }
    });
    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + shipping;
    res.json({
      success: true,
      data: { items: cart.items, subtotal, shipping, total, totalItems }
    });
  } catch (err) {
    console.error('Get cart error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }
    const { productId, quantity, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available' });
    }
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size && item.color === color
    );
    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock available' });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color });
    }
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price images stockQuantity');
    res.json({ success: true, message: 'Item added to cart successfully', data: populatedCart });
  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }
    const { quantity } = req.body;
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available' });
    }
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price images stockQuantity');
    res.json({ success: true, message: 'Cart updated successfully', data: populatedCart });
  } catch (err) {
    console.error('Update cart item error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    cart.items.splice(itemIndex, 1);
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price images stockQuantity');
    res.json({ success: true, message: 'Item removed from cart successfully', data: populatedCart });
  } catch (err) {
    console.error('Remove cart item error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    cart.items = [];
    await cart.save();
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Clear cart error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Process checkout and create order
// @route   POST /api/cart/checkout
// @access  Private
const checkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price stockQuantity');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    let subtotal = 0;
    let totalItems = 0;
    const orderItems = [];
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ success: false, message: 'Product not found' });
      }
      if (item.product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.product.name}` });
      }
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;
      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        total: itemTotal
      });
    }
    const shipping = subtotal > 999 ? 0 : 99;
    let discount = 0;
    if (couponCode && couponCode.toLowerCase() === 'welcome10') {
      discount = subtotal * 0.1;
    }
    const total = subtotal + shipping - discount;
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      subtotal,
      shipping,
      discount,
      total,
      totalItems,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'processing'
    });
    await order.save();
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stockQuantity: -item.quantity, salesCount: item.quantity } }
      );
    }
    cart.items = [];
    await cart.save();
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');
    res.json({ success: true, message: 'Order placed successfully', data: { order: populatedOrder, orderId: order._id } });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's wishlist
// @route   GET /api/cart/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price images');
    res.json({ success: true, data: user.wishlist || [] });
  } catch (err) {
    console.error('Get wishlist error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/cart/wishlist/add/:productId
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const user = await User.findById(req.user.id);
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    user.wishlist.push(productId);
    await user.save();
    const populatedUser = await User.findById(user._id).populate('wishlist', 'name price images');
    res.json({ success: true, message: 'Product added to wishlist successfully', data: populatedUser.wishlist });
  } catch (err) {
    console.error('Add to wishlist error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/cart/wishlist/remove/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    const populatedUser = await User.findById(user._id).populate('wishlist', 'name price images');
    res.json({ success: true, message: 'Product removed from wishlist successfully', data: populatedUser.wishlist });
  } catch (err) {
    console.error('Remove from wishlist error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's order history
// @route   GET /api/cart/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Get orders error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get specific order details
// @route   GET /api/cart/orders/:orderId
// @access  Private
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name images');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Get order details error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkout,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getOrders,
  getOrderDetails
};
