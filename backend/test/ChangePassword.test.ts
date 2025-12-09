import ChangePassword from "../src/application/usecase/ChangePassword";
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
let changePassword: ChangePassword;
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
  changePassword = new ChangePassword();
});

test("Deve alterar a senha de uma conta", async () => {
  const signupInput = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await signup.execute(signupInput);
  const changePasswordInput = {
    accountId: outputSignup.accountId,
    newPassword: "newPassword123",
  };
  await changePassword.execute(changePasswordInput);
  const outputGetAccount = await getAccount.execute(outputSignup.accountId);

  expect(outputGetAccount.password).toBe(changePasswordInput.newPassword);
});

afterEach(async () => {
  await connection.close();
});
