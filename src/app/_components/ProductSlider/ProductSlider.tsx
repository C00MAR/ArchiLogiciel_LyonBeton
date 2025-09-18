"use client";

import { useRef } from "react";
import type { ProductType } from "../../types/Products";
import "./ProductSlider.css";

type Props = {
    product: ProductType;
};

export default function ProductSlider({ product }: Props) {
    const carrouselContainerRef = useRef<HTMLDivElement>(null);

    const { title, id, imgNumber } = product;

    const images = Array.from({ length: imgNumber ?? 1 }).map((_, index) => (
        <div
            key={`${id}_${index}`}
            className="carrousel__image"
            style={{ backgroundImage: `url('/product/${id}_${index}.webp')` }}
        />
    ));

    return (
        <div className="carrousel">
            <div className="carrousel__container" aria-label={title} ref={carrouselContainerRef}>
                {images}
                {images}
            </div>
        </div>
    );
}
