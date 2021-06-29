

import { spawn } from 'child_process';
import { helpers } from '../lib/helper';
import { NoLogger } from "../lib/no-logger";
import { IFFMPEGCam } from './interface';

const logger = new NoLogger("nvr_video", true);

class elaborateVideo {

  _FFMPEGs = new Array<IFFMPEGCam>()

  constructor() { }


  async startVideoRecording(source: string, path: string, duration: string): Promise<boolean> {
    return new Promise((res, err) => {

      let pathSave = `${path}${helpers.date.dateString().replace(' ', '_')}.avi` //optionVideo['savepath'] + helpersNEW.date.dateString().replace(' ', '_') + '.avi'
      let ffmpegNew = spawn("ffmpeg", this.ffmpegOptVideo(source, pathSave, duration));
      ffmpegNew.stdout.on("data", (chunk: any) => {
        console.log('🚀 ~ file: nvr_video.ts ~ line 29 ~ elaborateVideo ~ ffmpegNew.stdout.on ~ chunk', chunk)

      })
      ffmpegNew.stderr.on("data", function (data: Buffer) {
        logger.log('🚀 ~ file: nvr_video.ts ~ line 30 ~ elaborateVideo ~ data')
        logger.log(data.toString())
      });
      ffmpegNew.stdout.on("close", (code: number, signal: string) => {
        logger.log(`startVideoRecording - ffmpegNew onclose pid:${ffmpegNew.pid} close:${code} signal:${signal}`);
      });
      ffmpegNew.on('error', (err: Buffer) => {
        logger.log('🚀 ~ file: nvr_video.ts ~ line 40 ~ elaborateVideo ~ ffmpegNew.on ~ err')
        logger.log(err.toString());
        res(false)

      })
      ffmpegNew.on("exit", (code) => {
        logger.log(`startVideoRecording - ffmpegNew onexit pid:${ffmpegNew.pid} code:${code}`);
        res(true)
      });
      //this._FFMPEGs.push({ pid: ffmpegNew.pid, urlstream: source, spawnProcess: ffmpegNew })

    })
  }

  stopProcessor(pid: string) {
    let _ffmpegExist = this._FFMPEGs.find(
      (ffmpeg) => ffmpeg.pid == pid
    );
    if (_ffmpegExist) {
      _ffmpegExist.spawnProcess.kill()
      this._FFMPEGs = this._FFMPEGs.filter((ffmpeg) => {
        return ffmpeg.pid !== pid;
      });
    }

  }

  mergeVideos() {
    //(for %i in (*.avi) do @echo file '%i') > videos.txt 
    //ffmpeg -f concat -i videos.txt -c copy output.avi 
  }


  ffmpegOptVideo(url: string, path: string, duration: string) {

    let _optFFMPEG = [
      '-loglevel', 'quiet', //rem for debug
      '-i',
      `${url}`,
      '-vcodec', 'copy',
      '-preset', 'fast',
      '-t', `${duration}`, `${path}`
    ]

    return _optFFMPEG
  }

}
export function ffmpegOpt(url: string) {
  /*  let _optFFMPEG0 = ['-rtsp_transport', 'tcp', '-i', //MB 3.88 -3.76 3.40 in 15 second
     `${url}`,
     '-tune', 'zerolatency', '-framerate', '25',
     '-f', 'mpegts', '-codec:v', 'mpeg1video', '-b:v', '128k', '-bf', '0', // libx264 mpeg1video'-s', '800x600',
     '-codec:a', 'mp2', '-b:a', '128k', '-ac', '1', '-ar', '44100', '-muxdelay', '0.001',
     'pipe:1'] */

  let _optFFMPEG = ['-loglevel', 'quiet', '-rtsp_transport', 'tcp', '-i',
    `${url}`,
    '-tune', 'zerolatency', //'-framerate', '25',
    //'-preset', 'fast',
    '-f', 'mpegts', '-codec:v', 'mpeg1video', //'-s', '1920x1080', //'-s', '800x600', //'1280x1024',
    '-b:v', '128k', '-bf', '0', // libx264 mpeg1video'-s', '800x600',
    '-codec:a', 'mp2', '-b:a', '128k', '-ac', '1', '-ar', '44100',
    // '-muxdelay', '0.001',
    'pipe:1']


  return _optFFMPEG
}

export { elaborateVideo };
