

import os from 'os'
import * as diskusage from 'diskusage'
import { toBytes } from "fmt-bytes";
import { CronJob } from 'cron'
import base from '../config/index'
import { returnData } from "./interface";
import { NoLogger } from "../lib/no-logger";
import { helpers } from '../lib/helper'


class cronJob extends CronJob {
  nameJob = ''

}

interface iHD {
  name: string
  rootPath: string
  folderMonitor: {
    path: string
    NameFolder: string,
    listFiles: Array<string>,
    size: number,
    maxSize: number
  }
  available: number;
  free: number;
  free_percentage: number
  total: number;
}
class nvr_system {
  logger: NoLogger;
  private _system: 'win' | 'linux';
  private _HD: iHD

  private cronJobs: Array<cronJob> = []

  _tasks: Array<NodeJS.Timeout> = []
  constructor() {
    this.logger = new NoLogger("nvr_daemon", true);


    this._HD = {
      name: '', rootPath: '', free_percentage: 0, available: 0, free: 0, total: 0,
      folderMonitor: {
        path: `${base.rootForder}/${base.folderForCams.storeCams}`,
        NameFolder: base.folderForCams.storeCams, listFiles: [], size: 0,
        maxSize: toBytes(base.spaceMaxMedia, 'GiB')
      }
    }
    this._checksystem()
  }

  async start() {
    try {
      if (await this._checkSpaceHD())
        this.startTasksBase()
      else
        this.logger.log('detection problem for HD, task not start')

    } catch (error) {
      this.logger.err('nvr_system start error')
    }

  }

  public startTasksBase() {

    const cj = new cronJob('0 0 */23 * * *', () => {
      this._checkSpaceFolderMedia()

    }, null, false, null, null, true)
    cj.nameJob = 'CheckSpaceFolders'
    cj.start()
    this.cronJobs.push(cj)
  }
  private _checksystem() {
    if (os.platform() === 'win32') {
      this._system = 'win'
      let getRootpath = __dirname
      let letter = getRootpath.split(':')[0]
      if (letter) {
        this._HD.rootPath = `${letter}:`
      }
    } else {
      this._system = 'linux'
      this._HD.rootPath = '/'
    }
  }

  private async _checkSpaceHD() {
    try {
      let infoHd: diskusage.DiskUsage = await diskusage.check(this._HD.rootPath)
      this._HD.free_percentage = ((infoHd.available / infoHd.total) * 100);
      this._HD.total = infoHd.total
      this._HD.free = infoHd.free
      this._HD.available = infoHd.available
      this.logger.log('#----------------------INFO HD--------------------------------#');
      this.logger.log(` Total space: ${helpers.formatBytes(this._HD.total)} - space free: ${helpers.formatBytes(this._HD.available)} (${this._HD.free_percentage.toFixed(1)}%)`);
      this.logger.log('#--------------------------------------------------------------#');
      return true
    } catch (error) {
      this.logger.err('_checkSpaceHD error:', error)
      return false
    }

  }


  async _removeFolders(): Promise<returnData<boolean>> {
    try {
      let listdir = await helpers.system.getAllDirs(this._HD.folderMonitor.path, 0, 1)
      listdir = helpers.system.orderDirbyDatainName(listdir)
      let checkRemoveDir = false
      if (listdir.length) {
        checkRemoveDir = await helpers.system.rmFolderAndFile(listdir[0])
        return { dataResult: checkRemoveDir, msg: `delete folder in path:${listdir[0]} `, inError: false }
      } else {
        return { dataResult: checkRemoveDir, msg: `no necessary delete list dir length:${listdir.length} `, inError: false }
      }
    } catch (error) {
      return { dataResult: false, msg: `error for delete dir`, inError: true }
    }



  }

  async _checkSpaceFolderMedia() {
    this._calculateSizeFolder()


    if (this._HD.folderMonitor.size > this._HD.folderMonitor.maxSize) {
      this.logger.log(`action require!!! - space folder ${this._HD.folderMonitor.NameFolder} is ${helpers.formatBytes(this._HD.folderMonitor.size)} - max size: ${helpers.formatBytes(this._HD.folderMonitor.maxSize)}`);
      this.logger.w(`action require!!! - space folder ${this._HD.folderMonitor.NameFolder} is ${helpers.formatBytes(this._HD.folderMonitor.size)} - max size: ${helpers.formatBytes(this._HD.folderMonitor.maxSize)}`);
      const checkRM = await this._removeFolders()
      if (checkRM.dataResult === true) {
        console.log(checkRM.msg);
        this._checkSpaceFolderMedia()
      } else {
        this.logger.err(`_checkSpaceFolderMedia problem _removeFolders result:${checkRM.dataResult} msg: ${checkRM.msg}`);
        this.logger.w(`_checkSpaceFolderMedia problem _removeFolders result:${checkRM.dataResult} msg: ${checkRM.msg}`);
      }
      //}
    } else {
      this.logger.log(`no action require - space folder ${this._HD.folderMonitor.NameFolder} is ${helpers.formatBytes(this._HD.folderMonitor.size)} - max size: ${helpers.formatBytes(this._HD.folderMonitor.maxSize)}`);
      this.logger.w(`no action require - space folder ${this._HD.folderMonitor.NameFolder} is ${helpers.formatBytes(this._HD.folderMonitor.size)} - max size: ${helpers.formatBytes(this._HD.folderMonitor.maxSize)}`);
    }
  }
  private async _calculateSizeFolder() {
    this._HD.folderMonitor.listFiles = helpers.system.getAllFiles(this._HD.folderMonitor.path)
    this._HD.folderMonitor.size = helpers.system.getTotalSize(this._HD.folderMonitor.listFiles)

  }




}


export default new nvr_system()
