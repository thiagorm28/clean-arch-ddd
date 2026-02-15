import { inject } from "../../infra/di/Registry";
import AccountGateway from "../../infra/gateway/AccountGateway";
import OrderDAO from "../../infra/dao/OrderDAO";

export default class UpdateOrderProjection {
  @inject("orderDAO")
  orderDAO!: OrderDAO;
  @inject("accountGateway")
  accountGateway!: AccountGateway;

  async execute(input: any): Promise<void> {
    await this.orderDAO.updateOrderProjection(input);
  }
}