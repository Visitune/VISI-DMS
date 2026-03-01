import React from 'react';
import { BookOpen, CheckCircle2, Zap, Shield, BarChart2, CheckSquare, Database, Settings, Sliders, ArrowRight, Info, AlertCircle } from 'lucide-react';

const UserGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl mb-4">
          <BookOpen size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Guide Utilisateur VISI-DMS</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Apprenez à maîtriser votre outil de management visuel pour une performance d'équipe optimale.
        </p>
      </div>

      {/* Quick Start */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
          <Zap className="text-yellow-400" />
          <h2 className="text-xl font-bold">Démarrage Rapide</h2>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step 
            number="01" 
            title="Lancer un Rituel" 
            description="Cliquez sur 'LANCER RITUEL' dans la barre latérale pour démarrer un point 5' ou 15'." 
          />
          <Step 
            number="02" 
            title="Saisir les Actions" 
            description="Pendant le rituel, capturez les problèmes, prenez des photos et assignez des responsables." 
          />
          <Step 
            number="03" 
            title="Clôturer & Exporter" 
            description="Terminez la réunion pour générer automatiquement le rapport et synchroniser les données." 
          />
        </div>
      </section>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GuideCard 
          icon={<Shield className="text-emerald-600" />}
          title="Management HHSE"
          content="Le module HHSE (Hygiène, Santé, Sécurité, Environnement) permet de sensibiliser les équipes via des thématiques flash. Chaque réunion 5' propose un thème aléatoire issu de votre bibliothèque personnalisable."
        />
        <GuideCard 
          icon={<CheckSquare className="text-orange-600" />}
          title="Gestion des Actions"
          content="Toutes les actions capturées sont centralisées dans l'onglet 'Actions & Photos'. Vous pouvez filtrer par département, priorité ou statut (OUVERT, EN COURS, VÉRIFIÉ, CLÔTURÉ)."
        />
        <GuideCard 
          icon={<BarChart2 className="text-purple-600" />}
          title="Tableau de Bord"
          content="Suivez en temps réel le taux de clôture des actions (SLA), la répartition par département et l'historique des réunions pour identifier les tendances de performance."
        />
        <GuideCard 
          icon={<Database className="text-blue-600" />}
          title="Sauvegarde & Export"
          content="VISI-DMS fonctionne en mode 'Offline-First'. Vos données sont stockées localement. Utilisez l'onglet 'Données' pour exporter des backups JSON ou envoyer des rapports par email."
        />
      </div>

      {/* Configuration Guide */}
      <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="text-slate-600" />
          <h2 className="text-2xl font-bold text-slate-900">Configuration Personnalisée</h2>
        </div>
        <div className="space-y-4">
          <ConfigItem 
            title="Bibliothèque HHSE" 
            description="Ajoutez vos propres thématiques de sécurité dans les paramètres pour qu'elles apparaissent lors des rituels." 
          />
          <ConfigItem 
            title="Départements" 
            description="Configurez vos services (Maintenance, Qualité, RH...) pour une classification précise des actions." 
          />
          <ConfigItem 
            title="Profil Utilisateur" 
            description="Personnalisez votre nom et votre photo de profil pour que vos actions soient clairement identifiées." 
          />
        </div>
      </section>

      {/* Tips & Tricks */}
      <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <Info className="text-blue-200" />
            <h2 className="text-2xl font-bold">Astuces de Pro</h2>
          </div>
          <ul className="space-y-3 list-disc list-inside text-blue-100">
            <li>Utilisez la <strong>Saisie Vocale</strong> pour gagner du temps lors de la capture d'actions sur le terrain.</li>
            <li>Prenez systématiquement une <strong>Photo de Preuve</strong> pour faciliter la compréhension du problème par le responsable.</li>
            <li>Exportez régulièrement vos données pour conserver un historique externe sécurisé.</li>
          </ul>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
          <Zap size={200} />
        </div>
      </div>

      {/* Footer Support */}
      <div className="text-center p-8 border-t border-slate-200">
        <p className="text-slate-500 mb-4">Besoin d'une assistance technique ou d'une formation ?</p>
        <a 
          href="mailto:support@visi-dms.com" 
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all"
        >
          Contacter le Support VISI-DMS
          <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
};

const Step: React.FC<{ number: string, title: string, description: string }> = ({ number, title, description }) => (
  <div className="space-y-3">
    <div className="text-3xl font-black text-blue-600/20">{number}</div>
    <h3 className="font-bold text-slate-900">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
);

const GuideCard: React.FC<{ icon: React.ReactNode, title: string, content: string }> = ({ icon, title, content }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{content}</p>
  </div>
);

const ConfigItem: React.FC<{ title: string, description: string }> = ({ title, description }) => (
  <div className="flex gap-4 items-start">
    <div className="mt-1.5"><CheckCircle2 size={18} className="text-blue-500" /></div>
    <div>
      <h4 className="font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

export default UserGuide;
