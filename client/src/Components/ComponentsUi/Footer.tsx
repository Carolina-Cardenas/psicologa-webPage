import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Psic. Nataly Cárdenas Astudillo
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Acompañamiento profesional para tu bienestar emocional. Cada paso
              cuenta en tu camino hacia una vida más plena.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Enlaces
            </h4>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Inicio
              </Link>
              <Link to="/agendar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Agendar cita
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Portal del paciente
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Contacto
            </h4>
            <div className="mt-3 flex flex-col gap-2">
              <a href="mailto:contacto@natalycardenas.cl" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> contacto@psnatalycardenas@gmail.com
              </a>
              <a href="tel:+56976401578" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" /> +56 9 7640 1578
              </a>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Av. Sta. Isabel 336, Santiago, Chile
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-1 border-t pt-6 text-xs text-muted-foreground">
          Hecho con <Heart className="h-3 w-3 text-destructive" /> para tu bienestar
        </div>
      </div>
    </footer>
  );
};

export default Footer;
