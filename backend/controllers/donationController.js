const crypto = require("crypto");
const Donation = require("../models/Donation");
const razorpayInstance = require("../utils/razorpay");

// @desc    Create a Razorpay order for a donation
// @route   POST /api/donations/create-order
// @access  Public
exports.createDonationOrder = async (req, res) => {
  try {
    const { category, name, email, phone, amount, panNumber } = req.body;

    if (!category || !name || !email || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Category, name, email, phone and amount are required.",
      });
    }

    if (Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be greater than zero." });
    }

    // Razorpay expects amount in the smallest currency unit (paise for INR)
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `donation_rcpt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    const donation = await Donation.create({
      category,
      name,
      email,
      phone,
      panNumber,
      amount,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      donationId: donation._id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createDonationOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not create donation order. Please try again.",
    });
  }
};

// @desc    Verify Razorpay payment signature after checkout completes
// @route   POST /api/donations/verify
// @access  Public
exports.verifyDonationPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    const donation = await Donation.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!donation) {
      return res
        .status(404)
        .json({ success: false, message: "Donation record not found." });
    }

    if (!isValid) {
      donation.status = "failed";
      await donation.save();
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. If money was deducted, it will be refunded automatically.",
      });
    }

    donation.razorpayPaymentId = razorpay_payment_id;
    donation.razorpaySignature = razorpay_signature;
    donation.status = "paid";
    await donation.save();

    return res.status(200).json({
      success: true,
      message: "Thank you! Your donation was successful.",
      donation,
    });
  } catch (error) {
    console.error("verifyDonationPayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not verify payment. Please contact the temple office.",
    });
  }
};

// @desc    Get all donations (admin)
// @route   GET /api/donations
// @access  Private/Admin
exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, donations });
  } catch (error) {
    console.error("getDonations error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
