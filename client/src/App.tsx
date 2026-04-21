import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";


import Layout from "./components/componentsUi/Layout";
import Index from "./Pages/Index";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import RecoverPassword from "./Pages/RecoverPassword";
import BookAppointment from "./Pages/BookAppointment";
import PatientDashboard from "./Pages/PatientDashboard";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import NotFound from "./Pages/NotFound";

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
              <Route path="/recuperar-password" element={<RecoverPassword />} />
              <Route path="/agendar" element={<BookAppointment />} />
              <Route path="/paciente" element={<PatientDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>

);

export default App;
