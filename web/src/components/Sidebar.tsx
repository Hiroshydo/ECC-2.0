"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { can, type Permission } from "@/domain/access";
import { getVocabulary } from "@/domain/vocabulary";
import type { AuthenticatedMembership } from "@/lib/auth/session";
import type { BrandModule } from "@/lib/branding/modules";

type NavigationIcon = "dashboard" | "entries" | "expenses" | "transfers" | "cash" | "closing" | "adjustments" | "reversals" | "audit" | "reports" | "settings" | "terminal" | "canaa";
type NavigationItem = { label: string; href: string; icon: NavigationIcon; brand?: BrandModule; permission?: Permission; adminOnly?: boolean; devOnly?: boolean };

const navigation: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: "dashboard", permission: "financial.read" },
  { label: "Canaã", href: "/canaa", icon: "canaa", permission: "financial.read" },
  { label: "Entradas", href: "/entradas", icon: "entries", permission: "financial.read" },
  { label: "Despesas", href: "/despesas", icon: "expenses", permission: "financial.read" },
  { label: "Repasses", href: "/repasses", icon: "transfers", permission: "financial.read" },
  { label: "Caixa", href: "/caixa", icon: "cash", permission: "financial.read" },
  { label: "Fechamento", href: "/fechamento", icon: "closing", permission: "closing.submit" },
  { label: "Ajustes", href: "/ajustes", icon: "adjustments", permission: "financial.approve" },
  { label: "Estornos", href: "/estornos", icon: "reversals", permission: "financial.approve" },
  { label: "Auditoria", href: "/auditoria", icon: "audit", permission: "audit.read" },
  { label: "Relatórios", href: "/relatorios", icon: "reports", permission: "financial.read" },
  { label: "Configurações", href: "/configuracoes", icon: "settings" },
  { label: "Painel Dev / Gestão", href: "/admin", icon: "terminal", devOnly: true },
  { label: "Noah Ops", href: "/noah-ops", icon: "terminal", brand: "noah", devOnly: true },
];

function NavigationGlyph({ icon }: { icon: NavigationIcon }) {
  const svgProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "nav-glyph",
    "aria-hidden": true as const,
    "data-nav": icon,
  };

  switch (icon) {
    case "dashboard":
      return <svg {...svgProps}><path d="M4 18V8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5V18" /><path d="M4 14h16" /><path d="M8 18v-4h8v4" /></svg>;
    case "entries":
      return <svg {...svgProps}><path d="M12 21V7" /><path d="M7 12h10" /><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /></svg>;
    case "expenses":
      return <svg {...svgProps}><path d="M5 12h14" /><path d="M12 5v14" /><circle cx="12" cy="12" r="9" /></svg>;
    case "transfers":
      return <svg {...svgProps}><path d="m7 7 10 10" /><path d="M17 7H7v10" /><path d="M17 17H7V7" /></svg>;
    case "cash":
      return <svg {...svgProps}><rect width="18" height="12" x="3" y="6" rx="2" /><path d="M3 10h18" /></svg>;
    case "closing":
      return <svg {...svgProps}><path d="m9 12 2 2 4-4" /><rect width="18" height="18" x="3" y="3" rx="2" /></svg>;
    case "adjustments":
      return <svg {...svgProps}><path d="M4 20V8" /><path d="M20 20V8" /><path d="M8 8V4h8v4" /><path d="M12 12v4" /></svg>;
    case "reversals":
      return <svg {...svgProps}><path d="M3 12a9 9 0 1 0 9-9" /><path d="M3 4v5h5" /><path d="M12 8v4l3 2" /></svg>;
    case "audit":
      return <svg {...svgProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "reports":
      return <svg {...svgProps}><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5" /><path d="M8 13h8" /><path d="M8 17h8" /></svg>;
    case "settings":
      return <svg {...svgProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V20a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H4a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V4a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H20a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>;
    case "terminal":
      return <svg {...svgProps}><path d="m8 9 3 3-3 3" /><path d="M14 15h3" /><rect width="18" height="14" x="3" y="5" rx="2" /></svg>;
    case "canaa":
      return <Building2 className="nav-glyph" size={17} aria-hidden="true" strokeWidth={1.8} />;
    default:
      return <svg {...svgProps}><path d="M12 3v18" /><path d="M4 12h16" /></svg>;
  }
}

export function Sidebar({ userName, membership, memberships, isPlatformAdmin, userEmail }: { userName: string; membership: AuthenticatedMembership | null; memberships: AuthenticatedMembership[]; isPlatformAdmin: boolean; userEmail?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMasterUser = isPlatformAdmin;
  const currentRole = membership?.role ?? "member";
  const roleText = isMasterUser ? "Dev Master" : (currentRole === "viewer" || userEmail?.toLowerCase() === "demo@ecclesia.com" ? "Visualizador" : "Membro");
  const terms = getVocabulary(membership?.congregation.organizationType);
  const visibleNavigation = navigation.filter((item) => {
    if (item.devOnly) return isMasterUser;
    if (item.adminOnly) return isPlatformAdmin;
    if (item.href === "/canaa") return isMasterUser || Boolean(membership && can(membership, "hierarchy.view"));
    return Boolean(membership && (item.permission ? can(membership, item.permission) : true));
  });
  const initials = userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error(`logout_failed_${response.status}`);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sidebar logout failed:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <button type="button" className="mobile-menu-toggle" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><span aria-hidden="true">{menuOpen ? "×" : "☰"}</span></button>
      <button type="button" className={`sidebar-backdrop${menuOpen ? " is-visible" : ""}`} aria-label="Fechar menu" tabIndex={menuOpen ? 0 : -1} disabled={!menuOpen} onClick={() => setMenuOpen(false)} />
      <aside className={`sidebar${menuOpen ? " is-open" : ""}`}>
        <div className="brand" style={{ padding: "0 8px", marginBottom: "28px" }}>
          <Link className="brand-link" href="/" aria-label="Ir para o dashboard">
            <span className="brand-identity">
              <ModuleIcon module="ecclesia" size={40} priority decorative />
              <span className="brand-copy">Ecclesia Finance</span>
            </span>
          </Link>
        </div>
        <p className="eyebrow">GESTÃO · {terms.unitPlural.toLocaleUpperCase("pt-BR")}</p>
        <nav id="primary-navigation" aria-label="Navegação principal">
          {visibleNavigation.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            const label = item.icon === "entries" ? terms.dashboardEntries : item.icon === "transfers" ? terms.campaigns : item.label;
            const showDevBadge = item.devOnly;
            const navBrandModule = item.brand ?? (item.href === "/canaa" ? "canaa-local" : item.href === "/auditoria" ? "enoch" : item.href === "/relatorios" ? "sefer" : item.href === "/fechamento" ? "elias" : null);
            return <Link key={item.href} href={item.href} data-nav={item.icon} className={active ? "active group" : "group"} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)}><span className={`nav-icon${navBrandModule ? " nav-icon--brand" : ""}`} data-nav={item.icon} aria-hidden="true">{navBrandModule ? <ModuleIcon module={navBrandModule} size={32} decorative /> : <NavigationGlyph icon={item.icon} />}</span><span>{label}</span>{showDevBadge && <span className="dev-badge">DEV</span>}</Link>;
          })}
        </nav>
        <div className="sidebar-footer">
          <span className="avatar profile-avatar">{initials}</span>
          <div className="profile-details">
            <b>{userName}</b>
            <small className="profile-role">{roleText}</small>
            <small>{memberships.length} {memberships.length === 1 ? "unidade" : "unidades"}</small>
          </div>
          <button type="button" className="logout-button" onClick={handleLogout} disabled={isLoggingOut} aria-label="Sair da sessão">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="logout-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
            <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}