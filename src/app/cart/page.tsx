"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";

export default function CartPage() {
    const { data: session, status } = useSession();

    const isAuthenticated = !!session?.user;

    const utils = api.useUtils();
    const cartQuery = api.cart.getCurrent.useQuery(undefined, {
        enabled: isAuthenticated,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const updateItem = api.cart.updateItem.useMutation({
        onMutate: async ({ identifier, quantity }) => {
            await utils.cart.getCurrent.cancel();
            const previous = utils.cart.getCurrent.getData();
            if (previous) {
                const items = [...previous.items];
                const index = items.findIndex((i) => i.product.identifier === identifier);
                if (index >= 0) {
                    if (quantity <= 0) {
                        items.splice(index, 1);
                    } else {
                        items[index] = { ...items[index], quantity } as typeof items[number];
                    }
                    utils.cart.getCurrent.setData(undefined, { ...previous, items });
                }
            }
            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) utils.cart.getCurrent.setData(undefined, ctx.previous);
        },
        onSettled: async () => {
            await utils.cart.getCurrent.invalidate();
        },
    });
    const removeItem = api.cart.removeItem.useMutation({
        onMutate: async ({ identifier }) => {
            await utils.cart.getCurrent.cancel();
            const previous = utils.cart.getCurrent.getData();
            if (previous) {
                const items = previous.items.filter((i) => i.product.identifier !== identifier);
                utils.cart.getCurrent.setData(undefined, { ...previous, items });
            }
            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) utils.cart.getCurrent.setData(undefined, ctx.previous);
        },
        onSettled: async () => {
            await utils.cart.getCurrent.invalidate();
        },
    });

    const [guestCart, setGuestCart] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!isAuthenticated && typeof window !== "undefined") {
            const raw = window.localStorage.getItem("guest_cart");
            setGuestCart(raw ? JSON.parse(raw) : {});
        }
    }, [isAuthenticated]);

    const identifiers = useMemo(() => Object.keys(guestCart), [guestCart]);

    const guestProductsQuery = api.products.productsByIdentifiers.useQuery(
        { identifiers },
        { enabled: !isAuthenticated && identifiers.length > 0 }
    );

    const setGuestQty = (identifier: string, quantity: number) => {
        if (typeof window === "undefined") return;
        const next = { ...guestCart };
        if (quantity <= 0) {
            delete next[identifier];
        } else {
            next[identifier] = quantity;
        }
        setGuestCart(next);
        window.localStorage.setItem("guest_cart", JSON.stringify(next));
    };

    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async (items: { productId: number; quantity: number }[]) => {
        if (items.length === 0) return;

        setIsCheckingOut(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });

            const data = await response.json();

            if (response.ok && data.url) {
                window.location.href = data.url;
            } else {
                console.error('Erreur checkout:', data.error);
                alert('Erreur lors de la création de la session de paiement');
            }
        } catch (error) {
            console.error('Erreur checkout:', error);
            alert('Erreur lors de la création de la session de paiement');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (status === "loading") {
        return <div>Chargement...</div>;
    }

    if (isAuthenticated) {
        const items = cartQuery.data?.items ?? [];
        const total = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
        const displayTotal = (total / 100).toFixed(2);
        return (
            <div className="cart-page">
                <h1>Votre panier</h1>
                {items.length === 0 ? (
                    <p>Votre panier est vide.</p>
                ) : (
                    <ul>
                        {items.map((it) => {
                            const displayPrice = (it.product.price / 100).toFixed(2);
                            return (
                                <li key={`${it.cartId}-${it.productId}`}>
                                    <div>
                                        <strong>{it.product.title}</strong>
                                    </div>
                                    <div>Prix: {displayPrice} €</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <button onClick={() => updateItem.mutate({ identifier: it.product.identifier, quantity: it.quantity - 1 })}>-</button>
                                        <span>Quantité: {it.quantity}</span>
                                        <button onClick={() => updateItem.mutate({ identifier: it.product.identifier, quantity: it.quantity + 1 })}>+</button>
                                        <button onClick={() => removeItem.mutate({ identifier: it.product.identifier })}>Supprimer</button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                <div>Total: {displayTotal} €</div>
                <button
                    onClick={() => handleCheckout(items.map(it => ({ productId: it.productId, quantity: it.quantity })))}
                    disabled={isCheckingOut || items.length === 0}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007cba',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                        opacity: isCheckingOut ? 0.6 : 1
                    }}
                >
                    {isCheckingOut ? 'Redirection...' : 'Payer avec Stripe'}
                </button>
            </div>
        );
    }

    const guestProducts = guestProductsQuery.data ?? [];
    const guestItems = guestProducts.map((p) => ({ product: p, quantity: guestCart[p.identifier] ?? 0 }));
    const guestTotal = guestItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
    const displayGuestTotal = (guestTotal / 100).toFixed(2);

    return (
        <div className="cart-page">
            <h1>Votre panier</h1>
            {guestItems.length === 0 ? (
                <p>Votre panier est vide.</p>
            ) : (
                <ul>
                    {guestItems.map((it) => {
                        const displayPrice = (it.product.price / 100).toFixed(2);
                        return (
                            <li key={it.product.identifier}>
                                <div>
                                    <strong>{it.product.title}</strong>
                                </div>
                                <div>Prix: {displayPrice} €</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button onClick={() => setGuestQty(it.product.identifier, (it.quantity - 1))}>-</button>
                                    <span>Quantité: {it.quantity}</span>
                                    <button onClick={() => setGuestQty(it.product.identifier, (it.quantity + 1))}>+</button>
                                    <button onClick={() => setGuestQty(it.product.identifier, 0)}>Supprimer</button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            <div>Total: {displayGuestTotal} €</div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <Link href="/login" style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}>
                    Se connecter pour payer
                </Link>
                <button
                    onClick={() => {
                        const items = guestItems.map(it => ({ productId: it.product.id, quantity: it.quantity }));
                        handleCheckout(items);
                    }}
                    disabled={isCheckingOut || guestItems.length === 0}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007cba',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                        opacity: isCheckingOut ? 0.6 : 1
                    }}
                >
                    {isCheckingOut ? 'Redirection...' : 'Payer sans compte'}
                </button>
            </div>
        </div>
    );
} 