import { inject } from "../../infra/di/Registry";
import OrderDAO from "../../infra/dao/OrderDAO";

export default class GetOrders {
  @inject("orderRepository")
  orderDAO!: OrderDAO;

  async execute(): Promise<Output[]> {
    const orders = await this.orderDAO.getOrders();
    const outputs = [];
    for (const order of orders) {
      const output = {
        orderId: order.order_id,
        accountId: order.account_id,
        marketId: order.market_id,
        name: order.name,
        email: order.email,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        timestamp: order.timestamp,
        fillQuantity: order.fill_quantity,
        fillPrice: order.fill_price
      }
      outputs.push(output);
    }
    return outputs;
  }
}

type Output = {
  orderId: string;
  accountId: string;
  name: string;
  email: string;
  marketId: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  timestamp: Date;
  fillQuantity: number;
  fillPrice: number;
};
