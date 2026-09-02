const express = require("express");
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} = require("../controllers/inquiryController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post("/", createInquiry);
router.get("/", protect, isAdmin, getInquiries);
router.put("/:id", protect, isAdmin, updateInquiryStatus);

module.exports = router;
