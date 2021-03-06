
import path from 'path';
import Cors from '@koa/cors';
import https from "https";
import Koa from 'koa';
import koaStatic from 'koa-static'
import koaMount from 'koa-mount'
import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import helmet from 'koa-helmet';
import koaJwt from 'koa-jwt';
import configBase from "../config";

import { NoLogger } from '../lib/no-logger';
import AuthRouters from '../route/auth.router';
import Nvr from './nvr';
import Nvr_skt from './nvr_websocket';


const logger = new NoLogger('webserver', true)
logger.log('log for webserver')
class serverApi extends Koa {

  _ip: string = ''
  _port: number = 0
  _httpsServer!: https.Server
  _blockPublicAllConnection = false

  constructor() {
    super()
  }


  StartServer() {
    this._ip = configBase.ip
    this._port = configBase.port
    this.baseRouters()
    if (configBase.AppClient.start) {
      this.use(koaMount(configBase.AppClient.route, koaStatic(path.join(__dirname, configBase.AppClient.folder))))
    }
    this.use(this._mwCheckAuth)
    this.use(
      koaJwt({ secret: configBase.secret })
        .unless({ path: [/^\/login/, /^\/logout/,] })
    );

    this.use(AuthRouters.routes())

    this._httpsServer = https.createServer({ key: configBase.https.key, cert: configBase.https.cert }, this.callback())
    Nvr_skt.Start(this._httpsServer)

    this._httpsServer.listen(this._port, this._ip, () => {
      logger.info(`NVS server system listening on ip: https://${this._ip}:${this._port}`);
      logger.w(`NVS server system listening on ip: https://${this._ip}:${this._port}`);
      if (configBase.AppClient.start) {
        logger.info(`Start NVS App listening on ip: https://${this._ip}:${this._port}${configBase.AppClient.route}/`);
        logger.w(`Start NVS App listening on ip: https://${this._ip}:${this._port}${configBase.AppClient.route}/`);
      }


    });
  }

  baseRouters() {
    this.use(compress({
      threshold: 1048,
      gzip: {
        flush: require('zlib').constants.Z_SYNC_FLUSH
      },
      deflate: {
        flush: require('zlib').constants.Z_SYNC_FLUSH,
      },
      br: false // disable brotli
    }))
    this.use(Cors())

    this.use(helmet.contentSecurityPolicy({
      //reportOnly: true,
      directives: {
        defaultSrc: ["'self'", "data:", "'unsafe-inline'"], scriptSrc: ["'self'", "'unsafe-eval'"]
      }
    }))
    this.use(bodyParser())
    this.use(this._logger)
  }

  private async _logger(ctx: Koa.ParameterizedContext, next: () => Promise<any>) {
    let format = ':method ":url"';
    const str = format.replace(':method', ctx.method).replace(':url', ctx.url);
    const time1 = Date.now()
    await next();
    const time2 = Date.now();
    const responseTime = Math.ceil(time2 - time1)
    logger.log(`request | ip: ${ctx.ip} - type: ${ctx.type} protocol: ${ctx.protocol} method url: ${str} status: ${ctx.response.status} responseTime:${responseTime}`);
    logger.w(`request | ip: ${ctx.ip} - type: ${ctx.type} protocol: ${ctx.protocol} method url: ${str} status: ${ctx.response.status} responseTime:${responseTime}`);
  }


  async _mwCheckAuth(ctx: Koa.ParameterizedContext, next: () => Promise<any>) {

    const urlExclude = ['/login']
    if (!urlExclude.includes(ctx.originalUrl)) {


      let authToken: string | undefined = ctx.header.authorization

      if (authToken) { //
        authToken = authToken.split(' ')[1]
        try {
          let u = Nvr.verifyUser(authToken)
          if (u === undefined) {
            logger.log(`"User not found" ${ctx.ip}`)
            logger.w(`"User not found" ${ctx.ip}`)
            throw new Error("User not found");

          }
          ctx.state.user = u
          logger.log(`webserver -> _mwCheckAuth OK ${u.username} ${ctx.ip}`)
          logger.w(`webserver -> _mwCheckAuth OK ${u.username} ${ctx.ip}`)
        } catch (error: any) {
          logger.err(`webserver -> _mwCheckAuth error ${error.message} ${ctx.ip} token: ${authToken}`)
          logger.w(`webserver -> _mwCheckAuth error ${error.message} ${ctx.ip} token: ${authToken}`)
          ctx.throw(401)
        }
      }
    }

    return next().catch(err => {
      if (err.status === 401) {
        ctx.status = 401;
        ctx.body = { error: err.originalError ? err.originalError.message : err.message };
      } else {
        throw err;
      }
    })
  }

}

export default new serverApi();
