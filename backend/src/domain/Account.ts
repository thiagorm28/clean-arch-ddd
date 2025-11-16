import Asset from "./Asset";
import generateUUID from "./generateUUID";
import { validateCpf } from "./validateCpf";
import { validateEmail } from "./validateEmail";
import { validateName } from "./validateName";
import { validatePassword } from "./validatePassword";
import Order from "./Order";

export default class Account {
  assets: Asset[];
  orders: Order[];

  constructor(
    readonly accountId: string,
    readonly name: string,
    readonly email: string,
    readonly document: string,
    readonly password: string,
    assets: Asset[],
    orders: Order[]
  ) {
    if (!name || !validateName(name)) throw new Error("Invalid name");
    if (!email || !validateEmail(email)) throw new Error("Invalid email");
    if (!document || !validateCpf(document))
      throw new Error("Invalid document");
    if (!password || !validatePassword(password))
      throw new Error("Invalid password");
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

  getBalance(assetId: string) {
    const asset = this.assets.find((asset) => asset.assetId === assetId);
    if (!asset) {
      return 0;
    }
    return asset.quantity;
  }
}

type AccountBuilder = {
  name: string;
  email: string;
  document: string;
  password: string;
};
