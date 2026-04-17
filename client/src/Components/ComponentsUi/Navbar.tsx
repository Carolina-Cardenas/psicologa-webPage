import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/servicios", label: "Servicios" },
    { to: "/agendar", label: "Agendar cita" },
    { to: "/faq", label: "Preguntas frecuentes" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="font-heading text-lg text-primary-foreground">P</span>
          </div>
          <span className="font-heading text-xl font-semibold text-foreground">
            Psic. Nataly Cárdenas
          </span>
        </Link>

        {/* Desktop nav */}
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

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Ingresar
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/agendar">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar cita
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-foreground md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
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
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <LogIn className="h-4 w-4" />
                Ingresar
              </Link>
              <Button size="sm" className="mt-1" asChild>
                <Link to="/agendar" onClick={() => setIsOpen(false)}>
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
