document.addEventListener("DOMContentLoaded", () => {
  /*
    - Get current geolocation from the browser
    - Add geolocation to openstreetmap to get city, state, country
    - Add geolocation to openweathermap to get current weather and forecast
    - Display current location info, current weather, and forecast

    - Get new location from search form
    - Add geolocation to openstreetmap to get new city, state, country
    - Add geolocation to openweathermap to get searched city's weather and forecast
    - Display new location info, weather, and forecast

    - Click on save location button
    - Check for duplicates
    - If no entry save info for: city, geolocation to local storage
    - List saved cities

    - Click on saved location
    - Get city name, geolocation   
    - Pass geolocation to displayWeather(), displayCity(), displayForecast()

    - Delete saved location
    - Check if the city exist in local storage
    - Delete if entry exists

    - Display current date
  */

  const weatherAPIKey = "f03874a827248a945d8fbd5eb299389c";
  let lat, lon;
  let cityName;

  /*
   * DISPLAY DATA
   * Codes for displaying city and weather info
  */

  // Displays city name
  async function displayCity(locationUrl) {
    try {
      const response = await fetch(locationUrl);
      const data = await response.json();

      cityName = data.address.city || data.address.town || data.address.village;
      const state = data.address.state;
      const country = data.address.country;

      lat = data.lat;
      lon = data.lon;

      const locationElement = document.getElementById("cityState").querySelector("h2");

      if (cityName) {
        locationElement.innerHTML = `${cityName}`;
        if ((state) && (country)) {
          locationElement.innerHTML += `<span>${state}, ${country}</span>`;
        }
        else if ((state) && (!country)) {
          locationElement.innerHTML += `<span>${state}</span>`;
        }
        else if ((!state) && (country)) {
          locationElement.innerHTML += `<span>${country}</span>`;
        } 
      } else {
        locationElement.innerHTML = `Unknown Location`;
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  }  

  // Displays current weather
  async function displayWeather(weatherUrl) {
    try {
      const response = await fetch(weatherUrl);
      const data = await response.json();

      const description = data.weather[0].description;
      const weatherIcon = data.weather[0].icon;
      const city = data.name;
      const country = data.sys.country;
      const tempData = data.main.temp;
      const temp = Math.ceil(tempData);
      const humidity = data.main.humidity;

      const iconElement = document.getElementById("todayIcon");
      const locationElement = document.getElementById("cityState").querySelector("h2");
      const tempElement = document.getElementById("todayTemp");
      const humidityElement = document.getElementById("todayHumidity");

      if (city) {
        iconElement.innerHTML = `<img src="dist/images/${weatherIcon}.svg" alt="${city}, ${country} - ${description}">`;
        tempElement.innerHTML = `${temp}º`;
        humidityElement.innerHTML = `${humidity}%`;

        if (weatherIcon.indexOf('n') > -1) {
          iconElement.classList.add('night');
        } else {
          iconElement.classList.remove('night');
        }
      } else {
        locationElement.innerHTML = `<h2>Unknown City</h2>`;
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  // Displays 5-day forecast
  async function displayForecast(forecastUrl) {
    try {
      const response = await fetch(forecastUrl);
      const data = await response.json();

      const forecastDateOptions = { weekday: "short" };
      const forecastDateElement = document.getElementById("forecastDates");
      let forecastHTML = "";

      // Get weather data for the next 5 days (filtered to one per day at 12:00)
      const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));

      for (let i = 0; i < 5; i++) {
        const forecast = dailyForecasts[i];
        const description = forecast.weather[0].description
        const weatherIcon = forecast.weather[0].icon;
        const tempData = forecast.main.temp;
        const temp = Math.ceil(tempData);

        const date = new Date(forecast.dt_txt);
        const formattedDate = new Intl.DateTimeFormat("en-US", forecastDateOptions).format(date);

        forecastHTML += `
          <li class="app-container__day">
            <h4>${formattedDate}</h4>
            <img src="dist/images/${weatherIcon}.svg" alt="${description}">
            <h5>${temp}º</h5>
          </li>`;
      }

      forecastDateElement.innerHTML = forecastHTML;
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  }

  /* 
   * RETRIEVE DATA
   * Codes for fetching current and new city info
  */

  // Get current location info from browser and fetch weather data
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        console.log(`Current location latitude: ${lat} \nCurrent location longitude: ${lon}`);

        const currentLocationUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        displayCity(currentLocationUrl);
        console.log(`Current location: \n${cityName} ${lat} ${lon}\n${currentLocationUrl}`);

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${weatherAPIKey}&units=imperial`;
        displayWeather(currentWeatherUrl);
        console.log(`Current weather: \n${cityName} ${lat} ${lon}\n${currentWeatherUrl}`);

        const currentForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherAPIKey}&units=imperial`;
        displayForecast(currentForecastUrl);
        console.log(`Current forecast: \n${cityName} ${lat} ${lon}\n${currentForecastUrl}`);
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  // Search new location and fetch new weather data
  document.getElementById("cityForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const cityName = document.getElementById("cityInput").value;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        console.log(`Search form result:`, cityName, lat, lon);

        const searchLocationUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        displayCity(searchLocationUrl);
        console.log(`Searched location: \n${cityName} ${lat} ${lon}\n${searchLocationUrl}`);

        const searchWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${weatherAPIKey}&units=imperial`;
        displayWeather(searchWeatherUrl);
        console.log(`Searched weather: \n${cityName} ${lat} ${lon}\n${searchWeatherUrl}`);

        const searchForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherAPIKey}&units=imperial`;
        displayForecast(searchForecastUrl);
        console.log(`Searched forecast: \n${cityName} ${lat} ${lon}\n${searchForecastUrl}`);
      } else {
        console.log("No results");
        document.getElementById("cityState").innerHTML = `<h2>No results found for "${cityName}"</h2>`;
      }
    } catch (error) {
      console.error("Error fetching geocoding data:", error);
    }
  });

  /*
   * LOCAL STORAGE
   * Codes for storing and retrieving saved city info
  */

  // Store location info when save location button is clicked
  const buttonSave = document.getElementById('saveLocation');
  
  buttonSave.addEventListener("click", function() {
    if (cityName && lat && lon) {
      const locationData = {
        City: cityName,
        Latitude: lat,
        Longitude: lon
      };
      console.log(cityName, lat, lon);

      // Retrieve existing locations from local storage
      const savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];

      // Check for duplicates and case sensitivity
      const existingLocation = savedLocations.find(location => (
        location.City.toLowerCase() === locationData.City.toLowerCase()
      ));

      if (!existingLocation) {
        // Add new location
        savedLocations.push(locationData);

        // Save location to local storage
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
        console.log("Saved locations", locationData);

        const savedLocationsElement = document.getElementById('savedLocations');
        if (savedLocationsElement) {
          savedLocationsElement.innerHTML = savedLocations.map(location => `
            <li><button class="saved-city" name="${location.City}" latitude="${location.Latitude}" longitude="${location.Longitude}">${location.City}: ${location.Latitude}, ${location.Longitude}</button> <button class="delete-city" name="${location.City}">Delete</button></li>
          `).join('');
        }

        // Update the displayed saved locations
        displaySavedLocations();
        console.log(`${cityName} ${lat} ${lon} is saved.`);
      } else {
        console.log(`${cityName} ${lat} ${lon} is already saved.`);
      }
    } else {
      console.log("Cannot save location: city name, latitude, longitude is missing.");
    }
  });

  // Display list of saved locations
  function displaySavedLocations() {
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];
    const savedLocationsElement = document.getElementById('savedLocations');

    if (savedLocationsElement) {
      savedLocationsElement.innerHTML = savedLocations.map(location => `
        <li><button class="saved-city" name="${location.City}" latitude="${location.Latitude}" longitude="${location.Longitude}">${location.City}: ${location.Latitude}, ${location.Longitude}</button> <button class="delete-city" name="${location.City}">Delete</button></li>
      `).join('');
    }
  }

  // Call the display function on load
  displaySavedLocations();

  // Delete saved locations
  document.getElementById('savedLocations').addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-city')) {
      const cityName = event.target.getAttribute('name');
      const savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];

      const indexToDelete = savedLocations.findIndex(location => (
        location.City === cityName
      ));

      if (indexToDelete !== -1) {
        savedLocations.splice(indexToDelete, 1);
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
        console.log(`${cityName} deleted.`);
        displaySavedLocations();
      } else {
        console.log(`Could not find ${cityName} to delete.`);
      }
    }
  });


  // Display saved city's weather
  document.getElementById('savedLocations').addEventListener('click', async function(event) {
    if (event.target.classList.contains('saved-city')) {
      const cityName = event.target.getAttribute('name');
      const lat = event.target.getAttribute('latitude');
      const lon = event.target.getAttribute('longitude');

      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(`Saved location result:`, cityName, lat, lon);

        const savedLocationUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        displayCity(savedLocationUrl);
        console.log(`Saved location URL:`, savedLocationUrl);

        const savedWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${weatherAPIKey}&units=imperial`;
        displayWeather(savedWeatherUrl);
        console.log("Saved weather URL:", savedWeatherUrl);

        const savedForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherAPIKey}&units=imperial`;
        displayForecast(savedForecastUrl);
        console.log("Saved forecast URL:", savedForecastUrl);        

      } catch (error) {
        console.log(`Error fetching saved location info:`, error);
      }
    }
  });

  // //
  document.getElementById('viewLocations').addEventListener('click', function() {
    const savedLocationsElement = document.getElementById('savedLocationsList');

    if (savedLocationsElement.classList.contains('hide')) {
      savedLocationsElement.classList.toggle('hide');
      savedLocationsElement.classList.toggle('show');
      console.log(`${savedLocationsElement.classList}`);
    } else {
      savedLocationsElement.classList.toggle('hide');
      savedLocationsElement.classList.toggle('show');
    }
  });

  // Get today's date
  const currentDate = new Date();
  const currentDateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedCurrentDate = new Intl.DateTimeFormat("en-US", currentDateOptions).format(currentDate);
  document.getElementById("todayDate").innerHTML = `<h3>${formattedCurrentDate}</h3>`;  

}); // End DOM
