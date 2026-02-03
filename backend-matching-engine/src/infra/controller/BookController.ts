import HttpServer from "../http/HttpServer";
import { inject } from "../di/Registry";
import Book from "../../domain/Book";
import Order from "../../domain/Order";
import Queue from "../queue/Queue";
import BookCache from "../cache/BookCache";

export default class BookController {
  @inject("httpServer")
  httpServer!: HttpServer;
  @inject("books")
  books!: BookCache;
  @inject("queue")
  queue!: Queue;

  constructor() {
    this.httpServer.route(
      "post",
      "/markets/:marketId/orders",
      async (params: any, body: any) => {
        const order = new Order(
          body.orderId,
          body.accountId,
          body.marketId,
          body.side,
          body.quantity,
          body.price,
          body.status,
          new Date(body.timestamp),
          body.fillQuantity,
          body.fillPrice,
        );
        const book = this.books.getOrCreateBook(body.marketId);
        await book.insert(order);
      },
    );
    this.queue.consume("orderPlaced.executeOrder", async (data: any) => {
      const order = new Order(
        data.orderId,
        data.accountId,
        data.marketId,
        data.side,
        data.quantity,
        data.price,
        data.status,
        new Date(data.timestamp),
        data.fillQuantity,
        data.fillPrice,
      );
      const book = this.books.getOrCreateBook(data.marketId);
      await book.insert(order);
    });
  }
}
