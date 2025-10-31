import AccountRepository from "./AccountRepository";

export default class Withdraw {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<void> {
    const account = await this.accountRepository.getAccountById(
      input.accountId
    );

    account.withdraw(input.assetId, input.quantity);
    await this.accountRepository.updateAccount(account);
  }
}

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
};
