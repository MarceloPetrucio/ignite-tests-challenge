import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User", () => {
  const newUser: ICreateUserDTO = {
    email: "marcelo@decoleira.com.br",
    name: "Marcelo Petrucio",
    password: "123456",
  };

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("Shoud be able find a user by id", async () => {
    const user = await createUserUseCase.execute(newUser);

    const userFinded = await showUserProfileUseCase.execute(user.id);

    expect(userFinded).toBe(user);
  });

  it("Shoud not be able find a user without id exists", async () => {
    expect(showUserProfileUseCase.execute("ABC")).rejects.toEqual(
      new ShowUserProfileError()
    );
  });
});
