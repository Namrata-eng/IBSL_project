const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Annadanam (Food Seva)",
        "Temple Construction",
        "Deity Ornaments (Sringar)",
        "Festival Sponsorship",
        "Cow Protection (Goshala)",
        "General Donation",
      ],
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    panNumber: { type: String, trim: true }, // for 80G receipt, optional
    amount: { type: Number, required: true, min: 1 },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
