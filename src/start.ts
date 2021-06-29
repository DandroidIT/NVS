import Nvr from "./class/nvr";
import webServer from './class/webserver'


let run = async () => {
  await Nvr.startNvr()
  webServer.StartServer()
}

run()

