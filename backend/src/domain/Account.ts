import Asset from "./Asset";
import generateUUID from "./generateUUID";
import Order from "./Order";
import UUID from "./UUID";
import Name from "./Name";
import Email from "./Email";
import Password from "./Password";
import Document from "./Document";

export default class Account {
  private accountId: UUID;
  private name: Name;
  private email: Email;
  private document: Document;
  private password: Password;
  assets: Asset[];
  orders: Order[];

  constructor(
    accountId: string,
    name: string,
    email: string,
    document: string,
    password: string,
    assets: Asset[],
    orders: Order[]
  ) {
    this.accountId = new UUID(accountId);
    this.name = new Name(name);
    this.email = new Email(email);
    this.document = new Document(document);
    this.password = new Password(password);
    this.assets = assets;
    this.orders = orders;
  }

  static create(
    name: string,
    email: string,
    document: string,
    password: string
  ): Account {
    const accountId = generateUUID();
    const assets: Asset[] = [];
    const orders: Order[] = [];
    return new Account(
      accountId,
      name,
      email,
      document,
      password,
      assets,
      orders
    );
  }

  static build(accountBuilder: AccountBuilder): Account {
    return Account.create(
      accountBuilder.name,
      accountBuilder.email,
      accountBuilder.document,
      accountBuilder.password
    );
  }

  deposit(assetId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    const asset = this.assets.find((asset) => asset.assetId === assetId);
    if (asset) {
      asset.quantity += quantity;
    } else {
      this.assets.push(new Asset(assetId, quantity));
    }
  }

  withdraw(assetId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    const asset = this.assets.find((asset) => asset.assetId === assetId);
    if (!asset || asset.quantity < quantity) {
      throw new Error("Insufficient funds");
    }

    asset.quantity -= quantity;
  }

  getBalance(assetId: string) {
    const asset = this.assets.find((asset) => asset.assetId === assetId);
    if (!asset) {
      return 0;
    }
    return asset.quantity;
  }

  placeOrder(
    marketId: string,
    side: string,
    quantity: number,
    price: number
  ): string {
    const [mainAssetId, paymentAssetId] = marketId.split("/");
    const mainAsset = this.assets.find(
      (asset) => asset.assetId === mainAssetId
    );
    const paymentAsset = this.assets.find(
      (asset) => asset.assetId === paymentAssetId
    );

    let orderId = "";
    if (side === "buy") {
      if (!paymentAsset || paymentAsset.quantity < quantity * price) {
        throw new Error("Insufficient funds");
      }
      const createdOrder = Order.create(marketId, side, quantity, price);
      this.orders.push(createdOrder);

      orderId = createdOrder.orderId;
    } else {
      if (!mainAsset || mainAsset.quantity < quantity) {
        throw new Error("Insufficient funds");
      }
      const createdOrder = Order.create(marketId, side, quantity, price);
      this.orders.push(createdOrder);

      orderId = createdOrder.orderId;
    }
    return orderId;
  }

  getAccountId() {
    return this.accountId.getValue();
  }

  getName() {
    return this.name.getValue();
  }

  getEmail() {
    return this.email.getValue();
  }

  getDocument() {
    return this.document.getValue();
  }

  getPassword() {
    return this.password.getValue();
  }

  //   executeOrder(
  //   marketId: string,
  //   accountId: string,
  //   side: string,
  //   quantity: number,
  //   price: number
  // ) {
  //   const [mainAssetId, paymentAssetId] = marketId.split("/");
  //   const mainAsset = this.assets.find(
  //     (asset) => asset.assetId === mainAssetId
  //   );
  //   const paymentAsset = this.assets.find(
  //     (asset) => asset.assetId === paymentAssetId
  //   );

  //   if (side === "buy") {
  //     if (!paymentAsset) {
  //       throw new Error("Insufficient funds");
  //     }

  //     paymentAsset.quantity -= quantity * price;
  //     mainAsset.quantity += quantity;
  //   }
  // }
}

type AccountBuilder = {
  name: string;
  email: string;
  document: string;
  password: string;
};
