import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType, Statement } from "../../entities/Statement";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { User } from "../../../users/entities/User";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let cetBalanceUseCase: GetBalanceUseCase;
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
    cetBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      usersRepositoryInMemory
    );

    user = await createUserUseCase.execute(newUser);
  });

  it("should be able to get a balance statements", async () => {
    const balance = await cetBalanceUseCase.execute({
      user_id: user.id,
    });
    expect(balance).toHaveProperty("balance");
  });

  it("should not be able to get a balance statements with invalid user", async () => {
    const balance = await expect(
      cetBalanceUseCase.execute({
        user_id: "2c3245b4-5232-4f7e-a5a5-51ba46834411",
      })
    ).rejects.toEqual(new GetBalanceError());
  });
});
