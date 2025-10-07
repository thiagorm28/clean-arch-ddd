import express, { Request, Response } from "express";
import pgp from "pg-promise";

async function main () {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const app = express();
    app.use(express.json());
    
    app.post("/signup", async (req: Request, res: Response) => {
        const accountId = crypto.randomUUID();
        await connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [accountId, req.body.name, req.body.email, req.body.document, req.body.password]);
        res.json({
            accountId
        });
    });

    app.get("/accounts/:accountId", async (req: Request, res: Response) => {
        const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [req.params.accountId]);
        res.json(accountData);
    })

    app.listen(3000);
}
main();
