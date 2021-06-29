"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const no_logger_1 = require("../lib/no-logger");
const ws_router_1 = require("../route/ws.router");
class Nvr_ws {
    constructor() {
        this._svrUpgrade = (request, socket, head) => {
            var _a, _b;
            if (request.headers.upgrade !== 'websocket') {
                socket.end('HTTP/1.1 400 Bad Request');
                return;
            }
            if (!ws_router_1.checkToken(request)) {
                this.logger.err('NO TOCKEN');
                socket.end('HTTP/1.1 400 Bad Request');
                return;
            }
            this.logger.log(`svrUpgrade: upgrade server ip:${request.socket.remoteAddress}`);
            let getRoute = [];
            if ((_a = request.url) === null || _a === void 0 ? void 0 : _a.split('/'))
                getRoute = (_b = request.url) === null || _b === void 0 ? void 0 : _b.split('/');
            if (getRoute[1] === 'apievent') { //ATTENZIONE PRIMA ERA 'datacmd'
                this._wsServerEvent.handleUpgrade(request, socket, head, (wsclient, request) => {
                    this.logger.log('svrUpgrade _wsServerEvent handleUpgrade...');
                    this._wsServerEvent.emit('connection', wsclient, request);
                });
            }
            else if (getRoute[1] === 'stream') {
                this._wsServerStream.handleUpgrade(request, socket, head, (wsclient, request) => {
                    this.logger.log('svrUpgrade _wsServerStream handleUpgrade...');
                    this._wsServerStream.emit('connection', wsclient, request);
                });
            }
            else {
                this.logger.log('svrUpgrade handleUpgrade no path api...socket destroy');
                socket.write("HTTP/1.1 500 \r\n\r\n");
                socket.destroy();
            }
        };
        this._wsServerEventConnection = (ws, request) => {
            this.logger.log(`wsServerEventConnection - ip client: ${request.socket.remoteAddress}:${request.socket.remotePort} 
        clients.size: ${this._wsServerEvent.clients.size}`);
            ws.send(JSON.stringify({ type: 'connect', payload: `ok connection` }));
            ws_router_1.wsEventRoute(ws, request);
        };
        this._wsServerStreamConnection = (ws, request) => {
            this.logger.log(`_wsServerStreamConnection - ip client: ${request.socket.remoteAddress}:${request.socket.remotePort} 
        clients.size: ${this._wsServerStream.clients.size}`);
            ws_router_1.wsStreamRouter(ws, request);
        };
        this.logger = new no_logger_1.NoLogger('Nvr_ws load');
    }
    Start(httpsServer) {
        this.logger.log(`Start Nvr_ws`);
        this._wsServerEvent = new ws_1.Server({ noServer: true });
        this._wsServerStream = new ws_1.Server({ noServer: true });
        httpsServer.on("upgrade", this._svrUpgrade);
        this._wsServerEvent.on("connection", this._wsServerEventConnection);
        this._wsServerStream.on("connection", this._wsServerStreamConnection);
        ws_router_1.setSocket(this._wsServerEvent);
    }
}
exports.default = new Nvr_ws();
//# sourceMappingURL=nvr_websocket.js.map