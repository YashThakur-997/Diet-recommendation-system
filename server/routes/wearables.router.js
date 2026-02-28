// This file is the router for Wearables.
// It can be safely removed if you want to remove the feature.
const router = require('express').Router();
const { getStravaAuthUrl, handleStravaCallback, getStravaStats, disconnectStrava } = require('../controllers/wearables.controller');
const authMiddleware = require('../middlewares/auth');

// Auth URL generation (needs auth to know who is connecting)
router.get('/strava/auth-url', authMiddleware, getStravaAuthUrl);

// Callback is unprotected because Strava redirects here from their domain
router.get('/strava/callback', handleStravaCallback);

// Fetch stats (needs auth)
router.get('/strava/stats', authMiddleware, getStravaStats);

// Disconnect (needs auth)
router.post('/strava/disconnect', authMiddleware, disconnectStrava);

module.exports = router;
