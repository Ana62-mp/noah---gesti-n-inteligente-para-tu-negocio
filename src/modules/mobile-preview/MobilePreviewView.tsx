import React, { useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import {
  Smartphone,
  Globe,
  BellRing,
  Mic,
  RotateCw,
  Sun,
  Moon,
  ChevronRight,
  Utensils,
  Scissors,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MobilePreviewView: React.FC = () => {
  const { showToast, setActiveSection } = useApp();
  const [profile, setProfile] = useState<'owner' | 'waiter' | 'barber'>('owner');
  const [phoneModel, setPhoneModel] = useState<'iphone' | 'android'>('iphone');
  const [appDarkMode, setAppDarkMode] = useState(false);
  const [showPushNotification, setShowPushNotification] = useState(true);

  // Waiter mini-app voice flow state
  const [waiterVoiceActive, setWaiterVoiceActive] = useState(false);
  const [waiterStep, setWaiterStep] = useState(0);

  const handleSimulatePush = () => {
    setShowPushNotification(true);
    showToast('Notificación push recibida en dispositivo móvil', 'info');
  };

  const handleTriggerWaiterVoice = () => {
    setWaiterVoiceActive(true);
    setWaiterStep(1);
    setTimeout(() => setWaiterStep(2), 1200);
    setTimeout(() => setWaiterStep(3), 2400);
  };

  const handleConfirmWaiterOrder = () => {
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {}
    setWaiterVoiceActive(false);
    setWaiterStep(0);
    showToast('Pedido de Mesa 4 enviado a cocina desde el celular', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#CF6811]" />
            <h2 className="text-lg font-bold text-[#111111]">Simulador de App Móvil Nativa</h2>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Compara la experiencia entre sitio web adaptable y aplicación móvil dedicada para el personal.
          </p>
        </div>

        {/* Device Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<BellRing className="w-3.5 h-3.5 text-[#CF6811]" />}
            onClick={handleSimulatePush}
          >
            Disparar Push
          </Button>

          <button
            onClick={() => setAppDarkMode(!appDarkMode)}
            className="p-2 border border-[#E7E5E0] bg-white rounded-xl text-[#111111] hover:bg-[#F5F4F1] transition-colors"
            title="Cambiar tema móvil"
          >
            {appDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Split Grid: Left Architecture & Explanations | Right Realistic Phone Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Business Decision Cards & Role Switcher */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Switcher */}
          <div className="bg-white rounded-2xl border border-[#E7E5E0] p-5 shadow-[var(--shadow-soft)] space-y-3">
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
              1. Selecciona el perfil para interactuar en el celular:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'owner' as const, label: 'Dueño', sub: 'Control total' },
                { id: 'waiter' as const, label: 'Mesero', sub: 'Pedidos voz' },
                { id: 'barber' as const, label: 'Barbero', sub: 'Agenda citas' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProfile(p.id);
                    setWaiterVoiceActive(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    profile === p.id
                      ? 'bg-[#FBF6E6] border-[#CF6811] shadow-[var(--shadow-soft)]'
                      : 'bg-white border-[#E7E5E0] hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#111111]">{p.label}</div>
                  <div className="text-[10px] text-[#6B6B6B]">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Architecture Comparison Cards */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider block">
              2. Comparativa técnica para la propuesta comercial:
            </span>

            {/* Card 1: Web Adaptable */}
            <div className="bg-white rounded-2xl border border-[#E7E5E0] p-5 shadow-[var(--shadow-soft)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-[#111111]">
                  <Globe className="w-4 h-4 text-[#5C5011]" />
                  <span>Web Adaptable (Responsive)</span>
                </div>
                <Badge variant="olive" size="sm">Incluido</Badge>
              </div>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Se accede desde el navegador en cualquier celular, tableta o laptop sin descargas de tiendas.
                Menor costo inicial de desarrollo y actualizaciones instantáneas sin aprobación de Apple/Google.
              </p>
            </div>

            {/* Card 2: App Móvil Nativa */}
            <div className="bg-white rounded-2xl border border-[#E7E5E0] p-5 shadow-[var(--shadow-soft)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-[#111111]">
                  <Smartphone className="w-4 h-4 text-[#CF6811]" />
                  <span>App Móvil (iOS / Android)</span>
                </div>
                <Badge variant="banana" size="sm">Cotizable aparte</Badge>
              </div>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Se instala en el teléfono con acceso a notificaciones push nativas al instante, micrófono
                en segundo plano y diseño ergonómico para uso con una sola mano en salón o barbería.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Phone Mockup */}
        <div className="lg:col-span-7 flex justify-center py-4">
          <div
            className={`w-[340px] sm:w-[370px] h-[700px] rounded-[48px] p-3 shadow-2xl relative select-none transition-colors border-[6px] ${
              appDarkMode ? 'bg-[#1a0a03] border-[#381604]' : 'bg-[#111111] border-[#222222]'
            }`}
          >
            {/* Screen Glass Bezel */}
            <div
              className={`w-full h-full rounded-[38px] overflow-hidden flex flex-col relative transition-colors ${
                appDarkMode ? 'bg-[#220d04] text-white' : 'bg-[#FBFBF9] text-[#111111]'
              }`}
            >
              {/* Dynamic Island / Camera Notch */}
              <div className="pt-2 pb-1 px-6 flex items-center justify-between text-[11px] font-bold">
                <span>14:30</span>
                <div className="w-24 h-4 bg-black rounded-full" />
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span>5G</span>
                  <span>98%</span>
                </div>
              </div>

              {/* Simulated Dropping Push Notification */}
              {showPushNotification && (
                <div className="mx-3 mt-1 p-3 rounded-2xl bg-white text-[#111111] shadow-xl border border-[#CF6811]/40 flex items-start justify-between gap-2 z-30 animate-in slide-in-from-top-3">
                  <div className="flex items-start gap-2.5">
                    <NoahOrb state="idle" size="sm" showRipples={false} />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-[11px] text-[#421A05]">NOAH</span>
                        <span className="text-[9px] text-[#6B6B6B]">· ahora</span>
                      </div>
                      <div className="text-xs font-semibold mt-0.5 leading-tight">
                        Tienes 5 pollos de más que vencen mañana. ¿Hacemos promo 2x1?
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPushNotification(false)}
                    className="text-[#6B6B6B] hover:text-[#111111] p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Mini App Content depending on Profile */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* OWNER APP */}
                {profile === 'owner' && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">
                          La Sazón de Carlos
                        </div>
                        <div className="font-extrabold text-base">Hola, Carlos</div>
                      </div>
                      <Badge variant="olive" size="sm">En vivo</Badge>
                    </div>

                    {/* Compact KPI Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#421A05] to-[#5C2307] text-white space-y-2 shadow-md">
                      <div className="text-[10px] text-[#EBD48F] uppercase font-bold">
                        Ventas de hoy
                      </div>
                      <div className="text-2xl font-extrabold font-mono tabular-nums">
                        $780,50
                      </div>
                      <div className="text-[11px] text-[#EBD48F]/80">
                        +12 % vs. martes anterior · 86 pedidos
                      </div>
                    </div>

                    {/* Big Center Noah Voice Orb */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] text-center space-y-2">
                      <NoahOrb state="idle" size="lg" onClick={() => showToast('Escuchando voz en móvil…', 'info')} />
                      <div className="font-bold text-xs mt-2 text-[#421A05]">
                        Toca el orbe para hablar
                      </div>
                      <div className="text-[10px] text-[#6B6B6B]">
                        "¿Cuánto ganamos este mes?"
                      </div>
                    </div>

                    {/* Quick Metric */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-[#E7E5E0]">
                        <span className="text-[10px] text-[#6B6B6B]">Resultado mes</span>
                        <div className="font-bold font-mono text-sm text-[#5C5011] mt-0.5">
                          $2.950,00
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#E7E5E0]">
                        <span className="text-[10px] text-[#6B6B6B]">Caja física</span>
                        <div className="font-bold font-mono text-sm text-[#111111] mt-0.5">
                          $395,00
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WAITER APP */}
                {profile === 'waiter' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">Mesero</div>
                        <div className="font-extrabold text-base">Atención Salón</div>
                      </div>
                      <Badge variant="cinnamon" size="sm">Mesa 4 activa</Badge>
                    </div>

                    {!waiterVoiceActive ? (
                      <>
                        {/* Big Voice Button */}
                        <button
                          onClick={handleTriggerWaiterVoice}
                          className="w-full py-4 bg-[#CF6811] text-white rounded-2xl shadow-md font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#B85B0E] transition-all"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Tomar pedido por voz en mesa 4</span>
                        </button>

                        <div className="space-y-2">
                          <div className="text-xs font-bold text-[#111111]">Mesas asignadas:</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-[#CF6811]">
                              <span className="font-bold">Mesa 4</span>
                              <div className="text-[10px] text-[#A43108]">Pidiendo platos</div>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-[#E7E5E0]">
                              <span className="font-bold">Mesa 2</span>
                              <div className="text-[10px] text-[#5C5011]">Comiendo ($18,50)</div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Live In-App Voice Ordering (Adapted for thumb) */
                      <div className="p-4 bg-white rounded-2xl border border-[#CF6811] shadow-md space-y-3 animate-in fade-in">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#CF6811]">
                          <NoahOrb state="listening" size="sm" />
                          <span>Escuchando pedido en mesa…</span>
                        </div>

                        <div className="text-[11px] text-[#6B6B6B] italic bg-[#FAFAF8] p-2.5 rounded-lg border border-[#E7E5E0]">
                          {waiterStep >= 1 && "“2 secos de pollo... ”"}
                          {waiterStep >= 2 && "“... 3 ceviches de camarón (1 sin cebolla)... ”"}
                          {waiterStep >= 3 && "“... y 1 jarra de naranjilla.”"}
                        </div>

                        {waiterStep >= 3 && (
                          <div className="space-y-2 pt-1">
                            <div className="text-xs font-bold text-[#111111]">
                              Pedido estructurado: $42,00
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                              onClick={handleConfirmWaiterOrder}
                            >
                              Enviar a cocina ahora ✓
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* BARBER APP */}
                {profile === 'barber' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">Barber Kings</div>
                        <div className="font-extrabold text-base">Agenda de David</div>
                      </div>
                      <Badge variant="olive" size="sm">3 citas hoy</Badge>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#EBD48F] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[#CF6811] font-bold">14:00 - OCUPADO</div>
                        <div className="font-bold text-xs text-[#111111]">Santiago Proaño</div>
                        <div className="text-[10px] text-[#6B6B6B]">Fade skin (45 min)</div>
                      </div>
                      <Badge variant="banana" size="sm">En sillón</Badge>
                    </div>

                    <Button
                      variant="cinnamon"
                      size="sm"
                      className="w-full"
                      leftIcon={<Mic className="w-4 h-4" />}
                      onClick={() => showToast('Agendando por voz en móvil…', 'info')}
                    >
                      Agendar siguiente turno por voz
                    </Button>
                  </div>
                )}
              </div>

              {/* Bottom Tab Bar (Ergonomic thumb placement) */}
              <div
                className={`py-2 px-4 border-t flex items-center justify-around text-[10px] font-semibold ${
                  appDarkMode
                    ? 'bg-[#1a0a03] border-[#381604] text-white/70'
                    : 'bg-white border-[#E7E5E0] text-[#6B6B6B]'
                }`}
              >
                <div className="flex flex-col items-center text-[#CF6811]">
                  <Utensils className="w-4 h-4" />
                  <span>Inicio</span>
                </div>
                <div className="flex flex-col items-center">
                  <NoahOrb state="idle" size="sm" showRipples={false} />
                  <span>Noah</span>
                </div>
                <div className="flex flex-col items-center">
                  <BellRing className="w-4 h-4" />
                  <span>Alertas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
