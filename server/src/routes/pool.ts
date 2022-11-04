import { FastifyInstance } from "fastify";
import { z } from "zod";
import ShortUniqueId from "short-unique-id";
import { prisma } from "../lib/prisma";

export async function poolRoutes(fastify: FastifyInstance) {
  fastify.get("/pools/count", async () => {
    const count = await prisma.pool.count();

    return { count };
  });

  fastify.post("/pools", async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    });

    const { title } = createPoolBody.parse(request.body); //pra fazer a validação e garantir que não haja campo nulo

    const generate = new ShortUniqueId({ length: 6 }); //vai gerar um código unico de 6 digitos
    const code = String(generate()).toUpperCase();

    try {
      await request.jwtVerify();
      //usuário autenticado
      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub, //id do user dentro do token

          // criar  um participante

          participants: {
            create: {
              userId: request.user.sub,
            },
          },
        },
      });
    } catch {
      // cria o bolão sem owner id
      await prisma.pool.create({
        data: {
          title,
          code,
        },
      });
    }

    return reply.status(201).send({ code });
  });
}
