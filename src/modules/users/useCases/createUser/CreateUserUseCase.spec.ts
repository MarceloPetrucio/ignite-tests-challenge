import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";
import { User } from "../../entities/User";
import { AppError } from "../../../../shared/errors/AppError";
import { CreateUserError } from "./CreateUserError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  const newUser: ICreateUserDTO = {
    email: "marcelo@decoleira.com.br",
    name: "Marcelo Petrucio",
    password: "123456",
  };

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const user: User = await createUserUseCase.execute(newUser);
    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user with exists email", async () => {
    await createUserUseCase.execute(newUser);

    await expect(createUserUseCase.execute(newUser)).rejects.toEqual(
      new CreateUserError()
    );
  });
});
