import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getBusinessProfile } from '../business/businessProfiles';
import { REQUIRED_MODULES } from '../business/moduleCatalog';
import { TourStep } from '../business/profileTypes';
import {
  ROLE_LABELS,
  buildMember,
  getMemberHome,
  getMemberSections,
  memberCanAccess,
} from '../permissions/rolePermissions';
import { aiService } from '../services/aiService';
import { apiService } from '../services/apiService';
import { fetchGeminiHealth } from '../services/geminiClient';
import { BUSINESS_OPTIONS } from '../services/mockData';
import { BusinessConfig, BusinessType, ModuleId, TeamMember, UserRole } from '../types';
import {
  clearBusinessCustomization,
  findBusiness,
  loadModules,
  loadTeam,
  saveCustomBusiness,
  saveModules,
  saveTeam,
} from './businessStorage';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface NewBusinessInput {
  type: BusinessType;
  name: string;
  ownerName: string;
  city: string;
  ruc: string;
  employeeCount: number;
  modules: ModuleId[];
}

const TOAST_DURATION_MS = 4500;

const sectionFromHash = () => window.location.hash.replace('#', '').split('?')[0];

const readStoredBusiness = (): BusinessConfig => findBusiness(localStorage.getItem('noah_business_id')) ?? BUSINESS_OPTIONS[0];

const isTourSectionActive = (section: string, modules: readonly ModuleId[]) =>
  section === 'settings' || modules.includes(section as ModuleId);

const useAppState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('noah_authenticated') === 'true');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [currentBusiness, setBusinessState] = useState<BusinessConfig>(readStoredBusiness);
  const [team, setTeam] = useState<TeamMember[]>(() => loadTeam(readStoredBusiness()));
  const [activeModules, setActiveModules] = useState<ModuleId[]>(() => loadModules(readStoredBusiness()));
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(() => localStorage.getItem('noah_member_id'));
  const [activeSection, setActiveSectionState] = useState<string>(sectionFromHash);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [guidedTourStep, setGuidedTourStep] = useState<number | null>(null);
  const [isGeminiMode, setIsGeminiModeState] = useState(false);
  const [isGeminiAvailable, setIsGeminiAvailable] = useState(false);
  const [simulateError, setSimulateErrorState] = useState(false);
  const [simulateEmpty, setSimulateEmptyState] = useState(false);

  apiService.setActiveBusiness(currentBusiness.type);

  const currentMember = team.find(({ id }) => id === currentMemberId) ?? team[0];
  const currentRole: UserRole = currentMember.role;

  const accessibleSections = useMemo(
    () => getMemberSections(currentMember).filter((section) => memberCanAccess(currentMember, activeModules, section)),
    [currentMember, activeModules]
  );
  const canAccess = (section: string) => accessibleSections.includes(section);

  const setActiveSection = (section: string) => {
    setActiveSectionState(section);
    window.location.hash = section;
  };

  useEffect(() => {
    fetchGeminiHealth().then(setIsGeminiAvailable);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setActiveSectionState(sectionFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!activeSection && isAuthenticated) setActiveSection(getMemberHome(currentMember, activeModules) ?? 'dashboard');
  }, [activeSection, isAuthenticated]);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  const showToast = (message: string, type: ToastItem['type'] = 'success', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => removeToast(id), TOAST_DURATION_MS);
  };

  const openBusiness = (business: BusinessConfig, role: UserRole = 'owner', userName?: string) => {
    const nextTeam = loadTeam(business);
    const nextModules = loadModules(business);
    const member =
      nextTeam.find((item) => item.role === role && (!userName || item.name === userName)) ??
      nextTeam.find((item) => item.role === role) ??
      nextTeam[0];

    apiService.setActiveBusiness(business.type);
    setBusinessState(business);
    setTeam(nextTeam);
    setActiveModules(nextModules);
    setCurrentMemberId(member.id);
    setIsAuthenticated(true);
    setIsCreatingAccount(false);
    localStorage.setItem('noah_business_id', business.id);
    localStorage.setItem('noah_member_id', member.id);
    localStorage.setItem('noah_authenticated', 'true');
    setActiveSection(getMemberHome(member, nextModules) ?? 'dashboard');
    return member;
  };

  const loginWithDemoAccount = (businessId: string, role: UserRole = 'owner', userName?: string) => {
    const member = openBusiness(findBusiness(businessId) ?? BUSINESS_OPTIONS[0], role, userName);
    showToast(`Bienvenido/a, ${member.name}`, 'success');
  };

  const loginWithCredentials = (email: string, _password?: string): boolean => {
    if (!email.includes('@')) {
      showToast('Ingresa un correo electrónico válido', 'error');
      return false;
    }
    const lower = email.toLowerCase();
    if (['rosa', 'tienda'].some((word) => lower.includes(word))) loginWithDemoAccount('store-dona-rosa');
    else if (['barber', 'mateo'].some((word) => lower.includes(word))) loginWithDemoAccount('barber-kings');
    else if (['ana', 'mesero', 'mesera'].some((word) => lower.includes(word))) loginWithDemoAccount('rest-sazon', 'waiter');
    else if (['wilson', 'cocina'].some((word) => lower.includes(word))) loginWithDemoAccount('rest-sazon', 'kitchen');
    else loginWithDemoAccount('rest-sazon');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsCreatingAccount(false);
    setGuidedTourStep(null);
    setIsAssistantOpen(false);
    localStorage.removeItem('noah_authenticated');
    localStorage.removeItem('noah_member_id');
    showToast('Sesión cerrada. Elige un negocio o crea el tuyo.', 'info');
  };

  const createBusiness = ({ type, name, ownerName, city, ruc, employeeCount, modules }: NewBusinessInput) => {
    const business: BusinessConfig = {
      id: `custom-${Date.now()}`,
      type,
      name,
      ownerName,
      city,
      ruc,
      employeeCount,
      country: 'Ecuador',
      currency: 'USD',
      currencySymbol: '$',
      vatRate: 0.15,
    };
    saveCustomBusiness(business);
    saveModules(business.id, modules);
    openBusiness(business);
    showToast(`¡Listo, ${ownerName.split(' ')[0]}! Tu NOAH está armado.`, 'success');
  };

  const toggleModule = (id: ModuleId) => {
    if (REQUIRED_MODULES.includes(id)) return;
    const next = activeModules.includes(id) ? activeModules.filter((module) => module !== id) : [...activeModules, id];
    setActiveModules(saveModules(currentBusiness.id, next));
  };

  const persistTeam = (next: TeamMember[]) => {
    setTeam(next);
    saveTeam(currentBusiness.id, next);
  };

  const viewAsMember = (memberId: string) => {
    const member = team.find(({ id }) => id === memberId);
    if (!member) return;
    setCurrentMemberId(member.id);
    localStorage.setItem('noah_member_id', member.id);
    setIsAssistantOpen(false);
    setActiveSection(getMemberHome(member, activeModules) ?? 'dashboard');
    showToast(`Vista demo: ${member.name} (${ROLE_LABELS[member.role]})`, 'info');
  };

  const setMemberAccess = (memberId: string, section: string, isAllowed: boolean) =>
    persistTeam(
      team.map((member) =>
        member.id !== memberId
          ? member
          : { ...member, sections: isAllowed ? [...new Set([...member.sections, section])] : member.sections.filter((item) => item !== section) }
      )
    );

  const addMember = (name: string, role: UserRole) => persistTeam([...team, buildMember(`m-${Date.now()}`, name, role)]);

  const updateMember = (memberId: string, changes: Partial<Pick<TeamMember, 'name' | 'role'>>) =>
    persistTeam(team.map((member) => (member.id === memberId ? { ...member, ...changes } : member)));

  const removeMember = (memberId: string) => persistTeam(team.filter(({ id }) => id !== memberId));

  const setIsGeminiMode = (enabled: boolean) => {
    if (enabled && !isGeminiAvailable) {
      showToast('El servidor no tiene GEMINI_API_KEY configurada. Se mantiene el modo demo.', 'warning');
      return;
    }
    setIsGeminiModeState(enabled);
    aiService.setGeminiMode(enabled);
    showToast(enabled ? 'IA real activada: responde en vivo con datos de ejemplo' : 'Modo demo: respuestas guionizadas', 'info');
  };

  const setSimulateError = (value: boolean) => {
    setSimulateErrorState(value);
    apiService.setSimulateError(value);
    showToast(value ? 'Simulación de error activada' : 'Simulación de error desactivada', value ? 'warning' : 'info');
  };

  const setSimulateEmpty = (value: boolean) => {
    setSimulateEmptyState(value);
    apiService.setSimulateEmpty(value);
    showToast(value ? 'Simulación de estado vacío activada' : 'Datos normales restaurados', 'info');
  };

  const resetAllData = () => {
    apiService.resetData();
    clearBusinessCustomization(currentBusiness.id);
    setTeam(loadTeam(currentBusiness));
    setActiveModules(loadModules(currentBusiness));
    showToast('Datos, módulos y permisos restablecidos', 'success');
  };

  const tourSteps: TourStep[] = getBusinessProfile(currentBusiness.type).tour.filter(
    ({ section, opensAssistant }) => opensAssistant || (section && isTourSectionActive(section, activeModules))
  );

  const goToTourStep = (index: number) => {
    const step = tourSteps[index];
    setGuidedTourStep(index);
    setIsAssistantOpen(Boolean(step.opensAssistant));
    if (step.section) setActiveSection(step.section);
  };

  const startGuidedTour = () => {
    const owner = team.find(({ role }) => role === 'owner') ?? team[0];
    setCurrentMemberId(owner.id);
    localStorage.setItem('noah_member_id', owner.id);
    goToTourStep(0);
  };

  const nextTourStep = () => {
    if (guidedTourStep === null) return;
    if (guidedTourStep + 1 >= tourSteps.length) {
      setGuidedTourStep(null);
      setIsAssistantOpen(false);
      showToast('Recorrido completado', 'success');
      return;
    }
    goToTourStep(guidedTourStep + 1);
  };

  const prevTourStep = () => {
    if (guidedTourStep) goToTourStep(guidedTourStep - 1);
  };

  return {
    isAuthenticated,
    loginWithDemoAccount,
    loginWithCredentials,
    logout,
    isCreatingAccount,
    startAccountCreation: () => setIsCreatingAccount(true),
    cancelAccountCreation: () => setIsCreatingAccount(false),
    createBusiness,
    currentBusiness,
    team,
    currentMember,
    currentRole,
    viewAsMember,
    setMemberAccess,
    addMember,
    removeMember,
    updateMember,
    activeModules,
    toggleModule,
    accessibleSections,
    canAccess,
    activeSection,
    setActiveSection,
    isAssistantOpen,
    setIsAssistantOpen,
    pendingQuestion,
    clearPendingQuestion: () => setPendingQuestion(null),
    askNoah: (question?: string) => {
      setPendingQuestion(question ?? null);
      setIsAssistantOpen(true);
    },
    unreadNotificationsCount,
    setUnreadNotificationsCount,
    toasts,
    showToast,
    removeToast,
    tourSteps,
    guidedTourStep,
    startGuidedTour,
    nextTourStep,
    prevTourStep,
    closeTour: () => setGuidedTourStep(null),
    isGeminiMode,
    isGeminiAvailable,
    setIsGeminiMode,
    simulateError,
    setSimulateError,
    simulateEmpty,
    setSimulateEmpty,
    resetAllData,
  };
};

type AppContextType = ReturnType<typeof useAppState>;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppContext.Provider value={useAppState()}>{children}</AppContext.Provider>
);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
