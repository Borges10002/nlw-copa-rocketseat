"use strict";

var _fastify = _interopRequireDefault(require("fastify"));
var _cors = _interopRequireDefault(require("@fastify/cors"));
var _jwt = _interopRequireDefault(require("@fastify/jwt"));
var _pool = require("./routes/pool");
var _auth = require("./routes/auth");
var _game = require("./routes/game");
var _guess = require("./routes/guess");
var _user = require("./routes/user");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function bootstrap() {
  const fastify = (0, _fastify.default)({
    logger: true
  });
  await fastify.register(_cors.default, {
    origin: true
  });

  //em producao isso preciso ser uma variavel ambiente
  await fastify.register(_jwt.default, {
    secret: 'nlwcopa'
  });
  await fastify.register(_pool.poolRoutes);
  await fastify.register(_auth.authRoutes);
  await fastify.register(_game.gameRoutes);
  await fastify.register(_guess.guessRoutes);
  await fastify.register(_user.userRoutes);
  await fastify.listen({
    port: 3333,
    host: '0.0.0.0'
  });
}
bootstrap();