import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Briefcase, Scissors, ShoppingBag, Sparkles, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRecommendedModules } from '../../shared/business/moduleCatalog';
import { useApp } from '../../shared/context/AppContext';
import { BusinessType, ModuleId } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { ModuleCatalog } from '../../shared/ui/ModuleCatalog';
import { NoahOrb } from '../../shared/ui/NoahOrb';

const BUSINESS_TYPES: { type: BusinessType; title: string; text: string; icon: React.ReactNode }[] = [
  { type: 'restaurant', title: 'Restaurante o cafetería', text: 'Mesas, cocina, carta y costeo de platos.', icon: <Utensils className="w-5 h-5" /> },
  { type: 'store', title: 'Tienda o minimarket', text: 'Ingresos, compras, productos y fiados.', icon: <ShoppingBag className="w-5 h-5" /> },
  { type: 'barbershop', title: 'Barbería o salón', text: 'Agenda de citas, servicios y clientes.', icon: <Scissors className="w-5 h-5" /> },
  { type: 'services', title: 'Otro negocio de servicios', text: 'Citas, clientes y control de ingresos.', icon: <Briefcase className="w-5 h-5" /> },
];

const STEPS = ['Tu negocio', 'Tus datos', 'Tus módulos'];
const CITIES = ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Manta', 'Loja'];
const FIELD = 'w-full h-10 mt-1 border border-[#E7E5E0] rounded-xl px-3 bg-white text-sm font-normal';

export const OnboardingWizard: React.FC = () => {
  const { createBusiness, cancelAccountCreation } = useApp();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<BusinessType | null>(null);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [ruc, setRuc] = useState('');
  const [employeeCount, setEmployeeCount] = useState(1);
  const [modules, setModules] = useState<ModuleId[]>([]);
  const canContinue = step === 0 ? type !== null : step === 1 ? name.trim() !== '' && ownerName.trim() !== '' : true;
  const blockedReason = step === 0 ? 'Elige un tipo de negocio' : 'Completa el nombre del negocio y el tuyo';

  const chooseType = (next: BusinessType) => {
    setType(next);
    setModules(getRecommendedModules(next));
  };

  const toggle = (id: ModuleId) =>
    setModules((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const finish = () => {
    if (!type) return;
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    createBusiness({ type, name: name.trim(), ownerName: ownerName.trim(), city, ruc: ruc.trim(), employeeCount, modules });
  };

  return (
    <div className="min-h-dvh bg-app p-3 sm:p-5 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#E7E5E0] shadow-xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <NoahOrb state="idle" size="sm" showRipples={false} />
            <h1 className="font-display font-extrabold text-lg text-[#421A05]">Arma tu NOAH</h1>
          </div>
          <ol className="flex items-center gap-1.5 text-xs font-semibold">
            {STEPS.map((label, index) => (
              <li key={label} aria-current={index === step ? 'step' : undefined} className={`px-2.5 py-1 rounded-full ${index === step ? 'gradient-brand text-white' : index < step ? 'bg-[#EEEBD6] text-[#421A05]' : 'bg-[#F5F4F1] text-[#6B6B6B]'}`}>
                {index + 1}. {label}
              </li>
            ))}
          </ol>
        </div>

        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUSINESS_TYPES.map((option) => (
              <button
                key={option.type}
                onClick={() => chooseType(option.type)}
                aria-pressed={type === option.type}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-colors ${type === option.type ? 'border-[#CF6811] bg-[#FBF6E6]' : 'border-[#E7E5E0] hover:bg-[#FBF6E6]/50'}`}
              >
                <span className="w-10 h-10 shrink-0 rounded-xl bg-[#FCEFE3] text-[#CF6811] flex items-center justify-center">{option.icon}</span>
                <span>
                  <span className="block font-bold text-sm text-[#111111]">{option.title}</span>
                  <span className="block text-xs text-[#6B6B6B] mt-0.5">{option.text}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-[#111111]">
            <label>Nombre del negocio<input autoFocus value={name} onChange={(event) => setName(event.target.value)} className={FIELD} /></label>
            <label>Tu nombre (administrador)<input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} className={FIELD} /></label>
            <label>Ciudad
              <select value={city} onChange={(event) => setCity(event.target.value)} className={FIELD}>
                {CITIES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>RUC (opcional)<input inputMode="numeric" value={ruc} onChange={(event) => setRuc(event.target.value)} className={FIELD} /></label>
            <label>Número de empleados<input type="number" min={1} value={employeeCount} onChange={(event) => setEmployeeCount(Number(event.target.value) || 1)} className={FIELD} /></label>
            <p className="self-end text-[11px] font-normal text-[#6B6B6B] pb-2">País: Ecuador · Moneda: USD · IVA 15 %. Quien crea el negocio es su administrador.</p>
          </div>
        )}

        {step === 2 && type && (
          <div className="space-y-2">
            <p className="text-xs text-[#6B6B6B]">Marcamos lo recomendado para tu negocio; cambia lo que quieras. Tu menú se arma solo con lo que elijas y podrás ajustarlo después en Configuración.</p>
            <div className="max-h-[52dvh] overflow-y-auto pr-1">
              <ModuleCatalog type={type} selected={modules} onToggle={toggle} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E7E5E0]">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={() => (step === 0 ? cancelAccountCreation() : setStep(step - 1))}>
            {step === 0 ? 'Volver al inicio' : 'Anterior'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="primary" size="sm" disabled={!canContinue} rightIcon={<ArrowRight className="w-3.5 h-3.5" />} onClick={() => setStep(step + 1)}>
              {canContinue ? 'Continuar' : blockedReason}
            </Button>
          ) : (
            <Button variant="cinnamon" leftIcon={<Sparkles className="w-4 h-4" />} onClick={finish}>Crear mi NOAH</Button>
          )}
        </div>
      </div>
    </div>
  );
};
