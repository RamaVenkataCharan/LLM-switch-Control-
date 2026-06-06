import { useState } from 'react';
import { Users, History, Send, Sparkles, LayoutDashboard } from 'lucide-react';
import EmailComposer from './EmailComposer';
import RecipientManager from './RecipientManager';
import EmailLogs from './EmailLogs';

type Tab = 'compose' | 'recipients' | 'logs';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('compose');
  const [refreshLogs, setRefreshLogs] = useState(0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'compose', label: 'Compose Campaign', icon: <Send className="w-5 h-5" /> },
    { id: 'recipients', label: 'Audience', icon: <Users className="w-5 h-5" /> },
    { id: 'logs', label: 'Activity Logs', icon: <History className="w-5 h-5" /> },
  ];

  const handleSendComplete = () => {
    setRefreshLogs(prev => prev + 1);
    setActiveTab('logs');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="sidebar-title">
            <h1>MailForge</h1>
            <p>Enterprise</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">Menu</p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              A
            </div>
            <div className="user-info">
              <p className="name">Admin User</p>
              <p className="email">admin@mailforge.co</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <h2>
            {activeTab === 'compose' && <><LayoutDashboard className="w-6 h-6" /> Dashboard</>}
            {activeTab === 'recipients' && <><Users className="w-6 h-6" /> Audience Management</>}
            {activeTab === 'logs' && <><History className="w-6 h-6" /> Campaign History</>}
          </h2>
          <div>
            <button className="btn-secondary">
              Help ?
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="content-area">
          <div className="bg-decoration"></div>

          <div className="content-wrapper">
            {activeTab === 'compose' && (
              <EmailComposer onSendComplete={handleSendComplete} />
            )}
            {activeTab === 'recipients' && <RecipientManager />}
            {activeTab === 'logs' && <EmailLogs key={refreshLogs} />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
