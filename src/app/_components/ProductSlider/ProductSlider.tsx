"use client";

import type { ProductType } from "../../types/Products";
import "./ProductSlider.css";

type Props = {
    product: ProductType;
};

export default function ProductSlider(props: Props) {
    const { title, subtitle, price, ref, id, imgNumber } = props.product;
    return (
        <div className="carrousel">
            {
                [...Array(imgNumber || 1)].map((_, index) => {
                    const imageId = `${id}_${index + 1}`
                    return (
                        <img
                            key={imageId}
                            src={`${imageId}.webp`}
                            alt={title}
                            className="carrousel__image"
                        />
                    )
                })}
        </div>
    )
}