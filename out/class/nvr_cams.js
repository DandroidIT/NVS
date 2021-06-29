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
exports.cams = void 0;
const node_onvif_ts_1 = require("node-onvif-ts");
const config_1 = __importDefault(require("../config"));
const no_logger_1 = require("../lib/no-logger");
const nvr_cam_1 = require("./nvr_cam");
class cams {
    constructor() {
        this._listCam = [];
        this.logger = new no_logger_1.NoLogger('nvr_Cams', true); //, true)
        this.logger.log('Start log for Cams');
    }
    list() {
        return this._listCam.sort(((a, b) => {
            return a.inError === true ? 1 : -1;
        }));
    }
    getCam(idCam) {
        return this._listCam.find(c => c.id == idCam);
    }
    StartCams(cbAlarm) {
        return __awaiter(this, void 0, void 0, function* () {
            this._sendAlamsUser = cbAlarm;
            return this.loadCams();
        });
    }
    loadCams(reload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reload || this._listCam.length === 0) {
                yield this._loadDbCams();
            }
            yield Promise.all(config_1.default.listCam.map((configCam) => __awaiter(this, void 0, void 0, function* () {
                let cam = new nvr_cam_1.nvr_cam(configCam.id.toString(), configCam.urn.toString(), configCam.name.toString(), configCam.xaddr.toString(), configCam.username.toString(), configCam.password.toString(), config_1.default.splitVideoSecond, this._sendAlamsUser);
                this._listCam.push(cam);
                const checkcam = yield cam.InitCam(false, false); //recordH24: boolean, motionsAlert: boolean METTERE IN CONFIG
                this.logger.log(`Cams -> loadCams -> AFETR INIT: ${checkcam} -- ${configCam.id} - ${configCam.name} ${configCam.xaddr}`);
                this.logger.w(`Cams -> loadCams -> AFETR INIT: ${checkcam} -- ${configCam.id} - ${configCam.name} ${configCam.xaddr}`);
            })));
        });
    }
    _loadDbCams() {
        return __awaiter(this, void 0, void 0, function* () {
            this._listCam = [];
            yield config_1.default.loadConfig();
        });
    }
    urlRTSPStream(idCam) {
        let cam = this.getCam(idCam);
        return cam ? `${cam.getRTSPstream()}` : '';
    }
    move(idCam, PtzMoveParams, timeoutCustom) {
        return __awaiter(this, void 0, void 0, function* () {
            let cam = this.getCam(idCam);
            if (cam) {
                let resultMove = yield cam.ptzN(PtzMoveParams, timeoutCustom);
                return resultMove;
            }
            else {
                return false;
            }
        });
    }
    screenshot(idCam) {
        return __awaiter(this, void 0, void 0, function* () {
            let cam = this.getCam(idCam);
            let photo = { headers: {}, body: Buffer.alloc(0) };
            if (cam) {
                let photoCam = yield cam.getScreenshotN();
                if (photoCam) {
                    photo = photoCam;
                }
            }
            return photo;
        });
    }
    stopCam(idCam) {
        let cam = this.getCam(idCam);
        if (cam) {
            cam.ptzStopN();
            return true;
        }
        else {
            return false;
        }
    }
    presetCam(idCam, presetN, speed) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = false;
            let cam = this.getCam(idCam);
            if (cam) {
                ret = yield cam.gotoPresetN(presetN, speed);
            }
            return ret;
        });
    }
    savePreset(idCam, PresetN) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = false;
            let cam = this.getCam(idCam);
            if (cam) {
                ret = yield cam.savePresetN(PresetN);
            }
            return ret;
        });
    }
    setCamOption(idCam, NameOption, data, checkOnly = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cam = this.getCam(idCam);
                if (!cam)
                    return false;
                if (NameOption === 'live24') {
                    if (checkOnly)
                        return cam.recordingH24;
                    if (cam.recordingH24 === data)
                        return;
                    cam.recordingH24 = data;
                    if (cam.recordingH24)
                        cam.recordingContinuos();
                }
                else if (NameOption === 'livemotion') {
                    if (checkOnly)
                        return cam.liveMotion;
                    if (cam.liveMotion === data)
                        return;
                    cam.liveMotion = data;
                    if (cam.liveMotion)
                        cam.liveMotionV1();
                }
                else if (NameOption === 'delete') {
                    let check = yield this.deleteCam(idCam);
                    console.log('🚀 ~ file: nvr_cams.ts ~ line 148 ~ cams ~ setCamOption ~ check', check);
                }
                return data;
            }
            catch (error) {
                this.logger.log('file: nvr_cams.ts ~ line 134 ~ setCamOption ~ error', error);
                return false;
            }
        });
    }
    //TODO: 12/06/2021 ok testare portato tutto con possibili future estensioni di opzioni
    managerAlarm(nameOptions, idCam, dataFilter, idAlarm) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🚀 ~ file: nvr_cams.ts ~ line 151 ~ cams ~ managerAlarm ~ nameOptions', nameOptions, idCam);
            try {
                let where = "";
                if (nameOptions == 'getDayAndAlarmCount') {
                    let param = [];
                    if (idCam === null || idCam === void 0 ? void 0 : idCam.length) {
                        where = `idcam=?`;
                        param.push(idCam);
                    }
                    let listDayAndAlarmCount = yield config_1.default.db.logAlarms_test(where, param, "date(stamptime)", ["stamptime"], "*");
                    return listDayAndAlarmCount;
                }
                else if (nameOptions == 'getDayAndAlarmList') {
                    where = `date(stamptime) between '${dataFilter.split("T")[0]}' and '${dataFilter.split("T")[0]}' order by id desc`;
                    let listDayAndAlarmList = yield config_1.default.db.logAlarms_test(where, [], '');
                    this.logger.log('~ file: nvr_cams.ts ~ cams ~ managerAlarm ~ listDayAndAlarmList', listDayAndAlarmList);
                    return listDayAndAlarmList;
                }
                else if (nameOptions === 'getAlarmCamList') {
                    let cam = this.getCam(idCam);
                    if (cam) {
                        //let alarm = await cam.getDettAlarm(idAlarm);
                        let listAlarmCamList = yield cam.getListAlarm(undefined, { dataFilter });
                        this.logger.log('🚀 ~ file: nvr_cams.ts ~ cams ~ managerAlarm ~ listAlarm', listAlarmCamList);
                        return listAlarmCamList;
                    }
                }
                else if (nameOptions === 'getAlarmCam') {
                    let cam = this.getCam(idCam);
                    if (cam) {
                        let Alarm = yield cam.getDettAlarm(idAlarm);
                        this.logger.log('🚀 ~ file: nvr_cams.ts ~ cams ~ managerAlarm ~ Alarm', Alarm);
                        return Alarm;
                    }
                }
            }
            catch (error) {
                this.logger.err('🚀 ~ file: nvr_cams.ts ~ line 164 ~ cams ~ error', error);
            }
        });
    }
    managerRadarCams(nameMethod, radarCam) {
        return __awaiter(this, void 0, void 0, function* () {
            if (nameMethod === 'startRadarCams') {
                let RadarResult = yield node_onvif_ts_1.startProbe();
                let RadarCams = [];
                RadarResult.map((prob) => {
                    let cam = this._listCam.find(cam => cam.urn === prob.urn);
                    RadarCams.push({ urn: prob.urn, name: cam === undefined ? prob.name : cam.nameCam, xaddrs: prob.xaddrs, exist: cam === undefined ? false : true });
                });
                return RadarCams;
            }
            else if (nameMethod === 'saveRadarCams') {
                let checksaveCam = yield this.saveCam(radarCam);
                return checksaveCam;
            }
            else if (nameMethod === 'delRadarCams') {
            }
        });
    }
    /** Update or Create cam and reload cams*/
    saveCam(radarCam) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let resultSaveCams = yield config_1.default.db.tabCams.updateOrCreate({
                    urn: radarCam.urn.toString(),
                    name: radarCam.name.toString(),
                    xaddr: radarCam.xaddrs.toString(),
                    username: radarCam.username.toString(),
                    password: radarCam.password.toString(),
                }, {
                    urn: radarCam.urn.toString(),
                    name: radarCam.name.toString(),
                    xaddr: radarCam.xaddrs.toString(),
                    username: radarCam.username.toString(),
                    password: radarCam.password.toString(),
                });
                if (resultSaveCams.length) {
                    yield this.loadCams(true);
                    return this._listCam;
                }
                return [];
            }
            catch (error) {
                console.log("savecam error: ", error);
                return [];
            }
        });
    }
    deleteCam(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let check = yield config_1.default.db.tabCams.remove({ id: Number(id) });
                yield this.loadCams(true);
                return check;
            }
            catch (error) {
                console.log("deleteCam error: ", error);
                return [];
            }
        });
    }
}
exports.cams = cams;
//# sourceMappingURL=nvr_cams.js.map