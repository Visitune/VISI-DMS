import React from 'react';
import { X, CheckCircle2, Zap, BarChart2, Shield, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  onGoToGuide: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, onGoToGuide }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with Logo */}
        <div className="bg-slate-900 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg" 
                alt="VISI-DMS Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Bienvenue sur VISI-DMS</h2>
          </div>
          <p className="text-slate-300 text-lg">Votre outil de digitalisation du Management Visuel de la Performance.</p>
        </div>

        {/* Features List */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureItem 
              icon={<Zap className="text-blue-600" />}
              title="Rituels 5' / 15'"
              description="Digitalisez vos stand-up meetings quotidiens et hebdomadaires en quelques clics."
            />
            <FeatureItem 
              icon={<Shield className="text-emerald-600" />}
              title="Management HHSE"
              description="Suivez la sécurité et l'environnement avec des thématiques aléatoires et ciblées."
            />
            <FeatureItem 
              icon={<CheckSquare className="text-orange-600" />}
              title="Suivi d'Actions"
              description="Capturez les problèmes en temps réel avec photos et assignez des responsables."
            />
            <FeatureItem 
              icon={<BarChart2 className="text-purple-600" />}
              title="Dashboard Live"
              description="Visualisez vos indicateurs de performance et le taux de clôture des actions."
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onGoToGuide}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Consulter le Guide Complet
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
            >
              Commencer maintenant
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex gap-4">
    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

const CheckSquare = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

export default OnboardingModal;
