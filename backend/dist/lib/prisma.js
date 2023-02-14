"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _client = require("@prisma/client");
const prisma = new _client.PrismaClient({
  log: ['query']
});
var _default = prisma;
exports.default = _default;