import  { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import { motion } from "framer-motion";

const AdminResetPassword = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!token) {
      setError(
        "El enlace de recuperación no contiene un token válido."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/admin/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "No fue posible restablecer la contraseña."
        );
      }

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible restablecer la contraseña.";

      setError(message);
    } finally {
      setLoading(false);
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
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                <LockKeyhole className="h-8 w-8 text-secondary" />
              </div>

              <h1 className="font-heading text-4xl font-bold text-foreground">
                Contraseña actualizada
              </h1>

              <p className="mt-3 text-lg text-foreground/75">
                La contraseña del panel administrativo fue
                actualizada correctamente.
              </p>

              <Button asChild className="mt-8 h-14 px-8 text-base">
                <Link to="/admin/login">
                  Ir al inicio de sesión
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                  <LockKeyhole className="h-8 w-8 text-secondary" />
                </div>

                <h1 className="font-heading text-4xl font-bold text-foreground">
                  Crear nueva contraseña
                </h1>

                <p className="mt-3 text-lg text-foreground/75">
                  Ingresa una nueva contraseña para el panel
                  administrativo.
                </p>
              </div>

              {!token && (
                <div
                  className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  role="alert"
                >
                  El enlace de recuperación no es válido.
                </div>
              )}

              {error && (
                <div
                  className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-base font-medium text-foreground"
                  >
                    Nueva contraseña
                  </Label>

                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={
                        showPassword ? "text" : "password"
                      }
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      autoComplete="new-password"
                      className="h-14 pr-12 text-base"
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
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

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-base font-medium text-foreground"
                  >
                    Confirmar contraseña
                  </Label>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      autoComplete="new-password"
                      className="h-14 pr-12 text-base"
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-14 w-full text-base"
                  disabled={loading || !token}
                >
                  {loading
                    ? "Actualizando..."
                    : "Guardar nueva contraseña"}
                </Button>
              </form>
            </>
          )}

          {!success && (
            <div className="mt-8 text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center text-sm font-medium text-secondary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;