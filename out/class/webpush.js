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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_push_1 = __importDefault(require("web-push"));
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
    constructor() {
        web_push_1.default.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);
    }
    // TODO: controllare le web push da browes chiuso 
    push(subscription, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(' file: webpush.ts - line 28 - push - push');
            return yield web_push_1.default.sendNotification(subscription, JSON.stringify(notification));
        });
    }
}
exports.default = new wpCustom;
//# sourceMappingURL=webpush.js.map