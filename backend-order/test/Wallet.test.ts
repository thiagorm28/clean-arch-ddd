import Wallet from "../src/domain/Wallet";
import Order from "../src/domain/Order";

test("Deve fazer dois depósitos", () => {
  const wallet = Wallet.create(crypto.randomUUID());

  wallet.deposit("BTC", 1);
  wallet.deposit("BTC", 1);

  expect(wallet.getBalance("BTC")).toBe(2);
});

test("Não deve fazer um depósito quando a quantidade for menor ou igual 0", () => {
  const wallet = Wallet.create(crypto.randomUUID());

  expect(() => wallet.deposit("BTC", 0)).toThrow(
    new Error("Quantity must be positive")
  );
});

test("Deve fazer um saque", () => {
  const wallet = Wallet.create(crypto.randomUUID());

  wallet.deposit("BTC", 2);
  wallet.withdraw("BTC", 1);

  expect(wallet.getBalance("BTC")).toBe(1);
});

test("Não deve fazer um saque quando a quantidade for menor ou igual 0", () => {
  const wallet = Wallet.create(crypto.randomUUID());

  wallet.deposit("BTC", 2);

  expect(() => wallet.withdraw("BTC", 0)).toThrow(
    new Error("Quantity must be positive")
  );
});

test("Não deve fazer um saque quando o saldo não for suficiente", () => {
  const wallet = Wallet.create(crypto.randomUUID());

  wallet.deposit("BTC", 1);

  expect(() => wallet.withdraw("BTC", 2)).toThrow(
    new Error("Insufficient funds")
  );
});

test("Deve criar uma ordem de compra", () => {
  const wallet = Wallet.create(crypto.randomUUID());

  wallet.deposit("USD", 10);

  const order = Order.create(wallet.getAccountId(), "BTC/USD", "buy", 1, 10);
  wallet.processOrder(order);

  expect(wallet.getBalance("USD")).toBe(0);
});

test("Não deve criar uma ordem de compra quando o saldo é insuficiente", () => {
  const wallet = Wallet.create(crypto.randomUUID());

  wallet.deposit("USD", 10);

  const order = Order.create(wallet.getAccountId(), "BTC/USD", "buy", 1, 11);
  expect(() => wallet.processOrder(order)).toThrow(
    new Error("Insufficient funds")
  );

  expect(wallet.getBalance("USD")).toBe(10);
});
