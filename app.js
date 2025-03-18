document.addEventListener("DOMContentLoaded", () => {
  const temperature = document.getElementById("temperature");
  const humidity = document.getElementById("humidity");
  const windSpeed = document.getElementById("wind-speed");
  const weatherCondition = document.getElementById("weather-condition");
  const city = document.getElementById("location");
  let isCelsius = true; // Track temperature unit

  if (!temperature || !humidity || !windSpeed || !weatherCondition || !city) {
    console.error("❌ Some elements are missing in the DOM!");
    return;
  }

  const searchBtn = document.getElementById("search-btn");
  const cityInput = document.getElementById("city-input");

  if (!searchBtn || !cityInput) {
    console.error("❌ Search elements are missing in the DOM!");
    return;
  }

  searchBtn.addEventListener("click", () => {
    const cityName = cityInput.value.trim();
    if (cityName) {
      getWeatherByCity(cityName);
      cityInput.value = ""; // Clear the input field
    } else {
      alert("Please enter a city name.");
    }
  });

  cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const cityName = cityInput.value.trim();
      if (cityName) {
        getWeatherByCity(cityName);
        cityInput.value = ""; // Clear the input field
      } else {
        alert("Please enter a city name.");
      }
    }
  });

  const API_KEY = "91e761d11496e095b6a237a2e276520a";
  const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
  const DEFAULT_CITY = "New York,US";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("✅ Location permission granted", pos);
        getWeatherByCity(null, pos.coords);
      },
      (err) => {
        console.log("⚠️ Location permission denied", err);
        getWeatherByCity();
      }
    );
  } else {
    getWeatherByCity();
  }

  // Add temperature unit conversion
  temperature.addEventListener("click", () => {
    const temp = temperature.innerText.replace(/[°CF]/g, "");
    if (isCelsius) {
      const fahrenheit = (temp * 9) / 5 + 32;
      temperature.innerHTML = `${fahrenheit.toFixed(1)}°F`;
    } else {
      const celsius = ((temp - 32) * 5) / 9;
      temperature.innerHTML = `${celsius.toFixed(1)}°C`;
    }
    isCelsius = !isCelsius;
  });

  function getWeatherByCity(cityName = DEFAULT_CITY, coords) {
    let url = BASE_URL;
    // Show loading state
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.classList.remove("hidden");

    city.innerHTML = "🔄 Loading...";
    weatherCondition.innerHTML = "Fetching weather data...";
    temperature.innerHTML = "--°C";
    humidity.innerHTML = "--%";
    windSpeed.innerHTML = "-- km/h";

    if (cityName === null) {
      url += `?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${API_KEY}`;
    } else {
      url += `?q=${cityName}&units=metric&appid=${API_KEY}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.cod !== 200) throw new Error(data.message);

        temperature.innerHTML = `${data.main.temp.toFixed(1)}°C`;
        humidity.innerHTML = `${data.main.humidity}%`;
        windSpeed.innerHTML = `${data.wind.speed} km/h`;
        weatherCondition.innerHTML = `${getWeatherIcon(data.weather[0].main)} ${
          data.weather[0].description
        }`;
        city.innerHTML = `📍 ${data.name}, ${data.sys.country}`;

        // Update background based on weather and time
        updateBackground(
          data.weather[0].main,
          data.dt,
          data.sys.sunrise,
          data.sys.sunset
        );

        // Hide loading spinner
        loadingSpinner.classList.add("hidden");
      })
      .catch((err) => {
        console.error("❌ Weather Fetch Error:", err);
        city.innerHTML = "⚠️ Error fetching weather data.";
        loadingSpinner.classList.add("hidden");
      });
  }

  function updateBackground(weatherCondition, currentTime, sunrise, sunset) {
    const body = document.getElementById("app-background");
    const isDay = currentTime > sunrise && currentTime < sunset;

    const backgrounds = {
      Clear: isDay
        ? "from-blue-400 to-purple-500"
        : "from-gray-900 to-blue-900",
      Clouds: "from-gray-400 to-gray-600",
      Rain: "from-gray-600 to-blue-800",
      Snow: "from-blue-100 to-blue-300",
      Thunderstorm: "from-gray-800 to-purple-900",
      Drizzle: "from-gray-400 to-blue-600",
      Mist: "from-gray-300 to-gray-500",
      default: "from-blue-400 to-purple-500",
    };

    const newBackground = backgrounds[weatherCondition] || backgrounds.default;
    body.className = `bg-gradient-to-r ${newBackground} flex justify-center items-center min-h-screen transition-all duration-500`;
  }

  function getWeatherIcon(condition) {
    const icons = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Thunderstorm: "⛈️",
      Drizzle: "🌦️",
      Snow: "❄️",
      Mist: "🌫️",
      Smoke: "💨",
      Haze: "🌁",
      Fog: "🌁",
      Dust: "🌪️",
      Sand: "🏜️",
      Ash: "🌋",
      Squall: "🌪️",
      Tornado: "🌪️",
    };
    return icons[condition] || "🌡️";
  }
});

const lastCity = localStorage.getItem("lastCity") || DEFAULT_CITY;
getWeatherByCity(lastCity);

// Add refresh button functionality
const refreshBtn = document.createElement("button");
refreshBtn.innerHTML = "🔄";
refreshBtn.className =
  "absolute top-4 right-4 text-2xl hover:rotate-180 transition-transform duration-500";
refreshBtn.addEventListener("click", () => {
  const currentCity = city.innerText.split(",")[0].replace("📍 ", "");
  getWeatherByCity(currentCity);
});
document.querySelector(".bg-white").appendChild(refreshBtn);

// Save the original function
const originalGetWeatherByCity = getWeatherByCity;

// Define forecast URL
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Function to get forecast data
function getForecast(cityName) {
  const url = `${FORECAST_URL}?q=${cityName}&units=metric&appid=${API_KEY}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.cod !== "200") throw new Error(data.message);

      // Process and display 5-day forecast
      const dailyForecasts = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      const forecastContainer = document.createElement("div");
      forecastContainer.className = "mt-6 grid grid-cols-5 gap-2 text-sm";

      dailyForecasts.slice(0, 5).forEach((day) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        const dayForecast = document.createElement("div");
        dayForecast.className =
          "text-center p-2 rounded-lg bg-white bg-opacity-10";
        dayForecast.innerHTML = `
          <p class="font-semibold">${dayName}</p>
          <p class="text-xl">${getWeatherIcon(day.weather[0].main)}</p>
          <p>${day.main.temp.toFixed(1)}°C</p>
        `;

        forecastContainer.appendChild(dayForecast);
      });

      // Remove existing forecast if any
      const existingForecast = document.querySelector(".forecast-container");
      if (existingForecast) existingForecast.remove();

      // Add forecast-container class for easy removal
      forecastContainer.classList.add("forecast-container");
      document.querySelector(".bg-white").appendChild(forecastContainer);
    })
    .catch((err) => {
      console.error("❌ Forecast Fetch Error:", err);
    });
}

// Create a single wrapper that combines all functionality
getWeatherByCity = (cityName = DEFAULT_CITY, coords) => {
  // Save the last searched city
  if (cityName !== null) {
    localStorage.setItem("lastCity", cityName);
  }

  // Call the original weather function
  originalGetWeatherByCity(cityName, coords);

  // Get forecast if we have a city name
  if (cityName !== null) {
    getForecast(cityName);
  }
};
