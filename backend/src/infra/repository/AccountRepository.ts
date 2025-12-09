import Account from "../../domain/Account";
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
        account.getAccountId(),
        account.getName(),
        account.getEmail(),
        account.getDocument(),
        account.getPassword(),
      ]
    );
  }

  async updateAccount(account: Account) {
    await this.connection.query(
      "delete from ccca.account where account_id = $1",
      [account.getAccountId()]
    );

    await this.connection.query(
      "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.getAccountId(),
        account.getName(),
        account.getEmail(),
        account.getDocument(),
        account.getPassword(),
      ]
    );
  }

  async getAccountById(accountId: string): Promise<Account> {
    const [accountData] = await this.connection.query(
      "select * from ccca.account where account_id = $1",
      [accountId]
    );

    return new Account(
      accountData.account_id,
      accountData.name,
      accountData.email,
      accountData.document,
      accountData.password
    );
  }
}
