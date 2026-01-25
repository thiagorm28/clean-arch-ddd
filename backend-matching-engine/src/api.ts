import { PgPromiseAdapter } from "./infra/database/DatabaseConnection";
import { ExpressAdapter } from "./infra/http/HttpServer";
import Registry from "./infra/di/Registry";
import BookController from "./infra/controller/BookController";
import axios from "axios";
import Book from "./domain/Book";
import { RabbitMQAdapter } from "./infra/queue/Queue";

async function main() {
  const httpServer = new ExpressAdapter();
  const queue = new RabbitMQAdapter();
  await queue.connect();

  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("queue", queue);
  Registry.getInstance().register("databaseConnection", new PgPromiseAdapter());
  const book = new Book("BTC-USD");

  book.register("orderFilled", async (data: any) => {
    console.log("orderFilled");
    // await axios.post("http://localhost:3000/fill_order", data);
    queue.publish("orderFilled", data);
  });
  Registry.getInstance().register("book", book);
  new BookController();
  httpServer.listen(3001);
}

main();
