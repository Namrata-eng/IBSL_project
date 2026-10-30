import React, { useRef, useState } from 'react';

export interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  label = 'Banner / Photo Image',
  className = '',
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = () => {
    if (disabled || uploading) return;
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting the same file will still trigger onChange
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Validate type: jpeg, png, webp only
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please choose a valid JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size: max 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image file is too large. Maximum allowed size is 5 MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const rawToken =
        localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      const token = typeof rawToken === 'string' ? rawToken.replace(/^Bearer\s+/i, '').trim() : '';
      const headers: Record<string, string> = {};
      if (token && token.split('.').length === 3 && !token.startsWith('mock_')) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Upload failed with status ${res.status}`);
      }

      if (data.url) {
        onChange(data.url);
      } else {
        throw new Error('Server did not return a valid image URL');
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (disabled || uploading) return;
    setError(null);
    onChange('');
  };

  return (
    <div className={`image-uploader ${className}`} style={{ display: 'grid', gap: '8px' }}>
      {label && (
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ink, #333)',
            display: 'block',
          }}
        >
          {label}
        </span>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {/* Preview if image URL exists */}
      {value && (
        <div
          style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            background: 'rgba(0, 0, 0, 0.05)',
            maxHeight: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={value}
            alt="Uploaded preview"
            style={{
              width: '100%',
              maxHeight: '180px',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || uploading}
          className="btn btn--gold"
          style={{
            padding: '7px 14px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            opacity: disabled || uploading ? 0.7 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {uploading ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid currentColor',
                  borderRightColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Uploading...</span>
            </>
          ) : value ? (
            <>
              <span>📷</span>
              <span>Change image</span>
            </>
          ) : (
            <>
              <span>➕</span>
              <span>Add image</span>
            </>
          )}
        </button>

        {value && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="btn btn--ink"
            style={{
              padding: '7px 12px',
              fontSize: '13px',
              color: '#ef4444',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🗑️</span>
            <span>Remove</span>
          </button>
        )}

        {value && (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--ink-faint, #666)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '220px',
            }}
            title={value}
          >
            {value}
          </span>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            color: '#dc2626',
            fontSize: '12px',
            fontWeight: 500,
            padding: '4px 8px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

