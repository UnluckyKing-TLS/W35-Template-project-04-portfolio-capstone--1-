// W35 Project 04 — API Showcase Portfolio (capstone)
// Destinara: Global Location & Live Weather Travel Planner

// ===================================
// Configuration & State
// ===================================

const API_CONFIGS = {
    'locations-weather': {
        primary: {
            name: 'Location Explorer',
            baseUrl: 'https://nominatim.openstreetmap.org/search'
        },
        secondary: {
            name: 'Weather Forecast',
            baseUrl: 'https://api.open-meteo.com/v1/forecast'
        }
    },
    'news-weather': {
        primary: {
            name: 'News API',
            apiKey: 'YOUR_NEWSAPI_KEY',
            baseUrl: 'https://newsapi.org/v2/top-headlines',
            defaultParams: { country: 'us', pageSize: 10 }
        },
        secondary: {
            name: 'OpenWeatherMap',
            apiKey: 'YOUR_OPENWEATHERMAP_KEY',
            baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
            defaultParams: { units: 'metric' }
        }
    },
    'movie-tv': {
        primary: {
            name: 'TMDB Movies',
            apiKey: 'YOUR_TMDB_KEY',
            baseUrl: 'https://api.themoviedb.org/3/movie/popular'
        },
        secondary: {
            name: 'TMDB TV Shows',
            apiKey: 'YOUR_TMDB_KEY',
            baseUrl: 'https://api.themoviedb.org/3/tv/popular'
        }
    }
};

const state = {
    currentCombo: 'locations-weather',
    theme: 'light',
    view: 'grid',

    // User authentication state
    currentUser: null,

    // Primary API state (Locations)
    primaryData: [],
    primaryPage: 1,
    primaryTotalPages: 1,
    primaryFiltered: [],

    // Secondary API state (Weather)
    selectedLocation: null,
    secondaryData: null,
    secondaryPage: 1,
    secondaryTotalPages: 1,

    // Search & Filter state
    searchQuery: '',
    filterCategory: 'all',
    sortBy: 'name-asc',

    // Favorites synced with backend
    favorites: [],

    // Recommendations list
    recommendations: [],

    // Statistics
    stats: {
        itemsViewed: 0,
        searches: 0,
        cacheHits: 0,
        totalFavorites: 0
    }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache TTL

// Preset popular destinations to display on initial page load
const PRESET_DESTINATIONS = [
    { id: 'Paris', title: 'Paris', description: 'Paris, Île-de-France, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: 48.8566, Lon: 2.3522', lat: 48.8566, lon: 2.3522 },
    { id: 'Tokyo', title: 'Tokyo', description: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: 35.6895, Lon: 139.6917', lat: 35.6895, lon: 139.6917 },
    { id: 'London', title: 'London', description: 'Greater London, England, United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: 51.5074, Lon: -0.1278', lat: 51.5074, lon: -0.1278 },
    { id: 'NewYork', title: 'New York City', description: 'New York, United States', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: 40.7128, Lon: -74.0060', lat: 40.7128, lon: -74.0060 },
    { id: 'Rome', title: 'Rome', description: 'Roma, Lazio, Italy', image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: 41.9028, Lon: 12.4964', lat: 41.9028, lon: 12.4964 },
    { id: 'Sydney', title: 'Sydney', description: 'Sydney, New South Wales, Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: -33.8688, Lon: 151.2093', lat: -33.8688, lon: 151.2093 },
    { id: 'Cairo', title: 'Cairo', description: 'Cairo Governorate, Egypt', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: 30.0444, Lon: 31.2357', lat: 30.0444, lon: 31.2357 },
    { id: 'Rio', title: 'Rio de Janeiro', description: 'Rio de Janeiro, Southeast Region, Brazil', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: -22.9068, Lon: -43.1729', lat: -22.9068, lon: -43.1729 },
    { id: 'CapeTown', title: 'Cape Town', description: 'City of Cape Town, Western Cape, South Africa', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: -33.9249, Lon: 18.4241', lat: -33.9249, lon: 18.4241 },
    { id: 'Bangkok', title: 'Bangkok', description: 'Bangkok, Thailand', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&auto=format&fit=crop', category: 'City', date: 'Lat: 13.7563, Lon: 100.5018', lat: 13.7563, lon: 100.5018 }
];

// ===================================
// Location Image Helper
// ===================================

// Curated map of well-known cities/countries → specific Unsplash photo IDs
const LOCATION_IMAGE_MAP = {
    // Cities
    'paris':          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop',
    'tokyo':          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop',
    'london':         'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop',
    'new york':       'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop',
    'new york city':  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop',
    'rome':           'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400&auto=format&fit=crop',
    'sydney':         'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&auto=format&fit=crop',
    'cairo':          'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&auto=format&fit=crop',
    'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&auto=format&fit=crop',
    'rio':            'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&auto=format&fit=crop',
    'cape town':      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&auto=format&fit=crop',
    'bangkok':        'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&auto=format&fit=crop',
    'dubai':          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&auto=format&fit=crop',
    'singapore':      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&auto=format&fit=crop',
    'barcelona':      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&auto=format&fit=crop',
    'madrid':         'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&auto=format&fit=crop',
    'amsterdam':      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&auto=format&fit=crop',
    'berlin':         'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=400&auto=format&fit=crop',
    'vienna':         'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&auto=format&fit=crop',
    'prague':         'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400&auto=format&fit=crop',
    'budapest':       'https://images.unsplash.com/photo-1541343672885-9be56236302a?w=400&auto=format&fit=crop',
    'istanbul':       'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&auto=format&fit=crop',
    'athens':         'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&auto=format&fit=crop',
    'lisbon':         'https://images.unsplash.com/photo-1558642891-54be180ea339?w=400&auto=format&fit=crop',
    'mexico city':    'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=400&auto=format&fit=crop',
    'los angeles':    'https://images.unsplash.com/photo-1580655653885-65763b2597d1?w=400&auto=format&fit=crop',
    'chicago':        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&auto=format&fit=crop',
    'toronto':        'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=400&auto=format&fit=crop',
    'vancouver':      'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=400&auto=format&fit=crop',
    'seoul':          'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&auto=format&fit=crop',
    'beijing':        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&auto=format&fit=crop',
    'shanghai':       'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&auto=format&fit=crop',
    'hong kong':      'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&auto=format&fit=crop',
    'mumbai':         'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&auto=format&fit=crop',
    'delhi':          'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&auto=format&fit=crop',
    'new delhi':      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&auto=format&fit=crop',
    'moscow':         'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&auto=format&fit=crop',
    'nairobi':        'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&auto=format&fit=crop',
    'lagos':          'https://images.unsplash.com/photo-1555436169-d1f1e8f69c25?w=400&auto=format&fit=crop',
    'buenos aires':   'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400&auto=format&fit=crop',
    'lima':           'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=400&auto=format&fit=crop',
    'bogota':         'https://images.unsplash.com/photo-1618842676088-c4d48a6a7571?w=400&auto=format&fit=crop',
    'kuala lumpur':   'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&auto=format&fit=crop',
    'jakarta':        'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=400&auto=format&fit=crop',
    'manila':         'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&auto=format&fit=crop',
    'hanoi':          'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=400&auto=format&fit=crop',
    'ho chi minh':    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&auto=format&fit=crop',
    'taipei':         'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&auto=format&fit=crop',
    'osaka':          'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=400&auto=format&fit=crop',
    'kyoto':          'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&auto=format&fit=crop',
    'milan':          'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=400&auto=format&fit=crop',
    'florence':       'https://images.unsplash.com/photo-1541370976299-4d24be63e9d7?w=400&auto=format&fit=crop',
    'venice':         'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&auto=format&fit=crop',
    'zurich':         'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&auto=format&fit=crop',
    'geneva':         'https://images.unsplash.com/photo-1574890398829-0cb521c5d0ec?w=400&auto=format&fit=crop',
    'brussels':       'https://images.unsplash.com/photo-1559113202-c916b8e44373?w=400&auto=format&fit=crop',
    'stockholm':      'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&auto=format&fit=crop',
    'oslo':           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop',
    'copenhagen':     'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&auto=format&fit=crop',
    'helsinki':       'https://images.unsplash.com/photo-1559478028-4d77e70edcac?w=400&auto=format&fit=crop',
    'warsaw':         'https://images.unsplash.com/photo-1520339842819-3dbb0b6e95cf?w=400&auto=format&fit=crop',
    'kiev':           'https://images.unsplash.com/photo-1545507343-4706b1374e1f?w=400&auto=format&fit=crop',
    'kyiv':           'https://images.unsplash.com/photo-1545507343-4706b1374e1f?w=400&auto=format&fit=crop',
    'riyadh':         'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=400&auto=format&fit=crop',
    'tehran':         'https://images.unsplash.com/photo-1570789218027-7ee2cf7cde2e?w=400&auto=format&fit=crop',
    'abu dhabi':      'https://images.unsplash.com/photo-1547480053-7d174f67b557?w=400&auto=format&fit=crop',
    'doha':           'https://images.unsplash.com/photo-1562697026-c87bf3a4e07a?w=400&auto=format&fit=crop',
    'accra':          'https://images.unsplash.com/photo-1606395955730-eb8a82e5eef4?w=400&auto=format&fit=crop',
    'casablanca':     'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&auto=format&fit=crop',
    'marrakech':      'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&auto=format&fit=crop',
    'addis ababa':    'https://images.unsplash.com/photo-1566096650255-98ba9c35c3f6?w=400&auto=format&fit=crop',
    'johannesburg':   'https://images.unsplash.com/photo-1575916285888-16a98fd9a57b?w=400&auto=format&fit=crop',
    'bali':           'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop',
    'phuket':         'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&auto=format&fit=crop',
    'maldives':       'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&auto=format&fit=crop',
    'santorini':      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&auto=format&fit=crop',
    'machu picchu':   'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&auto=format&fit=crop',
    'havana':         'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=400&auto=format&fit=crop',
    'edinburgh':      'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=400&auto=format&fit=crop',
    'dublin':         'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&auto=format&fit=crop',
    // Countries
    'japan':          'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&auto=format&fit=crop',
    'france':         'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop',
    'italy':          'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&auto=format&fit=crop',
    'australia':      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&auto=format&fit=crop',
    'brazil':         'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&auto=format&fit=crop',
    'egypt':          'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&auto=format&fit=crop',
    'germany':        'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=400&auto=format&fit=crop',
    'spain':          'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&auto=format&fit=crop',
    'china':          'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&auto=format&fit=crop',
    'india':          'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&auto=format&fit=crop',
    'usa':            'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop',
    'united states':  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop',
    'canada':         'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=400&auto=format&fit=crop',
    'mexico':         'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=400&auto=format&fit=crop',
    'south africa':   'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&auto=format&fit=crop',
    'united kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop',
    'uk':             'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop',
    'russia':         'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&auto=format&fit=crop',
    'turkey':         'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&auto=format&fit=crop',
    'thailand':       'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&auto=format&fit=crop',
    'indonesia':      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop',
    'malaysia':       'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&auto=format&fit=crop',
    'vietnam':        'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=400&auto=format&fit=crop',
    'philippines':    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&auto=format&fit=crop',
    'south korea':    'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&auto=format&fit=crop',
    'korea':          'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&auto=format&fit=crop',
    'netherlands':    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&auto=format&fit=crop',
    'portugal':       'https://images.unsplash.com/photo-1558642891-54be180ea339?w=400&auto=format&fit=crop',
    'greece':         'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&auto=format&fit=crop',
    'switzerland':    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&auto=format&fit=crop',
    'austria':        'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&auto=format&fit=crop',
    'poland':         'https://images.unsplash.com/photo-1520339842819-3dbb0b6e95cf?w=400&auto=format&fit=crop',
    'ukraine':        'https://images.unsplash.com/photo-1545507343-4706b1374e1f?w=400&auto=format&fit=crop',
    'colombia':       'https://images.unsplash.com/photo-1618842676088-c4d48a6a7571?w=400&auto=format&fit=crop',
    'peru':           'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&auto=format&fit=crop',
    'argentina':      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400&auto=format&fit=crop',
    'kenya':          'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&auto=format&fit=crop',
    'nigeria':        'https://images.unsplash.com/photo-1555436169-d1f1e8f69c25?w=400&auto=format&fit=crop',
    'ghana':          'https://images.unsplash.com/photo-1606395955730-eb8a82e5eef4?w=400&auto=format&fit=crop',
    'ethiopia':       'https://images.unsplash.com/photo-1566096650255-98ba9c35c3f6?w=400&auto=format&fit=crop',
    'morocco':        'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&auto=format&fit=crop',
    'saudi arabia':   'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=400&auto=format&fit=crop',
    'uae':            'https://images.unsplash.com/photo-1547480053-7d174f67b557?w=400&auto=format&fit=crop',
    'qatar':          'https://images.unsplash.com/photo-1562697026-c87bf3a4e07a?w=400&auto=format&fit=crop',
    'iran':           'https://images.unsplash.com/photo-1570789218027-7ee2cf7cde2e?w=400&auto=format&fit=crop',
    'cuba':           'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=400&auto=format&fit=crop',
    'scotland':       'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=400&auto=format&fit=crop',
    'ireland':        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&auto=format&fit=crop',
    'new zealand':    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&auto=format&fit=crop',
    'iceland':        'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=400&auto=format&fit=crop',
    'norway':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop',
    'sweden':         'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&auto=format&fit=crop',
    'denmark':        'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&auto=format&fit=crop',
    'finland':        'https://images.unsplash.com/photo-1559478028-4d77e70edcac?w=400&auto=format&fit=crop',
};

/**
 * Returns a curated Unsplash image URL for a given location name.
 * Falls back to a keyword-based Unsplash Source URL for unknown locations.
 */
function getLocationImage(locationName) {
    if (!locationName) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&auto=format&fit=crop';
    const key = locationName.toLowerCase().trim();

    // 1. Exact match
    if (LOCATION_IMAGE_MAP[key]) return LOCATION_IMAGE_MAP[key];

    // 2. Partial match — check if any known place name is a substring of the query
    for (const [place, url] of Object.entries(LOCATION_IMAGE_MAP)) {
        if (key.includes(place) || place.includes(key)) return url;
    }

    // 3. Generic fallback using Unsplash keyword search on the location name
    const encoded = encodeURIComponent(locationName + ' city landmark travel');
    return `https://source.unsplash.com/400x280/?${encoded}`;
}

// ===================================
// Cache Management (TODO 5)
// ===================================
class CacheManager {
    static get(key) {
        const cached = localStorage.getItem('cache_' + key);
        if (!cached) return null;
        try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                state.stats.cacheHits++;
                updateStats();
                console.log(`Cache Hit for key: ${key}`);
                return parsed.data;
            }
            localStorage.removeItem('cache_' + key);
            return null;
        } catch (e) {
            return null;
        }
    }

    static set(key, data) {
        try {
            const payload = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem('cache_' + key, JSON.stringify(payload));
        } catch (e) {
            console.error('Cache write failed:', e);
        }
    }

    static clearAll() {
        Object.keys(localStorage)
            .filter(key => key.startsWith('cache_'))
            .forEach(key => localStorage.removeItem(key));
    }
}

// ===================================
// TMDB & News/Weather API Helpers & Mock Database
// ===================================

function hasNewsKey() {
    const key = API_CONFIGS['news-weather'].primary.apiKey;
    return key && key !== 'YOUR_NEWSAPI_KEY' && key.trim() !== '';
}

function hasOpenWeatherKey() {
    const key = API_CONFIGS['news-weather'].secondary.apiKey;
    return key && key !== 'YOUR_OPENWEATHERMAP_KEY' && key.trim() !== '';
}

function extractCityFromText(title, description) {
    const combinedText = `${title || ''} ${description || ''}`.toLowerCase();
    const cities = [
        'paris', 'tokyo', 'london', 'new york', 'rome', 'sydney', 'cairo', 
        'rio de janeiro', 'rio', 'cape town', 'bangkok', 'dubai', 'singapore', 
        'barcelona', 'madrid', 'amsterdam', 'berlin', 'vienna', 'prague', 
        'budapest', 'istanbul', 'athens', 'lisbon', 'mexico city', 'los angeles', 
        'chicago', 'toronto', 'vancouver', 'seoul', 'beijing', 'shanghai', 
        'hong kong', 'mumbai', 'delhi', 'new delhi', 'moscow', 'nairobi', 
        'lagos', 'buenos aires', 'lima', 'bogota', 'kuala lumpur', 'jakarta', 
        'manila', 'hanoi', 'ho chi minh', 'taipei', 'osaka', 'kyoto', 'milan', 
        'florence', 'venice', 'zurich', 'geneva', 'brussels', 'stockholm', 
        'oslo', 'copenhagen', 'helsinki', 'warsaw', 'kiev', 'kyiv', 'riyadh', 
        'tehran', 'abu dhabi', 'doha', 'accra', 'casablanca', 'marrakech', 
        'addis ababa', 'johannesburg', 'bali', 'phuket', 'maldives', 'santorini', 
        'machu picchu', 'havana', 'edinburgh', 'dublin'
    ];

    for (const city of cities) {
        if (combinedText.includes(city)) {
            return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }
    return 'New York'; // Default fallback city
}

function mapOWMtoWMOCode(owmId) {
    if (owmId >= 200 && owmId < 300) return 95; // Thunderstorm
    if (owmId >= 300 && owmId < 400) return 51; // Drizzle
    if (owmId >= 500 && owmId < 600) return 61; // Rain
    if (owmId >= 600 && owmId < 700) return 71; // Snow
    if (owmId >= 700 && owmId < 800) return 45; // Fog
    if (owmId === 800) return 0;                // Clear
    if (owmId > 800 && owmId <= 802) return 1;  // Partly Cloudy
    if (owmId > 802) return 3;                  // Cloudy
    return 0;
}

function hasTMDBKey() {
    const key = API_CONFIGS['movie-tv'].primary.apiKey;
    return key && key !== 'YOUR_TMDB_KEY' && key.trim() !== '';
}

const MOVIE_GENRES = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

const MOVIE_TO_TV_GENRE_MAP = {
    28: 10759,  // Action -> Action & Adventure
    12: 10759,  // Adventure -> Action & Adventure
    16: 16,     // Animation -> Animation
    35: 35,     // Comedy -> Comedy
    80: 80,     // Crime -> Crime
    99: 99,     // Documentary -> Documentary
    18: 18,     // Drama -> Drama
    10751: 10751, // Family -> Family
    14: 10765,  // Fantasy -> Sci-Fi & Fantasy
    36: 18,     // History -> Drama
    27: 9648,   // Horror -> Mystery
    10402: 35,  // Music -> Comedy
    9648: 9648, // Mystery -> Mystery
    10749: 18,  // Romance -> Drama
    878: 10765, // Sci-Fi -> Sci-Fi & Fantasy
    53: 18,     // Thriller -> Drama
    10752: 10768, // War -> War & Politics
    37: 37      // Western -> Western
};

function getMovieGenreName(genreIds) {
    if (!genreIds || genreIds.length === 0) return 'Movie';
    return MOVIE_GENRES[genreIds[0]] || 'Movie';
}

const MOCK_NEWS_ARTICLES = [
    {
        id: "news-101",
        title: "Tokyo opens new solar-powered train loop ahead of schedule",
        description: "The city of Tokyo has completed its new elevated eco-friendly solar transit line, offering seamless green commutes for millions of travelers daily.",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=400&auto=format&fit=crop",
        category: "Tech & Transit",
        date: "2026-07-15",
        author: "Sato Takahashi",
        source: "Tokyo Metropolis News"
    },
    {
        id: "news-102",
        title: "Paris restores historic floating gardens along the Seine River",
        description: "A major urban renewal project in Paris has successfully reopened the floating gardens of the Seine, inviting tourists to explore native plant life and river views.",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop",
        category: "Environment",
        date: "2026-07-16",
        author: "Jean Dupont",
        source: "Le Parisien"
    },
    {
        id: "news-103",
        title: "London Underground expansion reaches crucial construction milestone",
        description: "Transport for London confirms the boring of new tunnels linking south and central London is complete, with services scheduled to begin early next year.",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop",
        category: "Infrastructure",
        date: "2026-07-17",
        author: "Sarah Jenkins",
        source: "London Herald"
    },
    {
        id: "news-104",
        title: "New York City unveils massive high-line linear park extension",
        description: "New York City officials officially cut the ribbon on a spectacular new section of the High Line, featuring elevated walkways and beautiful skyline views.",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop",
        category: "Urban Planning",
        date: "2026-07-18",
        author: "Michael Sterling",
        source: "NYC Daily"
    },
    {
        id: "news-105",
        title: "Rome opens ancient subterranean Colosseum passageways to public",
        description: "For the first time in history, tourists in Rome can book guided tours through the underground corridors where gladiators once prepared for combat.",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop",
        category: "Archaeology",
        date: "2026-07-19",
        author: "Elena Rossi",
        source: "Roma Today"
    },
    {
        id: "news-106",
        title: "Sydney Harbour Bridge hosts spectacular drone light show",
        description: "Thousands gathered along the harbor in Sydney to witness a stunning drone-coordinated light display celebrating the city's winter arts festival.",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&auto=format&fit=crop",
        category: "Culture",
        date: "2026-07-19",
        author: "James Vance",
        source: "Australia News"
    }
];

const MOCK_CITY_WEATHER = {
    'Tokyo': { temperature: 22, windspeed: 8.5, weathercode: 0 },
    'Paris': { temperature: 26, windspeed: 12.0, weathercode: 1 },
    'London': { temperature: 17, windspeed: 18.2, weathercode: 61 },
    'New York': { temperature: 29, windspeed: 10.0, weathercode: 3 },
    'Rome': { temperature: 32, windspeed: 6.1, weathercode: 0 },
    'Sydney': { temperature: 14, windspeed: 22.4, weathercode: 51 },
    'Default': { temperature: 20, windspeed: 10.0, weathercode: 1 }
};

const MOCK_MOVIES = [
    {
        id: "inception-101",
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop",
        category: "Sci-Fi",
        date: "2010-07-16",
        genre_ids: [878, 28, 53],
        rating: 8.3
    },
    {
        id: "dark-knight-102",
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format&fit=crop",
        category: "Action",
        date: "2008-07-18",
        genre_ids: [28, 80, 53],
        rating: 9.0
    },
    {
        id: "interstellar-103",
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop",
        category: "Sci-Fi",
        date: "2014-11-07",
        genre_ids: [878, 12, 18],
        rating: 8.6
    },
    {
        id: "spirited-away-104",
        title: "Spirited Away",
        description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop",
        category: "Animation",
        date: "2001-07-20",
        genre_ids: [16, 14, 10751],
        rating: 8.6
    },
    {
        id: "pulp-fiction-105",
        title: "Pulp Fiction",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&auto=format&fit=crop",
        category: "Crime",
        date: "1994-10-14",
        genre_ids: [80, 53],
        rating: 8.9
    },
    {
        id: "matrix-106",
        title: "The Matrix",
        description: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop",
        category: "Sci-Fi",
        date: "1999-03-31",
        genre_ids: [878, 28],
        rating: 8.7
    }
];

const MOCK_TV_SHOWS = {
    'Sci-Fi': [
        {
            id: "stranger-things-201",
            title: "Stranger Things",
            description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
            image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2016-07-15"
        },
        {
            id: "black-mirror-202",
            title: "Black Mirror",
            description: "A sci-fi anthology series exploring a twisted, high-tech near-future where humanity's greatest innovations and darkest instincts collide.",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2011-12-04"
        },
        {
            id: "dark-203",
            title: "Dark",
            description: "A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families.",
            image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2017-12-01"
        },
        {
            id: "westworld-204",
            title: "Westworld",
            description: "A dark odyssey about the dawn of artificial consciousness and the evolution of sin, set at the intersection of the near-future and the reimagined past.",
            image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2016-10-02"
        }
    ],
    'Action': [
        {
            id: "the-boys-205",
            title: "The Boys",
            description: "A fun and irreverent take on what happens when superheroes—who are as popular as celebrities—abuse their superpowers rather than use them for good.",
            image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2019-07-25"
        },
        {
            id: "daredevil-206",
            title: "Daredevil",
            description: "A blind lawyer by day, vigilante by night, Matt Murdock fights the crime of New York as Daredevil.",
            image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2015-04-10"
        },
        {
            id: "arrow-207",
            title: "Arrow",
            description: "Spoiled billionaire playboy Oliver Queen is missing and presumed dead for five years before being discovered alive on a remote island.",
            image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2012-10-10"
        }
    ],
    'Animation': [
        {
            id: "avatar-lta-208",
            title: "Avatar: The Last Airbender",
            description: "In a war-torn world of elemental magic, a young boy reawakens to undertake a dangerous mystic quest to fulfill his destiny as the Avatar, and bring peace to the world.",
            image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2005-02-21"
        },
        {
            id: "attack-on-titan-209",
            title: "Attack on Titan",
            description: "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
            image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2013-04-07"
        },
        {
            id: "arcane-210",
            title: "Arcane",
            description: "Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.",
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2021-11-06"
        }
    ],
    'Crime': [
        {
            id: "breaking-bad-211",
            title: "Breaking Bad",
            description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future.",
            image: "https://images.unsplash.com/photo-1521967906867-14ec9d64bee7?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2008-01-20"
        },
        {
            id: "better-call-saul-212",
            title: "Better Call Saul",
            description: "The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.",
            image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2015-02-08"
        },
        {
            id: "sherlock-213",
            title: "Sherlock",
            description: "A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2010-07-25"
        }
    ],
    'Default': [
        {
            id: "game-of-thrones-214",
            title: "Game of Thrones",
            description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for thousands of years.",
            image: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2011-04-17"
        },
        {
            id: "the-crown-215",
            title: "The Crown",
            description: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century.",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "2016-11-04"
        },
        {
            id: "friends-216",
            title: "Friends",
            description: "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop",
            category: "TV Show",
            date: "1994-09-22"
        }
    ]
};

// ===================================
// API Fetch Functions (TODO 2)
// ===================================

async function fetchPrimaryAPI(page = 1) {
    const panelId = 'primary';
    showLoading(panelId);
    hideError(panelId);

    try {
        if (state.currentCombo === 'locations-weather') {
            // If no search query is specified, serve the preset popular destinations
            if (!state.searchQuery) {
                state.primaryData = PRESET_DESTINATIONS;
                state.primaryPage = 1;
                state.primaryTotalPages = 1;
                displayPrimaryData();
                hideLoading(panelId);
                return;
            }

            // Otherwise, fetch geocoding information from Nominatim OpenStreetMap
            const cacheKey = `geo_${encodeURIComponent(state.searchQuery)}`;
            let locations = CacheManager.get(cacheKey);

            if (!locations) {
                console.log(`Querying Nominatim for: ${state.searchQuery}...`);
                const response = await fetch(`${API_CONFIGS['locations-weather'].primary.baseUrl}?q=${encodeURIComponent(state.searchQuery)}&format=json`, {
                    headers: { 'User-Agent': 'DestinaraTravelPlanner/1.0' }
                });
                if (!response.ok) throw new Error('Geocoding search query failed');
                locations = await response.json();
                
                // Format details
                locations = locations.map(loc => {
                    const cleanName = loc.display_name.split(',')[0];
                    // Try to get an image by city name first, then by full display name
                    const locationImage = getLocationImage(cleanName) || getLocationImage(loc.display_name);
                    return {
                        id: loc.place_id.toString(),
                        title: cleanName,
                        description: loc.display_name,
                        image: locationImage,
                        category: capitalizeFirst(loc.type || 'Location'),
                        date: `Lat: ${parseFloat(loc.lat).toFixed(4)}, Lon: ${parseFloat(loc.lon).toFixed(4)}`,
                        lat: parseFloat(loc.lat),
                        lon: parseFloat(loc.lon)
                    };
                });

                CacheManager.set(cacheKey, locations);
            }

            state.primaryFiltered = locations;
            applyPrimarySorting();
            
            // Paginate results client-side (6 per page for search matches)
            const itemsPerPage = 6;
            state.primaryTotalPages = Math.ceil(state.primaryFiltered.length / itemsPerPage) || 1;
            state.primaryPage = page;

            const startIdx = (page - 1) * itemsPerPage;
            state.primaryData = state.primaryFiltered.slice(startIdx, startIdx + itemsPerPage);

            displayPrimaryData();
            hideLoading(panelId);
        } else if (state.currentCombo === 'movie-tv') {
            if (hasTMDBKey()) {
                const apiKey = API_CONFIGS['movie-tv'].primary.apiKey;
                const cacheKey = `tmdb_movies_${encodeURIComponent(state.searchQuery || 'popular')}_page_${page}`;
                let tmdbPayload = CacheManager.get(cacheKey);

                if (!tmdbPayload) {
                    let url = '';
                    if (state.searchQuery) {
                        url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(state.searchQuery)}&page=${page}`;
                    } else {
                        url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;
                    }

                    console.log(`Querying TMDB for movies: ${url}`);
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('TMDB Movie query failed');
                    const rawData = await response.json();

                    const results = (rawData.results || []).map(movie => ({
                        id: movie.id.toString(),
                        title: movie.title,
                        description: movie.overview || 'No description available',
                        image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/300x180?text=No+Poster',
                        category: getMovieGenreName(movie.genre_ids),
                        date: movie.release_date || 'Unknown',
                        genre_ids: movie.genre_ids || [],
                        rating: movie.vote_average || 0
                    }));

                    tmdbPayload = {
                        results: results,
                        totalPages: rawData.total_pages || 1
                    };
                    CacheManager.set(cacheKey, tmdbPayload);
                }

                state.primaryFiltered = tmdbPayload.results;
                applyPrimarySorting();
                
                state.primaryData = state.primaryFiltered;
                state.primaryPage = page;
                state.primaryTotalPages = Math.min(tmdbPayload.totalPages, 100);
                displayPrimaryData();
                hideLoading(panelId);
            } else {
                // High-fidelity Mock fallback for Movie + TV
                let filteredMovies = MOCK_MOVIES;
                if (state.searchQuery) {
                    const query = state.searchQuery.toLowerCase();
                    filteredMovies = MOCK_MOVIES.filter(m => 
                        m.title.toLowerCase().includes(query) || 
                        m.description.toLowerCase().includes(query) ||
                        m.category.toLowerCase().includes(query)
                    );
                }

                state.primaryFiltered = [...filteredMovies];
                applyPrimarySorting();

                const itemsPerPage = 4;
                state.primaryTotalPages = Math.ceil(state.primaryFiltered.length / itemsPerPage) || 1;
                state.primaryPage = page;

                const startIdx = (page - 1) * itemsPerPage;
                state.primaryData = state.primaryFiltered.slice(startIdx, startIdx + itemsPerPage);

                displayPrimaryData();
                hideLoading(panelId);
            }
        } else if (state.currentCombo === 'news-weather') {
            if (hasNewsKey()) {
                const apiKey = API_CONFIGS['news-weather'].primary.apiKey;
                const cacheKey = `news_${encodeURIComponent(state.searchQuery || 'top')}_page_${page}`;
                let newsPayload = CacheManager.get(cacheKey);

                if (!newsPayload) {
                    let url = '';
                    if (state.searchQuery) {
                        url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(state.searchQuery)}&pageSize=10&page=${page}&apiKey=${apiKey}`;
                    } else {
                        url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&page=${page}&apiKey=${apiKey}`;
                    }

                    console.log(`Querying News API: ${url}`);
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('News API query failed');
                    const rawData = await response.json();

                    const results = (rawData.articles || []).map((art, idx) => ({
                        id: art.url || `news-${idx}`,
                        title: art.title,
                        description: art.description || art.content || 'No description available',
                        image: art.urlToImage || 'https://via.placeholder.com/300x180?text=News',
                        category: art.source ? art.source.name : 'News',
                        date: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : 'Unknown',
                        author: art.author || 'Unknown',
                        url: art.url
                    }));

                    newsPayload = {
                        results: results,
                        totalResults: rawData.totalResults || 0
                    };
                    CacheManager.set(cacheKey, newsPayload);
                }

                state.primaryFiltered = newsPayload.results;
                applyPrimarySorting();

                state.primaryData = state.primaryFiltered;
                state.primaryPage = page;
                state.primaryTotalPages = Math.ceil(newsPayload.totalResults / 10) || 1;
                displayPrimaryData();
                hideLoading(panelId);
            } else {
                // High-fidelity Mock fallback for News + Weather
                let filteredNews = MOCK_NEWS_ARTICLES;
                if (state.searchQuery) {
                    const query = state.searchQuery.toLowerCase();
                    filteredNews = MOCK_NEWS_ARTICLES.filter(n => 
                        n.title.toLowerCase().includes(query) || 
                        n.description.toLowerCase().includes(query) ||
                        n.category.toLowerCase().includes(query)
                    );
                }

                state.primaryFiltered = [...filteredNews];
                applyPrimarySorting();

                const itemsPerPage = 4;
                state.primaryTotalPages = Math.ceil(state.primaryFiltered.length / itemsPerPage) || 1;
                state.primaryPage = page;

                const startIdx = (page - 1) * itemsPerPage;
                state.primaryData = state.primaryFiltered.slice(startIdx, startIdx + itemsPerPage);

                displayPrimaryData();
                hideLoading(panelId);
            }
        } else {
            // Mock fallback for other combos
            const sampleData = generateSampleData('primary', 10);
            state.primaryData = sampleData;
            state.primaryPage = page;
            state.primaryTotalPages = 3;
            displayPrimaryData();
            hideLoading(panelId);
        }
    } catch (error) {
        console.error('Primary API Error:', error);
        showError(panelId, error.message);
        hideLoading(panelId);
    }
}

async function fetchSecondaryAPI(page = 1) {
    const panelId = 'secondary';
    if (!state.selectedLocation) {
        const grid = document.getElementById('secondaryGrid');
        grid.innerHTML = '';
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-state';
        emptyMsg.textContent = 'Select an item on the left panel to fetch its context!';
        grid.appendChild(emptyMsg);
        document.getElementById('secondaryCount').textContent = '0 items';
        updatePagination('secondary');
        return;
    }

    showLoading(panelId);
    hideError(panelId);

    try {
        if (state.currentCombo === 'locations-weather') {
            const loc = state.selectedLocation;
            // Prevent crashes if the location doesn't have lat/lon coordinates
            if (!loc.lat || !loc.lon) {
                 throw new Error("Selected location missing coordinates.");
            }
            
            const cacheKey = `weather_${loc.lat}_${loc.lon}`;
            let weatherData = CacheManager.get(cacheKey);

            if (!weatherData) {
                console.log(`Querying weather for Lat: ${loc.lat}, Lon: ${loc.lon}...`);
                const response = await fetch(`${API_CONFIGS['locations-weather'].secondary.baseUrl}?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`);
                if (!response.ok) throw new Error('Weather forecast retrieval failed');
                weatherData = await response.json();
                CacheManager.set(cacheKey, weatherData);
            }

            state.secondaryData = {
                location: loc,
                current: weatherData.current_weather
            };
            state.secondaryPage = 1;
            state.secondaryTotalPages = 1;

            displaySecondaryData();
        } else if (state.currentCombo === 'movie-tv') {
            if (hasTMDBKey()) {
                const apiKey = API_CONFIGS['movie-tv'].secondary.apiKey;
                const movie = state.selectedLocation;
                
                // Map the movie's genre to a TV genre
                let tvGenreId = '';
                if (movie.genre_ids && movie.genre_ids.length > 0) {
                    tvGenreId = MOVIE_TO_TV_GENRE_MAP[movie.genre_ids[0]] || '';
                }

                const cacheKey = `tmdb_tv_shows_genre_${tvGenreId || 'popular'}_page_${page}`;
                let tmdbPayload = CacheManager.get(cacheKey);

                if (!tmdbPayload) {
                    let url = '';
                    if (tvGenreId) {
                        url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${tvGenreId}&page=${page}`;
                    } else {
                        url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&page=${page}`;
                    }

                    console.log(`Querying TMDB for TV shows: ${url}`);
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('TMDB TV Show query failed');
                    const rawData = await response.json();

                    const results = (rawData.results || []).map(show => ({
                        id: show.id.toString(),
                        title: show.name,
                        description: show.overview || 'No description available',
                        image: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://via.placeholder.com/300x180?text=No+Poster',
                        category: 'TV Show',
                        date: show.first_air_date || 'Unknown'
                    }));

                    tmdbPayload = {
                        results: results,
                        totalPages: rawData.total_pages || 1
                    };
                    CacheManager.set(cacheKey, tmdbPayload);
                }

                state.secondaryData = tmdbPayload.results;
                state.secondaryPage = page;
                state.secondaryTotalPages = Math.min(tmdbPayload.totalPages, 100);
                displaySecondaryData();
            } else {
                // High-fidelity Mock fallback for Movie + TV
                const movie = state.selectedLocation;
                // Determine mock genre
                const genre = movie.category || 'Default';
                const shows = MOCK_TV_SHOWS[genre] || MOCK_TV_SHOWS['Default'];

                const itemsPerPage = 3;
                state.secondaryTotalPages = Math.ceil(shows.length / itemsPerPage) || 1;
                state.secondaryPage = page;

                const startIdx = (page - 1) * itemsPerPage;
                state.secondaryData = shows.slice(startIdx, startIdx + itemsPerPage);

                displaySecondaryData();
            }
        } else if (state.currentCombo === 'news-weather') {
            const article = state.selectedLocation;
            const city = extractCityFromText(article.title, article.description);
            const cacheKey = `news_weather_${encodeURIComponent(city)}`;
            let weatherPayload = CacheManager.get(cacheKey);

            if (hasOpenWeatherKey()) {
                const apiKey = API_CONFIGS['news-weather'].secondary.apiKey;
                if (!weatherPayload) {
                    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
                    console.log(`Querying OpenWeatherMap for ${city}: ${url}`);
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('OpenWeatherMap query failed');
                    const rawData = await response.json();
                    
                    const temp = rawData.main ? rawData.main.temp : 20;
                    const wind = rawData.wind ? rawData.wind.speed : 10;
                    const weatherId = rawData.weather && rawData.weather.length > 0 ? rawData.weather[0].id : 800;
                    const wmoCode = mapOWMtoWMOCode(weatherId);

                    weatherPayload = {
                        temperature: parseFloat(temp.toFixed(1)),
                        windspeed: parseFloat((wind * 3.6).toFixed(1)), // Convert m/s to km/h
                        weathercode: wmoCode
                    };
                    CacheManager.set(cacheKey, weatherPayload);
                }

                state.secondaryData = {
                    location: {
                        title: city,
                        description: `Weather for matched context in article: "${article.title}"`
                    },
                    current: weatherPayload
                };
                state.secondaryPage = 1;
                state.secondaryTotalPages = 1;
                displaySecondaryData();
            } else {
                // High-fidelity Mock fallback for OpenWeatherMap
                const mock = MOCK_CITY_WEATHER[city] || MOCK_CITY_WEATHER['Default'];
                state.secondaryData = {
                    location: {
                        title: city,
                        description: `Mock weather for matched context in article: "${article.title}"`
                    },
                    current: {
                        temperature: mock.temperature,
                        windspeed: mock.windspeed,
                        weathercode: mock.weathercode
                    }
                };
                state.secondaryPage = 1;
                state.secondaryTotalPages = 1;
                displaySecondaryData();
            }
        } else {
            // Generic mock fallback for News/other combos
            const grid = document.getElementById('secondaryGrid');
            grid.innerHTML = '';
            
            const card = document.createElement('div');
            card.className = 'data-card';
            card.style.padding = '1rem';
            
            const title = document.createElement('h3');
            title.textContent = `Details for ${state.selectedLocation.title}`;
            card.appendChild(title);
            
            const desc = document.createElement('p');
            desc.textContent = 'This is a placeholder for the secondary API data. Since no API key is provided for this combination, mock data is shown.';
            card.appendChild(desc);
            
            grid.appendChild(card);
            
            document.getElementById('secondaryCount').textContent = '1 item';
            state.secondaryPage = 1;
            state.secondaryTotalPages = 1;
            updatePagination('secondary');
        }
        
        hideLoading(panelId);
    } catch (error) {
        console.error('Secondary API Error:', error);
        showError(panelId, error.message);
        hideLoading(panelId);
    }
}

// ===================================
// Filter, Sort, Search Logic (TODO 3 & 4)
// ===================================

function applyPrimarySorting() {
    state.primaryFiltered.sort((a, b) => {
        if (state.sortBy === 'name-asc') {
            return a.title.localeCompare(b.title);
        } else if (state.sortBy === 'name-desc') {
            return b.title.localeCompare(a.title);
        }
        return 0;
    });
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    state.searchQuery = searchInput.value.trim();
    state.stats.searches++;
    state.primaryPage = 1;

    fetchPrimaryAPI(1);
    updateStats();
}

function handleFilterChange() {
    const sortSelect = document.getElementById('sortBy');
    state.sortBy = sortSelect.value;
    state.primaryPage = 1;

    if (state.searchQuery || state.currentCombo === 'movie-tv' || state.currentCombo === 'news-weather') {
        applyPrimarySorting();
        const itemsPerPage = (state.currentCombo === 'movie-tv' || state.currentCombo === 'news-weather') ? 4 : 6;
        state.primaryTotalPages = Math.ceil(state.primaryFiltered.length / itemsPerPage) || 1;
        const startIdx = 0;
        state.primaryData = state.primaryFiltered.slice(startIdx, startIdx + itemsPerPage);
        displayPrimaryData();
    } else {
        // Preset destinations sort
        PRESET_DESTINATIONS.sort((a, b) => {
            if (state.sortBy === 'name-asc') return a.title.localeCompare(b.title);
            if (state.sortBy === 'name-desc') return b.title.localeCompare(a.title);
            return 0;
        });
        state.primaryData = PRESET_DESTINATIONS;
        displayPrimaryData();
    }
}

function changePage(panelId, direction) {
    const currentPage = state[`${panelId}Page`];
    const totalPages = state[`${panelId}TotalPages`];
    const targetPage = currentPage + direction;

    if (targetPage >= 1 && targetPage <= totalPages) {
        state[`${panelId}Page`] = targetPage;
        if (panelId === 'primary') {
            fetchPrimaryAPI(targetPage);
        } else {
            fetchSecondaryAPI(targetPage);
        }
    }
}

// ===================================
// Pagination Controller (PRE-BUILT FIX)
// ===================================

function updatePagination(panelId) {
    const paginationEl = document.getElementById(`${panelId}Pagination`);
    const prevBtn = document.getElementById(`${panelId}PrevBtn`);
    const nextBtn = document.getElementById(`${panelId}NextBtn`);
    const pageInfo = document.getElementById(`${panelId}PageInfo`);

    const currentPage = state[`${panelId}Page`];
    const totalPages = state[`${panelId}TotalPages`];

    if (totalPages <= 1) {
        paginationEl.classList.add('hidden');
        return;
    }

    paginationEl.classList.remove('hidden');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// ===================================
// Display & Rendering (Safe DOM Methods)
// ===================================

function displayPrimaryData() {
    const grid = document.getElementById('primaryGrid');
    const countEl = document.getElementById('primaryCount');

    countEl.textContent = `${state.primaryData.length} items`;
    grid.innerHTML = '';

    if (state.primaryData.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-state';
        emptyMsg.textContent = 'No matching destinations found.';
        grid.appendChild(emptyMsg);
        updatePagination('primary');
        return;
    }

    state.primaryData.forEach(item => {
        const card = createDataCard(item, 'primary');
        grid.appendChild(card);
    });

    updatePagination('primary');
}

function displaySecondaryData() {
    const grid = document.getElementById('secondaryGrid');
    const countEl = document.getElementById('secondaryCount');

    grid.innerHTML = '';

    if (state.currentCombo === 'movie-tv') {
        const tvShows = state.secondaryData || [];
        countEl.textContent = `${tvShows.length} items`;

        if (tvShows.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-state';
            emptyMsg.textContent = 'No matching TV shows found.';
            grid.appendChild(emptyMsg);
            updatePagination('secondary');
            return;
        }

        tvShows.forEach(item => {
            const card = createDataCard(item, 'secondary');
            grid.appendChild(card);
        });

        updatePagination('secondary');
        return;
    }

    if (!state.secondaryData) {
        countEl.textContent = '0 items';
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-state';
        emptyMsg.textContent = 'Select a location on the left panel to load weather context.';
        grid.appendChild(emptyMsg);
        updatePagination('secondary');
        return;
    }

    const { location, current } = state.secondaryData;
    countEl.textContent = '1 item';

    const card = document.createElement('div');
    card.className = 'data-card weather-card';

    const title = document.createElement('h3');
    title.textContent = `Weather for ${location.title}`;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'favorite-item-meta';
    desc.textContent = location.description;
    card.appendChild(desc);

    // Weather grid
    const weatherGrid = document.createElement('div');
    weatherGrid.className = 'weather-details-grid';

    // Temp item
    const tempItem = document.createElement('div');
    tempItem.className = 'weather-detail-item';
    const tempVal = document.createElement('div');
    tempVal.className = 'weather-detail-val';
    tempVal.textContent = `${current.temperature}°C`;
    const tempLbl = document.createElement('div');
    tempLbl.className = 'weather-detail-lbl';
    tempLbl.textContent = 'Temperature';
    tempItem.appendChild(tempVal);
    tempItem.appendChild(tempLbl);

    // Wind item
    const windItem = document.createElement('div');
    windItem.className = 'weather-detail-item';
    const windVal = document.createElement('div');
    windVal.className = 'weather-detail-val';
    windVal.textContent = `${current.windspeed} km/h`;
    const windLbl = document.createElement('div');
    windLbl.className = 'weather-detail-lbl';
    windLbl.textContent = 'Wind Speed';
    windItem.appendChild(windVal);
    windItem.appendChild(windLbl);

    weatherGrid.appendChild(tempItem);
    weatherGrid.appendChild(windItem);
    card.appendChild(weatherGrid);

    // Weather Condition description
    const weatherCondition = getWeatherConditionText(current.weathercode);
    const condP = document.createElement('p');
    condP.style.textAlign = 'center';
    condP.style.fontWeight = 'bold';
    condP.textContent = `Condition: ${weatherCondition.text} ${weatherCondition.emoji}`;
    card.appendChild(condP);

    // Smart Packing Advice Card
    const adviceCard = document.createElement('div');
    adviceCard.className = 'packing-advice-card';

    const adviceTitle = document.createElement('h4');
    adviceTitle.textContent = '💼 Smart Travel Packing Advice';
    adviceCard.appendChild(adviceTitle);

    const adviceList = document.createElement('ul');
    const adviceItems = getPackingAdvice(current.temperature, current.weathercode, current.windspeed);
    adviceItems.forEach(advText => {
        const li = document.createElement('li');
        li.textContent = advText;
        adviceList.appendChild(li);
    });

    adviceCard.appendChild(adviceList);
    card.appendChild(adviceCard);

    grid.appendChild(card);
    updatePagination('secondary');
}

function createDataCard(item, source) {
    const card = document.createElement('div');
    card.className = 'data-card';
    card.dataset.id = item.id;

    // Check backend favorites array instead of local storage
    const isFavorite = state.favorites.some(fav => fav.id === item.id);

    // Favorite button
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
    favoriteBtn.textContent = isFavorite ? '⭐' : '☆';
    favoriteBtn.onclick = (e) => toggleFavorite(e, item, source);
    card.appendChild(favoriteBtn);

    // Flag / Travel image
    const img = document.createElement('img');
    img.src = item.image || 'https://via.placeholder.com/300x180?text=No+Image';
    img.alt = item.title || 'Location image';
    img.className = 'card-image';
    img.loading = 'lazy';
    card.appendChild(img);

    // Details box
    const detailsDiv = document.createElement('div');
    detailsDiv.style.padding = '0.5rem';

    // Title
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = item.title;
    detailsDiv.appendChild(title);

    // Description
    const description = document.createElement('p');
    description.className = 'card-description';
    description.textContent = item.description || 'No description available';
    detailsDiv.appendChild(description);

    // Meta
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    
    const dateSpan = document.createElement('span');
    dateSpan.textContent = item.date;
    
    const categorySpan = document.createElement('span');
    categorySpan.textContent = item.category;

    meta.appendChild(dateSpan);
    meta.appendChild(categorySpan);
    detailsDiv.appendChild(meta);
    card.appendChild(detailsDiv);

    // Click handler to select and open modal + load weather/secondary context
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('favorite-btn')) {
            if (source === 'primary') {
                state.selectedLocation = item;
                state.stats.itemsViewed++;
                updateStats();
                
                // Load secondary panel
                fetchSecondaryAPI();
            }
            
            // Load details modal
            showDetailModal(item);
        }
    });

    return card;
}

// ===================================
// Modal & Trip planning Details (TODO 7)
// ===================================

function showDetailModal(item) {
    const modal = document.getElementById('detailModal');
    const detailContent = document.getElementById('detailContent');

    detailContent.innerHTML = '';

    const title = document.createElement('h2');
    const prefix = item.category === 'TV Show' ? '📺 ' : (state.currentCombo === 'movie-tv' ? '🎬 ' : '📍 ');
    title.textContent = `${prefix}${item.title}`;
    detailContent.appendChild(title);

    if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title;
        img.style.cssText = 'width: 100%; max-height: 250px; object-fit: cover; border-radius: 12px; margin: 1rem 0;';
        detailContent.appendChild(img);
    }

    const textDetails = document.createElement('div');
    textDetails.style.margin = '1rem 0';
    textDetails.style.textAlign = 'left';

    let details = [];
    if (state.currentCombo === 'movie-tv') {
        details = [
            { label: 'Category', val: item.category },
            { label: 'Overview', val: item.description },
            { label: 'Release / Air Date', val: item.date }
        ];
        if (item.rating) {
            details.push({ label: 'Rating', val: `${item.rating} / 10` });
        }
    } else {
        details = [
            { label: 'Category', val: item.category },
            { label: 'Full Location', val: item.description },
            { label: 'Coordinates', val: item.date }
        ];
    }

    details.forEach(d => {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${d.label}: `;
        p.appendChild(strong);
        p.appendChild(document.createTextNode(d.val));
        textDetails.appendChild(p);
    });

    detailContent.appendChild(textDetails);

    // Trip planner inputs if authenticated and favorited (CRUD Updates)
    const favoritedItem = state.favorites.find(fav => fav.id === item.id);
    
    if (state.currentUser && favoritedItem) {
        const plannerSection = document.createElement('div');
        plannerSection.className = 'trip-planner-section';

        const plannerTitle = document.createElement('h4');
        const isMovieTv = state.currentCombo === 'movie-tv';
        plannerTitle.textContent = isMovieTv ? '🎬 Customize Movie Watchlist Details' : '✈️ Customize Your Travel Plans';
        plannerSection.appendChild(plannerTitle);

        // Date input
        const dateGroup = document.createElement('div');
        dateGroup.className = 'form-group mb-2';
        const dateLabel = document.createElement('label');
        dateLabel.textContent = isMovieTv ? 'Target Watch Date:' : 'Target Travel Date:';
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = favoritedItem.travelDate || '';
        dateGroup.appendChild(dateLabel);
        dateGroup.appendChild(dateInput);
        plannerSection.appendChild(dateGroup);

        // Notes textarea
        const notesGroup = document.createElement('div');
        notesGroup.className = 'form-group mb-2';
        const notesLabel = document.createElement('label');
        notesLabel.textContent = isMovieTv ? 'Watchlist / Review Notes:' : 'Travel Packing Notes:';
        const notesTextarea = document.createElement('textarea');
        notesTextarea.rows = 3;
        notesTextarea.placeholder = isMovieTv ? 'e.g. Watch with friends, bring popcorn...' : 'e.g. Pack jacket, bring power adaptors...';
        notesTextarea.value = favoritedItem.notes || '';
        notesGroup.appendChild(notesLabel);
        notesGroup.appendChild(notesTextarea);
        plannerSection.appendChild(notesGroup);

        // Save Button
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-primary';
        saveBtn.textContent = isMovieTv ? 'Save Watchlist Settings' : 'Save Trip Settings';
        saveBtn.style.width = '100%';
        
        saveBtn.onclick = async () => {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            try {
                const response = await fetch(`/api/favorites/${favoritedItem.favoriteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        notes: notesTextarea.value,
                        travelDate: dateInput.value
                    })
                });
                if (!response.ok) throw new Error('Failed to update plans');
                const updated = await response.json();
                
                // Update local state array
                const idx = state.favorites.findIndex(f => f.favoriteId === favoritedItem.favoriteId);
                if (idx > -1) {
                    state.favorites[idx] = updated;
                }
                
                displayFavorites();
                saveBtn.textContent = 'Settings Saved! ✓';
                setTimeout(() => {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Trip Settings';
                }, 1500);
            } catch (err) {
                alert(err.message);
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Trip Settings';
            }
        };

        plannerSection.appendChild(saveBtn);
        detailContent.appendChild(plannerSection);
    } else if (!state.currentUser) {
        const alertP = document.createElement('p');
        alertP.className = 'favorite-item-meta';
        alertP.style.fontStyle = 'italic';
        alertP.textContent = '🔒 Sign in or Sign up to add custom notes and travel dates for this location!';
        detailContent.appendChild(alertP);
    } else {
        const addP = document.createElement('p');
        addP.className = 'favorite-item-meta';
        addP.textContent = '💡 Star this location to enable trip notes and dates management.';
        detailContent.appendChild(addP);
    }

    modal.classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// ===================================
// Favorites Client Logic (TODO 5 - CRUD)
// ===================================

async function loadFavorites() {
    if (!state.currentUser) {
        state.favorites = [];
        displayFavorites();
        return;
    }

    try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
            state.favorites = await response.json();
            displayFavorites();
        }
    } catch (error) {
        console.error('Failed to load favorites from backend:', error);
    }
}

async function toggleFavorite(event, item, source) {
    event.stopPropagation();

    if (!state.currentUser) {
        openAuthModal('login');
        alert('Please register or log in first to store destinations persistently on the server!');
        return;
    }

    const existingIndex = state.favorites.findIndex(fav => fav.id === item.id);

    try {
        if (existingIndex > -1) {
            const favItem = state.favorites[existingIndex];
            const response = await fetch(`/api/favorites/${favItem.favoriteId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete favorite');
            state.favorites.splice(existingIndex, 1);
        } else {
            const payload = {
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.image,
                category: item.category
            };
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to save favorite');
            }
            const savedFav = await response.json();
            state.favorites.push(savedFav);
        }

        displayFavorites();
        
        displayPrimaryData();
        displaySecondaryData();
        
        loadRecommendations();
    } catch (err) {
        alert(err.message);
    }
}

function displayFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';

    if (state.favorites.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-state';
        emptyMsg.textContent = 'No locations saved yet. Click the ☆ on cards to add them!';
        favoritesList.appendChild(emptyMsg);
        state.stats.totalFavorites = 0;
        updateStats();
        return;
    }

    state.favorites.forEach(item => {
        const favItem = document.createElement('div');
        favItem.className = 'favorite-item';
        
        favItem.onclick = () => {
            // Find location in existing datasets
            let locObj = state.primaryData.find(c => c.id === item.id);
            if (!locObj) locObj = PRESET_DESTINATIONS.find(c => c.id === item.id);
            if (!locObj) {
                locObj = {
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    image: item.image,
                    category: item.category,
                    date: 'Lat/Lon details on click'
                };
            }
            showDetailModal(locObj);
        };

        const info = document.createElement('div');
        
        const title = document.createElement('strong');
        title.textContent = item.title;
        info.appendChild(title);
        
        const br = document.createElement('br');
        info.appendChild(br);
        
        const meta = document.createElement('small');
        meta.className = 'favorite-item-meta';
        meta.textContent = `${item.category} Type`;
        info.appendChild(meta);

        if (item.travelDate) {
            const dateMeta = document.createElement('div');
            dateMeta.className = 'favorite-item-meta';
            dateMeta.style.fontWeight = 'bold';
            dateMeta.textContent = `📅 Travel Date: ${item.travelDate}`;
            info.appendChild(dateMeta);
        }

        if (item.notes) {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'favorite-item-notes';
            noteDiv.textContent = item.notes;
            info.appendChild(noteDiv);
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-icon';
        removeBtn.textContent = '✕';
        removeBtn.onclick = async (e) => {
            e.stopPropagation();
            try {
                const response = await fetch(`/api/favorites/${item.favoriteId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Deletion failed');
                removeFavoriteLocal(item.favoriteId);
            } catch (err) {
                alert(err.message);
            }
        };

        favItem.appendChild(info);
        favItem.appendChild(removeBtn);
        favoritesList.appendChild(favItem);
    });

    state.stats.totalFavorites = state.favorites.length;
    updateStats();
}

function removeFavoriteLocal(favId) {
    const index = state.favorites.findIndex(fav => fav.favoriteId === favId);
    if (index > -1) {
        state.favorites.splice(index, 1);
        displayFavorites();
        displayPrimaryData();
        displaySecondaryData();
        loadRecommendations();
    }
}

async function clearFavorites() {
    if (!state.currentUser) return;
    if (confirm('Are you sure you want to clear all your saved locations?')) {
        try {
            const response = await fetch('/api/favorites', { method: 'DELETE' });
            if (response.ok) {
                state.favorites = [];
                displayFavorites();
                displayPrimaryData();
                displaySecondaryData();
                loadRecommendations();
            }
        } catch (error) {
            console.error('Failed to clear favorites:', error);
        }
    }
}

// ===================================
// Custom Recommendations API (Endpoint 5)
// ===================================

async function loadRecommendations() {
    try {
        const response = await fetch('/api/recommendations');
        if (!response.ok) throw new Error();
        state.recommendations = await response.json();
        renderRecommendationsSection();
    } catch (e) {
        console.error('Could not load suggestions');
    }
}

function renderRecommendationsSection() {
    let section = document.getElementById('recommendationsSection');
    if (!section) {
        section = document.createElement('section');
        section.id = 'recommendationsSection';
        section.className = 'recommendations-section';
        
        const appContainer = document.querySelector('.app-container');
        const footer = document.querySelector('.stats-footer');
        appContainer.insertBefore(section, footer);
    }

    section.innerHTML = '';

    const h3 = document.createElement('h3');
    h3.className = 'recommendations-title';
    h3.textContent = '✈️ Recommended Cities For Your Next Travel';
    section.appendChild(h3);

    const grid = document.createElement('div');
    grid.className = 'recommendations-grid';

    state.recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        card.onclick = () => {
            const presetObj = PRESET_DESTINATIONS.find(c => c.title === rec.title);
            if (presetObj) {
                showDetailModal(presetObj);
            } else {
                showDetailModal({
                    id: rec.id,
                    title: rec.title,
                    description: rec.description,
                    image: rec.image,
                    category: rec.region,
                    date: 'Lat/Lon available on favorite'
                });
            }
        };

        const img = document.createElement('img');
        img.src = rec.image;
        img.alt = rec.title;
        img.className = 'recommendation-img';
        card.appendChild(img);

        const info = document.createElement('div');
        info.className = 'recommendation-info';
        
        const h4 = document.createElement('h4');
        h4.textContent = rec.title;
        
        const p = document.createElement('p');
        p.textContent = rec.description;

        info.appendChild(h4);
        info.appendChild(p);
        card.appendChild(info);

        grid.appendChild(card);
    });

    section.appendChild(grid);
}

// ===================================
// Auth Modals & Form Handlers
// ===================================

let activeAuthMode = 'login';

function openAuthModal(mode = 'login') {
    activeAuthMode = mode;
    const modal = document.getElementById('authModal');
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const errorMsg = document.getElementById('authErrorMsg');

    errorMsg.classList.add('hidden');
    document.getElementById('authUsername').value = '';
    document.getElementById('authPassword').value = '';

    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        submitBtn.textContent = 'Log In';
    } else {
        tabLogin.classList.remove('active');
        tabSignup.classList.add('active');
        submitBtn.textContent = 'Sign Up';
    }

    modal.classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    const errorMsg = document.getElementById('authErrorMsg');

    const url = activeAuthMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        state.currentUser = data;
        updateUserUI();
        closeAuthModal();
        
        await loadFavorites();
        displayPrimaryData();
        displaySecondaryData();
        loadRecommendations();
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('hidden');
    }
}

async function checkAuthSession() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const data = await response.json();
            state.currentUser = data.user;
            updateUserUI();
            await loadFavorites();
        }
    } catch (e) {
        // No session
    }
}

function updateUserUI() {
    const greeting = document.getElementById('userGreeting');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const clearFavBtn = document.getElementById('clearFavoritesBtn');

    if (state.currentUser) {
        greeting.textContent = `Hello, ${state.currentUser.username}!`;
        greeting.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        signupBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        clearFavBtn.classList.remove('hidden');
    } else {
        greeting.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        signupBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        clearFavBtn.classList.add('hidden');
    }
}

async function handleLogout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        state.currentUser = null;
        updateUserUI();
        state.favorites = [];
        displayFavorites();
        displayPrimaryData();
        displaySecondaryData();
        loadRecommendations();
    } catch (e) {
        console.error('Logout failed');
    }
}

// ===================================
// UI Helpers & Weather Interpretation
// ===================================

function showLoading(panelId) {
    document.getElementById(`${panelId}Loading`).classList.remove('hidden');
    document.getElementById(`${panelId}Grid`).style.opacity = '0.3';
}

function hideLoading(panelId) {
    document.getElementById(`${panelId}Loading`).classList.add('hidden');
    document.getElementById(`${panelId}Grid`).style.opacity = '1';
}

function showError(panelId, message) {
    const errorEl = document.getElementById(`${panelId}Error`);
    errorEl.querySelector('.error-message').textContent = message;
    errorEl.classList.remove('hidden');
}

function hideError(panelId) {
    document.getElementById(`${panelId}Error`).classList.add('hidden');
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    document.getElementById('themeToggle').textContent = state.theme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('theme', state.theme);
}

function updateStats() {
    document.getElementById('totalItemsViewed').textContent = state.stats.itemsViewed;
    document.getElementById('totalSearches').textContent = state.stats.searches;
    document.getElementById('totalFavorites').textContent = state.stats.totalFavorites;
    document.getElementById('cacheHits').textContent = state.stats.cacheHits;
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getWeatherConditionText(code) {
    const codes = {
        0: { text: 'Clear sky', emoji: '☀️' },
        1: { text: 'Mainly clear', emoji: '🌤️' },
        2: { text: 'Partly cloudy', emoji: '⛅' },
        3: { text: 'Overcast', emoji: '☁️' },
        45: { text: 'Fog', emoji: '🌫️' },
        48: { text: 'Depositing rime fog', emoji: '🌫️' },
        51: { text: 'Light drizzle', emoji: '🌧️' },
        53: { text: 'Moderate drizzle', emoji: '🌧️' },
        55: { text: 'Dense drizzle', emoji: '🌧️' },
        61: { text: 'Slight rain', emoji: '🌧️' },
        63: { text: 'Moderate rain', emoji: '🌧️' },
        65: { text: 'Heavy rain', emoji: '🌧️' },
        71: { text: 'Slight snow fall', emoji: '❄️' },
        73: { text: 'Moderate snow fall', emoji: '❄️' },
        75: { text: 'Heavy snow fall', emoji: '❄️' },
        80: { text: 'Slight rain showers', emoji: '🌦️' },
        81: { text: 'Moderate rain showers', emoji: '🌦️' },
        82: { text: 'Violent rain showers', emoji: '🌦️' },
        95: { text: 'Thunderstorm', emoji: '⛈️' }
    };
    return codes[code] || { text: 'Unknown Conditions', emoji: '🌤️' };
}

function getPackingAdvice(temp, code, wind) {
    const items = [];
    
    if (temp <= 10) {
        items.push('Heavy coat or windbreaker', 'Thick warm gloves & scarf', 'Thermal base layers');
    } else if (temp > 10 && temp <= 20) {
        items.push('Light jacket or soft sweater', 'Jeans or long trousers', 'Comfortable layered tops');
    } else {
        items.push('Sunglasses & sun visor', 'Lightweight, breathable clothes', 'High SPF sunscreen');
    }

    if (code >= 50 && code <= 65) {
        items.push('Sturdy umbrella', 'Waterproof rain shell');
    } else if (code >= 71 && code <= 75) {
        items.push('Insulated winter boots', 'Waterproof outdoor gloves');
    }

    if (wind > 20) {
        items.push('Windbreaker or shell jacket', 'Hairband or fitted cap');
    }

    return items;
}

function generateSampleData(source, count) {
    const titles = [
        'Location Search A', 'Location Search B', 'Location Search C'
    ];
    return Array.from({ length: count }, (_, i) => ({
        id: `${source}-${i}`,
        title: titles[i % titles.length] + ` (${i + 1})`,
        description: 'Mock data description for testing.',
        image: '',
        category: 'Place',
        date: 'Recent'
    }));
}

// ===================================
// Event Listeners (TODO 1)
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // API selection buttons
    document.querySelectorAll('.api-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.api-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentCombo = btn.dataset.combo;

            const config = API_CONFIGS[state.currentCombo];
            document.getElementById('primaryApiTitle').textContent = config.primary.name;
            document.getElementById('secondaryApiTitle').textContent = config.secondary.name;

            state.selectedLocation = null;
            state.secondaryData = null;

            fetchPrimaryAPI(1);
            fetchSecondaryAPI(1);
        });
    });

    // Search query submissions
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    document.getElementById('clearSearchBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        state.searchQuery = '';
        fetchPrimaryAPI(1);
    });

    // Sort order select changes
    document.getElementById('sortBy').addEventListener('change', handleFilterChange);

    // List/Grid toggle layout (TODO 8)
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.view = btn.id === 'gridViewBtn' ? 'grid' : 'list';
            
            const app = document.querySelector('.app-container');
            if (state.view === 'list') {
                app.classList.add('list-view');
            } else {
                app.classList.remove('list-view');
            }
        });
    });

    // Pagination navigation triggers
    document.getElementById('primaryPrevBtn').addEventListener('click', () => changePage('primary', -1));
    document.getElementById('primaryNextBtn').addEventListener('click', () => changePage('primary', 1));
    document.getElementById('secondaryPrevBtn').addEventListener('click', () => changePage('secondary', -1));
    document.getElementById('secondaryNextBtn').addEventListener('click', () => changePage('secondary', 1));

    // Favorites clearing trigger
    document.getElementById('clearFavoritesBtn').addEventListener('click', clearFavorites);

    // Light/Dark mode triggers
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Resetting page caching
    document.getElementById('refreshBtn').addEventListener('click', () => {
        CacheManager.clearAll();
        fetchPrimaryAPI(state.primaryPage);
        fetchSecondaryAPI(state.secondaryPage);
    });

    // Overlay modal controllers
    document.querySelector('.modal-close').addEventListener('click', closeDetailModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeDetailModal);
    
    // Sign up / log in overlay triggers
    document.getElementById('loginBtn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('signupBtn').addEventListener('click', () => openAuthModal('signup'));
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('authModalClose').addEventListener('click', closeAuthModal);
    document.querySelector('#authModal .modal-overlay').addEventListener('click', closeAuthModal);

    document.getElementById('tabLogin').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('tabSignup').addEventListener('click', () => openAuthModal('signup'));
    
    document.getElementById('authForm').addEventListener('submit', handleAuthSubmit);

    // Fail retry buttons
    document.querySelectorAll('.btn-retry').forEach(btn => {
        btn.addEventListener('click', () => {
            fetchPrimaryAPI(state.primaryPage);
            fetchSecondaryAPI(state.secondaryPage);
        });
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('themeToggle').textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }

    document.getElementById('primaryApiTitle').textContent = API_CONFIGS['locations-weather'].primary.name;
    document.getElementById('secondaryApiTitle').textContent = API_CONFIGS['locations-weather'].secondary.name;

    checkAuthSession().then(() => {
        fetchPrimaryAPI(1);
        fetchSecondaryAPI(1);
        loadRecommendations();
    });
});
