"use client";

import bemCondition from "~/app/helpers/bemHelper";
import type { ProductType } from "../../types/Products";
import "./ProductShop.css";

type Props = {
    product: ProductType;
};

export default function ProductShop({ product }: Props) {
    const { title, subtitle, price, description } = product;



    return (
        <div className="product-shop">
            <div className={bemCondition("product-shop__grid", "top-left")}>
            </div>
            <div className={bemCondition("product-shop__grid", "top-right")}>
                <h1>{title}</h1>
                <h2>{subtitle}</h2>
            </div>
            <div className={bemCondition("product-shop__grid", "bottom-left")}>
                <span>Eur {price}</span>
                <button
                    type="button"
                    className="product-shop__button"
                >
                    Ajouter au panier
                </button>
            </div>
            <div className={bemCondition("product-shop__grid", "bottom-right")}>
                {description}
            </div>
        </div>
    );
}
