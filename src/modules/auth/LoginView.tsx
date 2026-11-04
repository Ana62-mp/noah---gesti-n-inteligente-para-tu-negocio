import React, { useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { UserRole } from '../../shared/types';
import { Logo } from '../../shared/ui/Logo';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { Badge } from '../../shared/ui/Badge';
import { 
  UtensilsCrossed, 
  Store, 
  Scissors, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail, 
  UserCheck, 
  MapPin, 
  ShieldCheck,
  Building2,
  DollarSign,
  Compass
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithDemoAccount, loginWithCredentials, startAccountCreation } = useApp();

  const [email, setEmail] = useState('carlos@lasazondequito.ec');
  const [password, setPassword] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials'>('demo');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loginWithCredentials(email, password);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = (bizId: string, role: UserRole, name?: string) => {
    setIsLoading(true);
    setTimeout(() => {
      loginWithDemoAccount(bizId, role, name);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#111111] flex flex-col justify-between selection:bg-[#EBD48F] selection:text-[#111111] relative overflow-hidden font-sans">
      {/* Warm Ambient Backdrops */}
      <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-[#EBD48F]/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[28rem] h-[28rem] bg-[#CF6811]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Banner Ribbon (matching app header style) */}
      <div className="bg-[#421A05] text-[#EBD48F] text-[11px] font-semibold py-1.5 px-4 text-center border-b border-[#D59F3F]/30 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#CF6811]" />
          <span>PROTOTIPO COMERCIAL · DATOS DE EJEMPLO ECUADOR (USD $)</span>
          <span className="hidden md:inline text-white/50">· Validado para presentación de negocio</span>
        </div>
      </div>

      {/* Top Navbar */}
      <header className="border-b border-[#E7E5E0] bg-white/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="light" size="md" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-[#CF6811] bg-[#FBF6E6] border border-[#EBD48F] rounded-full uppercase">
              Prototipo Operativo Ecuador
            </span>
          </div>

          <button
            onClick={startAccountCreation}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#CF6811] to-[#D59F3F] hover:from-[#B85B0E] hover:to-[#C68E32] rounded-xl shadow-sm hover:shadow-md hover:shadow-[#CF6811]/20 transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#EBD48F]" />
            <span>Crear cuenta nueva</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Hero Title with Noah Orb */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <NoahOrb size="md" state="idle" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#111111] mb-3">
            Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CF6811] via-[#D59F3F] to-[#421A05]">NOAH</span>
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
            Tu copiloto inteligente y plataforma de gestión operativa para restaurantes, tiendas y barberías en Ecuador.
          </p>
        </div>

        {/* Access Selector Tabs */}
        <div className="flex items-center justify-center gap-1.5 max-w-md mx-auto mb-8 bg-[#F5F4F1] p-1.5 rounded-2xl border border-[#E7E5E0]">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'demo'
                ? 'bg-[#421A05] text-[#EBD48F] shadow-sm'
                : 'text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            Accesos Demo (1 Clic)
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'credentials'
                ? 'bg-[#421A05] text-[#EBD48F] shadow-sm'
                : 'text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            Ingreso con Credenciales
          </button>
        </div>

        {/* Tab 1: Interactive Demo Cards */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs uppercase tracking-wider text-[#421A05] font-bold bg-[#FBF6E6] px-3.5 py-1 rounded-full border border-[#EBD48F] shadow-2xs">
                Selecciona un negocio para explorar su interfaz y funciones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {/* Card 1: Restaurante La Sazón de Carlos */}
              <div className="group bg-white hover:bg-white border border-[#E7E5E0] hover:border-[#CF6811] rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-[var(--shadow-soft)] hover:shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FBF6E6] border border-[#EBD48F] text-[#CF6811] flex items-center justify-center font-bold shadow-2xs">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <Badge variant="cinnamon" size="sm">
                      Restaurante
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#CF6811] transition-colors">
                    La Sazón de Carlos
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mt-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#CF6811]" />
                    <span>Quito Centro • 12 Mesas</span>
                  </div>

                  <p className="text-xs text-[#6B6B6B] mb-4 line-clamp-2 leading-relaxed">
                    Cocina criolla tradicional, costeo de recetas en tiempo real, comandas por voz y control de meseros.
                  </p>

                  <div className="bg-[#FBFBF9] rounded-2xl p-3.5 border border-[#E7E5E0] mb-5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Ventas de hoy:</span>
                      <span className="font-extrabold text-[#5C5011] tabular-nums">$540,00</span>
                    </div>
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Mesas activas:</span>
                      <span className="font-bold text-[#111111]">8 de 12 salón</span>
                    </div>
                  </div>
                </div>

                {/* Role quick actions */}
                <div className="space-y-2 pt-3 border-t border-[#E7E5E0]">
                  <div className="text-[11px] font-bold text-[#6B6B6B] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#CF6811]" />
                    <span>Ingresar directamente como:</span>
                  </div>
                  <button
                    onClick={() => handleQuickLogin('rest-sazon', 'owner', 'Carlos Mendoza')}
                    disabled={isLoading}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl bg-[#FBF6E6] hover:bg-[#F5EDD1] text-[#421A05] border border-[#EBD48F] flex items-center justify-between group/btn transition-all shadow-2xs"
                  >
                    <span>👔 Dueño (Carlos Mendoza)</span>
                    <ArrowRight className="w-4 h-4 text-[#CF6811] group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickLogin('rest-sazon', 'waiter', 'Ana Martínez')}
                      disabled={isLoading}
                      className="px-2.5 py-2 text-[11px] font-bold rounded-xl bg-[#F5F4F1] hover:bg-[#E7E5E0] text-[#421A05] border border-[#E7E5E0] text-center transition-colors truncate"
                      title="Entrar como Mesera"
                    >
                      🍽️ Mesera (Ana)
                    </button>
                    <button
                      onClick={() => handleQuickLogin('rest-sazon', 'kitchen', 'Wilson Quishpe')}
                      disabled={isLoading}
                      className="px-2.5 py-2 text-[11px] font-bold rounded-xl bg-[#F5F4F1] hover:bg-[#E7E5E0] text-[#421A05] border border-[#E7E5E0] text-center transition-colors truncate"
                      title="Entrar como Jefe de Cocina"
                    >
                      👨‍🍳 Cocina (Wilson)
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Tienda de Barrio Doña Rosa */}
              <div className="group bg-white hover:bg-white border border-[#E7E5E0] hover:border-[#5C5011] rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-[var(--shadow-soft)] hover:shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FBF6E6] border border-[#EBD48F] text-[#5C5011] flex items-center justify-center font-bold shadow-2xs">
                      <Store className="w-6 h-6" />
                    </div>
                    <Badge variant="olive" size="sm">
                      Tienda de Barrio
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#5C5011] transition-colors">
                    Tienda Doña Rosa
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mt-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#5C5011]" />
                    <span>Guayaquil Sur • Plan Básico</span>
                  </div>

                  <p className="text-xs text-[#6B6B6B] mb-4 line-clamp-2 leading-relaxed">
                    Abarrotes, cuadre de caja diario, control de fiados vecinales y registro rápido por voz o lector.
                  </p>

                  <div className="bg-[#FBFBF9] rounded-2xl p-3.5 border border-[#E7E5E0] mb-5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Ventas de hoy:</span>
                      <span className="font-extrabold text-[#5C5011] tabular-nums">$184,50</span>
                    </div>
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Fiados pendientes:</span>
                      <span className="font-bold text-[#CF6811] tabular-nums">$142,00</span>
                    </div>
                  </div>
                </div>

                {/* Role quick actions */}
                <div className="space-y-2 pt-3 border-t border-[#E7E5E0]">
                  <div className="text-[11px] font-bold text-[#6B6B6B] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#5C5011]" />
                    <span>Ingresar directamente como:</span>
                  </div>
                  <button
                    onClick={() => handleQuickLogin('store-dona-rosa', 'owner', 'Rosa Pillajo')}
                    disabled={isLoading}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl bg-[#FBF6E6] hover:bg-[#F5EDD1] text-[#421A05] border border-[#EBD48F] flex items-center justify-between group/btn transition-all shadow-2xs"
                  >
                    <span>👵 Dueña (Rosa Pillajo)</span>
                    <ArrowRight className="w-4 h-4 text-[#5C5011] group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[11px] text-[#6B6B6B] italic text-center pt-1">
                    Interfaz simplificada con botones táctiles grandes y notas de voz.
                  </p>
                </div>
              </div>

              {/* Card 3: Barber Kings */}
              <div className="group bg-white hover:bg-white border border-[#E7E5E0] hover:border-[#D59F3F] rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-[var(--shadow-soft)] hover:shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FBF6E6] border border-[#EBD48F] text-[#8A7424] flex items-center justify-center font-bold shadow-2xs">
                      <Scissors className="w-6 h-6" />
                    </div>
                    <Badge variant="banana" size="sm">
                      Barbería & Servicios
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#8A7424] transition-colors">
                    Barber Kings Studio
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mt-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#8A7424]" />
                    <span>Cuenca Centro • 4 Sillas</span>
                  </div>

                  <p className="text-xs text-[#6B6B6B] mb-4 line-clamp-2 leading-relaxed">
                    Agenda de citas por barbero, cálculo de comisiones automáticas y recordatorios a clientes.
                  </p>

                  <div className="bg-[#FBFBF9] rounded-2xl p-3.5 border border-[#E7E5E0] mb-5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Citas agendadas hoy:</span>
                      <span className="font-extrabold text-[#8A7424]">14 turnos</span>
                    </div>
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Ticket promedio:</span>
                      <span className="font-bold text-[#111111] tabular-nums">$12,50</span>
                    </div>
                  </div>
                </div>

                {/* Role quick actions */}
                <div className="space-y-2 pt-3 border-t border-[#E7E5E0]">
                  <div className="text-[11px] font-bold text-[#6B6B6B] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#8A7424]" />
                    <span>Ingresar directamente como:</span>
                  </div>
                  <button
                    onClick={() => handleQuickLogin('barber-kings', 'owner', 'Mateo Andrade')}
                    disabled={isLoading}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl bg-[#FBF6E6] hover:bg-[#F5EDD1] text-[#421A05] border border-[#EBD48F] flex items-center justify-between group/btn transition-all shadow-2xs"
                  >
                    <span>💈 Administrador (Mateo Andrade)</span>
                    <ArrowRight className="w-4 h-4 text-[#8A7424] group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[11px] text-[#6B6B6B] italic text-center pt-1">
                    Control de agenda horaria, cortes y productos para el cabello.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Standard Login Form */}
        {activeTab === 'credentials' && (
          <div className="max-w-md mx-auto w-full bg-white border border-[#E7E5E0] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#111111] mb-2 text-center">Ingreso a tu Cuenta</h2>
            <p className="text-xs text-[#6B6B6B] mb-6 text-center leading-relaxed">
              Ingresa tus credenciales registradas para acceder a tu panel de control.
            </p>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ejemplo@negocio.ec"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl text-sm text-[#111111] placeholder-[#6B6B6B]/60 focus:outline-none focus:border-[#CF6811] focus:ring-1 focus:ring-[#CF6811] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl text-sm text-[#111111] placeholder-[#6B6B6B]/60 focus:outline-none focus:border-[#CF6811] focus:ring-1 focus:ring-[#CF6811] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[#E7E5E0] text-[#CF6811] focus:ring-0" />
                  <span>Recordarme</span>
                </label>
                <span className="text-[#CF6811] font-semibold hover:underline cursor-pointer">¿Olvidaste tu contraseña?</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#CF6811] to-[#D59F3F] hover:from-[#B85B0E] hover:to-[#C68E32] text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Ingresando...</span>
                ) : (
                  <>
                    <span>Ingresar a mi negocio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick autofill helper */}
            <div className="mt-6 pt-5 border-t border-[#E7E5E0]">
              <span className="text-[11px] text-[#6B6B6B] block mb-2 font-bold">Autocompletar cuentas de prueba:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setEmail('carlos@lasazondequito.ec')}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FBF6E6] hover:bg-[#F5EDD1] text-[#421A05] border border-[#EBD48F] transition-colors"
                >
                  Carlos (Restaurante)
                </button>
                <button
                  type="button"
                  onClick={() => setEmail('rosa@tiendadonarosa.ec')}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FBF6E6] hover:bg-[#F5EDD1] text-[#421A05] border border-[#EBD48F] transition-colors"
                >
                  Doña Rosa (Tienda)
                </button>
                <button
                  type="button"
                  onClick={() => setEmail('mateo@barberkings.ec')}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FBF6E6] hover:bg-[#F5EDD1] text-[#421A05] border border-[#EBD48F] transition-colors"
                >
                  Mateo (Barbería)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding / Account Creation Banner */}
        <div className="mt-8 sm:mt-10 bg-[#FBF6E6] border border-[#EBD48F] rounded-3xl p-5 sm:p-7 text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[var(--shadow-soft)]">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#CF6811] shrink-0" />
              <h4 className="text-base font-extrabold text-[#421A05]">¿Quieres configurar tu propio negocio desde cero?</h4>
            </div>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Usa el asistente guiado de 4 pasos para personalizar nombre, categoría, platos o productos, precios y márgenes.
            </p>
          </div>

          <button
            onClick={startAccountCreation}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#CF6811] hover:bg-[#B85B0E] rounded-xl transition-all shadow-md shadow-[#CF6811]/20 active:scale-95"
          >
            <span>Personaliza tu NOAH</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E0] py-4 px-4 text-center text-xs text-[#6B6B6B] bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NOAH — Sistema de Inteligencia y Operaciones para Negocios en Ecuador</span>
          <span>Moneda: Dólares USD ($) • IVA 15% SRI</span>
        </div>
      </footer>
    </div>
  );
};
