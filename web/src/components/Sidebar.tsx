"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  Building2,
  CalendarCheck,
  CirclePlus,
  FileText,
  LayoutDashboard,
  Receipt,
  RotateCcw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { can, type Permission } from "@/domain/access";
import { getVocabulary } from "@/domain/vocabulary";
import type { AuthenticatedMembership } from "@/lib/auth/session";

type NavigationIcon = "dashboard" | "entries" | "expenses" | "transfers" | "cash" | "closing" | "adjustments" | "reversals" | "audit" | "reports" | "settings" | "terminal" | "canaa";
type NavigationItem = { label: string; href: string; icon: NavigationIcon; permission?: Permission; adminOnly?: boolean; devOnly?: boolean };

const navigationIcons: Record<NavigationIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  entries: Receipt,
  expenses: CirclePlus,
  transfers: ArrowLeftRight,
  cash: Wallet,
  closing: CalendarCheck,
  adjustments: SlidersHorizontal,
  reversals: RotateCcw,
  audit: ShieldCheck,
  reports: FileText,
  settings: Settings,
  terminal: Terminal,
  canaa: Building2,
};

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
  { label: "Noah Ops", href: "/noah-ops", icon: "terminal", devOnly: true },
];

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
            const Icon = navigationIcons[item.icon];
            return <Link key={item.href} href={item.href} data-nav={item.icon} className={active ? "active group" : "group"} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)}><span className="nav-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.5} /></span><span>{label}</span>{showDevBadge && <span className="dev-badge">DEV</span>}</Link>;
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