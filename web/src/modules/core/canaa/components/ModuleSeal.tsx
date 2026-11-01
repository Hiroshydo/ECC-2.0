import { ModuleIcon } from "@/components/brand/ModuleIcon";

type SealModule = "khatam" | "hiram";

const sealCopy: Record<SealModule, { label: string; description: string }> = {
  khatam: {
    label: "Acesso por Khatam",
    description: "Licenciamento e controle de assentos.",
  },
  hiram: {
    label: "Estrutura por Hiram",
    description: "Organização hierárquica de congregações.",
  },
};

export function ModuleSeal({ module }: { module: SealModule }) {
  const { label, description } = sealCopy[module];

  return (
    <span className="module-seal" title={description} aria-label={`${label}. ${description}`} role="img" tabIndex={0}>
      <ModuleIcon module={module} variant="icon" size={16} decorative muted />
      <span>{label}</span>
    </span>
  );
}
