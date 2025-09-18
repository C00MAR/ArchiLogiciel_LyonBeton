import { accountRouter } from "~/server/api/routers/account";
import { authRouter } from "~/server/api/routers/auth";
import { postRouter } from "~/server/api/routers/post";
import { productsRouter } from "~/server/api/routers/products";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { cartRouter } from "./routers/cart";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  products: productsRouter,
  auth: authRouter,
  account: accountRouter,
  cart: cartRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
