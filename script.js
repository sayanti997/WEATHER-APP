

const API_KEY = "1b7484425d43486581220132252611";

// UI ELEMENTS
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const themeBtn = document.getElementById("themeBtn");

const cityNameEl = document.getElementById("cityName");
const localTimeEl = document.getElementById("localTime");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const visEl = document.getElementById("vis");
const iconEl = document.getElementById("icon");

const dailyEl = document.getElementById("daily");
const hourlyEl = document.getElementById("hourly");

const toastEl = document.getElementById("toast");

// TOAST
function showToast(msg, ms = 2000) {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  setTimeout(() => toastEl.classList.add("hidden"), ms);
}

// Get Weather by city
async function getWeather(city) {
  try {
    showToast("Fetching weather for " + city);

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=yes&alerts=no`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    renderWeather(data);

  } catch (err) {
    showToast("Error: " + err.message);
  }
}

// Render the UI
function renderWeather(data) {
  const cur = data.current;
  const loc = data.location;
  const forecast = data.forecast.forecastday;

  // Current
  cityNameEl.textContent = `${loc.name}, ${loc.country}`;
  localTimeEl.textContent = loc.localtime;
  tempEl.textContent = cur.temp_c;
  descEl.textContent = cur.condition.text;
  feelsEl.textContent = cur.feelslike_c;
  humidityEl.textContent = cur.humidity;
  windEl.textContent = cur.wind_kph;
  pressureEl.textContent = cur.pressure_mb;
  visEl.textContent = cur.vis_km;

  iconEl.className = "icon";
  iconEl.innerHTML = `<img src="${cur.condition.icon}" width="80">`;

  // 7-Day Forecast
  dailyEl.innerHTML = "";
  forecast.forEach(day => {
    const d = new Date(day.date).toLocaleDateString(undefined, { weekday: "short" });

    dailyEl.innerHTML += `
      <div class="card">
        <div class="day">${d}</div>
        <img src="${day.day.condition.icon}" width="50">
        <div class="range">${day.day.maxtemp_c}° / ${day.day.mintemp_c}°</div>
      </div>
    `;
  });

  // 12-Hour forecast
  hourlyEl.innerHTML = "";
  const hours = forecast[0].hour;

  const nowHour = new Date(loc.localtime).getHours();

  for (let i = 1; i <= 12; i++) {
    let hr = hours[(nowHour + i) % 24];

    hourlyEl.innerHTML += `
      <div class="hour-card">
        <div>${hr.time.split(" ")[1]}</div>
        <img src="${hr.condition.icon}" width="40">
        <div>${hr.temp_c}°C</div>
      </div>
    `;
  }
}

// Search button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showToast("Enter a city");
  getWeather(city);
});

// Enter key search
cityInput.addEventListener("keyup", e => {
  if (e.key === "Enter") searchBtn.click();
});

// Geolocation
locBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showToast("Geolocation not supported");

  showToast("Detecting your location...");

  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    getWeather(`${latitude},${longitude}`);
  });
});

// Theme toggle
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Load default city
getWeather("London");
