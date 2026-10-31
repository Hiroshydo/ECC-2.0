'use client';

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CongregationSwitcher } from "@/components/CongregationSwitcher";
import { Sidebar } from "@/components/Sidebar";
import { isMasterAdmin } from "@/domain/access";
import type { AuthenticatedMembership } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";

function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      console.error("Header logout failed:", error);
      setIsLoggingOut(false);
    }
  }

  const buttonLabel = isLoggingOut ? "Saindo..." : "Sair";

  return (
    <button type="button" className={compact ? "header-logout-button" : "logout-button header-logout-button"} onClick={handleLogout} disabled={isLoggingOut} aria-label="Sair da sessão">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="logout-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
      <span>{buttonLabel}</span>
    </button>
  );
}

export function AuthenticatedShell({ user, memberships, activeMembership, isPlatformAdmin, children }: { user: User; memberships: AuthenticatedMembership[]; activeMembership: AuthenticatedMembership | null; isPlatformAdmin: boolean; children: React.ReactNode }) {
  const userName: string = String(user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || user.email?.split("@")?.[0] || "Usuário");
  const initials = userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
  const currentRole = activeMembership?.role ?? "member";
  const badgeRole = isMasterAdmin(user) ? "Dev Master" : currentRole === "viewer" ? "Visualizador" : "Membro";

  return (
    <main className="shell">
      <Sidebar userName={userName} membership={activeMembership} memberships={memberships} isPlatformAdmin={isPlatformAdmin} userEmail={user.email ?? null} />
      <section className="content" aria-label="Área financeira">
        <header className="workspace-header">
          <div className="workspace-header-left"><span className="workspace-breadcrumb"><span>Ecclesia Finance</span><span className="breadcrumb-divider" aria-hidden="true">/</span><b>{activeMembership?.congregation.name ?? "Acesso"}</b></span></div>
          <div className="workspace-header-right">
            <div className="workspace-bar"><CongregationSwitcher memberships={memberships} activeId={activeMembership?.congregationId ?? null} /></div>
            <div className="workspace-profile"><span className="avatar profile-avatar">{initials}</span><div><b>{userName}</b><span className="role-badge">{badgeRole}</span></div><LogoutButton compact /></div>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}