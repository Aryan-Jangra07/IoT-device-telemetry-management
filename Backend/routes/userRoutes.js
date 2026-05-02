const express = require('express');
const router = express.Router();
const { registerUser, loginUser, changePassword } = require('../controllers/userController');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
