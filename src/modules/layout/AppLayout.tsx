import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { BUSINESS_OPTIONS } from '../../shared/services/mockData';
import { UserRole } from '../../shared/types';
import { Logo } from '../../shared/ui/Logo';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { SidePanel } from '../../shared/ui/SidePanel';
import { NoahChat } from '../assistant/NoahChat';
import { GuidedTour } from '../tour/GuidedTour';
import { ToastContainer } from '../../shared/ui/ToastContainer';
import {
  LayoutDashboard,
  Receipt,
  TrendingDown,
  ArrowLeftRight,
  BarChart3,
  UtensilsCrossed,
  Calculator,
  Grid3X3,
  ChefHat,
  Bike,
  Boxes,
  Truck,
  Scissors,
  CalendarCheck,
  Sparkles,
  Mic,
  BellRing,
  Smartphone,
  Settings,
  Search,
  Menu as MenuIcon,
  X,
  Compass,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentBusiness,
    currentRole,
    setCurrentRole,
    activeSection,
    setActiveSection,
    isAssistantOpen,
    setIsAssistantOpen,
    unreadNotificationsCount,
    startGuidedTour,
    showToast,
    currentUser,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Keyboard shortcut Ctrl+K to open Noah Assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAssistantOpen(!isAssistantOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAssistantOpen, setIsAssistantOpen]);

  // Sidebar navigation items grouped by section
  const navSections = [
    {
      title: 'INICIO',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'voice_scenarios', label: 'Noah Escucha (Voz)', icon: <Mic className="w-4 h-4 text-[#CF6811]" />, highlight: true },
      ],
    },
    {
      title: 'FINANZAS',
      items: [
        { id: 'sales', label: 'Ventas y Caja', icon: <Receipt className="w-4 h-4" /> },
        { id: 'expenses', label: 'Gastos y Compras', icon: <TrendingDown className="w-4 h-4" /> },
        { id: 'reports', label: 'Reportes y Rentabilidad', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    ...(currentBusiness.type === 'restaurant'
      ? [
          {
            title: 'RESTAURANTE',
            items: [
              { id: 'costing', label: 'Costeo y Recetas', icon: <Calculator className="w-4 h-4 text-[#EBD48F]" /> },
              { id: 'menu', label: 'Carta / Menú', icon: <UtensilsCrossed className="w-4 h-4" /> },
              { id: 'tables', label: 'Mesas y Salón', icon: <Grid3X3 className="w-4 h-4" /> },
              { id: 'kitchen', label: 'Cocina / Comandas', icon: <ChefHat className="w-4 h-4" /> },
              { id: 'delivery', label: 'Delivery / Para llevar', icon: <Bike className="w-4 h-4" /> },
            ],
          },
          {
            title: 'INVENTARIO',
            items: [
              { id: 'inventory', label: 'Insumos y Bodega', icon: <Boxes className="w-4 h-4" /> },
              { id: 'suppliers', label: 'Proveedores', icon: <Truck className="w-4 h-4" /> },
            ],
          },
        ]
      : []),
    ...(currentBusiness.type === 'store'
      ? [
          {
            title: 'MODO TIENDA',
            items: [
              { id: 'store', label: 'Panel Tienda (Simple)', icon: <ShoppingBag className="w-4 h-4 text-[#EBD48F]" /> },
              { id: 'expenses', label: 'Notas de compra', icon: <Receipt className="w-4 h-4" /> },
            ],
          },
        ]
      : []),
    ...(currentBusiness.type === 'barbershop'
      ? [
          {
            title: 'BARBERÍA',
            items: [
              { id: 'appointments', label: 'Agenda de Citas', icon: <CalendarCheck className="w-4 h-4 text-[#EBD48F]" /> },
            ],
          },
        ]
      : []),
    {
      title: 'CONFIGURACIÓN',
      items: [
        { id: 'mobile_preview', label: 'Ver como App Móvil', icon: <Smartphone className="w-4 h-4 text-[#CF6811]" /> },
        { id: 'settings', label: 'Configuración / Demo', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    setIsAssistantOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col antialiased">
      {/* 1. Top Ribbon: Prototype & Sample Data (Acceptance Criteria CA-14) */}
      <div className="bg-[#421A05] text-[#EBD48F] text-[11px] font-semibold py-1 px-4 text-center border-b border-[#D59F3F]/30 flex items-center justify-between z-40">
        <div className="flex items-center gap-1.5 mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#CF6811]" />
          <span>PROTOTIPO COMERCIAL · DATOS DE EJEMPLO ECUADOR (USD $)</span>
          <span className="hidden md:inline text-white/50">· Validado para presentación previa a desarrollo productivo</span>
        </div>

        <button
          onClick={startGuidedTour}
          className="text-[10px] bg-[#CF6811] text-white px-2 py-0.5 rounded font-bold hover:bg-[#B85B0E] transition-colors shrink-0 flex items-center gap-1"
        >
          <Compass className="w-3 h-3" />
          <span>Recorrido guiado</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Sidebar Navigation (in Espresso #421A05) */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#421A05] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex-1 overflow-y-auto scrollbar-none p-5 space-y-6">
            {/* Logo and close button on mobile */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <Logo variant="dark" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Business Info in Sidebar (Static display per prompt request) */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#EBD48F] font-bold uppercase tracking-wider">
                  Negocio Conectado
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white font-medium capitalize">
                  {currentBusiness.type === 'restaurant' ? 'Restaurante' : currentBusiness.type === 'store' ? 'Tienda' : 'Barbería'}
                </span>
              </div>
              <div className="text-xs text-white font-extrabold truncate">
                {currentBusiness.name}
              </div>
              <div className="text-[11px] text-white/60">
                {currentBusiness.city} • {currentBusiness.employeeCount} colaboradores
              </div>
            </div>

            {/* Navigation Sections */}
            <nav className="space-y-6">
              {navSections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#EBD48F]/60 px-3 mb-1">
                    {sec.title}
                  </div>
                  {sec.items.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#CF6811] text-white shadow-sm'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.highlight && (
                          <span className="w-2 h-2 rounded-full bg-[#EBD48F] animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer: Highlight "Ver como app móvil" & Current Role */}
          <div className="p-4 border-t border-white/10 bg-[#2A1103]/60 space-y-2">
            <button
              onClick={() => {
                setActiveSection('mobile_preview');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#CF6811] to-[#D59F3F] text-white font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Ver como App Móvil</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-[#EBD48F]/80 pt-1 px-1">
              <span>Rol: <strong className="text-white capitalize">{currentRole}</strong></span>
              <button
                onClick={() => setActiveSection('settings')}
                className="hover:text-white underline"
              >
                Cambiar
              </button>
            </div>

            <button
              onClick={logout}
              className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión / Cambiar negocio</span>
            </button>
          </div>
        </aside>

        {/* 3. Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar Header */}
          <header className="h-16 bg-white border-b border-[#E7E5E0] px-4 sm:px-6 flex items-center justify-between gap-4 z-30 shrink-0">
            {/* Left: Mobile menu button & breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#111111] hover:bg-[#F5F4F1]"
                aria-label="Abrir menú"
              >
                <MenuIcon className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#6B6B6B]">
                <span className="text-[#111111] font-bold">{currentBusiness.name}</span>
                <span>/</span>
                <span className="text-[#CF6811] capitalize">
                  {activeSection.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Center: Global Search Bar */}
            <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B6B6B]" />
                <input
                  type="text"
                  placeholder="Buscar en el negocio o preguntar a Noah (Ctrl+K)…"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full bg-[#F5F4F1] border border-[#E7E5E0] focus:border-[#CF6811] focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs text-[#111111] placeholder:text-[#6B6B6B] focus:outline-none transition-all"
                />
              </div>
            </form>

            {/* Right: Role Switcher & Notifications & Tour */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Quick Selector */}
              <div className="flex items-center gap-1.5 bg-[#F5F4F1] border border-[#E7E5E0] rounded-xl px-2.5 py-1 text-xs">
                <span className="text-[#6B6B6B] hidden sm:inline">Vista:</span>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="bg-transparent font-bold text-[#111111] focus:outline-none cursor-pointer"
                >
                  <option value="owner">Dueño</option>
                  <option value="cashier">Caja</option>
                  <option value="waiter">Mesero</option>
                  <option value="kitchen">Cocina</option>
                  <option value="inventory">Inventario</option>
                </select>
              </div>

              {/* Notification Center Bell */}
              <button
                onClick={() => setActiveSection('alerts')}
                className="relative p-2 rounded-xl text-[#111111] hover:bg-[#F5F4F1] transition-colors"
                aria-label="Centro de notificaciones"
                title="Centro de alertas de Noah"
              >
                <BellRing className="w-5 h-5 text-[#421A05]" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#A43108] text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Tour trigger button */}
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
                leftIcon={<Compass className="w-3.5 h-3.5 text-[#CF6811]" />}
                onClick={startGuidedTour}
              >
                Recorrido demo
              </Button>

              {/* Owner Avatar & Name */}
              <div
                onClick={() => setActiveSection('settings')}
                className="flex items-center gap-2 p-1 pl-2 bg-[#F5F4F1] hover:bg-[#E7E5E0] rounded-xl border border-[#E7E5E0] cursor-pointer transition-colors"
                title={`${currentUser?.name || currentBusiness.ownerName} (${currentRole})`}
              >
                <div className="hidden md:flex flex-col text-right leading-tight">
                  <span className="text-xs font-bold text-[#111111] max-w-[120px] truncate">
                    {currentUser?.name || currentBusiness.ownerName}
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] capitalize">
                    {currentRole}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#EBD48F] border border-[#D59F3F] text-[#421A05] font-extrabold text-xs flex items-center justify-center shadow-2xs">
                  {(currentUser?.name || currentBusiness.ownerName).slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-[#6B6B6B] hover:text-[#A43108] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                title="Cerrar sesión y cambiar de negocio"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>

      {/* Floating Noah Orb Button (Always reachable in bottom-right corner) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex items-center gap-3 bg-white text-[#111111] pl-4 pr-5 py-2.5 rounded-full shadow-2xl border border-[#CF6811]/40 hover:scale-105 active:scale-95 transition-all group"
          aria-label="Abrir asistente Noah"
        >
          <NoahOrb state="idle" size="sm" showRipples={false} />
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-xs font-extrabold text-[#421A05] group-hover:text-[#CF6811]">
              Pregúntale a Noah
            </div>
            <div className="text-[10px] text-[#6B6B6B] flex items-center gap-1">
              <span>Voz y texto</span>
              <kbd className="px-1 py-0.2 bg-[#F5F4F1] border border-[#E7E5E0] rounded text-[9px] font-mono">Ctrl+K</kbd>
            </div>
          </div>
        </button>
      </div>

      {/* Slide-over SidePanel for Noah Assistant */}
      <SidePanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        title="Noah · Asistente de Negocio"
        subtitle="Consulta por voz o escribe cualquier pregunta"
        width="lg"
      >
        <NoahChat isFullScreen={false} />
      </SidePanel>

      {/* Guided Tour Banner */}
      <GuidedTour />

      {/* Floating Toasts */}
      <ToastContainer />
    </div>
  );
};
