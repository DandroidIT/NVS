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
const helper_1 = require("../lib/helper");
const no_logger_1 = require("../lib/no-logger");
const logger = new no_logger_1.NoLogger('NvrWsController', true); //, true)
logger.log('Start log for NvrWsController');
var NvrEventName;
(function (NvrEventName) {
    NvrEventName["PONG"] = "pong";
    NvrEventName["ManagerPush"] = "push_manager";
    NvrEventName["SetOption"] = "nvr_set_option";
    NvrEventName["ManagerRadarCams"] = "radarcams_manager";
    NvrEventName["logoutUser"] = "logout";
})(NvrEventName || (NvrEventName = {}));
class NvrWsController {
    static InitClient(ws, protocol, type, tagid = '') {
        let user = nvr_1.default.verifyUser(protocol);
        if (user) {
            ws.idConnect = helper_1.nanoId.getId();
            nvr_1.default.setUserWS(ws, protocol, type, tagid);
            ws.on(this.nvrEvent.PONG, () => {
                // logger.log(`PONG dal client ws.idConnect: ${ws.idConnect} `)
                ws.online = true;
            });
            /* 			if (type === 'api') {
                    ws.online = true
                    /* ws.idConnect = nanoId.getId()
                    Nvr.setUserWS(ws, protocol, 'api') /
                    ws.on(this.nvrEvent.PONG, () => {
                      // logger.log(`PONG dal client ws.idConnect: ${ws.idConnect} `)
                      ws.online = true
                    })
                    ws.on("close", (code: number, reason: string) => {
                      logger.log(`NvrWsController InitClient : CLOSE API Client disconnected user.id: ${user?.id} user.idconnect:${user?.idconnect} ws.idConnect:${ws.idConnect} - reason: ${reason} code: ${code}`);
                      NvrWsController.checkUserWS(protocol)
                    })
                  } else if (type === 'stream') {
                    ws.on("close", (code: number, reason: string) => {
                      logger.log(`NvrWsController InitClient : CLOSE STREM Client disconnected user.id: ${user?.id} user.idconnect:${user?.idconnect} ws.idConnect:${ws.idConnect} - reason: ${reason} code: ${code}`);
                      // TODO: qui si puo spostare un user setWS
                    })
                  }  */
        }
        else {
            ws.terminate();
        }
    }
    static checkIpIsOk(ip) {
        return nvr_1.default.ipIsOk(ip);
    }
    /* 	static checkUserWS(protocol: string) {
        let checkUser = Nvr.verifyUser(protocol)
        if (checkUser) {
          if (checkUser.ws_list.size === 1) {
            let checkLogout = Nvr.logoutUser(protocol)
            if (checkLogout)
              logger.log(`NvrWsController ws.checkUserWS: logoutclient ${checkUser?.username}`);
          }
      
        }
      } */
    static logoutUser(rawdata) {
        let { token } = JSON.parse(rawdata).payload;
        let checkLogOut = nvr_1.default.logoutUser(token);
        return JSON.stringify({ type: this.nvrEvent.logoutUser, payload: checkLogOut });
    }
    static managerPush(rawdata) {
        return __awaiter(this, void 0, void 0, function* () {
            let { typeSubscription, subscription_client, token } = JSON.parse(rawdata).payload;
            console.log('🚀 ~ file: nvr.ws.controller.ts ~ line 84 ~ NvrWsController ~ managerPush ~ typeSubscription:', typeSubscription, ' subscription_client:', subscription_client);
            let checkPush = yield nvr_1.default.NotifySubscriptionUser(token, typeSubscription, subscription_client);
            return JSON.stringify({ type: this.nvrEvent.ManagerPush, payload: checkPush });
        });
    }
    static SetOptions(rawdata) {
        let { typeOption, data, checkOnly } = JSON.parse(rawdata).payload;
        let checkOption = nvr_1.default.setOptions(typeOption, data, checkOnly);
        console.log('🚀 ~ file: nvr.ws.controller.ts ~ line 93 ~ NvrWsController ~ SetOptions ~ checkOption', checkOption);
        return JSON.stringify({ type: this.nvrEvent.SetOption, payload: checkOption });
    }
    static managerRadarCams(rawdata) {
        return __awaiter(this, void 0, void 0, function* () {
            let { typeMethod, radarCam } = JSON.parse(rawdata).payload;
            let resultmanagerRadarCams = yield nvr_1.default.managerRadarCams(typeMethod, radarCam);
            return JSON.stringify({ type: this.nvrEvent.ManagerRadarCams, payload: resultmanagerRadarCams });
        });
    }
}
NvrWsController.nvrEvent = NvrEventName;
NvrWsController.startPingCustom = () => {
    //return
    return setInterval(() => {
        let listUser = nvr_1.default.listUsers();
        Array.from(listUser.values()).forEach((user, indexUser) => {
            user.ws_list.forEach((wsItem, indexWS) => {
                if (wsItem.type === 'api') {
                    if (!wsItem.ws.online) {
                        logger.log(`startPingCustom TERMINATE wsItem.ws.online is ${wsItem.ws.online} - readyState: ${wsItem.ws.readyState} '->`);
                        wsItem.ws.close();
                        user.ws_list.delete(indexWS);
                        return;
                    }
                    wsItem.ws.online = false;
                    wsItem.ws.send(JSON.stringify({ type: `ping`, payload: `${wsItem.ws.idConnect}` }));
                    //logger.log(`PING al client ws.idConnect: ${wsItem.ws.idConnect}`)
                }
            });
        });
    }, 3000);
};
exports.default = NvrWsController;
//# sourceMappingURL=nvr.ws.controller.js.map