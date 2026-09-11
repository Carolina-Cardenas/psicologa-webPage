import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Eye, EyeOff, LogIn } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/client/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Correo electrónico o contraseña incorrectos."
        );
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.client.id,
          nombre: data.client.nombre,
          apellidos: data.client.apellidos,
          email: data.client.email,
          type: "client",
        })
      );

      navigate("/agendar", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al iniciar sesión.";

      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background-alt px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="rounded-2xl border bg-card p-12 shadow-lg">
          {/* Encabezado */}
          <div className="mb-10 text-center">
            <h1 className="font-heading text-4xl font-bold text-foreground">
              Bienvenido/a de vuelta
            </h1>

            <p className="mt-3 text-lg text-foreground/75">
              Me alegra verte por aquí. Ingresa a tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Correo electrónico */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-base font-medium text-foreground"
              >
                Correo electrónico
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-14 text-base"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-base font-medium text-foreground"
                >
                  Contraseña
                </Label>

                <Link
                  to="/recuperar-password"
                  className="text-sm font-medium text-secondary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-14 pr-12 text-base"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/60 transition-colors hover:text-foreground"
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón */}
            <Button
              type="submit"
              className="h-14 w-full text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Ingresando...
                </span>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Ingresar
                </>
              )}
            </Button>
          </form>

          {/* Registro */}
          <p className="mt-10 text-center text-base text-foreground/75">
            ¿Primera vez aquí?{" "}
            <Link
              to="/registro"
              className="font-medium text-secondary hover:underline"
            >
              Regístrate como paciente nuevo
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;