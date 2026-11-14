import "./globals.css";

export const metadata = {
  title: "BodyScan – Anatomi 3D",
  description: "Model anatomi 3D interaktif untuk menandai area yang sakit",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
