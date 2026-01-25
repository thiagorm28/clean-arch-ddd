import axios from "axios";
import ExecuteOrder from "../../application/usecase/ExecuteOrder";
import FillOrder from "../../application/usecase/FillOrder";
import PlaceOrder from "../../application/usecase/PlaceOrder";
import Order from "../../domain/Order";
import { inject } from "../di/Registry";
import HttpServer from "../http/HttpServer";
import Mediator from "../mediator/Mediator";
import BookGateway from "../gateway/BookGateway";
import Queue from "../queue/Queue";

export default class OrderController {
  @inject("fillOrder")
  fillOrder!: FillOrder;
  @inject("placeOrder")
  placeOrder!: PlaceOrder;
  @inject("executeOrder")
  executeOrder!: ExecuteOrder;
  @inject("bookGateway")
  bookGateway!: BookGateway;
  @inject("httpServer")
  httpServer!: HttpServer;
  @inject("mediator")
  mediator!: Mediator;
  @inject("queue")
  queue!: Queue;

  constructor() {
    this.httpServer.route(
      "post",
      "/fill_order",
      async (params: any, body: any) => {
        console.log("fillOrder");
        const input = body;
        await this.fillOrder.execute(input);
      },
    );
    this.httpServer.route(
      "post",
      "/place_order",
      async (params: any, body: any) => {
        const input = body;
        await this.placeOrder.execute(input);
      },
    );
    this.mediator.register("orderPlaced", async (order: Order) => {
      // await this.executeOrder.execute(order.marketId); // Faz usando o use case que busca no banco
      // await this.bookGateway.insertOrder(order); // Faz direto pela API do matching engine
      console.log("orderPlaced");
      const body = {
        orderId: order.getOrderId(),
        accountId: order.getAccountId(),
        marketId: order.marketId,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        fillQuantity: order.getFillQuantity(),
        fillPrice: order.getFillPrice(),
        status: order.getStatus(),
        timestamp: order.timestamp,
      };
      await this.queue.publish("orderPlaced", body);
    });

    this.queue.consume("orderFilled.fillOrder", async (data: any) => {
      console.log("fillOrder");
      await this.fillOrder.execute(data);
    });
  }
}
