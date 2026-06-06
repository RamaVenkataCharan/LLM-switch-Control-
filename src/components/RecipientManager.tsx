import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type EmailRecipient = Database['public']['Tables']['email_recipients']['Row'];

export default function RecipientManager() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    const { data, error } = await supabase
      .from('email_recipients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecipients(data);
    }
  };

  const addRecipient = async () => {
    if (!newEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('email_recipients')
        .insert({
          email: newEmail,
          name: newName,
        } as any);

      if (error) throw error;

      setNewEmail('');
      setNewName('');
      loadRecipients();
    } catch (error) {
      console.error('Error adding recipient:', error);
      alert('Failed to add recipient');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecipient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_recipients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadRecipients();
    } catch (error) {
      console.error('Error deleting recipient:', error);
      alert('Failed to delete recipient');
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    setIsLoading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const recipientsToAdd = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [email, name] = line.split(',').map(s => s.trim());
        if (email) {
          recipientsToAdd.push({ email, name: name || '' });
        }
      }

      if (recipientsToAdd.length === 0) {
        alert('No valid recipients found in CSV');
        return;
      }

      const { error } = await supabase
        .from('email_recipients')
        .insert(recipientsToAdd as any);

      if (error) throw error;

      alert(`Successfully added ${recipientsToAdd.length} recipient(s)`);
      setCsvFile(null);
      loadRecipients();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Failed to upload CSV');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <div className="icon-box">
              <Users className="w-6 h-6" />
            </div>
            Audience Management
          </div>
          <p className="card-subtitle">Manage your target recipients and import external lists.</p>
        </div>
        <div className="btn-secondary" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          Total Subscribers: <span style={{ color: 'var(--accent-primary)' }}>{recipients.length}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="grid-cols-2">
          {/* Add Manual Recipient */}
          <div className="template-box" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <Plus className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} /> Single Recipient
            </h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="john.doe@company.com"
                className="form-input"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
              <button
                onClick={addRecipient}
                disabled={isLoading}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>

          {/* Bulk Import */}
          <div className="template-box" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <Upload className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} /> Bulk Import
            </h3>
            <p className="card-subtitle" style={{ marginBottom: '1.25rem', marginTop: 0 }}>
              Upload a CSV file containing <code className="tag" style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>email,name</code> columns.
            </p>
            <div className="form-group">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="form-input"
                style={{ padding: '0.5rem' }}
              />
              <button
                onClick={handleCsvUpload}
                disabled={isLoading || !csvFile}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', backgroundColor: '#1e293b' }}
              >
                <Upload className="w-4 h-4" /> Import Subscribers
              </button>
            </div>
          </div>
        </div>

        {/* Recipients List Table */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Subscriber Database</h3>
            <div className="tag">Active List</div>
          </div>

          <div className="data-table-container">
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Date Added</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        Your audience list is currently empty. Add recipients above to get started.
                      </td>
                    </tr>
                  ) : (
                    recipients.map((recipient) => (
                      <tr key={recipient.id}>
                        <td style={{ fontWeight: 600 }}>
                          {recipient.name || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: 400 }}>Not Provided</span>}
                        </td>
                        <td>{recipient.email}</td>
                        <td>{new Date(recipient.created_at).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => deleteRecipient(recipient.id)}
                            className="btn-icon"
                            title="Remove Subscriber"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
