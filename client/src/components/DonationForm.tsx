import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XIcon, HeartIcon, LotusIcon, PeacockFeatherIcon } from './icons';

interface DonationFormProps {
  initialAmount?: number | string;
  initialType?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function DonationForm({
  initialAmount = '',
  initialType = 'General Seva',
  isOpen,
  onClose,
  title = 'Submit Payment Details for Verification',
}: DonationFormProps) {
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [amount, setAmount] = useState(String(initialAmount || ''));
  const [type, setType] = useState(initialType || 'General Seva');
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    referenceId: string;
    status: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initial values whenever modal opens or props change
  useEffect(() => {
    if (initialAmount) setAmount(String(initialAmount));
    if (initialType) setType(initialType);
    setError('');
    setSuccessData(null);
    setCopied(false);

    // Pre-fill from logged-in user profile if available
    try {
      const stored = localStorage.getItem('userData');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setDonorName(u.name);
        if (u.phone) setDonorPhone(u.phone);
        if (u.email) setDonorEmail(u.email);
      }
    } catch {}
  }, [isOpen, initialAmount, initialType]);

  // Clean up object URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isPdf = selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf');
    const isImage =
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(selected.type) ||
      /\.(jpe?g|png|webp)$/i.test(selected.name);

    if (!isPdf && !isImage) {
      setError('Please select a valid image (JPEG, PNG, WebP) or PDF receipt file.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('Proof file size must be less than 5 MB.');
      return;
    }

    setError('');
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(isPdf ? '' : URL.createObjectURL(selected));
  };

  const handleCopyRef = () => {
    if (successData?.referenceId) {
      navigator.clipboard.writeText(successData.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!donorName.trim() || donorName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    const cleanPhone = donorPhone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount < 1 || parsedAmount > 500000) {
      setError('Please enter a valid donation amount between ₹1 and ₹5,00,000.');
      return;
    }

    const cleanTxn = transactionId.trim();
    if (!cleanTxn || cleanTxn.length < 6 || cleanTxn.length > 30 || !/^[a-zA-Z0-9]+$/.test(cleanTxn)) {
      setError('Please enter a valid alphanumeric Transaction / UTR ID (6 to 30 characters).');
      return;
    }

    if (!file) {
      setError('Please attach your payment screenshot proof.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('donorName', donorName.trim());
      formData.append('donorPhone', cleanPhone);
      if (donorEmail.trim()) formData.append('donorEmail', donorEmail.trim());
      formData.append('amount', String(parsedAmount));
      formData.append('type', type.trim() || 'General Seva');
      formData.append('purpose', type.trim() || 'General Seva');
      formData.append('transactionId', cleanTxn);
      formData.append('screenshot', file);
      formData.append('proof', file);

      // Include Bearer token if user happens to be logged in
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // IMPORTANT: Do NOT manually set Content-Type so browser sets multipart boundary
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit donation verification request.');
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while submitting. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setTransactionId('');
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(5, 12, 22, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, rgba(22, 36, 54, 0.98) 0%, rgba(12, 20, 32, 0.98) 100%)',
          border: '1.5px solid var(--gold)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.25)',
          padding: '28px',
          position: 'relative',
          borderRadius: '12px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--ink-soft)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <XIcon size={20} />
        </button>

        {/* Success View */}
        {successData ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontSize: '36px',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
              }}
            >
              ✓
            </div>

            <span className="eyebrow" style={{ color: 'var(--gold-bright)' }}>
              OFFERING RECORDED
            </span>
            <h2 style={{ fontSize: '24px', margin: '8px 0 14px', color: '#fff' }}>
              Hare Krishna! Thank You
            </h2>

            <p style={{ color: 'var(--ink-soft)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              Your donation is submitted. Verification will be done within 24 hours by temple administrators.
            </p>

            {/* Reference ID Box */}
            <div
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px dashed var(--gold)',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <small style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>
                  Your Reference ID
                </small>
                <strong style={{ fontSize: '20px', color: '#fff', letterSpacing: '1px', fontFamily: 'monospace' }}>
                  {successData.referenceId}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleCopyRef}
                className="btn btn--pearl"
                style={{ padding: '8px 14px', fontSize: '12.5px' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy ID'}
              </button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <Link
                to={`/track-donation?referenceId=${encodeURIComponent(successData.referenceId)}&phone=${encodeURIComponent(donorPhone)}`}
                className="btn btn--gold"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={onClose}
              >
                🔍 Track Donation Status
              </Link>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn--ink"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Submit Another Payment Proof
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <LotusIcon size={22} />
              <span className="eyebrow" style={{ margin: 0 }}>
                DIRECT DONATION VERIFICATION
              </span>
            </div>

            <h2 style={{ fontSize: '22px', margin: '4px 0 8px', color: '#fff' }}>
              {title}
            </h2>

            <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', lineHeight: 1.55, marginBottom: '20px' }}>
              If you have made a payment via Razorpay, UPI, or QR code, please provide your transaction ID and receipt screenshot below.
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  marginBottom: '18px',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
              {/* Row: Name & Mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '5px' }}>
                    Devotee / Donor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--hairline-gold)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '5px' }}>
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={donorPhone}
                    onChange={e => setDonorPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--hairline-gold)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* Row: Email & Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '5px' }}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={e => setDonorEmail(e.target.value)}
                    placeholder="radhika@example.com"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--hairline-gold)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '5px' }}>
                    Donation Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={500000}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="e.g. 1100"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--hairline-gold)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              {/* Seva Type & Transaction ID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '5px' }}>
                    Seva Offering Category
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: '#162436',
                      border: '1px solid var(--hairline-gold)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  >
                    <option value="Annadaan Seva">Annadaan / Sadhu Bhojan</option>
                    <option value="Gaushala Seva">Gaushala / Cow Care</option>
                    <option value="General Seva">General Temple Seva</option>
                    <option value="Deity Seva">Sri Radha Krishna Flower & Deity Seva</option>
                    <option value="Gita Daan">Gift a Bhagavad Gita</option>
                    <option value="Festival Seva">Festival Sponsorship</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '5px' }}>
                    Transaction ID / UTR / Order ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="e.g. pay_N23Fx920 or UPI UTR"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--hairline-gold)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>

              {/* Screenshot Upload with Live Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '5px' }}>
                  Upload Payment Screenshot / Receipt Proof * (JPEG, PNG, WebP or PDF &lt; 5MB)
                </label>
                <div
                  style={{
                    border: '2px dashed var(--hairline-gold)',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('screenshot-file-input')?.click()}
                >
                  <input
                    id="screenshot-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    required={!file}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  {file?.type === 'application/pdf' || file?.name.toLowerCase().endsWith('.pdf') ? (
                    <div style={{ padding: '8px' }}>
                      <span style={{ fontSize: '36px', display: 'block', marginBottom: '4px' }}>📄</span>
                      <strong style={{ color: '#fff', fontSize: '13.5px', display: 'block' }}>{file.name}</strong>
                      <small style={{ color: 'var(--gold)', fontSize: '12px' }}>
                        PDF Document ({(file.size / 1024).toFixed(1)} KB) · Click to change file
                      </small>
                    </div>
                  ) : previewUrl ? (
                    <div>
                      <img
                        src={previewUrl}
                        alt="Payment Proof Preview"
                        style={{
                          maxHeight: '140px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          border: '1px solid var(--gold)',
                          margin: '0 auto 8px',
                          display: 'block',
                        }}
                      />
                      <small style={{ color: 'var(--gold)', fontSize: '12px' }}>
                        Click to change image ({file?.name})
                      </small>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--ink-faint)', padding: '10px 0' }}>
                      <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>📸</span>
                      <strong style={{ color: 'var(--gold)', fontSize: '13.5px' }}>
                        Choose Screenshot or PDF Receipt
                      </strong>
                      <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                        Attach your UPI confirmation, bank receipt, or Razorpay screenshot/PDF
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="btn btn--ink"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn--gold"
                  style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}
                >
                  {loading ? 'Submitting Proof...' : '🙏 Submit Payment Proof'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonationForm;

