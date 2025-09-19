import { api } from "~/trpc/server";
import CardList from "~/app/_components/CardList/CardList";
import type { ProductType } from "~/app/types/Products";

async function fetchAllProducts() {
    return api.products.getAll();
}

export default async function ProductsPage() {
    const productsData = await fetchAllProducts();
    const productsList: ProductType[] = productsData ?? [];

    return (
        <div className="products-page" style={{marginTop: '50px'}}>
            <CardList productList={productsList} />
        </div>
    );
}