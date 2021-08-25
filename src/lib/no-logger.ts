import * as fs from 'fs'
import { helpers } from './helper'
enum Colors {
  reset = '\x1b[0m',
  Black = '\033[30m',
  Red = '\x1b[31m',
  Green = '\x1b[32m',
  Yellow = '\x1b[33m',
  Blue = '\033[34m',
  Magenta = '\033[35m',
  Cyan = '\033[36m',
  White = '\033[37m'
}
export class NoLogger {
  scope: string = ''
  private filePath = ''
  offLog = false
  //private _logWriteHistory: Array<string>=[]
  private readonly _createFile: boolean = false
  constructor(scope: string,
    createFile: boolean = false) {

    this.scope = scope
    this._buildFile(createFile)
    this._createFile = createFile
  }
  //public get log(): Function { return ()=>{}}

  public get log(): Function {
    if (this.offLog)
      return () => { }
    let builtMessagelog = `%c[${this.scope}] [${helpers.date.dateFULLString()}]: ${Colors.Green}%s`
    let clog = this._emitLog('log', builtMessagelog, ['color:orange;font-weight: bold;'])
    return clog

  }
  public get err(): Function {
    let builtMessagelog = `%c[${this.scope}] [${helpers.date.dateFULLString()}]: ${Colors.Red}%s`
    let cerror = this._emitLog('error', builtMessagelog, ['color:red;font-weight: bold;'])
    return cerror
  }

  public w(msg: string) {
    this._writeFile(msg)
  }

  private _buildFile(writeFile?: boolean): void {
    const defName = `${this.scope}_log.txt`
    this.filePath = `${process.cwd()}/logs/${defName}`
    if (!writeFile) return
    if (!fs.existsSync(`${process.cwd()}/logs/`)) {
      fs.mkdirSync(`${process.cwd()}/logs/`)
    }
    this.w('Log Start')
  }
  private _writeFile(message: string): void {
    fs.appendFile(this.filePath, `[${helpers.date.dateFULLString()}] ${message}\r\n`, {}, () => {

    })
  }
  private _emitLog(msgType: 'log' | 'debug' | 'info' | 'error', msg: string, supportingDetails?: any[]) {
    if (supportingDetails) {
      return console[msgType].bind(console[msgType], msg, supportingDetails.join(','))
    } else {
      return console[msgType].bind(console)
    }
  }

  logTest(...arg: any) {
    /*  const originalPrepareStackTrace = Error.prepareStackTrace;
     Error.prepareStackTrace = (_, stack) => stack; */
    //const callee = new Error().stack[1];
    let err = new Error()
    const callee = err.stack![1]
        /* Error.prepareStackTrace = originalPrepareStackTrace; */
/*         const relativeFileName = path.relative(process.cwd(), callee.getFileName());
        const prefix = `${relativeFileName}:${callee.getLineNumber()}:` */;
    let linetest = new Error().stack!.split('\n')[2]
    let line = new Error().stack!.split('\n')[2] // Grabs third line
      .trim() // Removes spaces
      .substring(3) // Removes three first characters ("at ")
      .replace(__dirname, '') // Removes script folder path
      .replace(/\s\(./, ' at ') // Removes first parentheses and replaces it with " at "
      .replace(/\)/, '') // Removes last parentheses
    const line2 = (((new Error('log'))
      .stack!.split('\n')[2] || '…')
      .match(/\(([^)]+)\)/) || [, 'not found'])[1];

    console.log.call(console, `${line}\n ${linetest}\n ${line2}\n`, ...arg)
  }


}