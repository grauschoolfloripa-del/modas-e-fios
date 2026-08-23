import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PwaInstall from "./components/PwaInstall";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display-family",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body-family",
  display: "swap",
});

export const metadata = {
  title: "Modas e Fios · Atelier de Crochê · Florianópolis",
  description:
    "Atelier boutique de crochê e costura artesanal em Florianópolis. Peças sob medida, ajustes, enxoval e aulas de costura.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#3D2B1F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
        <PwaInstall />
      </body>
    </html>
  );
}
