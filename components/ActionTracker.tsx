import React, { useState } from 'react';
import { ActionItem, ActionStatus, Team, User } from '../types';
import { LayoutGrid, Kanban, List, Image as ImageIcon, CheckCircle2, ChevronRight, X, Save, Camera, Layers, Filter, Plus, Trash2 } from 'lucide-react';
import ActionModal from './ActionModal';

interface ActionTrackerProps {
  actions: ActionItem[];
  departments: string[];
  teams: Team[];
  onUpdateStatus: (id: string, status: ActionStatus) => void;
  onUpdateAction: (action: ActionItem) => void;
  onCreateAction?: (action: ActionItem) => void;
  onDeleteAction?: (id: string) => void;
}

// View Modes
type ViewMode = 'GALLERY' | 'KANBAN' | 'LIST';
type GroupMode = 'STATUS' | 'DEPARTMENT';

const ActionTracker: React.FC<ActionTrackerProps> = ({ 
  actions, 
  departments, 
  teams,
  onUpdateStatus, 
  onUpdateAction,
  onCreateAction,
  onDeleteAction
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('GALLERY');
  const [groupMode, setGroupMode] = useState<GroupMode>('STATUS');
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Get all users from teams
  const getAllUsers = (): User[] => {
    const userMap = new Map<string, User>();
    teams.forEach(team => {
      team.members.forEach(member => {
        if (!userMap.has(member.id)) {
          userMap.set(member.id, member);
        }
      });
    });
    return Array.from(userMap.values());
  };

  const allUsers = getAllUsers();

  // Helper: Get User
  const getUser = (id: string) => allUsers.find(u => u.id === id);

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

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedAction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (action: ActionItem) => {
    setModalMode('edit');
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const handleSaveAction = (action: ActionItem) => {
    if (modalMode === 'create') {
      if (onCreateAction) {
        onCreateAction(action);
      } else {
        onUpdateAction(action);
      }
    } else {
      onUpdateAction(action);
    }
  };

  const handleDeleteAction = (id: string) => {
    if (onDeleteAction) {
      onDeleteAction(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div className="flex items-center gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                 <ImageIcon className="text-blue-600" /> 
                 Management Visuel
               </h1>
               <p className="text-gray-500 text-sm">Suivi des actions et anomalies photos</p>
            </div>
            
            {/* Create Action Button */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Nouvelle Action
            </button>
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
                <div className="relative h-48 bg-gray-100 w-full flex-shrink-0 cursor-pointer" onClick={() => handleOpenEditModal(action)}>
                   {action.proofImage ? (
                     <img src={action.proofImage} alt="Preuve" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : action.attachments && action.attachments.length > 0 && action.attachments[0].type === 'image' ? (
                     <img src={action.attachments[0].url} alt="Preuve" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                      {action.status === 'OPEN' ? 'Ouvert' : action.status === 'IN_PROGRESS' ? 'En cours' : action.status === 'VERIFIED' ? 'Vérifié' : 'Fermé'}
                   </div>
                   
                   {/* Overdue indicator */}
                   {action.status !== ActionStatus.CLOSED && isOverdue(action.dueDate) && (
                     <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-bold shadow-sm bg-red-500 text-white">
                        En retard
                     </div>
                   )}
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{action.area}</span>
                      <span className="text-xs text-gray-400 font-mono">{formatDate(action.createdAt)}</span>
                   </div>
                   <h3 onClick={() => handleOpenEditModal(action)} className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors">{action.description}</h3>
                   
                   {/* Tags */}
                   {action.tags && action.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mb-3">
                        {action.tags.slice(0, 3).map(tag => (
                           <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">{tag}</span>
                        ))}
                        {action.tags.length > 3 && (
                           <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{action.tags.length - 3}</span>
                        )}
                     </div>
                   )}
                   
                   {/* Due date */}
                   <div className="text-xs text-gray-500 mb-3">
                      Échéance: <span className={isOverdue(action.dueDate) && action.status !== ActionStatus.CLOSED ? 'text-red-500 font-bold' : ''}>{formatDate(action.dueDate)}</span>
                   </div>
                   
                   <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         {getUser(action.assigneeId) ? (
                           <>
                             <img src={getUser(action.assigneeId)?.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="Assignee" />
                             <div className="text-xs">
                                <div className="text-gray-500">Resp.</div>
                                <div className="font-bold text-gray-700">{getUser(action.assigneeId)?.name.split(' ')[0]}</div>
                             </div>
                           </>
                         ) : (
                           <div className="text-xs text-gray-400">Non assigné</div>
                         )}
                      </div>
                      
                      {/* Action Buttons */}
                      {action.status !== ActionStatus.CLOSED ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => onUpdateStatus(action.id, getNextStatus(action.status))}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                          >
                            Avancer
                          </button>
                        </div>
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
                    {groupKey === 'OPEN' ? 'Ouvert' : groupKey === 'IN_PROGRESS' ? 'En cours' : groupKey === 'VERIFIED' ? 'Vérifié' : groupKey === 'CLOSED' ? 'Fermé' : groupKey}
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
                         onClick={() => handleOpenEditModal(action)}
                       >
                          {(action.proofImage || (action.attachments && action.attachments.length > 0)) && (
                            <div className="h-32 mb-3 rounded-lg overflow-hidden relative">
                               <img src={action.proofImage || (action.attachments?.[0]?.url)} className="w-full h-full object-cover" />
                               {action.priority === 'HIGH' && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>}
                            </div>
                          )}
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-xs text-gray-400">{action.area}</span>
                             {groupMode === 'STATUS' && <span className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">{action.department}</span>}
                             {groupMode === 'DEPARTMENT' && <span className={`text-[10px] px-1 rounded ${getStatusColor(action.status).split(' ')[0]}`}>{action.status === 'OPEN' ? 'Ouvert' : action.status === 'IN_PROGRESS' ? 'En cours' : action.status === 'VERIFIED' ? 'Vérifié' : 'Fermé'}</span>}
                          </div>
                          <p className="font-semibold text-gray-800 text-sm mb-3 line-clamp-2">{action.description}</p>
                          <div className="flex items-center justify-between">
                             {getUser(action.assigneeId) ? (
                               <img src={getUser(action.assigneeId)?.avatar} className="w-6 h-6 rounded-full" title={getUser(action.assigneeId)?.name} />
                             ) : (
                               <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                             )}
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

       {/* VIEW: LIST */}
       {viewMode === 'LIST' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600">Photo</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Description</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Service</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Responsable</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Échéance</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Priorité</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">État</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {actions.map(action => (
                     <tr key={action.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 cursor-pointer" onClick={() => handleOpenEditModal(action)}>
                           {action.proofImage ? (
                             <img src={action.proofImage} className="w-12 h-12 rounded-lg object-cover border border-gray-200" alt="Preuve" />
                           ) : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>}
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-800 cursor-pointer max-w-xs" onClick={() => handleOpenEditModal(action)}>
                          <span className="line-clamp-2">{action.description}</span>
                        </td>
                        <td className="px-6 py-3 text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{action.department}</span>
                        </td>
                        <td className="px-6 py-3">
                          {getUser(action.assigneeId) ? (
                            <div className="flex items-center gap-2">
                              <img src={getUser(action.assigneeId)?.avatar} className="w-6 h-6 rounded-full" alt={getUser(action.assigneeId)?.name} />
                              <span className="text-sm">{getUser(action.assigneeId)?.name}</span>
                            </div>
                          ) : <span className="text-gray-400 text-sm">-</span>}
                        </td>
                        <td className="px-6 py-3">
                          <span className={isOverdue(action.dueDate) && action.status !== ActionStatus.CLOSED ? 'text-red-500 font-bold' : 'text-gray-600'}>
                            {formatDate(action.dueDate)}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${
                             action.priority === 'HIGH' ? 'bg-red-100 text-red-700' : action.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                           }`}>
                             {action.priority === 'HIGH' ? 'Haute' : action.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                           </span>
                        </td>
                        <td className="px-6 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(action.status)}`}>
                             {action.status === 'OPEN' ? 'Ouvert' : action.status === 'IN_PROGRESS' ? 'En cours' : action.status === 'VERIFIED' ? 'Vérifié' : 'Fermé'}
                           </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            {action.status !== ActionStatus.CLOSED && (
                               <button onClick={() => onUpdateStatus(action.id, getNextStatus(action.status))} className="text-blue-600 font-bold hover:underline text-sm">
                                 Avancer
                               </button>
                            )}
                            <button onClick={() => handleOpenEditModal(action)} className="text-gray-600 hover:text-gray-900 text-sm">
                              Éditer
                            </button>
                          </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
         </div>
       )}

       {/* Action Modal */}
       <ActionModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSaveAction}
         onDelete={modalMode === 'edit' ? handleDeleteAction : undefined}
         action={modalMode === 'edit' ? selectedAction : null}
         users={allUsers}
         mode={modalMode}
       />
    </div>
  );
};

// View Toggle Component
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

// Helper function to get next status
const getNextStatus = (current: ActionStatus): ActionStatus => {
  if (current === ActionStatus.OPEN) return ActionStatus.IN_PROGRESS;
  if (current === ActionStatus.IN_PROGRESS) return ActionStatus.VERIFIED;
  if (current === ActionStatus.VERIFIED) return ActionStatus.CLOSED;
  return ActionStatus.CLOSED;
};

export default ActionTracker;
