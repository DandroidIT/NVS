import { IncomingMessage } from "http";
import WebSocket, { WebSocketClient } from "ws";
import { ICamApi, typeWS } from '../class/interface'
import Nvr from '../class/nvr'
import { nanoId } from '../lib/helper'
import { NoLogger } from '../lib/no-logger'


const logger = new NoLogger('NvrWsController', true)//, true)
logger.log('Start log for NvrWsController')
enum NvrEventName {
  PONG = 'pong',
  ManagerPush = 'push_manager',
  SetOption = "nvr_set_option",
  ManagerRadarCams = "radarcams_manager",
  logoutUser = 'logout'
}

class NvrWsController {
  public static nvrEvent = NvrEventName

  static InitClient(ws: WebSocketClient, protocol: string, type: typeWS, tagid = '') {
    let user = Nvr.verifyUser(protocol)
    if (user) {
      ws.idConnect = nanoId.getId()
      Nvr.setUserWS(ws, protocol, type, tagid)
      ws.on(this.nvrEvent.PONG, () => {
        // logger.log(`PONG dal client ws.idConnect: ${ws.idConnect} `)
        ws.online = true
      })
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
    } else {
      ws.terminate()
    }
  }

  static checkIpIsOk(ip: string) {
    return Nvr.ipIsOk(ip)
  }

  static startPingCustom = () => {
    //return
    return setInterval(() => {
      let listUser = Nvr.listUsers()
      Array.from(listUser.values()).forEach((user, indexUser) => {
        user.ws_list.forEach((wsItem, indexWS) => {
          if (wsItem.type === 'api') {
            if (!wsItem.ws.online) {
              logger.log(`startPingCustom TERMINATE wsItem.ws.online is ${wsItem.ws.online} - readyState: ${wsItem.ws.readyState} '->`)
              wsItem.ws.close();
              user.ws_list.delete(indexWS)
              return
            }
            wsItem.ws.online = false
            wsItem.ws.send(JSON.stringify({ type: `ping`, payload: `${wsItem.ws.idConnect}` }))
            //logger.log(`PING al client ws.idConnect: ${wsItem.ws.idConnect}`)
          }
        })
      })

    }, 3000)
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

  public static logoutUser(rawdata: any) {
    let { token } = JSON.parse(rawdata).payload
    let checkLogOut = Nvr.logoutUser(token)
    return JSON.stringify({ type: this.nvrEvent.logoutUser, payload: checkLogOut })
  }

  public static async managerPush(rawdata: any) {
    let { typeSubscription, subscription_client, token } = JSON.parse(rawdata).payload
    console.log('🚀 ~ file: nvr.ws.controller.ts ~ line 84 ~ NvrWsController ~ managerPush ~ typeSubscription:', typeSubscription, ' subscription_client:', subscription_client)
    let checkPush = await Nvr.NotifySubscriptionUser(token, typeSubscription, subscription_client)
    return JSON.stringify({ type: this.nvrEvent.ManagerPush, payload: checkPush })
  }

  static SetOptions(rawdata: any) {
    let { typeOption, data, checkOnly } = JSON.parse(rawdata).payload
    let checkOption = Nvr.setOptions(typeOption, data, checkOnly)
    console.log('🚀 ~ file: nvr.ws.controller.ts ~ line 93 ~ NvrWsController ~ SetOptions ~ checkOption', checkOption)
    return JSON.stringify({ type: this.nvrEvent.SetOption, payload: checkOption })
  }
  static async managerRadarCams(rawdata: any) {
    let { typeMethod, radarCam } = JSON.parse(rawdata).payload
    let resultmanagerRadarCams = await Nvr.managerRadarCams(typeMethod, radarCam)
    return JSON.stringify({ type: this.nvrEvent.ManagerRadarCams, payload: resultmanagerRadarCams })
  }


}

export default NvrWsController