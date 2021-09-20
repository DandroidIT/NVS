(()=>{"use strict";var e={1619:(e,t,n)=>{var o=n(8880),r=n(9592),a=n(3673);function s(e,t,n,o,r,s){const i=(0,a.up)("router-view");return(0,a.wg)(),(0,a.j4)(i)}const i=(0,a.aZ)({name:"App"});i.render=s;const c=i;var l=n(9582);const d=[{path:"/",name:"home",meta:{requiresAuth:!0},component:()=>Promise.all([n.e(736),n.e(319)]).then(n.bind(n,3319)),children:[{path:"",name:"dash",component:()=>Promise.all([n.e(736),n.e(103)]).then(n.bind(n,3103))},{path:"/videowall",name:"videowall",component:()=>Promise.all([n.e(736),n.e(602)]).then(n.bind(n,4602))},{path:"/cam/:id",name:"cam",component:()=>Promise.all([n.e(736),n.e(100)]).then(n.bind(n,2100))},{path:"/setup",name:"setup",component:()=>Promise.all([n.e(736),n.e(856)]).then(n.bind(n,2856))},{path:"/settings",name:"settings",component:()=>Promise.all([n.e(736),n.e(941)]).then(n.bind(n,785))},{path:"/calendaralarms",name:"calendarAlarms",component:()=>Promise.all([n.e(736),n.e(475)]).then(n.bind(n,9475))}]},{path:"/login",name:"login",component:()=>Promise.all([n.e(736),n.e(459)]).then(n.bind(n,6459))},{path:"/test",name:"test",component:()=>Promise.all([n.e(736),n.e(339)]).then(n.bind(n,3339))},{path:"/:catchAll(.*)*",component:()=>Promise.all([n.e(736),n.e(598)]).then(n.bind(n,2598))}],u=d;var m=n(3226);const h=function(){const e=l.r5,t=(0,l.p7)({scrollBehavior:()=>({left:0,top:0}),routes:u,history:e("")});return t.beforeEach(((e,t,n)=>{const{userState:o}=(0,m.C)();e.matched.some((e=>e.meta.requiresAuth))&&(!1===o.isAuth||!1===o.isAuthWss)?n({path:"/login"}):n()})),t};async function p(e,t){const n="function"===typeof h?await h({}):h,o=e(c);return o.use(r.Z,t),{app:o,router:n}}var f=n(4434);const v={config:{},plugins:{Notify:f.Z}};async function g({app:e,router:t}){e.use(t),e.mount("#q-app")}p(o.ri,v).then(g)},3457:(e,t,n)=>{n.d(t,{Z:()=>s});var o=n(2775),r=n(1585);class a{userUpdate(e,t,n,a){return new Promise((s=>{const i=JSON.stringify({payload:{username:e,password:t,newUsername:n,newPassword:a}}),c=e=>{s(e)};r.Z.bindAndsend({name:o.K.user_update,cb:c},{msg:i})}))}setOptions(e,t,n=!1){return new Promise((a=>{const s=e=>{a(e)},i=JSON.stringify({type:o.K.set_options,payload:{typeOption:e,data:t,checkOnly:n}});r.Z.bindAndsend({name:o.K.set_options,cb:s},{msg:i})}))}AlarmsCount(e="",t={start:"",end:""}){return new Promise((n=>{const a=e=>{n(e)},s=JSON.stringify({type:o.K.alarms_count,payload:{tagcam:e,dataFilter:t}});r.Z.bindAndsend({name:o.K.alarms_count,cb:a},{msg:s})}))}AlarmsDet(e="",t={start:"",end:""}){return new Promise((n=>{const a=e=>{n(e)},s=JSON.stringify({type:o.K.alarms_det,payload:{tagcam:e,dataFilter:t}});r.Z.bindAndsend({name:o.K.alarms_det,cb:a},{msg:s})}))}AlarmDet(e){return new Promise((t=>{const n=e=>{t(e)},a=JSON.stringify({type:o.K.alarm_det,payload:{idalarm:e}});r.Z.bindAndsend({name:o.K.alarm_det,cb:n},{msg:a})}))}managerAlarms(e,t=""){return new Promise((n=>{const a=e=>{n(e)},s=JSON.stringify({type:o.K.manager_alarms,payload:{typeMethod:e,tagcam:t}});r.Z.bindAndsend({name:o.K.manager_alarms,cb:a},{msg:s})}))}}const s=new a},1585:(e,t,n)=>{n.d(t,{Z:()=>c});var o=function(e,t,n,o){function r(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,a){function s(e){try{c(o.next(e))}catch(t){a(t)}}function i(e){try{c(o["throw"](e))}catch(t){a(t)}}function c(e){e.done?n(e.value):r(e.value).then(s,i)}c((o=o.apply(e,t||[])).next())}))};class r{constructor(){this._isconnect=!1,this.callbacks=new Map}get rawWebSocket(){return this.conn}connect(e,t){return o(this,void 0,void 0,(function*(){return new Promise(((n,o)=>{try{this.conn=new WebSocket(e,[t]),this.conn.onopen=()=>{this._isconnect=!0,n(!0)},this.conn.onerror=()=>{o(!1)},this.conn.onmessage=e=>{const{type:t,payload:n}=JSON.parse(e.data);this.dispatch(t,n)},this.conn.onclose=e=>{console.log("onclose the socket ev:",e),this._isconnect=!1}}catch(r){o(r)}}))}))}bind(e,t){this.callbacks.set(e,t)}dispatch(e,t){if(this.callbacks.has(e)){const n=this.callbacks.get(e);n&&n(t)}else console.log("no callback ")}send(e,t){if(!this._isconnect)return new Error("socket not connect");const n=JSON.stringify({type:e,payload:t});this.conn.send(n)}close(){this._isconnect&&this.conn.close()}}var a=n(5267),s=function(e,t,n,o){function r(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,a){function s(e){try{c(o.next(e))}catch(t){a(t)}}function i(e){try{c(o["throw"](e))}catch(t){a(t)}}function c(e){e.done?n(e.value):r(e.value).then(s,i)}c((o=o.apply(e,t||[])).next())}))};class i{constructor(){this.skt=new r}connect(e){return s(this,void 0,void 0,(function*(){return new Promise(((t,n)=>{try{if(this.skt._isconnect)return void t(!0);this.skt.bind("connect",(()=>{t(!0)})),this.skt.connect(`${a.u.wss}/apievent`,e).catch((e=>{n(e)}))}catch(o){console.log("apiWs connect error:",o),n(!1)}}))}))}disconnect(){this.skt.close()}bindAndsend(e,t){this.skt.bind(e.name,e.cb),void 0===t&&(t={name:e.name,msg:""}),this.skt.send(void 0===t.name?e.name:t.name,t.msg)}}const c=new i},3226:(e,t,n)=>{n.d(t,{C:()=>w});var o=n(1959),r=n(3457),a=n(52),s=n.n(a),i=n(5267),c=function(e,t,n,o){function r(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,a){function s(e){try{c(o.next(e))}catch(t){a(t)}}function i(e){try{c(o["throw"](e))}catch(t){a(t)}}function c(e){e.done?n(e.value):r(e.value).then(s,i)}c((o=o.apply(e,t||[])).next())}))};const l=(e,t,n)=>c(void 0,void 0,void 0,(function*(){void 0===n&&(n={baseURL:i.u.http,headers:{"Content-type":"application/json"}});const o=yield s().post(e,t,n);return o.data}));var d=n(6395),u=n(1585),m=function(e,t,n,o){function r(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,a){function s(e){try{c(o.next(e))}catch(t){a(t)}}function i(e){try{c(o["throw"](e))}catch(t){a(t)}}function c(e){e.done?n(e.value):r(e.value).then(s,i)}c((o=o.apply(e,t||[])).next())}))};const h=(0,o.qj)({isAuth:!1,user:void 0,isAuthWss:!1}),p=(0,o.qj)({success:!0,msgError:"",msgSuccess:""}),f=d.Z,v=()=>m(void 0,void 0,void 0,(function*(){var e;try{if(h.user){const t=yield u.Z.connect(null===(e=h.user)||void 0===e?void 0:e.token);h.isAuthWss=t}else h.isAuthWss=!1;return h.isAuthWss}catch(t){return h.isAuthWss=!1,!1}})),g=e=>m(void 0,void 0,void 0,(function*(){e&&f.set(i.u.cookie_base,JSON.stringify(e));const t=f.getItem(i.u.cookie_base);if(t){const e=JSON.parse(t);h.user=e,h.isAuth=!0;const n=yield v();n||y()}else y(),h.error="no user in local"})),y=()=>{f.remove(i.u.cookie_base),h.isAuth=!1,h.isAuthWss=!1,h.user=void 0,u.Z.disconnect()};g();const b=()=>{const e=(e,t,n)=>m(void 0,void 0,void 0,(function*(){var o;try{const a=yield r.Z.userUpdate(null===(o=h.user)||void 0===o?void 0:o.username,e,t,n);a.inError&&(p.msgError=a.msg),p.success=a.dataResult}catch(a){p.msgError="error catch update user",p.success=!1}})),t=(e,t)=>m(void 0,void 0,void 0,(function*(){try{const n=yield l("/login",{username:e,password:t});n.success&&n.data?yield g(n.data):(h.error=n.error,h.isAuth=!1)}catch(n){h.error="Login catch error",h.isAuth=!1,h.user=void 0}})),n=()=>m(void 0,void 0,void 0,(function*(){var e;try{yield l("/logout",{token:null===(e=h.user)||void 0===e?void 0:e.token}),y()}catch(t){}}));return{state:p,userState:h,postLogin:t,postLogout:n,updateUser:e}},w=b},2775:(e,t,n)=>{var o,r;n.d(t,{K:()=>o,N:()=>r}),function(e){e["user_update"]="userupdate",e["set_options"]="set_options",e["manager_alarms"]="manageralarms",e["alarms_count"]="alarmscount",e["alarms_det"]="alarmsdet",e["alarm_det"]="alarmdet"}(o||(o={})),function(e){e["Cam_List"]="camlist",e["Cam_Controll"]="camcontroll",e["Cam_Screenshot"]="camscreenshot",e["Cam_Setoption"]="setcamoption",e["radarCams"]="radarcams",e["saveRadarCam"]="saveradarcam"}(r||(r={}))},5267:(e,t,n)=>{n.d(t,{u:()=>o});const o={title:"NVS-C",http:`${window.location.protocol}//${window.location.hostname}:4005`,wss:`wss://${window.location.hostname}:4005`,cookie_base:"nvs_base",menu:[{title:"Wizard Setup",caption:"",icon:"mdi-radar",link:"/setup"},{title:"Dashbord",caption:"",icon:"mdi-view-dashboard-outline",link:"/"},{title:"Video Wall",caption:"",icon:"mdi-view-dashboard-outline",link:"/videowall"},{title:"Calendar Alarms",caption:"",icon:"mdi-home-alert-outline",link:"/calendaralarms"},{title:"Settings",caption:"",icon:"mdi-cogs",link:"/settings"}]}}},t={};function n(o){var r=t[o];if(void 0!==r)return r.exports;var a=t[o]={exports:{}};return e[o].call(a.exports,a,a.exports,n),a.exports}n.m=e,(()=>{var e=[];n.O=(t,o,r,a)=>{if(!o){var s=1/0;for(d=0;d<e.length;d++){for(var[o,r,a]=e[d],i=!0,c=0;c<o.length;c++)(!1&a||s>=a)&&Object.keys(n.O).every((e=>n.O[e](o[c])))?o.splice(c--,1):(i=!1,a<s&&(s=a));if(i){e.splice(d--,1);var l=r();void 0!==l&&(t=l)}}return t}a=a||0;for(var d=e.length;d>0&&e[d-1][2]>a;d--)e[d]=e[d-1];e[d]=[o,r,a]}})(),(()=>{n.n=e=>{var t=e&&e.__esModule?()=>e["default"]:()=>e;return n.d(t,{a:t}),t}})(),(()=>{n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})}})(),(()=>{n.f={},n.e=e=>Promise.all(Object.keys(n.f).reduce(((t,o)=>(n.f[o](e,t),t)),[]))})(),(()=>{n.u=e=>"js/"+e+"."+{100:"bc0f1739",103:"2225c69c",319:"da03bb3f",339:"2769ea96",459:"15fafb74",475:"24b70980",598:"b7a6028a",602:"c7c6742e",856:"f88097ca",941:"fec7d052"}[e]+".js"})(),(()=>{n.miniCssF=e=>"css/"+(736===e?"vendor":e)+"."+{459:"a9bb7872",602:"46ee5f99",736:"6e8506e5"}[e]+".css"})(),(()=>{n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()})(),(()=>{n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t)})(),(()=>{var e={},t="nvs-c:";n.l=(o,r,a,s)=>{if(e[o])e[o].push(r);else{var i,c;if(void 0!==a)for(var l=document.getElementsByTagName("script"),d=0;d<l.length;d++){var u=l[d];if(u.getAttribute("src")==o||u.getAttribute("data-webpack")==t+a){i=u;break}}i||(c=!0,i=document.createElement("script"),i.charset="utf-8",i.timeout=120,n.nc&&i.setAttribute("nonce",n.nc),i.setAttribute("data-webpack",t+a),i.src=o),e[o]=[r];var m=(t,n)=>{i.onerror=i.onload=null,clearTimeout(h);var r=e[o];if(delete e[o],i.parentNode&&i.parentNode.removeChild(i),r&&r.forEach((e=>e(n))),t)return t(n)},h=setTimeout(m.bind(null,void 0,{type:"timeout",target:i}),12e4);i.onerror=m.bind(null,i.onerror),i.onload=m.bind(null,i.onload),c&&document.head.appendChild(i)}}})(),(()=>{n.r=e=>{"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}})(),(()=>{n.p=""})(),(()=>{var e=(e,t,n,o)=>{var r=document.createElement("link");r.rel="stylesheet",r.type="text/css";var a=a=>{if(r.onerror=r.onload=null,"load"===a.type)n();else{var s=a&&("load"===a.type?"missing":a.type),i=a&&a.target&&a.target.href||t,c=new Error("Loading CSS chunk "+e+" failed.\n("+i+")");c.code="CSS_CHUNK_LOAD_FAILED",c.type=s,c.request=i,r.parentNode.removeChild(r),o(c)}};return r.onerror=r.onload=a,r.href=t,document.head.appendChild(r),r},t=(e,t)=>{for(var n=document.getElementsByTagName("link"),o=0;o<n.length;o++){var r=n[o],a=r.getAttribute("data-href")||r.getAttribute("href");if("stylesheet"===r.rel&&(a===e||a===t))return r}var s=document.getElementsByTagName("style");for(o=0;o<s.length;o++){r=s[o],a=r.getAttribute("data-href");if(a===e||a===t)return r}},o=o=>new Promise(((r,a)=>{var s=n.miniCssF(o),i=n.p+s;if(t(s,i))return r();e(o,i,r,a)})),r={143:0};n.f.miniCss=(e,t)=>{var n={459:1,602:1};r[e]?t.push(r[e]):0!==r[e]&&n[e]&&t.push(r[e]=o(e).then((()=>{r[e]=0}),(t=>{throw delete r[e],t})))}})(),(()=>{var e={143:0};n.f.j=(t,o)=>{var r=n.o(e,t)?e[t]:void 0;if(0!==r)if(r)o.push(r[2]);else{var a=new Promise(((n,o)=>r=e[t]=[n,o]));o.push(r[2]=a);var s=n.p+n.u(t),i=new Error,c=o=>{if(n.o(e,t)&&(r=e[t],0!==r&&(e[t]=void 0),r)){var a=o&&("load"===o.type?"missing":o.type),s=o&&o.target&&o.target.src;i.message="Loading chunk "+t+" failed.\n("+a+": "+s+")",i.name="ChunkLoadError",i.type=a,i.request=s,r[1](i)}};n.l(s,c,"chunk-"+t,t)}},n.O.j=t=>0===e[t];var t=(t,o)=>{var r,a,[s,i,c]=o,l=0;for(r in i)n.o(i,r)&&(n.m[r]=i[r]);if(c)var d=c(n);for(t&&t(o);l<s.length;l++)a=s[l],n.o(e,a)&&e[a]&&e[a][0](),e[s[l]]=0;return n.O(d)},o=self["webpackChunknvs_c"]=self["webpackChunknvs_c"]||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))})();var o=n.O(void 0,[736],(()=>n(1619)));o=n.O(o)})();