// Weather Application by Sanaz Naghdi

// API Configuration
const apiKey = "YOUR_API_KEY"; // Replace with your own OpenWeatherMap API key
const apiBaseUrl = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const cityElement = document.querySelector("#city");
const dateElement = document.querySelector("#date");
const descriptionElement = document.querySelector("#description");
const iconElement = document.querySelector("#icon");
const temperatureElement = document.querySelector("#temperature");
const windElement = document.querySelector("#wind");
const humidityElement = document.querySelector("#humidity");
const feelsLikeElement = document.querySelector("#feels-like");
const forecastElement = document.querySelector("#forecast");
const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const celsiusLink = document.querySelector("#celsius-link");
const fahrenheitLink = document.querySelector("#fahrenheit-link");

// Global Variables
let currentTemperatureCelsius = null;

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[date.getDay()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${hours}:${minutes}`;
}

// Format day for forecast
function formatDay(timestamp) {
  const date = new Date(timestamp * 1000);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

// Display forecast
function displayForecast(response) {
  const forecast = response.data.daily;
  
  let forecastHTML = '<div class="row">';
  
  // Use only 5 days for forecast
  forecast.slice(1, 6).forEach(function(forecastDay) {
    forecastHTML += `
      <div class="col">
        <div class="forecast-day">
          <div class="forecast-date">${formatDay(forecastDay.dt)}</div>
          <img
            src="https://openweathermap.org/img/wn/${forecastDay.weather[0].icon}@2x.png"
            alt="${forecastDay.weather[0].description}"
            class="forecast-icon"
          />
          <div class="forecast-temperatures">
            <span class="forecast-temperature-max">${Math.round(forecastDay.temp.max)}°</span>
            <span class="forecast-temperature-min">${Math.round(forecastDay.temp.min)}°</span>
          </div>
        </div>
      </div>
    `;
  });
  
  forecastHTML += '</div>';
  forecastElement.innerHTML = forecastHTML;
}

// Get forecast data
function getForecast(coordinates) {
  let apiUrl = `${apiBaseUrl}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => displayForecast(data))
    .catch(error => console.error("Error fetching forecast data:", error));
}

// Display current weather data
function displayWeather(response) {
  const data = response.data;
  
  // Store temperature in Celsius for conversion
  currentTemperatureCelsius = Math.round(data.main.temp);
  
  // Update UI elements
  cityElement.innerHTML = data.name;
  dateElement.innerHTML = formatDate(data.dt);
  descriptionElement.innerHTML = data.weather[0].description;
  iconElement.setAttribute(
    "src",
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  );
  iconElement.setAttribute("alt", data.weather[0].description);
  temperatureElement.innerHTML = currentTemperatureCelsius;
  windElement.innerHTML = Math.round(data.wind.speed);
  humidityElement.innerHTML = data.main.humidity;
  feelsLikeElement.innerHTML = Math.round(data.main.feels_like);
  
  // Get forecast data for this location
  getForecast(data.coord);
}

// Search for a city
function searchCity(city) {
  let apiUrl = `${apiBaseUrl}/weather?q=${city}&appid=${apiKey}&units=metric`;
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => displayWeather(data))
    .catch(error => {
      console.error("Error fetching weather data:", error);
      alert("Could not find this city. Please try another one.");
    });
}

// Handle search form submission
function handleSubmit(event) {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    searchCity(city);
  }
}

// Convert to Fahrenheit
function displayFahrenheitTemperature(event) {
  event.preventDefault();
  
  // Remove and add active class for styling
  celsiusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  
  // Convert and display
  const fahrenheit = Math.round((currentTemperatureCelsius * 9) / 5 + 32);
  temperatureElement.innerHTML = fahrenheit;
}

// Convert to Celsius
function displayCelsiusTemperature(event) {
  event.preventDefault();
  
  // Remove and add active class for styling
  fahrenheitLink.classList.remove("active");
  celsiusLink.classList.add("active");
  
  // Display Celsius temperature
  temperatureElement.innerHTML = currentTemperatureCelsius;
}

// Get user's current location weather
function getCurrentLocationWeather() {
  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    let apiUrl = `${apiBaseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => displayWeather(data))
      .catch(error => console.error("Error fetching current location weather:", error));
  }
  
  function error() {
    console.error("Unable to retrieve your location");
    // Default to a city if geolocation fails
    searchCity("New York");
  }
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    console.error("Geolocation is not supported by your browser");
    // Default to a city if geolocation is not supported
    searchCity("New York");
  }
}

// Event listeners
searchForm.addEventListener("submit", handleSubmit);
celsiusLink.addEventListener("click", displayCelsiusTemperature);
fahrenheitLink.addEventListener("click", displayFahrenheitTemperature);

// On load, get current location or default city
document.addEventListener("DOMContentLoaded", function() {
  getCurrentLocationWeather();
});