import { Probe, PtzMoveParams, Snapshot, startProbe } from "node-onvif-ts";
import configBase, { model_logallarms } from "../config";
import { helpers } from '../lib/helper';
import { NoLogger } from "../lib/no-logger";
import { iradarCam, iDayAndAlarmCount, iAlarm } from './interface';
import { nvr_cam } from "./nvr_cam";


type alarmMethod = 'getAlarmCam' | 'getAlarmCamList' | 'getDayAndAlarmList' | 'getDayAndAlarmCount';



type nameCamOption = 'live24' | 'livemotion' | 'delete' | 'altro'



class cams {

  private logger: NoLogger
  private _listCam: Array<nvr_cam> = [];

  private _sendAlamsUser: (msg: string) => void
  constructor() {
    this.logger = new NoLogger('nvr_Cams', true)//, true)
    this.logger.log('Start log for Cams')
  }

  public list() {
    return this._listCam.sort(((a: nvr_cam, b: nvr_cam) => {
      return a.inError === true ? 1 : -1
    }))
  }
  public getCam(idCam: string) {
    return this._listCam.find(c => c.id == idCam)
  }
  public async StartCams(cbAlarm: (msg: string) => {}) {
    this._sendAlamsUser = cbAlarm
    return this.loadCams()
  }
  public async loadCams(reload?: boolean) {
    if (reload || this._listCam.length === 0) {
      await this._loadDbCams()
    }

    await Promise.all(configBase.listCam.map(async (configCam) => {
      let cam = new nvr_cam(configCam.id!.toString(),
        configCam.urn.toString(),
        configCam.name.toString(),
        configCam.xaddr.toString(),
        configCam.username.toString(),
        configCam.password.toString(),
        configBase.splitVideoSecond,
        this._sendAlamsUser
      );
      this._listCam.push(cam);
      const checkcam = await cam.InitCam(false, false)
      this.logger.log(`Cams -> loadCams -> AFETR INIT: ${checkcam} -- ${configCam.id} - ${configCam.name} ${configCam.xaddr}`);
      this.logger.w(`Cams -> loadCams -> AFETR INIT: ${checkcam} -- ${configCam.id} - ${configCam.name} ${configCam.xaddr}`);

    }))
  }
  private async _loadDbCams() {
    this._listCam = []
    await configBase.loadConfig();
  }

  public urlRTSPStream(idCam: string) {
    let cam = this.getCam(idCam)
    return cam ? `${cam.getRTSPstream()}` : ''
  }

  async move(idCam: string, PtzMoveParams: PtzMoveParams, timeoutCustom?: number) {
    let cam = this.getCam(idCam)
    if (cam) {
      let resultMove = await cam.ptzN(PtzMoveParams, timeoutCustom)
      return resultMove
    } else {
      return false
    }
  }

  async screenshot(idCam: string) {
    let cam = this.getCam(idCam)
    let photo: Snapshot = { headers: {}, body: Buffer.alloc(0) }
    if (cam) {
      let photoCam = await cam.getScreenshotN()
      if (photoCam) {
        photo = photoCam
      }
    }
    return photo
  }

  stopCam(idCam: string) {
    let cam = this.getCam(idCam)
    if (cam) {
      cam.ptzStopN()
      return true
    } else {
      return false
    }
  }

  async presetCam(idCam: string, presetN: string, speed?: { x: number, y: number, z: number }) {
    let ret = false
    let cam = this.getCam(idCam)
    if (cam) {
      ret = await cam.gotoPresetN(presetN, speed)
    }
    return ret
  }

  async savePreset(idCam: string, PresetN: any) {
    let ret = false
    let cam = this.getCam(idCam)
    if (cam) {
      ret = await cam.savePresetN(PresetN)
    }
    return ret
  }


  async setCamOption<T>(idCam: string, NameOption: nameCamOption, data: T, checkOnly = false) {
    try {
      let cam = this.getCam(idCam)
      if (!cam) return false
      if (NameOption === 'live24' && typeof data === 'boolean') {
        if (checkOnly)
          return cam.recordingH24
        if (cam.recordingH24 === data)
          return
        cam.recordingH24 = data
        if (cam.recordingH24)
          cam.recordingContinuos()
      } else if (NameOption === 'livemotion' && typeof data === 'boolean') {
        if (checkOnly)
          return cam.liveMotion
        if (cam.liveMotion === data)
          return
        cam.liveMotion = data
        if (cam.liveMotion)
          cam.liveMotionV2()
      } else if (NameOption === 'delete') {
        let check = await this.deleteCam(idCam)
        return check
      }
      return data
    } catch (error) {
      this.logger.log('file: nvr_cams.ts ~ setCamOption ~ error', error)
      return false
    }
  }


  /*  async managerAlarmV1(typeMethod: alarmMethod, idCam: string = ''): Promise<[iDayAndAlarmCount]> {
     try {
       let where = "";
       let param: Array<string> = [];
       if (idCam?.length) {
         where = `idcam=?`;
         param.push(idCam);
       }
       switch (typeMethod) {
         case 'getDayAndAlarmCount':
           let listDayAndAlarmCount = await configBase.db.logAlarms_test<[iDayAndAlarmCount]>(where, param, "date(stamptime)", ["stamptime"], "*");
           return listDayAndAlarmCount
           break;
         case 'getDayAndAlarmList':
           break;
         default:
           break;
       }
 
 
     } catch (error) {
 
     }
   } */

  async alarmsCalendarCount(idCam = '', filterDate: { start: string, end: string }): Promise<iDayAndAlarmCount[]> {
    try {
      let select = '', where = '', count = '', params: Array<string> = [], columns: Array<string> = []
      if (idCam?.length) {
        where = `idcam=? and`;
        params.push(idCam);
      }
      if (filterDate.start.length) {
        if (filterDate.end.length === 0)
          filterDate.end = filterDate.start
        select = 'distinct(date(stamptime)) as stamptime , count(*) count'
      } else { // limit one month
        const todayDate = new Date()
        const today = todayDate.toISOString().split('T')[0].split('-')
        const lastDayMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate()
        filterDate.start = `${today[0]}-${today[1]}-01`
        filterDate.end = `${today[0]}-${today[1]}-${lastDayMonth}`
        count = '*'
        columns.push("stamptime")
      }
      where = `${where} date(stamptime) between '${filterDate.start}' and '${filterDate.end}'`;
      let _alarmCalendarCount = await configBase.db.logAlarms_test
        <iDayAndAlarmCount[]>(where, params, "date(stamptime)", columns, count, select);
      return _alarmCalendarCount
    } catch (error) {
      return [{ stamptime: '', count: '0' }]
    }
  }

  async alarmsCalendarDet(idCam = '', filterDate: { start: '', end: '' }) {
    try {
      let where = '', params: Array<string> = [];
      if (idCam?.length) {
        where = `idcam=? and`;
        params.push(idCam);
      }
      if (filterDate.end.length === 0)
        filterDate.end = filterDate.start
      where = `${where} date(stamptime) between '${filterDate.start}' and '${filterDate.end}' order by id desc`;
      let listDayAndAlarmList = await configBase.db.logAlarms_test<model_logallarms[]>(where, params, '')
      const retAlarms: iAlarm[] = []
      listDayAndAlarmList.map((alarm) => {
        retAlarms.push({ id: Number(alarm.id), idcam: `${alarm.idcam}`, namecam: this.getCam(alarm.idcam.toString()).nameCam, stamptime: `${alarm.stamptime}`, datarif: `${alarm.datarif}` })
      })
      return retAlarms
    } catch (error) {
      return undefined
    }
  }

  async alarmDett(idAlarm: string): Promise<iAlarm> {
    try {
      let ad: iAlarm
      const alarmsDet = await configBase.db.logAlarms_test<iAlarm[]>('id = ?', [idAlarm], '')
      if (alarmsDet.length === 1) {
        ad = alarmsDet[0]
        let arrPathImg = ad.datarif.split('|')
        let BaseString = await helpers.imageToBase64(arrPathImg[0]) + '|' + await helpers.imageToBase64(arrPathImg[1])
        ad.datarif = BaseString
        ad.namecam = this.getCam(ad.idcam).nameCam
      }
      return ad
    } catch (error) {
      console.log('alarmDett error', error)
      return undefined
    }
  }

  /* async managerAlarm(typeMethod: alarmMethod, idCam: string, dataFilter: string, idAlarm: string) {
    console.log('🚀 ~ file: nvr_cams.ts ~ cams ~ managerAlarm ~ typeMethod', typeMethod, idCam)
    try {
      let where = "";
      if (typeMethod == 'getDayAndAlarmCount') {
        let param: Array<string> = [];
        if (idCam?.length) {
          where = `idcam=?`;
          param.push(idCam);
        }
        let listDayAndAlarmCount = await configBase.db.logAlarms_test<[{ stamptime: string; count: string }]>(where, param, "date(stamptime)", ["stamptime"], "*");
        return listDayAndAlarmCount
      } else if (typeMethod == 'getDayAndAlarmList') {
        where = `date(stamptime) between '${dataFilter.split("T")[0]}' and '${dataFilter.split("T")[0]
          }' order by id desc`;
        let listDayAndAlarmList = await configBase.db.logAlarms_test<model_logallarms[]>(where, [], '')
        this.logger.log('~ file: nvr_cams.ts ~ cams ~ managerAlarm ~ listDayAndAlarmList', listDayAndAlarmList)
        return listDayAndAlarmList
      } else if (typeMethod === 'getAlarmCamList') {
        let cam = this.getCam(idCam)
        if (cam) {
          //let alarm = await cam.getDettAlarm(idAlarm);
          let listAlarmCamList = await cam.getListAlarm(undefined, { dataFilter });
          this.logger.log('🚀 ~ file: nvr_cams.ts ~ cams ~ managerAlarm ~ listAlarm', listAlarmCamList)
          return listAlarmCamList
        }

      } else if (typeMethod === 'getAlarmCam') {
        let cam = this.getCam(idCam)
        if (cam) {
          let Alarm = await cam.getDettAlarm(idAlarm);
          this.logger.log('🚀 ~ file: nvr_cams.ts ~ cams ~ managerAlarm ~ Alarm', Alarm)
          return Alarm
        }

      }

    } catch (error) {
      this.logger.err('🚀 ~ file: nvr_cams.ts ~ line 164 ~ cams ~ error', error)

    }

  } */

  async RadarCams(): Promise<iradarCam[]> {
    let _RadarCams: Array<iradarCam> = []
    let RadarResult = await startProbe();
    RadarResult.map((prob: Probe) => {
      let cam = this._listCam.find(cam => cam.urn === prob.urn)
      _RadarCams.push({ urn: prob.urn, name: cam === undefined ? prob.name : cam.nameCam, xaddrs: prob.xaddrs, username: '', password: '', exist: cam === undefined ? false : true })
    })
    return _RadarCams;
  }

  /** Update or Create cam and reload cams*/

  async saveCam(radarCam: iradarCam, onlyNew?: boolean) {
    try {
      if (onlyNew) {
        let result = await configBase.db.tabCams.findOne({ xaddr: radarCam.xaddrs.toString() })
        if (result) {
          return false
        }
      }
      let resultSaveCams = await configBase.db.tabCams.updateOrCreate(
        {
          urn: radarCam.urn.toString(),
          name: radarCam.name.toString(),
          xaddr: radarCam.xaddrs.toString(),
          username: radarCam.username.toString(),
          password: radarCam.password.toString(),
        },
        {
          urn: radarCam.urn.toString(),
          name: radarCam.name.toString(),
          xaddr: radarCam.xaddrs.toString(),
          username: radarCam.username.toString(),
          password: radarCam.password.toString(),
        }
      );

      if (resultSaveCams.length) {
        await this.loadCams(true);
        return true
      }
      return false

    } catch (error) {
      console.log("savecam error: ", error);
      return false
    }
  }

  async deleteCam(id: string) {
    try {
      let check = await configBase.db.tabCams.remove({ id: Number(id) })
      if (check.length) {
        await this.loadCams(true);
        return true
      } else {
        return false
      }
    } catch (error) {
      console.log("deleteCam error: ", error);
      return false;
    }
  }

}

export { cams, nameCamOption, alarmMethod };
