"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userRoutes = userRoutes;
var _prisma = _interopRequireDefault(require("../lib/prisma"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function userRoutes(fastify) {
  fastify.get('/users/count', async () => {
    const count = await _prisma.default.user.count();
    return {
      count
    };
  });
}