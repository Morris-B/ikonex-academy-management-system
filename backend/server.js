const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Student Management System API Running");
});

// Routes (we will expand these next)
const studentRoutes = require("./routes/students");
const classRoutes = require("./routes/classes");
const subjectRoutes = require("./routes/subjects");
const scoreRoutes = require("./routes/scores");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");

app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});