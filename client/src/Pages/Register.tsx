import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { title: "Datos personales", subtitle: "Cuéntanos sobre ti" },
  { title: "Información de contacto", subtitle: "Para poder comunicarnos contigo" },
  { title: "Sobre tu consulta", subtitle: "Esto nos ayuda a preparar tu primera sesión" },
  { title: "Crea tu cuenta", subtitle: "Casi listo, solo falta asegurar tu acceso" },
];

const Register = () => {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    fechaNacimiento: "",
    genero: "",
    telefono: "",
    email: "",
    ciudad: "",
    modalidadPreferida: "",
    motivoConsulta: "",
    terapiaPrevia: "",
    password: "",
    confirmPassword: "",
  });

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend
    console.log("Register:", formData);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.nombre && formData.apellidos && formData.fechaNacimiento;
      case 1: return formData.telefono && formData.email;
      case 2: return formData.motivoConsulta;
      case 3: return formData.password && formData.password === formData.confirmPassword;
      default: return false;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background-alt px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      i < step
                        ? "bg-success text-success-foreground"
                        : i === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`mx-1 h-0.5 w-6 sm:w-10 ${i < step ? "bg-success" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h1 className="font-heading text-xl font-bold text-foreground">
                {steps[step].title}
              </h1>
              <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input id="nombre" placeholder="María" value={formData.nombre} onChange={(e) => update("nombre", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellidos">Apellidos *</Label>
                        <Input id="apellidos" placeholder="García Pérez" value={formData.apellidos} onChange={(e) => update("apellidos", e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaNacimiento">Fecha de nacimiento *</Label>
                      <Input id="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={(e) => update("fechaNacimiento", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Género</Label>
                      <Select value={formData.genero} onValueChange={(v) => update("genero", v)}>
                        <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="no-binario">No binario</SelectItem>
                          <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Input id="telefono" type="tel" placeholder="+52 55 1234 5678" value={formData.telefono} onChange={(e) => update("telefono", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico *</Label>
                      <Input id="email" type="email" placeholder="tu@correo.com" value={formData.email} onChange={(e) => update("email", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad</Label>
                      <Input id="ciudad" placeholder="Ciudad de México" value={formData.ciudad} onChange={(e) => update("ciudad", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Modalidad preferida</Label>
                      <Select value={formData.modalidadPreferida} onValueChange={(v) => update("modalidadPreferida", v)}>
                        <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="online">En línea</SelectItem>
                          <SelectItem value="ambas">Ambas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="motivoConsulta">¿Qué te motiva a buscar terapia? *</Label>
                      <Textarea
                        id="motivoConsulta"
                        placeholder="Cuéntanos brevemente, todo lo que compartas es confidencial..."
                        rows={4}
                        value={formData.motivoConsulta}
                        onChange={(e) => update("motivoConsulta", e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Esta información nos ayuda a preparar mejor tu primera sesión. No te preocupes, es completamente confidencial.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>¿Has tenido terapia antes?</Label>
                      <Select value={formData.terapiaPrevia} onValueChange={(v) => update("terapiaPrevia", v)}>
                        <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No, es mi primera vez</SelectItem>
                          <SelectItem value="si-buena">Sí, y fue una buena experiencia</SelectItem>
                          <SelectItem value="si-no-bien">Sí, pero no me fue tan bien</SelectItem>
                          <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          value={formData.password}
                          onChange={(e) => update("password", e.target.value)}
                          required
                          minLength={8}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => update("confirmPassword", e.target.value)}
                        required
                      />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
              ) : (
                <span />
              )}

              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={!canProceed()}>
                  <UserPlus className="mr-2 h-4 w-4" /> Crear cuenta
                </Button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-secondary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
