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

  constructor(
    accountId: string,
    name: string,
    email: string,
    document: string,
    password: string,
    assets: Asset[]
  ) {
    this.accountId = new UUID(accountId);
    this.name = new Name(name);
    this.email = new Email(email);
    this.document = new Document(document);
    this.password = new Password(password);
    this.assets = assets;
  }

  static create(
    name: string,
    email: string,
    document: string,
    password: string
  ): Account {
    const accountId = generateUUID();
    const assets: Asset[] = [];
    return new Account(accountId, name, email, document, password, assets);
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
      this.assets.push(new Asset(assetId, quantity, 0));
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
    return asset.getBalance();
  }

  processOrder(order: Order) {
    let assetId;
    let quantity;
    if (order.side === "buy") {
      assetId = order.getPaymentAssetId();
      quantity = order.quantity * order.price;
    } else {
      assetId = order.getMainAssetId();
      quantity = order.quantity;
    }

    const asset = this.assets.find((asset: Asset) => asset.assetId === assetId);
    if (!asset || quantity > asset.getBalance()) {
      throw new Error("Insufficient funds");
    }

    asset.blockedQuantity += quantity;
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
