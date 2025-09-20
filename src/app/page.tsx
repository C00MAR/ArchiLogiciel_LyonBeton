import Hero from "~/app/_components/Hero/Hero";
import { auth } from "~/server/auth";
import '~/styles/globals.css';
import { api, HydrateClient } from "~/trpc/server";
import CardList from "./_components/CardList/CardList";
import type { ProductType } from "./types/Products";
import TestImage from "./_components/TestImage/CloudImage";

async function fetchAllProducts() {
    return api.products.getLastProducts();
}

export default async function Home() {
    const session = await auth();

    if (session?.user) {
        void api.post.getLatest.prefetch();
    }

    const productsData = await fetchAllProducts();
    const productsList: ProductType[] = productsData ?? [];

    return (
        <HydrateClient>
            <Hero session={session} />
            <CardList
                productList={productsList}
            />
            <TestImage />
        </HydrateClient>
    );
}
