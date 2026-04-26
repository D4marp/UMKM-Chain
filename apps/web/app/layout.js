import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import SiteNav from "@/components/site-nav";
import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata = {
  title: "UMKMChain",
  description:
    "Empowering MSMEs through Event-Driven Blockchain and IPFS Digital Ecosystems"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <div className="app-shell">
          <SiteNav />
          {children}
        </div>
      </body>
    </html>
  );
}
