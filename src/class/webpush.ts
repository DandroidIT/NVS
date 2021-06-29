import webpush from 'web-push'
import  { ISubscription } from './interface'
//const vapidKeys = webpush.generateVAPIDKeys();

// Prints 2 URL Safe Base64 Encoded Strings
//console.log(vapidKeys.publicKey, vapidKeys.privateKey);
// BHKIJUBaKPfh3UswGevh8jL87gT3MuzipHVy3Gpjk_D4xgGsqFdpXriGqriydlaxRtRiq41ho6mb1kGY-S3ERp8 ILFjEWGzAeHfa9WbsqFxOelT41ykJjvqmNwUESNISqo
const publicVapidKey = 'BHKIJUBaKPfh3UswGevh8jL87gT3MuzipHVy3Gpjk_D4xgGsqFdpXriGqriydlaxRtRiq41ho6mb1kGY-S3ERp8'; 
// 'BMrfFtMtL9IWl9vchDbbbYzJlbQwplyZ_fbv8Pei8gPNna_Dr1O-Ng7U7fy0LLqz5RKIxEytTIzyk6TLrcKbN30';
const privateVapidKey = 'ILFjEWGzAeHfa9WbsqFxOelT41ykJjvqmNwUESNISqo'; 
// 'E5gpbs9Y6r5TscHC64Ce9-hXojA9I1qQL0kuvX8Jz5Y';

/* export default (): void => {
  webpush.setVapidDetails(
    'mailto:test@test.com',
    publicVapidKey,
    privateVapidKey,
  );
} */


class wpCustom {
  constructor(){
    webpush.setVapidDetails(
      'mailto:test@test.com',
      publicVapidKey,
      privateVapidKey,
    );
  }
// TODO: controllare le web push da browes chiuso 
 async push (subscription:ISubscription, notification: any):Promise<webpush.SendResult> {
    console.log(' file: webpush.ts - line 28 - push - push')
    return await webpush.sendNotification(subscription, JSON.stringify(notification))  
 }
  
}

export default new wpCustom
