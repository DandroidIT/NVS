
import Cors from '@koa/cors';
import https from "https";
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import helmet from 'koa-helmet';
import koaJwt from 'koa-jwt';
import configBase from "../config";

import { NoLogger } from '../lib/no-logger';
import AuthRouters from '../route/auth.router';
import Nvr from './nvr';
import Nvr_skt from './nvr_websocket';

const logger = new NoLogger('_webserver', true)
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
    this.use(this._mwCheckAuth)
    this.use(
      koaJwt({ secret: configBase.secret })
        .unless({ path: [/^\/login/, /^\/register/, /^\/api/] })
    );


    this.use(AuthRouters.routes())
    //this.use(NvrRouters.routes())

    this._httpsServer = https.createServer({ key: configBase.https.key, cert: configBase.https.cert }, this.callback())
    Nvr_skt.Start(this._httpsServer)

    this._httpsServer.listen(this._port, this._ip, () => {
      logger.log(`App listening on the ip ${this._ip}:${this._port}`);
      logger.w(`App listening on the ip ${this._ip}:${this._port}`);
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
    this.use(helmet())
    this.use(bodyParser())
    //this.use(this.secureConnection) <- (new in Nvr.ipIsOk)
    this.use(this._logger)
  }

  /* 	secureConnection = (ctx: Koa.ParameterizedContext, next: () => Promise<any>) => {
      const nm = new Netmask('192.168.9.0/24')
      if (Nvr._blockPublicAllConnection && nm.contains(ctx.ip) === false) {
        logger.err(`DENY ACCESS securConnection for ip ${ctx.ip}`);
        logger.w(`DENY ACCESS securConnection for ip ${ctx.ip}`);
        ctx.throw(401);
      }
      /* if (nm.contains(ctx.ip)){
        console.log(ctx)
        ctx.throw(new Error('invalid'), 400);
      } /
      return next()
    } */
  private async _logger(ctx: Koa.ParameterizedContext, next: () => Promise<any>) {
    let format = ':method ":url"';
    const str = format.replace(':method', ctx.method).replace(':url', ctx.url);
    const time1 = Date.now()
    await next();
    const time2 = Date.now();
    const responseTime = Math.ceil(time2 - time1) // Date.now() - time
    logger.log(`serverApi _logger | ip: ${ctx.ip} - type: ${ctx.type} protocol: ${ctx.protocol} method url: ${str} status: ${ctx.response.status} responseTime:${responseTime}`);
    logger.w(`serverApi _logger | ip: ${ctx.ip} - type: ${ctx.type} protocol: ${ctx.protocol} method url: ${str} status: ${ctx.response.status} responseTime:${responseTime}`);
  }


  async _mwCheckAuth(ctx: Koa.ParameterizedContext, next: () => Promise<any>) { // custom error koa-jwt

    const urlExclude = ['/login'] //,'/broadcast','/subscription'
    if (!urlExclude.includes(ctx.originalUrl)) {


      let authToken: string | undefined = ctx.header.authorization

      if (authToken) { //
        authToken = authToken.split(' ')[1]
        // controllo authorization
        // let u = jwt.decode(authToken,{ complete: true})
        try {
          // jwt.verify(authToken, configBase.secret, { complete: true })
          let u = Nvr.verifyUser(authToken)
          if (u === undefined) {
            logger.log(`"Utente non trovato" ${ctx.ip}`)
            logger.w(`"Utente non trovato" ${ctx.ip}`)
            throw new Error("Utente non trovato");

          }
          ctx.state.user = u
          logger.log(`webserver -> _mwCheckAuth OK ${u.username} ${ctx.ip}`)
          logger.w(`webserver -> _mwCheckAuth OK ${u.username} ${ctx.ip}`)
        } catch (error: any) {
          logger.err(`webserver -> _mwCheckAuth error ${error.message} ${ctx.ip} token: ${authToken}`)
          logger.w(`webserver -> _mwCheckAuth error ${error.message} ${ctx.ip} token: ${authToken}`)
          // ctx.status = 401
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
