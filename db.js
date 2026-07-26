const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Determine writable data directory (use /tmp on serverless environments like Vercel)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const LOCAL_DATA_DIR = path.join(__dirname, 'data');
const DATA_DIR = isServerless ? path.join('/tmp', 'data') : LOCAL_DATA_DIR;
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');

// Ensure data directory and files exist
function initDB() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        
        const localUsers = path.join(LOCAL_DATA_DIR, 'users.json');
        if (!fs.existsSync(USERS_FILE)) {
            const initialUsers = fs.existsSync(localUsers) ? fs.readFileSync(localUsers, 'utf8') : JSON.stringify([]);
            fs.writeFileSync(USERS_FILE, initialUsers);
        }
        
        const localFavorites = path.join(LOCAL_DATA_DIR, 'favorites.json');
        if (!fs.existsSync(FAVORITES_FILE)) {
            const initialFavs = fs.existsSync(localFavorites) ? fs.readFileSync(localFavorites, 'utf8') : JSON.stringify([]);
            fs.writeFileSync(FAVORITES_FILE, initialFavs);
        }
    } catch (err) {
        console.warn('DB initialization warning:', err.message);
    }
}

initDB();

// Helper to hash password using SHA-256 (pure JS, no compile-time dependency)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// User methods
function getUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function registerUser(username, password) {
    const users = getUsers();
    const cleanUsername = username.trim().toLowerCase();
    
    if (users.some(u => u.username === cleanUsername)) {
        throw new Error('Username already exists');
    }

    const newUser = {
        id: crypto.randomUUID(),
        username: cleanUsername,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    
    // Return user without password hash
    const { passwordHash, ...userResponse } = newUser;
    return userResponse;
}

function loginUser(username, password) {
    const users = getUsers();
    const cleanUsername = username.trim().toLowerCase();
    const user = users.find(u => u.username === cleanUsername);

    if (!user) {
        throw new Error('Invalid username or password');
    }

    const hash = hashPassword(password);
    if (user.passwordHash !== hash) {
        throw new Error('Invalid username or password');
    }

    const { passwordHash, ...userResponse } = user;
    return userResponse;
}

// Favorites methods
function getFavorites() {
    try {
        const data = fs.readFileSync(FAVORITES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveFavorites(favorites) {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2), 'utf8');
}

function getUserFavorites(userId) {
    const favorites = getFavorites();
    return favorites.filter(f => f.userId === userId);
}

function addFavorite(userId, item) {
    const favorites = getFavorites();
    
    // Prevent duplicates for the same user
    const exists = favorites.some(f => f.userId === userId && f.id === item.id);
    if (exists) {
        throw new Error('This country is already in your favorites');
    }

    const newFavorite = {
        favoriteId: crypto.randomUUID(),
        userId,
        id: item.id, // country common name or code
        title: item.title,
        description: item.description,
        image: item.image,
        category: item.category || 'General',
        date: item.date || new Date().toLocaleDateString(),
        notes: item.notes || '',
        travelDate: item.travelDate || '',
        createdAt: new Date().toISOString()
    };

    favorites.push(newFavorite);
    saveFavorites(favorites);
    return newFavorite;
}

function updateFavorite(userId, favoriteId, updates) {
    const favorites = getFavorites();
    const index = favorites.findIndex(f => f.favoriteId === favoriteId && f.userId === userId);

    if (index === -1) {
        throw new Error('Favorite item not found or unauthorized');
    }

    // Allow updating notes and travelDate
    favorites[index] = {
        ...favorites[index],
        notes: updates.notes !== undefined ? updates.notes : favorites[index].notes,
        travelDate: updates.travelDate !== undefined ? updates.travelDate : favorites[index].travelDate,
        updatedAt: new Date().toISOString()
    };

    saveFavorites(favorites);
    return favorites[index];
}

function deleteFavorite(userId, favoriteId) {
    const favorites = getFavorites();
    const index = favorites.findIndex(f => f.favoriteId === favoriteId && f.userId === userId);

    if (index === -1) {
        throw new Error('Favorite item not found or unauthorized');
    }

    favorites.splice(index, 1);
    saveFavorites(favorites);
    return { success: true };
}

function clearUserFavorites(userId) {
    let favorites = getFavorites();
    favorites = favorites.filter(f => f.userId !== userId);
    saveFavorites(favorites);
    return { success: true };
}

module.exports = {
    registerUser,
    loginUser,
    getUserFavorites,
    addFavorite,
    updateFavorite,
    deleteFavorite,
    clearUserFavorites
};
