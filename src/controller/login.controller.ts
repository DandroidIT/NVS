import { ParameterizedContext } from "koa";
import Nvr from '../class/nvr'
import { NoLogger } from '../lib/no-logger'
const logger = new NoLogger('LoginController', true)//, true)
logger.log('Start log for LoginController')
export default class LoginController {
  public static async login(ctx: ParameterizedContext, next: () => Promise<any>) {
    let { username, password } = ctx.request.body as any

    let userToken = await Nvr.loginUser(username, password, ctx.request.ip)
    if (userToken.success) {
      // user.password
      // let tok = this.getToken({ user })
      ctx.set({ authorization: userToken.token })
      //ctx.body = { token: userToken.token, username: username };
      ctx.body = { success: true, data: { token: userToken.token, username: username } };
      logger.log(`LoginController post login userToken from ip ${ctx.ip} ENTER - post value: username=${username} password = ${String(password).length}`);
    } else if (!userToken.success) {
      ctx.body = { success: false, error: userToken.error }; //{ error: userToken.error};
    } else {
      logger.log(`LoginController post login userToken from ip ${ctx.ip} NO ENTER - post value: username=${username}, passowrd=${password}`);
      ctx.status = 404
    }
  }

  public static async logout(ctx: ParameterizedContext, next: () => Promise<any>) {
    let { token } = ctx.request.body as any
    if (token) {
      let check = Nvr.logoutUser(token)
      ctx.body = { success: check, error: '' };
    } else {
      ctx.body = { success: false, error: 'no valid data' };
    }
  }
}