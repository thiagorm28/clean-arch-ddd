import { inject } from "../../infra/di/Registry";
import AccountRepository from "../../infra/repository/AccountRepository";

export default class PlaceOrder {
  @inject("accountRepository")
  accountRepository!: AccountRepository;

  async execute(input: Input): Promise<string> {
    const account = await this.accountRepository.getAccountById(
      input.accountId
    );

    const orderId = account.placeOrder(
      input.marketId,
      input.side,
      input.quantity,
      input.price
    );
    await this.accountRepository.updateAccount(account);

    return orderId;
  }
}

type Input = {
  marketId: string;
  accountId: string;
  side: string;
  quantity: number;
  price: number;
};
