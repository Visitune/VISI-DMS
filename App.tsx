import React, { useState, useEffect } from 'react';
import { Home, BarChart2, PlusCircle, CheckSquare, Bell, Menu, Database, LayoutDashboard, LogOut, Settings, Sliders, BookOpen } from 'lucide-react';
import MeetingRunner from './components/MeetingRunner';
import Dashboard from './components/Dashboard';
import ActionTracker from './components/ActionTracker';
import PackageManager from './components/PackageManager';
import SettingsPanel from './components/SettingsPanel';
import OnboardingModal from './components/OnboardingModal';
import UserGuide from './components/UserGuide';
import { Meeting, ActionItem, ActionStatus, Team, User, DataPackage, MeetingType, AppSettings, DataExport } from './types';
import { MOCK_ACTIONS, USERS, TEAMS, INITIAL_MEETING_STATE, MOCK_PACKAGES, HHSE_THEMES, DEPARTMENTS, DEFAULT_SETTINGS } from './constants';

enum View {
  DASHBOARD = 'DASHBOARD',
  MEETING = 'MEETING',
  ACTIONS = 'ACTIONS',
  PACKAGES = 'PACKAGES',
  SETTINGS = 'SETTINGS',
  GUIDE = 'GUIDE',
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  // Data State - Initialize from LocalStorage if available
  const [actions, setActions] = useState<ActionItem[]>(() => {
    const saved = localStorage.getItem('actions');
    return saved ? JSON.parse(saved) : MOCK_ACTIONS;
  });
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('meetings');
    return saved ? JSON.parse(saved) : [];
  });
  const [packages, setPackages] = useState<DataPackage[]>(() => {
    const saved = localStorage.getItem('packages');
    return saved ? JSON.parse(saved) : MOCK_PACKAGES;
  });
  const [themes, setThemes] = useState<string[]>(() => {
    const saved = localStorage.getItem('themes');
    return saved ? JSON.parse(saved) : HHSE_THEMES;
  });
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('teams');
    return saved ? JSON.parse(saved) : TEAMS;
  });
  const [departments, setDepartments] = useState<string[]>(() => {
    const saved = localStorage.getItem('departments');
    return saved ? JSON.parse(saved) : DEPARTMENTS;
  });
  const [emailConfig, setEmailConfig] = useState(() => {
    return localStorage.getItem('emailConfig') || 'direction.usine@visi-dms.com';
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : USERS[0];
  });
  
  // Meeting logic
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  // Auto-save effect
  useEffect(() => {
    if (settings.enableAutoSave) {
      localStorage.setItem('actions', JSON.stringify(actions));
      localStorage.setItem('meetings', JSON.stringify(meetings));
      localStorage.setItem('packages', JSON.stringify(packages));
      localStorage.setItem('themes', JSON.stringify(themes));
      localStorage.setItem('teams', JSON.stringify(teams));
      localStorage.setItem('departments', JSON.stringify(departments));
      localStorage.setItem('emailConfig', emailConfig);
      localStorage.setItem('settings', JSON.stringify(settings));
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [actions, meetings, packages, themes, teams, departments, emailConfig, settings, currentUser]);

  // Data Management Functions
  const handleExportData = () => {
    const exportData: DataExport = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      actions,
      meetings,
      packages,
      themes,
      departments,
      teams,
      emailConfig
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visi-dms-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as DataExport;
        // Validate basic structure
        if (!json.version || !json.actions) {
          alert("Format de fichier invalide.");
          return;
        }

        if (confirm(`Importer ce package ? Cela remplacera vos données actuelles (${json.actions.length} actions, ${json.meetings.length} réunions).`)) {
          setSettings(json.settings || DEFAULT_SETTINGS);
          setActions(json.actions || []);
          setMeetings(json.meetings || []);
          setPackages(json.packages || []);
          setThemes(json.themes || HHSE_THEMES);
          setDepartments(json.departments || DEPARTMENTS);
          setTeams(json.teams || TEAMS);
          setEmailConfig(json.emailConfig || '');
          alert("Importation réussie !");
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
  };

  const startMeeting = () => {
    setActiveMeeting({
      ...INITIAL_MEETING_STATE,
      id: `mtg-${Date.now()}`,
      startTime: new Date().toISOString()
    });
    setCurrentView(View.MEETING);
  };

  const handleMeetingComplete = (completedMeeting: Meeting, newMeetingActions: ActionItem[]) => {
    setMeetings(prev => [...prev, completedMeeting]);
    setActions(prev => [...newMeetingActions, ...prev]); 
    
    // Generate BYOD Package (Simulate ZIP creation logic)
    const newPackage: DataPackage = {
        id: `pkg-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        meetingId: completedMeeting.id,
        meetingType: completedMeeting.type,
        summary: `Rapport ${completedMeeting.type === MeetingType.DAILY_5 ? '5 Min' : '15 Min'} - ${newMeetingActions.length} actions`,
        actionCount: newMeetingActions.length,
        syncStatus: 'PENDING',
        sizeKb: Math.floor(Math.random() * 50) + 10 // Mock size
    };
    setPackages(prev => [newPackage, ...prev]);

    setActiveMeeting(null);
    setCurrentView(View.ACTIONS); // Redirect to Actions to visualize what happened
  };

  const handleActionStatusUpdate = (id: string, status: ActionStatus) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleActionUpdate = (updatedAction: ActionItem) => {
    setActions(prev => prev.map(a => a.id === updatedAction.id ? updatedAction : a));
  };

  // Content Renderer
  const renderContent = () => {
    if (activeMeeting && currentView === View.MEETING) {
      return (
        <MeetingRunner 
          meeting={activeMeeting}
          teamMembers={teams[0].members} 
          themes={themes}
          departments={departments}
          settings={settings}
          onComplete={handleMeetingComplete}
          onCancel={() => {
            setActiveMeeting(null);
            setCurrentView(View.DASHBOARD);
          }}
        />
      );
    }

    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard actions={actions} meetings={meetings} />;
      case View.ACTIONS:
        return (
          <ActionTracker 
            actions={actions} 
            departments={departments}
            onUpdateStatus={handleActionStatusUpdate} 
            onUpdateAction={handleActionUpdate} 
          />
        );
      case View.PACKAGES:
        return <PackageManager packages={packages} actions={actions} defaultEmail={emailConfig} />;
      case View.SETTINGS:
        return (
          <SettingsPanel 
            themes={themes} 
            setThemes={setThemes} 
            teams={teams}
            setTeams={setTeams}
            departments={departments}
            setDepartments={setDepartments}
            emailConfig={emailConfig}
            setEmailConfig={setEmailConfig}
            settings={settings}
            setSettings={setSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        );
      case View.GUIDE:
        return <UserGuide />;
      default:
        return <Dashboard actions={actions} meetings={meetings} />;
    }
  };

  // Full screen meeting mode
  if (currentView === View.MEETING && activeMeeting) {
    return (
      <div className="h-screen w-screen bg-gray-50 overflow-hidden">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      
      {/* SIDEBAR (Tablet/Desktop) */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-slate-900 text-white flex-col flex-shrink-0 shadow-xl z-20 transition-all duration-300">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700 bg-slate-950">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-900/50">
             <img 
               src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg" 
               alt="VISI-DMS Logo" 
               className="w-full h-full object-contain"
               referrerPolicy="no-referrer"
             />
           </div>
           <span className="ml-3 text-xl font-bold tracking-tight hidden lg:block text-slate-100">VISI-DMS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-2 px-3">
          <NavItem 
            icon={<LayoutDashboard size={24} />} 
            label="Dashboard" 
            isActive={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)} 
          />
          <NavItem 
            icon={<CheckSquare size={24} />} 
            label="Actions & Photos" 
            isActive={currentView === View.ACTIONS} 
            onClick={() => setCurrentView(View.ACTIONS)} 
            badge={actions.filter(a => a.status !== ActionStatus.CLOSED).length}
          />
          <NavItem 
            icon={<Database size={24} />} 
            label="Data & Exports" 
            isActive={currentView === View.PACKAGES} 
            onClick={() => setCurrentView(View.PACKAGES)} 
          />
          <div className="pt-4 mt-4 border-t border-slate-700">
            <NavItem 
                icon={<Sliders size={24} />} 
                label="Paramétrage" 
                isActive={currentView === View.SETTINGS} 
                onClick={() => setCurrentView(View.SETTINGS)} 
            />
            <NavItem 
                icon={<BookOpen size={24} />} 
                label="Guide Utilisateur" 
                isActive={currentView === View.GUIDE} 
                onClick={() => setCurrentView(View.GUIDE)} 
            />
          </div>
        </nav>

        {/* Action Button */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
           <button 
             onClick={startMeeting}
             className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 group"
           >
             <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
             <span className="hidden lg:block font-bold">LANCER RITUEL</span>
           </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700 flex items-center justify-center lg:justify-start gap-3 cursor-pointer hover:bg-slate-800 transition-colors">
           <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-500" />
           <div className="hidden lg:block overflow-hidden">
              <div className="font-bold text-sm truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-400 truncate">{currentUser.role}</div>
           </div>
           <Settings size={18} className="ml-auto text-slate-500 hidden lg:block" />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pb-16 md:pb-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
           <div className="flex items-center gap-3">
             <div className="md:hidden w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-md">
               <img 
                 src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg" 
                 alt="Logo" 
                 className="w-full h-full object-contain"
                 referrerPolicy="no-referrer"
               />
             </div>
             <h2 className="text-lg md:text-xl font-bold text-gray-800 uppercase tracking-wide opacity-80 truncate">
               {currentView === View.DASHBOARD ? 'Vue d\'ensemble' : 
                currentView === View.ACTIONS ? 'Management Visuel' : 
                currentView === View.PACKAGES ? 'Archives Données' : 'Configuration'}
             </h2>
           </div>
           <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Site Connecté
              </div>
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={24} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 p-4 md:p-6 no-scrollbar">
           <div className="max-w-7xl mx-auto h-full">
             {renderContent()}
           </div>
        </main>
      </div>

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 pb-4 z-50 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <MobileNavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Dash" 
          isActive={currentView === View.DASHBOARD} 
          onClick={() => setCurrentView(View.DASHBOARD)} 
        />
        <MobileNavItem 
          icon={<CheckSquare size={20} />} 
          label="Actions" 
          isActive={currentView === View.ACTIONS} 
          onClick={() => setCurrentView(View.ACTIONS)} 
          badge={actions.filter(a => a.status !== ActionStatus.CLOSED).length}
        />
        <div className="relative -top-6">
          <button 
            onClick={startMeeting}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center transform active:scale-95 transition-transform border-4 border-gray-100"
          >
            <PlusCircle size={28} />
          </button>
        </div>
        <MobileNavItem 
          icon={<Database size={20} />} 
          label="Data" 
          isActive={currentView === View.PACKAGES} 
          onClick={() => setCurrentView(View.PACKAGES)} 
        />
        <MobileNavItem 
          icon={<Sliders size={20} />} 
          label="Config" 
          isActive={currentView === View.SETTINGS} 
          onClick={() => setCurrentView(View.SETTINGS)} 
        />
        <MobileNavItem 
          icon={<BookOpen size={20} />} 
          label="Guide" 
          isActive={currentView === View.GUIDE} 
          onClick={() => setCurrentView(View.GUIDE)} 
        />
      </div>

      {/* Onboarding Modal */}
      {!settings.onboardingSeen && (
        <OnboardingModal 
          onClose={() => setSettings({ ...settings, onboardingSeen: true })}
          onGoToGuide={() => {
            setSettings({ ...settings, onboardingSeen: true });
            setCurrentView(View.GUIDE);
          }}
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, badge?: number }> = 
({ icon, label, isActive, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all duration-200 group relative
      ${isActive ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
    `}
  >
    {icon}
    <span className="hidden lg:block">{label}</span>
    {badge && badge > 0 && (
      <span className="absolute top-2 right-2 lg:top-auto lg:bottom-auto lg:right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        {badge}
      </span>
    )}
    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>}
  </button>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, badge?: number }> = 
({ icon, label, isActive, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 relative
      ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}
    `}
  >
    <div className="relative">
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full shadow-sm min-w-[14px] text-center">
          {badge}
        </span>
      )}
    </div>
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

export default App;
