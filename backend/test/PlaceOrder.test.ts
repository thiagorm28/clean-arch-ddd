import Signup from "../src/application/usecase/Signup";
import GetAccount from "../src/application/usecase/GetAccount";
import AccountRepositoryDatabase from "../src/infra/repository/AccountRepository";
import Deposit from "../src/application/usecase/Deposit";
import PlaceOrder from "../src/application/usecase/PlaceOrder";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../src/infra/database/DatabaseConnection";
import Registry from "../src/infra/di/Registry";

let signup: Signup;
let getAccount: GetAccount;
let deposit: Deposit;
let placeOrder: PlaceOrder;
let connection: DatabaseConnection;

beforeEach(() => {
  connection = new PgPromiseAdapter();
  Registry.getInstance().register("databaseConnection", connection);
  Registry.getInstance().register(
    "accountRepository",
    new AccountRepositoryDatabase()
  );
  signup = new Signup();
  getAccount = new GetAccount();
  deposit = new Deposit();
  placeOrder = new PlaceOrder();
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

  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(orderId).toBeDefined();
  expect(outputGetAccount.orders).toHaveLength(1);
  expect(outputGetAccount.orders[0].marketId).toBe("BTC/USD");
  expect(outputGetAccount.orders[0].side).toBe("buy");
  expect(outputGetAccount.orders[0].quantity).toBe(1);
  expect(outputGetAccount.orders[0].price).toBe(10);
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

  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(orderId).toBeDefined();
  expect(outputGetAccount.orders).toHaveLength(1);
  expect(outputGetAccount.orders[0].marketId).toBe("BTC/USD");
  expect(outputGetAccount.orders[0].side).toBe("sell");
  expect(outputGetAccount.orders[0].quantity).toBe(1);
  expect(outputGetAccount.orders[0].price).toBe(10);
});

afterEach(async () => {
  await connection.close();
});
