import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/client/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      /*
       * Por seguridad, el backend debe responder de forma genérica
       * aunque el correo no exista.
       */
      if (response.ok) {
        setSent(true);
      } else {
        alert(
          data.message ||
            "Si el correo está registrado, recibirás un enlace de recuperación."
        );
      }
    } catch (error) {
      console.error("Error de red:", error);

      alert(
        "Hubo un fallo de comunicación con el servidor. Inténtalo nuevamente."
      );
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
          {!sent ? (
            <>
              {/* Encabezado */}
              <div className="mb-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                  <Mail className="h-8 w-8 text-secondary" />
                </div>

                <h1 className="font-heading text-4xl font-bold text-foreground">
                  Recuperar contraseña
                </h1>

                <p className="mt-3 text-lg text-foreground/75">
                  Te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <Button
                  type="submit"
                  className="h-14 w-full text-base"
                  disabled={loading}
                >
                  <Mail className="mr-2 h-5 w-5" />

                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </form>
            </>
          ) : (
            /* Confirmación */
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
                <Mail className="h-10 w-10 text-success" />
              </div>

              <h1 className="font-heading text-4xl font-bold text-foreground">
                Revisa tu correo
              </h1>

              <p className="mt-4 text-base leading-7 text-foreground/75">
                Si{" "}
                <span className="font-semibold text-foreground">
                  {email}
                </span>{" "}
                está registrado, recibirás un enlace para restablecer tu
                contraseña.
              </p>

              <p className="mt-3 text-sm text-foreground/65">
                El enlace de recuperación tendrá una duración limitada por
                seguridad.
              </p>
            </div>
          )}

          {/* Volver al login */}
          <div className="mt-10 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-secondary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecoverPassword;