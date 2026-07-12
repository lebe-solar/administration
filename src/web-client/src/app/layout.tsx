import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "LeBe Solarenergie – Photovoltaik im Rhein-Main-Gebiet",
    template: "%s | LeBe Solarenergie",
  },
  description:
    "LeBe Solarenergie plant und installiert individuelle PV-Anlagen mit Speicher, Wallbox und moderner Energietechnik im Rhein-Main-Gebiet – persönlich, regional und von Beratung bis Anmeldung aus einer Hand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <div style={{ minHeight: "100vh", background: "var(--white)", color: "var(--charcoal)", display: "flex", flexDirection: "column" }}>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
