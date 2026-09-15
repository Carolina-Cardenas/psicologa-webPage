import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: Array<"admin" | "psicologa">;
  allowedTypes?: Array<"client">;
}

interface StoredUser {
  id?: string;
  type?: "client" | "admin";
  role?: "admin" | "psicologa";
  nombre?: string;
  apellidos?: string;
  name?: string;
  email?: string;
}

const ProtectedRoute = ({
  allowedRoles,
  allowedTypes,
}: ProtectedRouteProps) => {
  const isAdminRoute = Boolean(
    allowedRoles && allowedRoles.length > 0
  );

  const isClientRoute = Boolean(
    allowedTypes?.includes("client")
  );

  let token: string | null = null;
  let userString: string | null = null;
  let redirectPath = "/login";

  if (isAdminRoute) {
    token = localStorage.getItem("adminToken");
    userString = localStorage.getItem("adminUser");
    redirectPath = "/admin/login";
  }

  if (isClientRoute) {
    token = localStorage.getItem("clientToken");
    userString = localStorage.getItem("clientUser");
    redirectPath = "/login";
  }

  if (!token || !userString) {
    return <Navigate to={redirectPath} replace />;
  }

  let user: StoredUser;

  try {
    user = JSON.parse(userString) as StoredUser;
  } catch {
    if (isAdminRoute) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      return <Navigate to="/admin/login" replace />;
    }

    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");

    return <Navigate to="/login" replace />;
  }

  if (
    allowedTypes &&
    (!user.type || !allowedTypes.includes(user.type as "client"))
  ) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    (!user.role || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;