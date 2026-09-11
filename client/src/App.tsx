import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "./components/componentsUi/Layout";
import ProtectedRoute from "./components/Home/ProtectedRoute";

import Index from "./Pages/Index";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import RecoverPassword from "./Pages/RecoverPassword";
import BookAppointment from "./Pages/BookAppointment";
import PatientDashboard from "./Pages/PatientDashboard";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import NotFound from "./Pages/NotFound";
import ResetPassword from "./Pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />

        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route
              path="/recuperar-password"
              element={<RecoverPassword />}
            />

<Route
  element={<ProtectedRoute allowedTypes={["client"]} />}
>
  <Route path="/agendar" element={<BookAppointment />} />
  <Route path="/paciente" element={<PatientDashboard />} />
</Route>

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              element={<ProtectedRoute allowedRoles={["admin", "psicologa"]} />}
            >
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
          <Route
           path="/reset-password"
            element={<ResetPassword />}
            />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;