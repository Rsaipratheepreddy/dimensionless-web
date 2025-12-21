'use client';
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { ModalProvider } from "../contexts/ModalContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ModalProvider>
                    <CartProvider>
                        {children}
                        <Toaster position="bottom-right" />
                    </CartProvider>
                </ModalProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
