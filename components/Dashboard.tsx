import React from 'react';
import { ActionItem, ActionStatus, Meeting } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis, CartesianGrid } from 'recharts';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Activity, MapPin } from 'lucide-react';

interface DashboardProps {
  actions: ActionItem[];
  meetings: Meeting[];
}

const COLORS = {
  [ActionStatus.OPEN]: '#EF4444',      // Red
  [ActionStatus.IN_PROGRESS]: '#F59E0B', // Amber
  [ActionStatus.VERIFIED]: '#3B82F6',   // Blue
  [ActionStatus.CLOSED]: '#10B981'      // Emerald
};

const Dashboard: React.FC<DashboardProps> = ({ actions, meetings }) => {
  
  // Calculate Action Stats
  const actionStats = [
    { name: 'Retard', value: actions.filter(a => new Date(a.dueDate) < new Date() && a.status !== ActionStatus.CLOSED).length, color: '#DC2626' },
    { name: 'En cours', value: actions.filter(a => a.status === ActionStatus.IN_PROGRESS).length, color: '#F59E0B' },
    { name: 'Clôturé', value: actions.filter(a => a.status === ActionStatus.CLOSED).length, color: '#10B981' },
  ];

  const totalActions = actions.length;
  const closedActions = actions.filter(a => a.status === ActionStatus.CLOSED).length;
  const efficiency = totalActions ? Math.round((closedActions / totalActions) * 100) : 0;

  // Mock adherence data
  const adherenceData = [
    { day: 'Lun', rate: 100 },
    { day: 'Mar', rate: 90 },
    { day: 'Mer', rate: 85 },
    { day: 'Jeu', rate: 100 },
    { day: 'Ven', rate: 95 },
  ];

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCard 
          title="Actions Retard" 
          value={actionStats[0].value.toString()} 
          subtitle="Nécessite attention" 
          icon={<AlertCircle size={20} className="text-white" />} 
          color="bg-red-500"
        />
        <KpiCard 
          title="Efficacité Site" 
          value={`${efficiency}%`} 
          subtitle="Taux de clôture" 
          icon={<TrendingUp size={20} className="text-white" />} 
          color="bg-blue-500"
        />
        <KpiCard 
          title="Rituels Tenus" 
          value="94%" 
          subtitle="Cette semaine" 
          icon={<Activity size={20} className="text-white" />} 
          color="bg-purple-500"
        />
        <KpiCard 
          title="Sécurité" 
          value="12" 
          subtitle="Jours sans accident" 
          icon={<CheckCircle size={20} className="text-white" />} 
          color="bg-green-500"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-[300px]">
        
        {/* Chart 1: Adherence */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-gray-800 text-lg">Adhésion aux Rituels (5/15 min)</h3>
             <select className="bg-gray-100 border-none text-sm rounded-lg px-3 py-1 text-gray-600 outline-none">
               <option>Cette Semaine</option>
               <option>Mois dernier</option>
             </select>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="rate" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Action Distribution */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
           <h3 className="font-bold text-gray-800 text-lg mb-4">État des Actions</h3>
           <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionStats.filter(s => s.value > 0)}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {actionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{totalActions}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Total</div>
                 </div>
              </div>
           </div>
           <div className="mt-4 space-y-3">
              {actionStats.map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                         <span className="text-sm font-medium text-gray-600">{stat.name}</span>
                      </div>
                      <span className="font-bold text-gray-800">{stat.value}</span>
                  </div>
              ))}
           </div>
        </div>
      </div>

      {/* Heatmap Area */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 mb-20 md:mb-0">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-gray-400" />
            Zones Critiques (Top Incidents)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { name: 'Zone B2 (Packaging)', issues: 4, severity: 'high', type: 'Sécurité' },
                { name: 'Zone A1 (Réception)', issues: 2, severity: 'medium', type: 'Qualité' },
                { name: 'Quai Chargement', issues: 1, severity: 'low', type: 'Logistique' }
            ].map((zone, idx) => (
                <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${
                        zone.severity === 'high' ? 'bg-red-100 text-red-600' : 
                        zone.severity === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                        {zone.issues}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800">{zone.name}</div>
                        <div className="text-xs text-gray-500">{zone.type}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{title: string, value: string, subtitle: string, icon: React.ReactNode, color: string}> = ({title, value, subtitle, icon, color}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
          <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
              <h4 className="text-3xl font-bold text-gray-800">{value}</h4>
              <p className={`text-xs mt-2 font-medium ${subtitle.includes('attention') ? 'text-red-500' : 'text-green-500'}`}>{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl ${color} shadow-lg shadow-gray-200 transform group-hover:scale-110 transition-transform`}>
              {icon}
          </div>
      </div>
  </div>
);

export default Dashboard;