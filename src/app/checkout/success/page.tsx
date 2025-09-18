"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem("guest_cart");
        }
    }, []);

    return (
        <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ color: '#28a745', marginBottom: '20px' }}>
                ✅ Paiement réussi !
            </h1>

            <p style={{ fontSize: '18px', marginBottom: '30px' }}>
                Votre commande a été confirmée et sera traitée dans les plus brefs délais.
            </p>

            {sessionId && (
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
                    Numéro de session : {sessionId}
                </p>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/" style={{
                    padding: '12px 24px',
                    backgroundColor: '#007cba',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    Retour à l accueil
                </Link>

                <Link href="/products" style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    Continuer mes achats
                </Link>
            </div>

            <p style={{ fontSize: '14px', color: '#666', marginTop: '40px' }}>
                Un email de confirmation vous sera envoyé prochainement.
            </p>
        </div>
    );
}