import { spawn } from "child_process";
import { PtzMoveParams, Snapshot } from "node-onvif-ts";
import { WebSocketClient } from "ws";
import { helpers } from "../lib/helper";
import { NoLogger } from "../lib/no-logger";
import { iradarCam, IstreamFFMPEGCam, ISubscription, loginResponse, optNameNvr, returnData, typeWS } from "./interface";
import { alarmMethod, cams, nameCamOption } from "./nvr_cams";
import { nvrUsers } from "./nvr_users";
import { ffmpegOpt } from "./nvr_video";



class Nvr {

  logger: NoLogger;
  _blockPublicAllConnection = false;
  private _Cams = new cams();
  private _ffmpegList = new Array<IstreamFFMPEGCam>();
  private _Users = new nvrUsers();

  constructor() {
    this.logger = new NoLogger("nvr", true);
    this.logger.log("Start log for Nvr");
  }

  async startNvr() {
    try {
      await this._Cams.StartCams(this._Users.SendAlamrs)
      //TODO start nvr sistem (check system space )
      return true;
    } catch (error) {
      this.logger.err("error startNvr");
      return false;
    }
  }

  setOptions(typeOption: optNameNvr, data: any, checkOnly = false) {
    try {
      if (typeOption === 'ipblock') {
        if (checkOnly !== true) {
          this._blockPublicAllConnection = !this._blockPublicAllConnection
        }
        return this._blockPublicAllConnection
      }
    } catch (error) {
      return false
    }

  }

  ipIsOk(ipclient: string): boolean {
    if (this._blockPublicAllConnection === true) {
      return helpers.IsIpPrivate(ipclient)
    } else {
      return true
    }
  }


  listcam() {
    let chek = this._Cams.list();
    return chek;
  }

  async moveCam(
    idcam: string,
    PtzMoveParams: PtzMoveParams,
    timeoutCustom?: number
  ) {
    let _response: returnData<boolean> = { msg: '', inError: false }
    try {
      _response.dataResult = await this._Cams.move(idcam, PtzMoveParams, timeoutCustom);
      return _response
    } catch (e) {
      _response.inError = true
      _response.msg = (e as Error).message
    }
  }

  async screenshot(idCam: string) {
    let _response: returnData<Buffer> = { msg: '', inError: false }
    try {
      let respSnap: Snapshot = await this._Cams.screenshot(idCam);
      _response.dataResult = respSnap.body
      return _response
    } catch (e) {
      _response.inError = true
      _response.msg = (e as Error).message
      return _response
    }
  }


  stopCam(idCam: string) {
    let _response: returnData<boolean> = { msg: '', inError: false }
    try {
      _response.dataResult = this._Cams.stopCam(idCam);
      return _response
    } catch (e) {
      _response.inError = true
      _response.msg = (e as Error).message
      return _response
    }
  }


  async presetCam(
    idcam: string,
    presetN: string,
    speed?: { x: number; y: number; z: number }
  ) {
    let _response: returnData<boolean> = { msg: '', inError: false }
    try {
      _response.dataResult = await this._Cams.presetCam(idcam, presetN, speed);
      return _response
    } catch (e) {
      _response.inError = true
      _response.msg = (e as Error).message
      return _response
    }
  }

  async presetCamSave(idcam: string, presetN: string) {
    let _response: returnData<boolean> = { msg: '', inError: false }
    try {
      _response.dataResult = await this._Cams.savePreset(idcam, presetN);
      return _response
    } catch (e) {
      _response.inError = true
      _response.msg = (e as Error).message
      return _response
    }
  }


  async loginUser(username: string, pass: string, ip: string): Promise<loginResponse> {
    if (this.ipIsOk(ip)) {
      return this._Users.login(username, pass, ip);
    }
    return { success: false, token: '', error: 'you cannot log in you are out to lan' }

  }

  verifyUser(authToken: string) {
    return this._Users.verifyUserToken(authToken);
  }

  setUserWS(ws: WebSocketClient, protocol: string, type: typeWS, tagid = "") {
    return this._Users.setWS(ws, protocol, type, tagid);
  }

  logoutUser(token: string) {
    return this._Users.logout(token);
  }

  listUsers() {
    return this._Users.list;
  }


  streamCam(idCam: string, ws: WebSocketClient, token: string) {
    let url_cam: string = this._Cams.urlRTSPStream(idCam);
    let _ffmpegExist = this._ffmpegList.find(
      (ffmpeg) => ffmpeg.urlstream == url_cam
    );
    if (_ffmpegExist == null || _ffmpegExist.spawnProcess.killed == true) {
      let ffmpegNew = this.Createffmpeg(url_cam, idCam);
      this._ffmpegList.push({
        pid: ffmpegNew.pid,
        urlstream: url_cam,
        spawnProcess: ffmpegNew,
      });
    }

  }

  private Createffmpeg(url_cam: string, idCam: string) {
    let ffmpegNew = spawn("ffmpeg", ffmpegOpt(url_cam));
    ffmpegNew.stdout.on("data", (chunk: any) => {
      if (this._Users.sendVideo(idCam, chunk)) {
        this.ffmpeg_kill(idCam);
      }
    });

    // ( stderr buffer exceeds 24kb you must be reading)
    //https://stackoverflow.com/questions/20792427/why-is-my-node-child-process-that-i-created-via-spawn-hanging
    ffmpegNew.stderr.on("data", function (data) { });
    ffmpegNew.stdout.on("close", (code: number, signal: string) => {
      this.logger.log(
        `ffmpegNew onclose pid:${ffmpegNew.pid} close:${code} signal:${signal}`
      );
    });
    ffmpegNew.on("exit", (code) => {
      this.logger.log(`ffmpegNew onexit pid:${ffmpegNew.pid} code:${code}`);
    });
    return ffmpegNew;
  }


  private ffmpeg_kill(idCam: string) {
    let url_cam: string = this._Cams.urlRTSPStream(idCam);
    let ffmpeg = this._ffmpegList.find((ffmpeg) => ffmpeg.urlstream == url_cam);
    ffmpeg?.spawnProcess.kill();
    this._ffmpegList = this._ffmpegList.filter((ffmpeg) => {
      return ffmpeg.urlstream !== url_cam;
    });
    this.logger.log(
      `ffmpeg_kill ~ this._ffmpegList.length: ${this._ffmpegList.length}`
    );
  }


  async NotifySubscriptionUser(token: string, typeSubscription: any, subscription_client: ISubscription) {
    //verificare prima se lo user ha già registrato il suo browser
    try {
      return await this._Users.managerPush(token, typeSubscription, subscription_client)
    } catch (error) {
      this.logger.err("nvr subscriptionUser error:", error);
      return false;
    }
  }


  async setCamOption(idCam: string, NameOption: nameCamOption, data: any, checkOnly = false) {
    let _response: returnData<boolean> = { msg: '', inError: false }
    _response.dataResult = await this._Cams.setCamOption<boolean>(idCam, NameOption, data, checkOnly);
    return _response
  }



  async managerAlarms(nameOptions: alarmMethod, idCam: string = '', dataFilter: string, idAlarm: string) {
    return await this._Cams.managerAlarm(nameOptions, idCam, dataFilter, idAlarm)
  }


  async RadarCams(): Promise<returnData<iradarCam[]>> {
    let _response: returnData<iradarCam[]> = { msg: '', inError: false }
    try {
      /*  if (!this._blockPublicAllConnection) { // TODO: rem for debug 
         // throw new Error('First block public access')
         _response.inError = true
         _response.msg = 'Block access public ip'
         return _response
       } */
      _response.dataResult = await this._Cams.RadarCams()
      console.log('🚀 ~ file: nvr.ts ~ line 249 ~ Nvr ~ RadarCams ~ _response:', _response)
      return _response
    } catch (error) {
      _response.inError = true
      _response.msg = error.message
      return _response
    }
  }

  async saveRadarCam(radarCam?: iradarCam): Promise<returnData<boolean>> {
    let _response: returnData<boolean> = { msg: '', inError: false }
    try {
      _response.dataResult = await this._Cams.saveCam(radarCam, true)
      if (!_response.dataResult) {
        _response.inError = true
        _response.msg = 'error save probe cam'
      }
      return _response
    } catch (error) {
      _response.inError = true
      _response.msg = error.message
      return _response
    }
  }

  async updateUser(
    username: string,
    password: string,
    newUsername: string,
    newPassword: string
  ) {
    let _response: returnData<boolean> = { msg: '', inError: false }
    try {
      _response.dataResult = await this._Users.update(username, password, newUsername, newPassword);
      if (!_response.dataResult) {
        _response.inError = true
        _response.msg = 'User update error!!!'
        this.logger.log(`updateUser error username: ${username} newUsername: ${newUsername}`)
      } else {
        _response.msg = 'User update successfully'
        this.logger.log(`updateUser successfully username: ${username} newUsername: ${newUsername}`)
      }
      return _response

    } catch (error) {
      _response.inError = true
      _response.msg = 'User update catch error!!!'
      this.logger.log(`updateUser catch error username: ${username} newUsername: ${newUsername}`)
    }

  }



}

const _Nvr = new Nvr();
export default _Nvr;
