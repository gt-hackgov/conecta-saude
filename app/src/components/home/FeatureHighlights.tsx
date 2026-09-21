import { CalendarCheck, FileHeart, MapPin, ShieldCheck } from "lucide-react";

const features = [
  { label: "Agende consultas", icon: CalendarCheck },
  { label: "Acompanhe seus exames", icon: FileHeart },
  { label: "Encontre a UBS mais próxima", icon: MapPin },
  { label: "Seus dados sempre seguros", icon: ShieldCheck },
];

export function FeatureHighlights() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <li
            key={feature.label}
            className="flex items-center gap-3 rounded-2xl bg-card/70 px-4 py-3 ring-1 ring-foreground/5 backdrop-blur-sm"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">{feature.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
