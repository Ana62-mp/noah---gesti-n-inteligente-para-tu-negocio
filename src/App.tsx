import React from 'react';
import { AppProvider, useApp } from './shared/context/AppContext';
import { AppLayout } from './modules/layout/AppLayout';
import { LoginView } from './modules/auth/LoginView';
import { OnboardingWizard } from './modules/onboarding/OnboardingWizard';
import { OwnerDashboard } from './modules/dashboard/OwnerDashboard';
import { NoahVoiceScenarios } from './modules/voice-scenarios/NoahVoiceScenarios';
import { SalesView } from './modules/sales/SalesView';
import { ExpensesView } from './modules/expenses/ExpensesView';
import { DishCostingView } from './modules/costing/DishCostingView';
import { MenuView } from './modules/menu/MenuView';
import { TablesView } from './modules/tables/TablesView';
import { KitchenView } from './modules/kitchen/KitchenView';
import { DeliveryView } from './modules/delivery/DeliveryView';
import { InventoryView } from './modules/inventory/InventoryView';
import { SuppliersView } from './modules/suppliers/SuppliersView';
import { ReportsView } from './modules/reports/ReportsView';
import { AlertsView } from './modules/alerts/AlertsView';
import { StoreModeView } from './modules/store/StoreModeView';
import { BarbershopView } from './modules/barbershop/BarbershopView';
import { MobilePreviewView } from './modules/mobile-preview/MobilePreviewView';
import { SettingsView } from './modules/settings/SettingsView';

const MainContent: React.FC = () => {
  const { isAuthenticated, isCreatingAccount, hasCompletedOnboarding, activeSection } = useApp();

  if (isCreatingAccount) {
    return <OnboardingWizard />;
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingWizard />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <OwnerDashboard />;
      case 'voice_scenarios':
        return <NoahVoiceScenarios />;
      case 'sales':
        return <SalesView />;
      case 'expenses':
      case 'cashflow':
        return <ExpensesView />;
      case 'costing':
        return <DishCostingView />;
      case 'menu':
        return <MenuView />;
      case 'tables':
        return <TablesView />;
      case 'kitchen':
        return <KitchenView />;
      case 'delivery':
        return <DeliveryView />;
      case 'inventory':
        return <InventoryView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'reports':
        return <ReportsView />;
      case 'alerts':
        return <AlertsView />;
      case 'store':
        return <StoreModeView />;
      case 'appointments':
      case 'services_catalog':
        return <BarbershopView />;
      case 'mobile_preview':
        return <MobilePreviewView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OwnerDashboard />;
    }
  };

  return <AppLayout>{renderSection()}</AppLayout>;
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
