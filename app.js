document.addEventListener("DOMContentLoaded", () => {
  const temperature = document.getElementById("temperature");
  const humidity = document.getElementById("humidity");
  const windSpeed = document.getElementById("wind-speed");
  const weatherCondition = document.getElementById("weather-condition");
  const city = document.getElementById("location");

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

  function getWeatherByCity(cityName = DEFAULT_CITY, coords) {
    let url = BASE_URL;

    if (cityName === null) {
      url += `?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${API_KEY}`;
    } else {
      url += `?q=${cityName}&units=metric&appid=${API_KEY}`;
    }

    console.log(url);

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
      })
      .catch((err) => {
        console.error("❌ Weather Fetch Error:", err);
        city.innerHTML = "⚠️ Error fetching weather data.";
      });
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
