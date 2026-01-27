import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/components/layout/Layout';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { SandboxBanner } from '@/shared/components/common/SandboxBanner';
import { Chatbot } from '@/shared/components/common/Chatbot';
import { TrainingProvider } from '@/features/planner/contexts/TrainingContext';
import { GlobalInviteModal } from '@/shared/components/common/GlobalInviteModal';
import { Toaster } from 'sonner';

// Lazy loaded components from features
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import('@/features/auth/pages/Login').then(m => ({ default: m.Login })));
const Onboarding = lazy(() => import('@/features/onboarding/pages/Onboarding').then(m => ({ default: m.Onboarding })));
const CoachMarketplace = lazy(() => import('@/features/marketplace/pages/CoachMarketplace').then(m => ({ default: m.CoachMarketplace })));
const CoachDashboard = lazy(() => import('@/features/dashboard/pages/CoachDashboard').then(m => ({ default: m.CoachDashboard })));
const AthleteDashboard = lazy(() => import('@/features/dashboard/pages/AthleteDashboard').then(m => ({ default: m.AthleteDashboard })));
const CoachCalendar = lazy(() => import('@/features/calendar/pages/CoachCalendar').then(m => ({ default: m.CoachCalendar })));
const AthleteCalendar = lazy(() => import('@/features/calendar/pages/AthleteCalendar').then(m => ({ default: m.AthleteCalendar })));
const AthletesList = lazy(() => import('@/features/dashboard/pages/AthletesList').then(m => ({ default: m.AthletesList })));
const AIPlanGenerator = lazy(() => import('@/features/planner/pages/AIPlanGenerator').then(m => ({ default: m.AIPlanGenerator })));
const ManualPlanBuilder = lazy(() => import('@/features/planner/pages/ManualPlanBuilder').then(m => ({ default: m.ManualPlanBuilder })));
const TrainingPlanner = lazy(() => import('@/features/planner/pages/TrainingPlanner').then(m => ({ default: m.TrainingPlanner })));
const Integrations = lazy(() => import('@/features/integrations/pages/Integrations').then(m => ({ default: m.Integrations })));
const LiveConnection = lazy(() => import('@/features/live/pages/LiveConnection').then(m => ({ default: m.LiveConnection })));
const Messages = lazy(() => import('@/features/messages/pages/Messages').then(m => ({ default: m.Messages })));
const CoachPricing = lazy(() => import('@/features/billing/pages/CoachPricing').then(m => ({ default: m.CoachPricing })));
const Invoices = lazy(() => import('@/features/billing/pages/Invoices').then(m => ({ default: m.Invoices })));
const AccountSettings = lazy(() => import('@/features/settings/pages/AccountSettings').then(m => ({ default: m.AccountSettings })));
const Appointments = lazy(() => import('@/features/appointments/pages/Appointments').then(m => ({ default: m.Appointments })));
const AthleteBilling = lazy(() => import('@/features/billing/pages/AthleteBilling').then(m => ({ default: m.AthleteBilling })));
const ResourcesLibrary = lazy(() => import('@/features/resources/pages/ResourcesLibrary').then(m => ({ default: m.ResourcesLibrary })));
const PortalSelection = lazy(() => import('@/features/auth/pages/PortalSelection').then(m => ({ default: m.PortalSelection })));
const PublicBooking = lazy(() => import('@/features/appointments/pages/PublicBooking').then(m => ({ default: m.PublicBooking })));

// Loading Fallback Component
const PageLoading = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
      Loading...
    </p>
  </div>
);

// Protected Layout Component
const ProtectedLayout = ({ user, logout }: { user: any; logout: () => void }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <SandboxBanner status={user.status} />
      <Layout
        onLogout={logout}
      >
        <Outlet />
      </Layout>
      <Chatbot />
    </div>
  );
};

const CoachProfileEditor = lazy(() => import('@/features/marketplace/pages/CoachProfileEditor').then(m => ({ default: m.CoachProfileEditor })));
const InvoicesPage = lazy(() => import('@/features/billing/pages/Invoices').then(m => ({ default: m.Invoices })));

function App() {
  const { currentUser, loading, init, logout, isDualRole } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <TrainingProvider>
        <GlobalInviteModal />
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Common Onboarding - Stable across auth states */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Public Routes */}
            {!currentUser ? (
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login onLogin={(e: string, p: string) => useAuthStore.getState().login(e, p)} />} />
                <Route path="/marketplace" element={<CoachMarketplace onSelectCoach={() => { }} onBackToLanding={() => { }} />} />
                <Route path="/book/:pseudo" element={<PublicBooking />} />
                <Route path="*" element={<Navigate to="/onboarding" replace />} />
              </>
            ) : (
              <>
                {/* Portal Selection for Dual Roles */}
                <Route path="/portal" element={<PortalSelection />} />

                {/* Protected Routes */}
                <Route element={<ProtectedLayout user={currentUser} logout={logout} />}>
                  {/* Dashboard Choice */}
                  <Route path="/dashboard" element={
                    currentUser.role === 'pro' ? <CoachDashboard /> : <AthleteDashboard />
                  } />

                  {/* Common Views */}
                  <Route path="/calendar" element={
                    currentUser.role === 'pro' ? <CoachCalendar /> : <AthleteCalendar />
                  } />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/settings" element={<AccountSettings />} />

                  {/* Pro Specific */}

                  {currentUser.role === 'pro' && (
                    <>
                      <Route path="/athletes" element={<AthletesList />} />
                      <Route path="/pricing" element={<CoachPricing />} />
                      <Route path="/invoices" element={<InvoicesPage />} />
                      <Route path="/my-profile" element={<CoachProfileEditor />} />
                    </>
                  )}

                  {/* Athlete / Feature Specific */}
                  <Route path="/planner" element={<TrainingPlanner />} />
                  <Route path="/ai-planner" element={<AIPlanGenerator />} />
                  <Route path="/manual-builder" element={<ManualPlanBuilder />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/live" element={<LiveConnection onClose={() => window.history.back()} />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/billing" element={<AthleteBilling />} />
                  <Route path="/resources" element={<ResourcesLibrary />} />

                  {/* Redirect dashboard by default */}
                  <Route path="/" element={<Navigate to={isDualRole ? "/portal" : "/dashboard"} replace />} />
                  <Route path="/login" element={<Navigate to={isDualRole ? "/portal" : "/dashboard"} replace />} />
                  <Route path="*" element={<Navigate to={isDualRole ? "/portal" : "/dashboard"} replace />} />
                </Route>
              </>
            )}
          </Routes>
        </Suspense>
      </TrainingProvider>
    </BrowserRouter>
  );
}

export default App;
