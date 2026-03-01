import React, { useState } from 'react';
import { ActionItem, ActionStatus, DataPackage, MeetingType } from '../types';
import { Cloud, CloudOff, RefreshCw, Database, Download, AlertTriangle, Archive, Upload, Mail, Filter } from 'lucide-react';

interface PackageManagerProps {
  packages: DataPackage[];
  actions: ActionItem[];
  defaultEmail: string;
}

const PackageManager: React.FC<PackageManagerProps> = ({ packages, actions, defaultEmail }) => {
  const [selectedZone, setSelectedZone] = useState('ALL');
  
  const uniqueZones = Array.from(new Set(actions.map(a => a.area)));

  const getStatusIcon = (status: DataPackage['syncStatus']) => {
    switch(status) {
        case 'SYNCED': return <Cloud size={14} className="text-green-500" />;
        case 'PENDING': return <CloudOff size={14} className="text-orange-500" />;
        case 'ERROR': return <AlertTriangle size={14} className="text-red-500" />;
    }
  };

  const getStatusLabel = (status: DataPackage['syncStatus']) => {
      switch(status) {
        case 'SYNCED': return 'Synchronisé';
        case 'PENDING': return 'En attente';
        case 'ERROR': return 'Erreur';
      }
  };

  const handleExportMail = () => {
    const filteredActions = actions.filter(a => 
        a.status !== ActionStatus.CLOSED && (selectedZone === 'ALL' || a.area === selectedZone)
    );

    const subject = encodeURIComponent(`[VISI-LINE] Rapport Actions - ${selectedZone}`);
    const body = encodeURIComponent(
        `Bonjour,\n\nVoici la liste des actions ouvertes pour ${selectedZone === 'ALL' ? 'tout le site' : selectedZone} :\n\n` +
        filteredActions.map(a => `- [${a.priority}] ${a.description} (Resp: ${a.assigneeId}) - Échéance: ${new Date(a.dueDate).toLocaleDateString()}`).join('\n') +
        `\n\nCordialement,\nVISI-LINE App`
    );

    window.open(`mailto:${defaultEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-end">
         <div>
             <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Database className="text-blue-600" />
                Data Center
             </h1>
             <p className="text-sm font-medium text-gray-500">Archives, Imports & Rapports</p>
         </div>
         <div className="flex gap-2">
             <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center gap-2">
                 <Upload size={14} /> Importer ZIP
             </button>
             <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-900 flex items-center gap-2">
                 <Archive size={14} /> Backup Complet
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-20">
          
          {/* LEFT: PACKAGES LIST */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-gray-700">Historique des Réunions (Packages)</h3>
                 <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                     <RefreshCw size={12} /> Sync Tout
                 </button>
             </div>
             <div className="overflow-auto flex-1">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-white border-b border-gray-200 sticky top-0">
                         <tr>
                             <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                             <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                             <th className="px-4 py-3 font-semibold text-gray-600">Info</th>
                             <th className="px-4 py-3 font-semibold text-gray-600">État</th>
                             <th className="px-4 py-3 font-semibold text-gray-600">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {packages.map(pkg => (
                             <tr key={pkg.id} className="hover:bg-gray-50">
                                 <td className="px-4 py-3">
                                     <div className="flex flex-col">
                                         <span className="font-semibold text-gray-800">
                                            {new Date(pkg.generatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit'})}
                                         </span>
                                         <span className="text-[10px] text-gray-400 font-mono">{new Date(pkg.generatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                     </div>
                                 </td>
                                 <td className="px-4 py-3">
                                     <span className={`px-2 py-1 rounded text-[10px] font-bold ${pkg.meetingType === MeetingType.DAILY_5 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                         {pkg.meetingType === MeetingType.DAILY_5 ? '5 MIN' : '15 MIN'}
                                     </span>
                                 </td>
                                 <td className="px-4 py-3">
                                     <div className="flex flex-col max-w-[150px]">
                                         <span className="truncate font-medium text-gray-700">{pkg.summary}</span>
                                         <span className="text-[10px] text-gray-500">{pkg.sizeKb} KB</span>
                                     </div>
                                 </td>
                                 <td className="px-4 py-3">
                                     <div className="flex items-center gap-2">
                                         {getStatusIcon(pkg.syncStatus)}
                                         <span className={`text-xs font-medium ${pkg.syncStatus === 'SYNCED' ? 'text-green-600' : 'text-orange-600'}`}>
                                             {getStatusLabel(pkg.syncStatus)}
                                         </span>
                                     </div>
                                 </td>
                                 <td className="px-4 py-3">
                                     <button className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600" title="Télécharger">
                                         <Download size={16} />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>

          {/* RIGHT: REPORTING CENTER */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
             <div className="flex items-center gap-2 mb-6 text-gray-800">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Mail size={24} />
                </div>
                <div>
                    <h3 className="font-bold">Extraction Actions</h3>
                    <p className="text-xs text-gray-500">Envoyer rapport par département</p>
                </div>
             </div>

             <div className="space-y-4 flex-1">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Filter size={14} /> Filtrer par Zone
                    </label>
                    <select 
                        value={selectedZone} 
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                    >
                        <option value="ALL">Toutes les zones (Site complet)</option>
                        {uniqueZones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800">
                    <strong>{actions.filter(a => a.status !== ActionStatus.CLOSED && (selectedZone === 'ALL' || a.area === selectedZone)).length}</strong> actions en cours à extraire.
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                    <button 
                        onClick={handleExportMail}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Mail size={18} />
                        Générer et Envoyer
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        Ouvrira votre client mail par défaut avec la liste formatée.
                    </p>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default PackageManager;