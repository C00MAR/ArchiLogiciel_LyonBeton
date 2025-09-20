import ProductShop from "~/app/_components/ProductShop/ProductShop";
import ProductSlider from "~/app/_components/ProductSlider/ProductSlider";
import type { ProductType } from "~/app/types/Products";
import { api } from "~/trpc/server";
import type { PageProps } from "next"; // 👈

async function fetchProductById(id: string) {
    return api.products.productByIdentifier({ identifier: id });
}

export default async function ProductPage({
    params,
}: PageProps<{ id: string }>) {
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
