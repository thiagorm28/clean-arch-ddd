import WalletRepositoryDatabase from "../src/infra/dao/WalletRepository";
import Deposit from "../src/application/usecase/Deposit";
import PlaceOrder from "../src/application/usecase/PlaceOrder";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../src/infra/database/DatabaseConnection";
import Registry from "../src/infra/di/Registry";
import { OrderRepositoryDatabase } from "../src/infra/dao/OrderRepository";
import GetOrder from "../src/application/usecase/GetOrder";
import Mediator from "../src/infra/mediator/Mediator";
import GetDepth from "../src/application/usecase/GetDepth";
import BookGateway, { BookGatewayHttp } from "../src/infra/gateway/BookGateway";
import AccountGateway, {
  AccountGatewayHttp,
} from "../src/infra/gateway/AccountGateway";

let accountGateway: AccountGateway;
let deposit: Deposit;
let bookGateway: BookGateway;
let placeOrder: PlaceOrder;
let getOrder: GetOrder;
let getDepth: GetDepth;
let connection: DatabaseConnection;
let marketId: string;

beforeEach(() => {
  connection = new PgPromiseAdapter();
  marketId = `BTC-USD-${Math.random()}`;

  Registry.getInstance().register("databaseConnection", connection);
  const orderRepository = new OrderRepositoryDatabase();
  Registry.getInstance().register("orderRepository", orderRepository);
  Registry.getInstance().register(
    "walletRepository",
    new WalletRepositoryDatabase(),
  );

  const mediator = new Mediator();
  const bookGateway = new BookGatewayHttp();
  mediator.register("orderPlaced", async (order: any) => {
    await bookGateway.insertOrder(order);
  });
  Registry.getInstance().register("mediator", mediator);

  accountGateway = new AccountGatewayHttp();
  deposit = new Deposit();
  placeOrder = new PlaceOrder();
  getOrder = new GetOrder();
  getDepth = new GetDepth();
});

test("Deve criar uma ordem de compra", async () => {
  const marketId = `BTC-USD-${Math.random()}`;
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await accountGateway.signup(inputSignup);

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 10,
  };
  await deposit.execute(inputDeposit);

  const inputPlaceOrder = {
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 1,
    price: 10,
  };

  const orderId = await placeOrder.execute(inputPlaceOrder);

  const outputGetOrder = await getOrder.execute(orderId);
  expect(orderId).toBeDefined();
  expect(outputGetOrder.marketId).toBe(marketId);
  expect(outputGetOrder.side).toBe("buy");
  expect(outputGetOrder.quantity).toBe(1);
  expect(outputGetOrder.price).toBe(10);
  const outputGetDepth = await getDepth.execute(marketId);
  expect(outputGetDepth.marketId).toBe(marketId);
  expect(outputGetDepth.buys).toHaveLength(1);
  expect(outputGetDepth.sells).toHaveLength(0);
});

test("Deve criar uma ordem de venda", async () => {
  const marketId = `BTC-USD-${Math.random()}`;
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await accountGateway.signup(inputSignup);

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  };
  await deposit.execute(inputDeposit);

  const inputPlaceOrder = {
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 10,
  };

  const orderId = await placeOrder.execute(inputPlaceOrder);

  const outputGetOrder = await getOrder.execute(orderId);
  expect(orderId).toBeDefined();
  expect(outputGetOrder.marketId).toBe(marketId);
  expect(outputGetOrder.side).toBe("sell");
  expect(outputGetOrder.quantity).toBe(1);
  expect(outputGetOrder.price).toBe(10);
});

test("Deve criar ordens e executá-las", async () => {
  const marketId = `BTC-USD-${Math.random()}`;
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await accountGateway.signup(inputSignup);

  await deposit.execute({
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 100,
  });
  await deposit.execute({
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  });

  const inputPlaceOrderBuy = {
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 1,
    price: 10,
  };

  const inputPlaceOrderSell = {
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 8,
  };

  const buyOrderId = await placeOrder.execute(inputPlaceOrderBuy);
  const sellOrderId = await placeOrder.execute(inputPlaceOrderSell);

  const outputGetOrderBuy = await getOrder.execute(buyOrderId);
  expect(outputGetOrderBuy.fillQuantity).toBe(1);
  expect(outputGetOrderBuy.fillPrice).toBe(10);
  expect(outputGetOrderBuy.status).toBe("closed");
  const outputGetOrderSell = await getOrder.execute(sellOrderId);
  expect(outputGetOrderSell.fillQuantity).toBe(1);
  expect(outputGetOrderSell.fillPrice).toBe(10);
  expect(outputGetOrderSell.status).toBe("closed");
});

test("Deve criar 1 ordem de compra e várias de venda", async () => {
  const marketId = `BTC-USD-${Math.random()}`;
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await accountGateway.signup(inputSignup);

  await deposit.execute({
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 1000,
  });

  await deposit.execute({
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  });

  const inputPlaceOrderBuy1 = {
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 1,
    price: 10,
  };

  const inputPlaceOrderBuy2 = {
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 1,
    price: 9,
  };

  const inputPlaceOrderBuy3 = {
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 1,
    price: 11,
  };

  const inputPlaceOrderSell = {
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 8,
  };

  const buyOrderId1 = await placeOrder.execute(inputPlaceOrderBuy1);
  const buyOrderId2 = await placeOrder.execute(inputPlaceOrderBuy2);
  const buyOrderId3 = await placeOrder.execute(inputPlaceOrderBuy3);
  const sellOrderId = await placeOrder.execute(inputPlaceOrderSell);

  const outputGetOrderBuy1 = await getOrder.execute(buyOrderId1);
  const outputGetOrderBuy2 = await getOrder.execute(buyOrderId2);
  const outputGetOrderBuy3 = await getOrder.execute(buyOrderId3);
  expect(outputGetOrderBuy1.fillQuantity).toBe(0);
  expect(outputGetOrderBuy1.fillPrice).toBe(0);
  expect(outputGetOrderBuy1.status).toBe("open");
  expect(outputGetOrderBuy2.fillQuantity).toBe(0);
  expect(outputGetOrderBuy2.fillPrice).toBe(0);
  expect(outputGetOrderBuy2.status).toBe("open");

  expect(outputGetOrderBuy3.fillQuantity).toBe(1);
  expect(outputGetOrderBuy3.fillPrice).toBe(11);
  expect(outputGetOrderBuy3.status).toBe("closed");
  const outputGetOrderSell = await getOrder.execute(sellOrderId);
  expect(outputGetOrderSell.fillQuantity).toBe(1);
  expect(outputGetOrderSell.fillPrice).toBe(11);
  expect(outputGetOrderSell.status).toBe("closed");
});

afterEach(async () => {
  await connection.close();
});
