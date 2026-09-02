const CATEGORIES = [
  { key: "Annadanam (Food Seva)", label: "Annadanam", sub: "Food Seva", blurb: "Sponsor a meal for devotees and those in need." },
  { key: "Temple Construction", label: "Temple", sub: "Construction", blurb: "Help build and maintain the temple structure." },
  { key: "Deity Ornaments (Sringar)", label: "Sringar", sub: "Deity Ornaments", blurb: "Contribute towards the Deities' daily adornment." },
  { key: "Festival Sponsorship", label: "Utsav", sub: "Festival Sponsorship", blurb: "Support festivals, kirtans and celebrations." },
  { key: "Cow Protection (Goshala)", label: "Goshala", sub: "Cow Protection", blurb: "Care for the temple's cows and goshala." },
  { key: "General Donation", label: "General", sub: "Donation", blurb: "Support wherever the need is greatest." },
];

const PRESET_AMOUNTS = [101, 501, 1101, 2101];

let selectedCategory = CATEGORIES[0].key;
let selectedAmount = 501;

const categoryGrid = document.getElementById("categoryGrid");
const amountChips = document.getElementById("amountChips");
const customAmountInput = document.getElementById("customAmount");
const donateBtn = document.getElementById("donateBtn");
const feedbackEl = document.getElementById("feedback");
const form = document.getElementById("donateForm");

function renderCategories() {
  categoryGrid.innerHTML = "";
  CATEGORIES.forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-card" + (c.key === selectedCategory ? " active" : "");
    btn.innerHTML = `
      <p class="label">${c.label}</p>
      <p class="sub">${c.sub}</p>
      <p class="blurb">${c.blurb}</p>
    `;
    btn.addEventListener("click", () => {
      selectedCategory = c.key;
      renderCategories();
    });
    categoryGrid.appendChild(btn);
  });
}

function renderAmountChips() {
  amountChips.innerHTML = "";
  PRESET_AMOUNTS.forEach((amt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    const isActive = !customAmountInput.value && selectedAmount === amt;
    btn.className = "amount-chip" + (isActive ? " active" : "");
    btn.textContent = `₹${amt}`;
    btn.addEventListener("click", () => {
      selectedAmount = amt;
      customAmountInput.value = "";
      renderAmountChips();
      updateButtonLabel();
    });
    amountChips.appendChild(btn);
  });
}

function getFinalAmount() {
  return customAmountInput.value ? Number(customAmountInput.value) : selectedAmount;
}

function updateButtonLabel() {
  const amt = getFinalAmount() || 0;
  donateBtn.textContent = `Donate ₹${amt}`;
}

function showFeedback(message, type = "info") {
  feedbackEl.innerHTML = message
    ? `<p class="feedback ${type}">${message}</p>`
    : "";
}

customAmountInput.addEventListener("input", () => {
  renderAmountChips();
  updateButtonLabel();
});

renderCategories();
renderAmountChips();
updateButtonLabel();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showFeedback("");

  const name = document.getElementById("donorName").value.trim();
  const email = document.getElementById("donorEmail").value.trim();
  const phone = document.getElementById("donorPhone").value.trim();
  const panNumber = document.getElementById("donorPan").value.trim();
  const amount = getFinalAmount();

  if (!name || !email || !phone) {
    showFeedback("Please fill in your name, email and phone number.", "error");
    return;
  }
  if (!amount || amount <= 0) {
    showFeedback("Please select or enter a valid amount.", "error");
    return;
  }

  donateBtn.disabled = true;
  donateBtn.textContent = "Opening secure checkout…";

  try {
    const res = await fetch(`${API_BASE}/donations/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: selectedCategory, name, email, phone, panNumber, amount }),
    });
    const data = await res.json();

    if (!data.success) {
      showFeedback(data.message || "Could not start the donation. Please try again.", "error");
      donateBtn.disabled = false;
      updateButtonLabel();
      return;
    }

    const options = {
      key: data.razorpayKeyId,
      amount: data.amount,
      currency: data.currency,
      name: "ISKCON Temple",
      description: selectedCategory,
      order_id: data.orderId,
      prefill: { name, email, contact: phone },
      theme: { color: "#E8871E" },
      handler: async function (response) {
        try {
          const verifyRes = await fetch(`${API_BASE}/donations/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            showFeedback("Hare Krishna! Your donation was successful. Thank you for your seva.", "success");
          } else {
            showFeedback(verifyData.message || "Payment verification failed.", "error");
          }
        } catch (err) {
          showFeedback("Payment was made, but verification failed. Please contact the temple office with your payment ID.", "error");
        }
        donateBtn.disabled = false;
        updateButtonLabel();
      },
      modal: {
        ondismiss: function () {
          showFeedback("Donation cancelled. No amount was charged.", "info");
          donateBtn.disabled = false;
          updateButtonLabel();
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function () {
      showFeedback("Payment failed. Please try again or use a different method.", "error");
      donateBtn.disabled = false;
      updateButtonLabel();
    });
    rzp.open();
  } catch (err) {
    showFeedback("Something went wrong. Please try again.", "error");
    donateBtn.disabled = false;
    updateButtonLabel();
  }
});
