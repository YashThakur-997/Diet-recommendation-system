// This file is the controller for Wearables (Strava integration)
// It can be safely removed if you want to remove the feature.

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || 'dummy_client_id';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || 'dummy_client_secret';
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/api/wearables/strava/callback';

const getStravaAuthUrl = (req, res) => {
    // Generates the URL for Strava OAuth login
    // We pass the JWT token in the state parameter (or user ID), but for simplicity, we just use a basic state
    const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&approval_prompt=force&scope=read,activity:read_all`;
    res.json({ success: true, url });
};

const handleStravaCallback = async (req, res) => {
    const { code, state, error } = req.query;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (error) {
        return res.redirect(`${frontendUrl}/wearables?error=Access_Denied`);
    }

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        // Exchange code for token
        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();

        // In a real application, you would save data.access_token and data.refresh_token to the user's document in the DB.
        // For this implementation, we will redirect back to the frontend with a success flag

        res.redirect(`${frontendUrl}/wearables?strava_connected=true`);
    } catch (err) {
        console.error('Strava Callback Error:', err);
        res.redirect(`${frontendUrl}/wearables?error=Server_Error`);
    }
};

const getStravaStats = async (req, res) => {
    // This is a placeholder for fetching actual stats. 
    // In a real scenario, you'd fetch the user's access token from the DB and call Strava API via fetch.

    res.json({
        success: true,
        data: {
            connected: true, // Mocking that strava is connected if we hit this endpoint
            recentActivities: [
                { id: 1, name: 'Morning Run', distance: "5.2 km", date: new Date().toISOString().split('T')[0], calories: 320, type: 'Run' },
                { id: 2, name: 'Evening Cycling', distance: "15.4 km", date: new Date(Date.now() - 86400000).toISOString().split('T')[0], calories: 450, type: 'Ride' }
            ],
            totalDistance: "20.6 km"
        }
    });
};

const disconnectStrava = async (req, res) => {
    // Placeholder to remove tokens from DB
    res.json({ success: true, message: 'Strava disconnected successfully' });
};

module.exports = {
    getStravaAuthUrl,
    handleStravaCallback,
    getStravaStats,
    disconnectStrava
};
