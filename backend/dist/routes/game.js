"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gameRoutes = gameRoutes;
var _zod = require("zod");
var _prisma = _interopRequireDefault(require("../lib/prisma"));
var _authenticate = require("../plugins/authenticate");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function gameRoutes(fastify) {
  fastify.get("/pools/:id/games", {
    onRequest: [_authenticate.authenticate]
  }, async request => {
    const getPoolParams = _zod.z.object({
      id: _zod.z.string()
    });
    const {
      id
    } = getPoolParams.parse(request.params);
    const games = await _prisma.default.game.findMany({
      orderBy: {
        date: "desc"
      },
      include: {
        guesses: {
          where: {
            participant: {
              userId: request.user.sub,
              poolId: id
            }
          }
        }
      }
    });
    return {
      games: games.map(game => {
        return {
          ...game,
          guess: game.guesses.length > 0 ? game.guesses[0] : null,
          guesses: undefined
        };
      })
    };
  });
}