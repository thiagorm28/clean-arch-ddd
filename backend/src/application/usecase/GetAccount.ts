import { inject } from "../../infra/di/Registry";
import AccountRepository from "../../infra/repository/AccountRepository";

export default class GetAccount {
  @inject("accountRepository")
  accountRepository!: AccountRepository;

  async execute(accountId: string) {
    const accountData = await this.accountRepository.getAccountById(accountId);
    return accountData;
  }
}
