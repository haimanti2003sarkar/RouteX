const SUPABASE_URL = "https://jgyhlaglxeezhporrplx.supabase.co";
const SUPABASE_KEY = "sb_publishable_o6E1bYe66ymSe5FzB1UYDg_ChahLSNi";

const { createClient } = supabase;

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM elements

const sourceSelect = document.getElementById("source");
const destinationSelect = document.getElementById("destination");
const travelDate = document.getElementById("travelDate");

const searchButton = document.getElementById("searchButton");
const swapButton = document.getElementById("swapButton");
const clearButton = document.getElementById("clearButton");

const busResults = document.getElementById("busResults");
const emptyState = document.getElementById("emptyState");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const resultsTitle = document.getElementById("resultsTitle");
const routeCount = document.getElementById("routeCount");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// PAGE INITIALIZATION

document.addEventListener("DOMContentLoaded", async () => {
  setMinimumDate();

  applySavedTheme();

  await loadLocations();

  await loadAllBuses();

  lucide.createIcons();
});

// SET MINIMUM DATE

function setMinimumDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const todayString = `${year}-${month}-${day}`;

  travelDate.min = todayString;

  // Default to tomorrow
  const tomorrow = new Date(today);

  tomorrow.setDate(today.getDate() + 1);

  const tYear = tomorrow.getFullYear();
  const tMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const tDay = String(tomorrow.getDate()).padStart(2, "0");

  travelDate.value = `${tYear}-${tMonth}-${tDay}`;
}

// LOAD LOCATIONS FROM DATABASE

async function loadLocations() {
  const { data, error } = await db.from("buses").select("source, destination");

  if (error) {
    showError("Unable to load routes. Please check your Supabase connection.");

    console.error(error);

    return;
  }

  const sources = [...new Set(data.map((bus) => bus.source))].sort();

  const destinations = [...new Set(data.map((bus) => bus.destination))].sort();

  sources.forEach((location) => {
    const option = document.createElement("option");

    option.value = location;
    option.textContent = location;

    sourceSelect.appendChild(option);
  });

  destinations.forEach((location) => {
    const option = document.createElement("option");

    option.value = location;
    option.textContent = location;

    destinationSelect.appendChild(option);
  });
}

// LOAD ALL BUSES

async function loadAllBuses() {
  showLoading();

  const { data, error } = await db
    .from("buses")
    .select("*")
    .order("departure_time", {
      ascending: true,
    });

  hideLoading();

  if (error) {
    showError("Could not connect to the RouteX database.");

    console.error(error);

    return;
  }

  routeCount.textContent = `${data.length} routes available`;

  renderBuses(data);
}

// SEARCH BUSES

async function searchBuses() {
  const source = sourceSelect.value;
  const destination = destinationSelect.value;
  const date = travelDate.value;

  if (!source || !destination) {
    showError("Please select both your origin and destination.");

    return;
  }

  if (source === destination) {
    showError("Origin and destination cannot be the same.");

    return;
  }

  showError("");

  showLoading();

  let query = db
    .from("buses")
    .select("*")
    .eq("source", source)
    .eq("destination", destination);

  if (date) {
    query = query.eq("travel_date", date);
  }

  query = query.order("departure_time", {
    ascending: true,
  });

  const { data, error } = await query;

  hideLoading();

  if (error) {
    showError("Something went wrong while searching.");

    console.error(error);

    return;
  }

  resultsTitle.textContent = `${source} → ${destination}`;

  if (data.length === 0) {
    busResults.innerHTML = "";

    emptyState.classList.remove("hidden");

    emptyState.querySelector("h3").textContent = "No buses found";

    emptyState.querySelector("p").textContent =
      "Try another date or route. We're expanding our network across West Bengal.";

    lucide.createIcons();

    return;
  }

  renderBuses(data);
}

// RENDER BUS CARDS

function renderBuses(buses) {
  emptyState.classList.add("hidden");

  busResults.innerHTML = "";

  buses.forEach((bus) => {
    const card = document.createElement("article");

    card.className = "bus-card";

    const formattedDate = formatDate(bus.travel_date);

    const formattedTime = formatTime(bus.departure_time);

    card.innerHTML = `
      <div class="bus-top">

        <div>
          <div class="bus-name">
            ${escapeHTML(bus.bus_name)}
          </div>

          <div class="bus-type">
            AC / Seater • ${bus.total_seats} seats
          </div>
        </div>

        <div class="price">
          ₹${Number(bus.price).toLocaleString("en-IN")}
          <small>per seat</small>
        </div>

      </div>


      <div class="journey">

        <div class="place">

          <strong>
            ${escapeHTML(bus.source)}
          </strong>

          <span>
            ${formattedTime}
          </span>

        </div>


        <div class="journey-line"></div>


        <div class="place">

          <strong>
            ${escapeHTML(bus.destination)}
          </strong>

          <span>
            ${formattedDate}
          </span>

        </div>

      </div>


      <div class="bus-details">

        <span>
          <i data-lucide="clock-3"></i>
          ${formattedTime}
        </span>

        <span>
          <i data-lucide="calendar-days"></i>
          ${formattedDate}
        </span>

        <span>
          <i data-lucide="armchair"></i>
          ${bus.total_seats} seats
        </span>

      </div>


      <button
        class="book-button"
        onclick="bookBus(${bus.id})"
      >
        Select bus
        <i data-lucide="arrow-right"></i>
      </button>
    `;

    busResults.appendChild(card);
  });

  // Convert Lucide placeholders into SVG icons
  lucide.createIcons();
}

// BOOK BUS

function bookBus(busId) {
  window.location.href = `booking.html?bus=${busId}`;
}

// QUICK SEARCH

function quickSearch(source, destination) {
  sourceSelect.value = source;

  destinationSelect.value = destination;

  document.getElementById("search").scrollIntoView({
    behavior: "smooth",
  });

  setTimeout(() => {
    searchBuses();
  }, 500);
}

// SWAP LOCATIONS

swapButton.addEventListener("click", () => {
  const source = sourceSelect.value;

  const destination = destinationSelect.value;

  sourceSelect.value = destination;

  destinationSelect.value = source;
});

// SEARCH BUTTON

searchButton.addEventListener("click", searchBuses);

// CLEAR SEARCH

clearButton.addEventListener("click", async () => {
  sourceSelect.value = "";

  destinationSelect.value = "";

  resultsTitle.textContent = "Explore your options";

  await loadAllBuses();
});

// LOADING UI

function showLoading() {
  loading.classList.remove("hidden");

  busResults.innerHTML = "";

  emptyState.classList.add("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

// ERROR UI

function showError(message) {
  if (!message) {
    errorMessage.classList.add("hidden");

    errorMessage.textContent = "";

    return;
  }

  errorMessage.textContent = message;

  errorMessage.classList.remove("hidden");
}

// DATE FORMATTING

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// TIME FORMATTING

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// BASIC HTML ESCAPING

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// LIGHT / DARK THEME

function applySavedTheme() {
  const savedTheme = localStorage.getItem("routex-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");

    themeIcon.setAttribute("data-lucide", "sun");
  } else {
    themeIcon.setAttribute("data-lucide", "moon");
  }

  lucide.createIcons();
}

// TOGGLE THEME

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  const isDark = document.body.classList.contains("dark-theme");

  themeIcon.setAttribute("data-lucide", isDark ? "sun" : "moon");

  localStorage.setItem("routex-theme", isDark ? "dark" : "light");

  lucide.createIcons();
});
