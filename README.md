# WeatherPulse — Interactive Weather Dashboard

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-orange?style=for-the-badge&logo=openweathermap&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)

A premium **interactive weather dashboard** built with **HTML, CSS, and JavaScript**, featuring real-time weather data, immersive video backgrounds, glassmorphism UI, animated weather effects, interactive maps, and detailed weather analytics.

---

# Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

# Overview

WeatherPulse is a modern weather application that transforms traditional weather forecasting into an engaging visual experience.

Instead of displaying only weather information, the application dynamically changes its background videos, weather animations, charts, and interface according to real-time atmospheric conditions.

The project combines modern frontend development techniques with external APIs and interactive data visualization to create a professional weather dashboard.

---

# Features

## Real-Time Weather

- Live weather data using OpenWeatherMap API
- Current temperature
- Feels-like temperature
- Humidity
- Wind Speed
- Pressure
- Visibility
- Weather description
- Weather icons

---

## Forecast

- Hourly Forecast
- 5-Day Forecast
- Daily High & Low temperatures
- Weather conditions
- Wind information

---

## Dynamic Video Backgrounds

Automatically switches high-quality background videos depending on weather conditions.

Supported conditions include:

- Clear
- Clouds
- Rain
- Drizzle
- Snow
- Thunderstorm
- Mist
- Clear Night
- Default background

---

## Automatic Day & Night Theme

The application automatically determines whether it's daytime or nighttime using:

- Sunrise time
- Sunset time

and updates:

- Background video
- Theme colors
- Weather animations

---

## Interactive Weather Particle Engine

Custom HTML5 Canvas weather effects:

- Rain particles
- Snow particles
- Lightning flashes
- Mist effects

All generated dynamically using JavaScript.

---

## Interactive Weather Map

Powered by Leaflet.js

Features include:

- Interactive world map
- Automatic city positioning
- Dynamic location marker
- Smooth map movement
- Zoom controls

---

## Weather Analytics

Interactive charts powered by Chart.js.

Visualizations include:

- 24-hour temperature trend
- Humidity trend
- Responsive animations
- Tooltips
- Live updates

---

## Modern Glassmorphism UI

Designed with a premium glassmorphism interface.

Features include:

- Blur effects
- Animated cards
- Responsive layout
- Gradient overlays
- Smooth transitions
- Hover animations

---

## Additional Features

- Live UTC Clock
- Search any city
- Quick city search chips
- Temperature Unit Switcher (°C / °F)
- Scroll-to-top button
- Star Rating widget
- Social media links
- Fully responsive design
- Mobile friendly
- Desktop optimized

---

# Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)

### APIs

- OpenWeatherMap API

### Libraries

- Leaflet.js
- Chart.js
- Font Awesome

---

# Project Structure

```text
weather-pulse/
│
├── index.html
├── style.css
├── script.js
│
└── videos/
    ├── clear-day.mp4
    ├── clear-night.mp4
    ├── clouds.mp4
    ├── rain.mp4
    ├── drizzle.mp4
    ├── snow.mp4
    ├── thunder.mp4
    ├── mist.mp4
    └── default.mp4
```

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/weather-pulse.git

cd weather-pulse
```

---

## 2. Get OpenWeatherMap API Key

Create a free account at:

https://openweathermap.org/api

Generate an API key.

---

## 3. Configure API Key

Open

```javascript
script.js
```

Replace

```javascript
const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";
```

with

```javascript
const API_KEY = "YOUR_API_KEY";
```

---

## 4. Run Local Server

Because browsers block local video autoplay from the file system, run the project using a local server.

### VS Code

Install **Live Server**

Right Click

```
index.html
```

Open with

```
Live Server
```

---

### Python

```bash
python -m http.server 5500
```

Visit

```
http://127.0.0.1:5500
```

---

# Usage

1. Enter any city name.
2. Press Search.
3. View live weather conditions.
4. Explore hourly and 5-day forecasts.
5. Interact with the map.
6. Switch between Celsius and Fahrenheit.
7. Enjoy immersive weather animations and video backgrounds.

---

## Forecast Section

> Add forecast screenshot here.

```
images/forecast.png
```

---

## Map View

> Add map screenshot here.

```
images/map.png
```

---

#  Future Improvements

- Air Quality Index (AQI)
- Weather Alerts
- UV Index
- Multiple Saved Cities
- Voice Search
- Geolocation Detection
- Sunrise & Sunset Animation
- Radar Layer
- Weather News
- Offline Support (PWA)
- Weather History
- Theme Customization
- Multiple Languages

---

# Contributing

Contributions are welcome!

If you'd like to improve WeatherPulse:

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# License

This project is licensed under the **Apache License 2.0**.

You are free to:

- Use
- Modify
- Distribute
- Fork
- Create derivative works

under the terms of the Apache License 2.0.

See the **LICENSE** file for complete details.

---

# Author

**Mobeen Fatima**

### GitHub

https://github.com/MobeenFatimaa

### LinkedIn

https://www.linkedin.com/in/mobeen-fatima-599a35347/

---

## Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates future improvements.

---

### Made with ❤️ using HTML, CSS, JavaScript, OpenWeatherMap API, Leaflet.js & Chart.js.
