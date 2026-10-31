export const ECCLESIA_FINANCE_LOGO_PATH = "/branding/ecclesia-finance-logo.png";

export async function loadOfficialLogo() {
  try {
    const response = await fetch(ECCLESIA_FINANCE_LOGO_PATH, { cache: "no-store" });
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    const base64 = btoa(binary);
    return { dataUri: `data:image/png;base64,${base64}`, base64: `data:image/png;base64,${base64}` };
  } catch {
    return null;
  }
}
