import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import './App.css';
import { AuthEnums } from '@lib/shared';
import { useEffect } from 'react';

// Analytics
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import NotFoundPage from './pages/not-found/NotFound';
import AuthPage from './pages/auth/Auth';
import HealthPage from './pages/health/Health';
import AppLayout from './components/layout/app-layout/AppLayout';
import LoadingPage from './pages/loading/Loading';

// pages
import DashboardPage from './pages/dashboard/Dashboard';
import SettingsPage from './pages/settings/Settings';
import TasksPage from './pages/tasks/Tasks';
import ProjectsPage from './pages/projects/Projects';
import TaskDetailPage from './pages/tasks/task/Task';
import ProjectDetailPage from './pages/projects/project/Project';
import DocumentsPage from './pages/documents/Documents';
import ActivitiesPage from './pages/activities/Activities';

// import ProjectDetailPage from './pages/projects/[projectId]/Project';

const AuthLoader = () => {
  const { data, status: queryStatus } = useUser();
  const { setStatus, setUser } = useAuthStore();

  useEffect(() => {
    if (queryStatus === 'success') {
      setUser(data);
      setStatus(AuthEnums.LoginStatus.Authenticated);
    }

    if (queryStatus === 'error') {
      setUser(null);
      setStatus(AuthEnums.LoginStatus.Unauthenticated);
    }
  }, [queryStatus, data, setUser, setStatus]);

  // if (queryStatus === 'pending') {
  //   return <LoadingPage message="Autenticando sessão..." />;
  // }

  return <Outlet />;
};

const ProtectedRoute = () => {
  const status = useAuthStore((state) => state.status);

  if (status === AuthEnums.LoginStatus.Unauthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <>
      <Routes>
        <Route element={<AuthLoader />}>
          {/* Rotas Públicas */}
          <Route path="/health" element={<HealthPage />} />
          <Route path="/load" element={<LoadingPage />} />

          <Route path="/auth" element={<AuthPage />} />

          <Route path="/not-found" element={<NotFoundPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Rotas pessoal */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
              <Route path="/documents" element={<DocumentsPage />} />

              {/* Rotas de squad */}
              <Route path="/squad/projects" element={<ProjectsPage />} />
              <Route
                path="/squad/projects/:projectId"
                element={<ProjectDetailPage />}
              />

              {/* Rotas de admin */}

              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Redirecionamento da raiz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Rota 404 (Catch all) */}
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>
      </Routes>

      <SpeedInsights />
      <Analytics />
    </>
  );
}

export default App;
