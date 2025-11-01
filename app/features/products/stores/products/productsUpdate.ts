/**
 * Products Update Function - Pure business logic
 *
 * This is a PURE FUNCTION that:
 * - Takes current state and a message
 * - Returns new state
 * - Has NO side effects (no API calls, no mutations)
 * - Is framework-agnostic (no Vue, no Pinia dependencies)
 * - Is trivially testable
 *
 * Following The Elm Architecture pattern
 */

import { initialModel, type ProductsModel, type ProductsMsg } from './productsModel'

/**
 * Pure update function
 *
 * Given the same state and message, always returns the same new state.
 * No side effects, no mutations, just pure logic.
 *
 * @param model - Current products state
 * @param msg - Message describing what should happen
 * @returns New products state
 */
export function update(model: ProductsModel, msg: ProductsMsg): ProductsModel {
  switch (msg.type) {
    case 'SET_FILTER': {
      return {
        ...model,
        currentFilter: msg.filter,
      }
    }

    case 'SET_SORT': {
      return {
        ...model,
        currentSort: msg.sort,
      }
    }

    case 'RESET_FILTER': {
      return {
        ...model,
        currentFilter: initialModel.currentFilter,
        currentSort: initialModel.currentSort,
      }
    }

    case 'FETCH_REQUEST': {
      return {
        ...model,
        loading: true,
        error: null,
      }
    }

    case 'FETCH_SUCCESS': {
      return {
        ...model,
        loading: false,
        products: msg.products,
        error: null,
      }
    }

    case 'FETCH_FAILURE': {
      return {
        ...model,
        loading: false,
        error: msg.error,
      }
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = msg
      return model
    }
  }
}
