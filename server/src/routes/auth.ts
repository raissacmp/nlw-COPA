import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function authRoutes(fastify: FastifyInstance) {
  //get user logado

  fastify.get("/me", async (request) => {
    await request.jwtVerify();

    return { user: request.user };
  });

  fastify.post("/users", async (request) => {
    const createUserBody = z.object({
      access_token: z.string(),
    });

    const { access_token } = createUserBody.parse(request.body);

    //requisição onde o google entende quem é o usuário que fez o login

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    //obtendo as informações do usuário e tratando com o zod

    const userData = await userResponse.json();

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    const userInfo = userInfoSchema.parse(userData);

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      },
    });

    //criando um novo usuário

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
        },
      });
    }

    const token = fastify.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: "7 days",
      }
    );

    return { token };
  });
}
