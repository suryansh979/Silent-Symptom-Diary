require("dotenv").config();

// Catch errors inside promises that you forgot to attach a .catch() to
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down gracefully...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Catch synchronous errors (like typing 'console.log(undefinedVariable)')
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...");
  console.error(err.name, err.message);
  process.exit(1);
});

const express = require("express");
const cors = require("cors"); // Moved import to the top
const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const symptomRoutes = require("./routes/symptomRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");

// 1. Import the global error handlers
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Allow requests from your specific frontend domain (Removed the /#/)
app.use(
  cors({
    origin: "https://silent-symptom-diary-013efe.netlify.app", 
    credentials: true,
  })
);

app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/measurements", symptomRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patients", patientRoutes);

app.get("/", (req, res) => {
  res.send("Silent Symptom Diary API is running!");
});

// 2. Mount the Error Handlers AFTER all your routes
app.use(notFound); // Catches requests to URLs that don't exist
app.use(errorHandler); // Catches all actual errors

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
