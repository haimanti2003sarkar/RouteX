# 🚌 RouteX — West Bengal Bus Booking System

RouteX is a web-based bus ticket booking and reservation system designed to provide a simple and user-friendly way to search for buses, select seats, enter passenger details, and complete a booking.

The project was developed as a full-stack web application using **HTML, CSS, JavaScript, and Supabase/PostgreSQL**.

---

## ✨ Features

- 🔎 Search for available buses
- 🚌 View bus routes and journey information
- 💺 Select available seats
- 👤 Enter passenger details
- 🎫 Generate booking confirmation
- 📱 Responsive and user-friendly interface
- 🗄️ Store and manage booking data using Supabase
- 🔐 Database-backed booking workflow

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend / Database

- Supabase
- PostgreSQL

### Development Tools

- Visual Studio Code
- Git
- GitHub

---

## 📂 Project Structure

```text
RouteX/
│
├── index.html              # Home page / bus search
├── routex.css              # Main stylesheet
├── routex.js               # Main page functionality
│
├── booking.html            # Seat selection and passenger details
├── booking.js              # Booking page functionality
│
├── confirmation.html       # Booking confirmation page
├── confirmation.js        # Confirmation page functionality
│
└── README.md              # Project documentation
```

---

## 🔄 Booking Flow

```text
Search Bus
    ↓
Select Bus
    ↓
Select Seat
    ↓
Enter Passenger Details
    ↓
Confirm Booking
    ↓
Booking Confirmation
```

---

## 🗄️ Database

RouteX uses **Supabase with PostgreSQL** to store application data.

The database is used to support the booking workflow and maintain information required for reservations.

> Database credentials and private configuration values should never be committed to the public repository.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
```

### 2. Open the project

Open the cloned RouteX folder in **Visual Studio Code**.

### 3. Configure Supabase

If the project requires Supabase configuration, add your own Supabase project URL and public client key in the appropriate JavaScript configuration.

Do not expose private keys or service-role credentials.

### 4. Run the project

The project can be run using a local development server such as the **VS Code Live Server extension**.

Open:

```text
index.html
```

and launch it using Live Server.

---

## 🎯 Project Objective

The primary objective of RouteX is to demonstrate the development of a practical bus reservation system with a simple frontend interface and database-backed booking workflow.

The project focuses on applying concepts such as:

- Frontend web development
- JavaScript-based user interaction
- Database integration
- CRUD operations
- Form handling
- Seat selection
- Booking workflows
- Basic web application architecture

---

## 🔮 Future Improvements

Possible future enhancements include:

- User authentication and account management
- Online payment integration
- Real-time seat availability
- Bus operator/admin dashboard
- Booking cancellation and refund management
- Email/SMS booking notifications
- Improved route and bus filtering
- Booking history for users
- Advanced security and input validation

---

## 👩‍💻 Author

**Haimanti Sarkar**

Computer Science & Engineering Student

GitHub: [haimanti2003sarkar](https://github.com/haimanti2003sarkar)

LinkedIn: [Haimanti Sarkar](https://www.linkedin.com/in/haimanti-sarkar-b18b04288/)

---

## 📌 Note

RouteX is an academic/student project developed to demonstrate practical implementation of a web-based bus booking and reservation system.
