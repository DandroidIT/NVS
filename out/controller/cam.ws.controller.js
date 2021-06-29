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
const nvr_ws_controller_1 = __importDefault(require("./nvr.ws.controller"));
const logger = new no_logger_1.NoLogger('CamWSController', true); //, true)
logger.log('Start log for CamWSController');
var CamEventName;
(function (CamEventName) {
    CamEventName["CamControll"] = "camcontroll";
    CamEventName["CamList"] = "camlist";
    CamEventName["CamSetOption"] = "setcamoption";
    CamEventName["TEST"] = "test";
    CamEventName["ManagerAlarms"] = "manageralarms";
})(CamEventName || (CamEventName = {}));
class CamWsController {
    static move(data) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.log('CamWsController ~ move ~ data', data);
            try {
                let { cmd, tagcam, speed, timeout, preset } = JSON.parse(data).payload;
                let checkCommand = false;
                if (cmd === 'move_stop') {
                    checkCommand = nvr_1.default.stopCam(tagcam);
                }
                else if (cmd === 'move') {
                    checkCommand = yield nvr_1.default.moveCam(tagcam, { speed }, timeout);
                }
                else if (cmd === 'preset') {
                    checkCommand = yield nvr_1.default.presetCam(tagcam, preset, speed);
                }
                else if (cmd === 'save_preset') {
                    checkCommand = yield nvr_1.default.presetCamSave(tagcam, preset);
                }
                else if (cmd === 'screenshot') {
                    let foto = yield nvr_1.default.screenshot(tagcam);
                    return JSON.stringify({ type: cmd, payload: foto === null || foto === void 0 ? void 0 : foto.body });
                }
                else {
                    return JSON.stringify({ type: cmd, payload: checkCommand });
                }
                return JSON.stringify({ type: `${this.camEvent.CamControll}`, payload: checkCommand });
            }
            catch (error) {
                logger.err('CamWsController ~ move ~ error', error);
                return error;
            }
        });
    }
    static list() {
        return __awaiter(this, void 0, void 0, function* () {
            let arrCam = [];
            nvr_1.default.listcam().map((cam) => __awaiter(this, void 0, void 0, function* () {
                arrCam.push({
                    id: cam.id, information: cam.getInformationArray(),
                    name: cam.nameCam, asPTZ: cam.asPtz, inerror: cam.inError,
                    liveH24: cam.recordingH24, motion: cam.liveMotion //, arrAllarm:str
                });
            }));
            return JSON.stringify({ type: 'camlist', payload: arrCam });
        });
    }
    /*  public static StreamCam(idCam: string, ws: WebSocketClient, request: IncomingMessage) {
       Nvr.streamCam(idCam, ws, request.headers['sec-websocket-protocol']!)
     } */
    static StreamCam(ws, request) {
        var _a;
        let getRoute = (_a = request.url) === null || _a === void 0 ? void 0 : _a.split('/');
        let protocol = request.headers['sec-websocket-protocol'];
        if ((getRoute === null || getRoute === void 0 ? void 0 : getRoute.length) && (protocol === null || protocol === void 0 ? void 0 : protocol.length)) {
            let idCam = getRoute[2];
            nvr_ws_controller_1.default.InitClient(ws, protocol, 'stream', idCam);
            nvr_1.default.streamCam(idCam, ws, protocol);
        }
    }
    static SetCamOption(rawdata) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tagcam, option, data, checkonly } = JSON.parse(rawdata).payload;
            if (tagcam !== undefined && option !== undefined && data !== undefined) {
                if (checkonly === undefined)
                    checkonly = false;
                let checkOption = yield nvr_1.default.setCamOption(tagcam, option, data, checkonly);
                return JSON.stringify({ type: `${this.camEvent.CamSetOption}`, payload: checkOption });
            }
            else {
                return JSON.stringify({ type: `${this.camEvent.CamSetOption}`, payload: 'error' });
            }
        });
    }
    static managerAlarms(rawdata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { tagcam, typeOption, dataFilter, idAlarm } = JSON.parse(rawdata).payload;
                let checkAlarm = yield nvr_1.default.managerAlarms(typeOption, tagcam, dataFilter, idAlarm);
                return JSON.stringify({ type: `${this.camEvent.ManagerAlarms}`, payload: checkAlarm });
            }
            catch (error) {
                return JSON.stringify({ type: `${this.camEvent.ManagerAlarms}`, payload: 'error' });
            }
        });
    }
}
CamWsController.camEvent = CamEventName;
exports.default = CamWsController;
//# sourceMappingURL=cam.ws.controller.js.map