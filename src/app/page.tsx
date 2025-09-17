import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Hero from "~/app/_components/Hero/Hero";
import Header from "./_components/Header/Header";
import '~/styles/globals.css'
import CardElement from "./_components/CardElement/CardElement";
import type { ProductType } from "./_components/CardElement/CardElement.type";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  const product: ProductType = {
    title: "Sample Product",
    subtitle: "This is a sample product",
    price: 420,
    ref: "SKU1045",
    id: "twist"
  }

  return (
    <HydrateClient>
      <Header />
      <Hero session={session} />
      <CardElement
        product={product}
      />
    </HydrateClient>
  );
}
