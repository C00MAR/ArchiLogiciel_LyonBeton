import Hero from "~/app/_components/Hero/Hero";
import { auth } from "~/server/auth";
import '~/styles/globals.css';
import { api, HydrateClient } from "~/trpc/server";
import CardList from "./_components/CardList/CardList";
import Header from "./_components/Header/Header";
import type { ProductType } from "./types/Products";

export default async function Home() {
    const session = await auth();

    if (session?.user) {
        void api.post.getLatest.prefetch();
    }

    const products: ProductType[] = [{
        title: "Dice",
        subtitle: "Configuration 14",
        price: 4110,
        ref: "DC-059",
        id: "dice"
    },
    {
        title: "Strut the pill",
        subtitle: "Table basse",
        price: 790,
        ref: "10133",
        id: "table"
    },
    {
        title: "Cloud 745",
        subtitle: "Support papier toilette",
        price: 115,
        ref: "DB-09104",
        id: "pq"
    },
    {
        title: "Twist",
        subtitle: "Tables d'appoint",
        price: 590,
        ref: "D-09400-PE-014",
        id: "twist"
    }]

    return (
        <HydrateClient>
            <Header />
            <Hero session={session} />
            <CardList
                productList={products}
            />
        </HydrateClient>
    );
}
