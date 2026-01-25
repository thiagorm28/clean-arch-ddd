import Deposit from "../../application/usecase/Deposit";
import { inject } from "../di/Registry";
import HttpServer from "../http/HttpServer";

export default class WalletController {
  @inject("deposit")
  deposit!: Deposit;
  @inject("httpServer")
  httpServer!: HttpServer;

  constructor() {
    this.httpServer.route(
      "post",
      "/deposit",
      async (params: any, body: any) => {
        const input = body;
        await this.deposit.execute(input);
      },
    );
  }
}
