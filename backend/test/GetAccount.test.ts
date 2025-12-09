import GetAccount from "../src/application/usecase/GetAccount";
import Signup from "../src/application/usecase/Signup";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../src/infra/database/DatabaseConnection";
import Registry from "../src/infra/di/Registry";
import AccountRepositoryDatabase from "../src/infra/repository/AccountRepository";
import WalletRepositoryDatabase from "../src/infra/repository/WalletRepository";

let getAccount: GetAccount;
let signup: Signup;
let connection: DatabaseConnection;

beforeEach(() => {
  connection = new PgPromiseAdapter();
  Registry.getInstance().register("databaseConnection", connection);
  Registry.getInstance().register(
    "accountRepository",
    new AccountRepositoryDatabase()
  );
  Registry.getInstance().register(
    "walletRepository",
    new WalletRepositoryDatabase()
  );
  signup = new Signup();
  getAccount = new GetAccount();
});

test("Deve buscar uma conta", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await signup.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.document).toBe(input.document);
  expect(outputGetAccount.password).toBe(input.password);
});

afterEach(async () => {
  await connection.close();
});
