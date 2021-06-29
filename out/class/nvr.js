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
const child_process_1 = require("child_process");
const config_1 = __importDefault(require("../config"));
const helper_1 = require("../lib/helper");
const no_logger_1 = require("../lib/no-logger");
const nvr_cams_1 = require("./nvr_cams");
const nvr_users_1 = require("./nvr_users");
const nvr_video_1 = require("./nvr_video");
class Nvr {
    constructor() {
        this._blockPublicAllConnection = false;
        this._listCam = [];
        this._Cams = new nvr_cams_1.cams();
        this._ffmpegList = new Array();
        this._Users = new nvr_users_1.users();
        this._configBase = config_1.default;
        this.logger = new no_logger_1.NoLogger("nvr", true);
        this.logger.log("Start log for Nvr");
    }
    startNvr() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._Cams.StartCams(this._Users.SendAlamrs);
                //TODO start nvr sistem (check system space )
                return true;
            }
            catch (error) {
                this.logger.err("error startNvr");
                return false;
            }
        });
    }
    setOptions(typeOption, data, checkOnly = false) {
        try {
            if (typeOption === 'ipblock') {
                if (checkOnly !== true) {
                    this._blockPublicAllConnection = !this._blockPublicAllConnection;
                }
                return this._blockPublicAllConnection;
            }
        }
        catch (error) {
            return false;
        }
    }
    ipIsOk(ipclient) {
        if (this._blockPublicAllConnection === true) {
            return helper_1.helpersNEW.IsIpPrivate(ipclient);
        }
        else {
            return true;
        }
    }
    listcam() {
        let chek = this._Cams.list();
        return chek;
    }
    moveCam(idcam, PtzMoveParams, timeoutCustom) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._Cams.move(idcam, PtzMoveParams, timeoutCustom);
        });
    }
    screenshot(idCam) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._Cams.screenshot(idCam);
        });
    }
    stopCam(idCam) {
        return this._Cams.stopCam(idCam);
    }
    presetCam(idcam, presetN, speed) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._Cams.presetCam(idcam, presetN, speed);
        });
    }
    presetCamSave(idcam, presetN) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._Cams.savePreset(idcam, presetN);
        });
    }
    loginUser(username, pass, ip) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ipIsOk(ip)) {
                return this._Users.login(username, pass, ip);
            }
            return { success: false, token: '', error: 'you cannot log in you are out to lan' };
        });
    }
    verifyUser(authToken) {
        return this._Users.verifyUserToken(authToken);
    }
    setUserWS(ws, protocol, type, tagid = "") {
        return this._Users.setWS(ws, protocol, type, tagid);
    }
    logoutUser(token) {
        return this._Users.logout(token);
    }
    listUsers() {
        return this._Users.list;
    }
    /** nuova implementazione stream cam to websocket client */
    streamCam(idCam, ws, token) {
        let url_cam = this._Cams.urlRTSPStream(idCam);
        let _ffmpegExist = this._ffmpegList.find((ffmpeg) => ffmpeg.urlstream == url_cam);
        if (_ffmpegExist == null || _ffmpegExist.spawnProcess.killed == true) {
            let ffmpegNew = this.Createffmpeg(url_cam, idCam);
            this._ffmpegList.push({
                pid: ffmpegNew.pid,
                urlstream: url_cam,
                spawnProcess: ffmpegNew,
            });
        }
    }
    Createffmpeg(url_cam, idCam) {
        let ffmpegNew = child_process_1.spawn("ffmpeg", nvr_video_1.ffmpegOpt(url_cam)); //-< questo deve avvenire in this._Cams.urlRTSPStream(idCam);
        ffmpegNew.stdout.on("data", (chunk) => {
            if (this._Users.sendVideo(idCam, chunk)) {
                this.ffmpeg_kill(idCam);
            }
        });
        // necessario altrimenti si riempe il buffer ( stderr buffer exceeds 24kb you must be reading)
        //https://stackoverflow.com/questions/20792427/why-is-my-node-child-process-that-i-created-via-spawn-hanging
        ffmpegNew.stderr.on("data", function (data) { });
        ffmpegNew.stdout.on("close", (code, signal) => {
            this.logger.log(`ffmpegNew onclose pid:${ffmpegNew.pid} close:${code} signal:${signal}`);
        });
        ffmpegNew.on("exit", (code) => {
            this.logger.log(`ffmpegNew onexit pid:${ffmpegNew.pid} code:${code}`);
        });
        return ffmpegNew;
    }
    ffmpeg_kill(idCam) {
        let url_cam = this._Cams.urlRTSPStream(idCam);
        let ffmpeg = this._ffmpegList.find((ffmpeg) => ffmpeg.urlstream == url_cam);
        ffmpeg === null || ffmpeg === void 0 ? void 0 : ffmpeg.spawnProcess.kill();
        this._ffmpegList = this._ffmpegList.filter((ffmpeg) => {
            return ffmpeg.urlstream !== url_cam;
        });
        this.logger.log(`ffmpeg_kill ~ this._ffmpegList.length: ${this._ffmpegList.length}`);
    }
    /** fine nuova implementazione stream cam to websocket client */
    /**Nuova gestione PushWeb --- note:versione precedente: NotifySubscriptionUserWeb */
    NotifySubscriptionUser(token, typeSubscription, subscription_client) {
        return __awaiter(this, void 0, void 0, function* () {
            //verificare prima se lo user ha già registrato il suo brouser
            try {
                return yield this._Users.managerPush(token, typeSubscription, subscription_client);
            }
            catch (error) {
                this.logger.err("nvr subscriptionUser error:", error);
                return false;
            }
        });
    }
    /** Fine Nuova gestione PushWeb  */
    /** Nuova Implementazione setCamOption */
    setCamOption(idCam, NameOption, data, checkOnly = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._Cams.setCamOption(idCam, NameOption, data, checkOnly);
        });
    }
    /** fine Nuova Implementazione setCamOption */
    // Nuova implementazione Getione Alarm
    // #TODO da mettere in managerAlarm in nvr_cams.ts (vedere descrizione in function managerAlarm)
    managerAlarms(nameOptions, idCam = '', dataFilter, idAlarm) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._Cams.managerAlarm(nameOptions, idCam, dataFilter, idAlarm);
        });
    }
    // Fine Nuova implementazione Getione Alarm
    //#endregion
    /** Nuova Implementazione Setup Radar Cams */
    managerRadarCams(nameMethod, radarCam) {
        return __awaiter(this, void 0, void 0, function* () {
            let responseReturn = { inError: false, msg: '' };
            try {
                if (!this._blockPublicAllConnection) {
                    throw new Error('First block public access');
                }
                responseReturn.dataResult = yield this._Cams.managerRadarCams(nameMethod, radarCam);
                responseReturn.inError = false;
                this.logger.log('🚀 ~ file: nvr.ts ~ line 325 ~ Nvr ~ managerRadarCams ~ x', responseReturn);
                //return x
                return responseReturn;
            }
            catch (error) {
                responseReturn.inError = true;
                responseReturn.msg = error.message;
                return responseReturn;
            }
        });
    }
}
const _Nvr = new Nvr();
exports.default = _Nvr;
//# sourceMappingURL=nvr.js.map