import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ViewTransitionListener } from "@/components/layout/ViewTransitionListener";
import { ParamLoadingProvider } from "@/components/layout/ParamLoadingContext";

// import { Open_Sans, Georgia, Meddon } from "next/font/google";

// const fontSans = Open_Sans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

// const fontSerif = Georgia({
//   subsets: ["latin"],
//   variable: "--font-serif",
// });

// const fontMono = Menlo({
//   subsets: ["latin"],
//   variable: "--font-mono",
// });

// 🚀 Enhanced Metadata with a title template for all pages
export const metadata: Metadata = {
  title: {
    template: "%s | Next.js Hall of Heroes",
    default: "Next.js Hall of Heroes — Cinematic Universe Explorer",
  },
  description: "Explore characters, powers, universes, and teams in an immersive mobile-native cinematic feed.",
  icons: {
    icon: "/icon.png", // Points automatically to your app/icon.png file
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // change type of letters
  return (
    <html
      lang="en"
      // className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ViewTransitionListener />
          <ParamLoadingProvider>
            {children}
          </ParamLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
