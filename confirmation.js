const SUPABASE_URL = "https://jgyhlaglxeezhporrplx.supabase.co";

const SUPABASE_KEY = "sb_publishable_o6E1bYe66ymSe5FzB1UYDg_ChahLSNi";

const { createClient } = supabase;

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// GET booking information

const params = new URLSearchParams(window.location.search);

const bookingId = params.get("booking");
const bookingRef = params.get("ref");

// ELEMENTS

const loading = document.getElementById("confirmationLoading");
const ticket = document.getElementById("ticket");
const actions = document.getElementById("confirmationActions");

// INITIALIZE

document.addEventListener("DOMContentLoaded", async () => {
  applySavedTheme();

  if (!bookingId && !bookingRef) {
    loading.textContent = "Booking information was not found.";

    return;
  }

  await loadBooking();
});

// LOAD BOOKING

async function loadBooking() {
  let query = db.from("bookings").select(`
      id,
      passenger_name,
      email,
      phone,
      seat_number,
      booking_date,
      booking_ref,
      buses (
        bus_name,
        source,
        destination,
        travel_date,
        departure_time,
        price
      )
    `);

  // NEW SYSTEM: Load ALL seats belonging to this booking

  if (bookingRef) {
    query = query.eq("booking_ref", bookingRef);
  } else {
    query = query.eq("id", bookingId);
  }

  const { data, error } = await query.order("id", {
    ascending: true,
  });

  if (error || !data || data.length === 0) {
    console.error("Booking loading error:", error);

    loading.textContent = "Unable to load your booking.";

    return;
  }

  // FIRST ROW = MAIN BOOKING INFORMATION

  const firstBooking = data[0];

  const bus = firstBooking.buses;

  // BOOKING ID

  document.getElementById("bookingId").textContent =
    `RX-${String(firstBooking.id).padStart(5, "0")}`;

  // ROUTE

  document.getElementById("ticketSource").textContent = bus.source;
  document.getElementById("ticketDestination").textContent = bus.destination;

  // PASSENGER

  document.getElementById("ticketPassenger").textContent =
    firstBooking.passenger_name;

  // BUS

  document.getElementById("ticketBus").textContent = bus.bus_name;

  // DATE

  document.getElementById("ticketDate").textContent = formatDate(
    bus.travel_date,
  );

  // DEPARTURE TIME

  document.getElementById("ticketTime").textContent = formatTime(
    bus.departure_time,
  );

  // ALL SELECTED SEATS

  const seats = data.map((row) => row.seat_number).sort((a, b) => a - b);

  document.getElementById("ticketSeats").textContent = seats
    .map((seat) => `Seat ${seat}`)
    .join(", ");

  // EMAIL

  document.getElementById("ticketEmail").textContent = firstBooking.email;

  // TOTAL AMOUNT

  const pricePerSeat = Number(bus.price);

  const totalAmount = pricePerSeat * seats.length;

  document.getElementById("ticketTotal").textContent =
    totalAmount.toLocaleString("en-IN");

  // SHOW TICKET

  loading.style.display = "none";

  ticket.style.display = "block";

  actions.style.display = "flex";
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

// DATE FORMAT

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// TIME FORMAT

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}
