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
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        alert(data.message || "El correo ingresado no se encuentra registrado.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Hubo un fallo de comunicación con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background-alt px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          {!sent ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Recuperar contraseña
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@correo.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" /> 
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Revisa tu correo
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Si <span className="font-medium text-foreground">{email}</span> está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-secondary hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecoverPassword;

