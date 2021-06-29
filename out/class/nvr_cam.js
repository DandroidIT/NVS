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
exports.nvr_cam = void 0;
const fs_1 = __importDefault(require("fs"));
const jimp_1 = __importDefault(require("jimp"));
const node_onvif_ts_1 = require("node-onvif-ts");
const config_1 = __importDefault(require("../config"));
const helper_1 = require("../lib/helper");
const no_logger_1 = require("../lib/no-logger");
const nvr_video_1 = require("./nvr_video");
class nvr_cam {
    constructor(id, urn, namecam, ip, username, password, durationVideo, cbAlarm) {
        this.id = '';
        this.ip = '';
        this.username = '';
        this.password = '';
        this.urlRTSPstream = '';
        this.inMove = false;
        this._recordingH24 = false;
        this._liveMotion = false;
        this.nameCam = '';
        this.asPtz = false;
        this.inError = true;
        this._profiles = [];
        this.id = id;
        this.urn = urn;
        this.nameCam = namecam;
        this.ip = ip;
        this.username = username;
        this.password = password;
        this._durationVideos = durationVideo;
        this._emitAlarm = cbAlarm;
        this.logger = new no_logger_1.NoLogger(`cam_${this.id}`, true); //, true)
        this.logger.log(`Start log for cam${this.id}`);
        this._elaborateVideo = new nvr_video_1.elaborateVideo();
        this.camRX = new node_onvif_ts_1.OnvifDevice({ xaddr: this.ip, user: this.username, pass: this.password });
    }
    get recordingH24() {
        return this._recordingH24;
    }
    set recordingH24(value) {
        this._recordingH24 = value;
    }
    get liveMotion() {
        return this._liveMotion;
    }
    set liveMotion(value) {
        this._liveMotion = value;
    }
    InitCam(recordH24, motionsAlert) {
        return __awaiter(this, void 0, void 0, function* () {
            //finire init test
            try {
                this.information = yield this.camRX.init();
                let check = this.information === undefined ? false : true;
                if (check !== undefined) {
                    this.asPtz = this.camRX.services.ptz ? true : false;
                    this._recordingH24 = recordH24;
                    this._liveMotion = motionsAlert;
                    this.recordingContinuos();
                    this.liveMotionV1();
                    this.inError = false;
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                this.logger.err(`Cam -> InitCam -> ${this.nameCam} error: ${error.message}`);
                this.logger.w(`Cam -> InitCam -> ${this.nameCam} error: ${error.message}`);
                this.inError = true;
                return false;
            }
        });
    }
    getInformationArray() {
        let newMap = new Map();
        if (!this.inError) {
            newMap = new Map(Object.entries(this.information));
        }
        return Array.from(newMap);
    }
    _pathElaborate(path, forMotion) {
        let _urlElaborate = `${path}/${config_1.default.folderForCams.storeCam}/${this.id}/${helper_1.helpersNEW.date.dateString().split(' ')[0]}`;
        if (forMotion) {
            _urlElaborate = `${_urlElaborate}/${config_1.default.folderForCams.motion}/`;
        }
        else {
            _urlElaborate = `${_urlElaborate}/${config_1.default.folderForCams.video}/`;
        }
        fs_1.default.mkdirSync(_urlElaborate, { recursive: true });
        return _urlElaborate;
    }
    recordingContinuos() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._recordingH24)
                return;
            let url = this.getRTSPstream();
            let res = yield this._elaborateVideo.startVideoRecording(url, this._pathElaborate('./'), this._durationVideos);
            if (res)
                this.recordingContinuos();
        });
    }
    _getProfile() {
        let prof = this.camRX.getCurrentProfile();
        return prof;
    }
    getRTSPstream() {
        if (this.urlRTSPstream.length) {
            return this.urlRTSPstream;
        }
        try {
            let url = new URL(this._getProfile().stream.rtsp);
            this.urlRTSPstream = `${url.protocol}//${this.username}:${this.password}@${url.hostname}:${url.port}${url.pathname}${url.search}`;
            return this.urlRTSPstream;
        }
        catch (error) {
            return '';
        }
    }
    getListAlarm(limit = 0, { dataFilter = '' } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let listAllarm;
            if (dataFilter.length) {
                let where = `idcam=${this.id} and date(stamptime) between '${dataFilter.split('T')[0]}' and '${dataFilter.split('T')[0]}' order by id desc`;
                listAllarm = yield config_1.default.db.logAlarms_setQuery(where);
            }
            else {
                listAllarm = yield config_1.default.db.tabLogAllarms.find({ idcam: this.id }, { order: ['id', 'desc'] });
            }
            if (limit !== 0) {
                listAllarm.length = limit;
            }
            return listAllarm;
        });
    }
    getDettAlarm(id, imgBase64 = true) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id)
                    return;
                let alarm = yield config_1.default.db.tabLogAllarms.findOne({ id: Number(id) });
                if (alarm) {
                    if (imgBase64) {
                        let arrPathImg = alarm.datarif.split('|');
                        let BaseString = (yield helper_1.helpersNEW.imageToBase64(arrPathImg[0])) + '|' + (yield helper_1.helpersNEW.imageToBase64(arrPathImg[1]));
                        alarm.datarif = BaseString;
                    }
                }
                return alarm;
            }
            catch (error) {
                this.logger.err('getDettAlarm:', error);
                return undefined;
            }
        });
    }
    liveMotionV1() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🚀 liveMotionV1 ~  this.inMove', this.inMove);
            if (!this._liveMotion || this.inMove === true) {
                return;
            }
            try {
                let arr = [];
                let arrSnap1 = yield this.getScreenshotN();
                let arrSnap2 = yield this.getScreenshotN();
                if (arrSnap1 && arrSnap2) {
                    arr.push(arrSnap1.body);
                    arr.push(arrSnap2.body);
                    let isMotion = yield this._diffRilevateV1(arr);
                    if (isMotion.inAlarm) {
                        let alarm = yield config_1.default.db.tabLogAllarms.create({ idcam: this.id, datarif: isMotion.arrImg.join('|'), stamptime: helper_1.helpersNEW.date.dateISOLocate(), msg: 'ALLARME liveMotionV1' });
                        this.logger.log(`${helper_1.helpersNEW.date.dateString()} ALLARM CAM ${this.nameCam} idalarm:${alarm === null || alarm === void 0 ? void 0 : alarm.id}`);
                        this.logger.w(`${helper_1.helpersNEW.date.dateString()} ALLARM CAM ${this.nameCam} idalarm:${alarm === null || alarm === void 0 ? void 0 : alarm.id}`);
                        this._emitAlarm(`${helper_1.helpersNEW.date.dateString()} ALLARM CAM ${this.nameCam} idalarm:${alarm === null || alarm === void 0 ? void 0 : alarm.id} link: <a href='/#/dettalarm/18/${alarm === null || alarm === void 0 ? void 0 : alarm.id}'>link</a>`);
                    }
                    else {
                    }
                }
                else {
                    this.logger.log(`liveMotionV1 ~ arrSnap1 && arrSnap2 ERROR UNDEFINED CAM ${this.nameCam}`);
                    this.logger.w(`liveMotionV1 ~ arrSnap1 && arrSnap2 ERROR UNDEFINED CAM ${this.nameCam}`);
                }
                this.liveMotionV1();
            }
            catch (error) {
                this.logger.err(`liveMotionV1 error ${error} - CAM ${this.nameCam}`);
                this.logger.w(`liveMotionV1 error ${error} - CAM ${this.nameCam}`);
                this.liveMotionV1();
            }
        });
    }
    _diffRilevateV1(arrB) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let img1 = yield jimp_1.default.read(arrB[0]);
                let img2 = yield jimp_1.default.read(arrB[1]);
                let distance = jimp_1.default.distance(img1, img2); // perceived distance
                let different = jimp_1.default.diff(img1, img2, 0.2);
                if (different.percent > 0.02 || distance > 0.02) { // TODO: una cartella per evento allarme
                    let img1Name = this._pathElaborate('.', true) + `/motion1_${helper_1.helpersNEW.date.dateFULLString()}.jpg`;
                    let img2Name = this._pathElaborate('.', true) + `/motion2_${helper_1.helpersNEW.date.dateFULLString()}.jpg`;
                    img1.resize(800, jimp_1.default.AUTO).write(img1Name);
                    img2.resize(800, jimp_1.default.AUTO).write(img2Name);
                    return { inAlarm: true, arrImg: [img1Name, img2Name] };
                }
                else {
                    return { inAlarm: false, arrImg: [] };
                }
                /*  arrB.map((buff)=>{
                   console.log('🚀 ~ file: cam.ts ~ line 133 ~ Cam ~ arrB.forEach ~ buff', buff)
                 })     */
            }
            catch (error) {
                return { inAlarm: false, arrImg: [] };
            }
        });
    }
    getScreenshotN() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let foto = yield this.camRX.fetchSnapshot();
                return foto;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    ptzStopN() {
        if (this.asPtz === false)
            return;
        this.camRX.ptzStop().then((res) => {
            this.logger.log('🚀 ~ file: cam.ts ~ line 105 ~ ptzStop!!!!!!!!!!!!!:', res);
        });
    }
    ptzN(xyz, timeoutCustom) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                if (this.asPtz === false) {
                    rej(false);
                }
                let stopCam = () => __awaiter(this, void 0, void 0, function* () {
                    setTimeout(() => {
                        this.camRX.ptzStop();
                        this.logger.log(`stopCam in ${timeoutCustom}`);
                        res(true);
                    }, timeoutCustom === undefined ? 500 : timeoutCustom); //, )
                });
                try {
                    this.inMove = true;
                    xyz.timeout = xyz.timeout === undefined ? 1 : xyz.timeout;
                    yield this.camRX.ptzMove(xyz);
                    yield stopCam();
                    this.inMove = false;
                }
                catch (error) {
                    this.logger.err(`Cam -> ptz -> error ${this.ip} message ${error.message}`);
                    this.inMove = false;
                    rej(false);
                }
            }));
        });
    }
    gotoPresetN(presetN, speed) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🚀 gotoPresetN ~ this.inMove', this.inMove);
            if (this.asPtz === false) {
                return false;
            }
            try {
                this.inMove = true;
                let preset = {
                    ProfileToken: this._getProfile().token,
                    PresetToken: presetN,
                    Speed: speed
                };
                let check = yield ((_a = this.camRX.services.ptz) === null || _a === void 0 ? void 0 : _a.gotoPreset(preset));
                this.inMove = false;
                return check === undefined ? false : true;
            }
            catch (error) {
                this.logger.err('cam.ts ~ line 119 ~ Cam ~ gotoPreset ~ error', error);
                this.inMove = false;
                return false;
            }
        });
    }
    savePresetN(presetN) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.asPtz === false) {
                return false;
            }
            try {
                let setpre = { ProfileToken: this._getProfile().token, PresetName: presetN };
                let check = yield ((_a = this.camRX.services.ptz) === null || _a === void 0 ? void 0 : _a.setPreset(setpre));
                return check === undefined ? false : true;
            }
            catch (error) {
                this.logger.log('cam.ts ~ line 142 ~ Cam ~ savePreset ~ error', error);
                return false;
            }
        });
    }
}
exports.nvr_cam = nvr_cam;
//# sourceMappingURL=nvr_cam.js.map