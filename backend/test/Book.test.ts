import Book from "../src/domain/Book";
import Order from "../src/domain/Order";

test("Deve casar uma ordem de compra e venda com mesmo preço e quantidade", async () => {
  const book = new Book("BTC/USD");

  const buy = Order.create(crypto.randomUUID(), "BTC/USD", "buy", 2, 10);
  const sell = Order.create(crypto.randomUUID(), "BTC/USD", "sell", 2, 10);

  await book.insert(buy);
  await book.insert(sell);

  expect(buy.getFillQuantity()).toBe(2);
  expect(sell.getFillQuantity()).toBe(2);
  expect(buy.getStatus()).toBe("closed");
  expect(sell.getStatus()).toBe("closed");
});

test("Deve casar parcialmente quando as quantidades diferem", async () => {
  const book = new Book("BTC/USD");

  const buy = Order.create(crypto.randomUUID(), "BTC/USD", "buy", 3, 10);
  const sell = Order.create(crypto.randomUUID(), "BTC/USD", "sell", 1, 10);

  await book.insert(buy);
  await book.insert(sell);

  expect(buy.getFillQuantity()).toBe(1);
  expect(sell.getFillQuantity()).toBe(1);
  expect(buy.getAvailableQuantity()).toBe(2);
  expect(sell.getStatus()).toBe("closed");
});

test("Não deve casar quando os preços não são compatíveis", async () => {
  const book = new Book("BTC/USD");

  const buy = Order.create(crypto.randomUUID(), "BTC/USD", "buy", 1, 9);
  const sell = Order.create(crypto.randomUUID(), "BTC/USD", "sell", 1, 10);

  await book.insert(buy);
  await book.insert(sell);

  expect(buy.getFillQuantity()).toBe(0);
  expect(sell.getFillQuantity()).toBe(0);
  expect(buy.getStatus()).toBe("open");
  expect(sell.getStatus()).toBe("open");
});
