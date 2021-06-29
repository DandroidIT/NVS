import { IncomingMessage } from "http";
import WebSocket, { WebSocketClient } from "ws";
import { ICamApi } from '../class/interface'
import Nvr from '../class/nvr'
import { NoLogger } from '../lib/no-logger'
import NvrWsController from "./nvr.ws.controller";


const logger = new NoLogger('CamWSController', true)//, true)
logger.log('Start log for CamWSController')
enum CamEventName {
  CamControll = 'camcontroll',
  CamList = 'camlist',
  CamSetOption = 'setcamoption',
  TEST = 'test',
  ManagerAlarms = "manageralarms"
}

class CamWsController {
  public static camEvent = CamEventName

  public static async move(data: any): Promise<string> {
    logger.log('CamWsController ~ move ~ data', data)
    try {
      let { cmd, tagcam, speed, timeout, preset } = JSON.parse(data).payload
      let checkCommand = false
      if (cmd === 'move_stop') {
        checkCommand = Nvr.stopCam(tagcam)
      } else if (cmd === 'move') {
        checkCommand = await Nvr.moveCam(tagcam, { speed }, timeout)
      } else if (cmd === 'preset') {
        checkCommand = await Nvr.presetCam(tagcam, preset, speed)
      } else if (cmd === 'save_preset') {
        checkCommand = await Nvr.presetCamSave(tagcam, preset)
      } else if (cmd === 'screenshot') {
        let foto = await Nvr.screenshot(tagcam)
        return JSON.stringify({ type: cmd, payload: foto?.body })
      } else {
        return JSON.stringify({ type: cmd, payload: checkCommand })
      }
      return JSON.stringify({ type: `${this.camEvent.CamControll}`, payload: checkCommand })
    } catch (error: any) {
      logger.err('CamWsController ~ move ~ error', error)
      return error
    }

  }

  public static async list() {
    let arrCam: ICamApi[] = []
    Nvr.listcam().map(async cam => {
      arrCam.push({
        id: cam.id!, information: cam.getInformationArray(),
        name: cam.nameCam, asPTZ: cam.asPtz, inerror: cam.inError,
        liveH24: cam.recordingH24, motion: cam.liveMotion //, arrAllarm:str
      })
    })
    return JSON.stringify({ type: 'camlist', payload: arrCam })
  }

  /*  public static StreamCam(idCam: string, ws: WebSocketClient, request: IncomingMessage) {
     Nvr.streamCam(idCam, ws, request.headers['sec-websocket-protocol']!)
   } */
  public static StreamCam(ws: WebSocketClient, request: IncomingMessage) {// nuova versione 31 maggio 2021
    let getRoute: string[] | undefined = request.url?.split('/')
    let protocol = request.headers['sec-websocket-protocol']
    if (getRoute?.length && protocol?.length) {
      let idCam = getRoute[2]
      NvrWsController.InitClient(ws, protocol, 'stream', idCam)
      Nvr.streamCam(idCam, ws, protocol)
    }

  }

  public static async SetCamOption(rawdata: any) {
    let { tagcam, option, data, checkonly } = JSON.parse(rawdata).payload
    if (tagcam !== undefined && option !== undefined && data !== undefined) {
      if (checkonly === undefined)
        checkonly = false
      let checkOption = await Nvr.setCamOption(tagcam, option, data, checkonly)
      return JSON.stringify({ type: `${this.camEvent.CamSetOption}`, payload: checkOption })
    } else {
      return JSON.stringify({ type: `${this.camEvent.CamSetOption}`, payload: 'error' })
    }

  }

  static async managerAlarms(rawdata: any) {
    try {
      let { tagcam, typeOption, dataFilter, idAlarm } = JSON.parse(rawdata).payload
      let checkAlarm = await Nvr.managerAlarms(typeOption, tagcam, dataFilter, idAlarm)
      return JSON.stringify({ type: `${this.camEvent.ManagerAlarms}`, payload: checkAlarm })
    } catch (error) {
      return JSON.stringify({ type: `${this.camEvent.ManagerAlarms}`, payload: 'error' })
    }


  }

}

export default CamWsController