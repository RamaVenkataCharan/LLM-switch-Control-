import { useState, useEffect } from 'react';
import { History, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type EmailLog = Database['public']['Tables']['email_logs']['Row'];

export default function EmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setLogs(data);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5" style={{ color: 'var(--success-main)' }} />;
      case 'failed':
        return <XCircle className="w-5 h-5" style={{ color: 'var(--danger-main)' }} />;
      case 'pending':
        return <Clock className="w-5 h-5" style={{ color: 'var(--warning-main)' }} />;
      default:
        return null;
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === 'sent').length,
    failed: logs.filter(l => l.status === 'failed').length,
    pending: logs.filter(l => l.status === 'pending').length,
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <div className="icon-box">
              <History className="w-6 h-6" />
            </div>
            Campaign History
          </div>
          <p className="card-subtitle">Track your email sends, deliveries, and errors in real-time.</p>
        </div>
        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <div className="card-body">
        {/* Statistics Widgets */}
        <div className="grid-cols-4">
          <div className="stat-card">
            <History className="stat-icon" />
            <p className="stat-title" style={{ color: 'var(--text-secondary)' }}>Total Dispatched</p>
            <p className="stat-value" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: 'var(--success-light)', borderColor: '#bbf7d0' }}>
            <CheckCircle className="stat-icon" style={{ color: 'var(--success-main)', opacity: 0.2 }} />
            <p className="stat-title" style={{ color: 'var(--success-main)' }}>Successfully Sent</p>
            <p className="stat-value" style={{ color: '#047857' }}>{stats.sent}</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: 'var(--danger-light)', borderColor: '#fecdd3' }}>
            <XCircle className="stat-icon" style={{ color: 'var(--danger-main)', opacity: 0.2 }} />
            <p className="stat-title" style={{ color: 'var(--danger-main)' }}>Failed Deliveries</p>
            <p className="stat-value" style={{ color: '#be123c' }}>{stats.failed}</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: 'var(--warning-light)', borderColor: '#fde68a' }}>
            <Clock className="stat-icon" style={{ color: 'var(--warning-main)', opacity: 0.2 }} />
            <p className="stat-title" style={{ color: 'var(--warning-main)' }}>Pending / Queue</p>
            <p className="stat-value" style={{ color: '#b45309' }}>{stats.pending}</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="data-table-container mt-8" style={{ marginTop: '2rem' }}>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No campaign logs available. Start sending emails to see history here.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    let badgeClass = 'status-badge ';
                    if (log.status === 'sent') badgeClass += 'status-sent';
                    else if (log.status === 'failed') badgeClass += 'status-failed';
                    else badgeClass += 'status-pending';

                    return (
                      <tr key={log.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getStatusIcon(log.status)}
                            <span className={badgeClass}>
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.recipient_name || 'N/A'}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.recipient_email}</p>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '250px' }}>
                            <p style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.subject}>{log.subject}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.body}>{log.body}</p>
                            {log.error_message && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--danger-main)', fontWeight: 500, marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.error_message}>
                                Error: {log.error_message}
                              </p>
                            )}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
