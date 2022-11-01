import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { User } from "../../../users/entities/User";

let usersRepositoryInMemory: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let user: User;

describe("Create Statement", () => {
  const newUser: ICreateUserDTO = {
    email: "marcelo@decoleira.com.br",
    name: "Marcelo Petrucio",
    password: "123456",
  };

  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      inMemoryStatementsRepository
    );

    user = await createUserUseCase.execute(newUser);
  });

  it("should be able to create a new statement DEPOSIT", async () => {
    const newStatement: ICreateStatementDTO = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Statement test",
    };

    const statement: Statement = await createStatementUseCase.execute(
      newStatement
    );
    expect(statement).toHaveProperty("id");
  });

  it("should be able to create a new statement WITHDRAW", async () => {
    const newStatementDeposit: ICreateStatementDTO = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Statement test",
    };
    await createStatementUseCase.execute(newStatementDeposit);

    const newStatement: ICreateStatementDTO = {
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 200,
      description: "Statement test",
    };

    const statement: Statement = await createStatementUseCase.execute(
      newStatement
    );
    expect(statement).toHaveProperty("id");
  });
});
