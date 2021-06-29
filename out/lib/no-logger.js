"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoLogger = void 0;
const fs = __importStar(require("fs"));
const helper_1 = require("./helper");
var Colors;
(function (Colors) {
    Colors["reset"] = "\u001B[0m";
    Colors["Black"] = "\x0033[30m";
    Colors["Red"] = "\u001B[31m";
    Colors["Green"] = "\u001B[32m";
    Colors["Yellow"] = "\u001B[33m";
    Colors["Blue"] = "\x0033[34m";
    Colors["Magenta"] = "\x0033[35m";
    Colors["Cyan"] = "\x0033[36m";
    Colors["White"] = "\x0033[37m";
})(Colors || (Colors = {}));
class NoLogger {
    constructor(scope, createFile = false) {
        this.scope = '';
        this.filePath = '';
        this.offLog = false;
        //private _logWriteHistory: Array<string>=[]
        this._createFile = false;
        this.scope = scope;
        this._buildFile(createFile);
        this._createFile = createFile;
    }
    //public get log(): Function { return ()=>{}}
    get log() {
        if (this.offLog)
            return () => { };
        let builtMessagelog = `%c[${this.scope}] [${helper_1.helpersNEW.date.dateFULLString()}]: ${Colors.Green}%s`;
        let clog = this._emitLog('log', builtMessagelog, ['color:orange;font-weight: bold;']);
        return clog;
    }
    get err() {
        let builtMessagelog = `%c[${this.scope}] [${helper_1.helpersNEW.date.dateFULLString()}]: ${Colors.Red}%s`;
        let cerror = this._emitLog('error', builtMessagelog, ['color:red;font-weight: bold;']);
        return cerror;
    }
    w(msg) {
        this._writeFile(msg);
    }
    _buildFile(writeFile) {
        const defName = `${this.scope}_log.txt`;
        this.filePath = `${process.cwd()}/logs/${defName}`;
        if (!writeFile)
            return;
        this.w('Log Start');
    }
    _writeFile(message) {
        fs.appendFile(this.filePath, `[${helper_1.helpersNEW.date.dateFULLString()}] ${message}\r\n`, {}, () => {
        });
    }
    _emitLog(msgType, msg, supportingDetails) {
        if (supportingDetails) {
            return console[msgType].bind(console[msgType], msg, supportingDetails.join(','));
        }
        else {
            return console[msgType].bind(console);
        }
    }
    logTest(...arg) {
        /*  const originalPrepareStackTrace = Error.prepareStackTrace;
         Error.prepareStackTrace = (_, stack) => stack; */
        //const callee = new Error().stack[1];
        let err = new Error();
        const callee = err.stack[1];
        let linetest = new Error().stack.split('\n')[2];
        let line = new Error().stack.split('\n')[2] // Grabs third line
            .trim() // Removes spaces
            .substring(3) // Removes three first characters ("at ")
            .replace(__dirname, '') // Removes script folder path
            .replace(/\s\(./, ' at ') // Removes first parentheses and replaces it with " at "
            .replace(/\)/, ''); // Removes last parentheses
        const line2 = (((new Error('log'))
            .stack.split('\n')[2] || '…')
            .match(/\(([^)]+)\)/) || [, 'not found'])[1];
        console.log.call(console, `${line}\n ${linetest}\n ${line2}\n`, ...arg);
    }
}
exports.NoLogger = NoLogger;
//# sourceMappingURL=no-logger.js.map