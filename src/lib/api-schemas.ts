import { z } from "zod";

export const RoleSchema = z.enum(['USER', 'ADMIN', 'PREMIUM']);
export const OrderStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
]);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  emailVerified: z.boolean(),
  twoFactorEnabled: z.boolean().optional(),
});

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  price: z.number(),
  imgNumber: z.number(),
  identifier: z.string(),
  ref: z.string(),
  stripeProductId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  prices: z.array(z.object({
    id: z.number(),
    productId: z.number(),
    stripePriceId: z.string(),
    amount: z.number(),
    currency: z.string(),
    type: z.string(),
    interval: z.string().optional(),
    isActive: z.boolean(),
    isDefault: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })).optional(),
});

export const CartItemSchema = z.object({
  id: z.number(),
  cartId: z.number(),
  productId: z.number(),
  quantity: z.number(),
  product: ProductSchema.optional(),
});

export const CartSchema = z.object({
  id: z.number(),
  userId: z.string().optional(),
  items: z.array(CartItemSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.number(),
  quantity: z.number(),
  price: z.number(),
  title: z.string(),
  subtitle: z.string(),
  product: ProductSchema.optional(),
});

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  stripeSessionId: z.string(),
  stripePaymentId: z.string().optional(),
  total: z.number(),
  status: OrderStatusSchema,
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  shippingAddress: z.record(z.any()).optional(),
  billingAddress: z.record(z.any()).optional(),
  items: z.array(OrderItemSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string(),
  adminId: z.string(),
  details: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  admin: UserSchema.pick({ name: true, email: true }).optional(),
});

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  totalCount: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.any()).optional(),
});

export const SuccessResponseSchema = z.object({
  message: z.string(),
  data: z.record(z.any()).optional(),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(2),
});

export const AddToCartRequestSchema = z.object({
  identifier: z.string(),
  quantity: z.number().min(1),
});

export const UpdateCartItemRequestSchema = z.object({
  identifier: z.string(),
  quantity: z.number().min(0),
});

export const MergeGuestCartRequestSchema = z.object({
  items: z.array(z.object({
    identifier: z.string(),
    quantity: z.number().min(1),
  })),
});

export const GetOrdersRequestSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: OrderStatusSchema.optional(),
  customerEmail: z.string().optional(),
});

export const UpdateOrderStatusRequestSchema = z.object({
  orderId: z.string(),
  status: OrderStatusSchema,
});

export const PromoteUserRequestSchema = z.object({
  userId: z.string(),
  role: RoleSchema,
});

export const CreateProductRequestSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  ref: z.string().min(1),
  identifier: z.string().min(1),
  imgNumber: z.number().positive(),
});

export const UpdateProductRequestSchema = CreateProductRequestSchema.extend({
  id: z.number(),
});

export const StripeCheckoutRequestSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
  })),
});

export const StripeCheckoutResponseSchema = z.object({
  url: z.string().url(),
});

export type User = z.infer<typeof UserSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type AddToCartRequest = z.infer<typeof AddToCartRequestSchema>;
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemRequestSchema>;
export type MergeGuestCartRequest = z.infer<typeof MergeGuestCartRequestSchema>;
export type GetOrdersRequest = z.infer<typeof GetOrdersRequestSchema>;
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>;
export type PromoteUserRequest = z.infer<typeof PromoteUserRequestSchema>;
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type StripeCheckoutRequest = z.infer<typeof StripeCheckoutRequestSchema>;
export type StripeCheckoutResponse = z.infer<typeof StripeCheckoutResponseSchema>;
