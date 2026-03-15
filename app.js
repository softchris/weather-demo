// ===== DOM Elements =====
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const geoBtn = document.getElementById('geo-btn');
const cityResults = document.getElementById('city-results');
const errorMessage = document.getElementById('error-message');
const loader = document.getElementById('loader');
const weatherContent = document.getElementById('weather-content');
const currentCity = document.getElementById('current-city');
const currentDate = document.getElementById('current-date');
const currentIcon = document.getElementById('current-icon');
const currentTemp = document.getElementById('current-temp');
const currentDesc = document.getElementById('current-desc');
const currentFeels = document.getElementById('current-feels');
const currentHumidity = document.getElementById('current-humidity');
const currentWind = document.getElementById('current-wind');
const currentUv = document.getElementById('current-uv');
const currentPrecipProb = document.getElementById('current-precip-prob');
const currentPollen = document.getElementById('current-pollen');
const forecastGrid = document.getElementById('forecast-grid');
const backToToday = document.getElementById('back-to-today');
const hourlyScroll = document.getElementById('hourly-scroll');

// Stored state for day-click navigation
let lastForecastData = null;
let lastPollenData = null;
let lastCityName = '';
let selectedDayIndex = -1; // -1 = live current weather

// ===== API URLs =====
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// ===== City Background Image (Pexels API) =====
// Get your free API key at https://www.pexels.com/api/
const PEXELS_API_KEY = '';
const cityBg = document.getElementById('city-bg');
const cityBgOverlay = document.getElementById('city-bg-overlay');

async function fetchCityImage(cityName) {
  if (!PEXELS_API_KEY) return null;

  const rawName = cityName.split(',')[0].trim();
  const queries = [
    `${rawName} city skyline`,
    `${rawName} cityscape`,
    rawName,
  ];

  for (const query of queries) {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5&size=large`;
      const res = await fetch(url, {
        headers: { Authorization: PEXELS_API_KEY },
      });
      if (!res.ok) continue;
      const data = await res.json();

      if (data.photos && data.photos.length > 0) {
        // Pick a random photo from top results for variety
        const idx = Math.floor(Math.random() * Math.min(data.photos.length, 3));
        return data.photos[idx].src.landscape;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function setCityBackground(imageUrl) {
  // Always clear the old image first
  cityBg.classList.remove('city-bg--active');
  cityBgOverlay.classList.remove('city-bg-overlay--active');

  if (imageUrl) {
    const img = new Image();
    img.onload = () => {
      cityBg.style.backgroundImage = `url('${imageUrl}')`;
      cityBg.classList.add('city-bg--active');
      cityBgOverlay.classList.add('city-bg-overlay--active');
    };
    img.src = imageUrl;
  } else {
    cityBg.style.backgroundImage = '';
  }
}

function clearCityBackground() {
  cityBg.classList.remove('city-bg--active');
  cityBgOverlay.classList.remove('city-bg-overlay--active');
  cityBg.style.backgroundImage = '';
}

// ===== WMO Weather Code Mapping =====
const weatherCodes = {
  0:  { desc: 'Clear sky',          emoji: '☀️', night: '🌙', gradient: 'clear' },
  1:  { desc: 'Mainly clear',       emoji: '🌤️', night: '🌙', gradient: 'clear' },
  2:  { desc: 'Partly cloudy',      emoji: '⛅',  night: '☁️', gradient: 'cloudy' },
  3:  { desc: 'Overcast',           emoji: '☁️',  night: '☁️', gradient: 'cloudy' },
  45: { desc: 'Fog',                emoji: '🌫️', night: '🌫️', gradient: 'cloudy' },
  48: { desc: 'Rime fog',           emoji: '🌫️', night: '🌫️', gradient: 'cloudy' },
  51: { desc: 'Light drizzle',      emoji: '🌦️', night: '🌧️', gradient: 'rain' },
  53: { desc: 'Moderate drizzle',   emoji: '🌦️', night: '🌧️', gradient: 'rain' },
  55: { desc: 'Dense drizzle',      emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  56: { desc: 'Freezing drizzle',   emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  57: { desc: 'Dense freezing drizzle', emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  61: { desc: 'Slight rain',        emoji: '🌦️', night: '🌧️', gradient: 'rain' },
  63: { desc: 'Moderate rain',      emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  65: { desc: 'Heavy rain',         emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  66: { desc: 'Freezing rain',      emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  67: { desc: 'Heavy freezing rain', emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  71: { desc: 'Slight snow',        emoji: '🌨️', night: '🌨️', gradient: 'snow' },
  73: { desc: 'Moderate snow',      emoji: '❄️',  night: '❄️', gradient: 'snow' },
  75: { desc: 'Heavy snow',         emoji: '❄️',  night: '❄️', gradient: 'snow' },
  77: { desc: 'Snow grains',        emoji: '❄️',  night: '❄️', gradient: 'snow' },
  80: { desc: 'Slight rain showers', emoji: '🌦️', night: '🌧️', gradient: 'rain' },
  81: { desc: 'Moderate rain showers', emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  82: { desc: 'Violent rain showers', emoji: '🌧️', night: '🌧️', gradient: 'rain' },
  85: { desc: 'Slight snow showers', emoji: '🌨️', night: '🌨️', gradient: 'snow' },
  86: { desc: 'Heavy snow showers', emoji: '🌨️', night: '🌨️', gradient: 'snow' },
  95: { desc: 'Thunderstorm',       emoji: '⛈️', night: '⛈️', gradient: 'thunderstorm' },
  96: { desc: 'Thunderstorm with hail', emoji: '⛈️', night: '⛈️', gradient: 'thunderstorm' },
  99: { desc: 'Severe thunderstorm', emoji: '⛈️', night: '⛈️', gradient: 'thunderstorm' },
};

function getWeatherInfo(code) {
  return weatherCodes[code] || { desc: 'Unknown', emoji: '🌡️', night: '🌡️', gradient: 'clear' };
}

// ===== UI Helpers =====
function showLoader() {
  loader.hidden = false;
  weatherContent.hidden = true;
  errorMessage.hidden = true;
  cityResults.hidden = true;
}

function hideLoader() {
  loader.hidden = true;
}

function showError(message) {
  hideLoader();
  weatherContent.hidden = true;
  errorMessage.hidden = false;
  errorMessage.querySelector('.error__text').textContent = message;
}

function hideError() {
  errorMessage.hidden = true;
}

function setGradient(weatherCode, isDay) {
  const info = getWeatherInfo(weatherCode);
  const base = info.gradient;
  const suffix = (base === 'clear') ? (isDay ? '-day' : '-night') : '';
  const className = `gradient-${base}${suffix}`;

  document.body.className = '';
  document.body.classList.add(className);
}

// ===== Geocoding =====
async function searchCity(name) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=5&language=en&format=json`;
  const res = await fetch(url);

  if (!res.ok) throw new Error('Failed to search for city');

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`No results found for "${name}"`);
  }

  return data.results.map(r => ({
    name: r.name,
    country: r.country || '',
    admin1: r.admin1 || '',
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

function renderCityResults(results) {
  cityResults.innerHTML = '';
  cityResults.hidden = false;

  results.forEach(city => {
    const li = document.createElement('li');
    li.className = 'search__result-item';

    const location = [city.admin1, city.country].filter(Boolean).join(', ');
    li.innerHTML = `
      <strong>${city.name}</strong>
      ${location ? `<span class="search__result-country"> — ${location}</span>` : ''}
    `;

    li.addEventListener('click', () => {
      cityResults.hidden = true;
      const qualifier = [city.admin1, city.country].filter(Boolean).join(', ');
      const displayName = qualifier ? `${city.name}, ${qualifier}` : city.name;
      cityInput.value = displayName;
      loadForecast(city.latitude, city.longitude, displayName);
    });

    cityResults.appendChild(li);
  });
}

// ===== Geolocation =====
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error('Location access denied. Please allow location access or search by city name.'));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable.'));
            break;
          case err.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred.'));
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

// Reverse-lookup a display name from coordinates using the forecast timezone
async function resolveLocationName(lat, lon) {
  const url = `${GEOCODING_URL}?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1&language=en&format=json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) return data.results[0].name;
  } catch {
    // Fallback silently
  }
  return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

// ===== Forecast =====
async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day,uv_index',
    hourly: 'temperature_2m,weather_code,precipitation_probability,relative_humidity_2m,wind_speed_10m,uv_index,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: 7,
  });

  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
}

// ===== Pollen =====
async function fetchPollen(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: 'grass_pollen,birch_pollen,ragweed_pollen,alder_pollen,mugwort_pollen,olive_pollen',
    timezone: 'auto',
    forecast_days: 7,
  });

  try {
    const res = await fetch(`${AIR_QUALITY_URL}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    return processPollenData(data);
  } catch {
    return null;
  }
}

function processPollenData(data) {
  if (!data.hourly || !data.hourly.time) return null;

  const types = ['grass_pollen', 'birch_pollen', 'ragweed_pollen', 'alder_pollen', 'mugwort_pollen', 'olive_pollen'];
  const times = data.hourly.time;

  // Group hourly data by date and find max pollen across all types per day
  const dailyMax = {};
  times.forEach((t, i) => {
    const date = t.substring(0, 10);
    let maxVal = 0;
    for (const type of types) {
      const val = data.hourly[type]?.[i];
      if (val != null && val > maxVal) maxVal = val;
    }
    if (!dailyMax[date] || maxVal > dailyMax[date]) {
      dailyMax[date] = maxVal;
    }
  });

  return dailyMax;
}

function getPollenLevel(grains) {
  if (grains == null || grains === 0) return { label: 'None', emoji: '✅' };
  if (grains < 20) return { label: 'Low', emoji: '🟢' };
  if (grains < 80) return { label: 'Medium', emoji: '🟡' };
  if (grains < 200) return { label: 'High', emoji: '🟠' };
  return { label: 'Very High', emoji: '🔴' };
}

function getUvLabel(uv) {
  if (uv == null) return '—';
  const rounded = Math.round(uv * 10) / 10;
  if (uv <= 2) return `${rounded} Low`;
  if (uv <= 5) return `${rounded} Mod`;
  if (uv <= 7) return `${rounded} High`;
  if (uv <= 10) return `${rounded} V.High`;
  return `${rounded} Extreme`;
}

// ===== Rendering =====
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getDayName(dateStr, index) {
  if (index === 0) return 'Today';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getFullDayDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function renderCurrentWeather(data, cityName) {
  const current = data.current;
  const daily = data.daily;
  const info = getWeatherInfo(current.weather_code);
  const isDay = current.is_day === 1;

  currentCity.textContent = cityName;
  currentDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  currentIcon.textContent = isDay ? info.emoji : info.night;
  currentTemp.textContent = `${Math.round(current.temperature_2m)}°`;
  currentDesc.textContent = info.desc;
  currentFeels.textContent = `${Math.round(current.apparent_temperature)}°`;
  currentHumidity.textContent = `${current.relative_humidity_2m}%`;
  currentWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  currentUv.textContent = getUvLabel(current.uv_index);
  currentPrecipProb.textContent = daily.precipitation_probability_max?.[0] != null
    ? `${daily.precipitation_probability_max[0]}%` : '—';

  // Pollen for today
  if (lastPollenData && daily.time?.[0]) {
    const todayPollen = lastPollenData[daily.time[0]];
    const level = getPollenLevel(todayPollen);
    currentPollen.textContent = `${level.emoji} ${level.label}`;
  } else {
    currentPollen.textContent = '—';
  }

  backToToday.hidden = true;
  selectedDayIndex = -1;

  setGradient(current.weather_code, isDay);
  updateActiveCard();
  renderHourlyForecast(data, 0);
}

function renderDayDetail(dayIndex) {
  if (!lastForecastData) return;
  const daily = lastForecastData.daily;
  const info = getWeatherInfo(daily.weather_code[dayIndex]);

  selectedDayIndex = dayIndex;

  currentCity.textContent = lastCityName;
  currentDate.textContent = getFullDayDate(daily.time[dayIndex]);
  currentIcon.textContent = info.emoji;
  currentTemp.textContent = `${Math.round(daily.temperature_2m_max[dayIndex])}° / ${Math.round(daily.temperature_2m_min[dayIndex])}°`;
  currentDesc.textContent = info.desc;
  currentFeels.textContent = `${Math.round(daily.temperature_2m_max[dayIndex])}° high`;
  currentHumidity.textContent = daily.precipitation_sum[dayIndex] > 0
    ? `${daily.precipitation_sum[dayIndex].toFixed(1)} mm`
    : '0 mm';
  currentWind.textContent = `${Math.round(daily.wind_speed_10m_max[dayIndex])} km/h`;
  currentUv.textContent = getUvLabel(daily.uv_index_max?.[dayIndex]);
  currentPrecipProb.textContent = daily.precipitation_probability_max?.[dayIndex] != null
    ? `${daily.precipitation_probability_max[dayIndex]}%` : '—';

  // Pollen for selected day
  if (lastPollenData && daily.time?.[dayIndex]) {
    const dayPollen = lastPollenData[daily.time[dayIndex]];
    const level = getPollenLevel(dayPollen);
    currentPollen.textContent = `${level.emoji} ${level.label}`;
  } else {
    currentPollen.textContent = '—';
  }

  // Update labels for daily view
  const labels = document.querySelectorAll('.current__detail-label');
  labels[0].textContent = 'High';
  labels[1].textContent = 'Precip';
  labels[2].textContent = 'Wind max';
  labels[3].textContent = 'UV Index';
  labels[4].textContent = 'Rain chance';
  labels[5].textContent = 'Pollen';

  backToToday.hidden = false;
  setGradient(daily.weather_code[dayIndex], true);
  updateActiveCard();
  renderHourlyForecast(lastForecastData, dayIndex);
}

function restoreCurrentView() {
  if (!lastForecastData) return;

  // Restore detail labels
  const labels = document.querySelectorAll('.current__detail-label');
  labels[0].textContent = 'Feels like';
  labels[1].textContent = 'Humidity';
  labels[2].textContent = 'Wind';
  labels[3].textContent = 'UV Index';
  labels[4].textContent = 'Rain chance';
  labels[5].textContent = 'Pollen';

  renderCurrentWeather(lastForecastData, lastCityName);
}

function updateActiveCard() {
  const cards = forecastGrid.querySelectorAll('.forecast__card');
  cards.forEach((card, i) => {
    card.classList.toggle('forecast__card--active', i === selectedDayIndex);
  });
}

function renderHourlyForecast(data, dayIndex) {
  const hourly = data.hourly;
  const daily = data.daily;
  if (!hourly || !hourly.time) return;

  hourlyScroll.innerHTML = '';

  const targetDate = daily.time[dayIndex];
  const nowISO = data.current?.time || '';
  const currentHour = nowISO ? nowISO.substring(0, 13) : '';

  // Filter hourly entries for the target date
  const startHourIdx = hourly.time.findIndex(t => t.startsWith(targetDate));
  if (startHourIdx === -1) return;

  // For today, start from the current hour; for other days show all 24h
  let begin = startHourIdx;
  if (dayIndex === 0 && currentHour) {
    const nowIdx = hourly.time.findIndex(t => t.startsWith(currentHour));
    if (nowIdx >= startHourIdx) begin = nowIdx;
  }
  const end = Math.min(startHourIdx + 24, hourly.time.length);

  for (let i = begin; i < end; i++) {
    const timeStr = hourly.time[i];
    const hour = parseInt(timeStr.substring(11, 13), 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const isNow = timeStr.startsWith(currentHour) && dayIndex === 0;

    const code = hourly.weather_code[i];
    const isDay = hourly.is_day?.[i] === 1;
    const info = getWeatherInfo(code);
    const temp = Math.round(hourly.temperature_2m[i]);
    const rainProb = hourly.precipitation_probability?.[i];
    const humidity = hourly.relative_humidity_2m[i];
    const wind = Math.round(hourly.wind_speed_10m[i]);
    const uv = hourly.uv_index?.[i];

    const item = document.createElement('div');
    item.className = 'hourly__item' + (isNow ? ' hourly__item--now' : '');

    const metaParts = [];
    if (rainProb != null) metaParts.push(`💧${rainProb}%`);
    metaParts.push(`💦${humidity}%`);
    metaParts.push(`💨${wind}`);
    if (uv != null && uv > 0) metaParts.push(`☀️${Math.round(uv)}`);

    item.innerHTML = `
      <span class="hourly__time">${isNow ? 'Now' : `${h12} ${ampm}`}</span>
      <span class="hourly__icon">${isDay ? info.emoji : info.night}</span>
      <span class="hourly__temp">${temp}°</span>
      <span class="hourly__meta">${metaParts.join('<br>')}</span>
    `;

    hourlyScroll.appendChild(item);
  }
}

function renderDailyForecast(data) {
  const daily = data.daily;
  forecastGrid.innerHTML = '';

  for (let i = 0; i < daily.time.length; i++) {
    const info = getWeatherInfo(daily.weather_code[i]);
    const card = document.createElement('div');
    card.className = 'forecast__card';

    const precip = daily.precipitation_sum[i];
    const precipText = precip > 0 ? `💧 ${precip.toFixed(1)} mm` : '';
    const rainChance = daily.precipitation_probability_max?.[i];
    const rainText = rainChance != null ? `🌧️ ${rainChance}%` : '';

    card.innerHTML = `
      <div class="forecast__day">${getDayName(daily.time[i], i)}</div>
      <span class="forecast__icon">${info.emoji}</span>
      <div class="forecast__temps">
        <span class="forecast__high">${Math.round(daily.temperature_2m_max[i])}°</span>
        <span class="forecast__low">${Math.round(daily.temperature_2m_min[i])}°</span>
      </div>
      ${rainText ? `<div class="forecast__precip">${rainText}</div>` : ''}
      ${precipText ? `<div class="forecast__precip">${precipText}</div>` : ''}
    `;

    card.addEventListener('click', () => renderDayDetail(i));
    forecastGrid.appendChild(card);
  }
}

// ===== Main Load Flow =====
async function loadForecast(lat, lon, cityName) {
  showLoader();
  hideError();
  clearCityBackground();

  try {
    const [data, pollenData, cityImage] = await Promise.all([
      fetchForecast(lat, lon),
      fetchPollen(lat, lon),
      fetchCityImage(cityName),
    ]);

    lastForecastData = data;
    lastPollenData = pollenData;
    lastCityName = cityName;
    selectedDayIndex = -1;

    setCityBackground(cityImage);

    // Restore labels in case they were changed by a previous day-click
    const labels = document.querySelectorAll('.current__detail-label');
    labels[0].textContent = 'Feels like';
    labels[1].textContent = 'Humidity';
    labels[2].textContent = 'Wind';
    labels[3].textContent = 'UV Index';
    labels[4].textContent = 'Rain chance';
    labels[5].textContent = 'Pollen';

    renderCurrentWeather(data, cityName);
    renderDailyForecast(data);
    hideLoader();
    weatherContent.hidden = false;
  } catch (err) {
    showError(err.message || 'Failed to load weather data. Please try again.');
  }
}

// ===== Event Listeners =====
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const rawQuery = cityInput.value.trim();
  if (!rawQuery) return;

  // Strip qualifier suffix so geocoding API gets just the city name
  const query = rawQuery.split(',')[0].trim();

  showLoader();
  hideError();

  try {
    const results = await searchCity(query);
    hideLoader();

    if (results.length === 1) {
      const qualifier = [results[0].admin1, results[0].country].filter(Boolean).join(', ');
      const displayName = qualifier ? `${results[0].name}, ${qualifier}` : results[0].name;
      cityInput.value = displayName;
      loadForecast(results[0].latitude, results[0].longitude, displayName);
    } else {
      renderCityResults(results);
    }
  } catch (err) {
    showError(err.message);
  }
});

geoBtn.addEventListener('click', async () => {
  showLoader();
  hideError();
  cityResults.hidden = true;

  try {
    const { latitude, longitude } = await getCurrentLocation();

    // Use reverse geocoding to get a city name
    const results = await searchCity(`${latitude.toFixed(1)} ${longitude.toFixed(1)}`).catch(() => null);
    let cityName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;

    // If reverse search didn't work, try fetching forecast with coordinates as display
    if (results && results.length > 0) {
      cityName = results[0].name;
    }

    await loadForecast(latitude, longitude, cityName);
    cityInput.value = cityName;
  } catch (err) {
    showError(err.message);
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search')) {
    cityResults.hidden = true;
  }
});

// Back to current weather from day detail view
backToToday.addEventListener('click', restoreCurrentView);

// ===== Quote of the Day =====
const quotes = [
  { text: "The time is always right to do what is right.", author: "Martin Luther King Jr." },
  { text: "If there is no struggle, there is no progress.", author: "Frederick Douglass" },
  { text: "Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.", author: "Langston Hughes" },
  { text: "I have learned over the years that when one's mind is made up, this diminishes fear.", author: "Rosa Parks" },
  { text: "Success is to be measured not so much by the position that one has reached in life as by the obstacles which he has overcome.", author: "Booker T. Washington" },
  { text: "Never be limited by other people's limited imaginations.", author: "Mae C. Jemison" },
  { text: "You are your best thing.", author: "Toni Morrison" },
  { text: "Every great dream begins with a dreamer.", author: "Harriet Tubman" },
  { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
  { text: "The cost of liberty is less than the price of repression.", author: "W. E. B. Du Bois" },
  { text: "I am no longer accepting the things I cannot change. I am changing the things I cannot accept.", author: "Angela Davis" },
  { text: "In recognizing the humanity of our fellow beings, we pay ourselves the highest tribute.", author: "Thurgood Marshall" },
  { text: "We need to reshape our own perception of how we view ourselves. We have to step up as women and take the lead.", author: "Beyoncé" },
  { text: "There is no better than adversity. Every defeat, every heartbreak, every loss, contains its own seed, its own lesson on how to improve.", author: "Malcolm X" },
  { text: "The most common way people give up their power is by thinking they don't have any.", author: "Alice Walker" },
  { text: "I had no idea that history was being made. I was just tired of giving up.", author: "Rosa Parks" },
  { text: "Have a vision. Be demanding.", author: "Colin Powell" },
  { text: "Change will not come if we wait for some other person or some other time. We are the ones we've been waiting for.", author: "Barack Obama" },
  { text: "You can't separate peace from freedom because no one can be at peace unless he has his freedom.", author: "Malcolm X" },
  { text: "Hate is too great a burden to bear. It injures the hater more than it injures the hated.", author: "Coretta Scott King" },
  { text: "When you know better, you do better.", author: "Maya Angelou" },
  { text: "If you want to fly, you have to give up the things that weigh you down.", author: "Toni Morrison" },
  { text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.", author: "James Baldwin" },
  { text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { text: "I am where I am because of the bridges that I crossed.", author: "Oprah Winfrey" },
  { text: "We are the ones we have been waiting for.", author: "June Jordan" },
  { text: "Without community, there is no liberation.", author: "Audre Lorde" },
  { text: "The things you do for yourself are gone when you are gone, but the things you do for others remain as your legacy.", author: "Kalu Ndukwe Kalu" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { text: "Do not follow where the path may lead. Go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "Bringing the gifts that my ancestors gave, I am the dream and the hope of the slave.", author: "Maya Angelou" },
  { text: "If they don't give you a seat at the table, bring a folding chair.", author: "Shirley Chisholm" },
  { text: "You don't make progress by standing on the sidelines, whimpering and complaining. You make progress by implementing ideas.", author: "Shirley Chisholm" },
  { text: "Defining myself, as opposed to being defined by others, is one of the most difficult challenges I face.", author: "Carol Moseley Braun" },
  { text: "I refuse to accept the view that mankind is so tragically bound to the starless midnight of racism and war that the bright daybreak of peace and brotherhood can never become a reality.", author: "Martin Luther King Jr." },
  { text: "We all have dreams. In order to make dreams come into reality, it takes determination, self-discipline, and effort.", author: "Jesse Owens" },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr." },
  { text: "Your silence will not protect you.", author: "Audre Lorde" },
  { text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.", author: "Marie Curie" },
  { text: "Life is not a spectator sport. If you're going to spend your whole life in the grandstand just watching what goes on, in my opinion you're wasting your life.", author: "Jackie Robinson" },
  { text: "Stumbling is not falling.", author: "Malcolm X" },
  { text: "One day our descendants will think it incredible that we paid so much attention to things like the amount of melanin in our skin.", author: "Martin Luther King Jr." },
  { text: "The soul that is within me no man can degrade.", author: "Frederick Douglass" },
  { text: "Impossible is just a big word thrown around by small men who find it easier to live in the world they've been given than to explore the power they have to change it.", author: "Muhammad Ali" },
  { text: "Service is the rent we pay for being. It is the very purpose of life, and not something you do in your spare time.", author: "Marian Wright Edelman" },
  { text: "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.", author: "Maya Angelou" },
  { text: "There are still many causes worth sacrificing for, so much history yet to be made.", author: "Michelle Obama" },
  { text: "Success isn't about how much money you make; it's about the difference you make in people's lives.", author: "Michelle Obama" },
  { text: "A man who stands for nothing will fall for anything.", author: "Malcolm X" },
  { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
  { text: "Where there is no vision, there is no hope.", author: "George Washington Carver" },
  { text: "Freeing yourself was one thing; claiming ownership of that freed self was another.", author: "Toni Morrison" },
  { text: "It is easier to build strong children than to repair broken men.", author: "Frederick Douglass" },
  { text: "I am not going to die, I'm going home like a shooting star.", author: "Sojourner Truth" },
  { text: "You can be the lead in your own life.", author: "Kerry Washington" },
  { text: "Intelligence plus character — that is the goal of true education.", author: "Martin Luther King Jr." },
  { text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Boynton Robinson" },
  { text: "Whatever we believe about ourselves and our ability comes true for us.", author: "Susan L. Taylor" },
  { text: "Do what you can, with what you have, where you are.", author: "John Lewis" },
  { text: "When someone shows you who they are, believe them the first time.", author: "Maya Angelou" },
  { text: "If you are always trying to be normal, you will never know how amazing you can be.", author: "Maya Angelou" },
  { text: "For to be free is not merely to cast off one's chains, but to live in a way that respects and enhances the freedom of others.", author: "Nelson Mandela" },
  { text: "My humanity is bound up in yours, for we can only be human together.", author: "Desmond Tutu" },
  { text: "We have to talk about liberating minds as well as liberating society.", author: "Angela Davis" },
];

// Pick quote based on day-of-year so it rotates daily
function getQuoteOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return quotes[dayOfYear % quotes.length];
}

function renderQuote() {
  const q = getQuoteOfTheDay();
  document.getElementById('quote-text').textContent = q.text;
  document.getElementById('quote-author').textContent = `— ${q.author}`;
}

renderQuote();
