import React, { useState } from 'react';
import { ActionItem, ActionStatus, User } from '../types';
import { USERS } from '../constants';
import { LayoutGrid, Kanban, List, Image as ImageIcon, CheckCircle2, ChevronRight, X, Save, Camera, Layers, Filter } from 'lucide-react';

interface ActionTrackerProps {
  actions: ActionItem[];
  departments: string[];
  onUpdateStatus: (id: string, status: ActionStatus) => void;
  onUpdateAction?: (action: ActionItem) => void;
}

// View Modes
type ViewMode = 'GALLERY' | 'KANBAN' | 'LIST';
type GroupMode = 'STATUS' | 'DEPARTMENT';

const ActionTracker: React.FC<ActionTrackerProps> = ({ actions, departments, onUpdateStatus, onUpdateAction }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('GALLERY');
  const [groupMode, setGroupMode] = useState<GroupMode>('STATUS');
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);

  // Helper: Get User
  const getUser = (id: string) => USERS.find(u => u.id === id);

  // Helper: Status Colors
  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case ActionStatus.OPEN: return 'bg-red-50 text-red-700 border-red-200';
      case ActionStatus.IN_PROGRESS: return 'bg-amber-50 text-amber-700 border-amber-200';
      case ActionStatus.VERIFIED: return 'bg-blue-50 text-blue-700 border-blue-200';
      case ActionStatus.CLOSED: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const handleDragStart = (e: React.DragEvent, actionId: string) => {
    e.dataTransfer.setData('actionId', actionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: ActionStatus) => {
    e.preventDefault();
    const actionId = e.dataTransfer.getData('actionId');
    if (actionId) {
      onUpdateStatus(actionId, newStatus);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="text-blue-600" /> 
              Management Visuel
            </h1>
            <p className="text-gray-500 text-sm">Suivi des actions et anomalies photos</p>
         </div>

         <div className="flex items-center gap-3 flex-wrap">
             {viewMode === 'KANBAN' && (
                <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm px-2 gap-2 text-sm text-gray-600">
                    <span className="font-medium flex items-center gap-1"><Layers size={14}/> Grouper par :</span>
                    <button 
                        onClick={() => setGroupMode('STATUS')}
                        className={`px-2 py-1 rounded ${groupMode === 'STATUS' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100'}`}
                    >
                        Statut
                    </button>
                    <button 
                        onClick={() => setGroupMode('DEPARTMENT')}
                        className={`px-2 py-1 rounded ${groupMode === 'DEPARTMENT' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100'}`}
                    >
                        Service
                    </button>
                </div>
             )}

             <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                 <ViewToggle icon={<LayoutGrid size={18} />} active={viewMode === 'GALLERY'} onClick={() => setViewMode('GALLERY')} label="Galerie" />
                 <ViewToggle icon={<Kanban size={18} />} active={viewMode === 'KANBAN'} onClick={() => setViewMode('KANBAN')} label="Kanban" />
                 <ViewToggle icon={<List size={18} />} active={viewMode === 'LIST'} onClick={() => setViewMode('LIST')} label="Liste" />
             </div>
         </div>
      </div>

      {/* VIEW: GALLERY (Visual Management Focus) */}
      {viewMode === 'GALLERY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
           {actions.map(action => (
             <div key={action.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
                {/* Photo Area */}
                <div className="relative h-48 bg-gray-100 w-full flex-shrink-0 cursor-pointer" onClick={() => setSelectedAction(action)}>
                   {action.proofImage ? (
                     <img src={action.proofImage} alt="Preuve" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <ImageIcon size={40} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium">Pas de photo</span>
                     </div>
                   )}
                   {/* Priority Badge Overlay */}
                   <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      action.priority === 'HIGH' ? 'bg-red-500 text-white' : action.priority === 'MEDIUM' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                   }`}>
                      {action.priority === 'HIGH' ? 'CRITIQUE' : action.priority}
                   </div>
                   {/* Dept Badge Overlay */}
                   <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm bg-black/60 text-white backdrop-blur-sm">
                      {action.department}
                   </div>
                   {/* Status Badge Overlay */}
                   <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border ${getStatusColor(action.status)} bg-white/90 backdrop-blur-sm`}>
                      {action.status}
                   </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{action.area}</span>
                      <span className="text-xs text-gray-400 font-mono">{new Date(action.createdAt).toLocaleDateString('fr-FR')}</span>
                   </div>
                   <h3 onClick={() => setSelectedAction(action)} className="font-bold text-gray-800 text-lg mb-4 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors">{action.description}</h3>
                   
                   <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <img src={getUser(action.assigneeId)?.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="Assignee" />
                         <div className="text-xs">
                            <div className="text-gray-500">Resp.</div>
                            <div className="font-bold text-gray-700">{getUser(action.assigneeId)?.name.split(' ')[0]}</div>
                         </div>
                      </div>
                      
                      {/* Action Button */}
                      {action.status !== ActionStatus.CLOSED ? (
                        <button 
                          onClick={() => onUpdateStatus(action.id, getNextStatus(action.status))}
                          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                        >
                          Avancer
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16}/> Terminé</span>
                      )}
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* VIEW: KANBAN */}
      {viewMode === 'KANBAN' && (
         <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {(groupMode === 'STATUS' ? Object.values(ActionStatus) : departments).map(groupKey => (
              <div 
                key={groupKey} 
                className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-gray-50/50 border border-gray-200/60"
                onDragOver={groupMode === 'STATUS' ? handleDragOver : undefined}
                onDrop={groupMode === 'STATUS' ? (e) => handleDrop(e, groupKey as ActionStatus) : undefined}
              >
                 <div className={`p-4 font-bold border-b border-gray-200 flex justify-between items-center ${
                   groupMode === 'STATUS' ? (
                       groupKey === ActionStatus.OPEN ? 'text-red-600' : 
                       groupKey === ActionStatus.IN_PROGRESS ? 'text-amber-600' :
                       groupKey === ActionStatus.VERIFIED ? 'text-blue-600' : 'text-emerald-600'
                   ) : 'text-gray-700'
                 }`}>
                    {groupKey}
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-gray-600">
                      {actions.filter(a => groupMode === 'STATUS' ? a.status === groupKey : a.department === groupKey).length}
                    </span>
                 </div>
                 <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {actions
                        .filter(a => groupMode === 'STATUS' ? a.status === groupKey : a.department === groupKey)
                        .map(action => (
                       <div 
                         key={action.id} 
                         draggable
                         onDragStart={(e) => handleDragStart(e, action.id)}
                         className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group" 
                         onClick={() => setSelectedAction(action)}
                       >
                          {action.proofImage && (
                            <div className="h-32 mb-3 rounded-lg overflow-hidden relative">
                               <img src={action.proofImage} className="w-full h-full object-cover" />
                               {action.priority === 'HIGH' && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>}
                            </div>
                          )}
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-xs text-gray-400">{action.area}</span>
                             {groupMode === 'STATUS' && <span className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">{action.department}</span>}
                             {groupMode === 'DEPARTMENT' && <span className={`text-[10px] px-1 rounded ${getStatusColor(action.status).split(' ')[0]}`}>{action.status}</span>}
                          </div>
                          <p className="font-semibold text-gray-800 text-sm mb-3">{action.description}</p>
                          <div className="flex items-center justify-between">
                             <img src={getUser(action.assigneeId)?.avatar} className="w-6 h-6 rounded-full" />
                             {action.status !== ActionStatus.CLOSED && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); onUpdateStatus(action.id, getNextStatus(action.status)); }}
                                 className="p-1 hover:bg-gray-100 rounded text-gray-500"
                               >
                                 <ChevronRight size={16} />
                               </button>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>
      )}

       {/* VIEW: LIST (Legacy Table but cleaner) */}
       {viewMode === 'LIST' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600">Photo</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Description</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Service</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Priorité</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">État</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {actions.map(action => (
                     <tr key={action.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 cursor-pointer" onClick={() => setSelectedAction(action)}>
                           {action.proofImage ? (
                             <img src={action.proofImage} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                           ) : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>}
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-800 cursor-pointer" onClick={() => setSelectedAction(action)}>{action.description}</td>
                        <td className="px-6 py-3 text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{action.department}</span>
                        </td>
                        <td className="px-6 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${
                             action.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                           }`}>
                             {action.priority}
                           </span>
                        </td>
                        <td className="px-6 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(action.status)}`}>
                             {action.status}
                           </span>
                        </td>
                        <td className="px-6 py-3">
                          {action.status !== ActionStatus.CLOSED && (
                             <button onClick={() => onUpdateStatus(action.id, getNextStatus(action.status))} className="text-blue-600 font-bold hover:underline">
                               Avancer
                             </button>
                          )}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
         </div>
       )}

       {/* EDIT MODAL */}
       {selectedAction && (
          <ActionEditModal 
             action={selectedAction} 
             departments={departments}
             onClose={() => setSelectedAction(null)} 
             onSave={(updated) => {
               if(onUpdateAction) onUpdateAction(updated);
               setSelectedAction(null);
             }}
          />
       )}
    </div>
  );
};

// Simple internal modal for editing
const ActionEditModal: React.FC<{
    action: ActionItem, 
    departments: string[],
    onClose: () => void, 
    onSave: (a: ActionItem) => void
}> = ({ action, departments, onClose, onSave }) => {
  const [editedAction, setEditedAction] = useState<ActionItem>(action);

  const handleSave = () => {
    onSave(editedAction);
  };

  const handlePhotoUpload = () => {
      // Simulate new photo
      setEditedAction({...editedAction, proofImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600'});
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
             <h3 className="font-bold text-gray-800">Éditer Action</h3>
             <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X size={20}/></button>
          </div>
          
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
             {/* Description */}
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description du problème</label>
                <textarea 
                  value={editedAction.description}
                  onChange={(e) => setEditedAction({...editedAction, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Priorité</label>
                   <select 
                     value={editedAction.priority}
                     onChange={(e) => setEditedAction({...editedAction, priority: e.target.value as any})}
                     className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                   >
                      <option value="LOW">Basse</option>
                      <option value="MEDIUM">Moyenne</option>
                      <option value="HIGH">Haute (Critique)</option>
                   </select>
                </div>

                {/* Status */}
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">État</label>
                   <select 
                     value={editedAction.status}
                     onChange={(e) => setEditedAction({...editedAction, status: e.target.value as ActionStatus})}
                     className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                   >
                      {Object.values(ActionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
             </div>

             {/* Dept / Zone */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Département / Service</label>
                    <select 
                        value={editedAction.department}
                        onChange={(e) => setEditedAction({...editedAction, department: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Zone Géographique</label>
                    <input 
                        type="text" 
                        value={editedAction.area}
                        onChange={(e) => setEditedAction({...editedAction, area: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                 </div>
             </div>

             {/* Assignee */}
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Responsable (Pilote)</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-100 p-2 rounded-lg">
                   {USERS.map(u => (
                      <div 
                        key={u.id}
                        onClick={() => setEditedAction({...editedAction, assigneeId: u.id})}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          editedAction.assigneeId === u.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                         <img src={u.avatar} className="w-6 h-6 rounded-full" />
                         <span className="text-sm font-medium truncate">{u.name}</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Image */}
             <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Photo / Preuve</label>
                 <div className="flex gap-4 items-start">
                     {editedAction.proofImage ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                            <img src={editedAction.proofImage} className="w-full h-full object-cover" />
                            <button onClick={handlePhotoUpload} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-xs transition-opacity">
                                Changer
                            </button>
                        </div>
                     ) : (
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon size={24} />
                            <span className="text-xs mt-1">Aucune</span>
                        </div>
                     )}
                     <button onClick={handlePhotoUpload} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2">
                         <Camera size={16} />
                         {editedAction.proofImage ? 'Remplacer Photo' : 'Ajouter Photo'}
                     </button>
                 </div>
             </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Annuler</button>
             <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
               <Save size={18} /> Enregistrer
             </button>
          </div>
       </div>
    </div>
  );
};

const ViewToggle: React.FC<{icon: React.ReactNode, active: boolean, onClick: () => void, label: string}> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
      active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
  </button>
);

const getNextStatus = (current: ActionStatus): ActionStatus => {
  if (current === ActionStatus.OPEN) return ActionStatus.IN_PROGRESS;
  if (current === ActionStatus.IN_PROGRESS) return ActionStatus.VERIFIED;
  if (current === ActionStatus.VERIFIED) return ActionStatus.CLOSED;
  return ActionStatus.CLOSED;
};

export default ActionTracker;
