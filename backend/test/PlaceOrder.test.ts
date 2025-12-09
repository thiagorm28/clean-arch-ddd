import Signup from "../src/application/usecase/Signup";
import AccountRepositoryDatabase from "../src/infra/repository/AccountRepository";
import WalletRepositoryDatabase from "../src/infra/repository/WalletRepository";
import Deposit from "../src/application/usecase/Deposit";
import PlaceOrder from "../src/application/usecase/PlaceOrder";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../src/infra/database/DatabaseConnection";
import Registry from "../src/infra/di/Registry";
import { OrderRepositoryDatabase } from "../src/infra/repository/OrderRepository";
import GetOrder from "../src/application/usecase/GetOrder";

let signup: Signup;
let deposit: Deposit;
let placeOrder: PlaceOrder;
let getOrder: GetOrder;
let connection: DatabaseConnection;

beforeEach(() => {
  connection = new PgPromiseAdapter();
  Registry.getInstance().register("databaseConnection", connection);
  Registry.getInstance().register(
    "accountRepository",
    new AccountRepositoryDatabase()
  );
  Registry.getInstance().register(
    "orderRepository",
    new OrderRepositoryDatabase()
  );
  Registry.getInstance().register(
    "walletRepository",
    new WalletRepositoryDatabase()
  );
  signup = new Signup();
  deposit = new Deposit();
  placeOrder = new PlaceOrder();
  getOrder = new GetOrder();
});

test("Deve criar uma ordem de compra", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await signup.execute(inputSignup);

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 10,
  };
  await deposit.execute(inputDeposit);

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 1,
    price: 10,
  };

  const orderId = await placeOrder.execute(inputPlaceOrder);

  const outputGetOrder = await getOrder.execute(orderId);
  expect(orderId).toBeDefined();
  expect(outputGetOrder.marketId).toBe("BTC/USD");
  expect(outputGetOrder.side).toBe("buy");
  expect(outputGetOrder.quantity).toBe(1);
  expect(outputGetOrder.price).toBe(10);
});

test("Deve criar uma ordem de venda", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await signup.execute(inputSignup);

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  };
  await deposit.execute(inputDeposit);

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 10,
  };

  const orderId = await placeOrder.execute(inputPlaceOrder);

  const outputGetOrder = await getOrder.execute(orderId);
  expect(orderId).toBeDefined();
  expect(outputGetOrder.marketId).toBe("BTC/USD");
  expect(outputGetOrder.side).toBe("sell");
  expect(outputGetOrder.quantity).toBe(1);
  expect(outputGetOrder.price).toBe(10);
});

afterEach(async () => {
  await connection.close();
});
