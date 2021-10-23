import { IncomingMessage } from "http";
import WebSocket, { WebSocketClient } from "ws";
import { ICamApi, typeWS } from '../class/interface'
import Nvr from '../class/nvr'
import { nanoId } from '../lib/helper'
import { NoLogger } from '../lib/no-logger'


const logger = new NoLogger('NvrWsController')

enum NvrEventName {
  PONG = 'pong',
  ManagerPush = 'push_manager',
  SetOptions = "set_options",
  RadarCams = "radarcams",
  saveRadarCam = "saveradarcam",
  updateUser = 'userupdate',
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
    let checkPush = await Nvr.NotifySubscriptionUser(token, typeSubscription, subscription_client)
    return JSON.stringify({ type: this.nvrEvent.ManagerPush, payload: checkPush })
  }

  static SetOptions(rawdata: any) {
    let { typeOption, data, checkOnly } = JSON.parse(rawdata).payload
    let checkOption = Nvr.setOptions(typeOption, data, checkOnly)
    return JSON.stringify({ type: this.nvrEvent.SetOptions, payload: checkOption })
  }

  static async radarCams() {
    let resultmanagerRadarCams = await Nvr.RadarCams()
    return JSON.stringify({ type: this.nvrEvent.RadarCams, payload: resultmanagerRadarCams })
  }

  static async saveRadarCam(rawdata: string) {
    let { cam } = JSON.parse(rawdata).payload
    let res = await Nvr.saveRadarCam(cam)
    return JSON.stringify({ type: this.nvrEvent.saveRadarCam, payload: res })

  }

  public static async updateUser(rawdata: string) {
    let { username, password, newUsername, newPassword } = JSON.parse(rawdata).payload
    let checkUpdate = await Nvr.updateUser(username, password, newUsername, newPassword)
    return JSON.stringify({ type: this.nvrEvent.updateUser, payload: checkUpdate })
  }

}

export default NvrWsController