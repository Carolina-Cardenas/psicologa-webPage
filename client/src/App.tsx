import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "./components/componentsUi/Layout";
import ProtectedRoute from "./components/Home/ProtectedRoute";

import Index from "./Pages/Index";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import RecoverPassword from "./Pages/RecoverPassword";
import ResetPassword from "./Pages/ResetPassword";

import BookAppointment from "./Pages/BookAppointment";
import PatientDashboard from "./Pages/PatientDashboard";

import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminRecoverPassword from "./Pages/AdminRecoverPassword";
import AdminResetPassword from "./Pages/AdminResetPassword";

import NotFound from "./Pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />

          <Routes>
            {/* Rutas que utilizan el Layout principal */}
            <Route element={<Layout />}>
              {/* Públicas */}
              <Route
                path="/"
                element={<Index />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/registro"
                element={<Register />}
              />

              <Route
                path="/recuperar-password"
                element={<RecoverPassword />}
              />

              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />

              {/* Paciente */}
              <Route
                element={
                  <ProtectedRoute
                    allowedTypes={["client"]}
                  />
                }
              >
                <Route
                  path="/agendar"
                  element={<BookAppointment />}
                />

                <Route
                  path="/paciente"
                  element={<PatientDashboard />}
                />
              </Route>

              {/* Admin: rutas públicas */}
              <Route
                path="/admin/login"
                element={<AdminLogin />}
              />

              <Route
                path="/admin/recuperar-password"
                element={<AdminRecoverPassword />}
              />

              <Route
                path="/admin/reset-password"
                element={<AdminResetPassword />}
              />

              {/* Admin: rutas protegidas */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                      "psicologa",
                    ]}
                  />
                }
              >
                <Route
                  path="/admin"
                  element={<AdminDashboard />}
                />
              </Route>
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;