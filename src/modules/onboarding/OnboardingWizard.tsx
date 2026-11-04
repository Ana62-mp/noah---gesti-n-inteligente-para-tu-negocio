import React, { useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { BusinessType, UserRole, ModuleId } from '../../shared/types';
import { BUSINESS_OPTIONS, INITIAL_MODULES } from '../../shared/services/mockData';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import {
  Utensils,
  ShoppingBag,
  Scissors,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingWizard: React.FC = () => {
  const {
    setCurrentBusiness,
    setCurrentRole,
    setHasCompletedOnboarding,
    setActiveSection,
    showToast,
    activeModules,
    toggleModule,
    logout,
    setIsCreatingAccount,
  } = useApp();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<BusinessType>('restaurant');
  const [businessName, setBusinessName] = useState('La Sazón de Carlos');
  const [city, setCity] = useState('Quito');
  const [ruc, setRuc] = useState('1792348912001');
  const [employees, setEmployees] = useState(7);
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');

  const handleFinishOnboarding = () => {
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    const chosenBusiness =
      selectedType === 'restaurant'
        ? BUSINESS_OPTIONS[0]
        : selectedType === 'store'
        ? BUSINESS_OPTIONS[1]
        : BUSINESS_OPTIONS[2];

    setCurrentBusiness({
      ...chosenBusiness,
      name: businessName,
      city,
      ruc,
      employeeCount: employees,
    });

    setCurrentRole(selectedRole);
    setHasCompletedOnboarding(true);

    if (selectedType === 'store') {
      setActiveSection('store');
    } else if (selectedType === 'barbershop') {
      setActiveSection('appointments');
    } else {
      setActiveSection('dashboard');
    }

    showToast(`¡Listo, ${chosenBusiness.ownerName.split(' ')[0]}! Tu NOAH está armado.`, 'success');
  };

  const handleSkipToRestaurantDemo = () => {
    setCurrentBusiness(BUSINESS_OPTIONS[0]);
    setCurrentRole('owner');
    setHasCompletedOnboarding(true);
    setActiveSection('dashboard');
    showToast('Cargada la demo completa de La Sazón de Carlos (Quito)', 'info');
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar with Back and Skip Button */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsCreatingAccount(false);
              logout();
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Login</span>
          </button>
          <div className="flex items-center gap-2">
            <NoahOrb state="idle" size="sm" />
            <span className="font-display font-black text-sm uppercase tracking-wider text-[#421A05] hidden sm:inline">
              Personaliza tu NOAH
            </span>
          </div>
        </div>

        <button
          onClick={handleSkipToRestaurantDemo}
          className="text-xs font-bold text-[#CF6811] hover:underline flex items-center gap-1.5 bg-[#FBF6E6] px-3 py-1.5 rounded-xl border border-[#EBD48F] shadow-2xs"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cargar demo de restaurante (Saltar)</span>
          <span className="sm:hidden">Saltar demo</span>
        </button>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl border border-[#E7E5E0] shadow-xl p-6 sm:p-10 my-4 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#6B6B6B] font-semibold">
            <span>Paso {step} de 4</span>
            <span>
              {step === 1 && '¿Qué negocio tienes?'}
              {step === 2 && 'Datos básicos'}
              {step === 3 && '¿Quién eres tú?'}
              {step === 4 && 'Catálogo de módulos'}
            </span>
          </div>
          <div className="h-2 w-full bg-[#F5F4F1] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#CF6811] to-[#D59F3F] transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Noah's Guidance Balloon */}
        <div className="flex items-center gap-3 p-3.5 bg-[#FBF6E6] rounded-2xl border border-[#EBD48F]">
          <NoahOrb state="idle" size="sm" showRipples={false} />
          <p className="text-xs text-[#421A05] leading-relaxed">
            {step === 1 &&
              '¡Bienvenido! Cuéntame qué tipo de negocio administras para adaptar los reportes y recetas a tu medida.'}
            {step === 2 &&
              'Configuraremos tu país (Ecuador), tu moneda (USD) y tu ciudad para los cálculos locales.'}
            {step === 3 &&
              'NOAH ajusta sus pantallas según tu rol: los meseros toman pedidos y los dueños ven rentabilidad.'}
            {step === 4 &&
              'Activa o desactiva módulos. Tu menú lateral se armará solo con lo que realmente necesitas.'}
          </p>
        </div>

        {/* STEP 1: BUSINESS TYPE */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-bold text-[#111111]">1. ¿Qué tipo de negocio tienes?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedType('restaurant');
                  setBusinessName('La Sazón de Carlos');
                  setCity('Quito');
                }}
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedType === 'restaurant'
                    ? 'border-[#CF6811] bg-[#FBF6E6] shadow-sm'
                    : 'border-[#E7E5E0] bg-white hover:bg-[#FAFAF8]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#CF6811]/15 text-[#CF6811] flex items-center justify-center mb-3">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <Badge variant="olive" size="sm">Plan completo</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111111]">Restaurante / Cafetería</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                    Recetas, costeo de platos, comandas de mesero, mesas, cocina y delivery.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType('store');
                  setBusinessName('Tienda Doña Rosa');
                  setCity('Guayaquil');
                }}
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedType === 'store'
                    ? 'border-[#CF6811] bg-[#FBF6E6] shadow-sm'
                    : 'border-[#E7E5E0] bg-white hover:bg-[#FAFAF8]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#5C5011]/15 text-[#5C5011] flex items-center justify-center mb-3">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <Badge variant="banana" size="sm">Plan básico</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111111]">Tienda de barrio / Minimarket</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                    Registro simple de ingresos y egresos por comprobantes, sin inventario complejo.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType('barbershop');
                  setBusinessName('Barber Kings');
                  setCity('Cuenca');
                }}
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedType === 'barbershop'
                    ? 'border-[#CF6811] bg-[#FBF6E6] shadow-sm'
                    : 'border-[#E7E5E0] bg-white hover:bg-[#FAFAF8]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#A43108]/15 text-[#A43108] flex items-center justify-center mb-3">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <Badge variant="harvest" size="sm">Extensión</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111111]">Barbería / Salón de belleza</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                    Catálogo de servicios y agenda de citas por voz con prevención de choques.
                  </p>
                </div>
              </button>

              <div className="p-5 rounded-2xl border border-dashed border-[#E7E5E0] bg-[#FAFAF8] opacity-60 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#6B6B6B]/15 text-[#6B6B6B] flex items-center justify-center mb-3">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#6B6B6B]">Próximamente</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#6B6B6B]">Otro negocio de servicios</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1">Heladerías, talleres, consultorías.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BASIC INFO */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <h2 className="text-lg font-bold text-[#111111]">2. Datos básicos de tu negocio</h2>

            <div>
              <label className="font-bold text-[#111111] block mb-1">Nombre Comercial:</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-[#E7E5E0] rounded-xl p-3 bg-[#F5F4F1] focus:bg-white text-xs font-bold text-[#111111]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#111111] block mb-1">Ciudad en Ecuador:</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-[#E7E5E0] rounded-xl p-3 bg-[#F5F4F1] text-xs font-medium"
                >
                  <option value="Quito">Quito</option>
                  <option value="Guayaquil">Guayaquil</option>
                  <option value="Cuenca">Cuenca</option>
                  <option value="Ambato">Ambato</option>
                  <option value="Manta">Manta</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111111] block mb-1">Número de empleados:</label>
                <input
                  type="number"
                  min="1"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value) || 1)}
                  className="w-full border border-[#E7E5E0] rounded-xl p-3 bg-[#F5F4F1] font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-[#6B6B6B] block">País</span>
                <strong className="text-xs text-[#111111]">Ecuador 🇪🇨</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B6B] block">Moneda</span>
                <strong className="text-xs text-[#111111]">Dólar USD ($)</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B6B] block">IVA legal</span>
                <strong className="text-xs text-[#111111]">15 %</strong>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: USER ROLE */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-bold text-[#111111]">3. ¿Quién eres tú en el negocio?</h2>
            <div className="space-y-2">
              {[
                { role: 'owner' as const, label: 'Dueño / Administrador', desc: 'Acceso financiero completo, costos, promociones y consultas gerenciales con Noah.' },
                { role: 'cashier' as const, label: 'Encargado de Caja', desc: 'Registro de ventas, cobros en salón y arqueo diario de caja.' },
                { role: 'waiter' as const, label: 'Mesero / Atención Salón', desc: 'Toma de pedidos por voz y envío a cocina desde el celular.' },
                { role: 'kitchen' as const, label: 'Cocina / Comandas', desc: 'Visualización de tickets de preparación y tiempos de despacho.' },
                { role: 'inventory' as const, label: 'Operador de Inventario', desc: 'Registro de compras, insumos y control de mermas.' },
              ].map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedRole === r.role
                      ? 'border-[#CF6811] bg-[#FBF6E6] shadow-xs'
                      : 'border-[#E7E5E0] bg-white hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-[#111111]">{r.label}</div>
                    <div className="text-[11px] text-[#6B6B6B] mt-0.5">{r.desc}</div>
                  </div>
                  {selectedRole === r.role && (
                    <CheckCircle2 className="w-5 h-5 text-[#CF6811] shrink-0 ml-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: MODULES CATALOG */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-bold text-[#111111]">4. Catálogo de módulos activados</h2>
            <p className="text-xs text-[#6B6B6B]">
              Los módulos que elijas determinarán tu menú de navegación.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {INITIAL_MODULES.slice(0, 10).map((m) => {
                const isEnabled = activeModules.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isEnabled ? 'bg-white border-[#CF6811]/40' : 'bg-[#FAFAF8] border-[#E7E5E0] opacity-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#111111]">{m.name}</div>
                      <div className="text-[10px] text-[#6B6B6B] line-clamp-1">{m.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleModule(m.id)}
                      className="accent-[#CF6811] rounded w-4 h-4 cursor-pointer shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E7E5E0]">
          {step > 1 ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => setStep(step - 1)}
            >
              Anterior
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => setStep(step + 1)}
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="cinnamon"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={handleFinishOnboarding}
            >
              ¡Comenzar con NOAH!
            </Button>
          )}
        </div>
      </div>

      <div className="text-center text-[11px] text-[#6B6B6B] py-2">
        NOAH · Prototipo comercial semifuncional · Validación de experiencia para restaurantes y pymes
      </div>
    </div>
  );
};
