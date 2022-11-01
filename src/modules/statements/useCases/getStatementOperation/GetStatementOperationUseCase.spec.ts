import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType, Statement } from "../../entities/Statement";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { User } from "../../../users/entities/User";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createUserUseCase: CreateUserUseCase;
let user: User;
let createStatementUseCase: CreateStatementUseCase;

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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      inMemoryStatementsRepository
    );

    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      inMemoryStatementsRepository
    );

    user = await createUserUseCase.execute(newUser);
  });

  it("should be able to get a statement by id", async () => {
    const newStatement: ICreateStatementDTO = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Statement test",
    };

    const statement = await createStatementUseCase.execute(newStatement);

    const resStatement = await getStatementOperationUseCase.execute({
      statement_id: statement.id,
      user_id: user.id,
    });

    expect(resStatement).toEqual(statement);
  });

  it("should not be able to get a balance statements with invalid user", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        statement_id: "2c3245b4-5232-4f7e-a5a5-51ba46834411",
        user_id: "2c3245b4-5232-4f7e-a5a5-51ba46834411",
      })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("should not be able to get a balance statements with invalid id", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        statement_id: "2c3245b4-5232-4f7e-a5a5-51ba46834411",
        user_id: user.id,
      })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });
});
