import React, { Suspense } from 'react';
import { AppLayout } from './modules/layout/AppLayout';
import { LoginView } from './modules/auth/LoginView';
import { OnboardingWizard } from './modules/onboarding/OnboardingWizard';
import { getSectionComponent } from './modules/sections/sectionRegistry';
import { AppProvider, useApp } from './shared/context/AppContext';
import { ROLE_LABELS, ROLE_SCOPE, getMemberHome } from './shared/permissions/rolePermissions';
import { AccessDenied } from './shared/ui/AccessDenied';
import { SkeletonLoader } from './shared/ui/SkeletonLoader';

const CurrentSection: React.FC = () => {
  const { activeSection, canAccess, currentMember, activeModules, setActiveSection } = useApp();
  if (!activeSection) return null;

  const Section = canAccess(activeSection) ? getSectionComponent(activeSection) : null;
  if (!Section) {
    const home = getMemberHome(currentMember, activeModules);
    return (
      <AccessDenied
        roleLabel={ROLE_LABELS[currentMember.role]}
        roleScope={ROLE_SCOPE[currentMember.role]}
        onGoHome={home ? () => setActiveSection(home) : undefined}
      />
    );
  }

  return (
    <Suspense fallback={<SkeletonLoader rows={6} cols={4} />}>
      <Section />
    </Suspense>
  );
};

const MainContent: React.FC = () => {
  const { isAuthenticated, isCreatingAccount } = useApp();
  if (isCreatingAccount) return <OnboardingWizard />;
  if (!isAuthenticated) return <LoginView />;
  return (
    <AppLayout>
      <CurrentSection />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
