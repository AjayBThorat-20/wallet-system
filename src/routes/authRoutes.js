// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validateTokenRequest } = require('../middleware/validation');

router.post('/generate-token', validateTokenRequest, authController.generateJWTToken);

module.exports = router;
