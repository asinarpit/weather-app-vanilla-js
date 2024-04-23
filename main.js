const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const currentWeatherIcon = document.getElementById("currentWeatherIcon");
const currentWeatherCondition = document.getElementById(
  "currentWeatherCondition"
);
const currentTemp = document.getElementById("currentTemp");
const currentTempRange = document.getElementById("currentTempRange");
const searchBtn = document.getElementById("searchBtn");

const weatherMapping = {
  Thunderstorm: {
    icon: "<i class='fa-solid fa-cloud-bolt'></i>",
    backgroundImage: "url(./images/thunderstorm.jpg)",
  },
  Drizzle: {
    icon: "<i class='fa-solid fa-cloud-rain'></i>",
    backgroundImage: "url(./images/drizzle.jpg)",
  },
  Rain: {
    icon: "<i class='fa-solid fa-cloud-showers-heavy'></i>",
    backgroundImage: "url(./images/rain.jpg)",
  },
  Snow: {
    icon: "<i class='fa-solid fa-snowflake'></i>",
    backgroundImage: "url(./images/snow.jpg)",
  },
  Clear: {
    icon: "<i class='fa-solid fa-sun'></i>",
    backgroundImage: "url(./images/clear.jpg)",
  },
  Clouds: {
    icon: "<i class='fa-solid fa-cloud'></i>",
    backgroundImage: "url(./images/clouds.jpg)",
  },
  Atmosphere: {
    icon: "<i class='fa-solid fa-smog'></i>",
    backgroundImage: "url(./images/fog.jpg)",
  },
};

const API_KEY = "085ad07566b319c2915a85f161a7aa92";

document.addEventListener("DOMContentLoaded", () => {
  // checkning for the geolocation presence
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(lat, lon);

        try {
          showLoader();
          const data = await fetchWeather(lat, lon);
          console.log(data);
          updateUI(data);

          hideLoader();
        } catch (error) {
          console.error("Error fetching current weather: ", error);
        }
      },
      (error) => {
        console.error("Error fetching current location", error);
      }
    );
  } else {
    console.log(false);
  }

  try {
    searchBtn.addEventListener("click", async () => {
      showLoader();
      const data = await fetchWeatherByCityName();
      console.log(data);
      // fetchHourlyWeather(data);
      updateUI(data);

      hideLoader();
    });
  } catch (error) {
    console.error("Error fetching weather data: ", error);
  }
});

const fetchWeather = async (lat, lon) => {
  return fetch(
    `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric

    `
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    })
    .then((data) => {
      return data;
    })

    .catch((error) => {
      console.error("Error fetching the data:", error);
    });
};

const updateUI = (data) => {
  handleNav(data);
  const city = data.city.name;
  const date = data.list[0].dt_txt.split(" ")[0];
  const year = date.split("-")[0];
  const day = date.split("-")[1];
  // console.log(year, day);

  const datef = new Date(data.list[0].dt_txt.split(" ")[0]);
  // console.log(datef);

  const month = datef.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[month];
  // console.log(monthName);

  cityName.innerText = city;
  currentDate.innerHTML = `${monthName} ${day}, ${year}`;
  currentWeatherCondition.innerText = data.list[0].weather[0].main;
  currentTemp.innerHTML = `${data.list[0].main.temp.toFixed(
    0
  )}<sup>&deg;</sup>`;
  currentTempRange.innerHTML = `${data.list[0].main.temp_min.toFixed(
    0
  )}&deg;/<span>${data.list[0].main.temp_max.toFixed(
    0
  )}&deg;</span>`;

  const condition = data.list[0].weather[0].main;
  currentWeatherIcon.innerHTML = showIcon(condition);

  changeBgImage(condition);
  console.log(condition);
};

const fetchWeatherByCityName = async () => {
  const city = inputField.value;
  if (city.trim().length === 0) {
    alert("Please enter city name");
    hideLoader();
  }
  console.log(city);

  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=2&appid=${API_KEY}`
    );
    const data = await response.json();
    const lat = data[0].lat;
    const lon = data[0].lon;
    console.log(lat, lon);
    const weatherData = await fetchWeather(lat, lon);
    return weatherData;
  } catch (err) {
    console.log(err);
    alert("Please enter valid city name");
    hideLoader();
  }
};

const showLoader = () => {
  const divElement = document.createElement("div");
  divElement.innerHTML = `<span class="loader"></span>`;
  divElement.classList.add("loader-active");
  document.body.appendChild(divElement);
};

const hideLoader = () => {
  const loaderElement = document.querySelector(".loader-active");
  if (loaderElement) {
    setTimeout(() => {
      loaderElement.remove();
    }, 1000);
  }
};

const fetchHourlyWeather = (data) => {
  const forecastList = document.getElementById("forecastList");
  forecastList.innerHTML = "";
  data.list
    .filter((item, index) => index < 8)
    .map((item) => {
      const time = item.dt_txt.split(" ")[1].split(":")[0];
      const formatTime = time % 12 || 12;
      const temp = item.main.temp.toFixed(0);

      // console.log(temp)
      const liElement = document.createElement("li");
      liElement.classList.add("list-item");
      liElement.innerHTML = `<p class="text-3xl text-white font-medium">${formatTime} ${
        item.sys.pod === "n" ? "pm" : "am"
      }</p>
  <span class="text-white text-3xl" >${showIcon(item.weather[0].main)}</span>
  <p class="text-3xl text-white font-medium">${temp}<sup>&deg;</sup></p>`;
      forecastList.appendChild(liElement);
    });
};

const fetchDailyWeather = (data) => {
  const forecastList = document.getElementById("forecastList");
  forecastList.innerHTML = "";
  data.list
    .filter((i) => i.dt_txt.split(" ")[1].split(":")[0] === "00")
    .map((item) => {
      // console.log(item.dt_txt);
      const now = new Date(item.dt_txt.split(" ")[0]);
      const day = now.getDay();

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      // console.log(day);
      const dayName = dayNames[day];
      // console.log(dayName);
      const temp = item.main.temp.toFixed(0);

      const liElement = document.createElement("li");
      liElement.classList.add("list-item");
      liElement.innerHTML = `<p class="text-3xl text-white font-medium">${dayName}</p>
      <span class="text-white text-3xl">${showIcon(item.weather[0].main)}</span>
<p class="text-3xl text-white font-medium">${temp}<sup>&deg;</sup></p>`;
      console.log(item);
      forecastList.appendChild(liElement);
    });
};

// handling navbar

const handleNav = (data) => {
  const hourly = document.getElementById("hourly");
  const daily = document.getElementById("daily");

  fetchHourlyWeather(data);
  hourly.classList.add("active");

  hourly.addEventListener("click", () => {
    fetchHourlyWeather(data);
    hourly.classList.add("active");
    daily.classList.remove("active");
  });

  daily.addEventListener("click", () => {
    fetchDailyWeather(data);
    hourly.classList.remove("active");
    daily.classList.add("active");
  });
};

const showIcon = (condition) => {
  return weatherMapping[condition] ? weatherMapping[condition].icon : "";
};

const changeBgImage = (condition) => {
  const backgroundImage = weatherMapping[condition]
    ? weatherMapping[condition].backgroundImage
    : "";
  document.body.style.backgroundImage = backgroundImage;
};
