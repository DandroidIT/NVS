import fs from 'fs';
import Jimp from 'jimp';
import jwt from "jsonwebtoken";
import { nanoid } from 'nanoid';
import ip_private from 'private-ip';
import { hash, compare } from 'bcryptjs'
import { remove } from 'fs-extra'


import path from 'path';

export namespace nanoId {
  export function getId(size = 10) {
    return nanoid(size)
  }
}

export namespace helpers {
  export function formatBytes(a: number, precision = 1) {
    if (0 === a)
      return "0 Bytes";
    const c = 0 > precision ? 0 : precision, d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  }

  export namespace system {
    export async function getAllDirs(dirPath: string, deepStart = 0, deepMax = 0, listDir?: Array<string>) {
      const _readRecursiveFolder = async (_path: string, _deepStart = 0, _deepMax = 0) => {
        if (_deepStart > _deepMax) {
          return;
        }
        const _Dirents = await fs.promises.readdir(_path, { withFileTypes: true })
        for (const _dirent of _Dirents) {
          if (_dirent.isDirectory()) {
            listDir.push(path.join(_path, _dirent.name))
            await _readRecursiveFolder(path.join(_path, _dirent.name), _deepStart + 1, _deepMax)
          }
        }
      }

      try {
        listDir = listDir === undefined ? [] : listDir
        await _readRecursiveFolder(dirPath, deepStart, deepMax)
        return listDir
      } catch (error) {

      }
    }
    export function getAllFiles(dirPath: string, listFiles?: Array<string>) {
      try {
        listFiles = listFiles === undefined ? [] : listFiles
        const files = fs.readdirSync(dirPath)
        files.forEach((file) => {
          if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
            listFiles = getAllFiles(`${dirPath}/${file}`, listFiles)
          } else {
            listFiles.push(`${dirPath}/${file}`)
          }
        })
        return listFiles
      } catch (error) {
        return ['']
      }

    }
    export function getTotalSize(listFiles: Array<string>) {
      let totSize = 0
      listFiles.forEach((file) => {
        if (file.length > 0)
          totSize += fs.statSync(file).size
      })
      return totSize
    }
    export async function rmFolderAndFile(pathDir: string) {
      try {
        await remove(pathDir)
        return true
      } catch (error) {
        return false
      }
    }
    export function orderDirbyDatainName(listDir: Array<string>, space = '_', delimiter = '-') {
      return listDir.map((_d) => {
        const strDate = _d.split(/[\\\/]/).reverse()[0]
        let _date: string
        let _time: string
        let h: string = '0'
        let min: string = '0'
        let sec: string = '0';
        [_date, _time] = strDate.split(space)
        const [d, m, y] = _date.split(delimiter)
        if (_time) {
          [h, min, sec] = _time.split(delimiter)
        }
        const timeOfDirFile = new Date(
          Number(y), Number(m) - 1, Number(d),
          Number(h), Number(min), Number(sec)
        )
        return { name: _d, times: timeOfDirFile.getTime() }
      }).filter((dfilter) => !isNaN(dfilter.times))
        .sort((a, b) => a.times - b.times)
        .map(dir => dir.name)

    }
    export function orderFilesbyDatainName(listFiles: Array<string>, space = '_', delimiter = '-') {
      return listFiles.map((_file) => {
        const arrTmp = _file.split('/')
        const strtime = arrTmp[arrTmp.length - 1].split('.')[0]
        const [_date, _time] = strtime.split(space)
        const [d, m, y] = _date.split(delimiter)
        const [h, min, s] = _time.split(delimiter)
        const timeOfNameFile = new Date(
          Number(y), Number(m) - 1, Number(d),
          Number(h), Number(min), Number(s)).getTime()
        return { name: _file, times: timeOfNameFile }
      })
        .sort((a, b) => a.times - b.times)
        .map(file => {
          return file.name
        })
    }

    export function orderFilesbyData(listFiles: Array<string>) {
      return listFiles.map((_file) => {
        return { name: _file, times: fs.statSync(_file).mtime.getTime() }
      })
        .sort((a, b) => a.times - b.times)
        .map(file => file.name)
    }

  }
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

export namespace mycrypt {
  export const hashtext = async (text: string) => {
    return await hash(text, 10)
  }
  export const comparetext = async (text, hash: string) => {
    return await compare(text, hash)
  }
}
