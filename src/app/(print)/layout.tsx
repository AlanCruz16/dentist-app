import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
    title: "Recibo de Pago",
    description: "Recibo de pago para impresión",
};

export default function PrintLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}
