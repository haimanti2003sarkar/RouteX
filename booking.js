//BOOKING PAGE

const SUPABASE_URL = "https://jgyhlaglxeezhporrplx.supabase.co";
const SUPABASE_KEY = "sb_publishable_o6E1bYe66ymSe5FzB1UYDg_ChahLSNi";

const { createClient } = supabase;

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// GET BUS ID FROM URL

const params = new URLSearchParams(window.location.search);

const busId = params.get("bus");

// PAGE ELEMENTS

const bookingLoading = document.getElementById("bookingLoading");

const bookingContent = document.getElementById("bookingContent");

const busName = document.getElementById("busName");

const busPrice = document.getElementById("busPrice");

const busSource = document.getElementById("busSource");

const busDestination = document.getElementById("busDestination");

const busTime = document.getElementById("busTime");

const busDate = document.getElementById("busDate");

const departureInfo = document.getElementById("departureInfo");

const seatCount = document.getElementById("seatCount");

const seatMap = document.getElementById("seatMap");

const selectedSeatText = document.getElementById("selectedSeatText");

const bookingForm = document.getElementById("bookingForm");

const bookingError = document.getElementById("bookingError");

const confirmButton = document.getElementById("confirmButton");

// STATE

let selectedBus = null;

let selectedSeats = [];

let bookedSeats = [];

// INITIALIZE

document.addEventListener("DOMContentLoaded", async () => {
  applySavedTheme();

  if (!busId) {
    showBookingError("No bus was selected.");

    return;
  }

  await loadBus();

  await loadBookedSeats();
});

// LOAD BUS

async function loadBus() {
  const { data, error } = await db
    .from("buses")
    .select("*")
    .eq("id", busId)
    .single();

  if (error || !data) {
    showBookingError("We couldn't find the selected bus.");

    console.error(error);

    return;
  }

  selectedBus = data;

  busName.textContent = data.bus_name;

  busPrice.textContent = Number(data.price).toLocaleString("en-IN");

  busSource.textContent = data.source;

  busDestination.textContent = data.destination;

  busTime.textContent = formatTime(data.departure_time);

  busDate.textContent = formatDate(data.travel_date);

  departureInfo.textContent = formatTime(data.departure_time);

  seatCount.textContent = `${data.total_seats} seats`;

  bookingLoading.style.display = "none";

  bookingContent.style.display = "grid";
}

// LOAD BOOKED SEATS

async function loadBookedSeats() {
  const { data, error } = await db
    .from("bookings")
    .select("seat_number")
    .eq("bus_id", busId);

  if (error) {
    showBookingError("Unable to load seat availability.");

    console.error(error);

    return;
  }

  bookedSeats = data.map((booking) => booking.seat_number);

  renderSeats();
}

// CREATE SEAT MAP

function renderSeats() {
  seatMap.innerHTML = "";

  // Driver section

  const driver = document.createElement("div");

  driver.className = "driver";

  driver.textContent = "DRIVER";

  seatMap.appendChild(driver);

  // Create rows
  // 4 seats per row

  const totalSeats = selectedBus.total_seats;

  for (let start = 1; start <= totalSeats; start += 4) {
    const row = document.createElement("div");

    row.className = "seat-row";

    const seatNumbers = [start, start + 1, null, start + 2, start + 3];

    seatNumbers.forEach((seatNumber) => {
      if (seatNumber === null) {
        const aisle = document.createElement("div");

        aisle.className = "aisle";

        row.appendChild(aisle);

        return;
      }

      if (seatNumber > totalSeats) {
        return;
      }

      const button = document.createElement("button");

      button.type = "button";

      button.className = "seat";

      button.textContent = seatNumber;

      if (bookedSeats.includes(seatNumber)) {
        button.classList.add("booked");

        button.disabled = true;
      } else {
        button.addEventListener("click", () => selectSeat(seatNumber, button));
      }

      row.appendChild(button);
    });

    seatMap.appendChild(row);
  }
}

// SELECT SEAT

function selectSeat(seatNumber, button) {
  // If seat is already selected,
  // clicking it again will deselect it.

  if (selectedSeats.includes(seatNumber)) {
    selectedSeats = selectedSeats.filter((seat) => seat !== seatNumber);

    button.classList.remove("selected");
  } else {
    // Maximum 6 seats per booking

    if (selectedSeats.length >= 6) {
      showBookingError("You can select a maximum of 6 seats.");

      return;
    }

    selectedSeats.push(seatNumber);

    button.classList.add("selected");
  }

  // Sort seats numerically

  selectedSeats.sort((a, b) => a - b);

  updateSelectedSeats();
}

function updateSelectedSeats() {
  const totalElement = document.getElementById("selectedSeatTotal");

  if (selectedSeats.length === 0) {
    selectedSeatText.textContent = "None";

    totalElement.textContent = "Select your seats to continue";

    return;
  }

  selectedSeatText.textContent = selectedSeats
    .map((seat) => `Seat ${seat}`)
    .join(", ");

  const total = selectedSeats.length * Number(selectedBus.price);

  totalElement.textContent = `${selectedSeats.length} seat(s) • Total ₹${total.toLocaleString("en-IN")}`;
}

// CONFIRM BOOKING

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (selectedSeats.length === 0) {
    showBookingError("Please select at least one seat before continuing.");

    return;
  }

  const name = document.getElementById("passengerName").value.trim();

  const email = document.getElementById("passengerEmail").value.trim();

  const phone = document.getElementById("passengerPhone").value.trim();

  if (!name || !email || !phone) {
    showBookingError("Please complete all passenger details.");

    return;
  }

  confirmButton.disabled = true;

  confirmButton.textContent = "Confirming booking...";

  // Insert booking

  const bookingRef = crypto.randomUUID();

  const bookingRows = selectedSeats.map((seat) => ({
    bus_id: Number(busId),
    passenger_name: name,
    email: email,
    phone: phone,
    seat_number: seat,
    booking_ref: bookingRef,
  }));

  const { data, error } = await db
    .from("bookings")
    .insert(bookingRows)
    .select();

  if (error) {
    console.error(error);

    showBookingError("Booking failed. Please try again.");

    confirmButton.disabled = false;

    confirmButton.textContent = "Confirm booking →";

    return;
  }

  // Success

  const bookingId = data[0].id;

  localStorage.setItem(
    "routex-last-booking",
    JSON.stringify({
      bookingId,
      bookingRef,
      bus: selectedBus,
      passengerName: name,
      email,
      phone,
      seats: selectedSeats,
    }),
  );

  window.location.href = `confirmation.html?booking=${bookingId}&ref=${bookingRef}`;
});

// ERROR MESSAGE

function showBookingError(message) {
  bookingError.textContent = message;

  bookingError.style.display = "block";
}

// THEME

function applySavedTheme() {
  const savedTheme = localStorage.getItem("routex-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");

    document.getElementById("themeIcon").textContent = "☀";
  }

  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");

    document.getElementById("themeIcon").textContent = isDark ? "☀" : "☾";

    localStorage.setItem("routex-theme", isDark ? "dark" : "light");
  });
}

// DATE

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// TIME

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}
