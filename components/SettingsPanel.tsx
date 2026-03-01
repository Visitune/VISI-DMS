import React, { useState, useRef, useEffect } from 'react';
import { Save, Plus, Trash2, Users, Shield, Factory, Sliders, Mail, Briefcase, Mic, Timer, Database, Download, Upload, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { Team, User, UserRole, AppSettings } from '../types';
import { saveApiKey, hasApiKey } from '../services/geminiService';

interface SettingsPanelProps {
  themes: string[];
  setThemes: (themes: string[]) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  departments: string[];
  setDepartments: (depts: string[]) => void;
  emailConfig: string;
  setEmailConfig: (email: string) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  themes, setThemes, 
  teams, setTeams,
  departments, setDepartments,
  emailConfig, setEmailConfig,
  settings, setSettings,
  onExportData, onImportData,
  currentUser, setCurrentUser
}) => {
  const [activeTab, setActiveTab] = useState<'THEMES' | 'TEAMS' | 'DEPTS' | 'WORKFLOW' | 'FEATURES' | 'DATA' | 'PROFILE' | 'API'>('THEMES');
  const [newTheme, setNewTheme] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setApiKeySaved(hasApiKey());
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setApiKeySaved(true);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentUser({ ...currentUser, avatar: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTheme = () => {
    if (newTheme.trim()) {
      setThemes([...themes, newTheme.trim()]);
      setNewTheme('');
    }
  };

  const handleRemoveTheme = (index: number) => {
    const updated = themes.filter((_, i) => i !== index);
    setThemes(updated);
  };

  const handleAddDept = () => {
    if (newDept.trim()) {
      setDepartments([...departments, newDept.trim()]);
      setNewDept('');
    }
  };

  const handleRemoveDept = (index: number) => {
    const updated = departments.filter((_, i) => i !== index);
    setDepartments(updated);
  };

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: newTeamName.trim(),
        members: []
      };
      setTeams([...teams, newTeam]);
      setNewTeamName('');
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
  };

  const handleAddMemberToTeam = (teamId: string) => {
    if (newMemberName.trim() && newMemberEmail.trim()) {
      const newMember: User = {
        id: `user-${Date.now()}`,
        name: newMemberName.trim(),
        role: UserRole.OPERATOR,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newMemberName.trim())}`
      };
      setTeams(teams.map(team => {
        if (team.id === teamId) {
          return { ...team, members: [...team.members, newMember] };
        }
        return team;
      }));
      setNewMemberName('');
      setNewMemberEmail('');
    }
  };

  const handleRemoveMemberFromTeam = (teamId: string, memberId: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return { ...team, members: team.members.filter(m => m.id !== memberId) };
      }
      return team;
    }));
  };

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Sliders className="text-blue-600" /> 
              Paramétrage
            </h1>
            <p className="text-gray-500 text-sm">Configuration générale et flux de travail</p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full pb-20">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('THEMES')}
              className={`text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'THEMES' ? 'bg-white shadow-md border-l-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
            >
              <Shield size={20} />
              <span className="font-bold">Bibliothèque HHSE</span>
            </button>
            <button 
              onClick={() => setActiveTab('DEPTS')}
              className={`text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'DEPTS' ? 'bg-white shadow-md border-l-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
            >
              <Briefcase size={20} />
              <span className="font-bold">Départements</span>
            </button>
            <button 
              onClick={() => setActiveTab('TEAMS')}
              className={`text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'TEAMS' ? 'bg-white shadow-md border-l-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
            >
              <Users size={20} />
              <span className="font-bold">Équipes & Zones</span>
            </button>
            <button 
              onClick={() => setActiveTab('WORKFLOW')}
              className={`text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'WORKFLOW' ? 'bg-white shadow-md border-l-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
            >
              <Factory size={20} />
              <span className="font-bold">Workflow & Mail</span>
            </button>
            <div className="border-t border-gray-200 my-2"></div>
            <button 
              onClick={() => setActiveTab('FEATURES')}
              className={`text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'FEATURES' ? 'bg-white shadow-md border-l-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
            >
              <Sliders size={20} />
              <span className="font-bold">Fonctionnalités</span>
            </button>
            <button 
              onClick={() => setActiveTab('DATA')}
              className={`text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'DATA' ? 'bg-white shadow-md border-l-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
            >
              <Database size={20} />
              <span className="font-bold">Données & Backup</span>
            </button>
            <div className="border-t border-gray-200 my-2"></div>
            <button 
              onClick={() => setActiveTab('PROFILE')}
              className={`text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'PROFILE' ? 'bg-white shadow-md border-l-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
            >
              <Shield size={20} />
              <span className="font-bold">Mon Profil</span>
            </button>
            <button 
              onClick={() => setActiveTab('API')}
              className={`text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'API' ? 'bg-white shadow-md border-l-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
            >
              <Shield size={20} />
              <span className="font-bold">Clé API Gemini</span>
            </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 overflow-y-auto">
            
            {/* TAB: THEMES */}
            {activeTab === 'THEMES' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-800">Thèmes HHSE du Jour</h2>
                 <p className="text-sm text-gray-500">Ces thèmes tourneront aléatoirement lors des réunions 5 minutes.</p>
                 
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTheme}
                      onChange={(e) => setNewTheme(e.target.value)}
                      placeholder="Nouveau thème (ex: Risque incendie)"
                      className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleAddTheme}
                      className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
                    >
                      <Plus />
                    </button>
                 </div>

                 <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {themes.map((theme, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                         <span className="font-medium text-gray-700">{theme}</span>
                         <button onClick={() => handleRemoveTheme(idx)} className="text-gray-400 hover:text-red-500">
                           <Trash2 size={18} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* TAB: DEPTS */}
            {activeTab === 'DEPTS' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-800">Départements & Services</h2>
                 <p className="text-sm text-gray-500">Liste des services pour classifier les actions (ex: Maintenance, Qualité).</p>
                 
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      placeholder="Nouveau service (ex: Informatique)"
                      className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleAddDept}
                      className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
                    >
                      <Plus />
                    </button>
                 </div>

                 <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {departments.map((dept, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                         <span className="font-medium text-gray-700">{dept}</span>
                         <button onClick={() => handleRemoveDept(idx)} className="text-gray-400 hover:text-red-500">
                           <Trash2 size={18} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* TAB: TEAMS */}
            {activeTab === 'TEAMS' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-800">Gestion des Équipes</h2>
                 <p className="text-sm text-gray-500">Créez des équipes et ajoutez des membres avec nom et email.</p>
                 
                 {/* Add new team */}
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Nom de la nouvelle équipe"
                      className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleAddTeam}
                      className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
                    >
                      <Plus />
                    </button>
                 </div>
                 
                 <div className="space-y-4">
                    {teams.map(team => (
                      <div key={team.id} className="p-4 border border-gray-200 rounded-xl">
                         <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg">{team.name}</h3>
                            <button 
                              onClick={() => handleRemoveTeam(team.id)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="Supprimer l'équipe"
                            >
                              <Trash2 size={18} />
                            </button>
                         </div>
                         
                         {/* Members list */}
                         <div className="mb-3">
                           <p className="text-sm text-gray-500 mb-2">{team.members.length} membre(s)</p>
                           <div className="flex flex-wrap gap-2">
                             {team.members.map(member => (
                               <div key={member.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm">
                                 <span>{member.name}</span>
                                 <button 
                                   onClick={() => handleRemoveMemberFromTeam(team.id, member.id)}
                                   className="text-gray-400 hover:text-red-500"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                             ))}
                           </div>
                         </div>
                         
                         {/* Add member form */}
                         <div className="flex gap-2 mt-2">
                           <input 
                             type="text"
                             value={selectedTeamId === team.id ? newMemberName : ''}
                             onChange={(e) => { setNewMemberName(e.target.value); setSelectedTeamId(team.id); }}
                             placeholder="Nom du membre"
                             className="flex-1 p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                           />
                           <input 
                             type="email"
                             value={selectedTeamId === team.id ? newMemberEmail : ''}
                             onChange={(e) => { setNewMemberEmail(e.target.value); setSelectedTeamId(team.id); }}
                             placeholder="Email"
                             className="flex-1 p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                           />
                           <button 
                             onClick={() => handleAddMemberToTeam(team.id)}
                             className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
                           >
                             <Plus size={16} />
                           </button>
                         </div>
                      </div>
                    ))}
                    {teams.length === 0 && (
                      <p className="text-gray-400 text-center py-4">Aucune équipe. Ajoutez votre première équipe ci-dessus.</p>
                    )}
                 </div>
              </div>
            )}

            {/* TAB: WORKFLOW */}
            {activeTab === 'WORKFLOW' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-800">Workflow & Reporting</h2>
                 
                 <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                       <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                         <Mail size={16} /> Email destinataire des rapports
                       </label>
                       <input 
                          type="email" 
                          value={emailConfig}
                          onChange={(e) => setEmailConfig(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                       />
                       <p className="text-xs text-gray-500 mt-1">Les exports d'actions seront envoyés à cette adresse par défaut.</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                       <div>
                          <div className="font-bold text-gray-800">Signature Obligatoire</div>
                          <div className="text-xs text-gray-500">Requiert une signature écran à la fin du point 5'.</div>
                       </div>
                       <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* TAB: FEATURES */}
            {activeTab === 'FEATURES' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-800">Fonctionnalités Optionnelles</h2>
                 <p className="text-sm text-gray-500">Activez ou désactivez les modules selon vos besoins opérationnels.</p>
                 
                 <div className="space-y-4">
                    {/* Voice Input */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Mic size={20} /></div>
                          <div>
                             <div className="font-bold text-gray-800">Saisie Vocale (IA)</div>
                             <div className="text-xs text-gray-500">Permet de dicter les observations via le micro.</div>
                          </div>
                       </div>
                       <button onClick={() => toggleSetting('enableVoiceInput')} className="text-blue-600">
                          {settings.enableVoiceInput ? <ToggleRight size={40} className="text-blue-600" /> : <ToggleLeft size={40} className="text-gray-300" />}
                       </button>
                    </div>

                    {/* Section Timer */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Timer size={20} /></div>
                          <div>
                             <div className="font-bold text-gray-800">Chronomètre par Section</div>
                             <div className="text-xs text-gray-500">Affiche un compte à rebours pour chaque étape du rituel.</div>
                          </div>
                       </div>
                       <button onClick={() => toggleSetting('enableSectionTimer')} className="text-blue-600">
                          {settings.enableSectionTimer ? <ToggleRight size={40} className="text-blue-600" /> : <ToggleLeft size={40} className="text-gray-300" />}
                       </button>
                    </div>

                    {/* Auto Save */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Save size={20} /></div>
                          <div>
                             <div className="font-bold text-gray-800">Sauvegarde Locale Auto</div>
                             <div className="text-xs text-gray-500">Sauvegarde vos données dans le navigateur automatiquement.</div>
                          </div>
                       </div>
                       <button onClick={() => toggleSetting('enableAutoSave')} className="text-blue-600">
                          {settings.enableAutoSave ? <ToggleRight size={40} className="text-blue-600" /> : <ToggleLeft size={40} className="text-gray-300" />}
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {/* TAB: DATA */}
            {activeTab === 'DATA' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-800">Gestion des Données</h2>
                 <p className="text-sm text-gray-500">Importez ou exportez vos données pour les sauvegarder ou les transférer.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export */}
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center space-y-4">
                       <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Download size={32} />
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-800">Exporter le Package</h3>
                          <p className="text-xs text-gray-500 mt-1">Télécharge un fichier JSON contenant toutes vos actions, réunions et paramètres.</p>
                       </div>
                       <button 
                          onClick={onExportData}
                          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                       >
                          Télécharger (.json)
                       </button>
                    </div>

                    {/* Import */}
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center text-center space-y-4">
                       <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                          <Upload size={32} />
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-800">Importer un Package</h3>
                          <p className="text-xs text-gray-500 mt-1">Restaurer une sauvegarde ou charger les données d'un autre site.</p>
                       </div>
                       <input 
                          type="file" 
                          accept=".json" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden" 
                       />
                       <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                       >
                          Charger un fichier
                       </button>
                    </div>
                 </div>

                 <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800 flex items-start gap-2">
                    <Shield size={16} className="mt-0.5 flex-shrink-0" />
                    <p>
                       <strong>Attention :</strong> L'importation remplacera toutes les données actuelles. Assurez-vous d'avoir exporté vos données actuelles avant d'importer un nouveau package.
                    </p>
                 </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-8">
                 <h2 className="text-xl font-bold text-gray-800">Mon Profil Utilisateur</h2>
                 
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                       <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-lg">
                          <img 
                            src={currentUser.avatar || 'https://i.pravatar.cc/150?u=default'} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                       </div>
                       <button 
                         onClick={() => avatarInputRef.current?.click()}
                         className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
                       >
                         <Upload size={16} />
                       </button>
                       <input 
                         type="file" 
                         ref={avatarInputRef} 
                         onChange={handleAvatarChange} 
                         accept="image/*" 
                         className="hidden" 
                       />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Nom Complet</label>
                          <input 
                             type="text" 
                             value={currentUser.name}
                             onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                             className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                             placeholder="Ex: Jean Dupont"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Rôle / Fonction</label>
                          <select 
                             value={currentUser.role}
                             onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as UserRole })}
                             className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                          >
                             {Object.values(UserRole).map(role => (
                               <option key={role} value={role}>{role}</option>
                             ))}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                    <Info size={16} className="mt-0.5 flex-shrink-0" />
                    <p>
                       Ces informations seront utilisées pour identifier l'auteur des actions et des rapports générés. Les données sont stockées localement sur cet appareil.
                    </p>
                 </div>
              </div>
            )}

            {/* TAB: API */}
            {activeTab === 'API' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-800">Clé API Gemini</h2>
                 <p className="text-sm text-gray-500">
                   Entrez votre clé API Google AI pour activer les fonctionnalités d'intelligence artificielle (analyse de risque, reformulation de notes). Sans clé, l'application fonctionne normalement mais sans les fonctionnalités IA.
                 </p>
                 
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <p className="text-sm text-blue-700 mb-2"><strong>Comment obtenir une clé API:</strong></p>
                   <ol className="text-sm text-blue-600 list-decimal list-inside space-y-1">
                     <li>Allez sur <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a></li>
                     <li>Connectez-vous avec votre compte Google</li>
                     <li>Cliquez sur "Create API Key"</li>
                     <li>Copiez la clé générée et collez-la ici</li>
                   </ol>
                 </div>

                 <div className="space-y-2">
                   <label className="block text-sm font-medium text-gray-700">Clé API</label>
                   <input 
                     type="password" 
                     value={apiKey}
                     onChange={(e) => setApiKey(e.target.value)}
                     placeholder="AIza..."
                     className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                   />
                 </div>

                 <button 
                   onClick={handleSaveApiKey}
                   className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                 >
                   <Save size={20} />
                   Sauvegarder la clé
                 </button>

                 {apiKeySaved && (
                   <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                     <span className="text-green-600">✓ Clé API enregistrée avec succès!</span>
                   </div>
                 )}

                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                   <p className="text-sm text-yellow-700"><strong>Note:</strong> La clé est stockée localement sur votre navigateur.</p>
                 </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
