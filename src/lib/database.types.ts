export interface Database {
  public: {
    Tables: {
      email_templates: {
        Row: {
          id: string;
          name: string;
          subject: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_recipients: {
        Row: {
          id: string;
          email: string;
          name: string;
          custom_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string;
          custom_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          custom_data?: any;
          created_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          recipient_email: string;
          recipient_name: string;
          subject: string;
          body: string;
          status: 'pending' | 'sent' | 'failed';
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_email: string;
          recipient_name?: string;
          subject: string;
          body: string;
          status?: 'pending' | 'sent' | 'failed';
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_email?: string;
          recipient_name?: string;
          subject?: string;
          body?: string;
          status?: 'pending' | 'sent' | 'failed';
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
