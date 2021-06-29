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
exports.checkToken = exports.wsStreamRouter = exports.wsEventRoute = exports.setSocket = void 0;
const nvr_1 = __importDefault(require("../class/nvr"));
const cam_ws_controller_1 = __importDefault(require("../controller/cam.ws.controller"));
const nvr_ws_controller_1 = __importDefault(require("../controller/nvr.ws.controller"));
const no_logger_1 = require("../lib/no-logger");
const logger = new no_logger_1.NoLogger('ws.router');
var wsEventName;
(function (wsEventName) {
    /*  CamControll = 'camcontroll',
     CamList = 'camlist', */
    wsEventName["TEST"] = "test";
})(wsEventName || (wsEventName = {}));
function setSocket(wsServer) {
    //nvrCtrl.startPingCustom()<- disabilitato per facilitare debug attivare e verificare in produzione
}
exports.setSocket = setSocket;
function wsEventRoute(wsClient, request) {
    wsClient.on("message", (msg) => _wsToEvent(msg, wsClient, request));
    wsClient.on('undefined', mess => { logger.log(` undefined ${mess}`); });
    wsClient.on("error", (err) => {
        logger.err(`wsEventRoute: ERROR: Client disconnected - reason: ${err}`);
        //this.logger.w(`wsServerEventConnection: ERROR: Client disconnected - reason: ${err}`);
    });
    _wsEventBind(wsClient, request);
}
exports.wsEventRoute = wsEventRoute;
let _wsToEvent = (message, _ws, request) => {
    let _path = request.url;
    try {
        //block public IP?
        if (!nvr_ws_controller_1.default.checkIpIsOk(request.socket.remoteAddress)) {
            logger.log(`wsEventRoute _wsToEvent nvrCtrl.checkIpIsOk NOT OK: ${request.socket.remoteAddress} _path: ${_path}`);
            _ws.terminate();
            return;
        }
        let { type, payload } = JSON.parse(message);
        _ws.emit(type, payload, _path || message);
        if (type !== 'ping' && type !== 'pong')
            logger.log(`wsEventRoute _wsToEvent OK emit  message: ${message} _path: ${_path}`);
    }
    catch (error) {
        logger.err(`wsEventRoute _wsToEvent error   message: ${message} _path: ${_path}`);
        _ws.emit('undefined', message);
    }
};
let _wsEventBind = (ws, request) => {
    nvr_ws_controller_1.default.InitClient(ws, request.headers['sec-websocket-protocol'], 'api');
    ws.on(wsEventName.TEST, (data) => {
        ws.send(JSON.stringify({ type: 'test', payload: data }));
    });
    ws.on(cam_ws_controller_1.default.camEvent.CamList, (data) => __awaiter(void 0, void 0, void 0, function* () { return ws.send(yield cam_ws_controller_1.default.list(), () => { }); }));
    ws.on(cam_ws_controller_1.default.camEvent.CamControll, (data) => __awaiter(void 0, void 0, void 0, function* () { return ws.send(yield cam_ws_controller_1.default.move(data)); }));
    ws.on(cam_ws_controller_1.default.camEvent.CamSetOption, (data) => __awaiter(void 0, void 0, void 0, function* () { return ws.send(yield cam_ws_controller_1.default.SetCamOption(data), () => { }); }));
    ws.on(nvr_ws_controller_1.default.nvrEvent.ManagerPush, (data) => __awaiter(void 0, void 0, void 0, function* () { return ws.send(yield nvr_ws_controller_1.default.managerPush(data)); })); //<- passare anche id user ogniuno a le sue notifiche
    ws.on(nvr_ws_controller_1.default.nvrEvent.SetOption, (data) => __awaiter(void 0, void 0, void 0, function* () { return ws.send(yield nvr_ws_controller_1.default.SetOptions(data)); }));
    ws.on(cam_ws_controller_1.default.camEvent.ManagerAlarms, (data) => __awaiter(void 0, void 0, void 0, function* () { return ws.send(yield cam_ws_controller_1.default.managerAlarms(data)); }));
    ws.on(nvr_ws_controller_1.default.nvrEvent.ManagerRadarCams, (data) => __awaiter(void 0, void 0, void 0, function* () { return ws.send(yield nvr_ws_controller_1.default.managerRadarCams(data)); }));
    ws.on(nvr_ws_controller_1.default.nvrEvent.logoutUser, (data) => __awaiter(void 0, void 0, void 0, function* () { return ws.send(nvr_ws_controller_1.default.logoutUser(data)); }));
    //fare chiamata su ApiWS su client e testare
};
function wsStreamRouter(wsClient, request) {
    cam_ws_controller_1.default.StreamCam(wsClient, request);
}
exports.wsStreamRouter = wsStreamRouter;
function checkToken(request) {
    try {
        /* if (this._getIpPublic(request.socket.remoteAddress!)) { <== vedere helpers e finire di implementare
            console.log('_checktoken blocco WSS!!!!!!!!!!!!!!!!!!!');
            logger.err(`_checktoken _getIpPublic BLOCK ${request.socket.remoteAddress}`)
            logger.w(`_checktoken _getIpPublic BLOCK ${request.socket.remoteAddress}`)
            return false
        } */
        //console.log('sec-websocket-protocol:', request.headers['sec-websocket-protocol'])
        /* if(nvrCtrl.checkIpIsOk(request.socket.remoteAddress!)){
            return false
        } */
        logger.log('sec-websocket-protocol:', request.headers['sec-websocket-protocol']);
        let u = nvr_1.default.verifyUser(request.headers['sec-websocket-protocol']);
        if (u === undefined) {
            logger.err(`"Utente websocket non trovato: ${request.headers['sec-websocket-protocol']}`);
            logger.w(`"Utente websocket non trovato: ${request.headers['sec-websocket-protocol']}`);
            throw new Error("Utente non trovato");
        }
        return true;
    }
    catch (error) {
        return false;
    }
    /* if (request) return true;
        else return false; */
}
exports.checkToken = checkToken;
//# sourceMappingURL=ws.router.js.map