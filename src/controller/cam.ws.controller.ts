import { IncomingMessage } from "http";
import { WebSocketClient } from "ws";
import { ICamApi, returnData } from '../class/interface'
import Nvr from '../class/nvr'
import { NoLogger } from '../lib/no-logger'
import NvrWsController from "./nvr.ws.controller";


const logger = new NoLogger('CamWSController')
enum CamEventName {
  CamControll = 'camcontroll',
  CamList = 'camlist',
  CamSetOption = 'setcamoption',
  TEST = 'test',
  ManagerAlarms = "manageralarms",
  AlarmsCount = "alarmscount",
  AlarmsDet = "alarmsdet",
  AlarmDet = "alarmdet",

  CamScreenshot = 'camscreenshot'
}

class CamWsController {
  public static camEvent = CamEventName

  public static async move(data: any): Promise<string> {
    try {
      let { cmd, tagcam, speed, timeout, preset } = JSON.parse(data).payload
      let checkCommand: returnData<boolean>
      if (cmd === 'move_stop') {
        checkCommand = Nvr.stopCam(tagcam)
      } else if (cmd === 'move') {
        checkCommand = await Nvr.moveCam(tagcam, { speed }, timeout)
      } else if (cmd === 'preset') {
        checkCommand = await Nvr.presetCam(tagcam, preset, speed)
      } else if (cmd === 'save_preset') {
        checkCommand = await Nvr.presetCamSave(tagcam, preset)
      } else {
        return JSON.stringify({ type: cmd, payload: checkCommand })
      }
      return JSON.stringify({ type: `${this.camEvent.CamControll}`, payload: checkCommand })
    } catch (error: any) {
      logger.err('CamWsController ~ move ~ error', error)
      return error
    }

  }

  public static async screenshot(data: any): Promise<string> {
    let { tagcam } = JSON.parse(data).payload
    let respScreenshot = await Nvr.screenshot(tagcam)
    return JSON.stringify({ type: `${this.camEvent.CamScreenshot}`, payload: respScreenshot })
  }

  public static async list() {
    let cams: ICamApi[] = []
    Nvr.listcam().map(async cam => {
      cams.push({
        id: cam.id, information: cam.getInformationArray(),
        name: cam.nameCam, asPTZ: cam.asPtz, inerror: cam.inError,
        liveH24: cam.recordingH24, motion: cam.liveMotion //, arrAllarm:str
      })
    })
    cams = cams.sort((camA, camB) => camA.id > camB.id ? 1 : -1)
    const respData: returnData<ICamApi[]> = { inError: false, msg: '', dataResult: cams }
    return JSON.stringify({ type: 'camlist', payload: respData })
  }



  public static StreamCam(ws: WebSocketClient, request: IncomingMessage) {
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

  static async getAlarmsCount(rawdata: any) {
    try {
      const { tagcam, dataFilter } = JSON.parse(rawdata).payload
      const checkAlarmCount = await Nvr.getAlarmsCalendarCount(tagcam, dataFilter)
      return JSON.stringify({ type: `${this.camEvent.AlarmsCount}`, payload: checkAlarmCount })
    } catch (error) {
      return JSON.stringify({ type: `${this.camEvent.AlarmsCount}`, payload: 'error' })
    }
  }

  static async getAlarmsDet(rawdata: any) {
    try {
      const { tagcam, dataFilter } = JSON.parse(rawdata).payload
      const checkAlamsDet = await Nvr.getAlarmsCalendarDet(tagcam, dataFilter)
      checkAlamsDet.dataResult.map((alarm) => alarm.datarif = '')
      return JSON.stringify({ type: `${this.camEvent.AlarmsDet}`, payload: checkAlamsDet })
    } catch (error) {
      return JSON.stringify({ type: `${this.camEvent.AlarmsDet}`, payload: 'error' })
    }
  }

  static async getAlarmDet(rawdata: any) {
    try {
      const { idalarm } = JSON.parse(rawdata).payload
      const checkAlamsDet = await Nvr.getAlarmDet(idalarm)
      return JSON.stringify({ type: `${this.camEvent.AlarmDet}`, payload: checkAlamsDet })
    } catch (error) {
      return JSON.stringify({ type: `${this.camEvent.AlarmDet}`, payload: 'error' })
    }
  }

  /*   static async managerAlarmsv1(rawdata: any) {
      try {
        let { tagcam, typeMethod, dataFilter, idAlarm } = JSON.parse(rawdata).payload
        let checkAlarm = await Nvr.managerAlarmsV1(typeMethod, tagcam, dataFilter, idAlarm)
        return JSON.stringify({ type: `${this.camEvent.ManagerAlarms}`, payload: checkAlarm })
      } catch (error) {
        return JSON.stringify({ type: `${this.camEvent.ManagerAlarms}`, payload: 'error' })
      }
  
  
    } */
  /*   static async managerAlarms(rawdata: any) {
      try {
        let { tagcam, typeMethod, dataFilter, idAlarm } = JSON.parse(rawdata).payload
        let checkAlarm = await Nvr.managerAlarms(typeMethod, tagcam, dataFilter, idAlarm)
        return JSON.stringify({ type: `${this.camEvent.ManagerAlarms}`, payload: checkAlarm })
      } catch (error) {
        return JSON.stringify({ type: `${this.camEvent.ManagerAlarms}`, payload: 'error' })
      }
    } */

}

export default CamWsController