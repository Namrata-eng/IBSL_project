import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { SearchIcon, TilakMark, LotusIcon, HeartIcon } from '../icons';

export function TrackDonation() {
  const [searchParams] = useSearchParams();
  const [referenceId, setReferenceId] = useState(searchParams.get('referenceId') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [donation, setDonation] = useState<{
    referenceId: string;
    amount: number;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
    rejectReason?: string;
  } | null>(null);

  const fetchStatus = async (ref: string, ph: string) => {
    if (!ref.trim() || !ph.trim()) {
      setError('Please provide both your Reference ID and registered Mobile Number.');
      return;
    }

    setLoading(true);
    setError('');
    setDonation(null);

    try {
      const res = await fetch(
        `/api/donations/track?referenceId=${encodeURIComponent(ref.trim())}&phone=${encodeURIComponent(ph.trim())}`
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'No donation found matching the given details.');
      }

      setDonation(json.data);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve status. Please check your Reference ID and Phone Number.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if query params exist on page mount
  useEffect(() => {
    const qRef = searchParams.get('referenceId');
    const qPh = searchParams.get('phone');
    if (qRef && qPh) {
      fetchStatus(qRef, qPh);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(referenceId, phone);
  };

  return (
    <main className="page">
      <PageBanner
        lead="VERIFICATION STATUS"
        title="Track Your Seva Offering"
        subtitle="Check the live manual verification status of your temple donation using your unique Reference ID and Mobile Number."
      />

      <div style={{ maxWidth: '680px', margin: '0 auto 60px' }}>
        {/* Search Card */}
        <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '6px' }}>
                  Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={referenceId}
                  onChange={e => setReferenceId(e.target.value)}
                  placeholder="e.g. DON-2026-0001"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline-gold)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '14.5px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '6px' }}>
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline-gold)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '14.5px',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn--gold"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontWeight: 700 }}
            >
              {loading ? 'Searching Record...' : '🔍 Check Verification Status'}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: '20px',
                padding: '14px 18px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '14px',
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Result Card */}
        {donation && (
          <div
            className="card"
            style={{
              padding: '36px',
              border:
                donation.status === 'verified'
                  ? '2px solid #10b981'
                  : donation.status === 'rejected'
                  ? '2px solid #ef4444'
                  : '2px solid var(--gold)',
              background:
                donation.status === 'verified'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(12, 25, 40, 0.95) 100%)'
                  : donation.status === 'rejected'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(12, 25, 40, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(12, 25, 40, 0.95) 100%)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <small style={{ color: 'var(--ink-soft)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  REFERENCE NUMBER
                </small>
                <h3 style={{ margin: '2px 0 0', fontSize: '22px', fontFamily: 'monospace', color: '#fff' }}>
                  {donation.referenceId}
                </h3>
              </div>

              {/* Status Badge */}
              <div>
                {donation.status === 'pending' && (
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid #f59e0b',
                      color: '#fbbf24',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    ⏳ Verification in Progress
                  </span>
                )}

                {donation.status === 'verified' && (
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10b981',
                      color: '#34d399',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    ✓ Successfully Verified
                  </span>
                )}

                {donation.status === 'rejected' && (
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#f87171',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    ✕ Verification Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Status Message per requirements */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--hairline-gold)',
              }}
            >
              {donation.status === 'pending' && (
                <div style={{ color: '#fbbf24', fontSize: '15px', fontWeight: 500, lineHeight: 1.6 }}>
                  🔔 Verification in progress, within 24 hours. Temple sevadars are verifying the bank receipt.
                </div>
              )}

              {donation.status === 'verified' && (
                <div style={{ color: '#34d399', fontSize: '15px', fontWeight: 500, lineHeight: 1.6 }}>
                  🌸 Successfully verified. Hare Krishna! Your devotional offering has been received and credited to the temple seva fund.
                </div>
              )}

              {donation.status === 'rejected' && (
                <div>
                  <div style={{ color: '#f87171', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
                    Reason for rejection: {donation.rejectReason || 'Transaction could not be confirmed.'}
                  </div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--ink-soft)' }}>
                    If this is an error, please reach out directly to ISKCON Kopargaon temple management at{' '}
                    <a href="tel:+919082860210" style={{ color: '#38bdf8', fontWeight: 600 }}>
                      +91 90828 60210
                    </a>{' '}
                    with your Reference ID.
                  </p>
                </div>
              )}
            </div>

            {/* Donation Summary Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--ink-soft)', display: 'block', fontSize: '12px' }}>OFFERING AMOUNT</span>
                <strong style={{ fontSize: '18px', color: 'var(--gold-bright)' }}>
                  ₹{donation.amount.toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--ink-soft)', display: 'block', fontSize: '12px' }}>SUBMITTED ON</span>
                <strong style={{ fontSize: '16px', color: '#fff' }}>
                  {new Date(donation.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default TrackDonation;

