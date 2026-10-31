import Image from "next/image";

import { BRAND_LABEL, brandSrc, type BrandModule, type BrandVariant } from "@/lib/branding/modules";

type Props = {
  module: BrandModule;
  variant?: BrandVariant;
  size?: number;
  decorative?: boolean;
  muted?: boolean;
  priority?: boolean;
  className?: string;
};

export function ModuleIcon({ module, variant = "icon", size = 32, decorative = true, muted = false, priority = false, className }: Props) {
  const height = variant === "logo" ? Math.round((size * 820) / 800) : size;

  return (
    <Image
      src={brandSrc(module, variant)}
      width={size}
      height={height}
      alt={decorative ? "" : BRAND_LABEL[module]}
      unoptimized
      priority={priority}
      className={className}
      style={muted ? { filter: "grayscale(1)", opacity: 0.55 } : undefined}
    />
  );
}
