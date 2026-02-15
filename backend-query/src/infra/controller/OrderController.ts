
import CreateOrderProjection from "../../application/usecase/CreateOrderProjection";
import GetOrders from "../../application/usecase/GetOrders";
import UpdateOrderProjection from "../../application/usecase/UpdateOrderProjection";
import { inject } from "../di/Registry";
import HttpServer from "../http/HttpServer";
import Queue from "../queue/Queue";

export default class OrderController {
  @inject("httpServer")
  httpServer!: HttpServer;
  @inject("getOrders")
  getOrders!: GetOrders;
  @inject("createOrderProjection")
  createOrderProjection!: CreateOrderProjection;
  @inject("updateOrderProjection")
  updateOrderProjection!: UpdateOrderProjection;
  @inject("queue")
  queue!: Queue;

  constructor() {
    this.httpServer.route(
      "get",
      "/orders",
      async (params: any, body: any) => {
        const input = body;
        return await this.getOrders.execute();
      },
    );

    this.queue.consume("orderPlaced.createOrderProjection", async (body: any) => {
      console.log("createOrderProjection");
      await this.createOrderProjection.execute(body);
    });
    this.queue.consume("orderFilled.updateOrderProjection", async (body: any) => {
      console.log("updateOrderProjection");
      console.log(body);
      await this.updateOrderProjection.execute(body);
    });
  }
}
