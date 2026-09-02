import { useEffect, useState } from "react";
import axios from "axios";
import ArchDivider from "../components/ArchDivider";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyForm = { title: "", description: "", imageUrl: "", timings: "", isActive: true };

export default function Services({ isAdmin = false }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/services`);
      setServices(data.services || []);
    } catch (err) {
      setMessage("Could not load services right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/services/${editingId}`, form, {
          withCredentials: true,
        });
        setMessage("Service updated.");
      } else {
        await axios.post(`${API_BASE}/services`, form, { withCredentials: true });
        setMessage("Service added.");
      }
      resetForm();
      fetchServices();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Action failed. Please check you are logged in as admin.");
    }
  };

  const handleEdit = (service) => {
    setForm({
      title: service.title,
      description: service.description,
      imageUrl: service.imageUrl || "",
      timings: service.timings || "",
      isActive: service.isActive,
    });
    setEditingId(service._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this service from the site?")) return;
    try {
      await axios.delete(`${API_BASE}/services/${id}`, { withCredentials: true });
      setMessage("Service removed.");
      fetchServices();
    } catch (err) {
      setMessage("Could not delete service.");
    }
  };

  return (
    <div className="bg-temple-cream min-h-screen font-body pb-20">
      <section className="bg-temple-gradient text-temple-ivory pt-20 pb-10 px-6 text-center">
        <p className="uppercase tracking-[0.3em] text-temple-gold text-xs mb-4">Daily Worship</p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold mb-4">Temple Services</h1>
        <p className="max-w-xl mx-auto text-temple-ivory/80 text-lg">
          Aartis, darshan timings and seva opportunities offered at the temple.
        </p>
      </section>
      <ArchDivider className="text-temple-wine -mt-px" />

      <section className="max-w-6xl mx-auto px-6 pt-14">
        {isAdmin && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="bg-temple-maroon text-temple-ivory px-6 py-3 rounded-full font-semibold hover:bg-temple-wine transition"
            >
              {showForm ? "Close" : "+ Add Service"}
            </button>
          </div>
        )}

        {message && (
          <p className="mb-6 text-sm bg-white rounded-lg px-4 py-3 text-temple-maroon shadow">{message}</p>
        )}

        {isAdmin && showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-6 mb-10 grid md:grid-cols-2 gap-4"
          >
            <input
              name="title"
              placeholder="Service title"
              value={form.title}
              onChange={handleChange}
              className="rounded-xl border border-temple-maroon/20 px-4 py-3 md:col-span-2"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="rounded-xl border border-temple-maroon/20 px-4 py-3 md:col-span-2"
              rows={3}
              required
            />
            <input
              name="imageUrl"
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={handleChange}
              className="rounded-xl border border-temple-maroon/20 px-4 py-3"
            />
            <input
              name="timings"
              placeholder="Timings e.g. 6:00 AM - 8:00 PM"
              value={form.timings}
              onChange={handleChange}
              className="rounded-xl border border-temple-maroon/20 px-4 py-3"
            />
            <label className="flex items-center gap-2 md:col-span-2 text-temple-maroon/70">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              Visible on public site
            </label>
            <button
              type="submit"
              className="bg-temple-saffron text-white font-semibold px-6 py-3 rounded-xl md:col-span-2 hover:opacity-90"
            >
              {editingId ? "Save changes" : "Add service"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-center text-temple-maroon/60">Loading services…</p>
        ) : services.length === 0 ? (
          <p className="text-center text-temple-maroon/60">No services listed yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s._id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition">
                {s.imageUrl && (
                  <img src={s.imageUrl} alt={s.title} className="w-full h-44 object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-display text-2xl text-temple-maroon mb-1">{s.title}</h3>
                  {s.timings && (
                    <p className="text-xs uppercase tracking-wide text-temple-saffron font-semibold mb-2">
                      {s.timings}
                    </p>
                  )}
                  <p className="text-sm text-temple-maroon/70">{s.description}</p>

                  {isAdmin && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-sm text-temple-saffron font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="text-sm text-red-600 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
