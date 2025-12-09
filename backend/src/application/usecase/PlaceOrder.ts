import Order from "../../domain/Order";
import { inject } from "../../infra/di/Registry";
import OrderRepository from "../../infra/repository/OrderRepository";
import WalletRepository from "../../infra/repository/WalletRepository";

export default class PlaceOrder {
  @inject("walletRepository")
  walletRepository!: WalletRepository;
  @inject("orderRepository")
  orderRepository!: OrderRepository;

  async execute(input: Input): Promise<string> {
    const wallet = await this.walletRepository.getWallet(input.accountId);

    const order = Order.create(
      input.accountId,
      input.marketId,
      input.side,
      input.quantity,
      input.price
    );
    wallet.processOrder(order);

    await this.orderRepository.saveOrder(order);
    await this.walletRepository.upsertWallet(wallet);

    return order.getOrderId();
  }
}

type Input = {
  marketId: string;
  accountId: string;
  side: string;
  quantity: number;
  price: number;
};
