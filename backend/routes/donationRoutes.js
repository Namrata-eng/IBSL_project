const express = require("express");
const router = express.Router();
const {
  createDonationOrder,
  verifyDonationPayment,
  getDonations,
} = require("../controllers/donationController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post("/create-order", createDonationOrder);
router.post("/verify", verifyDonationPayment);
router.get("/", protect, isAdmin, getDonations);

module.exports = router;
