import { spawn } from "child_process";
import { PtzMoveParams } from "node-onvif-ts";
import { WebSocketClient } from "ws";
import configBase from "../config";
import { helpersNEW } from "../lib/helper";
import { NoLogger } from "../lib/no-logger";
import { iradarCam, IstreamFFMPEGCam, ISubscription, loginResponse, optNameNvr, returnData, typeWS } from "./interface";
import { nvr_cam } from './nvr_cam';
import { alarmMethod, cams, nameCamOption, radarMethod } from "./nvr_cams";
import { users as nvrUsers } from "./nvr_users";
import { ffmpegOpt } from "./nvr_video";



class Nvr {

  logger: NoLogger;
  _blockPublicAllConnection = false;
  private _listCam: Array<nvr_cam> = [];
  private _Cams = new cams();
  private _ffmpegList = new Array<IstreamFFMPEGCam>();
  private _Users = new nvrUsers();
  private _configBase = configBase;


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
      return helpersNEW.IsIpPrivate(ipclient)
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
    return await this._Cams.move(idcam, PtzMoveParams, timeoutCustom);
  }

  async screenshot(idCam: string) {
    return this._Cams.screenshot(idCam);
  }


  stopCam(idCam: string) {
    return this._Cams.stopCam(idCam);
  }


  async presetCam(
    idcam: string,
    presetN: string,
    speed?: { x: number; y: number; z: number }
  ) {
    return await this._Cams.presetCam(idcam, presetN, speed);
  }

  async presetCamSave(idcam: string, presetN: string) {
    return await this._Cams.savePreset(idcam, presetN);
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

  /** nuova implementazione stream cam to websocket client */

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
    let ffmpegNew = spawn("ffmpeg", ffmpegOpt(url_cam)); //-< questo deve avvenire in this._Cams.urlRTSPStream(idCam);
    ffmpegNew.stdout.on("data", (chunk: any) => {
      if (this._Users.sendVideo(idCam, chunk)) {
        this.ffmpeg_kill(idCam);
      }
    });

    // necessario altrimenti si riempe il buffer ( stderr buffer exceeds 24kb you must be reading)
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

  /** fine nuova implementazione stream cam to websocket client */

  /**Nuova gestione PushWeb --- note:versione precedente: NotifySubscriptionUserWeb */
  async NotifySubscriptionUser(token: string, typeSubscription: any, subscription_client: ISubscription) {
    //verificare prima se lo user ha già registrato il suo brouser
    try {
      return await this._Users.managerPush(token, typeSubscription, subscription_client)
    } catch (error) {
      this.logger.err("nvr subscriptionUser error:", error);
      return false;
    }
  }



  /** Fine Nuova gestione PushWeb  */

  /** Nuova Implementazione setCamOption */
  async setCamOption(idCam: string, NameOption: nameCamOption, data: any, checkOnly = false) {
    return await this._Cams.setCamOption(idCam, NameOption, data, checkOnly);
  }

  /** fine Nuova Implementazione setCamOption */


  // Nuova implementazione Getione Alarm
  // #TODO da mettere in managerAlarm in nvr_cams.ts (vedere descrizione in function managerAlarm)

  async managerAlarms(nameOptions: alarmMethod, idCam: string = '', dataFilter: string, idAlarm: string) {
    return await this._Cams.managerAlarm(nameOptions, idCam, dataFilter, idAlarm)
  }

  // Fine Nuova implementazione Getione Alarm



  //#endregion


  /** Nuova Implementazione Setup Radar Cams */
  async managerRadarCams(nameMethod: radarMethod, radarCam?: iradarCam) {

    let responseReturn = { inError: false, msg: '' } as returnData<iradarCam[] | nvr_cam[]>
    try {
      if (!this._blockPublicAllConnection) {
        throw new Error('First block public access')
      }
      responseReturn.dataResult = await this._Cams.managerRadarCams(nameMethod, radarCam)
      responseReturn.inError = false
      this.logger.log('🚀 ~ file: nvr.ts ~ line 325 ~ Nvr ~ managerRadarCams ~ x', responseReturn)
      //return x
      return responseReturn
    } catch (error) {
      responseReturn.inError = true
      responseReturn.msg = error.message
      return responseReturn
    }

  }
  /** Fine Nuova Implementazione Setup Radar Cams */


}

const _Nvr = new Nvr();
export default _Nvr;
