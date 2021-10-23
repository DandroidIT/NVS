
import fs from 'fs';
import Jimp from 'jimp';
import { GotoPresetParams, Information, OnvifDevice, Profile, PtzMoveParams, SetPresetParams, Snapshot } from 'node-onvif-ts';
import configBase, { model_logallarms } from "../config";
import { helpers } from '../lib/helper';
import { NoLogger } from '../lib/no-logger';
import { elaborateVideo } from './nvr_video';



class nvr_cam {
  _elaborateVideo: elaborateVideo
  public id = ''
  public urn: string
  camRX: OnvifDevice
  ip: string = ''
  username: string = ''
  password: string = ''
  urlRTSPstream = ''
  private inMove = false
  private _durationVideos: string
  private _recordingH24: boolean = false
  public get recordingH24(): boolean {
    return this._recordingH24
  }
  public set recordingH24(value: boolean) {
    this._recordingH24 = value
  }
  private _delayForPtzN: boolean
  private _liveMotion: boolean = false
  public get liveMotion(): boolean {
    return this._liveMotion
  }
  public set liveMotion(value: boolean) {
    this._liveMotion = value
  }
  public information!: Information
  public nameCam: string = ''
  public asPtz: boolean = false
  public inError: boolean = true

  logger: NoLogger
  _profiles = []
  _emitAlarm: (msg: string) => void
  constructor(id: string, urn: string, namecam: string, ip: string, username: string, password: string, durationVideo: string, cbAlarm: (msg: string) => void) {
    this.id = id
    this.urn = urn
    this.nameCam = namecam
    this.ip = ip
    this.username = username
    this.password = password
    this._durationVideos = durationVideo
    this._emitAlarm = cbAlarm
    this.logger = new NoLogger(`cam_${this.id}`, true)//, true)
    this.logger.log(`Start log for cam ${this.nameCam}`)

    this._elaborateVideo = new elaborateVideo()
    this.camRX = new OnvifDevice({ xaddr: this.ip, user: this.username, pass: this.password })
  }


  async InitCam(recordH24: boolean, motionsAlert: boolean) {
    try {
      this.information = await this.camRX.init()

      let check = this.information === undefined ? false : true
      if (check !== undefined) {
        this.asPtz = this.camRX.services.ptz ? true : false
        this._recordingH24 = recordH24
        this._liveMotion = motionsAlert
        this.recordingContinuos()
        this.inError = false
        return true
      } else {
        return false
      }
    } catch (error: any) {
      this.logger.err(`Cam -> InitCam -> ${this.nameCam} error: ${error.message}`)
      this.logger.w(`Cam -> InitCam -> ${this.nameCam} error: ${error.message}`)
      this.inError = true
      return false

    }



  }

  getInformationArray(): [string, any][] {
    let newMap: Map<string, any> = new Map()
    if (!this.inError) {
      newMap = new Map(Object.entries(this.information))
    }
    return Array.from(newMap)
  }

  private _pathElaborate(path: string, forMotion?: boolean): string {
    let _urlElaborate = `${path}/${configBase.folderForCams.storeCams}/${this.id}/${helpers.date.dateString().split(' ')[0]}`
    if (forMotion) {
      _urlElaborate = `${_urlElaborate}/${configBase.folderForCams.motion}/`
    } else {
      _urlElaborate = `${_urlElaborate}/${configBase.folderForCams.video}/`
    }
    fs.mkdirSync(_urlElaborate, { recursive: true })
    return _urlElaborate
  }

  async recordingContinuos() {
    if (!this._recordingH24)
      return
    let url = this.getRTSPstream()
    let res = await this._elaborateVideo.startVideoRecording(url, this._pathElaborate('./'), this._durationVideos)
    if (res)
      this.recordingContinuos()

  }


  private _getProfile(): Profile {
    let prof: Profile = this.camRX.getCurrentProfile()
    return prof
  }

  getRTSPstream() {
    if (this.urlRTSPstream.length) {
      return this.urlRTSPstream
    }
    try {
      let url = new URL(this._getProfile().stream.rtsp)
      this.urlRTSPstream = `${url.protocol}//${this.username}:${this.password}@${url.hostname}:${url.port}${url.pathname}${url.search}`
      return this.urlRTSPstream
    } catch (error) {
      return ''
    }


  }

  async getListAlarm(limit = 0, { dataFilter = '' } = {}) {
    let listAllarm: model_logallarms[]
    if (dataFilter.length) {
      let where = `idcam=${this.id} and date(stamptime) between '${dataFilter.split('T')[0]}' and '${dataFilter.split('T')[0]}' order by id desc`
      listAllarm = await configBase.db.logAlarms_setQuery(where)
    } else {
      listAllarm = await configBase.db.tabLogAllarms.find({ idcam: this.id }, { order: ['id', 'desc'] })

    }

    if (limit !== 0) {
      listAllarm.length = limit
    }

    return listAllarm
  }
  async getDettAlarm(id: string, imgBase64 = true) {
    try {
      if (!id)
        return

      let alarm = await configBase.db.tabLogAllarms.findOne({ id: Number(id) })
      if (alarm) {
        if (imgBase64) {
          let arrPathImg = alarm.datarif.split('|')
          let BaseString = await helpers.imageToBase64(arrPathImg[0]) + '|' + await helpers.imageToBase64(arrPathImg[1])
          alarm.datarif = BaseString
        }

      }
      return alarm

    } catch (error) {
      this.logger.err('getDettAlarm:', error)
      return undefined
    }

  }


  async liveMotionV2() {

    if (!this._liveMotion) { return }
    while (this._liveMotion) {
      const checkmotion = await this.checkMotionDetected()
      if (checkmotion.inError) {
        this.logger.log(`liveMotionV2 error after checkMotionDetected() checkmotion.inError: ${checkmotion.inError}`)
        this.logger.w(`liveMotionV2 error after checkMotionDetected() checkmotion.inError: ${checkmotion.inError}`)
      } else {
        //this.logger.log('liveMotionV2 checkMotionDetected ok checkmotion: ', checkmotion)
      }
    }
  }

  async checkMotionDetected(): Promise<{ inError: boolean, endcheck: boolean }> {
    try {
      let arr: Buffer[] = []
      let arrSnap1 = await this.getScreenshotN()
      let arrSnap2 = await this.getScreenshotN()
      if (arrSnap1 && arrSnap2) {
        arr.push(arrSnap1.body)
        arr.push(arrSnap2.body)
        if (this.inMove) { return { inError: false, endcheck: true } }
        let isMotion = await this._diffRilevateV1(arr)
        if (isMotion.inAlarm && !this.inMove) {
          let alarm = await configBase.db.tabLogAllarms.create({ idcam: this.id, datarif: isMotion.arrImg.join('|'), stamptime: helpers.date.dateISOLocate(), msg: 'ALLARME liveMotionV1' })
          this.logger.log(`${helpers.date.dateString()} ALLARM CAM ${this.nameCam} idalarm:${alarm?.id}`)
          this.logger.w(`${helpers.date.dateString()} ALLARM CAM ${this.nameCam} idalarm:${alarm?.id}`)
          this._emitAlarm(`${helpers.date.dateString()} ALLARM CAM ${this.nameCam} idalarm:${alarm?.id} link: <a href='/#/${this.id}/${alarm?.id}'>link</a>`)
        }
        return { inError: false, endcheck: true }
      } else {
        this.logger.log(`checkMotionDetected ~ arrSnap1 && arrSnap2 ERROR UNDEFINED CAM ${this.nameCam}`)
        this.logger.w(`checkMotionDetected ~ arrSnap1 && arrSnap2 ERROR UNDEFINED CAM ${this.nameCam}`)
        return { inError: true, endcheck: false }
      }
    } catch (error) {
      this.logger.err(`checkMotionDetected error ${error} - CAM ${this.nameCam}`)
      this.logger.w(`checkMotionDetected error ${error} - CAM ${this.nameCam}`)
      return { inError: true, endcheck: false }
    }
  }

  private async _diffRilevateV1(arrB: Buffer[]): Promise<{ inAlarm: boolean, arrImg: Array<string> }> {
    try {
      let img1 = await Jimp.read(arrB[0])
      let img2 = await Jimp.read(arrB[1])
      let distance = Jimp.distance(img1, img2); // perceived distance
      let different = Jimp.diff(img1, img2, 0.2);
      if (this.inMove) { return { inAlarm: false, arrImg: [] } }
      if (different.percent > 0.02 || distance > 0.02) {
        let img1Name = this._pathElaborate('.', true) + `/motion1_${helpers.date.dateFULLString()}.jpg`
        let img2Name = this._pathElaborate('.', true) + `/motion2_${helpers.date.dateFULLString()}.jpg`
        img1.resize(800, Jimp.AUTO).write(img1Name)
        img2.resize(800, Jimp.AUTO).write(img2Name)
        return { inAlarm: true, arrImg: [img1Name, img2Name] }
      } else {
        return { inAlarm: false, arrImg: [] }
      }
    } catch (error) {
      return { inAlarm: false, arrImg: [] }
    }

  }

  async getScreenshotN(): Promise<Snapshot | undefined> {
    try {
      let foto = await this.camRX.fetchSnapshot()
      return foto
    } catch (error) {
      return undefined
    }
  }
  ptzStopN() {
    if (this.asPtz === false)
      return
    return this._stopCam()
  }

  async _stopCam(timeoutCustom?: number): Promise<boolean> {
    const timeout = timeoutCustom === undefined ? 500 : timeoutCustom
    await helpers.delay(timeout)
    await this.camRX.ptzStop()
    return true
  }
  async ptzN(xyz: PtzMoveParams, timeoutCustom?: number): Promise<boolean> {
    return new Promise(async (res, rej) => {
      if (this.asPtz === false) { rej(false) }
      const timeout = timeoutCustom === undefined ? 500 : timeoutCustom
      try {
        this._delayForPtzN = this.inMove
        this.inMove = true
        xyz.timeout = timeout
        await this.camRX.ptzMove(xyz)
        await this._stopCam(timeout)
        helpers.delay(3000).then(() => {
          if (!this._delayForPtzN) { this.inMove = false }
          this._delayForPtzN = false
          res(true)
        })
      } catch (error: any) {
        this.logger.err(`Cam -> ptz -> error ${this.ip} message ${error.message}`)
        this.inMove = false
        rej(false)
      }


    })
  }

  async gotoPresetN(presetN: string, speed?: { x: number, y: number, z: number }) {
    if (this.asPtz === false) { return false }
    try {
      this.inMove = true
      const preset: GotoPresetParams = {
        ProfileToken: this._getProfile().token,
        PresetToken: presetN,
        Speed: speed!
      }
      const check = await this.camRX.services.ptz?.gotoPreset(preset)
      helpers.delay(8000).then(() => this.inMove = false)
      return check === undefined ? false : true
    } catch (error) {
      this.logger.err('gotoPresetN ~ error', error)
      this.inMove = false
      return false
    }
  }


  async savePresetN(presetN: string) {
    if (this.asPtz === false) { return false }
    try {
      let setpre: SetPresetParams = { ProfileToken: this._getProfile().token, PresetName: presetN }
      let check = await this.camRX.services.ptz?.setPreset(setpre)
      return check === undefined ? false : true
    } catch (error) {
      this.logger.log('cam.ts ~ line 142 ~ Cam ~ savePreset ~ error', error)
      return false
    }
  }

}

export { nvr_cam };

