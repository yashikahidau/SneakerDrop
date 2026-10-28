import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SneakerDrop — Rare by Design",
  description: "A curated platform for exceptional future sneaker releases.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Loader />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
