import { useState, useEffect } from 'react';
import { Send, Save, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];

interface EmailComposerProps {
  onSendComplete: () => void;
}

export default function EmailComposer({ onSendComplete }: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setSelectedTemplate(templateId);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim() || !subject.trim() || !body.trim()) {
      alert('Please fill in template name, subject, and body');
      return;
    }

    setIsSavingTemplate(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: templateName,
          subject,
          body,
        } as any);

      if (error) throw error;

      alert('Template saved successfully!');
      setTemplateName('');
      setShowTemplateForm(false);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const sendToRecipients = async () => {
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in subject and body');
      return;
    }

    setIsSending(true);
    try {
      const { data, error: recipientsError } = await supabase
        .from('email_recipients')
        .select('*');
        
      const recipients: any[] = data || [];

      if (recipientsError) throw recipientsError;

      if (!recipients || recipients.length === 0) {
        alert('No recipients found. Please add recipients first.');
        setIsSending(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      for (const recipient of recipients) {
        let personalizedBody = body;
        personalizedBody = personalizedBody.replace(/\{name\}/g, recipient.name || recipient.email);
        personalizedBody = personalizedBody.replace(/\{email\}/g, recipient.email);

        if (recipient.custom_data) {
          Object.keys(recipient.custom_data).forEach(key => {
            personalizedBody = personalizedBody.replace(
              new RegExp(`\\{${key}\\}`, 'g'),
              recipient.custom_data[key]
            );
          });
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient_email: recipient.email,
            recipient_name: recipient.name,
            subject,
            body: personalizedBody,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to send email to ${recipient.email}`);
        }
      }

      alert(`Emails sent to ${recipients.length} recipient(s)!`);
      onSendComplete();
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <div className="icon-box">
              <Send className="w-6 h-6" />
            </div>
            Compose Campaign
          </div>
          <p className="card-subtitle">Design and send personalized emails to your audience.</p>
        </div>
        <div>
          <button className="btn-secondary">
            Drafts
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="grid-cols-2">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">
              Campaign Template (Optional)
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="form-input"
            >
              <option value="">Choose a pre-designed template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">
              Email Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. You're invited to our exclusive premium webinar!"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <div className="form-label-row">
              <label className="form-label mb-0">
                Email Content
              </label>
              <span className="tag">Tags: {"{name}"}, {"{email}"}</span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Start typing your email content here..."
              rows={12}
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="form-actions">
          {!showTemplateForm ? (
            <button
              onClick={() => setShowTemplateForm(true)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FileText className="w-4 h-4" />
              Save as New Template
            </button>
          ) : (
            <div className="template-box">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Name your template..."
                className="form-input"
                style={{ flex: 1, minWidth: '200px' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={saveTemplate}
                  disabled={isSavingTemplate}
                  className="btn-primary"
                  style={{ backgroundColor: 'var(--success-main)' }}
                >
                  <Save className="w-4 h-4" />
                  {isSavingTemplate ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setShowTemplateForm(false);
                    setTemplateName('');
                  }}
                  className="btn-secondary"
                  style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={sendToRecipients}
            disabled={isSending}
            className="btn-primary"
          >
            <Send className="w-5 h-5" />
            {isSending ? 'Dispatching Campaign...' : 'Blast Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
