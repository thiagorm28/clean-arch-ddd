import generateUUID from "./generateUUID";

export default class Order {
  constructor(
    readonly orderId: string,
    readonly marketId: string,
    readonly side: string,
    readonly quantity: number,
    readonly price: number
  ) {
    if (quantity <= 0) throw new Error("Quantity must be positive");
    if (price <= 0) throw new Error("Price must be positive");
  }

  static create(
    marketId: string,
    side: string,
    quantity: number,
    price: number
  ): Order {
    const orderId = generateUUID();
    return new Order(orderId, marketId, side, quantity, price);
  }
}
