import { Connection, createConnection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";

import { app } from "../app";
import { ICreateUserDTO } from "../modules/users/useCases/createUser/ICreateUserDTO";
import { User } from "../modules/users/entities/User";
let connection: Connection;

describe("Users", () => {
  const newUser: ICreateUserDTO = {
    email: "marcelo@decoleira.com.br",
    name: "Marcelo Petrucio",
    password: "123456",
  };

  let adminUser: User;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("admin", 8);

    adminUser = {
      id,
      name: "admin",
      email: "admin@finapi.com.br",
      password: "admin",
      created_at: new Date(),
      updated_at: new Date(),
      statement: [],
    };

    await connection.query(
      `INSERT INTO USERS(id, name, email, password) 
        values('${adminUser.id}', '${adminUser.name}', '${adminUser.email}', '${password}');
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user ", async () => {
    const response = await request(app).post("/api/v1/users").send(newUser);
    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user with same email", async () => {
    const response = await request(app).post("/api/v1/users").send(newUser);
    expect(response.status).toBe(400);
  });

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    expect(response.status).toBe(200);
  });

  it("should not be able to authenticate an user with email incorrect", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: adminUser.email + "123123",
        password: adminUser.password,
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate an user with password incorrect", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: adminUser.email,
        password: adminUser.password + "123",
      });

    expect(response.status).toBe(401);
  });

  it("should be able to get an user authenticated", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it("should not be able to get an user deleted", async () => {
    const newUser2: ICreateUserDTO = {
      email: "marcelos@decoleira.com.br",
      name: "Marcelo Petrucio 2",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send(newUser2);

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: newUser2.email,
      password: newUser2.password,
    });

    const { token } = responseToken.body;

    await connection.query(
      `DELETE FROM USERS WHERE EMAIL = '${newUser2.email}';`
    );

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should be able to get balance statements", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it("should be able to get balance statements with deleted user", async () => {
    const newUser2: ICreateUserDTO = {
      email: "marcelos@decoleira.com.br",
      name: "Marcelo Petrucio 2",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send(newUser2);

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: newUser2.email,
      password: newUser2.password,
    });

    const { token } = responseToken.body;

    await connection.query(
      `DELETE FROM USERS WHERE EMAIL = '${newUser2.email}';`
    );

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should be able to add a deposit statement by user authenticated", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 120,
        description: "Teste de deposito",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should be able to add a deposit statement with invalid token", async () => {
    const token = "INVALID_TOKEN";
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 120,
        description: "Teste de deposito",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
  });

  it("should be able to add a deposit statement with user deleted", async () => {
    const newUser2: ICreateUserDTO = {
      email: "marcelos@decoleira.com.br",
      name: "Marcelo Petrucio 2",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send(newUser2);

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: newUser2.email,
      password: newUser2.password,
    });

    const { token } = responseToken.body;

    await connection.query(
      `DELETE FROM USERS WHERE EMAIL = '${newUser2.email}';`
    );

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 120,
        description: "Teste de deposito",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should not be able to withdraw with user deleted", async () => {
    const newUser2: ICreateUserDTO = {
      email: "marcelos@decoleira.com.br",
      name: "Marcelo Petrucio 2",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send(newUser2);

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: newUser2.email,
      password: newUser2.password,
    });

    const { token } = responseToken.body;

    await connection.query(
      `DELETE FROM USERS WHERE EMAIL = '${newUser2.email}';`
    );

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 120,
        description: "Teste de retirada",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should be able to withdraw a statement by user authenticated", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 120,
        description: "Teste de retirada",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to withdraw a statement with insufficient funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "Teste de retirada",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it("should be able to get a statement by id", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    const { token } = responseToken.body;

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 120,
        description: "Teste de deposito",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${responseDeposit.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it("should not be able to get a statement with deleted user", async () => {
    const newUser2: ICreateUserDTO = {
      email: "marcelos@decoleira.com.br",
      name: "Marcelo Petrucio 2",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send(newUser2);

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: newUser2.email,
      password: newUser2.password,
    });

    const { token } = responseToken.body;

    await connection.query(
      `DELETE FROM USERS WHERE EMAIL = '${newUser2.email}';`
    );

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 120,
        description: "Teste de deposito",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${responseDeposit.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should not be able to get a statement wrong id", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/310dc5ec-ecb0-4b24-888f-ced70e4baf55`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
