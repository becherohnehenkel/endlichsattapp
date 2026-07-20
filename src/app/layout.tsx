import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { NavigationShell } from "@/components/navigation-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "endlichsatt",
  description: "Verstehe warum du hungrig bleibst — und was du konkret ändern kannst.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "endlichsatt",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E9E6B",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isLoggedIn = !!user;
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  return (
    <html lang="de">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <NavigationShell isAdmin={isAdmin} isLoggedIn={isLoggedIn}>
          {children}
        </NavigationShell>
      </body>
    </html>
  );
}
