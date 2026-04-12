import OrderDAO from "../../infra/dao/OrderDAO";
import { inject } from "../../infra/di/Registry";

export default class UpdateDepthProjection {
  @inject("orderDAO")
  orderDAO!: OrderDAO;

  async execute(input: any): Promise<void> {
    await this.orderDAO.updateDepthProjection(input);
  }
}