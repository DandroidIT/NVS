"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const login_controller_1 = __importDefault(require("../controller/login.controller"));
const router = new koa_router_1.default();
router.prefix('/');
router.post('/login', login_controller_1.default.login);
exports.default = router;
//# sourceMappingURL=auth.router.js.map