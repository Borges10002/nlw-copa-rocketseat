"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authRoutes = authRoutes;
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _zod = require("zod");
var _prisma = _interopRequireDefault(require("../lib/prisma"));
var _authenticate = require("../plugins/authenticate");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function authRoutes(fastify) {
  fastify.get("/me", {
    onRequest: [_authenticate.authenticate]
  }, async request => {
    return {
      user: request.user
    };
  });
  fastify.post("/users", async request => {
    const createUserBody = _zod.z.object({
      access_token: _zod.z.string()
    });
    const {
      access_token
    } = createUserBody.parse(request.body);
    const userResponse = await (0, _nodeFetch.default)("https://www.googleapis.com/oauth2/v2/userinfo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    const userData = await userResponse.json();
    const userInfoSchema = _zod.z.object({
      id: _zod.z.string(),
      email: _zod.z.string().email(),
      name: _zod.z.string(),
      picture: _zod.z.string().url()
    });
    const userInfo = userInfoSchema.parse(userData);
    let user = await _prisma.default.user.findUnique({
      where: {
        googleId: userInfo.id
      }
    });
    if (!user) {
      user = await _prisma.default.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture
        }
      });
    }
    const token = fastify.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarUrl
    }, {
      sub: user.id,
      expiresIn: "7 days"
    });
    return {
      token
    };
  });
}