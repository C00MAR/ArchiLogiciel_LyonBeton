import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return products;
  }),

  getByIdentifier: publicProcedure
    .input(z.object({ identifier: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { identifier: input.identifier },
      });
      return product ?? null;
    }),
});
