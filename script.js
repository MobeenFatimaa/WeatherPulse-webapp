

// ==========================================
// CONFIGURATION
// ==========================================
// 🔑 Insert your 32-character key from openweathermap.org/api_keys
const API_KEY = "5fd0a33db380e3dfeeec4d88e5cae8c6";

let currentUnit = "metric";
let currentQuery = "Rawalpindi";

// Global Chart & Map Instances
let weatherChart = null;
let leafletMap = null;
let mapMarker = null;

// Canvas Particle Engine State
let canvas, ctx;
let particles = [];
let animationFrameId = null;
let currentWeatherCondition = "clear"; // 'rain', 'snow', 'thunder', 'clear'

// UI Selectors
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const refreshBtn = document.getElementById("refreshBtn");
const unitBtn = document.getElementById("unitBtn");

// OpenWeather Icon Mapping
function getWeatherIconClass(iconCode) {
    const iconMap = {
        "01d": "fa-sun",
        "01n": "fa-moon",
        "02d": "fa-cloud-sun",
        "02n": "fa-cloud-moon",
        "03d": "fa-cloud",
        "03n": "fa-cloud",
        "04d": "fa-cloud-meatball",
        "04n": "fa-cloud-meatball",
        "09d": "fa-cloud-showers-heavy",
        "09n": "fa-cloud-showers-heavy",
        "10d": "fa-cloud-sun-rain",
        "10n": "fa-cloud-moon-rain",
        "11d": "fa-cloud-bolt",
        "11n": "fa-cloud-bolt",
        "13d": "fa-snowflake",
        "13n": "fa-snowflake",
        "50d": "fa-smog",
        "50n": "fa-smog"
    };
    return iconMap[iconCode] || "fa-cloud-sun";
}

// Live Clock
function updateClock() {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    setText("current-time", `${hours}:${minutes}:${seconds} ${ampm}`);
    setText("current-day", days[now.getDay()]);
    setText("current-date", `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
}

setInterval(updateClock, 1000);
updateClock();

// Helper Setters
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setBarWidth(id, percent) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
}

function formatTime(unixTimestamp, timezoneOffsetSeconds) {
    const localDate = new Date((unixTimestamp + timezoneOffsetSeconds) * 1000);
    let hours = localDate.getUTCHours();
    let minutes = localDate.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = String(minutes).padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
}

function getCardinalDirection(angle) {
    const directions = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'];
    return directions[Math.round(angle / 45) % 8];
}

// ==========================================
// API FETCH ENGINE
// ==========================================

async function getWeather(query) {
    if (!API_KEY || API_KEY === "YOUR_ACTUAL_API_KEY_HERE") {
        alert("⚠️ Please paste your personal OpenWeatherMap API key into script.js!");
        return;
    }

    currentQuery = query;
    setText("description", "Refreshing weather...");

    try {
        let url = typeof query === "string" 
            ? `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=${currentUnit}&appid=${API_KEY}`
            : `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=${currentUnit}&appid=${API_KEY}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) throw new Error(`City "${query}" not found.`);
            if (response.status === 401) throw new Error("API key unauthorized or pending activation.");
            throw new Error(`Server returned status code: ${response.status}`);
        }
        
        const data = await response.json();
        
        updateCurrentWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
        updateInteractiveMap(data.coord.lat, data.coord.lon, data.name);

    } catch (error) {
        setText("description", "Error fetching weather");
        alert(`WeatherPulse Notice: ${error.message}`);
    }
}

async function getForecast(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
        );

        if (!response.ok) return;
        
        const data = await response.json();
        updateHourlyForecast(data.list);
        updateDailyForecast(data.list);
        updateWeatherChart(data.list);
    } catch (error) {
        console.error("Forecast Error:", error);
    }
}

// ==========================================
// UI & DYNAMIC ENVIRONMENT LOGIC
// ==========================================

// High-reliability video sources for different weather types
// Local Video Map for Weather Types
const weatherVideos = {
    clearDay: "./videos/clear-day.mp4",
    clearNight: "./videos/clear-night.mp4",
    clouds: "./videos/clouds.mp4",
    rain: "./videos/rain.mp4",
    drizzle: "./videos/drizzle.mp4",
    snow: "./videos/snow.mp4",
    thunder: "./videos/thunder.mp4",
    mist: "./videos/mist.mp4",
    default: "./videos/default.mp4"
};
function updateCurrentWeather(data) {
    const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
    const speedUnit = currentUnit === "metric" ? "km/h" : "mph";

    // 1. Basic Weather Display & Main City Info
    setText("temperature", Math.round(data.main.temp) + unitSymbol);
    setText("city", data.name);
    setText("description", data.weather[0].description);
    
    const countryEl = document.getElementById("country-name");
    if (countryEl) {
        countryEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${data.sys.country}`;
    }

    const iconEl = document.getElementById("weatherIcon");
    if (iconEl) {
        iconEl.className = `fa-solid ${getWeatherIconClass(data.weather[0].icon)} animated-weather-icon`;
    }

    // 2. Day / Night Calculation & Automatic Night Theme
    const nowUnix = Math.floor(Date.now() / 1000);
    const isNight = nowUnix < data.sys.sunrise || nowUnix > data.sys.sunset;
    
    if (isNight) {
        document.body.classList.add("night-mode");
    } else {
        document.body.classList.remove("night-mode");
    }

    // 3. Determine Dynamic Background Video & Weather Condition
   // Determine Dynamic Background Video & Weather Condition
    const mainWeather = data.weather[0].main.toLowerCase();
    let selectedVideoUrl = isNight ? weatherVideos.clearNight : weatherVideos.clearDay;

    if (mainWeather.includes("thunderstorm") || mainWeather.includes("thunder")) {
        selectedVideoUrl = weatherVideos.thunder;
        currentWeatherCondition = "thunder";
    } else if (mainWeather.includes("drizzle")) {
        selectedVideoUrl = weatherVideos.drizzle || weatherVideos.rain;
        currentWeatherCondition = "rain";
    } else if (mainWeather.includes("rain")) {
        selectedVideoUrl = weatherVideos.rain;
        currentWeatherCondition = "rain";
    } else if (mainWeather.includes("snow")) {
        selectedVideoUrl = weatherVideos.snow;
        currentWeatherCondition = "snow";
    } else if (mainWeather.includes("cloud")) {
        selectedVideoUrl = weatherVideos.clouds;
        currentWeatherCondition = "clear";
    } else if (mainWeather.includes("mist") || mainWeather.includes("fog") || mainWeather.includes("haze") || mainWeather.includes("smoke")) {
        selectedVideoUrl = weatherVideos.mist || weatherVideos.clouds;
        currentWeatherCondition = "clear";
    } else if (mainWeather.includes("clear")) {
        selectedVideoUrl = isNight ? weatherVideos.clearNight : weatherVideos.clearDay;
        currentWeatherCondition = "clear";
    } else {
        selectedVideoUrl = weatherVideos.default;
        currentWeatherCondition = "clear";
    }

    // Load & Play Your Local Video
   const videoElement = document.getElementById("background-video");
if (videoElement) {
    if (!videoElement.src.includes(selectedVideoUrl)) {
        videoElement.src = selectedVideoUrl;
        videoElement.load();
        
        // Ensure muted property is set via JS as well
        videoElement.muted = true;
        
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn("Autoplay prevented by browser, waiting for user interaction:", err);
            });
        }
    }
}
    // 5. Trigger Canvas Particle Engine (Rain, Snow, Lightning FX)
    initWeatherParticles(currentWeatherCondition);

    // 6. Metrics & Highlights Update
    const humidity = data.main.humidity;
    setText("humidity", `${humidity}%`);
    setBarWidth("humidity-bar", humidity);
    
    const humBadge = document.getElementById("humidity-badge");
    if (humBadge) {
        humBadge.textContent = humidity < 30 ? "Dry" : humidity <= 60 ? "Optimal" : "High";
        humBadge.className = humidity <= 60 ? "metric-badge badge-green" : "metric-badge badge-red";
    }

    const rawSpeed = data.wind.speed;
    const windSpeed = currentUnit === "metric" ? Math.round(rawSpeed * 3.6) : Math.round(rawSpeed);
    setText("wind", `${windSpeed} ${speedUnit}`);
    setBarWidth("wind-bar", (windSpeed / 80) * 100);

    const pressure = data.main.pressure;
    setText("pressure", `${pressure} hPa`);
    setBarWidth("pressure-bar", ((pressure - 950) / 100) * 100);

    const visKm = (data.visibility / 1000).toFixed(1);
    setText("visibility", `${visKm} km`);
    setBarWidth("visibility-bar", (visKm / 10) * 100);

    const tempMin = Math.round(data.main.temp_min);
    const tempMax = Math.round(data.main.temp_max);
    setText("temp-min", tempMin + unitSymbol);
    setText("temp-max", tempMax + unitSymbol);
    setBarWidth("temp-min-bar", ((tempMin + 10) / 55) * 100);
    setBarWidth("temp-max-bar", ((tempMax + 10) / 55) * 100);

    const feelsLike = Math.round(data.main.feels_like);
    setText("feels-like", feelsLike + unitSymbol);
    
    const feelsCircle = document.getElementById("feels-circle");
    if (feelsCircle) {
        const tempC = currentUnit === "metric" ? feelsLike : (feelsLike - 32) * (5 / 9);
        const gaugeVal = Math.min(Math.max(((tempC + 10) / 55) * 100, 0), 100);
        feelsCircle.setAttribute("stroke-dasharray", `${gaugeVal}, 100`);
    }

    const tempC = currentUnit === "metric" ? data.main.temp : (data.main.temp - 32) * (5 / 9);
    const dewC = Math.round(tempC - ((100 - humidity) / 5));
    const dewDisplay = currentUnit === "metric" ? dewC : Math.round((dewC * 9 / 5) + 32);
    setText("dew-point", dewDisplay + unitSymbol);
    setBarWidth("dew-bar", ((dewC + 10) / 55) * 100);

    const windDeg = data.wind.deg || 0;
    setText("wind-dir", `${windDeg}°`);
    setText("wind-cardinal", getCardinalDirection(windDeg));
    setBarWidth("wind-dir-bar", (windDeg / 360) * 100);

    setText("sunrise", formatTime(data.sys.sunrise, data.timezone));
    setText("sunset", formatTime(data.sys.sunset, data.timezone));
}
// 🕒 Hourly Forecast
function updateHourlyForecast(forecastList) {
    const hourlyContainer = document.getElementById("hourlyContainer");
    if (!hourlyContainer) return;
    hourlyContainer.innerHTML = "";

    const next8Hours = forecastList.slice(0, 8);

    next8Hours.forEach(item => {
        const date = new Date(item.dt * 1000);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const iconClass = getWeatherIconClass(item.weather[0].icon);

        const card = document.createElement("div");
        card.className = "hour-card";
        card.innerHTML = `
            <p>${timeStr}</p>
            <i class="fa-solid ${iconClass}"></i>
            <h3>${Math.round(item.main.temp)}°</h3>
        `;
        hourlyContainer.appendChild(card);
    });

    const pop = Math.round((forecastList[0].pop || 0) * 100);
    setText("pop", `${pop}%`);
    setBarWidth("pop-bar", pop);
}

// 📅 Multi-Day Forecast
function updateDailyForecast(forecastList) {
    const forecastListEl = document.getElementById("forecastList");
    if (!forecastListEl) return;
    forecastListEl.innerHTML = "";

    const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
    const dailyData = {};

    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        if (!dailyData[dayName]) {
            dailyData[dayName] = {
                temp: item.main.temp,
                icon: item.weather[0].icon
            };
        }
    });

    Object.keys(dailyData).forEach(day => {
        const iconClass = getWeatherIconClass(dailyData[day].icon);
        const row = document.createElement("div");
        row.className = "forecast-row";
        row.innerHTML = `
            <span>${day}</span>
            <i class="fa-solid ${iconClass}"></i>
            <span>${Math.round(dailyData[day].temp)}${unitSymbol}</span>
        `;
        forecastListEl.appendChild(row);
    });
}

// ==========================================
// 📊 CHART.JS WEATHER TRENDS
// ==========================================

function updateWeatherChart(forecastList) {
    const ctx = document.getElementById("weatherChart");
    if (!ctx) return;

    const labels = forecastList.slice(0, 8).map(item => {
        return new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', hour12: true });
    });

    const temps = forecastList.slice(0, 8).map(item => Math.round(item.main.temp));
    const humidities = forecastList.slice(0, 8).map(item => item.main.humidity);

    if (weatherChart) weatherChart.destroy();

    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Temperature (${currentUnit === "metric" ? "°C" : "°F"})`,
                    data: temps,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity (%)',
                    data: humidities,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#ffffff', font: { family: 'Poppins' } } }
            },
            scales: {
                x: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { display: false } },
                y: { type: 'linear', position: 'left', ticks: { color: '#f59e0b' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                y1: { type: 'linear', position: 'right', ticks: { color: '#3b82f6' }, grid: { display: false } }
            }
        }
    });
}

// ==========================================
// 🗺 LEAFLET INTERACTIVE MAP
// ==========================================

function updateInteractiveMap(lat, lon, cityName) {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    if (!leafletMap) {
        leafletMap = L.map('map').setView([lat, lon], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMap);

        mapMarker = L.marker([lat, lon]).addTo(leafletMap)
            .bindPopup(`<b>${cityName}</b>`)
            .openPopup();
    } else {
        leafletMap.setView([lat, lon], 10);
        mapMarker.setLatLng([lat, lon])
            .bindPopup(`<b>${cityName}</b>`)
            .openPopup();
    }
}

// ==========================================
// 🌧 CANVAS PARTICLES ENGINE (Rain, Snow, Thunder)
// ==========================================

function initWeatherParticles(condition) {
    canvas = document.getElementById("weather-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = [];
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    if (condition === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const maxParticles = condition === "snow" ? 120 : 250;

    for (let i = 0; i < maxParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 18 + 10,
            radius: Math.random() * 3 + 1,
            speedY: condition === "snow" ? Math.random() * 1.5 + 0.8 : Math.random() * 10 + 12,
            speedX: condition === "snow" ? Math.random() * 1 - 0.5 : Math.random() * 2 - 1,
            opacity: Math.random() * 0.7 + 0.3
        });
    }

    animateParticles(condition);
}

function animateParticles(condition) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Random Thunder Flash Effect
    if (condition === "thunder" && Math.random() < 0.02) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    particles.forEach(p => {
        ctx.beginPath();
        if (condition === "snow") {
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
        } else {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.speedX, p.y + p.length);
            ctx.strokeStyle = `rgba(174, 214, 241, ${p.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
        }
    });

    animationFrameId = requestAnimationFrame(() => animateParticles(condition));
}

window.addEventListener("resize", () => {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// ==========================================
// LISTENERS & INITIALIZATION
// ==========================================

function detectUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => getWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => getWeather(currentQuery)
        );
    } else {
        getWeather(currentQuery);
    }
}

if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
            cityInput.value = "";
        }
    });
}

if (cityInput) {
    cityInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchBtn.click();
        }
    });
}

if (unitBtn) {
    unitBtn.addEventListener("click", () => {
        currentUnit = currentUnit === "metric" ? "imperial" : "metric";
        unitBtn.textContent = currentUnit === "metric" ? "°C" : "°F";
        getWeather(currentQuery);
    });
}

if (refreshBtn) {
    refreshBtn.addEventListener("click", () => getWeather(currentQuery));
}

if (locationBtn) {
    locationBtn.addEventListener("click", detectUserLocation);
}

// Initial Run
detectUserLocation();
// ==========================================
// INTERACTIVE FOOTER LOGIC
// ==========================================

// 1. UTC Clock Update
function updateUTCClock() {
    const now = new Date();
    const utcStr = now.toUTCString().split(" ")[4] + " UTC";
    const utcEl = document.getElementById("utc-clock");
    if (utcEl) utcEl.textContent = utcStr;
}
setInterval(updateUTCClock, 1000);
updateUTCClock();

// 2. City Chips Click Handlers
document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const cityName = btn.getAttribute("data-city");
        if (cityName) getWeather(cityName);
    });
});

// 3. Scroll To Top Button
const scrollTopBtn = document.getElementById("scrollTopBtn");
if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// 4. Footer Unit Switcher Sync
const footerUnitBtn = document.getElementById("footerUnitBtn");
if (footerUnitBtn) {
    footerUnitBtn.addEventListener("click", () => {
        const topUnitBtn = document.getElementById("unitBtn");
        if (topUnitBtn) topUnitBtn.click(); // Triggers existing unit change logic
    });
}
// ==========================================
// FOOTER FEEDBACK INTERACTION LOGIC
// ==========================================
let currentRating = 0;
const stars = document.querySelectorAll("#ratingStars .star");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackInput = document.getElementById("feedbackInput");
const feedbackMsg = document.getElementById("feedbackMsg");

// Star Rating Hover & Selection
stars.forEach((star) => {
    star.addEventListener("click", () => {
        currentRating = parseInt(star.getAttribute("data-value"));
        updateStars(currentRating);
    });
});

function updateStars(rating) {
    stars.forEach((s) => {
        const val = parseInt(s.getAttribute("data-value"));
        if (val <= rating) {
            s.classList.add("active");
        } else {
            s.classList.remove("active");
        }
    });
}

// Form Submission Handler
if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = feedbackInput.value.trim();

        if (!text) return;

        // Display Thank-you Message
        feedbackMsg.textContent = "Thank you for your feedback! ✨";
        feedbackInput.value = "";
        currentRating = 0;
        updateStars(0);

        // Auto-clear message after 4 seconds
        setTimeout(() => {
            feedbackMsg.textContent = "";
        }, 4000);
    });
}
// Share Dashboard Quick Action
const shareDashBtn = document.getElementById("shareDashBtn");
if (shareDashBtn) {
    shareDashBtn.addEventListener("click", () => {
        if (navigator.share) {
            navigator.share({
                title: 'WeatherPulse Dashboard',
                text: 'Check out live weather telemetry on WeatherPulse!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Dashboard link copied to clipboard! 🚀");
        }
    });
}