import { IncomingMessage } from "http";
import _Nvr from "../class/nvr";
import WebSocket, { WebSocketClient } from "ws";
import camCtrl from '../controller/cam.ws.controller'
import nvrCtrl from '../controller/nvr.ws.controller'
import { NoLogger } from '../lib/no-logger'

const logger = new NoLogger('ws.router')

declare module 'ws' {
	export interface WebSocketClient extends WebSocket {
		online: boolean
		idConnect: string
	}
}

enum wsEventName {
	/*  CamControll = 'camcontroll',
	 CamList = 'camlist', */
	TEST = 'test'
}

export function setSocket(wsServer: WebSocket.Server) {
	//nvrCtrl.startPingCustom() <- disabilitato per debug attivare e verificare in produzione
}


export function wsEventRoute(wsClient: WebSocketClient, request: IncomingMessage) {
	wsClient.on("message", (msg: string) => _wsToEvent(msg, wsClient, request))
	wsClient.on('undefined', mess => { logger.log(` undefined ${mess}`) })
	wsClient.on("error", (err) => {
		logger.err(`wsEventRoute: ERROR: Client disconnected - reason: ${err}`);
	});
	_wsEventBind(wsClient, request)

}

let _wsToEvent = (message: any, _ws: WebSocketClient, request: IncomingMessage) => {
	let _path: string = request.url!
	try {
		//block public IP
		if (!nvrCtrl.checkIpIsOk(request.socket.remoteAddress!)) {
			logger.log(`wsEventRoute _wsToEvent nvrCtrl.checkIpIsOk NOT OK: ${request.socket.remoteAddress!} _path: ${_path}`)
			_ws.terminate()
			return
		}
		let { type, payload } = JSON.parse(message)
		_ws.emit(type, payload, _path || message)
		if (type !== 'ping' && type !== 'pong')
			logger.log(`wsEventRoute _wsToEvent OK emit  message: ${message} _path: ${_path}`)

	} catch (error) {
		logger.err(`wsEventRoute _wsToEvent error   message: ${message} _path: ${_path}`)
		_ws.emit('undefined', message)
	}
}

let _wsEventBind = (ws: WebSocketClient, request: IncomingMessage) => {

	nvrCtrl.InitClient(ws, request.headers['sec-websocket-protocol']!, 'api')

	ws.on(wsEventName.TEST, (data) => {
		ws.send(JSON.stringify({ type: 'test', payload: data }))
	})

	ws.on(camCtrl.camEvent.CamList, async (data) => ws.send(await camCtrl.list(), () => { }))
	ws.on(camCtrl.camEvent.CamControll, async (data) => ws.send(await camCtrl.move(data)))
	ws.on(camCtrl.camEvent.CamScreenshot, async (data) => ws.send(await camCtrl.screenshot(data)))
	ws.on(camCtrl.camEvent.CamSetOption, async (data) => ws.send(await camCtrl.SetCamOption(data), () => { }))

	ws.on(nvrCtrl.nvrEvent.ManagerPush, async (data) => ws.send(await nvrCtrl.managerPush(data)))
	ws.on(nvrCtrl.nvrEvent.SetOption, async (data) => ws.send(await nvrCtrl.SetOptions(data)))

	ws.on(camCtrl.camEvent.ManagerAlarms, async (data) => ws.send(await camCtrl.managerAlarms(data)))

	ws.on(nvrCtrl.nvrEvent.RadarCams, async () => ws.send(await nvrCtrl.radarCams()))
	ws.on(nvrCtrl.nvrEvent.saveRadarCam, async (data) => ws.send(await nvrCtrl.saveRadarCam(data)))

	ws.on(nvrCtrl.nvrEvent.updateUser, async (data) => ws.send(await nvrCtrl.updateUser(data)))

	ws.on(nvrCtrl.nvrEvent.logoutUser, async (data) => ws.send(nvrCtrl.logoutUser(data)))

}

export function wsStreamRouter(wsClient: WebSocketClient, request: IncomingMessage) {
	camCtrl.StreamCam(wsClient, request)
}

export function checkToken(request: IncomingMessage): boolean {
	try {
		let u = _Nvr.verifyUser(request.headers['sec-websocket-protocol']!)
		if (u === undefined) {
			logger.err(`checkToken not valid socket.remoteAddress: ${request.socket.remoteAddress} url: ${request.url} token: ${request.headers['sec-websocket-protocol']}`)
			logger.w(`checkToken not valid socket.remoteAddress: ${request.socket.remoteAddress} url: ${request.url} token: ${request.headers['sec-websocket-protocol']}`)
			return false
		}
		logger.log('sec-websocket-protocol IS VALID:', request.headers['sec-websocket-protocol'])
		return true;
	} catch (error) {
		return false
	}


}



