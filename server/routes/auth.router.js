let router = require('express').Router();
let { login_handler, signup_handler, logout_handler, get_profile_handler, update_profile_handler, google_auth_handler } = require('../controllers/auth.controller');
let { loginvalidation, signupvalidation, googleValidation } = require('../middlewares/auth.validation');
let authMiddleware = require('../middlewares/auth');


router.post('/login', loginvalidation, login_handler);

router.post('/signup', signupvalidation, signup_handler);

router.post('/google', googleValidation, google_auth_handler);

router.post('/logout', logout_handler);

// Protected routes — requires valid JWT token
router.get('/me', authMiddleware, get_profile_handler);

router.put('/profile', authMiddleware, update_profile_handler);

module.exports = router;