"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elaborateVideo = exports.ffmpegOpt = void 0;
const child_process_1 = require("child_process");
const helper_1 = require("../lib/helper");
const no_logger_1 = require("../lib/no-logger");
const logger = new no_logger_1.NoLogger("nvr_video", true);
class elaborateVideo {
    constructor() {
        this._FFMPEGs = new Array();
    }
    startVideoRecording(source, path, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, err) => {
                //let _setIntervalRecording = set
                // creare ffmpe spawn vedere nvr Createffmpeg
                // deve fare segmenti di video e per stoppare uccidere processo ffmpeg
                let pathSave = `${path}${helper_1.helpersNEW.date.dateString().replace(' ', '_')}.avi`; //optionVideo['savepath'] + helpersNEW.date.dateString().replace(' ', '_') + '.avi'
                let ffmpegNew = child_process_1.spawn("ffmpeg", this.ffmpegOptVideo(source, pathSave, duration));
                ffmpegNew.stdout.on("data", (chunk) => {
                    console.log('🚀 ~ file: nvr_video.ts ~ line 29 ~ elaborateVideo ~ ffmpegNew.stdout.on ~ chunk', chunk);
                });
                ffmpegNew.stderr.on("data", function (data) {
                    logger.log('🚀 ~ file: nvr_video.ts ~ line 30 ~ elaborateVideo ~ data');
                    logger.log(data.toString());
                });
                ffmpegNew.stdout.on("close", (code, signal) => {
                    logger.log(`startVideoRecording - ffmpegNew onclose pid:${ffmpegNew.pid} close:${code} signal:${signal}`);
                });
                ffmpegNew.on('error', (err) => {
                    logger.log('🚀 ~ file: nvr_video.ts ~ line 40 ~ elaborateVideo ~ ffmpegNew.on ~ err');
                    logger.log(err.toString());
                    res(false);
                });
                ffmpegNew.on("exit", (code) => {
                    logger.log(`startVideoRecording - ffmpegNew onexit pid:${ffmpegNew.pid} code:${code}`);
                    res(true);
                });
                //this._FFMPEGs.push({ pid: ffmpegNew.pid, urlstream: source, spawnProcess: ffmpegNew })
            });
        });
    }
    stopProcessor(pid) {
        let _ffmpegExist = this._FFMPEGs.find((ffmpeg) => ffmpeg.pid == pid);
        if (_ffmpegExist) {
            _ffmpegExist.spawnProcess.kill();
            this._FFMPEGs = this._FFMPEGs.filter((ffmpeg) => {
                return ffmpeg.pid !== pid;
            });
        }
    }
    mergeVideos() {
        //(for %i in (*.avi) do @echo file '%i') > videos.txt 
        //ffmpeg -f concat -i videos.txt -c copy output.avi 
    }
    ffmpegOptVideo(url, path, duration) {
        let _optFFMPEG = [
            '-loglevel', 'quiet',
            '-i',
            `${url}`,
            '-vcodec', 'copy',
            '-preset', 'fast',
            '-t', `${duration}`, `${path}`
        ];
        return _optFFMPEG;
    }
}
exports.elaborateVideo = elaborateVideo;
function ffmpegOpt(url) {
    /*  let _optFFMPEG0 = ['-rtsp_transport', 'tcp', '-i', //MB 3.88 -3.76 3.40 in 15 second
       `${url}`,
       '-tune', 'zerolatency', '-framerate', '25',
       '-f', 'mpegts', '-codec:v', 'mpeg1video', '-b:v', '128k', '-bf', '0', // libx264 mpeg1video'-s', '800x600',
       '-codec:a', 'mp2', '-b:a', '128k', '-ac', '1', '-ar', '44100', '-muxdelay', '0.001',
       'pipe:1'] */
    let _optFFMPEG = ['-loglevel', 'quiet', '-rtsp_transport', 'tcp', '-i',
        `${url}`,
        '-tune', 'zerolatency',
        //'-preset', 'fast',
        '-f', 'mpegts', '-codec:v', 'mpeg1video',
        '-b:v', '128k', '-bf', '0',
        '-codec:a', 'mp2', '-b:a', '128k', '-ac', '1', '-ar', '44100',
        // '-muxdelay', '0.001',
        'pipe:1'];
    return _optFFMPEG;
}
exports.ffmpegOpt = ffmpegOpt;
//# sourceMappingURL=nvr_video.js.map