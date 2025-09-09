import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";

let studentToken, professorToken, professorId, appointmentId;

describe("E2E Flow: Register → Login → Availability → Book → Cancel", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URL_TEST || "mongodb://127.0.0.1:27017/cas_test"
      );
    }
  });

  afterAll(async () => {
    // Clean collections for next test run
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    await mongoose.connection.close();
  });

  test("Register Professor", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Dr. Test",
      email: "drtest@example.com",
      password: "123456",
      role: "professor",
    });
    expect(res.statusCode).toBe(201);
  });

  test("Login Professor", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "drtest@example.com",
      password: "123456",
    });
    console.log("Professor login response:", res.body); // 🔍 debug

    // adjust later depending on what is logged
    expect(res.body.accessToken || res.body.token).toBeDefined();
    professorToken = res.body.accessToken || res.body.token;
    professorId = res.body.user.id;
  });

  test("Register Student", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Gablu",
      email: "Gablu@example.com",
      password: "123456",
      role: "student",
    });
    expect(res.statusCode).toBe(201);
  });

  test("Login Student", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "Gablu@example.com",
      password: "123456",
    });
    console.log("Student login response:", res.body); // 🔍 debug

    expect(res.body.accessToken || res.body.token).toBeDefined();
    studentToken = res.body.accessToken || res.body.token;
  });

  test("Professor Adds Availability", async () => {
    const res = await request(app)
      .post("/professor/availability")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        date: "2025-09-20",
        timeSlots: ["10:00-11:00", "11:00-12:00"],
      });
    expect(res.statusCode).toBe(201);
  });

  test("Student Books Appointment", async () => {
    const res = await request(app)
      .post(`/student/book/${professorId}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        date: "2025-09-20",
        time: "10:00-11:00",
      });
    expect(res.statusCode).toBe(201);
    appointmentId = res.body.appointment._id;
  });

  test("Professor Cancels Appointment", async () => {
    const res = await request(app)
      .patch(`/professor/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ reason: "Unavailable today" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("Cancelled");
  });

  test("Student Sees Cancelled Booking", async () => {
    const res = await request(app)
      .get("/student/bookings")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.bookings[0].status).toBe("Cancelled");
  });
});
