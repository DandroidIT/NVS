"use strict";(self["webpackChunknvs_c"]=self["webpackChunknvs_c"]||[]).push([[103],{8707:(e,t,s)=>{s.d(t,{Z:()=>i});var n=s(2775),o=s(1585);class a{getCams(){return new Promise((e=>{const t=t=>{e(t)};o.Z.bindAndsend({name:n.N.Cam_List,cb:t})}))}_objMove(e,t,s=100,o="0"){if("STOP"===t)return JSON.stringify({type:n.N.Cam_Controll,payload:{tagcam:e,cmd:"move_stop"}});const a={tagcam:e,speed:{x:"",y:"",z:""},timeout:s,cmd:"move",preset:o},i=a;return"UP"===t?i.speed={x:"0",y:"1.0",z:"0"}:"UPLEFT"===t?i.speed={x:"-1.0",y:"1.0",z:"0"}:"UPRIGHT"===t?i.speed={x:"1.0",y:"1.0",z:"0"}:"DOWN"===t?i.speed={x:"0",y:"-1.0",z:"0"}:"DOWNLEFT"===t?i.speed={x:"-1.0",y:"-1.0",z:"0"}:"DOWNRIGHT"===t?i.speed={x:"1.0",y:"-1.0",z:"0"}:"LEFT"===t?i.speed={x:"-1.0",y:"0",z:"0"}:"RIGHT"===t?i.speed={x:"1.0",y:"0",z:"0"}:"ZOOMIN"===t?i.speed={x:"0",y:"0",z:"1.0"}:"ZOOMOUT"===t?i.speed={x:"0",y:"0",z:"-1.0"}:"preset"!==t&&"save_preset"!==t||(i.speed={x:"1",y:"1",z:"1"},i.cmd=t),JSON.stringify({type:n.N.Cam_Controll,payload:i})}move(e,t,s="1",a=100){return new Promise((i=>{const r=e=>{i(e)};o.Z.bindAndsend({name:n.N.Cam_Controll,cb:r},{name:n.N.Cam_Controll,msg:this._objMove(e,t,a,s)})}))}screenshot(e){return new Promise((t=>{const s=e=>{t(e)},a=JSON.stringify({payload:{tagcam:e}});o.Z.bindAndsend({name:n.N.Cam_Screenshot,cb:s},{msg:a})}))}setOptionCam(e,t,s,a=!1){return new Promise((i=>{const r=JSON.stringify({payload:{tagcam:e,option:t,data:s,checkonly:a}});o.Z.bindAndsend({name:n.N.Cam_Setoption,cb:e=>{i(e)}},{msg:r})}))}probeCams(){return new Promise((e=>{const t=t=>{e(t)};o.Z.bindAndsend({name:n.N.radarCams,cb:t})}))}saveProbeCam(e){return new Promise((t=>{const s=JSON.stringify({payload:{cam:e}}),a=e=>{t(e)};o.Z.bindAndsend({name:n.N.saveRadarCam,cb:a},{msg:s})}))}}const i=new a},658:(e,t,s)=>{s.d(t,{Z:()=>u});var n=s(1959),o=s(8707),a=s(5267),i=function(e,t,s,n){function o(e){return e instanceof s?e:new s((function(t){t(e)}))}return new(s||(s=Promise))((function(s,a){function i(e){try{c(n.next(e))}catch(t){a(t)}}function r(e){try{c(n["throw"](e))}catch(t){a(t)}}function c(e){e.done?s(e.value):o(e.value).then(i,r)}c((n=n.apply(e,t||[])).next())}))};const r=s(4244).lW,c=(0,n.qj)({}),l=(0,n.qj)({success:!0,msgError:"",msgSuccess:""}),d=(0,n.qj)([]),m=()=>{const e=e=>`${a.u.wss}/stream/${e}`,t=(e=!1)=>i(void 0,void 0,void 0,(function*(){var t;if(e&&(c.list=[]),null===(t=c.list)||void 0===t?void 0:t.length)return;const s=yield o.Z.getCams();!1===s.inError?c.list=s.dataResult:l.msgError=s.msg,l.success=!s.inError})),s=e=>i(void 0,void 0,void 0,(function*(){var s;void 0===c.list&&(yield t(!0));const n=null===(s=c.list)||void 0===s?void 0:s.find((t=>(null===t||void 0===t?void 0:t.id)==e));if(n)return n})),m=e=>i(void 0,void 0,void 0,(function*(){yield u(e,"delete",!0),l.success&&(yield t(!0))})),u=(e,t,n,a=!1)=>i(void 0,void 0,void 0,(function*(){const i=yield o.Z.setOptionCam(e,t,n,a);!0===i.inError&&(l.msgError=i.msg),l.success=!i.inError;const r=yield s(e);r&&("live24"===t?r.liveH24=i.dataResult:"livemotion"===t&&(r.motion=i.dataResult))})),p=e=>i(void 0,void 0,void 0,(function*(){const t=yield o.Z.screenshot(e);if(!1===t.inError){const e=`data:image/jpg;base64, ${r.from(t.dataResult.data).toString("base64")}`;d.push(e)}else l.msgError=t.msg;l.success=!t.inError})),g=(e,t,s)=>i(void 0,void 0,void 0,(function*(){const n=yield o.Z.move(e,t,s);n.inError&&(l.msgError=n.msg),l.success=n.dataResult}));return{state:l,cams:(0,n.OT)(c),screenshots:d,urlplayer:e,getCam:s,getCams:t,deleteCam:m,getScreenshot:p,panMove:g,setOptions:u}},u=m},2391:(e,t,s)=>{s.d(t,{_:()=>a,K:()=>i});var n=s(4434),o=s(5616);const a=(e,t=1500)=>{e&&n.Z.create({icon:"mdi-information-variant",progress:!0,message:e,position:"top",timeout:t,textColor:"white",color:"",actions:[{icon:"close",color:"white"}]})},i=(e,t,s)=>{const n=new Date(e,t-1,s);return o.ZP.daysInMonth(n)}},3103:(e,t,s)=>{s.r(t),s.d(t,{default:()=>N});var n=s(3673),o=s(2323),a=s(8880);function i(e,t,s,i,r,c){const l=(0,n.up)("q-spinner-puff"),d=(0,n.up)("q-dialog"),m=(0,n.up)("q-icon"),u=(0,n.up)("q-card-section"),p=(0,n.up)("q-card"),g=(0,n.up)("q-btn"),v=(0,n.up)("q-item-section"),f=(0,n.up)("q-item"),w=(0,n.up)("q-item-label"),y=(0,n.up)("q-page");return(0,n.wg)(),(0,n.j4)(y,{class:"bg-primary q-pa-sm"},{default:(0,n.w5)((()=>[(0,n.Wm)(d,{modelValue:e.state.isawait,"onUpdate:modelValue":t[1]||(t[1]=t=>e.state.isawait=t),persistent:"","transition-show":"scale","transition-hide":"scale"},{default:(0,n.w5)((()=>[(0,n.Wm)(l,{color:"red",size:"20em"})])),_:1},8,["modelValue"]),(0,n.Wm)(p,{dark:"",class:"bg-transparent no-shadow no-border"},{default:(0,n.w5)((()=>{var t;return[e.state.success?(0,n.kq)("",!0):((0,n.wg)(),(0,n.j4)(p,{key:0,dark:""},{default:(0,n.w5)((()=>[(0,n.Wm)(u,null,{default:(0,n.w5)((()=>[(0,n.Wm)(m,{name:"mdi-alert",color:"red",size:"34px"})])),_:1}),(0,n.Wm)(u,{class:"q-pt-none"},{default:(0,n.w5)((()=>[(0,n.Uk)((0,o.zw)(e.state.msgError),1)])),_:1})])),_:1})),(0,n.wy)((0,n.Wm)(f,{dark:"",class:"q-pa-none q-ml-xs"},{default:(0,n.w5)((()=>[(0,n.Wm)(v,{side:""},{default:(0,n.w5)((()=>[(0,n.Wm)(g,{label:"Goto Radar",align:"left",icon:"mdi-radar",size:"55px",color:"orange",flat:"",padding:"xs",class:"full-width text-capitalize",to:"setup"})])),_:1})])),_:1},512),[[a.F8,0===(null===(t=e.cams.list)||void 0===t?void 0:t.length)]]),((0,n.wg)(!0),(0,n.j4)(n.HY,null,(0,n.Ko)(e.cams.list,((t,s)=>{var i;return(0,n.wy)(((0,n.wg)(),(0,n.j4)(f,{dark:"",class:"q-pa-none q-ml-xs",key:s,clickable:""},{default:(0,n.w5)((()=>[(0,n.Wm)(v,{side:"",class:"q-pa-lg q-mr-none",style:{"background-color":"#464646"}},{default:(0,n.w5)((()=>[(0,n.Wm)(m,{name:"mdi-cctv",color:"orange",size:"34px"}),(0,n.wy)((0,n.Wm)(m,{name:"sync_problem",color:"white",size:"24px"},null,512),[[a.F8,!0===t.inerror]])])),_:2},1024),(0,n.Wm)(v,{onClick:s=>!1===t.inerror?e.clickgotoCam(t.id):null,class:"q-pa-md q-ml-none text-white"},{default:(0,n.w5)((()=>[(0,n.Wm)(w,{class:"text-white text-weight-bolder"},{default:(0,n.w5)((()=>[(0,n.Uk)((0,o.zw)(t.name)+" ("+(0,o.zw)(t.id)+")",1)])),_:2},1024)])),_:2},1032,["onClick"]),(0,n.Wm)(v,{side:""},{default:(0,n.w5)((()=>[(0,n.Wm)(g,{onClick:s=>e.clickDeleteCam(t.id),flat:"",dense:"",size:"lg",color:"orange",icon:"mdi-delete",class:"t"},null,8,["onClick"])])),_:2},1024)])),_:2},1536)),[[a.F8,null===(i=e.cams.list)||void 0===i?void 0:i.length]])})),128))]})),_:1})])),_:1})}var r=s(1959),c=s(658),l=s(2391),d=function(e,t,s,n){function o(e){return e instanceof s?e:new s((function(t){t(e)}))}return new(s||(s=Promise))((function(s,a){function i(e){try{c(n.next(e))}catch(t){a(t)}}function r(e){try{c(n["throw"](e))}catch(t){a(t)}}function c(e){e.done?s(e.value):o(e.value).then(i,r)}c((n=n.apply(e,t||[])).next())}))};const{state:m,cams:u,getCams:p,deleteCam:g}=(0,c.Z)(),v=e=>{const t=(0,r.qj)({isawait:!1,success:!0,msgError:"",msgSuccess:""});(0,n.YP)(t,(e=>{!e.isawait&&e.msgSuccess&&((0,l._)(e.msgSuccess),e.msgSuccess="")})),(0,n.bv)((()=>d(void 0,void 0,void 0,(function*(){t.isawait=!0,yield p(),m.success?t.msgSuccess="Cams load":t.msgError=m.msgError,t.success=m.success,t.isawait=!1}))));const s=t=>{e.push({path:`/cam/${t}`})},o=e=>d(void 0,void 0,void 0,(function*(){t.isawait=!0,yield g(e),t.success=m.success,t.isawait=!1}));return{state:(0,r.OT)(t),cams:u,clickgotoCam:s,clickDeleteCam:o}},f=v;var w=s(9582);const y=(0,n.aZ)({name:"pDashboard",setup(){const{state:e,cams:t,clickgotoCam:s,clickDeleteCam:n}=f((0,w.tv)());return{state:e,cams:t,clickgotoCam:s,clickDeleteCam:n}}});var C=s(4379),h=s(6778),b=s(8430),Z=s(151),_=s(5589),k=s(4554),x=s(3414),q=s(2035),z=s(4607),W=s(7011),E=s(2350),O=s(7518),S=s.n(O);y.render=i;const N=y;S()(y,"components",{QPage:C.Z,QDialog:h.Z,QSpinnerPuff:b.Z,QCard:Z.Z,QCardSection:_.Z,QIcon:k.Z,QItem:x.Z,QItemSection:q.Z,QBtn:z.Z,QList:W.Z,QItemLabel:E.Z})}}]);