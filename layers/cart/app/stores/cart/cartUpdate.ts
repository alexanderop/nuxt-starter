import type { CartModel, CartMsg } from './cartModel'
import type { Product } from '#layers/products/app/schemas/product'


function addItemToCart(model: CartModel, product: Product): CartModel {
  const existingItem = model.items.find(item => item.product.id === product.id)

  if (existingItem) {
    return {
      ...model,
      items: model.items.map(item =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    }
  }

  return {
    ...model,
    items: [
      ...model.items,
      {
        product,
        quantity: 1,
      },
    ],
  }
}


function updateItemQuantity(model: CartModel, productId: string, quantity: number): CartModel {
  if (quantity <= 0) {
    return {
      ...model,
      items: model.items.filter(item => item.product.id !== productId),
    }
  }

  return {
    ...model,
    items: model.items.map(item =>
      item.product.id === productId
        ? {
            ...item,
            quantity,
          }
        : item,
    ),
  }
}


export function update(model: CartModel, msg: CartMsg): CartModel {
  switch (msg.type) {
    case 'ADD_ITEM':
      return addItemToCart(model, msg.product)

    case 'REMOVE_ITEM': {
      return {
        ...model,
        items: model.items.filter(item => item.product.id !== msg.productId),
      }
    }

    case 'UPDATE_QUANTITY':
      return updateItemQuantity(model, msg.productId, msg.quantity)

    case 'INCREMENT_ITEM': {
      const item = model.items.find(i => i.product.id === msg.productId)
      if (!item) {
        return model
      }
      return updateItemQuantity(model, msg.productId, item.quantity + 1)
    }

    case 'DECREMENT_ITEM': {
      const item = model.items.find(i => i.product.id === msg.productId)
      if (!item) {
        return model
      }
      return updateItemQuantity(model, msg.productId, item.quantity - 1)
    }

    case 'CLEAR_CART': {
      return {
        ...model,
        items: [],
      }
    }

    case 'HYDRATE_FROM_STORAGE': {
      return {
        ...model,
        items: msg.items,
      }
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = msg
      return model
    }
  }
}
