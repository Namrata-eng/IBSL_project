const Inquiry = require("../models/Inquiry");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @desc    Submit a contact/inquiry form
// @route   POST /api/inquiries
// @access  Public
exports.createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email address." });
    }

    const inquiry = await Inquiry.create({ name, email, phone, message });

    // Optional: fire-and-forget email notification to temple admin.
    // Uncomment and configure utils/mailer.js if you want email alerts.
    // sendInquiryNotification(inquiry).catch((err) =>
    //   console.error("Email notification failed:", err)
    // );

    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out. We will get back to you soon.",
      inquiry,
    });
  } catch (error) {
    console.error("createInquiry error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not submit your inquiry. Please try again.",
    });
  }
};

// @desc    Get all inquiries (admin)
// @route   GET /api/inquiries
// @access  Private/Admin
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, inquiries });
  } catch (error) {
    console.error("getInquiries error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Update inquiry status (admin)
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found." });
    }

    inquiry.status = status ?? inquiry.status;
    await inquiry.save();

    return res.status(200).json({ success: true, inquiry });
  } catch (error) {
    console.error("updateInquiryStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
