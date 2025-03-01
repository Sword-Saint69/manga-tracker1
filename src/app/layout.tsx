import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: Replace with actual user data from authentication
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    image: "/default-avatar.png",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="bg-background text-foreground dark:bg-background dark:text-foreground relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
                <div className="flex items-center">
                  <span className="hidden font-bold sm:inline-block text-left">
                    Manga Tracker
                  </span>
                  <nav className="ml-4 flex items-center space-x-4">
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/explore"
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Explore
                    </Link>
                    <Link
                      href="/library"
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Library
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <UserProfileDropdown user={user} />
                </div>
              </div>
            </header>

            <main className="flex-grow">
              {children}
            </main>

            <footer className="border-t py-6">
              <div className="container flex flex-col items-center justify-between space-y-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  &copy; {new Date().getFullYear()} Manga Tracker. All rights
                  reserved.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
