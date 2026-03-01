import React, { useState, useEffect, useRef } from 'react';
import { Meeting, MeetingSection, User, ActionItem, ActionStatus, AppSettings } from '../types';
import { USERS } from '../constants';
import { Play, Pause, Square, AlertTriangle, Mic, CheckCircle2, User as UserIcon, Plus, ChevronRight, Camera, X, Eraser } from 'lucide-react';
import { refineMeetingNote } from '../services/geminiService';

// --- Signature Canvas Component ---
const SignatureCanvas: React.FC<{ onSave: (data: string) => void }> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      onSave('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-48 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <button 
          onClick={clear}
          className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
        >
          <Eraser size={18} />
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 uppercase font-bold tracking-widest">Signez ci-dessus pour valider le rituel</p>
    </div>
  );
};

interface MeetingRunnerProps {
  meeting: Meeting;
  teamMembers: User[];
  themes: string[]; // Added themes prop
  departments: string[]; // Added departments
  settings: AppSettings;
  onComplete: (meeting: Meeting, actions: ActionItem[]) => void;
  onCancel: () => void;
}

const MeetingRunner: React.FC<MeetingRunnerProps> = ({ meeting, teamMembers, themes, departments, settings, onComplete, onCancel }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sectionSeconds, setSectionSeconds] = useState(0); // Timer per section
  const [isRunning, setIsRunning] = useState(true);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting>(meeting);
  const [attendees, setAttendees] = useState<Set<string>>(new Set());
  
  // Pick a random theme from the passed props
  const [hhseTheme] = useState(themes.length > 0 ? themes[Math.floor(Math.random() * themes.length)] : "Sécurité Générale");
  
  const [newActions, setNewActions] = useState<ActionItem[]>([]);
  
  // Note inputs
  const [noteInput, setNoteInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // Action creation inputs
  const [selectedAssignee, setSelectedAssignee] = useState<string>(teamMembers[0]?.id || '');
  const [selectedDueDays, setSelectedDueDays] = useState<number>(2);
  const [selectedArea, setSelectedArea] = useState<string>('Zone Production');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [signature, setSignature] = useState<string>('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sections = [...Object.values(MeetingSection), "Signature"];

  // Real Voice Dictation Logic
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNoteInput(prev => (prev ? prev + " " : "") + transcript);
    };

    recognition.start();
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        setSectionSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Reset section timer when section changes
  useEffect(() => {
    setSectionSeconds(0);
  }, [currentSectionIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleAttendee = (userId: string) => {
    const newAttendees = new Set(attendees);
    if (newAttendees.has(userId)) newAttendees.delete(userId);
    else newAttendees.add(userId);
    setAttendees(newAttendees);
    setCurrentMeeting({ ...currentMeeting, attendees: Array.from(newAttendees) });
  };

  const handleTakePhoto = () => {
    // Create hidden file input for real photo upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera on mobile
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Convert to base64 for local storage
        const reader = new FileReader();
        reader.onload = (event) => {
          setTempPhoto(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleSaveNote = async () => {
    if (!noteInput.trim() || currentSectionIndex >= currentMeeting.notes.length) return;
    
    // Quick refine check
    let textToSave = noteInput;
    
    const updatedNotes = [...currentMeeting.notes];
    updatedNotes[currentSectionIndex].text = textToSave;
    setCurrentMeeting({ ...currentMeeting, notes: updatedNotes });
    setNoteInput('');
  };

  const handleRefineWithAI = async () => {
    if (!noteInput.trim()) return;
    setIsRefining(true);
    const refined = await refineMeetingNote(noteInput, sections[currentSectionIndex]);
    setNoteInput(refined);
    setIsRefining(false);
  };

  // Helper to map section to department
  const getDepartmentForSection = (section: MeetingSection): string => {
      if (section === MeetingSection.SAFETY) return "HSE / Sécurité";
      if (section === MeetingSection.QUALITY) return "Qualité";
      if (section === MeetingSection.COST || section === MeetingSection.DELIVERY) return "Production";
      if (section === MeetingSection.PEOPLE) return "RH";
      return "Maintenance"; // Default fallback
  };

  const handleAddAction = () => {
    if (currentSectionIndex >= currentMeeting.notes.length) return;
    const currentSection = sections[currentSectionIndex] as MeetingSection;
    const dept = getDepartmentForSection(currentSection);

    const action: ActionItem = {
      id: `new-${Date.now()}`,
      description: noteInput || `Action suite à point ${currentSection}`,
      status: ActionStatus.OPEN,
      assigneeId: selectedAssignee || teamMembers[0]?.id || USERS[0].id,
      dueDate: new Date(Date.now() + 86400000 * selectedDueDays).toISOString(),
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      meetingId: meeting.id,
      area: selectedArea,
      department: departments.includes(dept) ? dept : departments[0],
      proofImage: tempPhoto || undefined
    };
    setNewActions([...newActions, action]);
    // Also mark issue in notes
    const updatedNotes = [...currentMeeting.notes];
    updatedNotes[currentSectionIndex].hasIssue = true;
    setCurrentMeeting({ ...currentMeeting, notes: updatedNotes });
    
    // Clear input
    setNoteInput('');
    setTempPhoto(null);
  };

  const finishMeeting = () => {
    onComplete({ ...currentMeeting, durationSeconds: elapsedSeconds, completed: true, signature }, newActions);
  };

  const currentSection = sections[currentSectionIndex];
  const isSignatureStep = currentSection === "Signature";
  const isOverTime = elapsedSeconds > 300; // 5 mins

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 overflow-hidden">
      
      {/* MOBILE TOP BAR (Timer & Controls) */}
      <div className={`md:hidden p-4 border-b border-slate-700 text-white flex justify-between items-center ${isOverTime ? 'bg-red-900' : 'bg-slate-900'}`}>
         <div className="font-mono text-2xl font-bold">{formatTime(elapsedSeconds)}</div>
         <div className="flex gap-2">
            <button onClick={() => setIsRunning(!isRunning)} className="bg-white/10 p-2 rounded-lg">
               {isRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={onCancel} className="bg-red-500/20 text-red-200 p-2 rounded-lg">
               <Square size={20} />
            </button>
         </div>
      </div>

      {/* LEFT PANEL: AGENDA & TIMER (Desktop) */}
      <div className="hidden md:flex w-80 bg-slate-900 text-white flex-col shadow-2xl z-10">
         <div className={`p-6 border-b border-slate-700 ${isOverTime ? 'bg-red-900' : 'bg-slate-800'}`}>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Temps Écoulé</div>
            <div className="font-mono text-5xl font-bold">{formatTime(elapsedSeconds)}</div>
            <div className="mt-4 flex gap-2">
               <button onClick={() => setIsRunning(!isRunning)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg flex items-center justify-center">
                 {isRunning ? <Pause size={20} /> : <Play size={20} />}
               </button>
               <button onClick={onCancel} className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 py-2 rounded-lg flex items-center justify-center">
                 <Square size={20} />
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {sections.map((s, idx) => (
               <button 
                  key={s}
                  onClick={() => setCurrentSectionIndex(idx)}
                  className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all ${
                    idx === currentSectionIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 
                    (idx < sections.length - 1 && currentMeeting.notes[idx].text) || (idx === sections.length - 1 && signature) ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
                  }`}
               >
                  <span className="font-medium">{s}</span>
                  {idx < sections.length - 1 && currentMeeting.notes[idx].hasIssue && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                  {idx === currentSectionIndex && <ChevronRight size={16} />}
               </button>
            ))}
         </div>

         <div className="p-4 bg-slate-950 border-t border-slate-800">
             <div className="text-xs text-slate-500 uppercase font-bold mb-2">Actions Créées ({newActions.length})</div>
             <div className="space-y-2 max-h-32 overflow-y-auto">
                {newActions.map((action, i) => (
                    <div key={action.id} className="text-xs bg-slate-800 p-2 rounded flex items-center gap-2">
                        <AlertTriangle size={12} className="text-orange-400 flex-shrink-0" />
                        <span className="truncate">{action.description}</span>
                    </div>
                ))}
                {newActions.length === 0 && <div className="text-slate-600 text-xs italic">Aucune action créée</div>}
             </div>
         </div>
      </div>

      {/* RIGHT PANEL: CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-100">
         
         <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* ATTENDANCE PANEL (Always visible/editable at top or specific step) */}
                {currentSectionIndex === 0 && (
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                        <UserIcon className="text-blue-500" /> 
                        Feuille de Présence
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {teamMembers.map(u => (
                          <button
                              key={u.id}
                              onClick={() => toggleAttendee(u.id)}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${attendees.has(u.id) ? 'bg-green-50 border-green-500 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50'}`}
                          >
                            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className="text-left overflow-hidden">
                               <div className="font-bold text-sm truncate text-gray-800">{u.name.split(' ')[0]}</div>
                               <div className="text-[10px] text-gray-500 uppercase">{attendees.has(u.id) ? 'Présent' : 'Absent'}</div>
                            </div>
                            {attendees.has(u.id) && <CheckCircle2 size={16} className="text-green-500 ml-auto" />}
                          </button>
                        ))}
                      </div>
                   </div>
                )}

                {/* THEME OF THE DAY */}
                {currentSection === MeetingSection.SAFETY && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl shadow-sm">
                     <div className="text-orange-800 font-bold uppercase tracking-wider text-xs mb-1">Thème HHSE du jour</div>
                     <div className="text-2xl font-bold text-gray-900">{hhseTheme}</div>
                  </div>
                )}

                {/* MAIN INPUT CARD */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                           <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{currentSection}</h2>
                           <p className="text-sm md:text-base text-gray-500">Saisissez les observations ou incidents pour cette section.</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shrink-0">
                           {currentSectionIndex + 1}
                        </div>
                    </div>

                    <div className="flex-1 p-4 md:p-6 flex flex-col gap-4">
                       
                       {isSignatureStep ? (
                         <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full space-y-8">
                            <div className="text-center">
                               <h3 className="text-xl font-bold text-gray-800 mb-2">Validation Finale</h3>
                               <p className="text-gray-500">Le rituel est terminé. Veuillez signer pour confirmer la tenue de la réunion et l'exactitude des informations saisies.</p>
                            </div>
                            <SignatureCanvas onSave={setSignature} />
                            {signature && (
                               <div className="flex items-center justify-center gap-2 text-green-600 font-bold animate-in fade-in slide-in-from-bottom-2">
                                  <CheckCircle2 size={20} /> Signature enregistrée
                               </div>
                            )}
                         </div>
                       ) : (
                         <>
                           {/* Existing Note */}
                           {currentMeeting.notes[currentSectionIndex].text && (
                             <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 mb-2">
                                <span className="font-bold mr-2">Note enregistrée:</span>
                                {currentMeeting.notes[currentSectionIndex].text}
                             </div>
                           )}

                           {/* Section Timer Display */}
                           {settings.enableSectionTimer && (
                              <div className="mb-4 flex items-center gap-2">
                                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                       className={`h-full transition-all duration-1000 ${sectionSeconds > 60 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                       style={{ width: `${Math.min((sectionSeconds / 60) * 100, 100)}%` }}
                                    ></div>
                                 </div>
                                 <span className={`text-xs font-mono font-bold ${sectionSeconds > 60 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                                    {formatTime(sectionSeconds)} / 1:00
                                 </span>
                              </div>
                           )}

                           <textarea 
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Dictez ou écrivez votre observation..."
                              className="flex-1 w-full p-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 resize-none bg-gray-50 focus:bg-white transition-colors"
                           />
                           
                           {/* Temporary Photo Preview */}
                           {tempPhoto && (
                              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                 <img src={tempPhoto} className="w-full h-full object-cover" />
                                 <button onClick={() => setTempPhoto(null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                    <X size={12} />
                                 </button>
                              </div>
                           )}

                           <div className="flex items-center gap-3 flex-wrap">
                              {/* Voice Dictation Button */}
                              {settings.enableVoiceInput && (
                                 <button 
                                   onClick={startListening}
                                   className={`px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all border ${isListening ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'}`}
                                 >
                                    <Mic /> {isListening ? 'Écoute...' : 'Dictée'}
                                 </button>
                              )}

                              <button 
                                onClick={handleRefineWithAI}
                                disabled={!noteInput || isRefining}
                                className="px-6 py-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                              >
                                 {isRefining ? '...' : <><Mic size={16} /> Reformuler (IA)</>}
                              </button>

                              <button 
                                onClick={handleTakePhoto}
                                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                              >
                                 <Camera /> Photo
                              </button>
                              
                              <div className="flex-1"></div>

                              {/* Action Settings */}
                              <div className="flex items-center gap-2 mr-2">
                                <select 
                                  value={selectedAssignee}
                                  onChange={(e) => setSelectedAssignee(e.target.value)}
                                  className="p-2 text-sm border border-gray-200 rounded-lg"
                                  title="Responsable"
                                >
                                  {teamMembers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                                  {teamMembers.length === 0 && USERS.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                  ))}
                                </select>
                                <select 
                                  value={selectedDueDays}
                                  onChange={(e) => setSelectedDueDays(Number(e.target.value))}
                                  className="p-2 text-sm border border-gray-200 rounded-lg"
                                  title="Échéance"
                                >
                                  <option value={1}>J+1</option>
                                  <option value={2}>J+2</option>
                                  <option value={3}>J+3</option>
                                  <option value={7}>J+7</option>
                                </select>
                                <select 
                                  value={selectedArea}
                                  onChange={(e) => setSelectedArea(e.target.value)}
                                  className="p-2 text-sm border border-gray-200 rounded-lg"
                                  title="Zone"
                                >
                                  <option value="Zone Production">Zone Production</option>
                                  <option value="Zone Emballage">Zone Emballage</option>
                                  <option value="Zone Expédition">Zone Expédition</option>
                                  <option value="Bureau">Bureau</option>
                                </select>
                              </div>

                              <button 
                                onClick={handleSaveNote}
                                disabled={!noteInput}
                                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 disabled:opacity-50 transition-colors"
                              >
                                Note Simple
                              </button>

                              <button 
                                onClick={handleAddAction}
                                className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 flex items-center gap-2 transition-transform active:scale-95 transform"
                              >
                                <AlertTriangle />
                                Créer Action
                              </button>
                           </div>
                         </>
                       )}
                    </div>
                </div>
            </div>
         </div>

         {/* BOTTOM NAV */}
         <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center px-8">
             <button 
                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex === 0}
                className="px-6 py-3 rounded-lg font-bold text-gray-400 hover:bg-gray-100 disabled:opacity-30"
             >
                Précédent
             </button>

             {currentSectionIndex < sections.length - 1 ? (
                <button 
                  onClick={() => {
                     handleSaveNote();
                     setCurrentSectionIndex(currentSectionIndex + 1);
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
                >
                  Suivant
                </button>
             ) : (
                <button 
                  onClick={finishMeeting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2"
                >
                  <CheckCircle2 /> Terminer Réunion
                </button>
             )}
         </div>
      </div>
    </div>
  );
};

export default MeetingRunner;