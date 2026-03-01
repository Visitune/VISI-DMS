import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, Camera, Paperclip, MessageSquare, Calendar, 
  User, Tag, MapPin, Layers, Flag, Clock, Trash2, 
  Plus, Check, Image as ImageIcon, FileText
} from 'lucide-react';
import { ActionItem, ActionStatus, User as UserType, Attachment, Comment } from '../types';
import { CATEGORIES, TAGS, ZONES, DEPARTMENTS } from '../constants';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: ActionItem) => void;
  onDelete?: (id: string) => void;
  action?: ActionItem | null;
  users: UserType[];
  defaultAssigneeId?: string;
  defaultMeetingId?: string;
  mode?: 'create' | 'edit';
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  action,
  users,
  defaultAssigneeId = '',
  defaultMeetingId = '',
  mode = 'create'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<ActionItem>>({
    description: '',
    assigneeId: defaultAssigneeId,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'MEDIUM',
    area: '',
    department: 'Production',
    category: '',
    location: '',
    tags: [],
    attachments: [],
    comments: [],
    status: ActionStatus.OPEN
  });
  
  const [newTag, setNewTag] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with action data when editing
  useEffect(() => {
    if (action && isOpen) {
      setFormData({
        ...action,
        dueDate: action.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    } else if (isOpen) {
      setFormData({
        description: '',
        assigneeId: defaultAssigneeId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        area: '',
        department: 'Production',
        category: '',
        location: '',
        tags: [],
        attachments: [],
        comments: [],
        status: ActionStatus.OPEN,
        meetingId: defaultMeetingId
      });
    }
  }, [action, isOpen, defaultAssigneeId, defaultMeetingId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description?.trim()) {
      newErrors.description = 'La description est requise';
    }
    if (!formData.assigneeId) {
      newErrors.assigneeId = 'Veuillez sélectionner un responsable';
    }
    if (!formData.area?.trim()) {
      newErrors.area = 'Veuillez sélectionner une zone';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Veuillez sélectionner une date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const now = new Date().toISOString();
    const finalAction: ActionItem = {
      id: action?.id || `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: formData.description || '',
      status: formData.status || ActionStatus.OPEN,
      assigneeId: formData.assigneeId || '',
      dueDate: formData.dueDate || now,
      priority: formData.priority || 'MEDIUM',
      createdAt: action?.createdAt || now,
      updatedAt: now,
      meetingId: formData.meetingId || defaultMeetingId,
      area: formData.area || '',
      department: formData.department || 'Production',
      category: formData.category,
      location: formData.location,
      tags: formData.tags || [],
      attachments: formData.attachments || [],
      comments: formData.comments || [],
      proofImage: formData.proofImage,
      completedAt: formData.completedAt,
      verifiedBy: formData.verifiedBy
    };
    
    onSave(finalAction);
    onClose();
  };

  const handleDelete = () => {
    if (action?.id && onDelete) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
        onDelete(action.id);
        onClose();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      const type = file.type.startsWith('image/') ? 'image' : 
                   file.type === 'application/pdf' ? 'pdf' : 'document';
      const reader = new FileReader();
      
      reader.onload = () => {
        newAttachments.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type,
          url: reader.result as string,
          uploadedAt: new Date().toISOString(),
          size: file.size
        });
        processedCount++;
        
        if (processedCount === files.length) {
          setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...newAttachments]
          }));
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== id)
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !(formData.tags || []).includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
    setNewTag('');
    setShowTagDropdown(false);
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'current-user',
      text: newComment,
      createdAt: new Date().toISOString()
    };
    setFormData(prev => ({
      ...prev,
      comments: [...(prev.comments || []), comment]
    }));
    setNewComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {mode === 'create' ? 'Nouvelle Action' : 'Modifier l\'action'}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === 'create' ? 'Créer une nouvelle action' : 'Modifier les détails de l\'action'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Fermer">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez l'action à réaliser..."
              className={`w-full px-4 py-3 rounded-xl border ${errors.description ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none`}
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Responsable *</label>
              <div className="relative">
                <select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.assigneeId ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white`}
                  aria-label="Sélectionner un responsable"
                >
                  <option value="">Sélectionner...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.assigneeId && <p className="text-red-500 text-xs mt-1">{errors.assigneeId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priorité</label>
              <div className="flex gap-2">
                {(['HIGH', 'MEDIUM', 'LOW'] as const).map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority }))}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      formData.priority === priority
                        ? priority === 'HIGH' ? 'bg-red-500 text-white' : priority === 'MEDIUM' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {priority === 'HIGH' ? 'Haute' : priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Zone *</label>
              <div className="relative">
                <select
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.area ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white`}
                  aria-label="Sélectionner une zone"
                >
                  <option value="">Sélectionner...</option>
                  {ZONES.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
                <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Département</label>
              <div className="relative">
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white"
                  aria-label="Sélectionner un département"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <Layers size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'échéance *</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate?.split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: new Date(e.target.value).toISOString() }))}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.dueDate ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none`}
                  aria-label="Sélectionner une date d'échéance"
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white"
                  aria-label="Sélectionner une catégorie"
                >
                  <option value="">Sélectionner...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Flag size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Localisation détaillée</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ex: Machine 3, Allée B, Bureau A2..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.tags || []).map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900" aria-label={`Supprimer le tag ${tag}`}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onFocus={() => setShowTagDropdown(true)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                placeholder="Ajouter un tag..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                aria-label="Ajouter un tag"
              />
              {showTagDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                  {TAGS.filter(t => !(formData.tags || []).includes(t)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pièces jointes</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 text-sm font-medium transition-colors"
            >
              <Camera size={18} />
              Ajouter des fichiers
            </button>
            
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {att.type === 'image' ? (
                        <ImageIcon size={20} className="text-blue-500" />
                      ) : att.type === 'pdf' ? (
                        <FileText size={20} className="text-red-500" />
                      ) : (
                        <Paperclip size={20} className="text-gray-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">{att.name}</p>
                        <p className="text-xs text-gray-400">{(att.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 hover:bg-red-100 rounded-lg text-red-500"
                      aria-label={`Supprimer ${att.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Commentaires</label>
              <div className="space-y-3 mb-3">
                {(formData.comments || []).map(comment => {
                  const commentUser = users.find(u => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-800">{commentUser?.name || 'Utilisateur'}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.text}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComment())}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  aria-label="Ajouter un commentaire"
                />
                <button
                  type="button"
                  onClick={addComment}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
                  aria-label="Envoyer le commentaire"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
              <div className="flex gap-2">
                {Object.values(ActionStatus).map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status }))}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      formData.status === status
                        ? status === ActionStatus.OPEN ? 'bg-red-500 text-white' : 
                          status === ActionStatus.IN_PROGRESS ? 'bg-orange-500 text-white' : 
                          status === ActionStatus.VERIFIED ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'OPEN' ? 'Ouvert' : status === 'IN_PROGRESS' ? 'En cours' : status === 'VERIFIED' ? 'Vérifié' : 'Fermé'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <div>
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Save size={18} />
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
