import WalletRepositoryDatabase from "../src/infra/repository/WalletRepository";
import Deposit from "../src/application/usecase/Deposit";
import PlaceOrder from "../src/application/usecase/PlaceOrder";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../src/infra/database/DatabaseConnection";
import Registry from "../src/infra/di/Registry";
import { OrderRepositoryDatabase } from "../src/infra/repository/OrderRepository";
import Mediator from "../src/infra/mediator/Mediator";
import GetDepth from "../src/application/usecase/GetDepth";
import AccountGateway, {
  AccountGatewayHttp,
} from "../src/infra/gateway/AccountGateway";

let accountGateway: AccountGateway;
let deposit: Deposit;
let placeOrder: PlaceOrder;
let getDepth: GetDepth;
let connection: DatabaseConnection;
let marketId: string;

beforeEach(() => {
  connection = new PgPromiseAdapter();
  marketId = `BTC/USD/${Math.random()}`;

  Registry.getInstance().register("databaseConnection", connection);
  const orderRepository = new OrderRepositoryDatabase();
  Registry.getInstance().register("orderRepository", orderRepository);
  Registry.getInstance().register(
    "walletRepository",
    new WalletRepositoryDatabase()
  );
  const mediator = new Mediator();
  Registry.getInstance().register("mediator", mediator);

  accountGateway = new AccountGatewayHttp();
  deposit = new Deposit();
  placeOrder = new PlaceOrder();
  getDepth = new GetDepth();
});

test("Deve ter a quantidade correta de profundidade", async () => {
  const marketId = `BTC/USD/${Math.random()}`;
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
    quantity: 100,
  });

  await placeOrder.execute({
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 1,
    price: 10,
  });

  await placeOrder.execute({
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 1,
    price: 11,
  });

  await placeOrder.execute({
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 10,
  });

  await placeOrder.execute({
    marketId: marketId,
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 11,
  });

  const outputGetDepth = await getDepth.execute(marketId);
  expect(outputGetDepth.marketId).toBe(marketId);
  expect(outputGetDepth.buys).toHaveLength(2);
  expect(outputGetDepth.sells).toHaveLength(2);
  expect(outputGetDepth.buys[0].price).toEqual(10);
  expect(outputGetDepth.buys[0].quantity).toEqual(1);
  expect(outputGetDepth.buys[1].price).toEqual(11);
  expect(outputGetDepth.buys[1].quantity).toEqual(1);
  expect(outputGetDepth.sells[0].price).toEqual(10);
  expect(outputGetDepth.sells[0].quantity).toEqual(1);
  expect(outputGetDepth.sells[1].price).toEqual(11);
  expect(outputGetDepth.sells[1].quantity).toEqual(1);
});

afterEach(async () => {
  await connection.close();
});
