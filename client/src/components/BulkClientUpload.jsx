import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import api from '../api/axiosInstance.js';

export default function BulkClientUpload({ isOpen, onClose, onSuccess }) {
  const [csvData, setCsvData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvData(event.target.result);
      setError('');
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvData.trim()) {
      setError('Please upload a CSV file first');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/auth/bulk-create-clients', { csvData });
      setResult(response.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Bulk upload failed:', err);
      if (err.response?.data?.errors) {
        setError(`Validation errors:\n${err.response.data.errors.join('\n')}`);
      } else {
        setError(err.response?.data?.message || 'Failed to upload clients');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setCsvData('');
    setResult(null);
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Create Clients from CSV">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Instructions */}
        <div style={{
          padding: 16,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 8,
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}>
          <p style={{ margin: 0, fontWeight: 600, marginBottom: 8 }}>CSV Format Requirements:</p>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
            <li>First row must be headers: <code>name,email,password</code></li>
            <li>Each subsequent row is a client record</li>
            <li>Password must be at least 6 characters</li>
            <li>Email must be valid and unique</li>
          </ul>
        </div>

        {/* File Upload */}
        {!csvData ? (
          <div
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              const file = e.dataTransfer.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setCsvData(event.target.result);
                  setError('');
                  setResult(null);
                };
                reader.readAsText(file);
              }
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csv-upload"
            />
            <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
              <Upload size={48} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--accent-blue)' }} />
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                Drop CSV file here or click to upload
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Supports .csv files only</p>
            </label>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <FileText size={16} style={{ position: 'absolute', top: 12, left: 12, color: 'var(--accent-green)' }} />
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="CSV content will appear here..."
              style={{
                width: '100%',
                minHeight: 150,
                padding: '12px 12px 12px 40px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-glass)',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'monospace',
                resize: 'vertical',
              }}
            />
            <button
              onClick={handleReset}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                padding: 4,
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            padding: 12,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            color: '#ef4444',
            fontSize: 13,
            whiteSpace: 'pre-line',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            {error}
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div style={{
            padding: 12,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 8,
            color: '#22c55e',
            fontSize: 13,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}>
            <CheckCircle2 size={16} />
            {result.message}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button
            onClick={handleClose}
            disabled={uploading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !csvData.trim()}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: 8,
              background: uploading || !csvData.trim() ? 'var(--border-subtle)' : 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
              border: 'none',
              color: uploading || !csvData.trim() ? 'var(--text-muted)' : 'white',
              cursor: uploading || !csvData.trim() ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {uploading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Uploading...</> : <><Upload size={16} /> Upload Clients</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
