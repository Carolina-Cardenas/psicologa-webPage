import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // 1. Si no hay token, al login de cabeza
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si definimos roles específicos (como admin) y el usuario no lo tiene, lo rebota
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  // Si todo está correcto, renderiza la ruta hija
  return <Outlet />;
};

export default ProtectedRoute;