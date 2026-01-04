import { inject } from "../../infra/di/Registry";
import OrderRepository from "../../infra/repository/OrderRepository";

export default class FillOrder {
  @inject("orderRepository")
  orderRepository!: OrderRepository;

  async execute(input: Input): Promise<void> {
    console.log(input.quantity);
    const order = await this.orderRepository.getOrderById(input.orderId);
    order.fill(input.quantity, input.price);
    await this.orderRepository.updateOrder(order);
  }
}

type Input = {
  orderId: string;
  quantity: number;
  price: number;
};
