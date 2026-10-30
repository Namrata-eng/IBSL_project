import React, { useState } from 'react';
import PageBanner from '../PageBanner';
import { SendIcon, PeacockFeatherIcon, LotusIcon } from '../icons';

const TEMPLE_WHATSAPP_NUMBER = '919082860210'; // no + or spaces, per wa.me format

export function Contact() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const f = new FormData(form);
    const name = ((f.get('name') as string) || '').trim();
    const phone = ((f.get('phone') as string) || '').trim();
    const email = ((f.get('email') as string) || '').trim();
    const subject = ((f.get('subject') as string) || '').trim() || 'General Temple Inquiry';
    const message = ((f.get('message') as string) || '').trim();
    const contact = [phone, email].filter(Boolean).join(' | ');

    if (!name || name.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      setLoading(false);
      return;
    }

    if (!message || message.length < 2) {
      setError('Please enter your message or query details.');
      setLoading(false);
      return;
    }

    // On non-mobile desktop browsers, open a blank window synchronously on user click
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let waWindow: Window | null = null;
    if (!isMobile) {
      try {
        waWindow = window.open('about:blank', '_blank');
      } catch {}
    }

    // 1. ALWAYS SAVE to MongoDB first
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          phone,
          email,
          contact,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (waWindow && !waWindow.closed) waWindow.close();
        throw new Error(data.message || 'Failed to record your inquiry. Please try again.');
      }

      // 2. Build pre-filled WhatsApp message with all details
      const whatsappText =
        `🙏 *Hare Krishna! ISKCON Kopargaon Temple Inquiry*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Phone:* ${phone || 'Not provided'}\n` +
        `✉️ *Email:* ${email || 'Not provided'}\n` +
        `📋 *Subject:* ${subject}\n` +
        `💬 *Message:*\n${message}\n\n` +
        `Sent from iskconkopargaon.com`;

      const waUrl = `https://wa.me/${TEMPLE_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;
      setWhatsappUrl(waUrl);

      // 3. Open WhatsApp after database confirms success
      if (waWindow && !waWindow.closed) {
        waWindow.location.href = waUrl;
      } else {
        window.location.href = waUrl;
      }

      setDone(true);
      form.reset();
    } catch (err: any) {
      if (waWindow && !waWindow.closed) waWindow.close();
      console.error('Contact form submission error:', err);
      setError(err.message || 'Something went wrong while submitting. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page contact">
      <PageBanner
        lead="TEMPLE HELPDESK"
        title="Contact ISKCON Kopargaon"
        subtitle="We are delighted to assist your pilgrimage, spiritual inquiries, and temple visit planning near Shirdi."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Contact Info Card */}
        <div className="card" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <PeacockFeatherIcon size={22} />
            <span className="eyebrow" style={{ margin: 0 }}>TEMPLE LOCATION</span>
          </div>

          <h2 style={{ fontSize: '24px', margin: '8px 0 20px', color: 'var(--ink)' }}>
            Samskar Value Education Centre
          </h2>

          <div style={{ display: 'grid', gap: '18px', fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
            <div>
              <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>📍 Temple Address:</strong>
              Samskar Value Education Centre, Kopargaon, Ahmednagar District, Maharashtra 423603 (Near Shirdi).
            </div>

            <div>
              <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>📞 Phone & WhatsApp:</strong>
              <a href="tel:+919082860210" style={{ color: '#38bdf8', fontWeight: 500 }}>+91 90828 60210</a>
            </div>

            <div>
              <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>✉️ Official Email:</strong>
              <a href="mailto:iskconkopargaon@gmail.com" style={{ color: '#38bdf8', fontWeight: 500 }}>iskconkopargaon@gmail.com</a>
            </div>

            <div>
              <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>🕒 Visiting Hours:</strong>
              Monday – Sunday: 05:00 AM – 09:00 PM (Morning & Evening sessions).
            </div>
          </div>

          <div style={{ marginTop: '28px' }}>
            <a
              href="https://wa.me/919082860210?text=Hare%20Krishna!%20I%20would%20like%20to%20inquire%20about%20ISKCON%20Kopargaon."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--pearl"
              style={{ width: '100%' }}
            >
              Chat Directly on WhatsApp (+91 90828 60210)
            </a>
          </div>
        </div>

        {/* Inquiry Form */}
        <form className="form" onSubmit={handleSubmit} style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <LotusIcon size={20} />
            <span className="eyebrow" style={{ margin: 0 }}>SEND AN INQUIRY</span>
          </div>
          <h3 style={{ fontSize: '19px', margin: '4px 0 16px', color: 'var(--ink)' }}>How Can We Assist You?</h3>

          <label>
            Your Full Name *
            <input required name="name" placeholder="e.g. Ramesh Patil" />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Mobile Phone *
              <input required name="phone" type="tel" placeholder="e.g. 9876543210" />
            </label>
            <label>
              Email Address (Optional)
              <input name="email" type="email" placeholder="e.g. ramesh@example.com" />
            </label>
          </div>

          <label>
            Subject / Purpose of Inquiry
            <select name="subject" defaultValue="General Temple Inquiry">
              <option value="Temple Visit & Darshan Timings">Temple Visit & Darshan Timings</option>
              <option value="Sadhu Bhojan & Annadaan Seva">Sadhu Bhojan & Annadaan Seva</option>
              <option value="Gaushala & Desi Cow Protection">Gaushala & Desi Cow Protection</option>
              <option value="Youth Empowerment & Gita Life Courses">Youth Empowerment & Gita Life Courses</option>
              <option value="Upcoming Festival Sponsorship">Upcoming Festival Sponsorship</option>
              <option value="General Temple Inquiry">General Temple Inquiry</option>
            </select>
          </label>

          <label>
            Message / Inquiry Details *
            <textarea required name="message" rows={4} placeholder="Ask about temple visits, seva sponsorship, accommodation, or festival pujas..." />
          </label>

          {error && (
            <div style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '6px', fontSize: '13.5px' }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn--pearl" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Saving to Temple Database & Opening WhatsApp…' : 'Send Inquiry (WhatsApp & Temple Record)'}
          </button>

          {done && (
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.12)', border: '1.5px solid #10b981', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: '#34d399', margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>
                🙏 Hare Krishna! Your inquiry has been securely saved in the temple database.
              </p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--pearl"
                  style={{ display: 'inline-flex', padding: '10px 18px', fontSize: '13.5px', background: '#22c55e', borderColor: '#22c55e', color: '#fff', fontWeight: 700, margin: '0 auto' }}
                >
                  💬 Open in WhatsApp (Click if not opened automatically)
                </a>
              )}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default Contact;
