const servicesGrid = document.getElementById("servicesGrid");
const messageEl = document.getElementById("message");
const adminToolbar = document.getElementById("adminToolbar");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const serviceForm = document.getElementById("serviceForm");
const svcSubmitBtn = document.getElementById("svcSubmitBtn");

const titleInput = document.getElementById("svcTitle");
const descInput = document.getElementById("svcDescription");
const imageInput = document.getElementById("svcImage");
const timingsInput = document.getElementById("svcTimings");
const activeInput = document.getElementById("svcActive");

let editingId = null;

// TEMP: swap this for your teammate's real logged-in-admin check once auth is ready.
// For now, visiting services.html?admin=1 reveals the admin controls for testing.
function isAdminUser() {
  return new URLSearchParams(window.location.search).get("admin") === "1";
}

function showMessage(text, type = "info") {
  messageEl.innerHTML = text ? `<p class="feedback ${type}">${text}</p>` : "";
}

function resetForm() {
  titleInput.value = "";
  descInput.value = "";
  imageInput.value = "";
  timingsInput.value = "";
  activeInput.checked = true;
  editingId = null;
  serviceForm.style.display = "none";
  svcSubmitBtn.textContent = "Add service";
}

async function fetchServices() {
  servicesGrid.innerHTML = `<p style="text-align:center; color:rgba(59,15,20,0.6); grid-column:1/-1;">Loading services…</p>`;
  try {
    const res = await fetch(`${API_BASE}/services`);
    const data = await res.json();
    renderServices(data.services || []);
  } catch (err) {
    servicesGrid.innerHTML = `<p style="text-align:center; color:rgba(59,15,20,0.6); grid-column:1/-1;">Could not load services right now.</p>`;
  }
}

function renderServices(services) {
  if (services.length === 0) {
    servicesGrid.innerHTML = `<p style="text-align:center; color:rgba(59,15,20,0.6); grid-column:1/-1;">No services listed yet.</p>`;
    return;
  }

  servicesGrid.innerHTML = "";
  services.forEach((s) => {
    const card = document.createElement("div");
    card.className = "card service-card";
    card.innerHTML = `
      ${s.imageUrl ? `<img src="${s.imageUrl}" alt="${s.title}" />` : ""}
      <div class="body">
        <h3 class="font-display" style="font-size:1.5rem; color:var(--temple-maroon);">${s.title}</h3>
        ${s.timings ? `<p class="timings">${s.timings}</p>` : ""}
        <p class="desc">${s.description}</p>
        ${
          isAdminUser()
            ? `<div class="service-actions">
                <button class="edit" data-id="${s._id}">Edit</button>
                <button class="delete" data-id="${s._id}">Delete</button>
              </div>`
            : ""
        }
      </div>
    `;
    servicesGrid.appendChild(card);

    if (isAdminUser()) {
      card.querySelector(".edit").addEventListener("click", () => handleEdit(s));
      card.querySelector(".delete").addEventListener("click", () => handleDelete(s._id));
    }
  });
}

function handleEdit(s) {
  titleInput.value = s.title;
  descInput.value = s.description;
  imageInput.value = s.imageUrl || "";
  timingsInput.value = s.timings || "";
  activeInput.checked = s.isActive;
  editingId = s._id;
  serviceForm.style.display = "block";
  svcSubmitBtn.textContent = "Save changes";
  window.scrollTo({ top: serviceForm.offsetTop - 100, behavior: "smooth" });
}

async function handleDelete(id) {
  if (!confirm("Remove this service from the site?")) return;
  try {
    const res = await fetch(`${API_BASE}/services/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showMessage("Service removed.", "success");
      fetchServices();
    } else {
      showMessage(data.message || "Could not delete service.", "error");
    }
  } catch (err) {
    showMessage("Could not delete service.", "error");
  }
}

if (isAdminUser()) {
  adminToolbar.style.display = "flex";
}

toggleFormBtn?.addEventListener("click", () => {
  if (serviceForm.style.display === "block") {
    resetForm();
  } else {
    serviceForm.style.display = "block";
  }
});

serviceForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    imageUrl: imageInput.value.trim(),
    timings: timingsInput.value.trim(),
    isActive: activeInput.checked,
  };

  try {
    const url = editingId ? `${API_BASE}/services/${editingId}` : `${API_BASE}/services`;
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      showMessage(editingId ? "Service updated." : "Service added.", "success");
      resetForm();
      fetchServices();
    } else {
      showMessage(data.message || "Action failed. Please check you are logged in as admin.", "error");
    }
  } catch (err) {
    showMessage("Action failed. Please try again.", "error");
  }
});

fetchServices();
