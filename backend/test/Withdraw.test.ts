import Signup from "../src/Signup";
import GetAccount from "../src/GetAccount";
import AccountRepositoryDatabase from "../src/AccountRepository";
import Deposit from "../src/Deposit";
import Withdraw from "../src/Withdraw";

let signup: Signup;
let getAccount: GetAccount;
let deposit: Deposit;
let withdraw: Withdraw;

beforeEach(() => {
  const accountRepositoryDatabase = new AccountRepositoryDatabase();
  signup = new Signup(accountRepositoryDatabase);
  getAccount = new GetAccount(accountRepositoryDatabase);
  deposit = new Deposit(accountRepositoryDatabase);
  withdraw = new Withdraw(accountRepositoryDatabase);
});

test("Deve fazer um saque", async () => {
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
    quantity: 2,
  };
  await deposit.execute(inputDeposit);

  const inputwithdraw = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  };
  await withdraw.execute(inputwithdraw);
  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(outputGetAccount.assets).toHaveLength(1);
  expect(outputGetAccount.assets[0].assetId).toBe("BTC");
  expect(outputGetAccount.assets[0].quantity).toBe(1);
});

test("Não deve fazer um saque quando saldo insuficiente", async () => {
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
    quantity: 2,
  };
  await deposit.execute(inputDeposit);

  const inputwithdraw = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 3,
  };

  expect(withdraw.execute(inputwithdraw)).rejects.toThrow(
    new Error("Insufficient funds")
  );
});
