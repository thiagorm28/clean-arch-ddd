import { PgPromiseAdapter } from "./infra/database/DatabaseConnection";
import { ExpressAdapter } from "./infra/http/HttpServer";
import Registry from "./infra/di/Registry";
import OrderController from "./infra/controller/OrderController";
import Mediator from "./infra/mediator/Mediator";
import { RabbitMQAdapter } from "./infra/queue/Queue";
import GetOrders from "./application/usecase/GetOrders";
import CreateOrderProjection from "./application/usecase/CreateOrderProjection";
import UpdateOrderProjection from "./application/usecase/UpdateOrderProjection";
import { OrderDAODatabase } from "./infra/dao/OrderDAO";
import { AccountGatewayHttp } from "./infra/gateway/AccountGateway";
import UpdateDepthProjection from "./application/usecase/UpdateDepthProjection";

async function main() {
  const httpServer = new ExpressAdapter();
  const mediator = new Mediator();
  const queue = new RabbitMQAdapter();
  await queue.connect();

  Registry.getInstance().register("mediator", mediator);
  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("queue", queue);
  Registry.getInstance().register("databaseConnection", new PgPromiseAdapter());
  Registry.getInstance().register("orderDAO", new OrderDAODatabase());
  Registry.getInstance().register("accountGateway", new AccountGatewayHttp());

  Registry.getInstance().register("getOrders", new GetOrders());
  Registry.getInstance().register("createOrderProjection", new CreateOrderProjection());
  Registry.getInstance().register("updateOrderProjection", new UpdateOrderProjection());
  Registry.getInstance().register("updateDepthProjection", new UpdateDepthProjection());

  new OrderController();

  httpServer.listen(3004);
}

main();
