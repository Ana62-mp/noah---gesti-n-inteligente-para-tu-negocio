import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessConfig, UserRole, ModuleId } from '../types';
import { BUSINESS_OPTIONS, INITIAL_MODULES } from '../services/mockData';
import { apiService } from '../services/apiService';
import { aiService } from '../services/aiService';
import { fetchGeminiHealth } from '../services/geminiClient';
import { ROLE_LABELS, getDisplayName, getRoleHomeSection, getRolesForBusiness } from '../permissions/rolePermissions';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  loginWithDemoAccount: (businessId: string, role?: UserRole, userName?: string, email?: string) => void;
  loginWithCredentials: (email: string, password: string) => boolean;
  logout: () => void;
  startAccountCreation: () => void;
  currentBusiness: BusinessConfig;
  setCurrentBusiness: (b: BusinessConfig) => void;
  currentRole: UserRole;
  setCurrentRole: (r: UserRole) => void;
  activeModules: ModuleId[];
  toggleModule: (id: ModuleId) => void;
  isModuleEnabled: (id: ModuleId) => boolean;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isMobileMockupOpen: boolean;
  setIsMobileMockupOpen: (open: boolean) => void;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem['type'], title?: string) => void;
  removeToast: (id: string) => void;
  guidedTourStep: number | null;
  startGuidedTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  closeTour: () => void;
  isGeminiMode: boolean;
  isGeminiAvailable: boolean;
  setIsGeminiMode: (enabled: boolean) => void;
  simulateError: boolean;
  setSimulateError: (err: boolean) => void;
  simulateEmpty: boolean;
  setSimulateEmpty: (empty: boolean) => void;
  resetAllData: () => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (done: boolean) => void;
  isCreatingAccount: boolean;
  setIsCreatingAccount: (creating: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Current User
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('noah_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('noah_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  // Read persisted or initial states
  const [currentBusiness, setCurrentBusinessState] = useState<BusinessConfig>(() => {
    const saved = localStorage.getItem('noah_business_id');
    const found = BUSINESS_OPTIONS.find((b) => b.id === saved);
    return found || BUSINESS_OPTIONS[0];
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('noah_role');
    return (saved as UserRole) || 'owner';
  });

  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean>(() => {
    return localStorage.getItem('noah_onboarding_completed') === 'true';
  });

  const [activeModules, setActiveModules] = useState<ModuleId[]>(() => {
    try {
      const saved = localStorage.getItem('noah_modules');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MODULES.filter((m) => m.enabled).map((m) => m.id);
  });

  // URL hash sync for section
  const [activeSection, setActiveSectionState] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash.replace('#', '') || 'dashboard';
    }
    return getRoleHomeSection(currentRole, currentBusiness.type);
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isMobileMockupOpen, setIsMobileMockupOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(4);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [guidedTourStep, setGuidedTourStep] = useState<number | null>(null);
  const [isGeminiMode, setIsGeminiModeState] = useState(false);
  const [isGeminiAvailable, setIsGeminiAvailable] = useState(false);

  useEffect(() => {
    fetchGeminiHealth().then(setIsGeminiAvailable);
  }, []);
  const [simulateError, setSimulateErrorState] = useState(false);
  const [simulateEmpty, setSimulateEmptyState] = useState(false);

  // Sync section with URL hash
  const setActiveSection = (sec: string) => {
    setActiveSectionState(sec);
    if (typeof window !== 'undefined') {
      window.location.hash = sec;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== activeSection) {
        setActiveSectionState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeSection]);

  const setCurrentBusiness = (b: BusinessConfig) => {
    setCurrentBusinessState(b);
    localStorage.setItem('noah_business_id', b.id);
    const role = getRolesForBusiness(b.type).includes(currentRole) ? currentRole : 'owner';
    if (role !== currentRole) {
      setCurrentRoleState(role);
      localStorage.setItem('noah_role', role);
    }
    setActiveSection(getRoleHomeSection(role, b.type));
    showToast(`Cambiado a ${b.name} (${b.city})`, 'info');
  };

  const setCurrentRole = (r: UserRole) => {
    setCurrentRoleState(r);
    localStorage.setItem('noah_role', r);
    showToast(`Vista cambiada a: ${ROLE_LABELS[r]}`, 'info');
    setActiveSection(getRoleHomeSection(r, currentBusiness.type));
  };

  const loginWithDemoAccount = (
    businessId: string,
    role: UserRole = 'owner',
    userName?: string,
    email?: string
  ) => {
    const business = BUSINESS_OPTIONS.find((b) => b.id === businessId) || BUSINESS_OPTIONS[0];
    const resolvedName = userName || getDisplayName(role, business, null);
    const resolvedEmail =
      email || `${resolvedName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@noah-negocios.ec`;

    const profile: UserProfile = {
      name: resolvedName,
      email: resolvedEmail,
      role,
      businessId: business.id,
    };

    setCurrentBusinessState(business);
    localStorage.setItem('noah_business_id', business.id);
    setCurrentRoleState(role);
    localStorage.setItem('noah_role', role);
    setCurrentUser(profile);
    localStorage.setItem('noah_current_user', JSON.stringify(profile));
    setIsAuthenticated(true);
    localStorage.setItem('noah_authenticated', 'true');
    setIsCreatingAccount(false);
    setHasCompletedOnboardingState(true);
    localStorage.setItem('noah_onboarding_completed', 'true');

    setActiveSection(getRoleHomeSection(role, business.type));

    showToast(`¡Sesión iniciada con éxito! Bienvenido/a ${resolvedName}`, 'success');
  };

  const loginWithCredentials = (email: string, _pass: string): boolean => {
    if (!email || !email.includes('@')) {
      showToast('Por favor ingresa un correo electrónico válido', 'error');
      return false;
    }

    const lower = email.toLowerCase();
    let selectedBusiness = BUSINESS_OPTIONS[0];
    let selectedRole: UserRole = 'owner';
    let selectedName = 'Carlos Mendoza';

    if (lower.includes('rosa') || lower.includes('tienda') || lower.includes('abarrotes')) {
      selectedBusiness = BUSINESS_OPTIONS[1];
      selectedName = 'Rosa Pillajo';
    } else if (lower.includes('barber') || lower.includes('mateo') || lower.includes('corte')) {
      selectedBusiness = BUSINESS_OPTIONS[2];
      selectedName = 'Mateo Andrade';
    } else if (lower.includes('ana') || lower.includes('mesero') || lower.includes('mesera')) {
      selectedRole = 'waiter';
      selectedName = 'Ana Martínez';
    } else if (lower.includes('wilson') || lower.includes('cocina') || lower.includes('chef')) {
      selectedRole = 'kitchen';
      selectedName = 'Wilson Quishpe';
    }

    const profile: UserProfile = {
      name: selectedName,
      email,
      role: selectedRole,
      businessId: selectedBusiness.id,
    };

    setCurrentBusinessState(selectedBusiness);
    localStorage.setItem('noah_business_id', selectedBusiness.id);
    setCurrentRoleState(selectedRole);
    localStorage.setItem('noah_role', selectedRole);
    setCurrentUser(profile);
    localStorage.setItem('noah_current_user', JSON.stringify(profile));
    setIsAuthenticated(true);
    localStorage.setItem('noah_authenticated', 'true');
    setIsCreatingAccount(false);
    setHasCompletedOnboardingState(true);
    localStorage.setItem('noah_onboarding_completed', 'true');

    setActiveSection(getRoleHomeSection(selectedRole, selectedBusiness.type));

    showToast(`¡Bienvenido de vuelta, ${selectedName}!`, 'success');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('noah_authenticated');
    setCurrentUser(null);
    localStorage.removeItem('noah_current_user');
    setIsCreatingAccount(false);
    showToast('Sesión cerrada. Selecciona un negocio o crea tu cuenta.', 'info');
  };

  const startAccountCreation = () => {
    setIsCreatingAccount(true);
    setHasCompletedOnboardingState(false);
  };

  const setHasCompletedOnboarding = (done: boolean) => {
    setHasCompletedOnboardingState(done);
    localStorage.setItem('noah_onboarding_completed', done ? 'true' : 'false');
    if (done) {
      setIsCreatingAccount(false);
      setIsAuthenticated(true);
      localStorage.setItem('noah_authenticated', 'true');
    }
  };

  const toggleModule = (id: ModuleId) => {
    setActiveModules((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
      localStorage.setItem('noah_modules', JSON.stringify(next));
      return next;
    });
  };

  const isModuleEnabled = (id: ModuleId) => {
    return activeModules.includes(id);
  };

  const showToast = (message: string, type: ToastItem['type'] = 'success', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setIsGeminiMode = (enabled: boolean) => {
    if (enabled && !isGeminiAvailable) {
      showToast('El servidor no tiene GEMINI_API_KEY configurada. Se mantiene el modo demo.', 'warning');
      return;
    }
    setIsGeminiModeState(enabled);
    aiService.setGeminiMode(enabled);
    showToast(
      enabled
        ? 'Modo IA real activado: las respuestas se generan en vivo con datos de ejemplo'
        : 'Modo Demo activado (Respuestas guionizadas inmediatas)',
      'info'
    );
  };

  const setSimulateError = (val: boolean) => {
    setSimulateErrorState(val);
    apiService.setSimulateError(val);
    showToast(
      val
        ? 'Simulación de error de red activada para pruebas de interfaz'
        : 'Simulación de error desactivada',
      val ? 'warning' : 'info'
    );
  };

  const setSimulateEmpty = (val: boolean) => {
    setSimulateEmptyState(val);
    apiService.setSimulateEmpty(val);
    showToast(
      val
        ? 'Simulación de estado vacío activada'
        : 'Datos normales restaurados',
      'info'
    );
  };

  const resetAllData = () => {
    apiService.resetData();
    showToast('Base de datos mock restaurada a su estado original', 'success');
  };

  // Guided Tour
  const startGuidedTour = () => {
    setCurrentRoleState('owner');
    localStorage.setItem('noah_role', 'owner');
    setCurrentBusinessState(BUSINESS_OPTIONS[0]);
    localStorage.setItem('noah_business_id', BUSINESS_OPTIONS[0].id);
    setGuidedTourStep(1);
    setActiveSection('dashboard');
  };

  const nextTourStep = () => {
    if (guidedTourStep === null) return;
    const next = guidedTourStep + 1;
    if (next > 9) {
      setGuidedTourStep(null);
      showToast('¡Has completado el recorrido guiado de NOAH!', 'success');
      return;
    }
    setGuidedTourStep(next);

    // Tour routing map
    switch (next) {
      case 1:
        setActiveSection('dashboard');
        break;
      case 2:
        setIsAssistantOpen(true);
        break;
      case 3:
        setIsAssistantOpen(false);
        setActiveSection('costing');
        break;
      case 4:
        setActiveSection('inventory');
        break;
      case 5:
        setActiveSection('voice_scenarios');
        break;
      case 6:
        setActiveSection('delivery');
        break;
      case 7:
        setCurrentBusiness(BUSINESS_OPTIONS[1]); // Tienda
        setActiveSection('store');
        break;
      case 8:
        setCurrentBusiness(BUSINESS_OPTIONS[2]); // Barbería
        setActiveSection('appointments');
        break;
      case 9:
        setCurrentBusiness(BUSINESS_OPTIONS[0]); // Back to restaurant
        setActiveSection('settings');
        break;
    }
  };

  const prevTourStep = () => {
    if (guidedTourStep && guidedTourStep > 1) {
      setGuidedTourStep(guidedTourStep - 1);
    }
  };

  const closeTour = () => {
    setGuidedTourStep(null);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        loginWithDemoAccount,
        loginWithCredentials,
        logout,
        startAccountCreation,
        isCreatingAccount,
        setIsCreatingAccount,
        currentBusiness,
        setCurrentBusiness,
        currentRole,
        setCurrentRole,
        activeModules,
        toggleModule,
        isModuleEnabled,
        activeSection,
        setActiveSection,
        isAssistantOpen,
        setIsAssistantOpen,
        isMobileMockupOpen,
        setIsMobileMockupOpen,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        toasts,
        showToast,
        removeToast,
        guidedTourStep,
        startGuidedTour,
        nextTourStep,
        prevTourStep,
        closeTour,
        isGeminiMode,
        isGeminiAvailable,
        setIsGeminiMode,
        simulateError,
        setSimulateError,
        simulateEmpty,
        setSimulateEmpty,
        resetAllData,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
