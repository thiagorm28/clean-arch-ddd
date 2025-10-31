import Account from "../src/Account";

test("Não deve criar uma conta com nome inválido", () => {
  expect(() =>
    Account.create("John", "john.doe@gmail.com", "97456321558", "asdQWE123")
  ).toThrow(new Error("Invalid name"));
});

test("Não deve criar uma conta com email inválido", () => {
  expect(() =>
    Account.create("John Doe", "john.doe@gmail", "97456321558", "asdQWE123")
  ).toThrow(new Error("Invalid email"));
});

test("Não deve criar uma conta com documento inválido", () => {
  expect(() =>
    Account.create("John Doe", "john.doe@gmail.com", "974563215", "asdQWE123")
  ).toThrow(new Error("Invalid document"));
});

test("Não deve criar uma conta com senha inválida", () => {
  expect(() =>
    Account.create("John Doe", "john.doe@gmail.com", "97456321558", "asdQWEasd")
  ).toThrow(new Error("Invalid password"));
});

test("Deve fazer dois depósitos", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123"
  );

  account.deposit("BTC", 1);
  account.deposit("BTC", 1);

  expect(account.getBalance("BTC")).toBe(2);
});

test("Não deve fazer um depósito quando a quantidade for menor ou igual 0", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123"
  );

  expect(() => account.deposit("BTC", 0)).toThrow(
    new Error("Quantity must be positive")
  );
});

test("Deve fazer um saque", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123"
  );

  account.deposit("BTC", 2);
  account.withdraw("BTC", 1);

  expect(account.getBalance("BTC")).toBe(1);
});

test("Não deve fazer um saque quando a quantidade for menor ou igual 0", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123"
  );

  account.deposit("BTC", 2);

  expect(() => account.withdraw("BTC", 0)).toThrow(
    new Error("Quantity must be positive")
  );
});

test("Não deve fazer um saque quando o saldo não for suficiente", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123"
  );

  account.deposit("BTC", 1);

  expect(() => account.withdraw("BTC", 2)).toThrow(
    new Error("Insufficient funds")
  );
});
