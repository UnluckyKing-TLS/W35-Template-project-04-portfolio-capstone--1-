# 🌍 Destinara: Global Travel & Weather Planner

**Live Demo URL:** `[Paste Your Deployed Vercel/Render URL Here]`
**Demo Video:** `[Link to Your 2-3 Min Loom/YouTube Demo Video]`

Destinara is a dynamic travel planning application that helps users discover global destinations and intelligently plan their trips using real-time weather context. By searching for any city or landmark, users get precise geographical data and immediate live weather forecasts, including smart packing advice based on current conditions.

## 🚀 APIs & Integration

This project fulfills the capstone requirement of integrating two external APIs where the data of one informs the other:

1. **Nominatim OpenStreetMap API**: 
   Provides the primary data. When a user searches for a destination (e.g., "Paris"), this API is queried to return the exact geographical coordinates (Latitude and Longitude), along with category and regional metadata.
   
2. **Open-Meteo API**: 
   Acts as the secondary data source. It waits for the Nominatim API to resolve the coordinates, and then dynamically fetches the live weather forecast (temperature, windspeed, weather codes) for that exact location. The application then interprets this data to provide contextual "Smart Packing Advice".

Both APIs are free and require no API keys, enabling a seamless developer and user experience.

## 💻 Tech Stack & Features

* **Frontend**: Vanilla JavaScript, HTML5, CSS3 (with Dark Mode toggle)
* **Backend**: Node.js, Express.js
* **Storage**: Persistent JSON file storage (`data/users.json`, `data/favorites.json`)
* **Authentication**: JWT (JSON Web Tokens) via HTTP-only cookies

### Key Features Implemented:
* **Dual-Panel Architecture**: Search results populate on the left; contextual weather data loads on the right upon selection.
* **Pagination**: Client-side pagination handling for search results.
* **Search & Filter**: Real-time searching combined with sorting algorithms (A-Z, Z-A).
* **Caching**: 5-minute TTL caching implemented via `localStorage` to prevent rate-limiting on both APIs.
* **Favorites with CRUD**: 
  * **Create**: Star a location to save it.
  * **Read**: Fetches favorites on load.
  * **Update**: Open the modal of a favorited location to add custom trip notes and travel dates.
  * **Delete**: Unstar to remove.
* **Custom Recommendation Endpoint**: The backend provides a custom `/api/recommendations` endpoint that suggests new travel destinations based on the regions of a user's saved favorites.
* **Comprehensive Error States**: Handled loading states, empty states (e.g., no search results), and API fetch error recovery.
* **Responsive UX**: Grid/List view toggle and CSS grid layouts designed to adapt gracefully.

## 🛠️ How to Run Locally

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

## 🪞 Reflection

**1. What did you learn that you didn't know before?**
I learned how to seamlessly chain asynchronous API calls where the second call strictly depends on the specific output (lat/lon coordinates) of the first. Managing the loading and error states for both panels simultaneously was a great exercise in robust UI design.

**2. How did you collaborate with AI?**
I used AI to help brainstorm the app concept, refactor my CSS for the dark mode toggle, and structure the Node.js backend. I wrote the prompts and verified the data fetching logic, while the AI helped me debug a CORS issue I initially had with fetching images.

**3. How do you know your code works?**
I verified the caching logic by opening the Chrome DevTools Network tab—searching for a city the second time triggers no new network request and I see my custom "Cache Hit" console log. I also tested the authentication by verifying my JWT token was properly stored in the browser cookies upon login.
