import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return products;
  }),

  productByIdentifier: publicProcedure
    .input(z.object({ identifier: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { identifier: input.identifier },
      });
      return product ?? null;
    }),

  productsByIdentifiers: publicProcedure
    .input(z.object({ identifiers: z.array(z.string().min(1)).min(1) }))
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: { identifier: { in: input.identifiers } },
      });
      return products;
    }),
});
