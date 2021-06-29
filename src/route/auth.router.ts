import Router from 'koa-router';
import LoginCtrl from '../controller/login.controller'
const router = new Router()
router.prefix('/')
router.post('/login', LoginCtrl.login)

export default router

