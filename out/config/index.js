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
const trilogy_1 = require("trilogy");
const fs_1 = __importDefault(require("fs"));
const no_logger_1 = require("../lib/no-logger");
const env_dev_1 = __importDefault(require("./env_dev"));
const logger = new no_logger_1.NoLogger('configbase', true);
logger.log('log for configbase');
var efolder;
(function (efolder) {
    efolder["storeCam"] = "storecams";
    efolder["motion"] = "motion";
    efolder["video"] = "video";
})(efolder || (efolder = {}));
class configBase {
    constructor() {
        this.ip = env_dev_1.default.ip;
        this.port = env_dev_1.default.port;
        this.https = {
            key: fs_1.default.readFileSync('./ssl/server_dev.key'),
            cert: fs_1.default.readFileSync('./ssl/server_dev.crt')
        };
        this.secret = env_dev_1.default.secret;
        this.namedb = env_dev_1.default.database;
        this.folderForCams = efolder;
        this._db = new db(this.namedb);
        this.splitVideoSecond = '10';
        this._listCam = [
            { xaddr: "", urn: "", name: "", username: "", password: "" },
        ];
    }
    get db() {
        return this._db;
    }
    get listCam() {
        return this._listCam;
    }
    loadConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this._db._setupTabs();
            this._listCam = yield this._db.tabCams.find();
        });
    }
}
const _users_schema = {
    id: Number,
    username: String,
    password: String,
};
const _cams_schema = {
    id: Number,
    urn: String,
    name: String,
    xaddr: String,
    username: String,
    password: String,
};
const _logallarms_schema = {
    id: Number,
    idcam: String,
    stamptime: String,
    datarif: String,
    msg: String
};
const _notify_user_schema = {
    id: Number,
    iduser: Number,
    endpoint: String,
    expirationTime: String,
    auth: String,
    p256dh: String,
    insertdata: String,
    enabled: Boolean
};
class db {
    constructor(dbname) {
        this.dbExist = false;
        this._dbName = '';
        this._dbName = dbname;
        this.dbExist = fs_1.default.existsSync(`./${this._dbName}`);
        this._db = trilogy_1.connect(`./${this._dbName}`, { client: "sql.js" });
    }
    get tabCams() {
        return this._tabCams;
    }
    get tabUsers() {
        return this._tabUsers;
    }
    get tabLogAllarms() {
        return this._tabLogAllarms;
    }
    get tabNotifyUsers() {
        return this._tabNotifyUsers;
    }
    demoCam() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dbExist) {
                env_dev_1.default.cams.forEach((cam) => __awaiter(this, void 0, void 0, function* () {
                    yield this._tabCams.updateOrCreate(cam, cam);
                }));
            }
        });
    }
    _setupTabs() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this._tabUsers = yield this._db.model("user", _users_schema, { primary: ['id'] });
                this._tabCams = yield this._db.model("cams", _cams_schema, { primary: ['id'] });
                this._tabLogAllarms = yield this._db.model("logallarms", _logallarms_schema, { primary: ['id'] });
                this._tabNotifyUsers = yield this._db.model("notifyusers", _notify_user_schema, { primary: ['id'] });
                if (!this.dbExist) {
                    yield this._tabUsers.create({
                        username: "admin",
                        password: "123456789",
                    });
                    yield this.demoCam();
                }
                return true;
            }
            catch (error) {
                logger.err("db -> _setupTabs -> error", error);
                return false;
            }
        });
    }
    logAlarms_setQuery(query, arrParam = [], dist = '', column = [], count = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const q = this._db.knex('logallarms').whereRaw(query, arrParam);
            if (dist) {
                q.groupByRaw(dist);
            }
            if (column === null || column === void 0 ? void 0 : column.length) {
                q.column(column);
            }
            if (count) {
                q.count(count, { as: count === '*' ? 'count' : `${count}` });
            }
            const logAlarms = yield this._db.raw(q, true);
            logger.log('- logAlarms_setQuery:', `query: ${query} - logAlarms.length: ${logAlarms.length}`);
            return logAlarms;
        });
    }
    logAlarms_test(query, arrParam = [], dist, column = [], count = '') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let q = this._db.knex('logallarms').whereRaw(query, arrParam);
                if (dist.length) {
                    q.groupByRaw(dist);
                }
                if (column === null || column === void 0 ? void 0 : column.length) {
                    q.column(column);
                }
                if (count) {
                    q.count(count, { as: count === '*' ? 'count' : `${count}` });
                }
                const queryResult = yield this._db.raw(q, true);
                logger.log('- logAlarms_test ~ db ~ ', queryResult);
                return queryResult;
            }
            catch (error) {
                logger.err('- logAlarms_test ~ db ~ error', error);
                return undefined;
            }
        });
    }
}
exports.default = new configBase();
//# sourceMappingURL=index.js.map