import { AccountDAODatabase } from "../src/AccountDAO";

test("Deve persistir uma account", async () => {
    const accountDAO = new AccountDAODatabase();
    const account = {
        accountId: crypto.randomUUID(),
        name: "a",
        email: "b",
        document: "c",
        password: "d"
    }
    await accountDAO.saveAccount(account);
    const savedAccount = await accountDAO.getAccountById(account.accountId);
    expect(savedAccount.name).toBe(account.name);
    expect(savedAccount.email).toBe(account.email);
    expect(savedAccount.document).toBe(account.document);
    expect(savedAccount.password).toBe(account.password);
});