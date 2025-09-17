import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Hero from "~/app/_components/Hero/Hero";
import "~/styles/globals.css";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <Hero session={session} />
    </HydrateClient>
  );
}
