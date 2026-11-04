import React, { useEffect, useState } from 'react';
import { BellRing, Globe, Moon, Smartphone, Sun } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { PhoneFrame, PhoneModel, PhoneTheme } from '../../shared/ui/PhoneFrame';
import { BarberApp } from './barber/BarberApp';
import { PhonePush, PhoneSplash } from './components/PhoneChrome';
import { OwnerApp } from './owner/OwnerApp';
import { WaiterApp } from './waiter/WaiterApp';

type Profile = 'owner' | 'waiter' | 'barber';

const PUSH_DELAY_MS = 2500;
const PUSH_VISIBLE_MS = 5000;

const PROFILES: Record<Profile, { label: string; hint: string; push: string; pushTab: string; tryList: string[] }> = {
  owner: {
    label: 'Dueño',
    hint: 'Finanzas y alertas',
    push: 'Tienes 5 pollos de más que vencen mañana. ¿Hacemos una promo?',
    pushTab: 'alerts',
    tryList: [
      'Toca el orbe: Noah responde con cifra, período y detalle.',
      'Pide "Registra una compra por 180 dólares", confirma y míralo en Finanzas.',
      'Abre Alertas y crea una promoción: no se publica sin tu aprobación.',
    ],
  },
  waiter: {
    label: 'Mesero',
    hint: 'Pedidos por voz',
    push: 'Cocina: la comanda #881 está lista para servir.',
    pushTab: 'orders',
    tryList: [
      'Toca una mesa y toma el pedido por voz.',
      'Corrige cantidades, agrega platos y confirma.',
      'Abre Cocina en la web: la comanda ya está en el tablero.',
    ],
  },
  barber: {
    label: 'Barbero',
    hint: 'Agenda y reservas',
    push: 'Tu próxima cita es a las 14:00: Santiago Proaño.',
    pushTab: 'agenda',
    tryList: [
      'Agenda por voz para el martes a las 2: ese horario choca.',
      'Elige uno de los horarios libres que propone Noah.',
      'Confirma y mira la cita nueva en la agenda.',
    ],
  },
};

const PROFILE_IDS = Object.keys(PROFILES) as Profile[];
const MODELS: { id: PhoneModel; label: string }[] = [
  { id: 'iphone', label: 'iPhone' },
  { id: 'android', label: 'Android pequeño' },
];

const COMPARISON = [
  {
    title: 'Web adaptable',
    badge: <Badge variant="olive" size="sm">Incluido</Badge>,
    icon: <Globe className="w-4 h-4 text-[#5C5011]" />,
    text: 'Desde el navegador en cualquier dispositivo, sin instalar. Menor costo inicial y actualizaciones al instante.',
  },
  {
    title: 'App móvil',
    badge: <Badge variant="banana" size="sm">Cotización aparte</Badge>,
    icon: <Smartphone className="w-4 h-4 text-[#CF6811]" />,
    text: 'Se instala, con acceso rápido al micrófono y notificaciones push. Requiere publicar en las tiendas de apps.',
  },
];

export const MobilePreviewView: React.FC = () => {
  const [profile, setProfile] = useState<Profile>('owner');
  const [model, setModel] = useState<PhoneModel>('iphone');
  const [theme, setTheme] = useState<PhoneTheme>('light');
  const [isPushVisible, setIsPushVisible] = useState(false);
  const [requestedTab, setRequestedTab] = useState<{ tab: string; nonce: number } | null>(null);
  const current = PROFILES[profile];

  useEffect(() => {
    setIsPushVisible(false);
    const timer = setTimeout(() => setIsPushVisible(true), PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [profile]);

  useEffect(() => {
    if (!isPushVisible) return;
    const timer = setTimeout(() => setIsPushVisible(false), PUSH_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [isPushVisible]);

  const selectProfile = (id: Profile) => {
    setRequestedTab(null);
    setProfile(id);
  };

  const openPush = () => {
    setIsPushVisible(false);
    setRequestedTab({ tab: current.pushTab, nonce: Date.now() });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#CF6811]" />
            <h2 className="text-lg font-bold text-[#111111]">Cómo se vería en el celular</h2>
            <Badge variant="harvest" size="sm">Simulación · datos de ejemplo</Badge>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Navega el celular como en una app real. Lo que confirmes aquí aparece también en la versión web.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" leftIcon={<BellRing className="w-3.5 h-3.5 text-[#CF6811]" />} onClick={() => setIsPushVisible(true)}>
            Enviar notificación
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 xl:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7E5E0] p-4 shadow-[var(--shadow-soft)] space-y-2.5">
            <h3 className="text-xs font-bold text-[#421A05] uppercase tracking-wide">Perfil en el celular</h3>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Perfil en el celular">
              {PROFILE_IDS.map((id) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={profile === id}
                  onClick={() => selectProfile(id)}
                  className={`min-h-12 p-2.5 rounded-xl border text-left transition-all ${
                    profile === id ? 'gradient-brand text-white border-transparent shadow-md' : 'bg-white border-[#E7E5E0] hover:bg-[#FBF6E6]'
                  }`}
                >
                  <div className="font-bold text-xs">{PROFILES[id].label}</div>
                  <div className={`text-[10px] ${profile === id ? 'text-white/90' : 'text-[#6B6B6B]'}`}>{PROFILES[id].hint}</div>
                </button>
              ))}
            </div>

            <h3 className="text-xs font-bold text-[#421A05] uppercase tracking-wide pt-1">Tamaño del dispositivo</h3>
            <div className="flex gap-2">
              {MODELS.map(({ id, label }) => (
                <button
                  key={id}
                  aria-pressed={model === id}
                  onClick={() => setModel(id)}
                  className={`flex-1 min-h-10 rounded-xl border text-xs font-bold transition-all ${
                    model === id ? 'bg-[#421A05] text-white border-transparent' : 'bg-white border-[#E7E5E0] hover:bg-[#FBF6E6]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#FBF6E6] rounded-2xl border border-[#EBD48F] p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#421A05] uppercase tracking-wide">Qué mostrarle al cliente</h3>
            <ol className="space-y-1.5 text-xs text-[#421A05] list-decimal list-inside">
              {current.tryList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
            {COMPARISON.map(({ title, badge, icon, text }) => (
              <div key={title} className="bg-white rounded-2xl border border-[#E7E5E0] p-4 shadow-[var(--shadow-soft)] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-sm text-[#111111]">
                  {icon}
                  {title}
                </div>
                {badge}
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 xl:col-span-7 flex justify-center">
          <PhoneFrame model={model} theme={theme}>
            <PhoneSplash key={`splash-${profile}`} />
            {isPushVisible && <PhonePush message={current.push} onOpen={openPush} onClose={() => setIsPushVisible(false)} />}
            {profile === 'owner' && <OwnerApp key="owner" requestedTab={requestedTab} />}
            {profile === 'waiter' && <WaiterApp key="waiter" requestedTab={requestedTab} />}
            {profile === 'barber' && <BarberApp key="barber" requestedTab={requestedTab} />}
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
};
