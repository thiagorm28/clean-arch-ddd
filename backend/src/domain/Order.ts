import UUID from "./UUID";

export default class Order {
  private orderId: UUID;
  private accountId: UUID;
  constructor(
    orderId: string,
    accountId: string,
    readonly marketId: string,
    readonly side: string,
    readonly quantity: number,
    readonly price: number,
    readonly status: string,
    readonly timestamp: Date
  ) {
    if (quantity <= 0) throw new Error("Quantity must be positive");
    if (price <= 0) throw new Error("Price must be positive");

    this.orderId = new UUID(orderId);
    this.accountId = new UUID(accountId);
  }

  static create(
    accountId: string,
    marketId: string,
    side: string,
    quantity: number,
    price: number
  ): Order {
    const orderId = UUID.create();
    const status = "open";
    const timestamp = new Date();
    return new Order(
      accountId,
      orderId.getValue(),
      marketId,
      side,
      quantity,
      price,
      status,
      timestamp
    );
  }

  getMainAssetId() {
    const [mainAssetId, paymentAssetId] = this.marketId.split("/");
    return mainAssetId;
  }

  getPaymentAssetId() {
    const [mainAssetId, paymentAssetId] = this.marketId.split("/");
    return paymentAssetId;
  }

  getOrderId() {
    return this.orderId.getValue();
  }

  getAccountId() {
    return this.accountId.getValue();
  }
}
