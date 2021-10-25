"use strict";(self["webpackChunknvs_c"]=self["webpackChunknvs_c"]||[]).push([[602],{8707:(e,s,t)=>{t.d(s,{Z:()=>n});var o=t(2775),i=t(1585);class a{getCams(){return new Promise((e=>{const s=s=>{e(s)};i.Z.bindAndsend({name:o.N.Cam_List,cb:s})}))}_objMove(e,s,t=100,i="0"){if("STOP"===s)return JSON.stringify({type:o.N.Cam_Controll,payload:{tagcam:e,cmd:"move_stop"}});const a={tagcam:e,speed:{x:"",y:"",z:""},timeout:t,cmd:"move",preset:i},n=a;return"UP"===s?n.speed={x:"0",y:"1.0",z:"0"}:"UPLEFT"===s?n.speed={x:"-1.0",y:"1.0",z:"0"}:"UPRIGHT"===s?n.speed={x:"1.0",y:"1.0",z:"0"}:"DOWN"===s?n.speed={x:"0",y:"-1.0",z:"0"}:"DOWNLEFT"===s?n.speed={x:"-1.0",y:"-1.0",z:"0"}:"DOWNRIGHT"===s?n.speed={x:"1.0",y:"-1.0",z:"0"}:"LEFT"===s?n.speed={x:"-1.0",y:"0",z:"0"}:"RIGHT"===s?n.speed={x:"1.0",y:"0",z:"0"}:"ZOOMIN"===s?n.speed={x:"0",y:"0",z:"1.0"}:"ZOOMOUT"===s?n.speed={x:"0",y:"0",z:"-1.0"}:"preset"!==s&&"save_preset"!==s||(n.speed={x:"1",y:"1",z:"1"},n.cmd=s),JSON.stringify({type:o.N.Cam_Controll,payload:n})}move(e,s,t="1",a=100){return new Promise((n=>{const c=e=>{n(e)};i.Z.bindAndsend({name:o.N.Cam_Controll,cb:c},{name:o.N.Cam_Controll,msg:this._objMove(e,s,a,t)})}))}screenshot(e){return new Promise((s=>{const t=e=>{s(e)},a=JSON.stringify({payload:{tagcam:e}});i.Z.bindAndsend({name:o.N.Cam_Screenshot,cb:t},{msg:a})}))}setOptionCam(e,s,t,a=!1){return new Promise((n=>{const c=JSON.stringify({payload:{tagcam:e,option:s,data:t,checkonly:a}});i.Z.bindAndsend({name:o.N.Cam_Setoption,cb:e=>{n(e)}},{msg:c})}))}probeCams(){return new Promise((e=>{const s=s=>{e(s)};i.Z.bindAndsend({name:o.N.radarCams,cb:s})}))}saveProbeCam(e){return new Promise((s=>{const t=JSON.stringify({payload:{cam:e}}),a=e=>{s(e)};i.Z.bindAndsend({name:o.N.saveRadarCam,cb:a},{msg:t})}))}}const n=new a},658:(e,s,t)=>{t.d(s,{Z:()=>u});var o=t(1959),i=t(8707),a=t(5267),n=function(e,s,t,o){function i(e){return e instanceof t?e:new t((function(s){s(e)}))}return new(t||(t=Promise))((function(t,a){function n(e){try{l(o.next(e))}catch(s){a(s)}}function c(e){try{l(o["throw"](e))}catch(s){a(s)}}function l(e){e.done?t(e.value):i(e.value).then(n,c)}l((o=o.apply(e,s||[])).next())}))};const c=t(4244).lW,l=(0,o.qj)({}),d=(0,o.qj)({success:!0,msgError:"",msgSuccess:""}),r=(0,o.qj)([]),m=()=>{const e=e=>`${a.u.wss}/stream/${e}`,s=(e=!1)=>n(void 0,void 0,void 0,(function*(){var s;if(e&&(l.list=[]),null===(s=l.list)||void 0===s?void 0:s.length)return;const t=yield i.Z.getCams();!1===t.inError?l.list=t.dataResult:d.msgError=t.msg,d.success=!t.inError})),t=e=>n(void 0,void 0,void 0,(function*(){var t;void 0===l.list&&(yield s(!0));const o=null===(t=l.list)||void 0===t?void 0:t.find((s=>(null===s||void 0===s?void 0:s.id)==e));if(o)return o})),m=e=>n(void 0,void 0,void 0,(function*(){yield u(e,"delete",!0),d.success&&(yield s(!0))})),u=(e,s,o,a=!1)=>n(void 0,void 0,void 0,(function*(){const n=yield i.Z.setOptionCam(e,s,o,a);!0===n.inError&&(d.msgError=n.msg),d.success=!n.inError;const c=yield t(e);c&&("live24"===s?c.liveH24=n.dataResult:"livemotion"===s&&(c.motion=n.dataResult))})),v=e=>n(void 0,void 0,void 0,(function*(){const s=yield i.Z.screenshot(e);if(!1===s.inError){const e=`data:image/jpg;base64, ${c.from(s.dataResult.data).toString("base64")}`;r.push(e)}else d.msgError=s.msg;d.success=!s.inError})),p=(e,s,t)=>n(void 0,void 0,void 0,(function*(){const o=yield i.Z.move(e,s,t);o.inError&&(d.msgError=o.msg),d.success=o.dataResult}));return{state:d,cams:(0,o.OT)(l),screenshots:r,urlplayer:e,getCam:t,getCams:s,deleteCam:m,getScreenshot:v,panMove:p,setOptions:u}},u=m},3951:(e,s,t)=>{t.d(s,{Z:()=>z});var o=t(3673);const i={class:"row justify-center"},a={class:"col-xs-3"},n={class:"col-xs-3"},c={class:"col-xs-3"},l={class:"col-xs-3"},d={class:"row justify-center"},r={class:"col-xs-3"},m={class:"col-xs-3"},u={class:"col-xs-3"},v={class:"col-xs-3"},p={class:"row justify-center"},f={class:"col-xs-3"},g={class:"col-xs-3"},w={class:"col-xs-3"},x={class:"col-xs-3"};function y(e,s,t,y,h,W){const C=(0,o.up)("q-btn");return(0,o.wg)(),(0,o.j4)(o.HY,null,[(0,o.Wm)("div",i,[(0,o.Wm)("div",a,[(0,o.Wm)(C,{icon:"mdi-arrow-top-left-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[1]||(s[1]=s=>e.clickCmd("UPLEFT"))})]),(0,o.Wm)("div",n,[(0,o.Wm)(C,{icon:"mdi-arrow-up-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[2]||(s[2]=s=>e.clickCmd("UP"))})]),(0,o.Wm)("div",c,[(0,o.Wm)(C,{icon:"mdi-arrow-top-right-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[3]||(s[3]=s=>e.clickCmd("UPRIGHT"))})]),(0,o.Wm)("div",l,[(0,o.Wm)(C,{icon:"mdi-plus-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[4]||(s[4]=s=>e.clickCmd("ZOOMIN"))})])]),(0,o.Wm)("div",d,[(0,o.Wm)("div",r,[(0,o.Wm)(C,{icon:"mdi-arrow-left-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[5]||(s[5]=s=>e.clickCmd("LEFT"))})]),(0,o.Wm)("div",m,[(0,o.Wm)(C,{icon:"mdi-home",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[6]||(s[6]=s=>e.clickCmd("preset"))})]),(0,o.Wm)("div",u,[(0,o.Wm)(C,{icon:"mdi-arrow-right-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[7]||(s[7]=s=>e.clickCmd("RIGHT"))})]),(0,o.Wm)("div",v,[(0,o.Wm)(C,{icon:"mdi-camera",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[8]||(s[8]=s=>e.clickCmd("screenshot"))})])]),(0,o.Wm)("div",p,[(0,o.Wm)("div",f,[(0,o.Wm)(C,{icon:"mdi-arrow-bottom-left-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[9]||(s[9]=s=>e.clickCmd("DOWNLEFT"))})]),(0,o.Wm)("div",g,[(0,o.Wm)(C,{icon:"mdi-arrow-down-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[10]||(s[10]=s=>e.clickCmd("DOWN"))})]),(0,o.Wm)("div",w,[(0,o.Wm)(C,{icon:"mdi-arrow-bottom-right-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[11]||(s[11]=s=>e.clickCmd("DOWNRIGHT"))})]),(0,o.Wm)("div",x,[(0,o.Wm)(C,{icon:"mdi-minus-thick",color:"orange",flat:"",size:"xl",padding:"xs",class:"full-width text-capitalize",onMousedown:s[12]||(s[12]=s=>e.clickCmd("ZOOMOUT"))})])])],64)}const h=(0,o.aZ)({name:"ComponentJoyPad",emits:["directioncam"],setup(e,{emit:s}){const t=e=>{s("directioncam",e)};return{clickCmd:t}}});var W=t(4607),C=t(7518),k=t.n(C);h.render=y;const z=h;k()(h,"components",{QBtn:W.Z})},4602:(e,s,t)=>{t.r(s),t.d(s,{default:()=>S});var o=t(3673),i=t(2323);const a=(0,o.HX)("data-v-19073520");(0,o.dD)("data-v-19073520");const n={class:"row q-col-gutter-xs"},c={class:"row items-center no-wrap"},l={class:"col"},d={class:"text-h6"},r={class:"col-auto"};(0,o.Cn)();const m=a(((e,s,t,m,u,v)=>{const p=(0,o.up)("q-spinner-puff"),f=(0,o.up)("q-dialog"),g=(0,o.up)("q-radio"),w=(0,o.up)("q-btn"),x=(0,o.up)("q-item-section"),y=(0,o.up)("q-item"),h=(0,o.up)("q-list"),W=(0,o.up)("q-menu"),C=(0,o.up)("q-card-section"),k=(0,o.up)("q-card"),z=(0,o.up)("joy-pad"),Z=(0,o.up)("q-page");return(0,o.wg)(),(0,o.j4)(Z,{class:"bg-primary q-pa-sm"},{default:a((()=>[(0,o.Wm)(f,{modelValue:e.state.isawait,"onUpdate:modelValue":s[1]||(s[1]=s=>e.state.isawait=s),persistent:"","transition-show":"scale","transition-hide":"scale"},{default:a((()=>[(0,o.Wm)(p,{color:"red",size:"20em"})])),_:1},8,["modelValue"]),(0,o.Wm)("div",n,[((0,o.wg)(!0),(0,o.j4)(o.HY,null,(0,o.Ko)(e.cams.list,((t,n)=>((0,o.wg)(),(0,o.j4)("div",{class:"col-lg-6 col-md-6 col-sm-6 col-xs-12",key:n},[(0,o.Wm)(k,{class:"bg-primary active"},{default:a((()=>[(0,o.Wm)(C,{class:"bg-dark text-center text-white",style:{padding:"0px"}},{default:a((()=>[(0,o.Wm)("div",c,[(0,o.Wm)("div",l,[(0,o.Wm)("div",d,(0,i.zw)(`${t.name}`),1)]),(0,o.Wm)("div",r,[(0,o.Wm)(g,{onClick:s=>e.setCam(t),modelValue:e.selection,"onUpdate:modelValue":s[2]||(s[2]=s=>e.selection=s),val:t.id,label:"",color:"red"},null,8,["onClick","modelValue","val"]),(0,o.Wm)(w,{color:"grey-7",round:"",flat:"",icon:"more_vert"},{default:a((()=>[(0,o.Wm)(W,{cover:"","auto-close":""},{default:a((()=>[(0,o.Wm)(h,null,{default:a((()=>[(0,o.Wm)(y,{clickable:""},{default:a((()=>[(0,o.Wm)(x,null,{default:a((()=>[(0,o.Wm)(w,{flat:"",round:"",color:"teal",icon:"mdi-cctv",to:"/cam/"+t.id},null,8,["to"])])),_:2},1024)])),_:2},1024)])),_:2},1024)])),_:2},1024)])),_:2},1024)])])])),_:2},1024),(0,o.Wm)(C,{class:"q-pa-none"},{default:a((()=>[(0,o.Wm)("canvas",{class:[[e.selection===t.id?"select":""],"full-width"],id:"canvas"+t.id,ref:s=>e.listCanvas[n]=s},null,10,["id"])])),_:2},1024)])),_:2},1024)])))),128))]),(0,o.Wm)("div",{class:[""===e.selection?"disabled":""]},[(0,o.Wm)(z,{onDirectioncam:e.clickMove},null,8,["onDirectioncam"])],2)])),_:1})}));var u=t(1959),v=t(3226),p=t(658),f=t(6213),g=t.n(f),w=function(e,s,t,o){function i(e){return e instanceof t?e:new t((function(s){s(e)}))}return new(t||(t=Promise))((function(t,a){function n(e){try{l(o.next(e))}catch(s){a(s)}}function c(e){try{l(o["throw"](e))}catch(s){a(s)}}function l(e){e.done?t(e.value):i(e.value).then(n,c)}l((o=o.apply(e,s||[])).next())}))};const x=()=>{const{userState:e}=(0,v.C)(),{cams:s,urlplayer:t,getScreenshot:i,panMove:a}=(0,p.Z)(),n=(0,u.qj)({isawait:!1,success:!0,msgError:"",msgSuccess:""}),c=(0,u.qj)([{val:{destroy:()=>{},volume:10}}]),l=(0,u.iH)([]),d=(0,u.iH)(),r=(0,u.iH)("");(0,o.bv)((()=>{n.isawait=!0,m(),n.isawait=!1}));const m=()=>{var o;null===(o=s.list)||void 0===o||o.map((s=>{var o;const i=document.getElementById(`canvas${s.id}`),a=new(g().Player)(t(s.id),{canvas:i,protocols:null===(o=e.user)||void 0===o?void 0:o.token});c.push({val:a})}))},f=e=>{d.value=e,r.value=e.id},x=(e,s)=>w(void 0,void 0,void 0,(function*(){d.value&&("screenshot"===e?(n.isawait=!0,yield i(d.value.id),n.isawait=!1):yield a(d.value.id,e,s))}));return(0,o.Jd)((()=>{try{c.forEach((e=>{e.val.destroy()}))}catch(e){console.log("error in camview beforeDestroy:",e)}})),{state:n,selection:r,cam:(0,o.Fl)((()=>d)),cams:s,listCanvas:l,setCam:f,clickMove:x}},y=x;var h=t(3951);const W=(0,o.aZ)({name:"pVideoWall",components:{joyPad:h.Z},setup(){const{state:e,cams:s,listCanvas:t,setCam:o,clickMove:i,selection:a}=y();return{selection:a,state:e,cams:s,listCanvas:t,setCam:o,clickMove:i}}});var C=t(4379),k=t(6778),z=t(8430),Z=t(151),b=t(5589),O=t(7991),_=t(4607),M=t(811),N=t(7011),E=t(3414),P=t(2035),q=t(7518),j=t.n(q);W.render=m,W.__scopeId="data-v-19073520";const S=W;j()(W,"components",{QPage:C.Z,QDialog:k.Z,QSpinnerPuff:z.Z,QCard:Z.Z,QCardSection:b.Z,QRadio:O.Z,QBtn:_.Z,QMenu:M.Z,QList:N.Z,QItem:E.Z,QItemSection:P.Z})}}]);