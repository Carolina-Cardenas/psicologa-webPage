import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Calendar,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  /*
   * IMPORTANTE:
   * El login del paciente guarda actualmente:
   *
   * clientToken
   * clientUser
   *
   * Por eso el Navbar debe consultar exactamente esas claves.
   */
  const clientToken = localStorage.getItem("clientToken");
  const clientUser = localStorage.getItem("clientUser");

  const isClientLoggedIn = Boolean(clientToken && clientUser);

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/servicios", label: "Servicios" },
    { to: "/agendar", label: "Agendar cita" },
    { to: "/faq", label: "Preguntas frecuentes" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  /**
   * Cierra únicamente la sesión del paciente.
   *
   * No elimina adminToken ni adminUser porque la autenticación
   * administrativa utiliza un espacio separado.
   */
  const handleClientLogout = () => {
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");

    setIsOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="font-heading text-lg text-primary-foreground">
              P
            </span>
          </div>

          <span className="font-heading text-xl font-semibold text-foreground">
            Psicologa Nataly Cárdenas
          </span>
        </Link>

        {/* Navegación desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-secondary/30 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Acciones desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {isClientLoggedIn ? (
            <>
              {/* Portal del paciente */}
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to="/paciente">
                  <User className="mr-2 h-4 w-4" />
                  Mis citas
                </Link>
              </Button>

              {/* Cerrar sesión */}
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleClientLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>

              {/* Acceso rápido para agendar */}
              <Button size="sm" asChild>
                <Link to="/agendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar cita
                </Link>
              </Button>
            </>
          ) : (
            <>
              {/* Login */}
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Ingresar
                </Link>
              </Button>

              {/* Acceso rápido para agendar */}
              <Button size="sm" asChild>
                <Link to="/agendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar cita
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="rounded-lg p-2 text-foreground md:hidden"
          aria-label={
            isOpen
              ? "Cerrar menú de navegación"
              : "Abrir menú de navegación"
          }
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Navegación móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-secondary/30 text-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-2 border-border" />

              {isClientLoggedIn ? (
                <>
                  {/* Portal paciente móvil */}
                  <Link
                    to="/paciente"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    <User className="h-4 w-4" />
                    Mis citas
                  </Link>

                  {/* Logout móvil */}
                  <button
                    type="button"
                    onClick={handleClientLogout}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    Salir
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <LogIn className="h-4 w-4" />
                  Ingresar
                </Link>
              )}

              <Button
                size="sm"
                className="mt-1"
                asChild
              >
                <Link
                  to="/agendar"
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar cita
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;