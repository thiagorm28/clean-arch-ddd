import GetAccount from "../src/GetAccount";
import Signup from "../src/Signup";
import AccountRepositoryDatabase from "../src/AccountRepository";

let getAccount: GetAccount;
let signup: Signup;

beforeEach(() => {
  const accountRepositoryDatabase = new AccountRepositoryDatabase();
  signup = new Signup(accountRepositoryDatabase);
  getAccount = new GetAccount(accountRepositoryDatabase);
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
