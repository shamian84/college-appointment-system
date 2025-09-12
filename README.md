# College Appointment System (CAS)

A full-stack backend application for managing college appointments between **students** and **professors**.  
Built with **Node.js, Express, MongoDB, JWT authentication**, and fully tested with **Jest + Supertest**.

---

## Features

- **Authentication & Authorization**
- Register/Login with role-based access (`student`, `professor`).
- JWT access + refresh token support.

- **Professor Availability Management**
- Professors can add available time slots.
- Students can view professor availability.

- **Student Booking System**
- Book appointments with professors.
- Cancel bookings.
- View upcoming and cancelled appointments.

- **End-to-End Tests**
- Automated flow tests: `Register → Login → Availability → Book → Cancel → Verify`.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (Access + Refresh Tokens)
- **Testing:** Jest, Supertest
- **Other Tools:** bcryptjs, dotenv, morgan

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/shamian84/college-appointment-system
cd college-appointment-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/cas
MONGO_URL_TEST=mongodb://127.0.0.1:27017/cas_test
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

### 4. Run Development Server

```bash
npm run dev
```

Server runs on: [http://localhost:5000](http://localhost:5000)

---

## API Endpoints

### Auth

- `POST /auth/register` → Register user (student/professor)
- `POST /auth/login` → Login & receive tokens
- `POST /auth/refresh` → Refresh access token

### Professor

- `POST /professor/availability` → Add availability (protected)
- `PATCH /professor/appointments/:id/cancel` → Cancel appointment

### Student

- `POST /student/book/:professorId` → Book appointment
- `GET /student/bookings` → View all student bookings

---

## Running Tests

### Run all tests with coverage:

```bash
npm test
```

Expected output (example):

```
PASS  tests/e2e.test.js
  E2E Flow: Register → Login → Availability → Book → Cancel
    ✓ Register Professor
    ✓ Login Professor
    ✓ Register Student
    ✓ Login Student
    ✓ Professor Adds Availability
    ✓ Student Books Appointment
    ✓ Professor Cancels Appointment
    ✓ Student Sees Cancelled Booking
```

All 8/8 tests pass successfully.  
 Jest may show a small warning about open handles — this does **not** affect test results.

---

## Demo Flow (Tested)

1. Register professor
2. Login professor (JWT generated)
3. Register student
4. Login student
5. Professor adds availability
6. Student books an appointment
7. Professor cancels the appointment
8. Student sees cancellation reflected

---

## Project Structure

```
college-appointment-system/
│── config/              # DB connection
│── controllers/         # Auth, Professor, Student logic
│── middlewares/         # Auth + error handlers
│── models/              # Mongoose models
│── routes/              # Express routes
│── utils/               # Helper functions
│── tests/               # Jest + Supertest tests
│── server.js            # App entry point
│── package.json
│── README.md
```

---

## Postman Collection

## Import `postman/CollegeAppointmentSystem.postman_collection.json` into Postman to test all APIs quickly.

## Author

**Shami Alam**  
 shamialam9352gmail.com
[LinkedIn] https://www.linkedin.com/in/shami-alam-6174882bb/ | [Portfolio](https://your-portfolio.com)

---

## License

This project is licensed under the MIT License.
