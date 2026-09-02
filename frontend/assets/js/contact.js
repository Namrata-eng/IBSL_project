const contactForm = document.getElementById("contactForm");
const contactFeedback = document.getElementById("contactFeedback");
const contactBtn = document.getElementById("contactBtn");

function showContactFeedback(text, type = "info") {
  contactFeedback.innerHTML = text ? `<p class="feedback ${type}">${text}</p>` : "";
}

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showContactFeedback("");

  const name = document.getElementById("cName").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const phone = document.getElementById("cPhone").value.trim();
  const message = document.getElementById("cMessage").value.trim();

  if (!name || !email || !message) {
    showContactFeedback("Please fill in your name, email and message.", "error");
    return;
  }

  contactBtn.disabled = true;
  contactBtn.textContent = "Sending…";

  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message }),
    });
    const data = await res.json();

    if (data.success) {
      showContactFeedback(data.message || "Thank you. We will get back to you soon.", "success");
      contactForm.reset();
    } else {
      showContactFeedback(data.message || "Could not submit your inquiry.", "error");
    }
  } catch (err) {
    showContactFeedback("Something went wrong. Please try again.", "error");
  } finally {
    contactBtn.disabled = false;
    contactBtn.textContent = "Send Message";
  }
});
