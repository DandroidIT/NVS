import WebSocket, { WebSocketClient } from "ws";
import { ChildProcessWithoutNullStreams } from 'child_process'

export interface ISubscription {
  endpoint: string;
  expirationTime?: number;
  keys: {
    auth: string;
    p256dh: string;
  }
}


export type optNameNvr = 'ipblock' | 'other';

export type returnData<T> = { inError: boolean; msg: string; dataResult?: T }

export interface IUser {
  id: string;
  idconnect: string;
  ip: string;
  username: string;
  token: string;
  last_connect: string;
  ws_list: Map<string, connectWS> //Array<connectWS>
  /* ws_stream?: WebSocket */
}

export type typeWS = 'api' | 'stream';

interface connectWS {
  type: typeWS
  tagid: string
  ws: WebSocketClient
}

export interface ICamApi {
  id: string; information: [string, any][], name: string, asPTZ: boolean;
  inerror: boolean, liveH24: boolean, motion: boolean
}

export interface IstreamFFMPEGCam {
  pid: number | string
  urlstream: string
  spawnProcess: ChildProcessWithoutNullStreams
  listWSClient?: Array<WebSocket>
}

export interface IFFMPEGCam {
  pid: number | string
  urlstream: string
  spawnProcess: ChildProcessWithoutNullStreams
}

export interface loginResponse {
  success: boolean;
  token: string;
  error?: string;
}

export interface iradarCam { urn: string; name: string; xaddrs: string[]; username: string; password: string, exist: boolean }

