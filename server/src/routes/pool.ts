import { FastifyInstance } from "fastify";
import { z } from "zod";
import ShortUniqueId from "short-unique-id";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

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

  fastify.post(
    "/pools/join",
    {
      onRequest: [authenticate], //rota acessivel apenas se o user estiver autenticado
    },
    async (request, reply) => {
      const joinPoolBody = z.object({
        code: z.string(),
      });

      const { code } = joinPoolBody.parse(request.body);

      const pool = await prisma.pool.findUnique({
        where: {
          code,
        },
        include: {
          participants: {
            where: {
              userId: request.user.sub,
            },
          },
        },
      });

      if (!pool) {
        return reply.status(400).send({
          message: "Pool not found",
        });
      }

      if (pool.participants.length > 0) {
        return reply.status(400).send({
          message: "You alredy joined this pool.",
        });
      }

      if (!pool.ownerId) {
        await prisma.pool.update({
          where: {
            id: pool.id,
          },
          data: {
            ownerId: request.user.sub,
          },
        });
      }

      await prisma.participant.create({
        data: {
          poolId: pool.id,
          userId: request.user.sub,
        },
      });

      return reply.status(201).send();
    }
  );

  fastify.get(
    "/pools",
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const pools = await prisma.pool.findMany({
        where: {
          participants: {
            some: {
              userId: request.user.sub,
            },
          },
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
          participants: {
            select: {
              id: true,
              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
            take: 4,
          },
          owner: {
            //get dados dono bolão
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return { pools };
    }
  );

  fastify.get(
    "/pools/:id",
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const getPoolParams = z.object({
        id: z.string(),
      });

      const { id } = getPoolParams.parse(request.params);
      const pool = await prisma.pool.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
          participants: {
            select: {
              id: true,
              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
            take: 4,
          },
          owner: {
            //get dados dono bolão
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { pool };
    }
  );
}
