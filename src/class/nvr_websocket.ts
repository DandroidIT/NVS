import http, { IncomingMessage } from "http";
import { Socket } from "net";
import https from "https";
import WebSocket, { Server, WebSocketClient } from "ws";
import { NoLogger } from '../lib/no-logger'
import { wsEventRoute, checkToken, wsStreamRouter, setSocket } from '../route/ws.router'


class Nvr_ws {

	logger: NoLogger
	private _wsServerStream!: Server
	private _wsServerEvent!: Server
	constructor() {
		this.logger = new NoLogger('Nvr_ws')
	}

	Start(httpsServer: https.Server | http.Server) {
		this.logger.log(`Start Nvr_ws`)
		this._wsServerEvent = new Server({ noServer: true })
		this._wsServerStream = new Server({ noServer: true })
		httpsServer.on("upgrade", this._svrUpgrade);
		this._wsServerEvent.on("connection", this._wsServerEventConnection);
		this._wsServerStream.on("connection", this._wsServerStreamConnection);
		setSocket(this._wsServerEvent)

	}

	private _svrUpgrade = (request: IncomingMessage, socket: Socket, head: Buffer) => {
		if (request.headers.upgrade !== 'websocket') {
			socket.end('HTTP/1.1 400 Bad Request');
			return;
		}
		if (!checkToken(request)) {
			socket.end('HTTP/1.1 400 Bad Request');
			socket.destroy()
			return;
		}

		let getRoute: string[] = []
		if (request.url?.split('/'))
			getRoute = request.url?.split('/')

		if (getRoute[1] === 'apievent') {
			this._wsServerEvent.handleUpgrade(request, socket, head, (wsclient: WebSocket, request: IncomingMessage) => {
				this.logger.log('svrUpgrade _wsServerEvent handleUpgrade...')
				this._wsServerEvent.emit('connection', wsclient, request)
			})
		} else if (getRoute[1] === 'stream') {
			this._wsServerStream.handleUpgrade(request, socket, head, (wsclient: WebSocket, request: IncomingMessage) => {
				this.logger.log('svrUpgrade _wsServerStream handleUpgrade...')
				this._wsServerStream.emit('connection', wsclient, request)
			})
		} else {
			this.logger.log('svrUpgrade handleUpgrade no path api...socket destroy')
			socket.write("HTTP/1.1 500 \r\n\r\n");
			socket.destroy()
		}
	}

	private _wsServerEventConnection = (ws: WebSocketClient, request: IncomingMessage) => {
		this.logger.log(`wsServerEventConnection - ip client: ${request.socket.remoteAddress}:${request.socket.remotePort} 
        clients.size: ${this._wsServerEvent.clients.size}`);
		ws.send(JSON.stringify({ type: 'connect', payload: `ok connection` }))
		wsEventRoute(ws, request)
	}

	private _wsServerStreamConnection = (ws: WebSocketClient, request: IncomingMessage) => {
		this.logger.log(`_wsServerStreamConnection - ip client: ${request.socket.remoteAddress}:${request.socket.remotePort} 
        clients.size: ${this._wsServerStream.clients.size}`);
		wsStreamRouter(ws, request)
	}

}

export default new Nvr_ws();



