const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const donationRoutes = require("./routes/donationRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/donations", donationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/inquiries", inquiryRoutes);

app.get("/", (req, res) => res.send("ISKCON Temple API is running."));

console.log("MongoDB URI loaded:", process.env.MONGO_URI ? "YES" : "NO");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
