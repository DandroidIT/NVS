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
exports.helpJwt = exports.helpersNEW = exports.nanoId = void 0;
const jimp_1 = __importDefault(require("jimp"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const private_ip_1 = __importDefault(require("private-ip"));
var nanoId;
(function (nanoId) {
    function getId(size = 10) {
        return nanoid_1.nanoid(size);
    }
    nanoId.getId = getId;
})(nanoId = exports.nanoId || (exports.nanoId = {}));
var helpersNEW;
(function (helpersNEW) {
    function formatBytes(a, b = 2) { if (0 === a)
        return "0 Bytes"; const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024)); return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]; }
    helpersNEW.formatBytes = formatBytes;
    let date;
    (function (date_1) {
        function dateISOLocate(date) {
            let d = date || (new Date());
            const pad = (n) => n < 10 ? '0' + n : n;
            return d.getFullYear() + '-'
                + pad(d.getMonth() + 1) + '-'
                + pad(d.getDate()) + 'T'
                + pad(d.getHours()) + ':'
                + pad(d.getMinutes()) + ':'
                + pad(d.getSeconds()) + 'Z';
        }
        date_1.dateISOLocate = dateISOLocate;
        function dateISOString() {
            return new Date().toISOString().slice(0, 19) + 'Z';
        }
        date_1.dateISOString = dateISOString;
        function dateString(date) {
            var dt = date || (new Date());
            return [dt.getDate(), dt.getMonth() + 1, dt.getFullYear()].join('-') + ' '
                + [dt.getHours(), dt.getMinutes(), dt.getSeconds()].join('-');
        }
        date_1.dateString = dateString;
        function dateFULLString(date) {
            var dt = date || (new Date());
            return [dt.getDate(), dt.getMonth() + 1, dt.getFullYear()].join('-') + ' '
                + [dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds()].join('-');
        }
        date_1.dateFULLString = dateFULLString;
        function humanTimeToMS(text) {
            let parts = [];
            parts = text.split(':').map(p => parseInt(p));
            let time = 0;
            time += Math.floor(parts.pop() * 1000); //s
            time += parts.pop() * 1000 * 60; //m
            time += parts.pop() * 1000 * 60 * 60; //h
            return time;
        }
        date_1.humanTimeToMS = humanTimeToMS;
    })(date = helpersNEW.date || (helpersNEW.date = {}));
    function IsIpPrivate(remoteIp) {
        return private_ip_1.default(remoteIp);
    }
    helpersNEW.IsIpPrivate = IsIpPrivate;
    function delay(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise(resolve => setTimeout(resolve, ms));
        });
    }
    helpersNEW.delay = delay;
    function isEmptyObject(obj) {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    helpersNEW.isEmptyObject = isEmptyObject;
    function mapToJson(map) {
        return JSON.stringify([...map]);
    }
    helpersNEW.mapToJson = mapToJson;
    function jsonToMap(jsonStr) {
        return new Map(JSON.parse(jsonStr));
    }
    helpersNEW.jsonToMap = jsonToMap;
    function strMapToObj(strMap) {
        let obj = Object.create(null);
        for (let [k, v] of strMap) {
            // We don’t escape the key '__proto__'
            // which can cause problems on older engines
            obj[k] = v;
        }
        return obj;
    }
    helpersNEW.strMapToObj = strMapToObj;
    function objToStrMap(obj) {
        let strMap = new Map();
        for (let k of Object.keys(obj)) {
            strMap.set(k, obj[k]);
        }
        return strMap;
    }
    helpersNEW.objToStrMap = objToStrMap;
    helpersNEW.imageToBase64 = (pathImage) => __awaiter(this, void 0, void 0, function* () {
        let imgJ = yield jimp_1.default.read(pathImage);
        //imgJ.resize(600, Jimp.AUTO).quality(100)
        //return await res.getBase64Async('image/png')
        return yield imgJ.getBase64Async('image/png');
    });
})(helpersNEW = exports.helpersNEW || (exports.helpersNEW = {}));
var helpJwt;
(function (helpJwt) {
    function getToken(payload = {}, secretOrPrivateKey, options) {
        return jsonwebtoken_1.default.sign(payload, secretOrPrivateKey, options); // { expiresIn: '1d' })
    }
    helpJwt.getToken = getToken;
    function verifyToken(token, secretOrPublicKey, options) {
        return jsonwebtoken_1.default.verify(token, secretOrPublicKey, options);
    }
    helpJwt.verifyToken = verifyToken;
    function decodeToken(token, options) {
        return jsonwebtoken_1.default.decode(token, options);
    }
    helpJwt.decodeToken = decodeToken;
})(helpJwt = exports.helpJwt || (exports.helpJwt = {}));
//# sourceMappingURL=helper.js.map