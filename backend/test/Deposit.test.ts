import Signup from "../src/Signup";
import GetAccount from "../src/GetAccount";
import AccountRepositoryDatabase from "../src/AccountRepository";
import Deposit from "../src/Deposit";

let signup: Signup;
let getAccount: GetAccount;
let deposit: Deposit;

beforeEach(() => {
  const accountRepositoryDatabase = new AccountRepositoryDatabase();
  signup = new Signup(accountRepositoryDatabase);
  getAccount = new GetAccount(accountRepositoryDatabase);
  deposit = new Deposit(accountRepositoryDatabase);
});

test("Deve fazer um depósito", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await signup.execute(inputSignup);

  const inpustDeposit = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  };
  await deposit.execute(inpustDeposit);
  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(outputGetAccount.assets).toHaveLength(1);
  expect(outputGetAccount.assets[0].assetId).toBe("BTC");
  expect(outputGetAccount.assets[0].quantity).toBe(1);
});
