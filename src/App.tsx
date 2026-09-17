
import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UltraOptimizedQueryProvider } from '@/providers/UltraOptimizedQueryProvider';
import { OptimizedAuthProvider } from '@/contexts/OptimizedAuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmployeeLayout from '@/components/EmployeeLayout';
import UnifiedTimeRecordPage from '@/pages/UnifiedTimeRecordPage';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

// Telas secundárias carregadas sob demanda: o registro de ponto é o caminho
// crítico e não deve esperar por gráficos, PDF ou leitor de QR.
const EmployeeMonthlySummary = lazy(() => import('@/components/EmployeeMonthlySummary'));
const EmployeeDetailedReport = lazy(() => import('@/components/EmployeeDetailedReport'));
const IncompleteRecordsProfile = lazy(() => import('@/components/IncompleteRecordsProfile'));
const AdjustPreviousDays = lazy(() => import('@/components/AdjustPreviousDays'));
const VacationRequest = lazy(() => import('@/components/VacationRequest'));
const EmployeeDocuments = lazy(() => import('@/components/EmployeeDocuments'));
const SalaryAdvanceRequest = lazy(() => import('@/components/SalaryAdvanceRequest'));
const EmployeeProfile = lazy(() => import('@/components/EmployeeProfile'));
const EmployeeTools = lazy(() => import('@/components/EmployeeTools'));

const RouteFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
  </div>
);

function App() {
  return (
    <UltraOptimizedQueryProvider>
      <CurrencyProvider>
        <OptimizedAuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <UnifiedTimeRecordPage />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/employee" element={<Navigate to="/" replace />} />

                {/* Rotas reais do menu */}
                <Route
                  path="/monthly-summary"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <EmployeeMonthlySummary selectedMonth={new Date()} />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/detailed-report"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <EmployeeDetailedReport selectedMonth={new Date()} onBack={() => {}} />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incomplete-records"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <IncompleteRecordsProfile />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/adjust-previous-days"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <AdjustPreviousDays />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vacation-request"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <VacationRequest />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <EmployeeDocuments />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <EmployeeTools />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salary-advance"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <SalaryAdvanceRequest />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <EmployeeLayout>
                        <EmployeeProfile />
                      </EmployeeLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              </Suspense>
            </div>
          </Router>
          <Toaster />
          
        </OptimizedAuthProvider>
      </CurrencyProvider>
    </UltraOptimizedQueryProvider>
  );
}

export default App;
