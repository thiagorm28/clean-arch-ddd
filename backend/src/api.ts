import express, { Request, Response } from "express";
import cors from "cors";
import AccountRepositoryDatabase from "./AccountRepository";
import Signup from "./Signup";
import GetAccount from "./GetAccount";

async function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const accountRepositoryDatabase = new AccountRepositoryDatabase();
  const singup = new Signup(accountRepositoryDatabase);
  const getAccount = new GetAccount(accountRepositoryDatabase);

  app.post("/signup", async (req: Request, res: Response) => {
    try {
      const input = req.body;
      const output = await singup.execute(input);
      res.json(output);
    } catch (e: any) {
      res.status(422).json({
        message: e.message,
      });
    }
  });

  app.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId;
    const output = await getAccount.execute(accountId);
    res.json(output);
  });

  app.listen(3000);
}

main();
