"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nvr_1 = __importDefault(require("../class/nvr"));
const no_logger_1 = require("../lib/no-logger");
const logger = new no_logger_1.NoLogger('LoginController', true); //, true)
logger.log('Start log for LoginController');
class LoginController {
    static login(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { username, password } = ctx.request.body;
            let userToken = yield nvr_1.default.loginUser(username, password, ctx.request.ip);
            if (userToken.success) {
                // user.password
                // let tok = this.getToken({ user })
                ctx.set({ authorization: userToken.token });
                //ctx.body = { token: userToken.token, username: username };
                ctx.body = { success: true, data: { token: userToken.token, username: username } };
                logger.log(`LoginController post login userToken from ip ${ctx.ip} ENTER - post value: username=${username} password = ${String(password).length}`);
            }
            else if (!userToken.success) {
                ctx.body = { success: false, error: userToken.error }; //{ error: userToken.error};
            }
            else {
                logger.log(`LoginController post login userToken from ip ${ctx.ip} NO ENTER - post value: username=${username}, passowrd=${password}`);
                ctx.status = 404;
            }
        });
    }
    static logout(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { token } = ctx.request.body;
            if (token) {
                let check = nvr_1.default.logoutUser(token);
                ctx.body = { success: check, error: '' };
            }
            else {
                ctx.body = { success: false, error: 'no valid data' };
            }
        });
    }
}
exports.default = LoginController;
//# sourceMappingURL=login.controller.js.map