import Account from "../../domain/Account";
import pgp from "pg-promise";
import Asset from "../../domain/Asset";
import Order from "../../domain/Order";
import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/Registry";

export default interface AccountRepository {
  saveAccount(account: Account): Promise<void>;
  updateAccount(account: Account): Promise<void>;
  getAccountById(accountId: string): Promise<Account>;
}

export default class AccountRepositoryDatabase implements AccountRepository {
  @inject("databaseConnection")
  connection!: DatabaseConnection;

  async saveAccount(account: Account) {
    await this.connection.query(
      "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ]
    );
  }

  async updateAccount(account: Account) {
    await this.connection.query(
      "delete from ccca.account_asset where account_id = $1",
      [account.accountId]
    );
    await this.connection.query(
      "delete from ccca.order where account_id = $1",
      [account.accountId]
    );
    await this.connection.query(
      "delete from ccca.account where account_id = $1",
      [account.accountId]
    );

    for (const asset of account.assets) {
      await this.connection.query(
        "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
        [account.accountId, asset.assetId, asset.quantity]
      );
    }

    for (const order of account.orders) {
      await this.connection.query(
        "insert into ccca.order (order_id, account_id, market_id, side, quantity, price) values ($1, $2, $3, $4, $5, $6)",
        [
          order.orderId,
          account.accountId,
          order.marketId,
          order.side,
          order.quantity,
          order.price,
        ]
      );
    }
    await this.connection.query(
      "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ]
    );
  }

  async getAccountById(accountId: string): Promise<Account> {
    const [accountData] = await this.connection.query(
      "select * from ccca.account where account_id = $1",
      [accountId]
    );
    const accountAssetsData = await this.connection.query(
      "select * from ccca.account_asset where account_id = $1",
      [accountId]
    );
    const accountOrdersData = await this.connection.query(
      "select * from ccca.order where account_id = $1",
      [accountId]
    );

    const assets: Asset[] = [];
    for (const accountAssetData of accountAssetsData) {
      assets.push(
        new Asset(
          accountAssetData.asset_id,
          parseFloat(accountAssetData.quantity)
        )
      );
    }

    const orders: Order[] = [];
    for (const accountOrderData of accountOrdersData) {
      orders.push(
        new Order(
          accountOrderData.order_id,
          accountOrderData.market_id,
          accountOrderData.side,
          parseFloat(accountOrderData.quantity),
          parseFloat(accountOrderData.price)
        )
      );
    }

    return new Account(
      accountData.account_id,
      accountData.name,
      accountData.email,
      accountData.document,
      accountData.password,
      assets,
      orders
    );
  }
}
