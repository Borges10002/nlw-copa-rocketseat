import { FastifyInstance } from "fastify";
import shortUniqueId from "short-unique-id";
import { z } from "zod";

import prisma from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function poolRoutes(fastify: FastifyInstance) {

  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count();

    return { count }
  });

  fastify.post('/pools', async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    })

    const { title } = createPoolBody.parse(request.body)

    const generate = new shortUniqueId({ length: 6 })
    const code = String(generate()).toUpperCase();

    try {
      await request.jwtVerify();
      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,

          participants: {
            create: {
              userId: request.user.sub
            }
          }
        }
      })

    } catch (error) {
      await prisma.pool.create({
        data: {
          title,
          code
        }
      })

    }

    return reply.status(201).send({ code })
  });

  fastify.post('/pools/join', {
    onRequest: [authenticate]
  }, async (request, reply) => {
    const joinPoolBody = z.object({
      code: z.string(),
    })

    const { code } = joinPoolBody.parse(request.body);

    const pool = await prisma.pool.findUnique({
      where: {
        code,
      },
      include: {
        participants: {
          where: {
            userId: request.user.sub,
          }
        }
      }
    })

    if (!pool) {
      return reply.status(400).send({
        message: 'Pool not found.'
      })
    }

    if (pool.participants.length > 0) {
      return reply.status(400).send({
        message: 'You already joined this pool.'
      })
    }

    if (!pool.ownerId) {
      await prisma.pool.update({
        where: {
          id: pool.id
        },
        data: {
          ownerId: request.user.sub,
        }
      })
    }

    await prisma.participant.create({
      data: {
        poolId: pool.id,
        userId: request.user.sub
      }
    })

    return reply.status(201).send();
  })

  fastify.get('/pools', {
    onRequest: [authenticate]
  }, async (request) => {

    const pools = await prisma.pool.findMany({
      include: {
        owner: {
          select: {
            name: true
          }
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4,
        },
        _count: {
          select: {
            participants: true,
          }
        }
      },
      where: {
        participants: {
          some: {
            userId: request.user.sub,
          }
        }
      },
    })

    return { pools }

  })

  fastify.get('/pools/:poolId', {
    onRequest: [authenticate],
  }, async (request, reply) => {
    const getPoolParams = z.object({
      poolId: z.string(),
    })

    const { poolId } = getPoolParams.parse(request.params);

    const pool = await prisma.pool.findFirst({
      include: {
        owner: {
          select: {
            name: true
          }
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4,
        },
        _count: {
          select: {
            participants: true,
          }
        }
      },
      where: {
        id: poolId,
        participants: {
          some: {
            userId: request.user.sub
          }
        }
      },
    })

    if(!pool){
      return reply.status(400).send({
        message: 'Pool not found.'
      })
    }

    return { pool }
  })

}
