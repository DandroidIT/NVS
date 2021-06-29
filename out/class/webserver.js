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
const cors_1 = __importDefault(require("@koa/cors"));
const https_1 = __importDefault(require("https"));
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_compress_1 = __importDefault(require("koa-compress"));
const koa_helmet_1 = __importDefault(require("koa-helmet"));
const koa_jwt_1 = __importDefault(require("koa-jwt"));
const config_1 = __importDefault(require("../config"));
//import NvrRouters from '../route/nvr_api.router'
const no_logger_1 = require("../lib/no-logger");
const auth_router_1 = __importDefault(require("../route/auth.router"));
const nvr_1 = __importDefault(require("./nvr"));
const nvr_websocket_1 = __importDefault(require("./nvr_websocket"));
const logger = new no_logger_1.NoLogger('_webserver', true); //, true) // log.newLogger('_webserver')
logger.log('log for webserver');
class serverApi extends koa_1.default {
    constructor() {
        super();
        //private _routers: Router = new Router();
        this._ip = '';
        this._port = 0;
        this._blockPublicAllConnection = false;
    }
    StartServer() {
        this._ip = config_1.default.ip;
        this._port = config_1.default.port;
        this.baseRouters();
        this.use(this._mwCheckAuth);
        this.use(koa_jwt_1.default({ secret: config_1.default.secret })
            .unless({ path: [/^\/login/, /^\/register/, /^\/api/] }) // ,  /^\/broadcast/, /^\/subscription/ , /^\/ws/ una volta fatto i test eliminare ws e metterlo in AUTH
        );
        this.use(auth_router_1.default.routes());
        //this.use(NvrRouters.routes())
        this._httpsServer = https_1.default.createServer({ key: config_1.default.https.key, cert: config_1.default.https.cert }, this.callback());
        nvr_websocket_1.default.Start(this._httpsServer);
        this._httpsServer.listen(this._port, this._ip, () => {
            logger.log(`App listening on the ip ${this._ip}:${this._port}`);
            logger.w(`App listening on the ip ${this._ip}:${this._port}`);
        });
    }
    baseRouters() {
        this.use(koa_compress_1.default({
            threshold: 1048,
            gzip: {
                flush: require('zlib').constants.Z_SYNC_FLUSH
            },
            deflate: {
                flush: require('zlib').constants.Z_SYNC_FLUSH,
            },
            br: false // disable brotli
        }));
        this.use(cors_1.default());
        this.use(koa_helmet_1.default());
        this.use(koa_bodyparser_1.default());
        //this.use(this.securConnection) <- disabilitato: tutte le route ora passano per websocket (nuova implementazione in Nvr.ipIsOk)
        this.use(this._logger);
    }
    /* 	securConnection = (ctx: Koa.ParameterizedContext, next: () => Promise<any>) => {
        const nm = new Netmask('192.168.9.0/24')
        if (Nvr._blockPublicAllConnection && nm.contains(ctx.ip) === false) {
          logger.err(`DENY ACCESS securConnection for ip ${ctx.ip}`);
          logger.w(`DENY ACCESS securConnection for ip ${ctx.ip}`);
          ctx.throw(401);
        }
        /* if (nm.contains(ctx.ip)){
          console.log(ctx)
          ctx.throw(new Error('invalid'), 400);
        } /
        return next()
      } */
    _logger(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let format = ':method ":url"';
            const str = format.replace(':method', ctx.method).replace(':url', ctx.url);
            const time1 = Date.now();
            yield next();
            const time2 = Date.now();
            const responseTime = Math.ceil(time2 - time1); // Date.now() - time
            logger.log(`serverApi _logger | ip: ${ctx.ip} - type: ${ctx.type} protocol: ${ctx.protocol} method url: ${str} status: ${ctx.response.status} responseTime:${responseTime}`);
            logger.w(`serverApi _logger | ip: ${ctx.ip} - type: ${ctx.type} protocol: ${ctx.protocol} method url: ${str} status: ${ctx.response.status} responseTime:${responseTime}`);
        });
    }
    _mwCheckAuth(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log('🚀 controllo _mwCheckAuth')
            const urlExclude = ['/login']; //,'/broadcast','/subscription'
            if (!urlExclude.includes(ctx.originalUrl)) {
                let authToken = ctx.header.authorization;
                if (authToken) { //
                    authToken = authToken.split(' ')[1];
                    // controllo authorization
                    // let u = jwt.decode(authToken,{ complete: true})
                    try {
                        // jwt.verify(authToken, configBase.secret, { complete: true })
                        let u = nvr_1.default.verifyUser(authToken);
                        if (u === undefined) {
                            logger.log(`"Utente non trovato" ${ctx.ip}`);
                            logger.w(`"Utente non trovato" ${ctx.ip}`);
                            throw new Error("Utente non trovato");
                        }
                        ctx.state.user = u;
                        logger.log(`webserver -> _mwCheckAuth OK ${u.username} ${ctx.ip}`);
                        logger.w(`webserver -> _mwCheckAuth OK ${u.username} ${ctx.ip}`);
                    }
                    catch (error) {
                        logger.err(`webserver -> _mwCheckAuth error ${error.message} ${ctx.ip} token: ${authToken}`);
                        logger.w(`webserver -> _mwCheckAuth error ${error.message} ${ctx.ip} token: ${authToken}`);
                        // ctx.status = 401
                        ctx.throw(401);
                    }
                }
            }
            return next().catch(err => {
                if (err.status === 401) {
                    ctx.status = 401;
                    ctx.body = { error: err.originalError ? err.originalError.message : err.message };
                }
                else {
                    throw err;
                }
            });
        });
    }
}
exports.default = new serverApi();
//# sourceMappingURL=webserver.js.map