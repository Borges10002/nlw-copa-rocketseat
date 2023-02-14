"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.guessRoutes = guessRoutes;
var _zod = require("zod");
var _prisma = _interopRequireDefault(require("../lib/prisma"));
var _authenticate = require("../plugins/authenticate");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function guessRoutes(fastify) {
  fastify.get("/guesses/count", async () => {
    const count = await _prisma.default.guess.count();
    return {
      count
    };
  });
  fastify.post("/pools/:poolId/games/:gameId/guesses", {
    onRequest: [_authenticate.authenticate]
  }, async (request, reply) => {
    const createGuessParams = _zod.z.object({
      poolId: _zod.z.string(),
      gameId: _zod.z.string()
    });
    const createGuessBody = _zod.z.object({
      firstTeamPoints: _zod.z.number(),
      secondTeamPoints: _zod.z.number()
    });
    const {
      poolId,
      gameId
    } = createGuessParams.parse(request.params);
    const {
      firstTeamPoints,
      secondTeamPoints
    } = createGuessBody.parse(request.body);
    const participant = await _prisma.default.participant.findUnique({
      where: {
        userId_poolId: {
          poolId,
          userId: request.user.sub
        }
      }
    });
    if (!participant) {
      return reply.status(400).send({
        message: "You're not allowed to create a guess inside this pool."
      });
    }
    const guess = await _prisma.default.guess.findUnique({
      where: {
        participantId_gameId: {
          participantId: participant.id,
          gameId
        }
      }
    });
    if (guess) {
      return reply.status(400).send({
        message: "You already sent a guess to this game on this pool."
      });
    }
    const game = await _prisma.default.game.findUnique({
      where: {
        id: gameId
      }
    });
    if (!game) {
      return reply.status(400).send({
        message: "Game not found."
      });
    }
    if (game.date < new Date()) {
      return reply.status(400).send({
        message: "Você não pode enviar palpites após a data do jogo."
      });
    }
    await _prisma.default.guess.create({
      data: {
        gameId,
        participantId: participant.id,
        firstTeamPoints,
        secondTeamPoints
      }
    });
    return reply.status(201).send();
  });
}