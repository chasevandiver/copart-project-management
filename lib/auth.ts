// Shared by middleware (edge) and the login route. Web Crypto only.
export const COOKIE = "pm_board_auth";

export async function tokenFor(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`copart-pm-board:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
