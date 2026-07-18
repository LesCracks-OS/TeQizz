import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./components/admin/AdminRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import OAuthCallback from "./pages/OAuthCallback";
import PlayPage from "./pages/dashboard/Play";
import QcmGameConfig from "./pages/dashboard/QcmGameConfig";
import QcmGamePlay from "./pages/dashboard/QcmGamePlay";
import QcmGameResults from "./pages/dashboard/QcmGameResults";
import SmatchGameConfig from "./pages/dashboard/SmatchGameConfig";
import SmatchGamePlay from "./pages/dashboard/SmatchGamePlay";
import PerformancePage from "./pages/dashboard/Performance";
import LeaderboardPage from "./pages/dashboard/Leaderboard";
import SettingsPage from "./pages/dashboard/Settings";
import AboutPage from "./pages/dashboard/About";
import ContributePage from "./pages/dashboard/Contribute";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminQcmCategories from "./pages/admin/qcm/AdminQcmCategories";
import AdminQcmTags from "./pages/admin/qcm/AdminQcmTags";
import AdminQcmQuestions from "./pages/admin/qcm/AdminQcmQuestions";
import AdminQcmQuestionEditor from "./pages/admin/qcm/AdminQcmQuestionEditor";
import AdminQcmContributions from "./pages/admin/qcm/AdminQcmContributions";
import AdminQcmDuplicates from "./pages/admin/qcm/AdminQcmDuplicates";
import AdminQcmSessions from "./pages/admin/qcm/AdminQcmSessions";
import AdminQcmConfig from "./pages/admin/qcm/AdminQcmConfig";
import AdminSmatchDecks from "./pages/admin/smatch/AdminSmatchDecks";
import AdminSmatchDeckEditor from "./pages/admin/smatch/AdminSmatchDeckEditor";
import AdminSmatchSessions from "./pages/admin/smatch/AdminSmatchSessions";
import AdminSmatchContributions from "./pages/admin/smatch/AdminSmatchContributions";
import AdminSmatchConfig from "./pages/admin/smatch/AdminSmatchConfig";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected Route wrapper — blocks unauthenticated users and redirects admins to their space
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.roleName === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>

            {/* Public layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />}></Route>
              <Route path="/about" element={<Home />}></Route>
              <Route path="/privacy" element={<Privacy />}></Route>
              <Route path="/terms" element={<Terms />}></Route>
            </Route>

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />

            {/* Protected dashboard routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Navigate to="/dashboard/play" replace />} />
              <Route path="/dashboard/play" element={<PlayPage />} />
              <Route path="/dashboard/play/qcm/config" element={<QcmGameConfig />} />
              <Route path="/dashboard/play/smatch/config" element={<SmatchGameConfig />} />
              <Route path="/dashboard/play/smatch/:sessionId" element={<SmatchGamePlay />} />
              <Route path="/dashboard/play/qcm/:sessionId" element={<QcmGamePlay />} />
              <Route path="/dashboard/play/qcm/:sessionId/results" element={<QcmGameResults />} />
              <Route path="/dashboard/performance" element={<PerformancePage />} />
              <Route path="/dashboard/leaderboard" element={<LeaderboardPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/about" element={<AboutPage />} />
              <Route path="/dashboard/contribute" element={<ContributePage />} />
            </Route>

            {/* Admin routes */}
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/qcm/categories" element={<AdminQcmCategories />} />
              <Route path="/admin/qcm/tags" element={<AdminQcmTags />} />
              <Route path="/admin/qcm/questions" element={<AdminQcmQuestions />} />
              <Route path="/admin/qcm/questions/new" element={<AdminQcmQuestionEditor />} />
              <Route path="/admin/qcm/questions/:id/edit" element={<AdminQcmQuestionEditor />} />
              <Route path="/admin/qcm/contributions" element={<AdminQcmContributions />} />
              <Route path="/admin/qcm/duplicates" element={<AdminQcmDuplicates />} />
              <Route path="/admin/qcm/sessions" element={<AdminQcmSessions />} />
              <Route path="/admin/qcm/config" element={<AdminQcmConfig />} />
              <Route path="/admin/smatch/decks" element={<AdminSmatchDecks />} />
              <Route path="/admin/smatch/decks/new" element={<AdminSmatchDeckEditor />} />
              <Route path="/admin/smatch/decks/:id/edit" element={<AdminSmatchDeckEditor />} />
              <Route path="/admin/smatch/contributions" element={<AdminSmatchContributions />} />
              <Route path="/admin/smatch/sessions" element={<AdminSmatchSessions />} />
              <Route path="/admin/smatch/config" element={<AdminSmatchConfig />} />
            </Route>

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
