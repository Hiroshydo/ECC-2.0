"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { can, type Permission } from "@/domain/access";
import { getVocabulary } from "@/domain/vocabulary";
import type { AuthenticatedMembership } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";

type NavigationItem = { label: string; href: string; icon: LucideIcon; permission?: Permission; devOnly?: boolean };

const navigation: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, permission: "financial.read" },
  { label: "Canaã", href: "/canaa", icon: Building2, permission: "financial.read" },
  { label: "Entradas", href: "/entradas", icon: ArrowDownToLine, permission: "financial.read" },
  { label: "Despesas", href: "/despesas", icon: ArrowUpFromLine, permission: "financial.read" },
  { label: "Repasses", href: "/repasses", icon: ArrowLeftRight, permission: "financial.read" },
  { label: "Caixa", href: "/caixa", icon: Wallet, permission: "financial.read" },
  { label: "Fechamento", href: "/fechamento", icon: ClipboardCheck, permission: "closing.submit" },
  { label: "Ajustes", href: "/ajustes", icon: SlidersHorizontal, permission: "financial.approve" },
  { label: "Estornos", href: "/estornos", icon: RotateCcw, permission: "financial.approve" },
  { label: "Auditoria", href: "/auditoria", icon: ShieldCheck, permission: "audit.read" },
  { label: "Relatórios", href: "/relatorios", icon: FileText, permission: "financial.read" },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
  { label: "Painel Dev / Gestão", href: "/admin", icon: Terminal, devOnly: true },
  { label: "Noah Ops", href: "/noah-ops", icon: Activity, devOnly: true },
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
    if (item.href === "/canaa") return isMasterUser || Boolean(membership && can(membership, "hierarchy.view"));
    return Boolean(membership && (item.permission ? can(membership, item.permission) : true));
  });
  const initials = userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sidebar logout failed:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <button type="button" className="mobile-menu-toggle" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><span aria-hidden="true">{menuOpen ? <X size={20} /> : <Menu size={20} />}</span></button>
      <button type="button" className={`sidebar-backdrop${menuOpen ? " is-visible" : ""}`} aria-label="Fechar menu" tabIndex={menuOpen ? 0 : -1} disabled={!menuOpen} onClick={() => setMenuOpen(false)} />
      <aside className={`sidebar${menuOpen ? " is-open" : ""}`}>
        <div className="brand">
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
            const label = item.href === "/entradas" ? terms.dashboardEntries : item.href === "/repasses" ? terms.campaigns : item.label;
            const showDevBadge = item.devOnly;
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={active ? "active group" : "group"} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)}><span className="nav-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span><span>{label}</span>{showDevBadge && <span className="dev-badge">DEV</span>}</Link>;
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
            <LogOut size={15} aria-hidden="true" />
            <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}