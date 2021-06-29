//var mylog = (...args: any[]) => { console.log.apply(console,arguments); };
class testlog {
    public get log (): Function {
      const log = console.log.bind(console);
  
      // Implemnt server-side logging
  
      return  log;
    }

    log_(msg:string){

        // 1. Convert args to a normal array
        var args = Array.prototype.slice.call(arguments);
            
        // 2. Prepend log prefix log string
        //args.unshift(LOG_PREFIX + " ");
            
        // 3. Pass along arguments to console.log
        console.log.apply(console)//, args);
        //this.log.apply(console,args)
    }

  }
  export interface LogInterface {
      debug(primaryMessage: string, ...supportingData: any[]):void,
      info(primaryMessage: string, ...supportingData: any[]):void
  }
  class testlog01 implements LogInterface {
    public get log (): Function {
        const log = console.log.bind(console);
       
        // Implemnt server-side logging
    
        return  log;
      }
      constructor(){
          this.info = Function.prototype.bind.call(console.log, console)
         
      }
      emit(){
        console.log('emit');
        
      }
    public debug(msg:string, supportingDetails: any[]){
        this.emitLogMessage('debug',msg, supportingDetails)
    }
    public info(msg:string, supportingDetails?: any[]){
        this.emitLogMessage('info',msg, supportingDetails)
    }
    public emitLogMessage(msgType:'debug'|'info', msg:string, supportingDetails?: any[]){
        if (supportingDetails) {
            console[msgType](msg, supportingDetails)
        } else {
            //console[msgType](msg)
            console.log.apply(console, [msg]);
        }
    }
  }

  export class LoggerProvider {

    constructor() {
      //inject what ever you want here
    }
    
    public getLogger(name: string) {
        let my = this
        let timestamp = function(){};
        timestamp.toString = function(){
          let msg
          for (let i = 0; i < arguments.length; i++) {
            msg += arguments[i]
          }
            return "[DEBUG " + (new Date).toLocaleTimeString() + "]";    
        }
        function callerName() {
          try {
            throw new Error();
          }
          catch (e) {
            try {
              return e.stack.split('at ')[3].split(' ')[0];
            } catch (e) {
              return '';
            }
          }
        
        }
      return {
    
        get log() {
          
          //Transform the arguments 
          //Color output as an example
          //let callerFunc = arguments.callee.caller.toString();
          //let whoCallMe = callerName();
          /* let t = this
          let c = t.log.arguments */
          let msg = '%c[' + name + ']';
          for (let i = 0; i < arguments.length; i++) {
            msg += arguments[i]
          }
          //return console.log.bind(console, msg, 'color:blue')
          return my.emitLog('info', msg)//, ['color:blue'])
          //return console.log.bind(console, '%s', timestamp);
          

        }
    
      }
     }
     emitLog(msgType:'debug'|'info', msg:string, supportingDetails?: any[]){
        
        if (supportingDetails) {
           return console[msgType].bind(console, msg, supportingDetails)
        } else {
            return console[msgType].bind(console)
        }
     }
    
     stackTrace() {
      var err = new Error();
      return err.stack;
  }

    my_log(x:string) {
      var line = this.stackTrace()!;
      var lines = line.split("\n");
      console.log(x + " " + lines[2].substring(lines[2].indexOf("("), lines[2].lastIndexOf(")") + 1))
  }
}


class Logger  {
  constructor() {
      //super(stdout, stderr, ...otherArgs);
  }
  public getLogger(name: string) {
    let param = name
    let d = console.log.apply(this)
    return {get loggy(){ return console['log'].bind(console, name)}}
    
  }
  log(msg:any) {
      //super.log(moment().format('D MMM HH:mm:ss'), '-', util.format(...args));
      
  }

  error() {
      //super.error(moment().format('D MMM HH:mm:ss'), '-', util.format(...args));
  }
}
  export { testlog, testlog01, Logger }