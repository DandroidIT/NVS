import { NoLogger } from "../lib/no-logger";
import WebSocket, { WebSocketClient } from "ws";
import configBase, { model_notify_user } from "../config";
//import { helpers } from "./helpers";
import wpCustom from "./webpush";
import { nanoId, helpersNEW, helpJwt } from '../lib/helper'
import { ISubscription, IUser, typeWS, loginResponse } from './interface'
import { WebPushError, SendResult } from "web-push";

class users {

  private _listUsers: Map<string, IUser> = new Map();
  logger: NoLogger
  constructor() {
    this.logger = new NoLogger('nvr users')
  }
  public get list() {
    return this._listUsers;
  }


  async SendAlamrs(notifica: string) {


    let nottifyUser = await configBase.db.tabNotifyUsers.find();
    nottifyUser.forEach(async (not) => {
      if (not.enabled === false)
        return
      try {
        await wpCustom.push({ endpoint: not?.endpoint.toString()!, keys: { auth: not?.auth.toString()!, p256dh: not?.p256dh.toString()! }, },
          { title: notifica, actions: [{ action: "open_url", title: "Read Now" }] })
        console.log('🚀 ~ file: nvr_users.ts ~ line 87 ~ users ~ nottifyUser.forEach ')

      } catch (error: any) {
        console.log('🚀 ~ file: nvr_users.ts ~ line 99 ~ users ~ nottifyUser.forEach ~ error', error)
        //return
        let webPushError: WebPushError = error
        console.log(`SendAlamrs webPushError ERROR - statusCode: ${webPushError.statusCode} body:${webPushError.body} message:${webPushError.message} endpoint ${webPushError.endpoint}`);
        if (webPushError.statusCode === 410 || webPushError.statusCode === 106) {
          if (webPushError.endpoint) {
            let deletenotify = await configBase.db.tabNotifyUsers.remove({
              endpoint: webPushError.endpoint,
            });
            console.log(`SendAlamrs delete user notify endpoint ${webPushError.endpoint} success: ${deletenotify.length}`);
            this.logger.log(`SendAlamrs delete user notify endpoint ${webPushError.endpoint} success: ${deletenotify.length}`);
          }
        }
      }
    });
  }

  //TODO: firefox pwa vedere implementazione
  // base: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installable_PWAs
  // SubscriptionDisabled: fare controllo in app per disabilitare le notifiche e fare test
  async managerPush(protocol: string, type: 'Subscription' | 'getSubscription' | 'unSubscription' | 'SubscriptionDisabled', clientSubscription: ISubscription) {
    let notifyUsers: model_notify_user[] = []
    let user = this.verifyUserToken(protocol)
    if (!user)
      return false
    if (type === 'Subscription') {
      notifyUsers = await configBase.db.tabNotifyUsers.updateOrCreate(
        {
          auth: clientSubscription.keys.auth.toString(),
          p256dh: clientSubscription.keys.p256dh.toString()
        },
        {
          iduser: Number(user.id),
          expirationTime: '',
          endpoint: clientSubscription.endpoint.toString(),
          auth: clientSubscription.keys.auth.toString(),
          p256dh: clientSubscription.keys.p256dh.toString(),
          insertdata: helpersNEW.date.dateISOLocate(),
          enabled: true
        }
      );
    } else if (type === 'getSubscription') {
      notifyUsers = await configBase.db.tabNotifyUsers.find({
        endpoint: clientSubscription.endpoint,
      })
      if (notifyUsers.length) {
        if (notifyUsers[0].enabled === false)
          notifyUsers = []
      }

    } else if (type === 'unSubscription') {
      notifyUsers = await configBase.db.tabNotifyUsers.remove({
        endpoint: clientSubscription.endpoint,
      })
    } else if (type === 'SubscriptionDisabled') {
      notifyUsers = await configBase.db.tabNotifyUsers.update(
        {
          auth: clientSubscription.keys.auth.toString(),
          p256dh: clientSubscription.keys.p256dh.toString()
        }, { enabled: false }
      )
    }

    if (notifyUsers.length) {
      return true;
    } else {
      return false;
    }
  }

  setWS(ws: WebSocketClient, protocol: string, type: typeWS, tagid: string = ''): boolean {
    let user: IUser = this.verifyUserToken(protocol)
    if (user) {
      this.logger.log(`${user.username}: setWS`)
      user.ws_list?.set(ws.idConnect, { type: type, tagid: tagid, ws: ws })
      if (type === 'api') {
        ws.online = true
        ws.on("close", (code: number, reason: string) => {
          this.logger.log(`NvrWsController InitClient : CLOSE API Client disconnected user.id: ${user?.id} user.idconnect:${user?.idconnect} ws.idConnect:${ws.idConnect} - reason: ${reason} code: ${code}`);
          this.logout(protocol, true)
        })
      } else if (type === 'stream') {
        ws.binaryType = "arraybuffer";
        ws.send(this.streamHeaders(), { binary: true });

        ws.on("error", (err) => {
          this.logger.err(`streamCam_test ws onerror error:${err}`);
          this.removeWS(user?.id!, ws.idConnect);
        });
        ws.on("close", (code: number, reason: string) => {
          this.logger.log(
            `streamCam_test ws onclose reason:${reason} code:${code}`
          );
          this.removeWS(user?.id!, ws.idConnect);
        });
      }
    }
    return true
  }

  removeWS(idUser: string, wsIdConect: string) {
    let user = this.filter(idUser);
    return user?.ws_list.delete(wsIdConect)
  }

  Add(user: IUser, ifexistremove = false) {
    if (ifexistremove) {
      this.remove(user.id);
    }
    this._listUsers.set(user.id, user);
  }

  filter(id: string) {
    return this._listUsers.get(id);
  }

  remove(id: string) {
    return this._listUsers.delete(id);
  }

  async login(username: string, pass: string, ip: string): Promise<loginResponse> {
    let dbUuser = await configBase.db.tabUsers.findOne({
      username: username,
      password: pass,
    });
    if (dbUuser) {
      if (this.filter(dbUuser.id!.toString())) {
        return { success: false, token: '', error: 'user in login' }
      }
      let getData = helpersNEW.date.dateString();
      let token = helpJwt.getToken(
        { id: `${dbUuser.id!}`, create_at: getData },
        configBase.secret,
        { expiresIn: "1d" }
      );
      this.Add({
        id: dbUuser.id!.toString(),
        idconnect: nanoId.getId(),
        ip: ip,
        username: username,
        token: token,
        last_connect: getData,
        ws_list: new Map()
      });
      return { success: true, token: token }
    } else {
      return { success: false, token: '' }
    }

  }


  async update(
    username: string,
    pass: string,
    usernameNew: string,
    passNew: string
  ) {
    let user = await configBase.db.tabUsers.findOne({
      username: username,
      password: pass,
    });
    if (user) {
      let checkUserNew = await configBase.db.tabUsers.update(
        { username: usernameNew },
        { password: passNew }
      );
      return checkUserNew ? true : false;
    }

    return false;
  }

  verifyUserToken(authToken: string) {
    helpJwt.verifyToken(authToken, configBase.secret, { complete: true });
    let u = helpJwt.decodeToken(authToken, { complete: true }) as any;
    return this.filter(u.payload.id);
  }

  sendVideo(idCam: string, chunk: any) {
    let countWsStream = 0;
    Array.from(this._listUsers.values()).forEach((user, indexUser) => {
      user.ws_list.forEach((wsItem, indexWS) => {
        if (wsItem.type === "stream" && wsItem.tagid === idCam) {
          wsItem.ws.send(chunk, { binary: true });
          countWsStream++;
        }
      });
    });
    if (countWsStream === 0) {
      return true
    }
  }

  private streamHeaders() {
    // send magic number e set arraybuffer
    /* streamHeader.writeUInt16BE(1280, 4)
     streamHeader.writeUInt16BE(1024, 6) */
    /*  streamHeader.writeUInt16BE(800, 4)
     streamHeader.writeUInt16BE(600, 6) */
    let streamHeader = Buffer.alloc(8);
    streamHeader.write("jsmp");
    streamHeader.writeUInt16BE(1920, 4);
    streamHeader.writeUInt16BE(1080, 6);
    return streamHeader;
  }

  logout(token: string, checkWS = false) {
    let user = this.verifyUserToken(token)
    if (user) {
      if (checkWS && user.ws_list.size > 1) {
        return false
      }
      if (user.ws_list.size) {
        user.ws_list.forEach(wsUser => {
          wsUser.ws.terminate()
        });
        this._listUsers.delete(user.id)
        return true
      }


    }
    return false
  }
}

export { users }
