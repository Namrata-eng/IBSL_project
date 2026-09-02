import { useState } from "react";
import axios from "axios";
import ArchDivider from "../components/ArchDivider";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const CATEGORIES = [
  {
    key: "Annadanam (Food Seva)",
    label: "Annadanam",
    sub: "Food Seva",
    blurb: "Sponsor a meal for devotees and those in need.",
  },
  {
    key: "Temple Construction",
    label: "Temple",
    sub: "Construction",
    blurb: "Help build and maintain the temple structure.",
  },
  {
    key: "Deity Ornaments (Sringar)",
    label: "Sringar",
    sub: "Deity Ornaments",
    blurb: "Contribute towards the Deities' daily adornment.",
  },
  {
    key: "Festival Sponsorship",
    label: "Utsav",
    sub: "Festival Sponsorship",
    blurb: "Support festivals, kirtans and celebrations.",
  },
  {
    key: "Cow Protection (Goshala)",
    label: "Goshala",
    sub: "Cow Protection",
    blurb: "Care for the temple's cows and goshala.",
  },
  {
    key: "General Donation",
    label: "General",
    sub: "Donation",
    blurb: "Support wherever the need is greatest.",
  },
];

const PRESET_AMOUNTS = [101, 501, 1101, 2101];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Donate() {
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [amount, setAmount] = useState(501);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", panNumber: "" });
  const [status, setStatus] = useState("idle"); // idle | processing | success | error
  const [feedback, setFeedback] = useState("");

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setFeedback("");

    if (!form.name || !form.email || !form.phone) {
      setStatus("error");
      setFeedback("Please fill in your name, email and phone number.");
      return;
    }
    if (!finalAmount || finalAmount <= 0) {
      setStatus("error");
      setFeedback("Please select or enter a valid amount.");
      return;
    }

    setStatus("processing");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setStatus("error");
        setFeedback("Could not load payment gateway. Check your connection and try again.");
        return;
      }

      const { data } = await axios.post(`${API_BASE}/donations/create-order`, {
        category,
        amount: finalAmount,
        ...form,
      });

      if (!data.success) {
        setStatus("error");
        setFeedback(data.message || "Could not start the donation. Please try again.");
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: "ISKCON Temple",
        description: category,
        order_id: data.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#E8871E" },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_BASE}/donations/verify`, response);
            if (verifyRes.data.success) {
              setStatus("success");
              setFeedback("Hare Krishna! Your donation was successful. Thank you for your seva.");
            } else {
              setStatus("error");
              setFeedback(verifyRes.data.message || "Payment verification failed.");
            }
          } catch (err) {
            setStatus("error");
            setFeedback("Payment was made, but verification failed. Please contact the temple office with your payment ID.");
          }
        },
        modal: {
          ondismiss: function () {
            setStatus("idle");
            setFeedback("Donation cancelled. No amount was charged.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setStatus("error");
        setFeedback("Payment failed. Please try again or use a different method.");
      });
      rzp.open();
    } catch (err) {
      setStatus("error");
      setFeedback(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-temple-cream min-h-screen font-body">
      {/* Hero */}
      <section className="bg-temple-gradient text-temple-ivory pt-20 pb-10 px-6 text-center">
        <p className="uppercase tracking-[0.3em] text-temple-gold text-xs mb-4">Seva &amp; Offering</p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold mb-4">Give with Devotion</h1>
        <p className="max-w-xl mx-auto text-temple-ivory/80 text-lg">
          Every offering, large or small, sustains the temple's daily worship, festivals and service to the community.
        </p>
      </section>
      <div className="text-temple-maroon bg-temple-cream">
        <ArchDivider className="text-temple-wine -mt-px" />
      </div>

      {/* Category selection */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-temple-maroon text-center mb-2">Choose where your seva goes</h2>
        <p className="text-center text-temple-maroon/60 mb-10">Select a category to direct your contribution</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`text-left rounded-2xl p-5 border-2 transition-all duration-200 ${
                  active
                    ? "border-temple-saffron bg-white shadow-lg shadow-temple-saffron/20 scale-[1.02]"
                    : "border-transparent bg-white/60 hover:bg-white hover:shadow-md"
                }`}
              >
                <p className="font-display text-2xl text-temple-maroon leading-tight">{c.label}</p>
                <p className="text-xs uppercase tracking-wide text-temple-saffron font-semibold mb-2">{c.sub}</p>
                <p className="text-sm text-temple-maroon/60">{c.blurb}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Amount + details form */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <form onSubmit={handleDonate} className="bg-white rounded-3xl shadow-xl shadow-temple-maroon/10 p-8 md:p-10">
          <h3 className="font-display text-2xl text-temple-maroon mb-6">Your contribution</h3>

          <div className="flex flex-wrap gap-3 mb-4">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => {
                  setAmount(amt);
                  setCustomAmount("");
                }}
                className={`px-5 py-2 rounded-full font-semibold border-2 transition ${
                  !customAmount && amount === amt
                    ? "bg-temple-saffron border-temple-saffron text-white"
                    : "border-temple-maroon/20 text-temple-maroon hover:border-temple-saffron"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <label className="block text-sm text-temple-maroon/70 mb-1">Or enter a custom amount (₹)</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 1500"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full mb-6 rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
          />

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className="rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
            />
            <input
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className="rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
            />
            <input
              name="panNumber"
              placeholder="PAN (optional, for 80G receipt)"
              value={form.panNumber}
              onChange={handleChange}
              className="rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
            />
          </div>

          {feedback && (
            <p
              className={`text-sm mb-4 rounded-lg px-4 py-3 ${
                status === "success"
                  ? "bg-green-50 text-green-700"
                  : status === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-temple-cream text-temple-maroon"
              }`}
            >
              {feedback}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "processing"}
            className="w-full bg-temple-maroon text-temple-ivory font-display text-xl tracking-wide py-4 rounded-xl hover:bg-temple-wine transition disabled:opacity-60"
          >
            {status === "processing" ? "Opening secure checkout…" : `Donate ₹${finalAmount || 0}`}
          </button>
          <p className="text-xs text-center text-temple-maroon/50 mt-3">Secured by Razorpay · 256-bit encryption</p>
        </form>
      </section>
    </div>
  );
}
