import { useState } from "react";
import axios from "axios";
import ArchDivider from "../components/ArchDivider";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");

    if (!form.name || !form.email || !form.message) {
      setStatus("error");
      setFeedback("Please fill in your name, email and message.");
      return;
    }

    setStatus("sending");
    try {
      const { data } = await axios.post(`${API_BASE}/inquiries`, form);
      if (data.success) {
        setStatus("success");
        setFeedback(data.message || "Thank you. We will get back to you soon.");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
        setFeedback(data.message || "Could not submit your inquiry.");
      }
    } catch (err) {
      setStatus("error");
      setFeedback(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-temple-cream min-h-screen font-body">
      <section className="bg-temple-gradient text-temple-ivory pt-20 pb-10 px-6 text-center">
        <p className="uppercase tracking-[0.3em] text-temple-gold text-xs mb-4">We're here to help</p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold mb-4">Visit &amp; Connect</h1>
        <p className="max-w-xl mx-auto text-temple-ivory/80 text-lg">
          Reach out for darshan timings, event bookings, or any questions about the temple.
        </p>
      </section>
      <ArchDivider className="text-temple-wine -mt-px" />

      <section className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10">
        {/* Address & map */}
        <div>
          <h2 className="font-display text-3xl text-temple-maroon mb-6">Temple Address</h2>
          <div className="space-y-4 text-temple-maroon/80 mb-8">
            <p>
              <span className="font-semibold text-temple-maroon">Address: </span>
              ISKCON Temple, [Street Name], [City], [State] – [PIN Code]
            </p>
            <p>
              <span className="font-semibold text-temple-maroon">Phone: </span>
              +91-XXXXXXXXXX
            </p>
            <p>
              <span className="font-semibold text-temple-maroon">Email: </span>
              info@iskcontemple.org
            </p>
            <p>
              <span className="font-semibold text-temple-maroon">Darshan Hours: </span>
              4:30 AM – 1:00 PM, 4:00 PM – 8:30 PM
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg h-64">
            {/* Replace the src below with your temple's actual Google Maps embed link */}
            <iframe
              title="Temple Location"
              src="https://www.google.com/maps?q=ISKCON+Temple&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Inquiry form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-temple-maroon/10 p-8">
          <h2 className="font-display text-3xl text-temple-maroon mb-6">Send an Inquiry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
            />
            <input
              name="phone"
              placeholder="Phone number (optional)"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
            />
            <textarea
              name="message"
              placeholder="Your message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full rounded-xl border border-temple-maroon/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-temple-saffron"
            />

            {feedback && (
              <p
                className={`text-sm rounded-lg px-4 py-3 ${
                  status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                {feedback}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-temple-maroon text-temple-ivory font-display text-xl tracking-wide py-4 rounded-xl hover:bg-temple-wine transition disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
