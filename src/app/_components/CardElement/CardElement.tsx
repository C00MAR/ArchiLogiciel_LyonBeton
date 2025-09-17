"use client";

import React from "react";
import type { ProductType } from "./CardElement.type";
import "./CardElement.css";

type Props = {
    product: ProductType;
};

export default function CardElement(props: Props) {
    const { title, subtitle, price, ref, id } = props.product;
    return (
        <div className="card-element" style={{ backgroundImage: `url('/assets/products/${id}.webp')` }}>
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
                    EUR {price}
                </span>
                <span className="card-element__data-ref">
                    {ref}
                </span>
            </span>
        </div>
    );
}
