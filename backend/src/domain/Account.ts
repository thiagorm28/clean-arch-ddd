import generateUUID from "./generateUUID";
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

  constructor(
    accountId: string,
    name: string,
    email: string,
    document: string,
    password: string
  ) {
    this.accountId = new UUID(accountId);
    this.name = new Name(name);
    this.email = new Email(email);
    this.document = new Document(document);
    this.password = new Password(password);
  }

  static create(
    name: string,
    email: string,
    document: string,
    password: string
  ): Account {
    const accountId = generateUUID();
    return new Account(accountId, name, email, document, password);
  }

  static build(accountBuilder: AccountBuilder): Account {
    return Account.create(
      accountBuilder.name,
      accountBuilder.email,
      accountBuilder.document,
      accountBuilder.password
    );
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

  setPassword(newPassword: string) {
    this.password = new Password(newPassword);
  }
}

type AccountBuilder = {
  name: string;
  email: string;
  document: string;
  password: string;
};
