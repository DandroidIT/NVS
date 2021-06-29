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
exports.users = void 0;
const no_logger_1 = require("../lib/no-logger");
const config_1 = __importDefault(require("../config"));
//import { helpers } from "./helpers";
const webpush_1 = __importDefault(require("./webpush"));
const helper_1 = require("../lib/helper");
class users {
    constructor() {
        this._listUsers = new Map();
        this.logger = new no_logger_1.NoLogger('nvr users');
    }
    get list() {
        return this._listUsers;
    }
    SendAlamrs(notifica) {
        return __awaiter(this, void 0, void 0, function* () {
            let nottifyUser = yield config_1.default.db.tabNotifyUsers.find();
            nottifyUser.forEach((not) => __awaiter(this, void 0, void 0, function* () {
                if (not.enabled === false)
                    return;
                try {
                    yield webpush_1.default.push({ endpoint: not === null || not === void 0 ? void 0 : not.endpoint.toString(), keys: { auth: not === null || not === void 0 ? void 0 : not.auth.toString(), p256dh: not === null || not === void 0 ? void 0 : not.p256dh.toString() }, }, { title: notifica, actions: [{ action: "open_url", title: "Read Now" }] });
                    console.log('🚀 ~ file: nvr_users.ts ~ line 87 ~ users ~ nottifyUser.forEach ');
                }
                catch (error) {
                    console.log('🚀 ~ file: nvr_users.ts ~ line 99 ~ users ~ nottifyUser.forEach ~ error', error);
                    //return
                    let webPushError = error;
                    console.log(`SendAlamrs webPushError ERROR - statusCode: ${webPushError.statusCode} body:${webPushError.body} message:${webPushError.message} endpoint ${webPushError.endpoint}`);
                    if (webPushError.statusCode === 410 || webPushError.statusCode === 106) {
                        if (webPushError.endpoint) {
                            let deletenotify = yield config_1.default.db.tabNotifyUsers.remove({
                                endpoint: webPushError.endpoint,
                            });
                            console.log(`SendAlamrs delete user notify endpoint ${webPushError.endpoint} success: ${deletenotify.length}`);
                            this.logger.log(`SendAlamrs delete user notify endpoint ${webPushError.endpoint} success: ${deletenotify.length}`);
                        }
                    }
                }
            }));
        });
    }
    //TODO: firefox pwa vedere implementazione
    // base: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installable_PWAs
    // SubscriptionDisabled: fare controllo in app per disabilitare le notifiche e fare test
    managerPush(protocol, type, clientSubscription) {
        return __awaiter(this, void 0, void 0, function* () {
            let notifyUsers = [];
            let user = this.verifyUserToken(protocol);
            if (!user)
                return false;
            if (type === 'Subscription') {
                notifyUsers = yield config_1.default.db.tabNotifyUsers.updateOrCreate({
                    auth: clientSubscription.keys.auth.toString(),
                    p256dh: clientSubscription.keys.p256dh.toString()
                }, {
                    iduser: Number(user.id),
                    expirationTime: '',
                    endpoint: clientSubscription.endpoint.toString(),
                    auth: clientSubscription.keys.auth.toString(),
                    p256dh: clientSubscription.keys.p256dh.toString(),
                    insertdata: helper_1.helpersNEW.date.dateISOLocate(),
                    enabled: true
                });
            }
            else if (type === 'getSubscription') {
                notifyUsers = yield config_1.default.db.tabNotifyUsers.find({
                    endpoint: clientSubscription.endpoint,
                });
                if (notifyUsers.length) {
                    if (notifyUsers[0].enabled === false)
                        notifyUsers = [];
                }
            }
            else if (type === 'unSubscription') {
                notifyUsers = yield config_1.default.db.tabNotifyUsers.remove({
                    endpoint: clientSubscription.endpoint,
                });
            }
            else if (type === 'SubscriptionDisabled') {
                notifyUsers = yield config_1.default.db.tabNotifyUsers.update({
                    auth: clientSubscription.keys.auth.toString(),
                    p256dh: clientSubscription.keys.p256dh.toString()
                }, { enabled: false });
            }
            if (notifyUsers.length) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    setWS(ws, protocol, type, tagid = '') {
        var _a;
        let user = this.verifyUserToken(protocol);
        if (user) {
            this.logger.log(`${user.username}: setWS`);
            (_a = user.ws_list) === null || _a === void 0 ? void 0 : _a.set(ws.idConnect, { type: type, tagid: tagid, ws: ws });
            if (type === 'api') {
                ws.online = true;
                ws.on("close", (code, reason) => {
                    this.logger.log(`NvrWsController InitClient : CLOSE API Client disconnected user.id: ${user === null || user === void 0 ? void 0 : user.id} user.idconnect:${user === null || user === void 0 ? void 0 : user.idconnect} ws.idConnect:${ws.idConnect} - reason: ${reason} code: ${code}`);
                    this.logout(protocol, true);
                });
            }
            else if (type === 'stream') {
                ws.binaryType = "arraybuffer";
                ws.send(this.streamHeaders(), { binary: true });
                ws.on("error", (err) => {
                    this.logger.err(`streamCam_test ws onerror error:${err}`);
                    this.removeWS(user === null || user === void 0 ? void 0 : user.id, ws.idConnect);
                });
                ws.on("close", (code, reason) => {
                    this.logger.log(`streamCam_test ws onclose reason:${reason} code:${code}`);
                    this.removeWS(user === null || user === void 0 ? void 0 : user.id, ws.idConnect);
                });
            }
        }
        return true;
    }
    removeWS(idUser, wsIdConect) {
        let user = this.filter(idUser);
        return user === null || user === void 0 ? void 0 : user.ws_list.delete(wsIdConect);
    }
    Add(user, ifexistremove = false) {
        if (ifexistremove) {
            this.remove(user.id);
        }
        this._listUsers.set(user.id, user);
    }
    filter(id) {
        return this._listUsers.get(id);
    }
    remove(id) {
        return this._listUsers.delete(id);
    }
    login(username, pass, ip) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbUuser = yield config_1.default.db.tabUsers.findOne({
                username: username,
                password: pass,
            });
            if (dbUuser) {
                if (this.filter(dbUuser.id.toString())) {
                    return { success: false, token: '', error: 'user in login' };
                }
                let getData = helper_1.helpersNEW.date.dateString();
                let token = helper_1.helpJwt.getToken({ id: `${dbUuser.id}`, create_at: getData }, config_1.default.secret, { expiresIn: "1d" });
                this.Add({
                    id: dbUuser.id.toString(),
                    idconnect: helper_1.nanoId.getId(),
                    ip: ip,
                    username: username,
                    token: token,
                    last_connect: getData,
                    ws_list: new Map()
                });
                return { success: true, token: token };
            }
            else {
                return { success: false, token: '' };
            }
        });
    }
    update(username, pass, usernameNew, passNew) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield config_1.default.db.tabUsers.findOne({
                username: username,
                password: pass,
            });
            if (user) {
                let checkUserNew = yield config_1.default.db.tabUsers.update({ username: usernameNew }, { password: passNew });
                return checkUserNew ? true : false;
            }
            return false;
        });
    }
    verifyUserToken(authToken) {
        helper_1.helpJwt.verifyToken(authToken, config_1.default.secret, { complete: true });
        let u = helper_1.helpJwt.decodeToken(authToken, { complete: true });
        return this.filter(u.payload.id);
    }
    sendVideo(idCam, chunk) {
        let countWsStream = 0;
        Array.from(this._listUsers.values()).forEach((user, indexUser) => {
            user.ws_list.forEach((wsItem, indexWS) => {
                if (wsItem.type === "stream" && wsItem.tagid === idCam) {
                    wsItem.ws.send(chunk, { binary: true });
                    countWsStream++;
                }
            });
        });
        if (countWsStream === 0) {
            return true;
        }
    }
    streamHeaders() {
        // send magic number e set arraybuffer
        /* streamHeader.writeUInt16BE(1280, 4)
         streamHeader.writeUInt16BE(1024, 6) */
        /*  streamHeader.writeUInt16BE(800, 4)
         streamHeader.writeUInt16BE(600, 6) */
        let streamHeader = Buffer.alloc(8);
        streamHeader.write("jsmp");
        streamHeader.writeUInt16BE(1920, 4);
        streamHeader.writeUInt16BE(1080, 6);
        return streamHeader;
    }
    logout(token, checkWS = false) {
        let user = this.verifyUserToken(token);
        if (user) {
            if (checkWS && user.ws_list.size > 1) {
                return false;
            }
            if (user.ws_list.size) {
                user.ws_list.forEach(wsUser => {
                    wsUser.ws.terminate();
                });
                this._listUsers.delete(user.id);
                return true;
            }
        }
        return false;
    }
}
exports.users = users;
//# sourceMappingURL=nvr_users.js.map