import React, { useState } from 'react';
import PageBanner from '../PageBanner';
import { SendIcon, PeacockFeatherIcon, LotusIcon } from '../icons';

const TEMPLE_WHATSAPP_NUMBER = '919082860210'; // no + or spaces, per wa.me format

export function Contact() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const f = new FormData(form);
    const name = ((f.get('name') as string) || '').trim();
    const phone = ((f.get('phone') as string) || '').trim();
    const email = ((f.get('email') as string) || '').trim();
    const subject = ((f.get('subject') as string) || '').trim() || 'General Inquiry';
    const message = ((f.get('message') as string) || '').trim();
    const contact = [phone, email].filter(Boolean).join(' | ');

    // 1. ALWAYS save in MongoDB so no inquiry is ever lost
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          contact,
          subject,
          message,
        }),
      });
    } catch (saveErr) {
      console.warn('Backend query save note:', saveErr);
    }

    // 2. Build full pre-filled WhatsApp message with all details
    const whatsappText =
      `🙏 *Hare Krishna! ISKCON Kopargaon Temple Inquiry*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `✉️ *Email:* ${email || 'Not provided'}\n` +
      `📋 *Subject:* ${subject}\n` +
      `💬 *Message:* ${message}`;

    const whatsappUrl = `https://wa.me/${TEMPLE_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

    // Open WhatsApp in a new tab with all details pre-filled
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setDone(true);
    form.reset();
    setLoading(false);
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

          <button className="btn btn--pearl" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Opening WhatsApp…' : 'Send Inquiry (WhatsApp & Temple Record)'}
          </button>

          {done && (
            <p className="success">
              🙏 Hare Krishna! Your inquiry has been saved in the temple database and opened in WhatsApp. Our sevaks will respond promptly.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

export default Contact;
