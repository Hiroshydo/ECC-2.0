import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecclesia Finance",
  description: "Controle financeiro, prestação de contas e auditoria para igrejas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
