import ProductShop from "~/app/_components/ProductShop/ProductShop";
import ProductSlider from "~/app/_components/ProductSlider/ProductSlider";
import type { ProductType } from "~/app/types/Products";
import { api } from "~/trpc/server";

type Props = {
    params: {
        id: string;
    };
};

async function fetchProductById(id: string) {
    return api.products.getByIdentifier({ identifier: id });
}

export default async function ProductPage({ params }: Props) {
    const productData = await fetchProductById(params.id);

    if (!productData) {
        return <h1>Produit introuvable</h1>;
    }

    const product = productData as ProductType;

    return (
        <div className="product-page">
            <ProductSlider product={product} />
            <ProductShop product={product} />
        </div>
    );
}
