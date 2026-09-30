import "./globals.css";

export const metadata = {
  title: "PM Board",
  description: "Chase's Copart project tracker",
};

// Pages read tracker.json live on every request, so edits show up right away.
export const dynamic = "force-dynamic";

// Data is loaded in the signed-in layouts ((app) and classic), never here,
// so the public login page carries no tracker data.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
