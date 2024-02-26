import { Order } from '@/domain/delivery/enterprise/entities/order';

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id,
      title: order.title,
      recipientId: order.recipientId,
      status: order.status,
      createdAt: order.createdAt,
      picknUpAt: order.picknUpAt,
      deliveryAt: order.deliveryAt,
    };
  }
}
