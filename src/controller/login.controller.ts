import { ParameterizedContext } from "koa";
import Nvr from '../class/nvr'
import { NoLogger } from '../lib/no-logger'
const logger = new NoLogger('LoginController', true)
logger.log('Start log for LoginController')
export default class LoginController {
  public static async login(ctx: ParameterizedContext, next: () => Promise<any>) {
    let { username, password } = ctx.request.body as any
    let userToken = await Nvr.loginUser(username, password, ctx.request.ip)
    if (userToken.success) {
      ctx.set({ authorization: userToken.token })
      ctx.body = { success: true, data: { token: userToken.token, username: username } };
    } else if (!userToken.success) {
      ctx.body = { success: false, error: userToken.error }
    } else {
      ctx.status = 404
    }
    logger.log(`login from ip ${ctx.ip} success:${userToken.success} - post value: username=${username} password = ${String(password).length}`)
    logger.w(`login from ip ${ctx.ip} success:${userToken.success} - post value: username=${username} password = ${String(password).length}`)
  }

  public static async logout(ctx: ParameterizedContext, next: () => Promise<any>) {
    let { token } = ctx.request.body as any
    let check = false
    if (token) {
      check = Nvr.logoutUser(token)
      ctx.body = { success: check, error: '' };

    } else {
      ctx.body = { success: false, error: 'no valid data' };
    }
    logger.log(`logout success:${check} from ip ${ctx.ip} token:${token}`)
    logger.w(`logout success:${check} from ip ${ctx.ip} token:${token}`)
  }
}