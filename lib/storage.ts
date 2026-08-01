import { DeliveryOrder } from '@/types/delivery-order';
import { CURRENT_SCHEMA_VERSION, DEFAULT_DELIVERY_ORDER } from './constants';

/**
 * Migrates older order shapes to current schema version
 */
export function migrateOrder(rawOrder: any): DeliveryOrder {
  if (!rawOrder || typeof rawOrder !== 'object') {
    throw new Error('Invalid order data for migration');
  }

  const version = rawOrder.schemaVersion || 0;

  let order: DeliveryOrder = {
    ...DEFAULT_DELIVERY_ORDER,
    ...rawOrder,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };

  // Perform specific migrations if schema version evolves in the future
  if (version < 1) {
    order.company = {
      ...DEFAULT_DELIVERY_ORDER.company,
      ...(rawOrder.company || {}),
    };
  }

  return order;
}
