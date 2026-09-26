/**
 * Notification and Activity Log Helpers
 * Centralized functions to create notifications and activity logs for key events
 */

import { Notification, ActivityLog, User, Product } from '@/models';
import { formatCurrency } from '@/lib/utils';

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - User ID to notify
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (INFO, SUCCESS, WARNING, ERROR, LOW_STOCK, NEW_ORDER, PAYMENT_DUE, PURCHASE_RECEIVED, RETURN_REQUEST)
 * @param {string} [params.relatedEntity] - Related entity type (PRODUCT, SALE, PURCHASE, SUPPLIER, RETURN, CUSTOMER)
 * @param {string} [params.relatedEntityId] - Related entity ID
 * @param {string} [params.actionUrl] - URL to navigate when clicked
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'INFO',
  relatedEntity,
  relatedEntityId,
  actionUrl,
}) {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      isRead: false,
      relatedEntity,
      relatedEntityId,
      actionUrl,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Create notifications for multiple users (e.g., all admins/managers)
 * @param {Array<string>} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data (title, message, type, etc.)
 * @returns {Promise<Array>} Created notifications
 */
export async function createNotificationsForUsers(userIds, notificationData) {
  const notifications = await Promise.all(
    userIds.map(userId => createNotification({ ...notificationData, userId }))
  );
  return notifications.filter(Boolean);
}

/**
 * Create an activity log entry
 * @param {Object} params - Activity log parameters
 * @param {string} params.userId - User ID who performed the action
 * @param {string} params.action - Action performed (e.g., CREATE_SALE, RECEIVE_PURCHASE)
 * @param {string} params.entity - Entity type (PRODUCT, SALE, PURCHASE, etc.)
 * @param {string} params.entityId - Entity ID
 * @param {string} [params.entityName] - Entity name/identifier
 * @param {string} [params.details] - Additional details
 * @param {Object} [params.metadata] - Additional metadata
 * @param {string} [params.ipAddress] - IP address
 * @param {string} [params.userAgent] - User agent
 * @returns {Promise<Object>} Created activity log
 */
export async function createActivityLog({
  userId,
  action,
  entity,
  entityId,
  entityName,
  details,
  metadata,
  ipAddress,
  userAgent,
}) {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      console.warn('User not found for activity log:', userId);
      return null;
    }

    const log = await ActivityLog.create({
      userId,
      userName: user.name || 'Unknown',
      userEmail: user.email || 'unknown@email.com',
      action,
      entity,
      entityId,
      entityName,
      details,
      metadata,
      ipAddress,
      userAgent,
    });
    return log;
  } catch (error) {
    console.error('Failed to create activity log:', error);
    return null;
  }
}

/**
 * Notify admins and managers about an event
 * @param {Object} params - Notification parameters (without userId)
 * @returns {Promise<Array>} Created notifications
 */
export async function notifyAdminsAndManagers(params) {
  try {
    const adminsAndManagers = await User.find({
      role: { $in: ['ADMIN', 'MANAGER'] },
    }).select('_id').lean();

    const userIds = adminsAndManagers.map(u => u._id.toString());
    return createNotificationsForUsers(userIds, params);
  } catch (error) {
    console.error('Failed to notify admins/managers:', error);
    return [];
  }
}

/**
 * Check and create low stock notifications
 * @param {string} productId - Product ID
 * @param {number} currentStock - Current stock level
 * @param {number} minStock - Minimum stock threshold
 * @param {string} productName - Product name
 * @param {string} productSku - Product SKU
 */
export async function checkAndNotifyLowStock(productId, currentStock, minStock, productName, productSku) {
  if (currentStock > minStock) return;

  const type = currentStock === 0 ? 'ERROR' : 'LOW_STOCK';
  const title = currentStock === 0 ? 'Product Out of Stock' : 'Low Stock Alert';
  const message = currentStock === 0
    ? `${productName} (${productSku}) is out of stock!`
    : `${productName} (${productSku}) is running low (${currentStock} units remaining, minimum: ${minStock}). Consider placing a purchase order.`;

  await notifyAdminsAndManagers({
    title,
    message,
    type,
    relatedEntity: 'PRODUCT',
    relatedEntityId: productId,
    actionUrl: '/dashboard/inventory',
  });
}

/**
 * Notify about completed sale
 * @param {Object} sale - Sale object
 * @param {string} userId - User who made the sale
 */
export async function notifySaleCompleted(sale, userId) {
  await notifyAdminsAndManagers({
    title: 'Sale Completed',
    message: `Sale #${sale.saleNumber} completed for ${formatCurrency(sale.total)} by ${sale.userId?.name || 'Unknown'}`,
    type: 'NEW_ORDER',
    relatedEntity: 'SALE',
    relatedEntityId: sale._id,
    actionUrl: '/sales',
  });

  // Also notify the cashier who made the sale
  if (userId) {
    await createNotification({
      userId,
      title: 'Sale Completed',
      message: `Your sale #${sale.saleNumber} for ${formatCurrency(sale.total)} has been completed.`,
      type: 'SUCCESS',
      relatedEntity: 'SALE',
      relatedEntityId: sale._id,
      actionUrl: '/sales',
    });
  }
}

/**
 * Notify about purchase order received
 * @param {Object} purchase - Purchase object
 * @param {string} userId - User who received the purchase
 */
export async function notifyPurchaseReceived(purchase, userId) {
  await notifyAdminsAndManagers({
    title: 'Purchase Order Received',
    message: `Purchase order ${purchase.purchaseNumber} from ${purchase.supplierName} has been received. Stock has been updated.`,
    type: 'PURCHASE_RECEIVED',
    relatedEntity: 'PURCHASE',
    relatedEntityId: purchase._id,
    actionUrl: '/dashboard/purchases',
  });

  // Also notify the user who received it
  if (userId) {
    await createNotification({
      userId,
      title: 'Purchase Received',
      message: `You have received purchase order ${purchase.purchaseNumber} from ${purchase.supplierName}.`,
      type: 'SUCCESS',
      relatedEntity: 'PURCHASE',
      relatedEntityId: purchase._id,
      actionUrl: '/dashboard/purchases',
    });
  }
}

/**
 * Notify about return request
 * @param {Object} returnDoc - Return object
 * @param {string} userId - User who created the return
 */
export async function notifyReturnRequest(returnDoc, userId) {
  await notifyAdminsAndManagers({
    title: 'Return Request',
    message: `New return request ${returnDoc.returnNumber} for sale ${returnDoc.saleNumber}. Total refund: ${formatCurrency(returnDoc.total)}`,
    type: 'RETURN_REQUEST',
    relatedEntity: 'RETURN',
    relatedEntityId: returnDoc._id,
    actionUrl: '/dashboard/returns',
  });

  // Also notify the user who created it
  if (userId) {
    await createNotification({
      userId,
      title: 'Return Created',
      message: `You have created return ${returnDoc.returnNumber} for sale ${returnDoc.saleNumber}.`,
      type: 'INFO',
      relatedEntity: 'RETURN',
      relatedEntityId: returnDoc._id,
      actionUrl: '/dashboard/returns',
    });
  }
}

/**
 * Notify about payment due to supplier
 * @param {Object} supplier - Supplier object
 */
export async function notifyPaymentDue(supplier) {
  await notifyAdminsAndManagers({
    title: 'Payment Due',
    message: `${supplier.name} has ${formatCurrency(supplier.dueAmount)} due. Payment terms: Net ${supplier.paymentTerms} days.`,
    type: 'PAYMENT_DUE',
    relatedEntity: 'SUPPLIER',
    relatedEntityId: supplier._id,
    actionUrl: '/dashboard/suppliers',
  });
}