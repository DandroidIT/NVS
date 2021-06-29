import Jimp from 'jimp';
import jwt from "jsonwebtoken";
import { nanoid } from 'nanoid';
import ip_private from 'private-ip';


export namespace nanoId {
  export function getId(size = 10) {
    return nanoid(size)
  }
}

export namespace helpers {
  export function formatBytes(a: number, b = 2) { if (0 === a) return "0 Bytes"; const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024)); return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d] }
  export namespace date {

    export function dateISOLocate(date?: Date) {
      let d = date || (new Date());
      const pad = (n: number) => n < 10 ? '0' + n : n
      return d.getFullYear() + '-'
        + pad(d.getMonth() + 1) + '-'
        + pad(d.getDate()) + 'T'
        + pad(d.getHours()) + ':'
        + pad(d.getMinutes()) + ':'
        + pad(d.getSeconds()) + 'Z'

    }

    export function dateISOString() {
      return new Date().toISOString().slice(0, 19) + 'Z'
    }

    export function dateString(date?: Date): string {
      var dt = date || (new Date());
      return [dt.getDate(), dt.getMonth() + 1, dt.getFullYear()].join('-') + ' '
        + [dt.getHours(), dt.getMinutes(), dt.getSeconds()].join('-');
    }

    export function dateFULLString(date?: Date): string {
      var dt = date || (new Date());
      return [dt.getDate(), dt.getMonth() + 1, dt.getFullYear()].join('-') + ' '
        + [dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds()].join('-');
    }
    export function humanTimeToMS(text: string): number {
      let parts: number[] = []
      parts = text.split(':').map(p => parseInt(p))

      let time: number = 0;
      time += Math.floor(parts.pop() * 1000); //s
      time += parts.pop() * 1000 * 60; //m
      time += parts.pop() * 1000 * 60 * 60; //h

      return time;
    }

  }


  export function IsIpPrivate(remoteIp: string) {
    return ip_private(remoteIp)

  }

  export async function delay(ms: number) {
    return await new Promise(resolve => setTimeout(resolve, ms));
  }

  export function isEmptyObject(obj: object) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
  export function mapToJson(map: any) {
    return JSON.stringify([...map]);
  }

  export function jsonToMap(jsonStr: string) {
    return new Map(JSON.parse(jsonStr));
  }

  export function strMapToObj(strMap: string) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      // We don’t escape the key '__proto__'
      // which can cause problems on older engines
      obj[k] = v;
    }
    return obj;
  }

  export function objToStrMap(obj: any) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
    }
    return strMap;
  }

  export const imageToBase64 = async (pathImage: string) => {
    let imgJ = await Jimp.read(pathImage)
    //imgJ.resize(600, Jimp.AUTO).quality(100)
    //return await res.getBase64Async('image/png')
    return await imgJ.getBase64Async('image/png')
  }


}

export namespace helpJwt {
  export function getToken(payload = {}, secretOrPrivateKey: jwt.Secret, options?: jwt.SignOptions | undefined) {
    return jwt.sign(payload, secretOrPrivateKey, options) // { expiresIn: '1d' })
  }
  export function verifyToken(token: string, secretOrPublicKey: jwt.Secret, options?: jwt.VerifyOptions | undefined) {
    return jwt.verify(token, secretOrPublicKey, options)
  }
  export function decodeToken(token: string, options?: jwt.DecodeOptions | undefined) {
    return jwt.decode(token, options)
  }
}
