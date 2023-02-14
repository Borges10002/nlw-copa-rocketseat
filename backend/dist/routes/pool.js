"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.poolRoutes = poolRoutes;
var _shortUniqueId = _interopRequireDefault(require("short-unique-id"));
var _zod = require("zod");
var _prisma = _interopRequireDefault(require("../lib/prisma"));
var _authenticate = require("../plugins/authenticate");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function poolRoutes(fastify) {
  fastify.get('/pools/count', async () => {
    const count = await _prisma.default.pool.count();
    return {
      count
    };
  });
  fastify.post('/pools', async (request, reply) => {
    const createPoolBody = _zod.z.object({
      title: _zod.z.string()
    });
    const {
      title
    } = createPoolBody.parse(request.body);
    const generate = new _shortUniqueId.default({
      length: 6
    });
    const code = String(generate()).toUpperCase();
    try {
      await request.jwtVerify();
      await _prisma.default.pool.create({
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
      });
    } catch (error) {
      await _prisma.default.pool.create({
        data: {
          title,
          code
        }
      });
    }
    return reply.status(201).send({
      code
    });
  });
  fastify.post('/pools/join', {
    onRequest: [_authenticate.authenticate]
  }, async (request, reply) => {
    const joinPoolBody = _zod.z.object({
      code: _zod.z.string()
    });
    const {
      code
    } = joinPoolBody.parse(request.body);
    const pool = await _prisma.default.pool.findUnique({
      where: {
        code
      },
      include: {
        participants: {
          where: {
            userId: request.user.sub
          }
        }
      }
    });
    if (!pool) {
      return reply.status(400).send({
        message: 'Pool not found.'
      });
    }
    if (pool.participants.length > 0) {
      return reply.status(400).send({
        message: 'You already joined this pool.'
      });
    }
    if (!pool.ownerId) {
      await _prisma.default.pool.update({
        where: {
          id: pool.id
        },
        data: {
          ownerId: request.user.sub
        }
      });
    }
    await _prisma.default.participant.create({
      data: {
        poolId: pool.id,
        userId: request.user.sub
      }
    });
    return reply.status(201).send();
  });
  fastify.get('/pools', {
    onRequest: [_authenticate.authenticate]
  }, async request => {
    const pools = await _prisma.default.pool.findMany({
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
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        _count: {
          select: {
            participants: true
          }
        }
      },
      where: {
        participants: {
          some: {
            userId: request.user.sub
          }
        }
      }
    });
    return {
      pools
    };
  });
  fastify.get('/pools/:poolId', {
    onRequest: [_authenticate.authenticate]
  }, async (request, reply) => {
    const getPoolParams = _zod.z.object({
      poolId: _zod.z.string()
    });
    const {
      poolId
    } = getPoolParams.parse(request.params);
    const pool = await _prisma.default.pool.findFirst({
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
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        _count: {
          select: {
            participants: true
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
      }
    });
    if (!pool) {
      return reply.status(400).send({
        message: 'Pool not found.'
      });
    }
    return {
      pool
    };
  });
}