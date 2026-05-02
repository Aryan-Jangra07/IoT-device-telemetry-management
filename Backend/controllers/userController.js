const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Explicit manual check for existing user returning 409
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Creating the user (password hashing is handled by Mongoose pre-save hook)
    const user = await User.create({ name, email, password, role });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    // Check for MongoDB duplication (error code 11000) race condition
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    // Check for Mongoose validation errors (e.g. required field somehow bypassed Zod)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid input data', details: error.message });
    }
    
    console.error('Registration Error:', error);
    // Real server errors yield a generic 500 without leaking stack traces
    res.status(500).json({ message: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user in MongoDB using email
    const user = await User.findOne({ email });
    if (!user) {
      // Return 401 for bad credentials (generic message for security)
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Password Validation
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. JWT Token Generation
    const token = generateToken(user._id, user.role);

    // 4. Response
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    // 5. Error Handling
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both old and new passwords.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook handles hashing

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error while changing password.' });
  }
};

module.exports = { registerUser, loginUser, changePassword };
