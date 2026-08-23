import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
