import { PgPromiseAdapter } from "./infra/database/DatabaseConnection";
import { ExpressAdapter } from "./infra/http/HttpServer";
import Registry from "./infra/di/Registry";
import OrderController from "./infra/controller/OrderController";
import FillOrder from "./application/usecase/FillOrder";
import WalletRepositoryDatabase from "./infra/repository/WalletRepository";
import { OrderRepositoryDatabase } from "./infra/repository/OrderRepository";
import Deposit from "./application/usecase/Deposit";
import WalletController from "./infra/controller/WalletController";
import Mediator from "./infra/mediator/Mediator";
import PlaceOrder from "./application/usecase/PlaceOrder";
import ExecuteOrder from "./application/usecase/ExecuteOrder";
import { BookGatewayHttp } from "./infra/gateway/BookGateway";
import { RabbitMQAdapter } from "./infra/queue/Queue";

async function main() {
  const httpServer = new ExpressAdapter();
  const mediator = new Mediator();
  const queue = new RabbitMQAdapter();
  await queue.connect();
  await queue.setup("orderPlaced", "orderPlaced.executeOrder");
  await queue.setup("orderPlaced", "orderPlaced.createOrderProjection");
  await queue.setup("orderFilled", "orderFilled.fillOrder");
  await queue.setup("orderFilled", "orderFilled.updateOrderProjection");

  Registry.getInstance().register("mediator", mediator);
  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("queue", queue);
  Registry.getInstance().register("databaseConnection", new PgPromiseAdapter());

  Registry.getInstance().register(
    "orderRepository",
    new OrderRepositoryDatabase(),
  );
  Registry.getInstance().register(
    "walletRepository",
    new WalletRepositoryDatabase(),
  );
  Registry.getInstance().register("bookGateway", new BookGatewayHttp());

  Registry.getInstance().register("fillOrder", new FillOrder());
  Registry.getInstance().register("placeOrder", new PlaceOrder());
  Registry.getInstance().register("executeOrder", new ExecuteOrder());
  Registry.getInstance().register("deposit", new Deposit());

  new OrderController();
  new WalletController();

  httpServer.listen(3000);
}

main();
