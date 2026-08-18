import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Complaint,
  Notice,
  ActiveTab,
  AppView,
} from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LoginScreen } from './components/LoginScreen';
import { TopHeader } from './components/TopHeader';
import { ResidentHomeScreen } from './components/ResidentHomeScreen';
import { CommitteeDashboardScreen } from './components/CommitteeDashboardScreen';
import { RaiseComplaintScreen } from './components/RaiseComplaintScreen';
import { ComplaintDetailScreen } from './components/ComplaintDetailScreen';
import { NoticesScreen } from './components/NoticesScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { currentUser, register, login, lookupUser, logout, updateUser } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('complaints');
  const [activeView, setActiveView] = useState<AppView>(() =>
    currentUser ? (currentUser.role === 'committee' ? 'committee_dashboard' : 'resident_home') : 'welcome'
  );
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch data from backend API
  useEffect(() => {
    if (currentUser) {
      fetch('/api/complaints')
        .then(res => res.json())
        .then(data => setComplaints(data))
        .catch(e => console.error(e));

      fetch('/api/notices')
        .then(res => res.json())
        .then(data => setNotices(data))
        .catch(e => console.error(e));
    }
  }, [currentUser]);

  // Adjust default screen when switching tabs
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'complaints') {
      setActiveView(currentUser?.role === 'committee' ? 'committee_dashboard' : 'resident_home');
    } else if (tab === 'raise') {
      setActiveView('raise_complaint');
    } else if (tab === 'notices') {
      setActiveView('notices');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRegisterSuccess = (user: User) => {
    register(user);
    setActiveTab('complaints');
    setActiveView(user.role === 'committee' ? 'committee_dashboard' : 'resident_home');
    showToast(`Welcome, ${user.name}! Account created successfully.`);
  };

  const handleLoginSuccess = (user: User) => {
    login(user); // Actually log the user in context
    setActiveTab('complaints');
    setActiveView(user.role === 'committee' ? 'committee_dashboard' : 'resident_home');
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    logout();
    setActiveView('welcome');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    updateUser(updated);
    if (activeTab === 'complaints') {
      setActiveView(newRole === 'committee' ? 'committee_dashboard' : 'resident_home');
    }
    showToast(`Switched to ${newRole === 'committee' ? 'Committee Management' : 'Resident'} view`);
  };

  const handleCreateComplaint = async (
    newComplaintData: Omit<Complaint, 'id' | 'customId' | 'reportedAt' | 'timeline'>
  ) => {
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `CMP-${idNum}`;
    const now = new Date();
    const timeFormatted = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newComplaint: Complaint = {
      ...newComplaintData,
      id: 'cmp-' + Date.now(),
      customId: newId,
      reportedAt: timeFormatted,
      timeline: [
        {
          id: 'tl-' + Date.now(),
          senderType: 'user',
          senderName: currentUser?.name || 'You',
          senderNameTa: 'நீங்கள்',
          timestamp: timeFormatted,
          text: newComplaintData.description,
          textTa: newComplaintData.descriptionTa,
          photoUrl: newComplaintData.photoUrl,
        },
      ],
    };

    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComplaint)
      });
      setComplaints([newComplaint, ...complaints]);
      setSelectedComplaint(newComplaint);
      setActiveView('complaint_detail');
      showToast('Complaint registered successfully! (புகார் பதிவு செய்யப்பட்டது)');
    } catch (error) {
      console.error(error);
      showToast('Failed to register complaint.');
    }
  };

  const handleUpdateComplaint = async (updatedComplaint: Complaint) => {
    try {
      await fetch(`/api/complaints/${updatedComplaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedComplaint)
      });
      setComplaints(complaints.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c)));
      setSelectedComplaint(updatedComplaint);
      showToast('Complaint updated successfully.');
    } catch (error) {
      console.error(error);
      showToast('Failed to update complaint.');
    }
  };

  const handleAddNotice = async (newNoticeData: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...newNoticeData,
      id: 'not-' + Date.now(),
    };
    try {
      await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice)
      });
      setNotices([newNotice, ...notices]);
      showToast('Notice broadcasted to all residents! (அறிவிப்பு வெளியிடப்பட்டது)');
    } catch (error) {
      console.error(error);
      showToast('Failed to broadcast notice.');
    }
  };

  const handleSelectComplaintDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setActiveView('complaint_detail');
  };

  // --- AUTH SCREENS ---
  if (activeView === 'welcome' && !currentUser) {
    return (
      <WelcomeScreen
        onNavigateToRegister={() => setActiveView('register')}
        onNavigateToLogin={() => setActiveView('login')}
      />
    );
  }

  if (activeView === 'register' && !currentUser) {
    return (
      <RegisterScreen
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToLogin={() => setActiveView('login')}
        onBack={() => setActiveView('welcome')}
      />
    );
  }

  if (activeView === 'login' && !currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setActiveView('register')}
        onBack={() => setActiveView('welcome')}
        lookupUserByPhone={lookupUser}
      />
    );
  }

  // If somehow no user and no auth view, redirect to welcome
  if (!currentUser) {
    return (
      <WelcomeScreen
        onNavigateToRegister={() => setActiveView('register')}
        onNavigateToLogin={() => setActiveView('login')}
      />
    );
  }

  // --- MAIN APP SCREENS ---
  const renderContent = () => {
    if (activeView === 'raise_complaint' || activeTab === 'raise') {
      return (
        <RaiseComplaintScreen
          currentUser={currentUser}
          onBack={() => {
            setActiveTab('complaints');
            setActiveView(currentUser.role === 'committee' ? 'committee_dashboard' : 'resident_home');
          }}
          onSubmit={handleCreateComplaint}
        />
      );
    }

    if (activeView === 'complaint_detail' && selectedComplaint) {
      return (
        <ComplaintDetailScreen
          complaint={selectedComplaint}
          currentUser={currentUser}
          onBack={() => {
            setActiveTab('complaints');
            setActiveView(currentUser.role === 'committee' ? 'committee_dashboard' : 'resident_home');
          }}
          onUpdateComplaint={handleUpdateComplaint}
        />
      );
    }

    if (activeView === 'notices' || activeTab === 'notices') {
      return (
        <>
          <TopHeader
            title="Notices"
            currentUser={currentUser}
            onSwitchRole={handleSwitchRole}
            onLogout={handleLogout}
            onUpdateUser={updateUser}
          />
          <NoticesScreen
            notices={notices}
            currentUser={currentUser}
            onAddNotice={handleAddNotice}
          />
        </>
      );
    }

    if (currentUser.role === 'committee' || activeView === 'committee_dashboard') {
      return (
        <>
          <TopHeader
            title="Committee Dashboard"
            currentUser={currentUser}
            onSwitchRole={handleSwitchRole}
            onLogout={handleLogout}
            onUpdateUser={updateUser}
          />
          <CommitteeDashboardScreen
            complaints={complaints}
            onSelectComplaint={handleSelectComplaintDetail}
          />
        </>
      );
    }

    // Default: Resident Home Screen
    return (
      <>
        <TopHeader
          title="Resident Complaints"
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
          onUpdateUser={updateUser}
        />
        <ResidentHomeScreen
          complaints={complaints}
          currentUser={currentUser}
          onRaiseClick={() => {
            setActiveTab('raise');
            setActiveView('raise_complaint');
          }}
          onSelectComplaint={handleSelectComplaintDetail}
        />
      </>
    );
  };

  const isNavVisible =
    activeView !== 'raise_complaint' && activeView !== 'complaint_detail';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4">
      {/* Main Container */}
      <main
        className="w-full max-w-md bg-[#F4F7F6] min-h-screen sm:min-h-[850px] sm:max-h-[920px] sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 relative overflow-y-auto overflow-x-hidden flex flex-col"
      >
        {renderContent()}

        {/* Bottom Navigation */}
        {isNavVisible && (
          <BottomNavBar activeTab={activeTab} onSelectTab={handleSelectTab} />
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="flex-1 leading-tight">{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
