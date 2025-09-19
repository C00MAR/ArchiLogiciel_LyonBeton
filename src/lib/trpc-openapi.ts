import { z } from "zod";

export function zodToOpenAPI(schema: z.ZodType): any {
  const zodType = schema._def;

  if (schema instanceof z.ZodString) {
    const def = zodType as z.ZodStringDef;
    const result: any = { type: 'string' };

    if (def.checks) {
      for (const check of def.checks) {
        if (check.kind === 'email') {
          result.format = 'email';
        } else if (check.kind === 'min') {
          result.minLength = check.value;
        } else if (check.kind === 'max') {
          result.maxLength = check.value;
        }
      }
    }
    return result;
  }

  if (schema instanceof z.ZodNumber) {
    const def = zodType as z.ZodNumberDef;
    const result: any = { type: 'number' };

    if (def.checks) {
      for (const check of def.checks) {
        if (check.kind === 'min') {
          result.minimum = check.value;
        } else if (check.kind === 'max') {
          result.maximum = check.value;
        } else if (check.kind === 'int') {
          result.type = 'integer';
        }
      }
    }
    return result;
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToOpenAPI(zodType.type)
    };
  }

  if (schema instanceof z.ZodObject) {
    const properties: any = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(zodType.shape())) {
      properties[key] = zodToOpenAPI(value as z.ZodType);

      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 && { required })
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: zodType.values
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToOpenAPI(zodType.innerType);
  }

  if (schema instanceof z.ZodUnion) {
    return {
      oneOf: zodType.options.map((option: z.ZodType) => zodToOpenAPI(option))
    };
  }

  if (schema instanceof z.ZodRecord) {
    return {
      type: 'object',
      additionalProperties: zodType.valueType ? zodToOpenAPI(zodType.valueType) : true
    };
  }

  return { type: 'object' };
}

export const securitySchemes = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
  },
  SessionAuth: {
    type: 'apiKey',
    in: 'cookie',
    name: 'next-auth.session-token'
  }
};

export const commonResponses = {
  '400': {
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' }
          },
          required: ['error']
        }
      }
    }
  },
  '401': {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          },
          required: ['error'],
          example: { error: 'Non authentifié' }
        }
      }
    }
  },
  '403': {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          },
          required: ['error'],
          example: { error: 'Accès refusé' }
        }
      }
    }
  },
  '404': {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          },
          required: ['error']
        }
      }
    }
  },
  '500': {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          },
          required: ['error'],
          example: { error: 'Erreur interne du serveur' }
        }
      }
    }
  }
};

export function createTRPCProcedureDoc({
  summary,
  description,
  inputSchema,
  outputSchema,
  isProtected = false,
  isAdmin = false,
  method = 'POST',
  path,
  tags = []
}: {
  summary: string;
  description?: string;
  inputSchema?: z.ZodType;
  outputSchema?: z.ZodType;
  isProtected?: boolean;
  isAdmin?: boolean;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  tags?: string[];
}) {
  const operation: any = {
    summary,
    description,
    tags,
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: outputSchema ? zodToOpenAPI(outputSchema) : { type: 'object' }
          }
        }
      },
      ...commonResponses
    }
  };

  if (isProtected || isAdmin) {
    operation.security = [{ SessionAuth: [] }];
  }

  if (inputSchema && (method === 'POST' || method === 'PUT')) {
    operation.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: zodToOpenAPI(inputSchema)
        }
      }
    };
  }

  if (inputSchema && method === 'GET') {
    const schema = zodToOpenAPI(inputSchema);
    if (schema.properties) {
      operation.parameters = Object.entries(schema.properties).map(([name, prop]: [string, any]) => ({
        name,
        in: 'query',
        required: schema.required?.includes(name) || false,
        schema: prop
      }));
    }
  }

  return { [method.toLowerCase()]: operation };
}

export function generateOpenAPIPaths() {
  return {
    '/api/trpc/auth.register': createTRPCProcedureDoc({
      summary: 'Register new user',
      description: 'Create a new user account',
      method: 'POST',
      path: '/api/trpc/auth.register',
      tags: ['Authentication'],
      inputSchema: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2)
      }),
      outputSchema: z.object({
        message: z.string()
      })
    }),

    '/api/trpc/auth.requestEmailVerification': createTRPCProcedureDoc({
      summary: 'Request email verification',
      description: 'Send email verification link',
      method: 'POST',
      path: '/api/trpc/auth.requestEmailVerification',
      tags: ['Authentication'],
      inputSchema: z.object({
        email: z.string().email()
      }),
      outputSchema: z.object({
        message: z.string()
      })
    }),

    '/api/trpc/auth.requestPasswordReset': createTRPCProcedureDoc({
      summary: 'Request password reset',
      description: 'Send password reset email',
      method: 'POST',
      path: '/api/trpc/auth.requestPasswordReset',
      tags: ['Authentication'],
      inputSchema: z.object({
        email: z.string().email()
      }),
      outputSchema: z.object({
        message: z.string()
      })
    }),

    '/api/trpc/auth.confirmPasswordReset': createTRPCProcedureDoc({
      summary: 'Confirm password reset',
      description: 'Reset password with token',
      method: 'POST',
      path: '/api/trpc/auth.confirmPasswordReset',
      tags: ['Authentication'],
      inputSchema: z.object({
        token: z.string(),
        password: z.string().min(8)
      }),
      outputSchema: z.object({
        message: z.string()
      })
    }),

    '/api/trpc/products.getAll': createTRPCProcedureDoc({
      summary: 'Get all products',
      description: 'Retrieve all products with prices',
      method: 'GET',
      path: '/api/trpc/products.getAll',
      tags: ['Products'],
      outputSchema: z.array(z.object({
        id: z.number(),
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        price: z.number(),
        identifier: z.string(),
        ref: z.string(),
        imgNumber: z.number(),
        prices: z.array(z.object({
          id: z.number(),
          amount: z.number(),
          currency: z.string(),
          isActive: z.boolean(),
          isDefault: z.boolean()
        })).optional()
      }))
    }),

    '/api/trpc/products.productByIdentifier': createTRPCProcedureDoc({
      summary: 'Get product by identifier',
      description: 'Retrieve a specific product by its identifier',
      method: 'GET',
      path: '/api/trpc/products.productByIdentifier',
      tags: ['Products'],
      inputSchema: z.object({
        identifier: z.string()
      }),
      outputSchema: z.object({
        id: z.number(),
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        price: z.number(),
        identifier: z.string(),
        ref: z.string(),
        imgNumber: z.number()
      }).nullable()
    }),

    '/api/trpc/cart.getCurrent': createTRPCProcedureDoc({
      summary: 'Get current cart',
      description: 'Retrieve the current user cart',
      method: 'GET',
      path: '/api/trpc/cart.getCurrent',
      tags: ['Cart'],
      isProtected: true,
      outputSchema: z.object({
        id: z.number(),
        userId: z.string(),
        items: z.array(z.object({
          id: z.number(),
          quantity: z.number(),
          product: z.object({
            id: z.number(),
            title: z.string(),
            price: z.number(),
            identifier: z.string()
          })
        }))
      })
    }),

    '/api/trpc/cart.addToCart': createTRPCProcedureDoc({
      summary: 'Add item to cart',
      description: 'Add a product to the user cart',
      method: 'POST',
      path: '/api/trpc/cart.addToCart',
      tags: ['Cart'],
      isProtected: true,
      inputSchema: z.object({
        identifier: z.string(),
        quantity: z.number().min(1)
      }),
      outputSchema: z.object({
        cartId: z.number(),
        item: z.object({
          id: z.number(),
          quantity: z.number()
        })
      })
    }),

    '/api/trpc/cart.updateItem': createTRPCProcedureDoc({
      summary: 'Update cart item',
      description: 'Update quantity of a cart item',
      method: 'PUT',
      path: '/api/trpc/cart.updateItem',
      tags: ['Cart'],
      isProtected: true,
      inputSchema: z.object({
        identifier: z.string(),
        quantity: z.number().min(0)
      }),
      outputSchema: z.object({
        ok: z.boolean()
      })
    }),

    '/api/trpc/cart.removeItem': createTRPCProcedureDoc({
      summary: 'Remove cart item',
      description: 'Remove an item from the cart',
      method: 'DELETE',
      path: '/api/trpc/cart.removeItem',
      tags: ['Cart'],
      isProtected: true,
      inputSchema: z.object({
        identifier: z.string()
      }),
      outputSchema: z.object({
        ok: z.boolean()
      })
    }),

    '/api/trpc/account.getProfile': createTRPCProcedureDoc({
      summary: 'Get user profile',
      description: 'Get current user profile information',
      method: 'GET',
      path: '/api/trpc/account.getProfile',
      tags: ['Account'],
      isProtected: true,
      outputSchema: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: z.enum(['USER', 'ADMIN', 'PREMIUM']),
        emailVerified: z.boolean()
      })
    }),

    '/api/trpc/account.updateProfile': createTRPCProcedureDoc({
      summary: 'Update user profile',
      description: 'Update user profile information',
      method: 'PUT',
      path: '/api/trpc/account.updateProfile',
      tags: ['Account'],
      isProtected: true,
      inputSchema: z.object({
        name: z.string().min(2)
      }),
      outputSchema: z.object({
        message: z.string(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          role: z.string()
        })
      })
    }),

    '/api/trpc/account.changePassword': createTRPCProcedureDoc({
      summary: 'Change password',
      description: 'Change user password',
      method: 'PUT',
      path: '/api/trpc/account.changePassword',
      tags: ['Account'],
      isProtected: true,
      inputSchema: z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8)
      }),
      outputSchema: z.object({
        message: z.string()
      })
    }),

    '/api/trpc/orders.getUserOrders': createTRPCProcedureDoc({
      summary: 'Get user orders',
      description: 'Get paginated list of user orders',
      method: 'GET',
      path: '/api/trpc/orders.getUserOrders',
      tags: ['Orders'],
      isProtected: true,
      inputSchema: z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional()
      }),
      outputSchema: z.object({
        orders: z.array(z.object({
          id: z.string(),
          total: z.number(),
          status: z.string(),
          createdAt: z.string(),
          items: z.array(z.object({
            id: z.string(),
            quantity: z.number(),
            price: z.number(),
            title: z.string()
          }))
        })),
        totalCount: z.number(),
        totalPages: z.number(),
        currentPage: z.number()
      })
    }),

    '/api/trpc/admin.getAllUsers': createTRPCProcedureDoc({
      summary: 'Get all users (Admin)',
      description: 'Retrieve all users in the system',
      method: 'GET',
      path: '/api/trpc/admin.getAllUsers',
      tags: ['Admin'],
      isAdmin: true,
      outputSchema: z.array(z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: z.enum(['USER', 'ADMIN', 'PREMIUM']),
        emailVerified: z.boolean()
      }))
    }),

    '/api/trpc/admin.getAllProducts': createTRPCProcedureDoc({
      summary: 'Get all products (Admin)',
      description: 'Retrieve all products for admin management',
      method: 'GET',
      path: '/api/trpc/admin.getAllProducts',
      tags: ['Admin'],
      isAdmin: true,
      outputSchema: z.array(z.object({
        id: z.number(),
        title: z.string(),
        subtitle: z.string(),
        price: z.number(),
        ref: z.string(),
        identifier: z.string(),
        createdAt: z.string()
      }))
    }),

    '/api/trpc/admin.createProduct': createTRPCProcedureDoc({
      summary: 'Create product (Admin)',
      description: 'Create a new product',
      method: 'POST',
      path: '/api/trpc/admin.createProduct',
      tags: ['Admin'],
      isAdmin: true,
      inputSchema: z.object({
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        price: z.number().positive(),
        ref: z.string(),
        identifier: z.string(),
        imgNumber: z.number().positive()
      }),
      outputSchema: z.object({
        message: z.string(),
        product: z.object({
          id: z.number(),
          title: z.string(),
          ref: z.string()
        })
      })
    }),
  };
}
