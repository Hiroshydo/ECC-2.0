export function createClient() {
  return {
    auth: {
      async signOut() {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) return { error: new Error("logout_failed") };
        return { error: null };
      },
    },
  };
}
