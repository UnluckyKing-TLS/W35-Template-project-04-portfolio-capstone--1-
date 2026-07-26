const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'destinara-super-secret-key-12345';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend files
app.use(express.static(__dirname));

// Authentication Middleware
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            req.user = null;
            res.clearCookie('token');
        } else {
            req.user = decoded;
        }
        next();
    });
}

function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized. Please sign up or log in first.' });
    }
    next();
}

app.use(authenticateToken);

// ===================================
// Authentication Endpoints
// ===================================

app.post('/api/auth/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || username.trim() === '' || password.trim() === '') {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const newUser = db.registerUser(username, password);
        // Automatically log in user after signup
        const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 }); // 24 hours
        return res.status(201).json(newUser);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = db.loginUser(username, password);
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 }); // 24 hours
        return res.json(user);
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.json({ user: req.user });
});

// ===================================
// Favorites CRUD Endpoints
// ===================================

// 1. Read
app.get('/api/favorites', requireAuth, (req, res) => {
    try {
        const favorites = db.getUserFavorites(req.user.id);
        return res.json(favorites);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve favorites' });
    }
});

// 2. Write / Create
app.post('/api/favorites', requireAuth, (req, res) => {
    const item = req.body;
    if (!item || !item.id || !item.title) {
        return res.status(400).json({ error: 'Invalid country item data. ID and title are required.' });
    }

    try {
        const newFav = db.addFavorite(req.user.id, item);
        return res.status(201).json(newFav);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// 3. Update
app.put('/api/favorites/:id', requireAuth, (req, res) => {
    const favoriteId = req.params.id;
    const { notes, travelDate } = req.body;

    try {
        const updated = db.updateFavorite(req.user.id, favoriteId, { notes, travelDate });
        return res.json(updated);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// 4. Delete
app.delete('/api/favorites/:id', requireAuth, (req, res) => {
    const favoriteId = req.params.id;

    try {
        const result = db.deleteFavorite(req.user.id, favoriteId);
        return res.json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// Clear all
app.delete('/api/favorites', requireAuth, (req, res) => {
    try {
        const result = db.clearUserFavorites(req.user.id);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to clear favorites' });
    }
});

// ===================================
// 5. Custom Recommendation Endpoint
// ===================================
app.get('/api/recommendations', (req, res) => {
    // If user is logged in, recommend based on regions they favorited
    // If user has no favorites (or is public), recommend a preset of popular country destinations.
    let userFavorites = [];
    if (req.user) {
        userFavorites = db.getUserFavorites(req.user.id);
    }

    const popularDestinations = [
        { id: 'Japan', title: 'Japan', description: 'Land of the rising sun, blending ultra-modern cities with imperial palaces.', region: 'Asia', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop' },
        { id: 'France', title: 'France', description: 'Famous for its gastronomy, art museums, Eiffel Tower, and historical landmarks.', region: 'Europe', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop' },
        { id: 'Italy', title: 'Italy', description: 'Home to the Colosseum, Renaissance masterworks, and iconic pizza and pasta.', region: 'Europe', image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=500&auto=format&fit=crop' },
        { id: 'Australia', title: 'Australia', description: 'Known for its Great Barrier Reef, diverse wildlife, and beautiful coastlines.', region: 'Oceania', image: 'https://images.unsplash.com/photo-1523482596682-cd93a6e54520?w=500&auto=format&fit=crop' },
        { id: 'Brazil', title: 'Brazil', description: 'Famous for its carnival, Amazon rainforest, and beautiful Copacabana beach.', region: 'Americas', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=500&auto=format&fit=crop' },
        { id: 'Egypt', title: 'Egypt', description: 'A country linking northeast Africa with the Middle East, dating to the time of the Pharaohs.', region: 'Africa', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=500&auto=format&fit=crop' }
    ];

    if (userFavorites.length === 0) {
        // Return overall popular recommendations
        return res.json(popularDestinations);
    }

    // Extract regions from favorites
    const favoritedRegions = [...new Set(userFavorites.map(f => f.category))]; // We will save region as category

    // Filter popularDestinations to match regions the user favorited but hasn't favorited the specific country yet
    const favoritedIds = userFavorites.map(f => f.id);
    let recommendations = popularDestinations.filter(d => 
        favoritedRegions.includes(d.region) && !favoritedIds.includes(d.id)
    );

    // If no matching recommendations, fallback to other items not yet favorited
    if (recommendations.length === 0) {
        recommendations = popularDestinations.filter(d => !favoritedIds.includes(d.id));
    }

    // If still empty (user favorited all 6 popular destinations), return all 6
    if (recommendations.length === 0) {
        recommendations = popularDestinations;
    }

    return res.json(recommendations.slice(0, 3)); // Return up to 3 recommendations
});

// Serve frontend routing for SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Destinara server is running at http://localhost:${PORT}`);
    });
}

module.exports = app;
