"use client";

import React from "react";
import type { ProductType } from "../../types/Products";
import "./CardElement.css";
import Link from "next/link";

type Props = {
    product: ProductType;
};

export default function CardElement(props: Props) {
    const { title, subtitle, price, ref, identifier, prices } = props.product;

    const currentPrice = prices?.find(p => p.isDefault && p.isActive)?.amount ?? price;
    return (
        <Link className="card-element" href={`product/${identifier}`} style={{ backgroundImage: `url('/product/${identifier}_0.webp')` }}>
            <div className="card-element__info">
                <h3 className="card-element__info-title">
                    {title}
                </h3>
                <p className="card-element__info-subtitle">
                    {subtitle}
                </p>
            </div>
            <span className="card-element__data">
                <span className="card-element__data-price">
                    eur {currentPrice}
                </span>
                <span className="card-element__data-ref">
                    ref. {ref}
                </span>
            </span>
        </Link>
    );
}
