"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authenticate = authenticate;
async function authenticate(request) {
  await request.jwtVerify();
}