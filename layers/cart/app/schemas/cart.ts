import { z } from 'zod'
import { ProductSchema } from '#layers/products/app/schemas/product'

export const CartItemSchema = z.object({
  product: ProductSchema,
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be greater than 0'),
})


export type CartItem = z.infer<typeof CartItemSchema>
