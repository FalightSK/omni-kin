(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();function q0(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Gp={exports:{}},dl={},Vp={exports:{}},We={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var To=Symbol.for("react.element"),Y0=Symbol.for("react.portal"),$0=Symbol.for("react.fragment"),K0=Symbol.for("react.strict_mode"),Z0=Symbol.for("react.profiler"),J0=Symbol.for("react.provider"),Q0=Symbol.for("react.context"),ev=Symbol.for("react.forward_ref"),tv=Symbol.for("react.suspense"),nv=Symbol.for("react.memo"),iv=Symbol.for("react.lazy"),sd=Symbol.iterator;function rv(t){return t===null||typeof t!="object"?null:(t=sd&&t[sd]||t["@@iterator"],typeof t=="function"?t:null)}var Wp={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Xp=Object.assign,jp={};function ys(t,e,n){this.props=t,this.context=e,this.refs=jp,this.updater=n||Wp}ys.prototype.isReactComponent={};ys.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};ys.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function qp(){}qp.prototype=ys.prototype;function $u(t,e,n){this.props=t,this.context=e,this.refs=jp,this.updater=n||Wp}var Ku=$u.prototype=new qp;Ku.constructor=$u;Xp(Ku,ys.prototype);Ku.isPureReactComponent=!0;var od=Array.isArray,Yp=Object.prototype.hasOwnProperty,Zu={current:null},$p={key:!0,ref:!0,__self:!0,__source:!0};function Kp(t,e,n){var i,r={},s=null,o=null;if(e!=null)for(i in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)Yp.call(e,i)&&!$p.hasOwnProperty(i)&&(r[i]=e[i]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var l=Array(a),c=0;c<a;c++)l[c]=arguments[c+2];r.children=l}if(t&&t.defaultProps)for(i in a=t.defaultProps,a)r[i]===void 0&&(r[i]=a[i]);return{$$typeof:To,type:t,key:s,ref:o,props:r,_owner:Zu.current}}function sv(t,e){return{$$typeof:To,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Ju(t){return typeof t=="object"&&t!==null&&t.$$typeof===To}function ov(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var ad=/\/+/g;function Ol(t,e){return typeof t=="object"&&t!==null&&t.key!=null?ov(""+t.key):e.toString(36)}function Ma(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case To:case Y0:o=!0}}if(o)return o=t,r=r(o),t=i===""?"."+Ol(o,0):i,od(r)?(n="",t!=null&&(n=t.replace(ad,"$&/")+"/"),Ma(r,e,n,"",function(c){return c})):r!=null&&(Ju(r)&&(r=sv(r,n+(!r.key||o&&o.key===r.key?"":(""+r.key).replace(ad,"$&/")+"/")+t)),e.push(r)),1;if(o=0,i=i===""?".":i+":",od(t))for(var a=0;a<t.length;a++){s=t[a];var l=i+Ol(s,a);o+=Ma(s,e,n,l,r)}else if(l=rv(t),typeof l=="function")for(t=l.call(t),a=0;!(s=t.next()).done;)s=s.value,l=i+Ol(s,a++),o+=Ma(s,e,n,l,r);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function Uo(t,e,n){if(t==null)return t;var i=[],r=0;return Ma(t,i,"","",function(s){return e.call(n,s,r++)}),i}function av(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var Zt={current:null},Ea={transition:null},lv={ReactCurrentDispatcher:Zt,ReactCurrentBatchConfig:Ea,ReactCurrentOwner:Zu};function Zp(){throw Error("act(...) is not supported in production builds of React.")}We.Children={map:Uo,forEach:function(t,e,n){Uo(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Uo(t,function(){e++}),e},toArray:function(t){return Uo(t,function(e){return e})||[]},only:function(t){if(!Ju(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};We.Component=ys;We.Fragment=$0;We.Profiler=Z0;We.PureComponent=$u;We.StrictMode=K0;We.Suspense=tv;We.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=lv;We.act=Zp;We.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var i=Xp({},t.props),r=t.key,s=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=Zu.current),e.key!==void 0&&(r=""+e.key),t.type&&t.type.defaultProps)var a=t.type.defaultProps;for(l in e)Yp.call(e,l)&&!$p.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&a!==void 0?a[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){a=Array(l);for(var c=0;c<l;c++)a[c]=arguments[c+2];i.children=a}return{$$typeof:To,type:t.type,key:r,ref:s,props:i,_owner:o}};We.createContext=function(t){return t={$$typeof:Q0,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:J0,_context:t},t.Consumer=t};We.createElement=Kp;We.createFactory=function(t){var e=Kp.bind(null,t);return e.type=t,e};We.createRef=function(){return{current:null}};We.forwardRef=function(t){return{$$typeof:ev,render:t}};We.isValidElement=Ju;We.lazy=function(t){return{$$typeof:iv,_payload:{_status:-1,_result:t},_init:av}};We.memo=function(t,e){return{$$typeof:nv,type:t,compare:e===void 0?null:e}};We.startTransition=function(t){var e=Ea.transition;Ea.transition={};try{t()}finally{Ea.transition=e}};We.unstable_act=Zp;We.useCallback=function(t,e){return Zt.current.useCallback(t,e)};We.useContext=function(t){return Zt.current.useContext(t)};We.useDebugValue=function(){};We.useDeferredValue=function(t){return Zt.current.useDeferredValue(t)};We.useEffect=function(t,e){return Zt.current.useEffect(t,e)};We.useId=function(){return Zt.current.useId()};We.useImperativeHandle=function(t,e,n){return Zt.current.useImperativeHandle(t,e,n)};We.useInsertionEffect=function(t,e){return Zt.current.useInsertionEffect(t,e)};We.useLayoutEffect=function(t,e){return Zt.current.useLayoutEffect(t,e)};We.useMemo=function(t,e){return Zt.current.useMemo(t,e)};We.useReducer=function(t,e,n){return Zt.current.useReducer(t,e,n)};We.useRef=function(t){return Zt.current.useRef(t)};We.useState=function(t){return Zt.current.useState(t)};We.useSyncExternalStore=function(t,e,n){return Zt.current.useSyncExternalStore(t,e,n)};We.useTransition=function(){return Zt.current.useTransition()};We.version="18.3.1";Vp.exports=We;var Re=Vp.exports;const cv=q0(Re);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var uv=Re,fv=Symbol.for("react.element"),dv=Symbol.for("react.fragment"),hv=Object.prototype.hasOwnProperty,pv=uv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,mv={key:!0,ref:!0,__self:!0,__source:!0};function Jp(t,e,n){var i,r={},s=null,o=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(i in e)hv.call(e,i)&&!mv.hasOwnProperty(i)&&(r[i]=e[i]);if(t&&t.defaultProps)for(i in e=t.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:fv,type:t,key:s,ref:o,props:r,_owner:pv.current}}dl.Fragment=dv;dl.jsx=Jp;dl.jsxs=Jp;Gp.exports=dl;var L=Gp.exports,jc={},Qp={exports:{}},gn={},em={exports:{}},tm={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(D,F){var k=D.length;D.push(F);e:for(;0<k;){var $=k-1>>>1,K=D[$];if(0<r(K,F))D[$]=F,D[k]=K,k=$;else break e}}function n(D){return D.length===0?null:D[0]}function i(D){if(D.length===0)return null;var F=D[0],k=D.pop();if(k!==F){D[0]=k;e:for(var $=0,K=D.length,j=K>>>1;$<j;){var Z=2*($+1)-1,le=D[Z],de=Z+1,me=D[de];if(0>r(le,k))de<K&&0>r(me,le)?(D[$]=me,D[de]=k,$=de):(D[$]=le,D[Z]=k,$=Z);else if(de<K&&0>r(me,k))D[$]=me,D[de]=k,$=de;else break e}}return F}function r(D,F){var k=D.sortIndex-F.sortIndex;return k!==0?k:D.id-F.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var o=Date,a=o.now();t.unstable_now=function(){return o.now()-a}}var l=[],c=[],f=1,h=null,d=3,p=!1,x=!1,_=!1,m=typeof setTimeout=="function"?setTimeout:null,u=typeof clearTimeout=="function"?clearTimeout:null,v=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function g(D){for(var F=n(c);F!==null;){if(F.callback===null)i(c);else if(F.startTime<=D)i(c),F.sortIndex=F.expirationTime,e(l,F);else break;F=n(c)}}function y(D){if(_=!1,g(D),!x)if(n(l)!==null)x=!0,X(R);else{var F=n(c);F!==null&&Y(y,F.startTime-D)}}function R(D,F){x=!1,_&&(_=!1,u(U),U=-1),p=!0;var k=d;try{for(g(F),h=n(l);h!==null&&(!(h.expirationTime>F)||D&&!W());){var $=h.callback;if(typeof $=="function"){h.callback=null,d=h.priorityLevel;var K=$(h.expirationTime<=F);F=t.unstable_now(),typeof K=="function"?h.callback=K:h===n(l)&&i(l),g(F)}else i(l);h=n(l)}if(h!==null)var j=!0;else{var Z=n(c);Z!==null&&Y(y,Z.startTime-F),j=!1}return j}finally{h=null,d=k,p=!1}}var A=!1,C=null,U=-1,M=5,T=-1;function W(){return!(t.unstable_now()-T<M)}function q(){if(C!==null){var D=t.unstable_now();T=D;var F=!0;try{F=C(!0,D)}finally{F?ie():(A=!1,C=null)}}else A=!1}var ie;if(typeof v=="function")ie=function(){v(q)};else if(typeof MessageChannel<"u"){var P=new MessageChannel,O=P.port2;P.port1.onmessage=q,ie=function(){O.postMessage(null)}}else ie=function(){m(q,0)};function X(D){C=D,A||(A=!0,ie())}function Y(D,F){U=m(function(){D(t.unstable_now())},F)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(D){D.callback=null},t.unstable_continueExecution=function(){x||p||(x=!0,X(R))},t.unstable_forceFrameRate=function(D){0>D||125<D?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):M=0<D?Math.floor(1e3/D):5},t.unstable_getCurrentPriorityLevel=function(){return d},t.unstable_getFirstCallbackNode=function(){return n(l)},t.unstable_next=function(D){switch(d){case 1:case 2:case 3:var F=3;break;default:F=d}var k=d;d=F;try{return D()}finally{d=k}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(D,F){switch(D){case 1:case 2:case 3:case 4:case 5:break;default:D=3}var k=d;d=D;try{return F()}finally{d=k}},t.unstable_scheduleCallback=function(D,F,k){var $=t.unstable_now();switch(typeof k=="object"&&k!==null?(k=k.delay,k=typeof k=="number"&&0<k?$+k:$):k=$,D){case 1:var K=-1;break;case 2:K=250;break;case 5:K=1073741823;break;case 4:K=1e4;break;default:K=5e3}return K=k+K,D={id:f++,callback:F,priorityLevel:D,startTime:k,expirationTime:K,sortIndex:-1},k>$?(D.sortIndex=k,e(c,D),n(l)===null&&D===n(c)&&(_?(u(U),U=-1):_=!0,Y(y,k-$))):(D.sortIndex=K,e(l,D),x||p||(x=!0,X(R))),D},t.unstable_shouldYield=W,t.unstable_wrapCallback=function(D){var F=d;return function(){var k=d;d=F;try{return D.apply(this,arguments)}finally{d=k}}}})(tm);em.exports=tm;var gv=em.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var vv=Re,mn=gv;function ee(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var nm=new Set,io={};function Mr(t,e){cs(t,e),cs(t+"Capture",e)}function cs(t,e){for(io[t]=e,t=0;t<e.length;t++)nm.add(e[t])}var fi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),qc=Object.prototype.hasOwnProperty,_v=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,ld={},cd={};function xv(t){return qc.call(cd,t)?!0:qc.call(ld,t)?!1:_v.test(t)?cd[t]=!0:(ld[t]=!0,!1)}function yv(t,e,n,i){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function Sv(t,e,n,i){if(e===null||typeof e>"u"||yv(t,e,n,i))return!0;if(i)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function Jt(t,e,n,i,r,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var It={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){It[t]=new Jt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];It[e]=new Jt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){It[t]=new Jt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){It[t]=new Jt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){It[t]=new Jt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){It[t]=new Jt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){It[t]=new Jt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){It[t]=new Jt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){It[t]=new Jt(t,5,!1,t.toLowerCase(),null,!1,!1)});var Qu=/[\-:]([a-z])/g;function ef(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(Qu,ef);It[e]=new Jt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(Qu,ef);It[e]=new Jt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(Qu,ef);It[e]=new Jt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){It[t]=new Jt(t,1,!1,t.toLowerCase(),null,!1,!1)});It.xlinkHref=new Jt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){It[t]=new Jt(t,1,!1,t.toLowerCase(),null,!0,!0)});function tf(t,e,n,i){var r=It.hasOwnProperty(e)?It[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(Sv(e,n,r,i)&&(n=null),i||r===null?xv(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):r.mustUseProperty?t[r.propertyName]=n===null?r.type===3?!1:"":n:(e=r.attributeName,i=r.attributeNamespace,n===null?t.removeAttribute(e):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,i?t.setAttributeNS(i,e,n):t.setAttribute(e,n))))}var gi=vv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Io=Symbol.for("react.element"),Hr=Symbol.for("react.portal"),Gr=Symbol.for("react.fragment"),nf=Symbol.for("react.strict_mode"),Yc=Symbol.for("react.profiler"),im=Symbol.for("react.provider"),rm=Symbol.for("react.context"),rf=Symbol.for("react.forward_ref"),$c=Symbol.for("react.suspense"),Kc=Symbol.for("react.suspense_list"),sf=Symbol.for("react.memo"),Ti=Symbol.for("react.lazy"),sm=Symbol.for("react.offscreen"),ud=Symbol.iterator;function Rs(t){return t===null||typeof t!="object"?null:(t=ud&&t[ud]||t["@@iterator"],typeof t=="function"?t:null)}var ut=Object.assign,kl;function Hs(t){if(kl===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);kl=e&&e[1]||""}return`
`+kl+t}var zl=!1;function Bl(t,e){if(!t||zl)return"";zl=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var i=c}Reflect.construct(t,[],e)}else{try{e.call()}catch(c){i=c}t.call(e.prototype)}else{try{throw Error()}catch(c){i=c}t()}}catch(c){if(c&&i&&typeof c.stack=="string"){for(var r=c.stack.split(`
`),s=i.stack.split(`
`),o=r.length-1,a=s.length-1;1<=o&&0<=a&&r[o]!==s[a];)a--;for(;1<=o&&0<=a;o--,a--)if(r[o]!==s[a]){if(o!==1||a!==1)do if(o--,a--,0>a||r[o]!==s[a]){var l=`
`+r[o].replace(" at new "," at ");return t.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",t.displayName)),l}while(1<=o&&0<=a);break}}}finally{zl=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?Hs(t):""}function Mv(t){switch(t.tag){case 5:return Hs(t.type);case 16:return Hs("Lazy");case 13:return Hs("Suspense");case 19:return Hs("SuspenseList");case 0:case 2:case 15:return t=Bl(t.type,!1),t;case 11:return t=Bl(t.type.render,!1),t;case 1:return t=Bl(t.type,!0),t;default:return""}}function Zc(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Gr:return"Fragment";case Hr:return"Portal";case Yc:return"Profiler";case nf:return"StrictMode";case $c:return"Suspense";case Kc:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case rm:return(t.displayName||"Context")+".Consumer";case im:return(t._context.displayName||"Context")+".Provider";case rf:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case sf:return e=t.displayName||null,e!==null?e:Zc(t.type)||"Memo";case Ti:e=t._payload,t=t._init;try{return Zc(t(e))}catch{}}return null}function Ev(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Zc(e);case 8:return e===nf?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function Vi(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function om(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function Tv(t){var e=om(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),i=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(o){i=""+o,s.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return i},setValue:function(o){i=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Fo(t){t._valueTracker||(t._valueTracker=Tv(t))}function am(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=om(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function Ia(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function Jc(t,e){var n=e.checked;return ut({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function fd(t,e){var n=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;n=Vi(e.value!=null?e.value:n),t._wrapperState={initialChecked:i,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function lm(t,e){e=e.checked,e!=null&&tf(t,"checked",e,!1)}function Qc(t,e){lm(t,e);var n=Vi(e.value),i=e.type;if(n!=null)i==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(i==="submit"||i==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?eu(t,e.type,n):e.hasOwnProperty("defaultValue")&&eu(t,e.type,Vi(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function dd(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function eu(t,e,n){(e!=="number"||Ia(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var Gs=Array.isArray;function ts(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+Vi(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function tu(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(ee(91));return ut({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function hd(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(ee(92));if(Gs(n)){if(1<n.length)throw Error(ee(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:Vi(n)}}function cm(t,e){var n=Vi(e.value),i=Vi(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),i!=null&&(t.defaultValue=""+i)}function pd(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function um(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function nu(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?um(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Oo,fm=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,i,r){MSApp.execUnsafeLocalFunction(function(){return t(e,n,i,r)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Oo=Oo||document.createElement("div"),Oo.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Oo.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function ro(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Xs={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},wv=["Webkit","ms","Moz","O"];Object.keys(Xs).forEach(function(t){wv.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),Xs[e]=Xs[t]})});function dm(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||Xs.hasOwnProperty(t)&&Xs[t]?(""+e).trim():e+"px"}function hm(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var i=n.indexOf("--")===0,r=dm(n,e[n],i);n==="float"&&(n="cssFloat"),i?t.setProperty(n,r):t[n]=r}}var Av=ut({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function iu(t,e){if(e){if(Av[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(ee(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(ee(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(ee(61))}if(e.style!=null&&typeof e.style!="object")throw Error(ee(62))}}function ru(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var su=null;function of(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var ou=null,ns=null,is=null;function md(t){if(t=Co(t)){if(typeof ou!="function")throw Error(ee(280));var e=t.stateNode;e&&(e=vl(e),ou(t.stateNode,t.type,e))}}function pm(t){ns?is?is.push(t):is=[t]:ns=t}function mm(){if(ns){var t=ns,e=is;if(is=ns=null,md(t),e)for(t=0;t<e.length;t++)md(e[t])}}function gm(t,e){return t(e)}function vm(){}var Hl=!1;function _m(t,e,n){if(Hl)return t(e,n);Hl=!0;try{return gm(t,e,n)}finally{Hl=!1,(ns!==null||is!==null)&&(vm(),mm())}}function so(t,e){var n=t.stateNode;if(n===null)return null;var i=vl(n);if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(ee(231,e,typeof n));return n}var au=!1;if(fi)try{var bs={};Object.defineProperty(bs,"passive",{get:function(){au=!0}}),window.addEventListener("test",bs,bs),window.removeEventListener("test",bs,bs)}catch{au=!1}function Cv(t,e,n,i,r,s,o,a,l){var c=Array.prototype.slice.call(arguments,3);try{e.apply(n,c)}catch(f){this.onError(f)}}var js=!1,Fa=null,Oa=!1,lu=null,Rv={onError:function(t){js=!0,Fa=t}};function bv(t,e,n,i,r,s,o,a,l){js=!1,Fa=null,Cv.apply(Rv,arguments)}function Pv(t,e,n,i,r,s,o,a,l){if(bv.apply(this,arguments),js){if(js){var c=Fa;js=!1,Fa=null}else throw Error(ee(198));Oa||(Oa=!0,lu=c)}}function Er(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function xm(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function gd(t){if(Er(t)!==t)throw Error(ee(188))}function Lv(t){var e=t.alternate;if(!e){if(e=Er(t),e===null)throw Error(ee(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return gd(r),t;if(s===i)return gd(r),e;s=s.sibling}throw Error(ee(188))}if(n.return!==i.return)n=r,i=s;else{for(var o=!1,a=r.child;a;){if(a===n){o=!0,n=r,i=s;break}if(a===i){o=!0,i=r,n=s;break}a=a.sibling}if(!o){for(a=s.child;a;){if(a===n){o=!0,n=s,i=r;break}if(a===i){o=!0,i=s,n=r;break}a=a.sibling}if(!o)throw Error(ee(189))}}if(n.alternate!==i)throw Error(ee(190))}if(n.tag!==3)throw Error(ee(188));return n.stateNode.current===n?t:e}function ym(t){return t=Lv(t),t!==null?Sm(t):null}function Sm(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=Sm(t);if(e!==null)return e;t=t.sibling}return null}var Mm=mn.unstable_scheduleCallback,vd=mn.unstable_cancelCallback,Nv=mn.unstable_shouldYield,Dv=mn.unstable_requestPaint,mt=mn.unstable_now,Uv=mn.unstable_getCurrentPriorityLevel,af=mn.unstable_ImmediatePriority,Em=mn.unstable_UserBlockingPriority,ka=mn.unstable_NormalPriority,Iv=mn.unstable_LowPriority,Tm=mn.unstable_IdlePriority,hl=null,$n=null;function Fv(t){if($n&&typeof $n.onCommitFiberRoot=="function")try{$n.onCommitFiberRoot(hl,t,void 0,(t.current.flags&128)===128)}catch{}}var Hn=Math.clz32?Math.clz32:zv,Ov=Math.log,kv=Math.LN2;function zv(t){return t>>>=0,t===0?32:31-(Ov(t)/kv|0)|0}var ko=64,zo=4194304;function Vs(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function za(t,e){var n=t.pendingLanes;if(n===0)return 0;var i=0,r=t.suspendedLanes,s=t.pingedLanes,o=n&268435455;if(o!==0){var a=o&~r;a!==0?i=Vs(a):(s&=o,s!==0&&(i=Vs(s)))}else o=n&~r,o!==0?i=Vs(o):s!==0&&(i=Vs(s));if(i===0)return 0;if(e!==0&&e!==i&&!(e&r)&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if(i&4&&(i|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=i;0<e;)n=31-Hn(e),r=1<<n,i|=t[n],e&=~r;return i}function Bv(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Hv(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes;0<s;){var o=31-Hn(s),a=1<<o,l=r[o];l===-1?(!(a&n)||a&i)&&(r[o]=Bv(a,e)):l<=e&&(t.expiredLanes|=a),s&=~a}}function cu(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function wm(){var t=ko;return ko<<=1,!(ko&4194240)&&(ko=64),t}function Gl(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function wo(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-Hn(e),t[e]=n}function Gv(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var i=t.eventTimes;for(t=t.expirationTimes;0<n;){var r=31-Hn(n),s=1<<r;e[r]=0,i[r]=-1,t[r]=-1,n&=~s}}function lf(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-Hn(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}var $e=0;function Am(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var Cm,cf,Rm,bm,Pm,uu=!1,Bo=[],Ni=null,Di=null,Ui=null,oo=new Map,ao=new Map,Ai=[],Vv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function _d(t,e){switch(t){case"focusin":case"focusout":Ni=null;break;case"dragenter":case"dragleave":Di=null;break;case"mouseover":case"mouseout":Ui=null;break;case"pointerover":case"pointerout":oo.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":ao.delete(e.pointerId)}}function Ps(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Co(e),e!==null&&cf(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function Wv(t,e,n,i,r){switch(e){case"focusin":return Ni=Ps(Ni,t,e,n,i,r),!0;case"dragenter":return Di=Ps(Di,t,e,n,i,r),!0;case"mouseover":return Ui=Ps(Ui,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return oo.set(s,Ps(oo.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,ao.set(s,Ps(ao.get(s)||null,t,e,n,i,r)),!0}return!1}function Lm(t){var e=ar(t.target);if(e!==null){var n=Er(e);if(n!==null){if(e=n.tag,e===13){if(e=xm(n),e!==null){t.blockedOn=e,Pm(t.priority,function(){Rm(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Ta(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=fu(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);su=i,n.target.dispatchEvent(i),su=null}else return e=Co(n),e!==null&&cf(e),t.blockedOn=n,!1;e.shift()}return!0}function xd(t,e,n){Ta(t)&&n.delete(e)}function Xv(){uu=!1,Ni!==null&&Ta(Ni)&&(Ni=null),Di!==null&&Ta(Di)&&(Di=null),Ui!==null&&Ta(Ui)&&(Ui=null),oo.forEach(xd),ao.forEach(xd)}function Ls(t,e){t.blockedOn===e&&(t.blockedOn=null,uu||(uu=!0,mn.unstable_scheduleCallback(mn.unstable_NormalPriority,Xv)))}function lo(t){function e(r){return Ls(r,t)}if(0<Bo.length){Ls(Bo[0],t);for(var n=1;n<Bo.length;n++){var i=Bo[n];i.blockedOn===t&&(i.blockedOn=null)}}for(Ni!==null&&Ls(Ni,t),Di!==null&&Ls(Di,t),Ui!==null&&Ls(Ui,t),oo.forEach(e),ao.forEach(e),n=0;n<Ai.length;n++)i=Ai[n],i.blockedOn===t&&(i.blockedOn=null);for(;0<Ai.length&&(n=Ai[0],n.blockedOn===null);)Lm(n),n.blockedOn===null&&Ai.shift()}var rs=gi.ReactCurrentBatchConfig,Ba=!0;function jv(t,e,n,i){var r=$e,s=rs.transition;rs.transition=null;try{$e=1,uf(t,e,n,i)}finally{$e=r,rs.transition=s}}function qv(t,e,n,i){var r=$e,s=rs.transition;rs.transition=null;try{$e=4,uf(t,e,n,i)}finally{$e=r,rs.transition=s}}function uf(t,e,n,i){if(Ba){var r=fu(t,e,n,i);if(r===null)Jl(t,e,i,Ha,n),_d(t,i);else if(Wv(r,t,e,n,i))i.stopPropagation();else if(_d(t,i),e&4&&-1<Vv.indexOf(t)){for(;r!==null;){var s=Co(r);if(s!==null&&Cm(s),s=fu(t,e,n,i),s===null&&Jl(t,e,i,Ha,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else Jl(t,e,i,null,n)}}var Ha=null;function fu(t,e,n,i){if(Ha=null,t=of(i),t=ar(t),t!==null)if(e=Er(t),e===null)t=null;else if(n=e.tag,n===13){if(t=xm(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Ha=t,null}function Nm(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Uv()){case af:return 1;case Em:return 4;case ka:case Iv:return 16;case Tm:return 536870912;default:return 16}default:return 16}}var Ri=null,ff=null,wa=null;function Dm(){if(wa)return wa;var t,e=ff,n=e.length,i,r="value"in Ri?Ri.value:Ri.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var o=n-t;for(i=1;i<=o&&e[n-i]===r[s-i];i++);return wa=r.slice(t,1<i?1-i:void 0)}function Aa(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Ho(){return!0}function yd(){return!1}function vn(t){function e(n,i,r,s,o){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var a in t)t.hasOwnProperty(a)&&(n=t[a],this[a]=n?n(s):s[a]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Ho:yd,this.isPropagationStopped=yd,this}return ut(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Ho)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Ho)},persist:function(){},isPersistent:Ho}),e}var Ss={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},df=vn(Ss),Ao=ut({},Ss,{view:0,detail:0}),Yv=vn(Ao),Vl,Wl,Ns,pl=ut({},Ao,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:hf,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Ns&&(Ns&&t.type==="mousemove"?(Vl=t.screenX-Ns.screenX,Wl=t.screenY-Ns.screenY):Wl=Vl=0,Ns=t),Vl)},movementY:function(t){return"movementY"in t?t.movementY:Wl}}),Sd=vn(pl),$v=ut({},pl,{dataTransfer:0}),Kv=vn($v),Zv=ut({},Ao,{relatedTarget:0}),Xl=vn(Zv),Jv=ut({},Ss,{animationName:0,elapsedTime:0,pseudoElement:0}),Qv=vn(Jv),e_=ut({},Ss,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),t_=vn(e_),n_=ut({},Ss,{data:0}),Md=vn(n_),i_={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},r_={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},s_={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function o_(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=s_[t])?!!e[t]:!1}function hf(){return o_}var a_=ut({},Ao,{key:function(t){if(t.key){var e=i_[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Aa(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?r_[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:hf,charCode:function(t){return t.type==="keypress"?Aa(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Aa(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),l_=vn(a_),c_=ut({},pl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Ed=vn(c_),u_=ut({},Ao,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:hf}),f_=vn(u_),d_=ut({},Ss,{propertyName:0,elapsedTime:0,pseudoElement:0}),h_=vn(d_),p_=ut({},pl,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),m_=vn(p_),g_=[9,13,27,32],pf=fi&&"CompositionEvent"in window,qs=null;fi&&"documentMode"in document&&(qs=document.documentMode);var v_=fi&&"TextEvent"in window&&!qs,Um=fi&&(!pf||qs&&8<qs&&11>=qs),Td=" ",wd=!1;function Im(t,e){switch(t){case"keyup":return g_.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Fm(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Vr=!1;function __(t,e){switch(t){case"compositionend":return Fm(e);case"keypress":return e.which!==32?null:(wd=!0,Td);case"textInput":return t=e.data,t===Td&&wd?null:t;default:return null}}function x_(t,e){if(Vr)return t==="compositionend"||!pf&&Im(t,e)?(t=Dm(),wa=ff=Ri=null,Vr=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Um&&e.locale!=="ko"?null:e.data;default:return null}}var y_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Ad(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!y_[t.type]:e==="textarea"}function Om(t,e,n,i){pm(i),e=Ga(e,"onChange"),0<e.length&&(n=new df("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var Ys=null,co=null;function S_(t){Ym(t,0)}function ml(t){var e=jr(t);if(am(e))return t}function M_(t,e){if(t==="change")return e}var km=!1;if(fi){var jl;if(fi){var ql="oninput"in document;if(!ql){var Cd=document.createElement("div");Cd.setAttribute("oninput","return;"),ql=typeof Cd.oninput=="function"}jl=ql}else jl=!1;km=jl&&(!document.documentMode||9<document.documentMode)}function Rd(){Ys&&(Ys.detachEvent("onpropertychange",zm),co=Ys=null)}function zm(t){if(t.propertyName==="value"&&ml(co)){var e=[];Om(e,co,t,of(t)),_m(S_,e)}}function E_(t,e,n){t==="focusin"?(Rd(),Ys=e,co=n,Ys.attachEvent("onpropertychange",zm)):t==="focusout"&&Rd()}function T_(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return ml(co)}function w_(t,e){if(t==="click")return ml(e)}function A_(t,e){if(t==="input"||t==="change")return ml(e)}function C_(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Vn=typeof Object.is=="function"?Object.is:C_;function uo(t,e){if(Vn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!qc.call(e,r)||!Vn(t[r],e[r]))return!1}return!0}function bd(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Pd(t,e){var n=bd(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=bd(n)}}function Bm(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Bm(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Hm(){for(var t=window,e=Ia();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Ia(t.document)}return e}function mf(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function R_(t){var e=Hm(),n=t.focusedElem,i=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&Bm(n.ownerDocument.documentElement,n)){if(i!==null&&mf(n)){if(e=i.start,t=i.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var r=n.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!t.extend&&s>i&&(r=i,i=s,s=r),r=Pd(n,s);var o=Pd(n,i);r&&o&&(t.rangeCount!==1||t.anchorNode!==r.node||t.anchorOffset!==r.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),t.removeAllRanges(),s>i?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var b_=fi&&"documentMode"in document&&11>=document.documentMode,Wr=null,du=null,$s=null,hu=!1;function Ld(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;hu||Wr==null||Wr!==Ia(i)||(i=Wr,"selectionStart"in i&&mf(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),$s&&uo($s,i)||($s=i,i=Ga(du,"onSelect"),0<i.length&&(e=new df("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=Wr)))}function Go(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Xr={animationend:Go("Animation","AnimationEnd"),animationiteration:Go("Animation","AnimationIteration"),animationstart:Go("Animation","AnimationStart"),transitionend:Go("Transition","TransitionEnd")},Yl={},Gm={};fi&&(Gm=document.createElement("div").style,"AnimationEvent"in window||(delete Xr.animationend.animation,delete Xr.animationiteration.animation,delete Xr.animationstart.animation),"TransitionEvent"in window||delete Xr.transitionend.transition);function gl(t){if(Yl[t])return Yl[t];if(!Xr[t])return t;var e=Xr[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Gm)return Yl[t]=e[n];return t}var Vm=gl("animationend"),Wm=gl("animationiteration"),Xm=gl("animationstart"),jm=gl("transitionend"),qm=new Map,Nd="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function ji(t,e){qm.set(t,e),Mr(e,[t])}for(var $l=0;$l<Nd.length;$l++){var Kl=Nd[$l],P_=Kl.toLowerCase(),L_=Kl[0].toUpperCase()+Kl.slice(1);ji(P_,"on"+L_)}ji(Vm,"onAnimationEnd");ji(Wm,"onAnimationIteration");ji(Xm,"onAnimationStart");ji("dblclick","onDoubleClick");ji("focusin","onFocus");ji("focusout","onBlur");ji(jm,"onTransitionEnd");cs("onMouseEnter",["mouseout","mouseover"]);cs("onMouseLeave",["mouseout","mouseover"]);cs("onPointerEnter",["pointerout","pointerover"]);cs("onPointerLeave",["pointerout","pointerover"]);Mr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Mr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Mr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Mr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Mr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Mr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ws="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),N_=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ws));function Dd(t,e,n){var i=t.type||"unknown-event";t.currentTarget=n,Pv(i,e,void 0,t),t.currentTarget=null}function Ym(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var o=i.length-1;0<=o;o--){var a=i[o],l=a.instance,c=a.currentTarget;if(a=a.listener,l!==s&&r.isPropagationStopped())break e;Dd(r,a,c),s=l}else for(o=0;o<i.length;o++){if(a=i[o],l=a.instance,c=a.currentTarget,a=a.listener,l!==s&&r.isPropagationStopped())break e;Dd(r,a,c),s=l}}}if(Oa)throw t=lu,Oa=!1,lu=null,t}function nt(t,e){var n=e[_u];n===void 0&&(n=e[_u]=new Set);var i=t+"__bubble";n.has(i)||($m(e,t,2,!1),n.add(i))}function Zl(t,e,n){var i=0;e&&(i|=4),$m(n,t,i,e)}var Vo="_reactListening"+Math.random().toString(36).slice(2);function fo(t){if(!t[Vo]){t[Vo]=!0,nm.forEach(function(n){n!=="selectionchange"&&(N_.has(n)||Zl(n,!1,t),Zl(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Vo]||(e[Vo]=!0,Zl("selectionchange",!1,e))}}function $m(t,e,n,i){switch(Nm(e)){case 1:var r=jv;break;case 4:r=qv;break;default:r=uf}n=r.bind(null,e,n,t),r=void 0,!au||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function Jl(t,e,n,i,r){var s=i;if(!(e&1)&&!(e&2)&&i!==null)e:for(;;){if(i===null)return;var o=i.tag;if(o===3||o===4){var a=i.stateNode.containerInfo;if(a===r||a.nodeType===8&&a.parentNode===r)break;if(o===4)for(o=i.return;o!==null;){var l=o.tag;if((l===3||l===4)&&(l=o.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;o=o.return}for(;a!==null;){if(o=ar(a),o===null)return;if(l=o.tag,l===5||l===6){i=s=o;continue e}a=a.parentNode}}i=i.return}_m(function(){var c=s,f=of(n),h=[];e:{var d=qm.get(t);if(d!==void 0){var p=df,x=t;switch(t){case"keypress":if(Aa(n)===0)break e;case"keydown":case"keyup":p=l_;break;case"focusin":x="focus",p=Xl;break;case"focusout":x="blur",p=Xl;break;case"beforeblur":case"afterblur":p=Xl;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=Sd;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=Kv;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=f_;break;case Vm:case Wm:case Xm:p=Qv;break;case jm:p=h_;break;case"scroll":p=Yv;break;case"wheel":p=m_;break;case"copy":case"cut":case"paste":p=t_;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=Ed}var _=(e&4)!==0,m=!_&&t==="scroll",u=_?d!==null?d+"Capture":null:d;_=[];for(var v=c,g;v!==null;){g=v;var y=g.stateNode;if(g.tag===5&&y!==null&&(g=y,u!==null&&(y=so(v,u),y!=null&&_.push(ho(v,y,g)))),m)break;v=v.return}0<_.length&&(d=new p(d,x,null,n,f),h.push({event:d,listeners:_}))}}if(!(e&7)){e:{if(d=t==="mouseover"||t==="pointerover",p=t==="mouseout"||t==="pointerout",d&&n!==su&&(x=n.relatedTarget||n.fromElement)&&(ar(x)||x[di]))break e;if((p||d)&&(d=f.window===f?f:(d=f.ownerDocument)?d.defaultView||d.parentWindow:window,p?(x=n.relatedTarget||n.toElement,p=c,x=x?ar(x):null,x!==null&&(m=Er(x),x!==m||x.tag!==5&&x.tag!==6)&&(x=null)):(p=null,x=c),p!==x)){if(_=Sd,y="onMouseLeave",u="onMouseEnter",v="mouse",(t==="pointerout"||t==="pointerover")&&(_=Ed,y="onPointerLeave",u="onPointerEnter",v="pointer"),m=p==null?d:jr(p),g=x==null?d:jr(x),d=new _(y,v+"leave",p,n,f),d.target=m,d.relatedTarget=g,y=null,ar(f)===c&&(_=new _(u,v+"enter",x,n,f),_.target=g,_.relatedTarget=m,y=_),m=y,p&&x)t:{for(_=p,u=x,v=0,g=_;g;g=Tr(g))v++;for(g=0,y=u;y;y=Tr(y))g++;for(;0<v-g;)_=Tr(_),v--;for(;0<g-v;)u=Tr(u),g--;for(;v--;){if(_===u||u!==null&&_===u.alternate)break t;_=Tr(_),u=Tr(u)}_=null}else _=null;p!==null&&Ud(h,d,p,_,!1),x!==null&&m!==null&&Ud(h,m,x,_,!0)}}e:{if(d=c?jr(c):window,p=d.nodeName&&d.nodeName.toLowerCase(),p==="select"||p==="input"&&d.type==="file")var R=M_;else if(Ad(d))if(km)R=A_;else{R=T_;var A=E_}else(p=d.nodeName)&&p.toLowerCase()==="input"&&(d.type==="checkbox"||d.type==="radio")&&(R=w_);if(R&&(R=R(t,c))){Om(h,R,n,f);break e}A&&A(t,d,c),t==="focusout"&&(A=d._wrapperState)&&A.controlled&&d.type==="number"&&eu(d,"number",d.value)}switch(A=c?jr(c):window,t){case"focusin":(Ad(A)||A.contentEditable==="true")&&(Wr=A,du=c,$s=null);break;case"focusout":$s=du=Wr=null;break;case"mousedown":hu=!0;break;case"contextmenu":case"mouseup":case"dragend":hu=!1,Ld(h,n,f);break;case"selectionchange":if(b_)break;case"keydown":case"keyup":Ld(h,n,f)}var C;if(pf)e:{switch(t){case"compositionstart":var U="onCompositionStart";break e;case"compositionend":U="onCompositionEnd";break e;case"compositionupdate":U="onCompositionUpdate";break e}U=void 0}else Vr?Im(t,n)&&(U="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(U="onCompositionStart");U&&(Um&&n.locale!=="ko"&&(Vr||U!=="onCompositionStart"?U==="onCompositionEnd"&&Vr&&(C=Dm()):(Ri=f,ff="value"in Ri?Ri.value:Ri.textContent,Vr=!0)),A=Ga(c,U),0<A.length&&(U=new Md(U,t,null,n,f),h.push({event:U,listeners:A}),C?U.data=C:(C=Fm(n),C!==null&&(U.data=C)))),(C=v_?__(t,n):x_(t,n))&&(c=Ga(c,"onBeforeInput"),0<c.length&&(f=new Md("onBeforeInput","beforeinput",null,n,f),h.push({event:f,listeners:c}),f.data=C))}Ym(h,e)})}function ho(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Ga(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=so(t,n),s!=null&&i.unshift(ho(t,s,r)),s=so(t,e),s!=null&&i.push(ho(t,s,r))),t=t.return}return i}function Tr(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Ud(t,e,n,i,r){for(var s=e._reactName,o=[];n!==null&&n!==i;){var a=n,l=a.alternate,c=a.stateNode;if(l!==null&&l===i)break;a.tag===5&&c!==null&&(a=c,r?(l=so(n,s),l!=null&&o.unshift(ho(n,l,a))):r||(l=so(n,s),l!=null&&o.push(ho(n,l,a)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var D_=/\r\n?/g,U_=/\u0000|\uFFFD/g;function Id(t){return(typeof t=="string"?t:""+t).replace(D_,`
`).replace(U_,"")}function Wo(t,e,n){if(e=Id(e),Id(t)!==e&&n)throw Error(ee(425))}function Va(){}var pu=null,mu=null;function gu(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var vu=typeof setTimeout=="function"?setTimeout:void 0,I_=typeof clearTimeout=="function"?clearTimeout:void 0,Fd=typeof Promise=="function"?Promise:void 0,F_=typeof queueMicrotask=="function"?queueMicrotask:typeof Fd<"u"?function(t){return Fd.resolve(null).then(t).catch(O_)}:vu;function O_(t){setTimeout(function(){throw t})}function Ql(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(i===0){t.removeChild(r),lo(e);return}i--}else n!=="$"&&n!=="$?"&&n!=="$!"||i++;n=r}while(n);lo(e)}function Ii(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function Od(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Ms=Math.random().toString(36).slice(2),Yn="__reactFiber$"+Ms,po="__reactProps$"+Ms,di="__reactContainer$"+Ms,_u="__reactEvents$"+Ms,k_="__reactListeners$"+Ms,z_="__reactHandles$"+Ms;function ar(t){var e=t[Yn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[di]||n[Yn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Od(t);t!==null;){if(n=t[Yn])return n;t=Od(t)}return e}t=n,n=t.parentNode}return null}function Co(t){return t=t[Yn]||t[di],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function jr(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(ee(33))}function vl(t){return t[po]||null}var xu=[],qr=-1;function qi(t){return{current:t}}function rt(t){0>qr||(t.current=xu[qr],xu[qr]=null,qr--)}function tt(t,e){qr++,xu[qr]=t.current,t.current=e}var Wi={},Vt=qi(Wi),nn=qi(!1),mr=Wi;function us(t,e){var n=t.type.contextTypes;if(!n)return Wi;var i=t.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in n)r[s]=e[s];return i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=r),r}function rn(t){return t=t.childContextTypes,t!=null}function Wa(){rt(nn),rt(Vt)}function kd(t,e,n){if(Vt.current!==Wi)throw Error(ee(168));tt(Vt,e),tt(nn,n)}function Km(t,e,n){var i=t.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return n;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(ee(108,Ev(t)||"Unknown",r));return ut({},n,i)}function Xa(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||Wi,mr=Vt.current,tt(Vt,t),tt(nn,nn.current),!0}function zd(t,e,n){var i=t.stateNode;if(!i)throw Error(ee(169));n?(t=Km(t,e,mr),i.__reactInternalMemoizedMergedChildContext=t,rt(nn),rt(Vt),tt(Vt,t)):rt(nn),tt(nn,n)}var oi=null,_l=!1,ec=!1;function Zm(t){oi===null?oi=[t]:oi.push(t)}function B_(t){_l=!0,Zm(t)}function Yi(){if(!ec&&oi!==null){ec=!0;var t=0,e=$e;try{var n=oi;for($e=1;t<n.length;t++){var i=n[t];do i=i(!0);while(i!==null)}oi=null,_l=!1}catch(r){throw oi!==null&&(oi=oi.slice(t+1)),Mm(af,Yi),r}finally{$e=e,ec=!1}}return null}var Yr=[],$r=0,ja=null,qa=0,yn=[],Sn=0,gr=null,ai=1,li="";function tr(t,e){Yr[$r++]=qa,Yr[$r++]=ja,ja=t,qa=e}function Jm(t,e,n){yn[Sn++]=ai,yn[Sn++]=li,yn[Sn++]=gr,gr=t;var i=ai;t=li;var r=32-Hn(i)-1;i&=~(1<<r),n+=1;var s=32-Hn(e)+r;if(30<s){var o=r-r%5;s=(i&(1<<o)-1).toString(32),i>>=o,r-=o,ai=1<<32-Hn(e)+r|n<<r|i,li=s+t}else ai=1<<s|n<<r|i,li=t}function gf(t){t.return!==null&&(tr(t,1),Jm(t,1,0))}function vf(t){for(;t===ja;)ja=Yr[--$r],Yr[$r]=null,qa=Yr[--$r],Yr[$r]=null;for(;t===gr;)gr=yn[--Sn],yn[Sn]=null,li=yn[--Sn],yn[Sn]=null,ai=yn[--Sn],yn[Sn]=null}var hn=null,dn=null,st=!1,Fn=null;function Qm(t,e){var n=wn(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function Bd(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,hn=t,dn=Ii(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,hn=t,dn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=gr!==null?{id:ai,overflow:li}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=wn(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,hn=t,dn=null,!0):!1;default:return!1}}function yu(t){return(t.mode&1)!==0&&(t.flags&128)===0}function Su(t){if(st){var e=dn;if(e){var n=e;if(!Bd(t,e)){if(yu(t))throw Error(ee(418));e=Ii(n.nextSibling);var i=hn;e&&Bd(t,e)?Qm(i,n):(t.flags=t.flags&-4097|2,st=!1,hn=t)}}else{if(yu(t))throw Error(ee(418));t.flags=t.flags&-4097|2,st=!1,hn=t}}}function Hd(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;hn=t}function Xo(t){if(t!==hn)return!1;if(!st)return Hd(t),st=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!gu(t.type,t.memoizedProps)),e&&(e=dn)){if(yu(t))throw eg(),Error(ee(418));for(;e;)Qm(t,e),e=Ii(e.nextSibling)}if(Hd(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(ee(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){dn=Ii(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}dn=null}}else dn=hn?Ii(t.stateNode.nextSibling):null;return!0}function eg(){for(var t=dn;t;)t=Ii(t.nextSibling)}function fs(){dn=hn=null,st=!1}function _f(t){Fn===null?Fn=[t]:Fn.push(t)}var H_=gi.ReactCurrentBatchConfig;function Ds(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(ee(309));var i=n.stateNode}if(!i)throw Error(ee(147,t));var r=i,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var a=r.refs;o===null?delete a[s]:a[s]=o},e._stringRef=s,e)}if(typeof t!="string")throw Error(ee(284));if(!n._owner)throw Error(ee(290,t))}return t}function jo(t,e){throw t=Object.prototype.toString.call(e),Error(ee(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function Gd(t){var e=t._init;return e(t._payload)}function tg(t){function e(u,v){if(t){var g=u.deletions;g===null?(u.deletions=[v],u.flags|=16):g.push(v)}}function n(u,v){if(!t)return null;for(;v!==null;)e(u,v),v=v.sibling;return null}function i(u,v){for(u=new Map;v!==null;)v.key!==null?u.set(v.key,v):u.set(v.index,v),v=v.sibling;return u}function r(u,v){return u=zi(u,v),u.index=0,u.sibling=null,u}function s(u,v,g){return u.index=g,t?(g=u.alternate,g!==null?(g=g.index,g<v?(u.flags|=2,v):g):(u.flags|=2,v)):(u.flags|=1048576,v)}function o(u){return t&&u.alternate===null&&(u.flags|=2),u}function a(u,v,g,y){return v===null||v.tag!==6?(v=ac(g,u.mode,y),v.return=u,v):(v=r(v,g),v.return=u,v)}function l(u,v,g,y){var R=g.type;return R===Gr?f(u,v,g.props.children,y,g.key):v!==null&&(v.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===Ti&&Gd(R)===v.type)?(y=r(v,g.props),y.ref=Ds(u,v,g),y.return=u,y):(y=Da(g.type,g.key,g.props,null,u.mode,y),y.ref=Ds(u,v,g),y.return=u,y)}function c(u,v,g,y){return v===null||v.tag!==4||v.stateNode.containerInfo!==g.containerInfo||v.stateNode.implementation!==g.implementation?(v=lc(g,u.mode,y),v.return=u,v):(v=r(v,g.children||[]),v.return=u,v)}function f(u,v,g,y,R){return v===null||v.tag!==7?(v=fr(g,u.mode,y,R),v.return=u,v):(v=r(v,g),v.return=u,v)}function h(u,v,g){if(typeof v=="string"&&v!==""||typeof v=="number")return v=ac(""+v,u.mode,g),v.return=u,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Io:return g=Da(v.type,v.key,v.props,null,u.mode,g),g.ref=Ds(u,null,v),g.return=u,g;case Hr:return v=lc(v,u.mode,g),v.return=u,v;case Ti:var y=v._init;return h(u,y(v._payload),g)}if(Gs(v)||Rs(v))return v=fr(v,u.mode,g,null),v.return=u,v;jo(u,v)}return null}function d(u,v,g,y){var R=v!==null?v.key:null;if(typeof g=="string"&&g!==""||typeof g=="number")return R!==null?null:a(u,v,""+g,y);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Io:return g.key===R?l(u,v,g,y):null;case Hr:return g.key===R?c(u,v,g,y):null;case Ti:return R=g._init,d(u,v,R(g._payload),y)}if(Gs(g)||Rs(g))return R!==null?null:f(u,v,g,y,null);jo(u,g)}return null}function p(u,v,g,y,R){if(typeof y=="string"&&y!==""||typeof y=="number")return u=u.get(g)||null,a(v,u,""+y,R);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Io:return u=u.get(y.key===null?g:y.key)||null,l(v,u,y,R);case Hr:return u=u.get(y.key===null?g:y.key)||null,c(v,u,y,R);case Ti:var A=y._init;return p(u,v,g,A(y._payload),R)}if(Gs(y)||Rs(y))return u=u.get(g)||null,f(v,u,y,R,null);jo(v,y)}return null}function x(u,v,g,y){for(var R=null,A=null,C=v,U=v=0,M=null;C!==null&&U<g.length;U++){C.index>U?(M=C,C=null):M=C.sibling;var T=d(u,C,g[U],y);if(T===null){C===null&&(C=M);break}t&&C&&T.alternate===null&&e(u,C),v=s(T,v,U),A===null?R=T:A.sibling=T,A=T,C=M}if(U===g.length)return n(u,C),st&&tr(u,U),R;if(C===null){for(;U<g.length;U++)C=h(u,g[U],y),C!==null&&(v=s(C,v,U),A===null?R=C:A.sibling=C,A=C);return st&&tr(u,U),R}for(C=i(u,C);U<g.length;U++)M=p(C,u,U,g[U],y),M!==null&&(t&&M.alternate!==null&&C.delete(M.key===null?U:M.key),v=s(M,v,U),A===null?R=M:A.sibling=M,A=M);return t&&C.forEach(function(W){return e(u,W)}),st&&tr(u,U),R}function _(u,v,g,y){var R=Rs(g);if(typeof R!="function")throw Error(ee(150));if(g=R.call(g),g==null)throw Error(ee(151));for(var A=R=null,C=v,U=v=0,M=null,T=g.next();C!==null&&!T.done;U++,T=g.next()){C.index>U?(M=C,C=null):M=C.sibling;var W=d(u,C,T.value,y);if(W===null){C===null&&(C=M);break}t&&C&&W.alternate===null&&e(u,C),v=s(W,v,U),A===null?R=W:A.sibling=W,A=W,C=M}if(T.done)return n(u,C),st&&tr(u,U),R;if(C===null){for(;!T.done;U++,T=g.next())T=h(u,T.value,y),T!==null&&(v=s(T,v,U),A===null?R=T:A.sibling=T,A=T);return st&&tr(u,U),R}for(C=i(u,C);!T.done;U++,T=g.next())T=p(C,u,U,T.value,y),T!==null&&(t&&T.alternate!==null&&C.delete(T.key===null?U:T.key),v=s(T,v,U),A===null?R=T:A.sibling=T,A=T);return t&&C.forEach(function(q){return e(u,q)}),st&&tr(u,U),R}function m(u,v,g,y){if(typeof g=="object"&&g!==null&&g.type===Gr&&g.key===null&&(g=g.props.children),typeof g=="object"&&g!==null){switch(g.$$typeof){case Io:e:{for(var R=g.key,A=v;A!==null;){if(A.key===R){if(R=g.type,R===Gr){if(A.tag===7){n(u,A.sibling),v=r(A,g.props.children),v.return=u,u=v;break e}}else if(A.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===Ti&&Gd(R)===A.type){n(u,A.sibling),v=r(A,g.props),v.ref=Ds(u,A,g),v.return=u,u=v;break e}n(u,A);break}else e(u,A);A=A.sibling}g.type===Gr?(v=fr(g.props.children,u.mode,y,g.key),v.return=u,u=v):(y=Da(g.type,g.key,g.props,null,u.mode,y),y.ref=Ds(u,v,g),y.return=u,u=y)}return o(u);case Hr:e:{for(A=g.key;v!==null;){if(v.key===A)if(v.tag===4&&v.stateNode.containerInfo===g.containerInfo&&v.stateNode.implementation===g.implementation){n(u,v.sibling),v=r(v,g.children||[]),v.return=u,u=v;break e}else{n(u,v);break}else e(u,v);v=v.sibling}v=lc(g,u.mode,y),v.return=u,u=v}return o(u);case Ti:return A=g._init,m(u,v,A(g._payload),y)}if(Gs(g))return x(u,v,g,y);if(Rs(g))return _(u,v,g,y);jo(u,g)}return typeof g=="string"&&g!==""||typeof g=="number"?(g=""+g,v!==null&&v.tag===6?(n(u,v.sibling),v=r(v,g),v.return=u,u=v):(n(u,v),v=ac(g,u.mode,y),v.return=u,u=v),o(u)):n(u,v)}return m}var ds=tg(!0),ng=tg(!1),Ya=qi(null),$a=null,Kr=null,xf=null;function yf(){xf=Kr=$a=null}function Sf(t){var e=Ya.current;rt(Ya),t._currentValue=e}function Mu(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function ss(t,e){$a=t,xf=Kr=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(tn=!0),t.firstContext=null)}function Cn(t){var e=t._currentValue;if(xf!==t)if(t={context:t,memoizedValue:e,next:null},Kr===null){if($a===null)throw Error(ee(308));Kr=t,$a.dependencies={lanes:0,firstContext:t}}else Kr=Kr.next=t;return e}var lr=null;function Mf(t){lr===null?lr=[t]:lr.push(t)}function ig(t,e,n,i){var r=e.interleaved;return r===null?(n.next=n,Mf(e)):(n.next=r.next,r.next=n),e.interleaved=n,hi(t,i)}function hi(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var wi=!1;function Ef(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function rg(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function ui(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function Fi(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,qe&2){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,hi(t,n)}return r=i.interleaved,r===null?(e.next=e,Mf(i)):(e.next=r.next,r.next=e),i.interleaved=e,hi(t,n)}function Ca(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,lf(t,n)}}function Vd(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?r=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function Ka(t,e,n,i){var r=t.updateQueue;wi=!1;var s=r.firstBaseUpdate,o=r.lastBaseUpdate,a=r.shared.pending;if(a!==null){r.shared.pending=null;var l=a,c=l.next;l.next=null,o===null?s=c:o.next=c,o=l;var f=t.alternate;f!==null&&(f=f.updateQueue,a=f.lastBaseUpdate,a!==o&&(a===null?f.firstBaseUpdate=c:a.next=c,f.lastBaseUpdate=l))}if(s!==null){var h=r.baseState;o=0,f=c=l=null,a=s;do{var d=a.lane,p=a.eventTime;if((i&d)===d){f!==null&&(f=f.next={eventTime:p,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var x=t,_=a;switch(d=e,p=n,_.tag){case 1:if(x=_.payload,typeof x=="function"){h=x.call(p,h,d);break e}h=x;break e;case 3:x.flags=x.flags&-65537|128;case 0:if(x=_.payload,d=typeof x=="function"?x.call(p,h,d):x,d==null)break e;h=ut({},h,d);break e;case 2:wi=!0}}a.callback!==null&&a.lane!==0&&(t.flags|=64,d=r.effects,d===null?r.effects=[a]:d.push(a))}else p={eventTime:p,lane:d,tag:a.tag,payload:a.payload,callback:a.callback,next:null},f===null?(c=f=p,l=h):f=f.next=p,o|=d;if(a=a.next,a===null){if(a=r.shared.pending,a===null)break;d=a,a=d.next,d.next=null,r.lastBaseUpdate=d,r.shared.pending=null}}while(!0);if(f===null&&(l=h),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=f,e=r.shared.interleaved,e!==null){r=e;do o|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);_r|=o,t.lanes=o,t.memoizedState=h}}function Wd(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var i=t[e],r=i.callback;if(r!==null){if(i.callback=null,i=n,typeof r!="function")throw Error(ee(191,r));r.call(i)}}}var Ro={},Kn=qi(Ro),mo=qi(Ro),go=qi(Ro);function cr(t){if(t===Ro)throw Error(ee(174));return t}function Tf(t,e){switch(tt(go,e),tt(mo,t),tt(Kn,Ro),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:nu(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=nu(e,t)}rt(Kn),tt(Kn,e)}function hs(){rt(Kn),rt(mo),rt(go)}function sg(t){cr(go.current);var e=cr(Kn.current),n=nu(e,t.type);e!==n&&(tt(mo,t),tt(Kn,n))}function wf(t){mo.current===t&&(rt(Kn),rt(mo))}var lt=qi(0);function Za(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var tc=[];function Af(){for(var t=0;t<tc.length;t++)tc[t]._workInProgressVersionPrimary=null;tc.length=0}var Ra=gi.ReactCurrentDispatcher,nc=gi.ReactCurrentBatchConfig,vr=0,ct=null,yt=null,Rt=null,Ja=!1,Ks=!1,vo=0,G_=0;function Ot(){throw Error(ee(321))}function Cf(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Vn(t[n],e[n]))return!1;return!0}function Rf(t,e,n,i,r,s){if(vr=s,ct=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,Ra.current=t===null||t.memoizedState===null?j_:q_,t=n(i,r),Ks){s=0;do{if(Ks=!1,vo=0,25<=s)throw Error(ee(301));s+=1,Rt=yt=null,e.updateQueue=null,Ra.current=Y_,t=n(i,r)}while(Ks)}if(Ra.current=Qa,e=yt!==null&&yt.next!==null,vr=0,Rt=yt=ct=null,Ja=!1,e)throw Error(ee(300));return t}function bf(){var t=vo!==0;return vo=0,t}function jn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Rt===null?ct.memoizedState=Rt=t:Rt=Rt.next=t,Rt}function Rn(){if(yt===null){var t=ct.alternate;t=t!==null?t.memoizedState:null}else t=yt.next;var e=Rt===null?ct.memoizedState:Rt.next;if(e!==null)Rt=e,yt=t;else{if(t===null)throw Error(ee(310));yt=t,t={memoizedState:yt.memoizedState,baseState:yt.baseState,baseQueue:yt.baseQueue,queue:yt.queue,next:null},Rt===null?ct.memoizedState=Rt=t:Rt=Rt.next=t}return Rt}function _o(t,e){return typeof e=="function"?e(t):e}function ic(t){var e=Rn(),n=e.queue;if(n===null)throw Error(ee(311));n.lastRenderedReducer=t;var i=yt,r=i.baseQueue,s=n.pending;if(s!==null){if(r!==null){var o=r.next;r.next=s.next,s.next=o}i.baseQueue=r=s,n.pending=null}if(r!==null){s=r.next,i=i.baseState;var a=o=null,l=null,c=s;do{var f=c.lane;if((vr&f)===f)l!==null&&(l=l.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),i=c.hasEagerState?c.eagerState:t(i,c.action);else{var h={lane:f,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};l===null?(a=l=h,o=i):l=l.next=h,ct.lanes|=f,_r|=f}c=c.next}while(c!==null&&c!==s);l===null?o=i:l.next=a,Vn(i,e.memoizedState)||(tn=!0),e.memoizedState=i,e.baseState=o,e.baseQueue=l,n.lastRenderedState=i}if(t=n.interleaved,t!==null){r=t;do s=r.lane,ct.lanes|=s,_r|=s,r=r.next;while(r!==t)}else r===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function rc(t){var e=Rn(),n=e.queue;if(n===null)throw Error(ee(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var o=r=r.next;do s=t(s,o.action),o=o.next;while(o!==r);Vn(s,e.memoizedState)||(tn=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function og(){}function ag(t,e){var n=ct,i=Rn(),r=e(),s=!Vn(i.memoizedState,r);if(s&&(i.memoizedState=r,tn=!0),i=i.queue,Pf(ug.bind(null,n,i,t),[t]),i.getSnapshot!==e||s||Rt!==null&&Rt.memoizedState.tag&1){if(n.flags|=2048,xo(9,cg.bind(null,n,i,r,e),void 0,null),Pt===null)throw Error(ee(349));vr&30||lg(n,e,r)}return r}function lg(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=ct.updateQueue,e===null?(e={lastEffect:null,stores:null},ct.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function cg(t,e,n,i){e.value=n,e.getSnapshot=i,fg(e)&&dg(t)}function ug(t,e,n){return n(function(){fg(e)&&dg(t)})}function fg(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Vn(t,n)}catch{return!0}}function dg(t){var e=hi(t,1);e!==null&&Gn(e,t,1,-1)}function Xd(t){var e=jn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:_o,lastRenderedState:t},e.queue=t,t=t.dispatch=X_.bind(null,ct,t),[e.memoizedState,t]}function xo(t,e,n,i){return t={tag:t,create:e,destroy:n,deps:i,next:null},e=ct.updateQueue,e===null?(e={lastEffect:null,stores:null},ct.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t)),t}function hg(){return Rn().memoizedState}function ba(t,e,n,i){var r=jn();ct.flags|=t,r.memoizedState=xo(1|e,n,void 0,i===void 0?null:i)}function xl(t,e,n,i){var r=Rn();i=i===void 0?null:i;var s=void 0;if(yt!==null){var o=yt.memoizedState;if(s=o.destroy,i!==null&&Cf(i,o.deps)){r.memoizedState=xo(e,n,s,i);return}}ct.flags|=t,r.memoizedState=xo(1|e,n,s,i)}function jd(t,e){return ba(8390656,8,t,e)}function Pf(t,e){return xl(2048,8,t,e)}function pg(t,e){return xl(4,2,t,e)}function mg(t,e){return xl(4,4,t,e)}function gg(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function vg(t,e,n){return n=n!=null?n.concat([t]):null,xl(4,4,gg.bind(null,e,t),n)}function Lf(){}function _g(t,e){var n=Rn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&Cf(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function xg(t,e){var n=Rn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&Cf(e,i[1])?i[0]:(t=t(),n.memoizedState=[t,e],t)}function yg(t,e,n){return vr&21?(Vn(n,e)||(n=wm(),ct.lanes|=n,_r|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,tn=!0),t.memoizedState=n)}function V_(t,e){var n=$e;$e=n!==0&&4>n?n:4,t(!0);var i=nc.transition;nc.transition={};try{t(!1),e()}finally{$e=n,nc.transition=i}}function Sg(){return Rn().memoizedState}function W_(t,e,n){var i=ki(t);if(n={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null},Mg(t))Eg(e,n);else if(n=ig(t,e,n,i),n!==null){var r=Kt();Gn(n,t,i,r),Tg(n,e,i)}}function X_(t,e,n){var i=ki(t),r={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null};if(Mg(t))Eg(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,a=s(o,n);if(r.hasEagerState=!0,r.eagerState=a,Vn(a,o)){var l=e.interleaved;l===null?(r.next=r,Mf(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}n=ig(t,e,r,i),n!==null&&(r=Kt(),Gn(n,t,i,r),Tg(n,e,i))}}function Mg(t){var e=t.alternate;return t===ct||e!==null&&e===ct}function Eg(t,e){Ks=Ja=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Tg(t,e,n){if(n&4194240){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,lf(t,n)}}var Qa={readContext:Cn,useCallback:Ot,useContext:Ot,useEffect:Ot,useImperativeHandle:Ot,useInsertionEffect:Ot,useLayoutEffect:Ot,useMemo:Ot,useReducer:Ot,useRef:Ot,useState:Ot,useDebugValue:Ot,useDeferredValue:Ot,useTransition:Ot,useMutableSource:Ot,useSyncExternalStore:Ot,useId:Ot,unstable_isNewReconciler:!1},j_={readContext:Cn,useCallback:function(t,e){return jn().memoizedState=[t,e===void 0?null:e],t},useContext:Cn,useEffect:jd,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,ba(4194308,4,gg.bind(null,e,t),n)},useLayoutEffect:function(t,e){return ba(4194308,4,t,e)},useInsertionEffect:function(t,e){return ba(4,2,t,e)},useMemo:function(t,e){var n=jn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var i=jn();return e=n!==void 0?n(e):e,i.memoizedState=i.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},i.queue=t,t=t.dispatch=W_.bind(null,ct,t),[i.memoizedState,t]},useRef:function(t){var e=jn();return t={current:t},e.memoizedState=t},useState:Xd,useDebugValue:Lf,useDeferredValue:function(t){return jn().memoizedState=t},useTransition:function(){var t=Xd(!1),e=t[0];return t=V_.bind(null,t[1]),jn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var i=ct,r=jn();if(st){if(n===void 0)throw Error(ee(407));n=n()}else{if(n=e(),Pt===null)throw Error(ee(349));vr&30||lg(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,jd(ug.bind(null,i,s,t),[t]),i.flags|=2048,xo(9,cg.bind(null,i,s,n,e),void 0,null),n},useId:function(){var t=jn(),e=Pt.identifierPrefix;if(st){var n=li,i=ai;n=(i&~(1<<32-Hn(i)-1)).toString(32)+n,e=":"+e+"R"+n,n=vo++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=G_++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},q_={readContext:Cn,useCallback:_g,useContext:Cn,useEffect:Pf,useImperativeHandle:vg,useInsertionEffect:pg,useLayoutEffect:mg,useMemo:xg,useReducer:ic,useRef:hg,useState:function(){return ic(_o)},useDebugValue:Lf,useDeferredValue:function(t){var e=Rn();return yg(e,yt.memoizedState,t)},useTransition:function(){var t=ic(_o)[0],e=Rn().memoizedState;return[t,e]},useMutableSource:og,useSyncExternalStore:ag,useId:Sg,unstable_isNewReconciler:!1},Y_={readContext:Cn,useCallback:_g,useContext:Cn,useEffect:Pf,useImperativeHandle:vg,useInsertionEffect:pg,useLayoutEffect:mg,useMemo:xg,useReducer:rc,useRef:hg,useState:function(){return rc(_o)},useDebugValue:Lf,useDeferredValue:function(t){var e=Rn();return yt===null?e.memoizedState=t:yg(e,yt.memoizedState,t)},useTransition:function(){var t=rc(_o)[0],e=Rn().memoizedState;return[t,e]},useMutableSource:og,useSyncExternalStore:ag,useId:Sg,unstable_isNewReconciler:!1};function Un(t,e){if(t&&t.defaultProps){e=ut({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function Eu(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:ut({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var yl={isMounted:function(t){return(t=t._reactInternals)?Er(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var i=Kt(),r=ki(t),s=ui(i,r);s.payload=e,n!=null&&(s.callback=n),e=Fi(t,s,r),e!==null&&(Gn(e,t,r,i),Ca(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=Kt(),r=ki(t),s=ui(i,r);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=Fi(t,s,r),e!==null&&(Gn(e,t,r,i),Ca(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Kt(),i=ki(t),r=ui(n,i);r.tag=2,e!=null&&(r.callback=e),e=Fi(t,r,i),e!==null&&(Gn(e,t,i,n),Ca(e,t,i))}};function qd(t,e,n,i,r,s,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,o):e.prototype&&e.prototype.isPureReactComponent?!uo(n,i)||!uo(r,s):!0}function wg(t,e,n){var i=!1,r=Wi,s=e.contextType;return typeof s=="object"&&s!==null?s=Cn(s):(r=rn(e)?mr:Vt.current,i=e.contextTypes,s=(i=i!=null)?us(t,r):Wi),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=yl,t.stateNode=e,e._reactInternals=t,i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=r,t.__reactInternalMemoizedMaskedChildContext=s),e}function Yd(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&yl.enqueueReplaceState(e,e.state,null)}function Tu(t,e,n,i){var r=t.stateNode;r.props=n,r.state=t.memoizedState,r.refs={},Ef(t);var s=e.contextType;typeof s=="object"&&s!==null?r.context=Cn(s):(s=rn(e)?mr:Vt.current,r.context=us(t,s)),r.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(Eu(t,e,s,n),r.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&yl.enqueueReplaceState(r,r.state,null),Ka(t,n,r,i),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308)}function ps(t,e){try{var n="",i=e;do n+=Mv(i),i=i.return;while(i);var r=n}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:r,digest:null}}function sc(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function wu(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var $_=typeof WeakMap=="function"?WeakMap:Map;function Ag(t,e,n){n=ui(-1,n),n.tag=3,n.payload={element:null};var i=e.value;return n.callback=function(){tl||(tl=!0,Iu=i),wu(t,e)},n}function Cg(t,e,n){n=ui(-1,n),n.tag=3;var i=t.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;n.payload=function(){return i(r)},n.callback=function(){wu(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){wu(t,e),typeof i!="function"&&(Oi===null?Oi=new Set([this]):Oi.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function $d(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new $_;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(r.add(n),t=cx.bind(null,t,e,n),e.then(t,t))}function Kd(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function Zd(t,e,n,i,r){return t.mode&1?(t.flags|=65536,t.lanes=r,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=ui(-1,1),e.tag=2,Fi(n,e,1))),n.lanes|=1),t)}var K_=gi.ReactCurrentOwner,tn=!1;function Yt(t,e,n,i){e.child=t===null?ng(e,null,n,i):ds(e,t.child,n,i)}function Jd(t,e,n,i,r){n=n.render;var s=e.ref;return ss(e,r),i=Rf(t,e,n,i,s,r),n=bf(),t!==null&&!tn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,pi(t,e,r)):(st&&n&&gf(e),e.flags|=1,Yt(t,e,i,r),e.child)}function Qd(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!zf(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,Rg(t,e,s,i,r)):(t=Da(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&r)){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:uo,n(o,i)&&t.ref===e.ref)return pi(t,e,r)}return e.flags|=1,t=zi(s,i),t.ref=e.ref,t.return=e,e.child=t}function Rg(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(uo(s,i)&&t.ref===e.ref)if(tn=!1,e.pendingProps=i=s,(t.lanes&r)!==0)t.flags&131072&&(tn=!0);else return e.lanes=t.lanes,pi(t,e,r)}return Au(t,e,n,i,r)}function bg(t,e,n){var i=e.pendingProps,r=i.children,s=t!==null?t.memoizedState:null;if(i.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},tt(Jr,un),un|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,tt(Jr,un),un|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:n,tt(Jr,un),un|=i}else s!==null?(i=s.baseLanes|n,e.memoizedState=null):i=n,tt(Jr,un),un|=i;return Yt(t,e,r,n),e.child}function Pg(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function Au(t,e,n,i,r){var s=rn(n)?mr:Vt.current;return s=us(e,s),ss(e,r),n=Rf(t,e,n,i,s,r),i=bf(),t!==null&&!tn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,pi(t,e,r)):(st&&i&&gf(e),e.flags|=1,Yt(t,e,n,r),e.child)}function eh(t,e,n,i,r){if(rn(n)){var s=!0;Xa(e)}else s=!1;if(ss(e,r),e.stateNode===null)Pa(t,e),wg(e,n,i),Tu(e,n,i,r),i=!0;else if(t===null){var o=e.stateNode,a=e.memoizedProps;o.props=a;var l=o.context,c=n.contextType;typeof c=="object"&&c!==null?c=Cn(c):(c=rn(n)?mr:Vt.current,c=us(e,c));var f=n.getDerivedStateFromProps,h=typeof f=="function"||typeof o.getSnapshotBeforeUpdate=="function";h||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==i||l!==c)&&Yd(e,o,i,c),wi=!1;var d=e.memoizedState;o.state=d,Ka(e,i,o,r),l=e.memoizedState,a!==i||d!==l||nn.current||wi?(typeof f=="function"&&(Eu(e,n,f,i),l=e.memoizedState),(a=wi||qd(e,n,a,i,d,l,c))?(h||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),o.props=i,o.state=l,o.context=c,i=a):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{o=e.stateNode,rg(t,e),a=e.memoizedProps,c=e.type===e.elementType?a:Un(e.type,a),o.props=c,h=e.pendingProps,d=o.context,l=n.contextType,typeof l=="object"&&l!==null?l=Cn(l):(l=rn(n)?mr:Vt.current,l=us(e,l));var p=n.getDerivedStateFromProps;(f=typeof p=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==h||d!==l)&&Yd(e,o,i,l),wi=!1,d=e.memoizedState,o.state=d,Ka(e,i,o,r);var x=e.memoizedState;a!==h||d!==x||nn.current||wi?(typeof p=="function"&&(Eu(e,n,p,i),x=e.memoizedState),(c=wi||qd(e,n,c,i,d,x,l)||!1)?(f||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(i,x,l),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(i,x,l)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=x),o.props=i,o.state=x,o.context=l,i=c):(typeof o.componentDidUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),i=!1)}return Cu(t,e,n,i,s,r)}function Cu(t,e,n,i,r,s){Pg(t,e);var o=(e.flags&128)!==0;if(!i&&!o)return r&&zd(e,n,!1),pi(t,e,s);i=e.stateNode,K_.current=e;var a=o&&typeof n.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,t!==null&&o?(e.child=ds(e,t.child,null,s),e.child=ds(e,null,a,s)):Yt(t,e,a,s),e.memoizedState=i.state,r&&zd(e,n,!0),e.child}function Lg(t){var e=t.stateNode;e.pendingContext?kd(t,e.pendingContext,e.pendingContext!==e.context):e.context&&kd(t,e.context,!1),Tf(t,e.containerInfo)}function th(t,e,n,i,r){return fs(),_f(r),e.flags|=256,Yt(t,e,n,i),e.child}var Ru={dehydrated:null,treeContext:null,retryLane:0};function bu(t){return{baseLanes:t,cachePool:null,transitions:null}}function Ng(t,e,n){var i=e.pendingProps,r=lt.current,s=!1,o=(e.flags&128)!==0,a;if((a=o)||(a=t!==null&&t.memoizedState===null?!1:(r&2)!==0),a?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(r|=1),tt(lt,r&1),t===null)return Su(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(o=i.children,t=i.fallback,s?(i=e.mode,s=e.child,o={mode:"hidden",children:o},!(i&1)&&s!==null?(s.childLanes=0,s.pendingProps=o):s=El(o,i,0,null),t=fr(t,i,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=bu(n),e.memoizedState=Ru,t):Nf(e,o));if(r=t.memoizedState,r!==null&&(a=r.dehydrated,a!==null))return Z_(t,e,o,i,a,r,n);if(s){s=i.fallback,o=e.mode,r=t.child,a=r.sibling;var l={mode:"hidden",children:i.children};return!(o&1)&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=zi(r,l),i.subtreeFlags=r.subtreeFlags&14680064),a!==null?s=zi(a,s):(s=fr(s,o,n,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,o=t.child.memoizedState,o=o===null?bu(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=t.childLanes&~n,e.memoizedState=Ru,i}return s=t.child,t=s.sibling,i=zi(s,{mode:"visible",children:i.children}),!(e.mode&1)&&(i.lanes=n),i.return=e,i.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=i,e.memoizedState=null,i}function Nf(t,e){return e=El({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function qo(t,e,n,i){return i!==null&&_f(i),ds(e,t.child,null,n),t=Nf(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Z_(t,e,n,i,r,s,o){if(n)return e.flags&256?(e.flags&=-257,i=sc(Error(ee(422))),qo(t,e,o,i)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=El({mode:"visible",children:i.children},r,0,null),s=fr(s,r,o,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,e.mode&1&&ds(e,t.child,null,o),e.child.memoizedState=bu(o),e.memoizedState=Ru,s);if(!(e.mode&1))return qo(t,e,o,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var a=i.dgst;return i=a,s=Error(ee(419)),i=sc(s,i,void 0),qo(t,e,o,i)}if(a=(o&t.childLanes)!==0,tn||a){if(i=Pt,i!==null){switch(o&-o){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(i.suspendedLanes|o)?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,hi(t,r),Gn(i,t,r,-1))}return kf(),i=sc(Error(ee(421))),qo(t,e,o,i)}return r.data==="$?"?(e.flags|=128,e.child=t.child,e=ux.bind(null,t),r._reactRetry=e,null):(t=s.treeContext,dn=Ii(r.nextSibling),hn=e,st=!0,Fn=null,t!==null&&(yn[Sn++]=ai,yn[Sn++]=li,yn[Sn++]=gr,ai=t.id,li=t.overflow,gr=e),e=Nf(e,i.children),e.flags|=4096,e)}function nh(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),Mu(t.return,e,n)}function oc(t,e,n,i,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=r)}function Dg(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(Yt(t,e,i.children,n),i=lt.current,i&2)i=i&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&nh(t,n,e);else if(t.tag===19)nh(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}i&=1}if(tt(lt,i),!(e.mode&1))e.memoizedState=null;else switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&Za(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),oc(e,!1,r,n,s);break;case"backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&Za(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}oc(e,!0,n,null,s);break;case"together":oc(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Pa(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function pi(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),_r|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(ee(153));if(e.child!==null){for(t=e.child,n=zi(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=zi(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function J_(t,e,n){switch(e.tag){case 3:Lg(e),fs();break;case 5:sg(e);break;case 1:rn(e.type)&&Xa(e);break;case 4:Tf(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;tt(Ya,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(tt(lt,lt.current&1),e.flags|=128,null):n&e.child.childLanes?Ng(t,e,n):(tt(lt,lt.current&1),t=pi(t,e,n),t!==null?t.sibling:null);tt(lt,lt.current&1);break;case 19:if(i=(n&e.childLanes)!==0,t.flags&128){if(i)return Dg(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),tt(lt,lt.current),i)break;return null;case 22:case 23:return e.lanes=0,bg(t,e,n)}return pi(t,e,n)}var Ug,Pu,Ig,Fg;Ug=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Pu=function(){};Ig=function(t,e,n,i){var r=t.memoizedProps;if(r!==i){t=e.stateNode,cr(Kn.current);var s=null;switch(n){case"input":r=Jc(t,r),i=Jc(t,i),s=[];break;case"select":r=ut({},r,{value:void 0}),i=ut({},i,{value:void 0}),s=[];break;case"textarea":r=tu(t,r),i=tu(t,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(t.onclick=Va)}iu(n,i);var o;n=null;for(c in r)if(!i.hasOwnProperty(c)&&r.hasOwnProperty(c)&&r[c]!=null)if(c==="style"){var a=r[c];for(o in a)a.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(io.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in i){var l=i[c];if(a=r!=null?r[c]:void 0,i.hasOwnProperty(c)&&l!==a&&(l!=null||a!=null))if(c==="style")if(a){for(o in a)!a.hasOwnProperty(o)||l&&l.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in l)l.hasOwnProperty(o)&&a[o]!==l[o]&&(n||(n={}),n[o]=l[o])}else n||(s||(s=[]),s.push(c,n)),n=l;else c==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,a=a?a.__html:void 0,l!=null&&a!==l&&(s=s||[]).push(c,l)):c==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(c,""+l):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(io.hasOwnProperty(c)?(l!=null&&c==="onScroll"&&nt("scroll",t),s||a===l||(s=[])):(s=s||[]).push(c,l))}n&&(s=s||[]).push("style",n);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};Fg=function(t,e,n,i){n!==i&&(e.flags|=4)};function Us(t,e){if(!st)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function kt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function Q_(t,e,n){var i=e.pendingProps;switch(vf(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return kt(e),null;case 1:return rn(e.type)&&Wa(),kt(e),null;case 3:return i=e.stateNode,hs(),rt(nn),rt(Vt),Af(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(Xo(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Fn!==null&&(ku(Fn),Fn=null))),Pu(t,e),kt(e),null;case 5:wf(e);var r=cr(go.current);if(n=e.type,t!==null&&e.stateNode!=null)Ig(t,e,n,i,r),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(ee(166));return kt(e),null}if(t=cr(Kn.current),Xo(e)){i=e.stateNode,n=e.type;var s=e.memoizedProps;switch(i[Yn]=e,i[po]=s,t=(e.mode&1)!==0,n){case"dialog":nt("cancel",i),nt("close",i);break;case"iframe":case"object":case"embed":nt("load",i);break;case"video":case"audio":for(r=0;r<Ws.length;r++)nt(Ws[r],i);break;case"source":nt("error",i);break;case"img":case"image":case"link":nt("error",i),nt("load",i);break;case"details":nt("toggle",i);break;case"input":fd(i,s),nt("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},nt("invalid",i);break;case"textarea":hd(i,s),nt("invalid",i)}iu(n,s),r=null;for(var o in s)if(s.hasOwnProperty(o)){var a=s[o];o==="children"?typeof a=="string"?i.textContent!==a&&(s.suppressHydrationWarning!==!0&&Wo(i.textContent,a,t),r=["children",a]):typeof a=="number"&&i.textContent!==""+a&&(s.suppressHydrationWarning!==!0&&Wo(i.textContent,a,t),r=["children",""+a]):io.hasOwnProperty(o)&&a!=null&&o==="onScroll"&&nt("scroll",i)}switch(n){case"input":Fo(i),dd(i,s,!0);break;case"textarea":Fo(i),pd(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=Va)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{o=r.nodeType===9?r:r.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=um(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof i.is=="string"?t=o.createElement(n,{is:i.is}):(t=o.createElement(n),n==="select"&&(o=t,i.multiple?o.multiple=!0:i.size&&(o.size=i.size))):t=o.createElementNS(t,n),t[Yn]=e,t[po]=i,Ug(t,e,!1,!1),e.stateNode=t;e:{switch(o=ru(n,i),n){case"dialog":nt("cancel",t),nt("close",t),r=i;break;case"iframe":case"object":case"embed":nt("load",t),r=i;break;case"video":case"audio":for(r=0;r<Ws.length;r++)nt(Ws[r],t);r=i;break;case"source":nt("error",t),r=i;break;case"img":case"image":case"link":nt("error",t),nt("load",t),r=i;break;case"details":nt("toggle",t),r=i;break;case"input":fd(t,i),r=Jc(t,i),nt("invalid",t);break;case"option":r=i;break;case"select":t._wrapperState={wasMultiple:!!i.multiple},r=ut({},i,{value:void 0}),nt("invalid",t);break;case"textarea":hd(t,i),r=tu(t,i),nt("invalid",t);break;default:r=i}iu(n,r),a=r;for(s in a)if(a.hasOwnProperty(s)){var l=a[s];s==="style"?hm(t,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&fm(t,l)):s==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&ro(t,l):typeof l=="number"&&ro(t,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(io.hasOwnProperty(s)?l!=null&&s==="onScroll"&&nt("scroll",t):l!=null&&tf(t,s,l,o))}switch(n){case"input":Fo(t),dd(t,i,!1);break;case"textarea":Fo(t),pd(t);break;case"option":i.value!=null&&t.setAttribute("value",""+Vi(i.value));break;case"select":t.multiple=!!i.multiple,s=i.value,s!=null?ts(t,!!i.multiple,s,!1):i.defaultValue!=null&&ts(t,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(t.onclick=Va)}switch(n){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return kt(e),null;case 6:if(t&&e.stateNode!=null)Fg(t,e,t.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(ee(166));if(n=cr(go.current),cr(Kn.current),Xo(e)){if(i=e.stateNode,n=e.memoizedProps,i[Yn]=e,(s=i.nodeValue!==n)&&(t=hn,t!==null))switch(t.tag){case 3:Wo(i.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&Wo(i.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else i=(n.nodeType===9?n:n.ownerDocument).createTextNode(i),i[Yn]=e,e.stateNode=i}return kt(e),null;case 13:if(rt(lt),i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(st&&dn!==null&&e.mode&1&&!(e.flags&128))eg(),fs(),e.flags|=98560,s=!1;else if(s=Xo(e),i!==null&&i.dehydrated!==null){if(t===null){if(!s)throw Error(ee(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(ee(317));s[Yn]=e}else fs(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;kt(e),s=!1}else Fn!==null&&(ku(Fn),Fn=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(i=i!==null,i!==(t!==null&&t.memoizedState!==null)&&i&&(e.child.flags|=8192,e.mode&1&&(t===null||lt.current&1?St===0&&(St=3):kf())),e.updateQueue!==null&&(e.flags|=4),kt(e),null);case 4:return hs(),Pu(t,e),t===null&&fo(e.stateNode.containerInfo),kt(e),null;case 10:return Sf(e.type._context),kt(e),null;case 17:return rn(e.type)&&Wa(),kt(e),null;case 19:if(rt(lt),s=e.memoizedState,s===null)return kt(e),null;if(i=(e.flags&128)!==0,o=s.rendering,o===null)if(i)Us(s,!1);else{if(St!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(o=Za(t),o!==null){for(e.flags|=128,Us(s,!1),i=o.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=n,n=e.child;n!==null;)s=n,t=i,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,t=o.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return tt(lt,lt.current&1|2),e.child}t=t.sibling}s.tail!==null&&mt()>ms&&(e.flags|=128,i=!0,Us(s,!1),e.lanes=4194304)}else{if(!i)if(t=Za(o),t!==null){if(e.flags|=128,i=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),Us(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!st)return kt(e),null}else 2*mt()-s.renderingStartTime>ms&&n!==1073741824&&(e.flags|=128,i=!0,Us(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(n=s.last,n!==null?n.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=mt(),e.sibling=null,n=lt.current,tt(lt,i?n&1|2:n&1),e):(kt(e),null);case 22:case 23:return Of(),i=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==i&&(e.flags|=8192),i&&e.mode&1?un&1073741824&&(kt(e),e.subtreeFlags&6&&(e.flags|=8192)):kt(e),null;case 24:return null;case 25:return null}throw Error(ee(156,e.tag))}function ex(t,e){switch(vf(e),e.tag){case 1:return rn(e.type)&&Wa(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return hs(),rt(nn),rt(Vt),Af(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return wf(e),null;case 13:if(rt(lt),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(ee(340));fs()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return rt(lt),null;case 4:return hs(),null;case 10:return Sf(e.type._context),null;case 22:case 23:return Of(),null;case 24:return null;default:return null}}var Yo=!1,Ht=!1,tx=typeof WeakSet=="function"?WeakSet:Set,fe=null;function Zr(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(i){ht(t,e,i)}else n.current=null}function Lu(t,e,n){try{n()}catch(i){ht(t,e,i)}}var ih=!1;function nx(t,e){if(pu=Ba,t=Hm(),mf(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,a=-1,l=-1,c=0,f=0,h=t,d=null;t:for(;;){for(var p;h!==n||r!==0&&h.nodeType!==3||(a=o+r),h!==s||i!==0&&h.nodeType!==3||(l=o+i),h.nodeType===3&&(o+=h.nodeValue.length),(p=h.firstChild)!==null;)d=h,h=p;for(;;){if(h===t)break t;if(d===n&&++c===r&&(a=o),d===s&&++f===i&&(l=o),(p=h.nextSibling)!==null)break;h=d,d=h.parentNode}h=p}n=a===-1||l===-1?null:{start:a,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(mu={focusedElem:t,selectionRange:n},Ba=!1,fe=e;fe!==null;)if(e=fe,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,fe=t;else for(;fe!==null;){e=fe;try{var x=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(x!==null){var _=x.memoizedProps,m=x.memoizedState,u=e.stateNode,v=u.getSnapshotBeforeUpdate(e.elementType===e.type?_:Un(e.type,_),m);u.__reactInternalSnapshotBeforeUpdate=v}break;case 3:var g=e.stateNode.containerInfo;g.nodeType===1?g.textContent="":g.nodeType===9&&g.documentElement&&g.removeChild(g.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(ee(163))}}catch(y){ht(e,e.return,y)}if(t=e.sibling,t!==null){t.return=e.return,fe=t;break}fe=e.return}return x=ih,ih=!1,x}function Zs(t,e,n){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&t)===t){var s=r.destroy;r.destroy=void 0,s!==void 0&&Lu(e,n,s)}r=r.next}while(r!==i)}}function Sl(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var i=n.create;n.destroy=i()}n=n.next}while(n!==e)}}function Nu(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function Og(t){var e=t.alternate;e!==null&&(t.alternate=null,Og(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[Yn],delete e[po],delete e[_u],delete e[k_],delete e[z_])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function kg(t){return t.tag===5||t.tag===3||t.tag===4}function rh(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||kg(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Du(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Va));else if(i!==4&&(t=t.child,t!==null))for(Du(t,e,n),t=t.sibling;t!==null;)Du(t,e,n),t=t.sibling}function Uu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(t=t.child,t!==null))for(Uu(t,e,n),t=t.sibling;t!==null;)Uu(t,e,n),t=t.sibling}var Lt=null,In=!1;function _i(t,e,n){for(n=n.child;n!==null;)zg(t,e,n),n=n.sibling}function zg(t,e,n){if($n&&typeof $n.onCommitFiberUnmount=="function")try{$n.onCommitFiberUnmount(hl,n)}catch{}switch(n.tag){case 5:Ht||Zr(n,e);case 6:var i=Lt,r=In;Lt=null,_i(t,e,n),Lt=i,In=r,Lt!==null&&(In?(t=Lt,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Lt.removeChild(n.stateNode));break;case 18:Lt!==null&&(In?(t=Lt,n=n.stateNode,t.nodeType===8?Ql(t.parentNode,n):t.nodeType===1&&Ql(t,n),lo(t)):Ql(Lt,n.stateNode));break;case 4:i=Lt,r=In,Lt=n.stateNode.containerInfo,In=!0,_i(t,e,n),Lt=i,In=r;break;case 0:case 11:case 14:case 15:if(!Ht&&(i=n.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,o=s.destroy;s=s.tag,o!==void 0&&(s&2||s&4)&&Lu(n,e,o),r=r.next}while(r!==i)}_i(t,e,n);break;case 1:if(!Ht&&(Zr(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=n.memoizedProps,i.state=n.memoizedState,i.componentWillUnmount()}catch(a){ht(n,e,a)}_i(t,e,n);break;case 21:_i(t,e,n);break;case 22:n.mode&1?(Ht=(i=Ht)||n.memoizedState!==null,_i(t,e,n),Ht=i):_i(t,e,n);break;default:_i(t,e,n)}}function sh(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new tx),e.forEach(function(i){var r=fx.bind(null,t,i);n.has(i)||(n.add(i),i.then(r,r))})}}function Pn(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i];try{var s=t,o=e,a=o;e:for(;a!==null;){switch(a.tag){case 5:Lt=a.stateNode,In=!1;break e;case 3:Lt=a.stateNode.containerInfo,In=!0;break e;case 4:Lt=a.stateNode.containerInfo,In=!0;break e}a=a.return}if(Lt===null)throw Error(ee(160));zg(s,o,r),Lt=null,In=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(c){ht(r,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)Bg(e,t),e=e.sibling}function Bg(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Pn(e,t),Xn(t),i&4){try{Zs(3,t,t.return),Sl(3,t)}catch(_){ht(t,t.return,_)}try{Zs(5,t,t.return)}catch(_){ht(t,t.return,_)}}break;case 1:Pn(e,t),Xn(t),i&512&&n!==null&&Zr(n,n.return);break;case 5:if(Pn(e,t),Xn(t),i&512&&n!==null&&Zr(n,n.return),t.flags&32){var r=t.stateNode;try{ro(r,"")}catch(_){ht(t,t.return,_)}}if(i&4&&(r=t.stateNode,r!=null)){var s=t.memoizedProps,o=n!==null?n.memoizedProps:s,a=t.type,l=t.updateQueue;if(t.updateQueue=null,l!==null)try{a==="input"&&s.type==="radio"&&s.name!=null&&lm(r,s),ru(a,o);var c=ru(a,s);for(o=0;o<l.length;o+=2){var f=l[o],h=l[o+1];f==="style"?hm(r,h):f==="dangerouslySetInnerHTML"?fm(r,h):f==="children"?ro(r,h):tf(r,f,h,c)}switch(a){case"input":Qc(r,s);break;case"textarea":cm(r,s);break;case"select":var d=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var p=s.value;p!=null?ts(r,!!s.multiple,p,!1):d!==!!s.multiple&&(s.defaultValue!=null?ts(r,!!s.multiple,s.defaultValue,!0):ts(r,!!s.multiple,s.multiple?[]:"",!1))}r[po]=s}catch(_){ht(t,t.return,_)}}break;case 6:if(Pn(e,t),Xn(t),i&4){if(t.stateNode===null)throw Error(ee(162));r=t.stateNode,s=t.memoizedProps;try{r.nodeValue=s}catch(_){ht(t,t.return,_)}}break;case 3:if(Pn(e,t),Xn(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{lo(e.containerInfo)}catch(_){ht(t,t.return,_)}break;case 4:Pn(e,t),Xn(t);break;case 13:Pn(e,t),Xn(t),r=t.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(If=mt())),i&4&&sh(t);break;case 22:if(f=n!==null&&n.memoizedState!==null,t.mode&1?(Ht=(c=Ht)||f,Pn(e,t),Ht=c):Pn(e,t),Xn(t),i&8192){if(c=t.memoizedState!==null,(t.stateNode.isHidden=c)&&!f&&t.mode&1)for(fe=t,f=t.child;f!==null;){for(h=fe=f;fe!==null;){switch(d=fe,p=d.child,d.tag){case 0:case 11:case 14:case 15:Zs(4,d,d.return);break;case 1:Zr(d,d.return);var x=d.stateNode;if(typeof x.componentWillUnmount=="function"){i=d,n=d.return;try{e=i,x.props=e.memoizedProps,x.state=e.memoizedState,x.componentWillUnmount()}catch(_){ht(i,n,_)}}break;case 5:Zr(d,d.return);break;case 22:if(d.memoizedState!==null){ah(h);continue}}p!==null?(p.return=d,fe=p):ah(h)}f=f.sibling}e:for(f=null,h=t;;){if(h.tag===5){if(f===null){f=h;try{r=h.stateNode,c?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(a=h.stateNode,l=h.memoizedProps.style,o=l!=null&&l.hasOwnProperty("display")?l.display:null,a.style.display=dm("display",o))}catch(_){ht(t,t.return,_)}}}else if(h.tag===6){if(f===null)try{h.stateNode.nodeValue=c?"":h.memoizedProps}catch(_){ht(t,t.return,_)}}else if((h.tag!==22&&h.tag!==23||h.memoizedState===null||h===t)&&h.child!==null){h.child.return=h,h=h.child;continue}if(h===t)break e;for(;h.sibling===null;){if(h.return===null||h.return===t)break e;f===h&&(f=null),h=h.return}f===h&&(f=null),h.sibling.return=h.return,h=h.sibling}}break;case 19:Pn(e,t),Xn(t),i&4&&sh(t);break;case 21:break;default:Pn(e,t),Xn(t)}}function Xn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(kg(n)){var i=n;break e}n=n.return}throw Error(ee(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(ro(r,""),i.flags&=-33);var s=rh(t);Uu(t,s,r);break;case 3:case 4:var o=i.stateNode.containerInfo,a=rh(t);Du(t,a,o);break;default:throw Error(ee(161))}}catch(l){ht(t,t.return,l)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function ix(t,e,n){fe=t,Hg(t)}function Hg(t,e,n){for(var i=(t.mode&1)!==0;fe!==null;){var r=fe,s=r.child;if(r.tag===22&&i){var o=r.memoizedState!==null||Yo;if(!o){var a=r.alternate,l=a!==null&&a.memoizedState!==null||Ht;a=Yo;var c=Ht;if(Yo=o,(Ht=l)&&!c)for(fe=r;fe!==null;)o=fe,l=o.child,o.tag===22&&o.memoizedState!==null?lh(r):l!==null?(l.return=o,fe=l):lh(r);for(;s!==null;)fe=s,Hg(s),s=s.sibling;fe=r,Yo=a,Ht=c}oh(t)}else r.subtreeFlags&8772&&s!==null?(s.return=r,fe=s):oh(t)}}function oh(t){for(;fe!==null;){var e=fe;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:Ht||Sl(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!Ht)if(n===null)i.componentDidMount();else{var r=e.elementType===e.type?n.memoizedProps:Un(e.type,n.memoizedProps);i.componentDidUpdate(r,n.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Wd(e,s,i);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}Wd(e,o,n)}break;case 5:var a=e.stateNode;if(n===null&&e.flags&4){n=a;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var f=c.memoizedState;if(f!==null){var h=f.dehydrated;h!==null&&lo(h)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(ee(163))}Ht||e.flags&512&&Nu(e)}catch(d){ht(e,e.return,d)}}if(e===t){fe=null;break}if(n=e.sibling,n!==null){n.return=e.return,fe=n;break}fe=e.return}}function ah(t){for(;fe!==null;){var e=fe;if(e===t){fe=null;break}var n=e.sibling;if(n!==null){n.return=e.return,fe=n;break}fe=e.return}}function lh(t){for(;fe!==null;){var e=fe;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Sl(4,e)}catch(l){ht(e,n,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){ht(e,r,l)}}var s=e.return;try{Nu(e)}catch(l){ht(e,s,l)}break;case 5:var o=e.return;try{Nu(e)}catch(l){ht(e,o,l)}}}catch(l){ht(e,e.return,l)}if(e===t){fe=null;break}var a=e.sibling;if(a!==null){a.return=e.return,fe=a;break}fe=e.return}}var rx=Math.ceil,el=gi.ReactCurrentDispatcher,Df=gi.ReactCurrentOwner,An=gi.ReactCurrentBatchConfig,qe=0,Pt=null,_t=null,Dt=0,un=0,Jr=qi(0),St=0,yo=null,_r=0,Ml=0,Uf=0,Js=null,en=null,If=0,ms=1/0,si=null,tl=!1,Iu=null,Oi=null,$o=!1,bi=null,nl=0,Qs=0,Fu=null,La=-1,Na=0;function Kt(){return qe&6?mt():La!==-1?La:La=mt()}function ki(t){return t.mode&1?qe&2&&Dt!==0?Dt&-Dt:H_.transition!==null?(Na===0&&(Na=wm()),Na):(t=$e,t!==0||(t=window.event,t=t===void 0?16:Nm(t.type)),t):1}function Gn(t,e,n,i){if(50<Qs)throw Qs=0,Fu=null,Error(ee(185));wo(t,n,i),(!(qe&2)||t!==Pt)&&(t===Pt&&(!(qe&2)&&(Ml|=n),St===4&&Ci(t,Dt)),sn(t,i),n===1&&qe===0&&!(e.mode&1)&&(ms=mt()+500,_l&&Yi()))}function sn(t,e){var n=t.callbackNode;Hv(t,e);var i=za(t,t===Pt?Dt:0);if(i===0)n!==null&&vd(n),t.callbackNode=null,t.callbackPriority=0;else if(e=i&-i,t.callbackPriority!==e){if(n!=null&&vd(n),e===1)t.tag===0?B_(ch.bind(null,t)):Zm(ch.bind(null,t)),F_(function(){!(qe&6)&&Yi()}),n=null;else{switch(Am(i)){case 1:n=af;break;case 4:n=Em;break;case 16:n=ka;break;case 536870912:n=Tm;break;default:n=ka}n=$g(n,Gg.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function Gg(t,e){if(La=-1,Na=0,qe&6)throw Error(ee(327));var n=t.callbackNode;if(os()&&t.callbackNode!==n)return null;var i=za(t,t===Pt?Dt:0);if(i===0)return null;if(i&30||i&t.expiredLanes||e)e=il(t,i);else{e=i;var r=qe;qe|=2;var s=Wg();(Pt!==t||Dt!==e)&&(si=null,ms=mt()+500,ur(t,e));do try{ax();break}catch(a){Vg(t,a)}while(!0);yf(),el.current=s,qe=r,_t!==null?e=0:(Pt=null,Dt=0,e=St)}if(e!==0){if(e===2&&(r=cu(t),r!==0&&(i=r,e=Ou(t,r))),e===1)throw n=yo,ur(t,0),Ci(t,i),sn(t,mt()),n;if(e===6)Ci(t,i);else{if(r=t.current.alternate,!(i&30)&&!sx(r)&&(e=il(t,i),e===2&&(s=cu(t),s!==0&&(i=s,e=Ou(t,s))),e===1))throw n=yo,ur(t,0),Ci(t,i),sn(t,mt()),n;switch(t.finishedWork=r,t.finishedLanes=i,e){case 0:case 1:throw Error(ee(345));case 2:nr(t,en,si);break;case 3:if(Ci(t,i),(i&130023424)===i&&(e=If+500-mt(),10<e)){if(za(t,0)!==0)break;if(r=t.suspendedLanes,(r&i)!==i){Kt(),t.pingedLanes|=t.suspendedLanes&r;break}t.timeoutHandle=vu(nr.bind(null,t,en,si),e);break}nr(t,en,si);break;case 4:if(Ci(t,i),(i&4194240)===i)break;for(e=t.eventTimes,r=-1;0<i;){var o=31-Hn(i);s=1<<o,o=e[o],o>r&&(r=o),i&=~s}if(i=r,i=mt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*rx(i/1960))-i,10<i){t.timeoutHandle=vu(nr.bind(null,t,en,si),i);break}nr(t,en,si);break;case 5:nr(t,en,si);break;default:throw Error(ee(329))}}}return sn(t,mt()),t.callbackNode===n?Gg.bind(null,t):null}function Ou(t,e){var n=Js;return t.current.memoizedState.isDehydrated&&(ur(t,e).flags|=256),t=il(t,e),t!==2&&(e=en,en=n,e!==null&&ku(e)),t}function ku(t){en===null?en=t:en.push.apply(en,t)}function sx(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!Vn(s(),r))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Ci(t,e){for(e&=~Uf,e&=~Ml,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-Hn(e),i=1<<n;t[n]=-1,e&=~i}}function ch(t){if(qe&6)throw Error(ee(327));os();var e=za(t,0);if(!(e&1))return sn(t,mt()),null;var n=il(t,e);if(t.tag!==0&&n===2){var i=cu(t);i!==0&&(e=i,n=Ou(t,i))}if(n===1)throw n=yo,ur(t,0),Ci(t,e),sn(t,mt()),n;if(n===6)throw Error(ee(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,nr(t,en,si),sn(t,mt()),null}function Ff(t,e){var n=qe;qe|=1;try{return t(e)}finally{qe=n,qe===0&&(ms=mt()+500,_l&&Yi())}}function xr(t){bi!==null&&bi.tag===0&&!(qe&6)&&os();var e=qe;qe|=1;var n=An.transition,i=$e;try{if(An.transition=null,$e=1,t)return t()}finally{$e=i,An.transition=n,qe=e,!(qe&6)&&Yi()}}function Of(){un=Jr.current,rt(Jr)}function ur(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,I_(n)),_t!==null)for(n=_t.return;n!==null;){var i=n;switch(vf(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&Wa();break;case 3:hs(),rt(nn),rt(Vt),Af();break;case 5:wf(i);break;case 4:hs();break;case 13:rt(lt);break;case 19:rt(lt);break;case 10:Sf(i.type._context);break;case 22:case 23:Of()}n=n.return}if(Pt=t,_t=t=zi(t.current,null),Dt=un=e,St=0,yo=null,Uf=Ml=_r=0,en=Js=null,lr!==null){for(e=0;e<lr.length;e++)if(n=lr[e],i=n.interleaved,i!==null){n.interleaved=null;var r=i.next,s=n.pending;if(s!==null){var o=s.next;s.next=r,i.next=o}n.pending=i}lr=null}return t}function Vg(t,e){do{var n=_t;try{if(yf(),Ra.current=Qa,Ja){for(var i=ct.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}Ja=!1}if(vr=0,Rt=yt=ct=null,Ks=!1,vo=0,Df.current=null,n===null||n.return===null){St=1,yo=e,_t=null;break}e:{var s=t,o=n.return,a=n,l=e;if(e=Dt,a.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var c=l,f=a,h=f.tag;if(!(f.mode&1)&&(h===0||h===11||h===15)){var d=f.alternate;d?(f.updateQueue=d.updateQueue,f.memoizedState=d.memoizedState,f.lanes=d.lanes):(f.updateQueue=null,f.memoizedState=null)}var p=Kd(o);if(p!==null){p.flags&=-257,Zd(p,o,a,s,e),p.mode&1&&$d(s,c,e),e=p,l=c;var x=e.updateQueue;if(x===null){var _=new Set;_.add(l),e.updateQueue=_}else x.add(l);break e}else{if(!(e&1)){$d(s,c,e),kf();break e}l=Error(ee(426))}}else if(st&&a.mode&1){var m=Kd(o);if(m!==null){!(m.flags&65536)&&(m.flags|=256),Zd(m,o,a,s,e),_f(ps(l,a));break e}}s=l=ps(l,a),St!==4&&(St=2),Js===null?Js=[s]:Js.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var u=Ag(s,l,e);Vd(s,u);break e;case 1:a=l;var v=s.type,g=s.stateNode;if(!(s.flags&128)&&(typeof v.getDerivedStateFromError=="function"||g!==null&&typeof g.componentDidCatch=="function"&&(Oi===null||!Oi.has(g)))){s.flags|=65536,e&=-e,s.lanes|=e;var y=Cg(s,a,e);Vd(s,y);break e}}s=s.return}while(s!==null)}jg(n)}catch(R){e=R,_t===n&&n!==null&&(_t=n=n.return);continue}break}while(!0)}function Wg(){var t=el.current;return el.current=Qa,t===null?Qa:t}function kf(){(St===0||St===3||St===2)&&(St=4),Pt===null||!(_r&268435455)&&!(Ml&268435455)||Ci(Pt,Dt)}function il(t,e){var n=qe;qe|=2;var i=Wg();(Pt!==t||Dt!==e)&&(si=null,ur(t,e));do try{ox();break}catch(r){Vg(t,r)}while(!0);if(yf(),qe=n,el.current=i,_t!==null)throw Error(ee(261));return Pt=null,Dt=0,St}function ox(){for(;_t!==null;)Xg(_t)}function ax(){for(;_t!==null&&!Nv();)Xg(_t)}function Xg(t){var e=Yg(t.alternate,t,un);t.memoizedProps=t.pendingProps,e===null?jg(t):_t=e,Df.current=null}function jg(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=ex(n,e),n!==null){n.flags&=32767,_t=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{St=6,_t=null;return}}else if(n=Q_(n,e,un),n!==null){_t=n;return}if(e=e.sibling,e!==null){_t=e;return}_t=e=t}while(e!==null);St===0&&(St=5)}function nr(t,e,n){var i=$e,r=An.transition;try{An.transition=null,$e=1,lx(t,e,n,i)}finally{An.transition=r,$e=i}return null}function lx(t,e,n,i){do os();while(bi!==null);if(qe&6)throw Error(ee(327));n=t.finishedWork;var r=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(ee(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(Gv(t,s),t===Pt&&(_t=Pt=null,Dt=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||$o||($o=!0,$g(ka,function(){return os(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=An.transition,An.transition=null;var o=$e;$e=1;var a=qe;qe|=4,Df.current=null,nx(t,n),Bg(n,t),R_(mu),Ba=!!pu,mu=pu=null,t.current=n,ix(n),Dv(),qe=a,$e=o,An.transition=s}else t.current=n;if($o&&($o=!1,bi=t,nl=r),s=t.pendingLanes,s===0&&(Oi=null),Fv(n.stateNode),sn(t,mt()),e!==null)for(i=t.onRecoverableError,n=0;n<e.length;n++)r=e[n],i(r.value,{componentStack:r.stack,digest:r.digest});if(tl)throw tl=!1,t=Iu,Iu=null,t;return nl&1&&t.tag!==0&&os(),s=t.pendingLanes,s&1?t===Fu?Qs++:(Qs=0,Fu=t):Qs=0,Yi(),null}function os(){if(bi!==null){var t=Am(nl),e=An.transition,n=$e;try{if(An.transition=null,$e=16>t?16:t,bi===null)var i=!1;else{if(t=bi,bi=null,nl=0,qe&6)throw Error(ee(331));var r=qe;for(qe|=4,fe=t.current;fe!==null;){var s=fe,o=s.child;if(fe.flags&16){var a=s.deletions;if(a!==null){for(var l=0;l<a.length;l++){var c=a[l];for(fe=c;fe!==null;){var f=fe;switch(f.tag){case 0:case 11:case 15:Zs(8,f,s)}var h=f.child;if(h!==null)h.return=f,fe=h;else for(;fe!==null;){f=fe;var d=f.sibling,p=f.return;if(Og(f),f===c){fe=null;break}if(d!==null){d.return=p,fe=d;break}fe=p}}}var x=s.alternate;if(x!==null){var _=x.child;if(_!==null){x.child=null;do{var m=_.sibling;_.sibling=null,_=m}while(_!==null)}}fe=s}}if(s.subtreeFlags&2064&&o!==null)o.return=s,fe=o;else e:for(;fe!==null;){if(s=fe,s.flags&2048)switch(s.tag){case 0:case 11:case 15:Zs(9,s,s.return)}var u=s.sibling;if(u!==null){u.return=s.return,fe=u;break e}fe=s.return}}var v=t.current;for(fe=v;fe!==null;){o=fe;var g=o.child;if(o.subtreeFlags&2064&&g!==null)g.return=o,fe=g;else e:for(o=v;fe!==null;){if(a=fe,a.flags&2048)try{switch(a.tag){case 0:case 11:case 15:Sl(9,a)}}catch(R){ht(a,a.return,R)}if(a===o){fe=null;break e}var y=a.sibling;if(y!==null){y.return=a.return,fe=y;break e}fe=a.return}}if(qe=r,Yi(),$n&&typeof $n.onPostCommitFiberRoot=="function")try{$n.onPostCommitFiberRoot(hl,t)}catch{}i=!0}return i}finally{$e=n,An.transition=e}}return!1}function uh(t,e,n){e=ps(n,e),e=Ag(t,e,1),t=Fi(t,e,1),e=Kt(),t!==null&&(wo(t,1,e),sn(t,e))}function ht(t,e,n){if(t.tag===3)uh(t,t,n);else for(;e!==null;){if(e.tag===3){uh(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Oi===null||!Oi.has(i))){t=ps(n,t),t=Cg(e,t,1),e=Fi(e,t,1),t=Kt(),e!==null&&(wo(e,1,t),sn(e,t));break}}e=e.return}}function cx(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),e=Kt(),t.pingedLanes|=t.suspendedLanes&n,Pt===t&&(Dt&n)===n&&(St===4||St===3&&(Dt&130023424)===Dt&&500>mt()-If?ur(t,0):Uf|=n),sn(t,e)}function qg(t,e){e===0&&(t.mode&1?(e=zo,zo<<=1,!(zo&130023424)&&(zo=4194304)):e=1);var n=Kt();t=hi(t,e),t!==null&&(wo(t,e,n),sn(t,n))}function ux(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),qg(t,n)}function fx(t,e){var n=0;switch(t.tag){case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;default:throw Error(ee(314))}i!==null&&i.delete(e),qg(t,n)}var Yg;Yg=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||nn.current)tn=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return tn=!1,J_(t,e,n);tn=!!(t.flags&131072)}else tn=!1,st&&e.flags&1048576&&Jm(e,qa,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;Pa(t,e),t=e.pendingProps;var r=us(e,Vt.current);ss(e,n),r=Rf(null,e,i,t,r,n);var s=bf();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,rn(i)?(s=!0,Xa(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Ef(e),r.updater=yl,e.stateNode=r,r._reactInternals=e,Tu(e,i,t,n),e=Cu(null,e,i,!0,s,n)):(e.tag=0,st&&s&&gf(e),Yt(null,e,r,n),e=e.child),e;case 16:i=e.elementType;e:{switch(Pa(t,e),t=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=hx(i),t=Un(i,t),r){case 0:e=Au(null,e,i,t,n);break e;case 1:e=eh(null,e,i,t,n);break e;case 11:e=Jd(null,e,i,t,n);break e;case 14:e=Qd(null,e,i,Un(i.type,t),n);break e}throw Error(ee(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),Au(t,e,i,r,n);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),eh(t,e,i,r,n);case 3:e:{if(Lg(e),t===null)throw Error(ee(387));i=e.pendingProps,s=e.memoizedState,r=s.element,rg(t,e),Ka(e,i,null,n);var o=e.memoizedState;if(i=o.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=ps(Error(ee(423)),e),e=th(t,e,i,n,r);break e}else if(i!==r){r=ps(Error(ee(424)),e),e=th(t,e,i,n,r);break e}else for(dn=Ii(e.stateNode.containerInfo.firstChild),hn=e,st=!0,Fn=null,n=ng(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(fs(),i===r){e=pi(t,e,n);break e}Yt(t,e,i,n)}e=e.child}return e;case 5:return sg(e),t===null&&Su(e),i=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,o=r.children,gu(i,r)?o=null:s!==null&&gu(i,s)&&(e.flags|=32),Pg(t,e),Yt(t,e,o,n),e.child;case 6:return t===null&&Su(e),null;case 13:return Ng(t,e,n);case 4:return Tf(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=ds(e,null,i,n):Yt(t,e,i,n),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),Jd(t,e,i,r,n);case 7:return Yt(t,e,e.pendingProps,n),e.child;case 8:return Yt(t,e,e.pendingProps.children,n),e.child;case 12:return Yt(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,o=r.value,tt(Ya,i._currentValue),i._currentValue=o,s!==null)if(Vn(s.value,o)){if(s.children===r.children&&!nn.current){e=pi(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){o=s.child;for(var l=a.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=ui(-1,n&-n),l.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var f=c.pending;f===null?l.next=l:(l.next=f.next,f.next=l),c.pending=l}}s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),Mu(s.return,n,e),a.lanes|=n;break}l=l.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(ee(341));o.lanes|=n,a=o.alternate,a!==null&&(a.lanes|=n),Mu(o,n,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}Yt(t,e,r.children,n),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,ss(e,n),r=Cn(r),i=i(r),e.flags|=1,Yt(t,e,i,n),e.child;case 14:return i=e.type,r=Un(i,e.pendingProps),r=Un(i.type,r),Qd(t,e,i,r,n);case 15:return Rg(t,e,e.type,e.pendingProps,n);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),Pa(t,e),e.tag=1,rn(i)?(t=!0,Xa(e)):t=!1,ss(e,n),wg(e,i,r),Tu(e,i,r,n),Cu(null,e,i,!0,t,n);case 19:return Dg(t,e,n);case 22:return bg(t,e,n)}throw Error(ee(156,e.tag))};function $g(t,e){return Mm(t,e)}function dx(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function wn(t,e,n,i){return new dx(t,e,n,i)}function zf(t){return t=t.prototype,!(!t||!t.isReactComponent)}function hx(t){if(typeof t=="function")return zf(t)?1:0;if(t!=null){if(t=t.$$typeof,t===rf)return 11;if(t===sf)return 14}return 2}function zi(t,e){var n=t.alternate;return n===null?(n=wn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function Da(t,e,n,i,r,s){var o=2;if(i=t,typeof t=="function")zf(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case Gr:return fr(n.children,r,s,e);case nf:o=8,r|=8;break;case Yc:return t=wn(12,n,e,r|2),t.elementType=Yc,t.lanes=s,t;case $c:return t=wn(13,n,e,r),t.elementType=$c,t.lanes=s,t;case Kc:return t=wn(19,n,e,r),t.elementType=Kc,t.lanes=s,t;case sm:return El(n,r,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case im:o=10;break e;case rm:o=9;break e;case rf:o=11;break e;case sf:o=14;break e;case Ti:o=16,i=null;break e}throw Error(ee(130,t==null?t:typeof t,""))}return e=wn(o,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function fr(t,e,n,i){return t=wn(7,t,i,e),t.lanes=n,t}function El(t,e,n,i){return t=wn(22,t,i,e),t.elementType=sm,t.lanes=n,t.stateNode={isHidden:!1},t}function ac(t,e,n){return t=wn(6,t,null,e),t.lanes=n,t}function lc(t,e,n){return e=wn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function px(t,e,n,i,r){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Gl(0),this.expirationTimes=Gl(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Gl(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function Bf(t,e,n,i,r,s,o,a,l){return t=new px(t,e,n,a,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=wn(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:i,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Ef(s),t}function mx(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Hr,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}function Kg(t){if(!t)return Wi;t=t._reactInternals;e:{if(Er(t)!==t||t.tag!==1)throw Error(ee(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(rn(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(ee(171))}if(t.tag===1){var n=t.type;if(rn(n))return Km(t,n,e)}return e}function Zg(t,e,n,i,r,s,o,a,l){return t=Bf(n,i,!0,t,r,s,o,a,l),t.context=Kg(null),n=t.current,i=Kt(),r=ki(n),s=ui(i,r),s.callback=e??null,Fi(n,s,r),t.current.lanes=r,wo(t,r,i),sn(t,i),t}function Tl(t,e,n,i){var r=e.current,s=Kt(),o=ki(r);return n=Kg(n),e.context===null?e.context=n:e.pendingContext=n,e=ui(s,o),e.payload={element:t},i=i===void 0?null:i,i!==null&&(e.callback=i),t=Fi(r,e,o),t!==null&&(Gn(t,r,o,s),Ca(t,r,o)),o}function rl(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function fh(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Hf(t,e){fh(t,e),(t=t.alternate)&&fh(t,e)}function gx(){return null}var Jg=typeof reportError=="function"?reportError:function(t){console.error(t)};function Gf(t){this._internalRoot=t}wl.prototype.render=Gf.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(ee(409));Tl(t,e,null,null)};wl.prototype.unmount=Gf.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;xr(function(){Tl(null,t,null,null)}),e[di]=null}};function wl(t){this._internalRoot=t}wl.prototype.unstable_scheduleHydration=function(t){if(t){var e=bm();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Ai.length&&e!==0&&e<Ai[n].priority;n++);Ai.splice(n,0,t),n===0&&Lm(t)}};function Vf(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Al(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function dh(){}function vx(t,e,n,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var c=rl(o);s.call(c)}}var o=Zg(e,i,t,0,null,!1,!1,"",dh);return t._reactRootContainer=o,t[di]=o.current,fo(t.nodeType===8?t.parentNode:t),xr(),o}for(;r=t.lastChild;)t.removeChild(r);if(typeof i=="function"){var a=i;i=function(){var c=rl(l);a.call(c)}}var l=Bf(t,0,!1,null,null,!1,!1,"",dh);return t._reactRootContainer=l,t[di]=l.current,fo(t.nodeType===8?t.parentNode:t),xr(function(){Tl(e,l,n,i)}),l}function Cl(t,e,n,i,r){var s=n._reactRootContainer;if(s){var o=s;if(typeof r=="function"){var a=r;r=function(){var l=rl(o);a.call(l)}}Tl(e,o,t,r)}else o=vx(n,e,t,r,i);return rl(o)}Cm=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=Vs(e.pendingLanes);n!==0&&(lf(e,n|1),sn(e,mt()),!(qe&6)&&(ms=mt()+500,Yi()))}break;case 13:xr(function(){var i=hi(t,1);if(i!==null){var r=Kt();Gn(i,t,1,r)}}),Hf(t,1)}};cf=function(t){if(t.tag===13){var e=hi(t,134217728);if(e!==null){var n=Kt();Gn(e,t,134217728,n)}Hf(t,134217728)}};Rm=function(t){if(t.tag===13){var e=ki(t),n=hi(t,e);if(n!==null){var i=Kt();Gn(n,t,e,i)}Hf(t,e)}};bm=function(){return $e};Pm=function(t,e){var n=$e;try{return $e=t,e()}finally{$e=n}};ou=function(t,e,n){switch(e){case"input":if(Qc(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=vl(i);if(!r)throw Error(ee(90));am(i),Qc(i,r)}}}break;case"textarea":cm(t,n);break;case"select":e=n.value,e!=null&&ts(t,!!n.multiple,e,!1)}};gm=Ff;vm=xr;var _x={usingClientEntryPoint:!1,Events:[Co,jr,vl,pm,mm,Ff]},Is={findFiberByHostInstance:ar,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},xx={bundleType:Is.bundleType,version:Is.version,rendererPackageName:Is.rendererPackageName,rendererConfig:Is.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:gi.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=ym(t),t===null?null:t.stateNode},findFiberByHostInstance:Is.findFiberByHostInstance||gx,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Ko=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Ko.isDisabled&&Ko.supportsFiber)try{hl=Ko.inject(xx),$n=Ko}catch{}}gn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=_x;gn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Vf(e))throw Error(ee(200));return mx(t,e,null,n)};gn.createRoot=function(t,e){if(!Vf(t))throw Error(ee(299));var n=!1,i="",r=Jg;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=Bf(t,1,!1,null,null,n,!1,i,r),t[di]=e.current,fo(t.nodeType===8?t.parentNode:t),new Gf(e)};gn.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(ee(188)):(t=Object.keys(t).join(","),Error(ee(268,t)));return t=ym(e),t=t===null?null:t.stateNode,t};gn.flushSync=function(t){return xr(t)};gn.hydrate=function(t,e,n){if(!Al(e))throw Error(ee(200));return Cl(null,t,e,!0,n)};gn.hydrateRoot=function(t,e,n){if(!Vf(t))throw Error(ee(405));var i=n!=null&&n.hydratedSources||null,r=!1,s="",o=Jg;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=Zg(e,null,t,1,n??null,r,!1,s,o),t[di]=e.current,fo(t),i)for(t=0;t<i.length;t++)n=i[t],r=n._getVersion,r=r(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,r]:e.mutableSourceEagerHydrationData.push(n,r);return new wl(e)};gn.render=function(t,e,n){if(!Al(e))throw Error(ee(200));return Cl(null,t,e,!1,n)};gn.unmountComponentAtNode=function(t){if(!Al(t))throw Error(ee(40));return t._reactRootContainer?(xr(function(){Cl(null,null,t,!1,function(){t._reactRootContainer=null,t[di]=null})}),!0):!1};gn.unstable_batchedUpdates=Ff;gn.unstable_renderSubtreeIntoContainer=function(t,e,n,i){if(!Al(n))throw Error(ee(200));if(t==null||t._reactInternals===void 0)throw Error(ee(38));return Cl(t,e,n,!1,i)};gn.version="18.3.1-next-f1338f8080-20240426";function Qg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Qg)}catch(t){console.error(t)}}Qg(),Qp.exports=gn;var yx=Qp.exports,hh=yx;jc.createRoot=hh.createRoot,jc.hydrateRoot=hh.hydrateRoot;/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Sx={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mx=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),xt=(t,e)=>{const n=Re.forwardRef(({color:i="currentColor",size:r=24,strokeWidth:s=2,absoluteStrokeWidth:o,className:a="",children:l,...c},f)=>Re.createElement("svg",{ref:f,...Sx,width:r,height:r,stroke:i,strokeWidth:o?Number(s)*24/Number(r):s,className:["lucide",`lucide-${Mx(t)}`,a].join(" "),...c},[...e.map(([h,d])=>Re.createElement(h,d)),...Array.isArray(l)?l:[l]]));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ex=xt("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tx=xt("Compass",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polygon",{points:"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76",key:"m9r19z"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wx=xt("Gamepad2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ax=xt("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cx=xt("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rx=xt("MoveUpRight",[["path",{d:"M13 5H19V11",key:"1n1gyv"}],["path",{d:"M19 5L5 19",key:"72u4yj"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bx=xt("Package",[["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}],["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Px=xt("Pause",[["rect",{width:"4",height:"16",x:"6",y:"4",key:"iffhe4"}],["rect",{width:"4",height:"16",x:"14",y:"4",key:"sjin7j"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lx=xt("Play",[["polygon",{points:"5 3 19 12 5 21 5 3",key:"191637"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nx=xt("Printer",[["polyline",{points:"6 9 6 2 18 2 18 9",key:"1306q4"}],["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["rect",{width:"12",height:"8",x:"6",y:"14",key:"5ipwut"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dx=xt("Radio",[["path",{d:"M4.9 19.1C1 15.2 1 8.8 4.9 4.9",key:"1vaf9d"}],["path",{d:"M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5",key:"u1ii0m"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5",key:"1j5fej"}],["path",{d:"M19.1 4.9C23 8.8 23 15.1 19.1 19",key:"10b0cb"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const e0=xt("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ux=xt("Scale",[["path",{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"7g6ntu"}],["path",{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"ijws7r"}],["path",{d:"M7 21h10",key:"1b0cd5"}],["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",key:"3gwbw2"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t0=xt("Sliders",[["line",{x1:"4",x2:"4",y1:"21",y2:"14",key:"1p332r"}],["line",{x1:"4",x2:"4",y1:"10",y2:"3",key:"gb41h5"}],["line",{x1:"12",x2:"12",y1:"21",y2:"12",key:"hf2csr"}],["line",{x1:"12",x2:"12",y1:"8",y2:"3",key:"1kfi7u"}],["line",{x1:"20",x2:"20",y1:"21",y2:"16",key:"1lhrwl"}],["line",{x1:"20",x2:"20",y1:"12",y2:"3",key:"16vvfq"}],["line",{x1:"2",x2:"6",y1:"14",y2:"14",key:"1uebub"}],["line",{x1:"10",x2:"14",y1:"8",y2:"8",key:"1yglbp"}],["line",{x1:"18",x2:"22",y1:"16",y2:"16",key:"1jxqpz"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ix=xt("Smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fx=xt("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ox=xt("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kx=xt("Video",[["path",{d:"m22 8-6 4 6 4V8Z",key:"50v9me"}],["rect",{width:"14",height:"12",x:"2",y:"6",rx:"2",ry:"2",key:"1rqjg6"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zx=xt("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n0=xt("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]]);function Bx({currentView:t,setCurrentView:e,onOpenEkfModal:n,onAddSample:i,onExportLeRobot:r,onIsaacReplay:s}){return L.jsxs("header",{className:"bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40",children:[L.jsxs("div",{className:"flex items-center gap-3",children:[L.jsx("div",{className:"w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shadow-lg shadow-indigo-500/20",children:L.jsx("div",{className:"w-3 h-3 bg-indigo-400 rounded-full animate-pulse"})}),L.jsxs("div",{children:[L.jsx("h1",{className:"text-sm font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent",children:"OmniKin 3D Trajectory Manager"}),L.jsx("p",{className:"text-[10px] text-slate-400",children:"Dual-ArUco 8-Point PnP & 12-State EKF Engine"})]})]}),L.jsxs("div",{className:"flex items-center gap-2",children:[L.jsxs("div",{className:"bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center gap-1 mr-2",children:[L.jsxs("button",{onClick:()=>e("dashboard"),className:`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${t==="dashboard"?"bg-indigo-600 text-white shadow-md shadow-indigo-600/30":"text-slate-400 hover:text-slate-200"}`,children:[L.jsx(Cx,{className:"w-3.5 h-3.5"}),L.jsx("span",{children:"Dashboard"})]}),L.jsxs("button",{onClick:()=>e("mobile"),className:`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${t==="mobile"?"bg-indigo-600 text-white shadow-md shadow-indigo-600/30":"text-slate-400 hover:text-slate-200"}`,children:[L.jsx(Ix,{className:"w-3.5 h-3.5"}),L.jsx("span",{children:"Mobile Logger"})]})]}),L.jsxs("button",{onClick:n,className:"px-3 py-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-medium flex items-center gap-1.5 transition-all",children:[L.jsx(t0,{className:"w-3.5 h-3.5"}),L.jsx("span",{children:"EKF Tuning"})]}),L.jsxs("button",{onClick:()=>window.open("/api/marker/print_dual","_blank"),className:"px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition-all",children:[L.jsx(Nx,{className:"w-3.5 h-3.5"}),L.jsx("span",{children:"Print Dual-ArUco"})]}),L.jsxs("button",{onClick:i,className:"px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium flex items-center gap-1.5 transition-all",children:[L.jsx(n0,{className:"w-3.5 h-3.5"}),L.jsx("span",{children:"Sample 3D Circle"})]}),L.jsxs("button",{onClick:s,className:"px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-medium flex items-center gap-1.5 transition-all",children:[L.jsx(wx,{className:"w-3.5 h-3.5"}),L.jsx("span",{children:"Isaac Lab"})]}),L.jsxs("button",{onClick:r,className:"px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all",children:[L.jsx(bx,{className:"w-3.5 h-3.5"}),L.jsx("span",{children:"Export LeRobot"})]})]})]})}/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Wf="160",Hx=0,ph=1,Gx=2,i0=1,Vx=2,ri=3,Xi=0,on=1,kn=2,Bi=0,as=1,mh=2,gh=3,vh=4,Wx=5,sr=100,Xx=101,jx=102,_h=103,xh=104,qx=200,Yx=201,$x=202,Kx=203,zu=204,Bu=205,Zx=206,Jx=207,Qx=208,ey=209,ty=210,ny=211,iy=212,ry=213,sy=214,oy=0,ay=1,ly=2,sl=3,cy=4,uy=5,fy=6,dy=7,r0=0,hy=1,py=2,Hi=0,my=1,gy=2,vy=3,_y=4,xy=5,yy=6,s0=300,gs=301,vs=302,Hu=303,Gu=304,Rl=306,Vu=1e3,zn=1001,Wu=1002,$t=1003,yh=1004,cc=1005,Mn=1006,Sy=1007,So=1008,Gi=1009,My=1010,Ey=1011,Xf=1012,o0=1013,Pi=1014,Li=1015,Mo=1016,a0=1017,l0=1018,dr=1020,Ty=1021,Bn=1023,wy=1024,Ay=1025,hr=1026,_s=1027,Cy=1028,c0=1029,Ry=1030,u0=1031,f0=1033,uc=33776,fc=33777,dc=33778,hc=33779,Sh=35840,Mh=35841,Eh=35842,Th=35843,d0=36196,wh=37492,Ah=37496,Ch=37808,Rh=37809,bh=37810,Ph=37811,Lh=37812,Nh=37813,Dh=37814,Uh=37815,Ih=37816,Fh=37817,Oh=37818,kh=37819,zh=37820,Bh=37821,pc=36492,Hh=36494,Gh=36495,by=36283,Vh=36284,Wh=36285,Xh=36286,h0=3e3,pr=3001,Py=3200,Ly=3201,p0=0,Ny=1,Tn="",Nt="srgb",mi="srgb-linear",jf="display-p3",bl="display-p3-linear",ol="linear",it="srgb",al="rec709",ll="p3",wr=7680,jh=519,Dy=512,Uy=513,Iy=514,m0=515,Fy=516,Oy=517,ky=518,zy=519,qh=35044,Yh="300 es",Xu=1035,ci=2e3,cl=2001;class Es{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const zt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],mc=Math.PI/180,ju=180/Math.PI;function bo(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(zt[t&255]+zt[t>>8&255]+zt[t>>16&255]+zt[t>>24&255]+"-"+zt[e&255]+zt[e>>8&255]+"-"+zt[e>>16&15|64]+zt[e>>24&255]+"-"+zt[n&63|128]+zt[n>>8&255]+"-"+zt[n>>16&255]+zt[n>>24&255]+zt[i&255]+zt[i>>8&255]+zt[i>>16&255]+zt[i>>24&255]).toLowerCase()}function Gt(t,e,n){return Math.max(e,Math.min(n,t))}function By(t,e){return(t%e+e)%e}function gc(t,e,n){return(1-n)*t+n*e}function $h(t){return(t&t-1)===0&&t!==0}function qu(t){return Math.pow(2,Math.floor(Math.log(t)/Math.LN2))}function Fs(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function Qt(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}class Me{constructor(e=0,n=0){Me.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(Gt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ge{constructor(e,n,i,r,s,o,a,l,c){Ge.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,o,a,l,c)}set(e,n,i,r,s,o,a,l,c){const f=this.elements;return f[0]=e,f[1]=r,f[2]=a,f[3]=n,f[4]=s,f[5]=l,f[6]=i,f[7]=o,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],f=i[4],h=i[7],d=i[2],p=i[5],x=i[8],_=r[0],m=r[3],u=r[6],v=r[1],g=r[4],y=r[7],R=r[2],A=r[5],C=r[8];return s[0]=o*_+a*v+l*R,s[3]=o*m+a*g+l*A,s[6]=o*u+a*y+l*C,s[1]=c*_+f*v+h*R,s[4]=c*m+f*g+h*A,s[7]=c*u+f*y+h*C,s[2]=d*_+p*v+x*R,s[5]=d*m+p*g+x*A,s[8]=d*u+p*y+x*C,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],f=e[8];return n*o*f-n*a*c-i*s*f+i*a*l+r*s*c-r*o*l}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],f=e[8],h=f*o-a*c,d=a*l-f*s,p=c*s-o*l,x=n*h+i*d+r*p;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/x;return e[0]=h*_,e[1]=(r*c-f*i)*_,e[2]=(a*i-r*o)*_,e[3]=d*_,e[4]=(f*n-r*l)*_,e[5]=(r*s-a*n)*_,e[6]=p*_,e[7]=(i*l-c*n)*_,e[8]=(o*n-i*s)*_,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+n,0,0,1),this}scale(e,n){return this.premultiply(vc.makeScale(e,n)),this}rotate(e){return this.premultiply(vc.makeRotation(-e)),this}translate(e,n){return this.premultiply(vc.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const vc=new Ge;function g0(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function ul(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function Hy(){const t=ul("canvas");return t.style.display="block",t}const Kh={};function eo(t){t in Kh||(Kh[t]=!0,console.warn(t))}const Zh=new Ge().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Jh=new Ge().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Zo={[mi]:{transfer:ol,primaries:al,toReference:t=>t,fromReference:t=>t},[Nt]:{transfer:it,primaries:al,toReference:t=>t.convertSRGBToLinear(),fromReference:t=>t.convertLinearToSRGB()},[bl]:{transfer:ol,primaries:ll,toReference:t=>t.applyMatrix3(Jh),fromReference:t=>t.applyMatrix3(Zh)},[jf]:{transfer:it,primaries:ll,toReference:t=>t.convertSRGBToLinear().applyMatrix3(Jh),fromReference:t=>t.applyMatrix3(Zh).convertLinearToSRGB()}},Gy=new Set([mi,bl]),Ze={enabled:!0,_workingColorSpace:mi,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(t){if(!Gy.has(t))throw new Error(`Unsupported working color space, "${t}".`);this._workingColorSpace=t},convert:function(t,e,n){if(this.enabled===!1||e===n||!e||!n)return t;const i=Zo[e].toReference,r=Zo[n].fromReference;return r(i(t))},fromWorkingColorSpace:function(t,e){return this.convert(t,this._workingColorSpace,e)},toWorkingColorSpace:function(t,e){return this.convert(t,e,this._workingColorSpace)},getPrimaries:function(t){return Zo[t].primaries},getTransfer:function(t){return t===Tn?ol:Zo[t].transfer}};function ls(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function _c(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}let Ar;class v0{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ar===void 0&&(Ar=ul("canvas")),Ar.width=e.width,Ar.height=e.height;const i=Ar.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Ar}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=ul("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=ls(s[o]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(ls(n[i]/255)*255):n[i]=ls(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Vy=0;class _0{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Vy++}),this.uuid=bo(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(xc(r[o].image)):s.push(xc(r[o]))}else s=xc(r);i.url=s}return n||(e.images[this.uuid]=i),i}}function xc(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?v0.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Wy=0;class pn extends Es{constructor(e=pn.DEFAULT_IMAGE,n=pn.DEFAULT_MAPPING,i=zn,r=zn,s=Mn,o=So,a=Bn,l=Gi,c=pn.DEFAULT_ANISOTROPY,f=Tn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Wy++}),this.uuid=bo(),this.name="",this.source=new _0(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Me(0,0),this.repeat=new Me(1,1),this.center=new Me(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof f=="string"?this.colorSpace=f:(eo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=f===pr?Nt:Tn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==s0)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Vu:e.x=e.x-Math.floor(e.x);break;case zn:e.x=e.x<0?0:1;break;case Wu:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Vu:e.y=e.y-Math.floor(e.y);break;case zn:e.y=e.y<0?0:1;break;case Wu:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return eo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===Nt?pr:h0}set encoding(e){eo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===pr?Nt:Tn}}pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=s0;pn.DEFAULT_ANISOTROPY=1;class bt{constructor(e=0,n=0,i=0,r=1){bt.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*n+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*n+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*n+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*n+o[7]*i+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s;const l=e.elements,c=l[0],f=l[4],h=l[8],d=l[1],p=l[5],x=l[9],_=l[2],m=l[6],u=l[10];if(Math.abs(f-d)<.01&&Math.abs(h-_)<.01&&Math.abs(x-m)<.01){if(Math.abs(f+d)<.1&&Math.abs(h+_)<.1&&Math.abs(x+m)<.1&&Math.abs(c+p+u-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const g=(c+1)/2,y=(p+1)/2,R=(u+1)/2,A=(f+d)/4,C=(h+_)/4,U=(x+m)/4;return g>y&&g>R?g<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(g),r=A/i,s=C/i):y>R?y<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(y),i=A/r,s=U/r):R<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),i=C/s,r=U/s),this.set(i,r,s,n),this}let v=Math.sqrt((m-x)*(m-x)+(h-_)*(h-_)+(d-f)*(d-f));return Math.abs(v)<.001&&(v=1),this.x=(m-x)/v,this.y=(h-_)/v,this.z=(d-f)/v,this.w=Math.acos((c+p+u-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Xy extends Es{constructor(e=1,n=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new bt(0,0,e,n),this.scissorTest=!1,this.viewport=new bt(0,0,e,n);const r={width:e,height:n,depth:1};i.encoding!==void 0&&(eo("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===pr?Nt:Tn),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Mn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},i),this.texture=new pn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps,this.texture.internalFormat=i.internalFormat,this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}setSize(e,n,i=1){(this.width!==e||this.height!==n||this.depth!==i)&&(this.width=e,this.height=n,this.depth=i,this.texture.image.width=e,this.texture.image.height=n,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const n=Object.assign({},e.texture.image);return this.texture.source=new _0(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class yr extends Xy{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}}class x0 extends pn{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=$t,this.minFilter=$t,this.wrapR=zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class jy extends pn{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=$t,this.minFilter=$t,this.wrapR=zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Po{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,o,a){let l=i[r+0],c=i[r+1],f=i[r+2],h=i[r+3];const d=s[o+0],p=s[o+1],x=s[o+2],_=s[o+3];if(a===0){e[n+0]=l,e[n+1]=c,e[n+2]=f,e[n+3]=h;return}if(a===1){e[n+0]=d,e[n+1]=p,e[n+2]=x,e[n+3]=_;return}if(h!==_||l!==d||c!==p||f!==x){let m=1-a;const u=l*d+c*p+f*x+h*_,v=u>=0?1:-1,g=1-u*u;if(g>Number.EPSILON){const R=Math.sqrt(g),A=Math.atan2(R,u*v);m=Math.sin(m*A)/R,a=Math.sin(a*A)/R}const y=a*v;if(l=l*m+d*y,c=c*m+p*y,f=f*m+x*y,h=h*m+_*y,m===1-a){const R=1/Math.sqrt(l*l+c*c+f*f+h*h);l*=R,c*=R,f*=R,h*=R}}e[n]=l,e[n+1]=c,e[n+2]=f,e[n+3]=h}static multiplyQuaternionsFlat(e,n,i,r,s,o){const a=i[r],l=i[r+1],c=i[r+2],f=i[r+3],h=s[o],d=s[o+1],p=s[o+2],x=s[o+3];return e[n]=a*x+f*h+l*p-c*d,e[n+1]=l*x+f*d+c*h-a*p,e[n+2]=c*x+f*p+a*d-l*h,e[n+3]=f*x-a*h-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),f=a(r/2),h=a(s/2),d=l(i/2),p=l(r/2),x=l(s/2);switch(o){case"XYZ":this._x=d*f*h+c*p*x,this._y=c*p*h-d*f*x,this._z=c*f*x+d*p*h,this._w=c*f*h-d*p*x;break;case"YXZ":this._x=d*f*h+c*p*x,this._y=c*p*h-d*f*x,this._z=c*f*x-d*p*h,this._w=c*f*h+d*p*x;break;case"ZXY":this._x=d*f*h-c*p*x,this._y=c*p*h+d*f*x,this._z=c*f*x+d*p*h,this._w=c*f*h-d*p*x;break;case"ZYX":this._x=d*f*h-c*p*x,this._y=c*p*h+d*f*x,this._z=c*f*x-d*p*h,this._w=c*f*h+d*p*x;break;case"YZX":this._x=d*f*h+c*p*x,this._y=c*p*h+d*f*x,this._z=c*f*x-d*p*h,this._w=c*f*h-d*p*x;break;case"XZY":this._x=d*f*h-c*p*x,this._y=c*p*h-d*f*x,this._z=c*f*x+d*p*h,this._w=c*f*h+d*p*x;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],r=n[4],s=n[8],o=n[1],a=n[5],l=n[9],c=n[2],f=n[6],h=n[10],d=i+a+h;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(f-l)*p,this._y=(s-c)*p,this._z=(o-r)*p}else if(i>a&&i>h){const p=2*Math.sqrt(1+i-a-h);this._w=(f-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+c)/p}else if(a>h){const p=2*Math.sqrt(1+a-i-h);this._w=(s-c)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+f)/p}else{const p=2*Math.sqrt(1+h-i-a);this._w=(o-r)/p,this._x=(s+c)/p,this._y=(l+f)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Gt(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,r=e._y,s=e._z,o=e._w,a=n._x,l=n._y,c=n._z,f=n._w;return this._x=i*f+o*a+r*c-s*l,this._y=r*f+o*l+s*a-i*c,this._z=s*f+o*c+i*l-r*a,this._w=o*f-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-n;return this._w=p*o+n*this._w,this._x=p*i+n*this._x,this._y=p*r+n*this._y,this._z=p*s+n*this._z,this.normalize(),this}const c=Math.sqrt(l),f=Math.atan2(c,a),h=Math.sin((1-n)*f)/c,d=Math.sin(n*f)/c;return this._w=o*h+this._w*d,this._x=i*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=Math.random(),n=Math.sqrt(1-e),i=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(n*Math.cos(r),i*Math.sin(s),i*Math.cos(s),n*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class N{constructor(e=0,n=0,i=0){N.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(Qh.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(Qh.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){const n=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),f=2*(a*n-s*r),h=2*(s*i-o*n);return this.x=n+l*c+o*h-a*f,this.y=i+l*f+a*c-s*h,this.z=r+l*h+s*f-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,r=e.y,s=e.z,o=n.x,a=n.y,l=n.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return yc.copy(this).projectOnVector(e),this.sub(yc)}reflect(e){return this.sub(yc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(Gt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,n=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(n),this.y=i*Math.sin(n),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const yc=new N,Qh=new Po;class Lo{constructor(e=new N(1/0,1/0,1/0),n=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(Ln.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(Ln.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=Ln.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(n===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Ln):Ln.fromBufferAttribute(s,o),Ln.applyMatrix4(e.matrixWorld),this.expandByPoint(Ln);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Jo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Jo.copy(i.boundingBox)),Jo.applyMatrix4(e.matrixWorld),this.union(Jo)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Ln),Ln.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Os),Qo.subVectors(this.max,Os),Cr.subVectors(e.a,Os),Rr.subVectors(e.b,Os),br.subVectors(e.c,Os),xi.subVectors(Rr,Cr),yi.subVectors(br,Rr),Zi.subVectors(Cr,br);let n=[0,-xi.z,xi.y,0,-yi.z,yi.y,0,-Zi.z,Zi.y,xi.z,0,-xi.x,yi.z,0,-yi.x,Zi.z,0,-Zi.x,-xi.y,xi.x,0,-yi.y,yi.x,0,-Zi.y,Zi.x,0];return!Sc(n,Cr,Rr,br,Qo)||(n=[1,0,0,0,1,0,0,0,1],!Sc(n,Cr,Rr,br,Qo))?!1:(ea.crossVectors(xi,yi),n=[ea.x,ea.y,ea.z],Sc(n,Cr,Rr,br,Qo))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ln).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ln).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Qn=[new N,new N,new N,new N,new N,new N,new N,new N],Ln=new N,Jo=new Lo,Cr=new N,Rr=new N,br=new N,xi=new N,yi=new N,Zi=new N,Os=new N,Qo=new N,ea=new N,Ji=new N;function Sc(t,e,n,i,r){for(let s=0,o=t.length-3;s<=o;s+=3){Ji.fromArray(t,s);const a=r.x*Math.abs(Ji.x)+r.y*Math.abs(Ji.y)+r.z*Math.abs(Ji.z),l=e.dot(Ji),c=n.dot(Ji),f=i.dot(Ji);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>a)return!1}return!0}const qy=new Lo,ks=new N,Mc=new N;class Pl{constructor(e=new N,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):qy.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ks.subVectors(e,this.center);const n=ks.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(ks,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Mc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ks.copy(e.center).add(Mc)),this.expandByPoint(ks.copy(e.center).sub(Mc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ei=new N,Ec=new N,ta=new N,Si=new N,Tc=new N,na=new N,wc=new N;class y0{constructor(e=new N,n=new N(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ei)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=ei.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(ei.copy(this.origin).addScaledVector(this.direction,n),ei.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){Ec.copy(e).add(n).multiplyScalar(.5),ta.copy(n).sub(e).normalize(),Si.copy(this.origin).sub(Ec);const s=e.distanceTo(n)*.5,o=-this.direction.dot(ta),a=Si.dot(this.direction),l=-Si.dot(ta),c=Si.lengthSq(),f=Math.abs(1-o*o);let h,d,p,x;if(f>0)if(h=o*l-a,d=o*a-l,x=s*f,h>=0)if(d>=-x)if(d<=x){const _=1/f;h*=_,d*=_,p=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d<=-x?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),p=-h*h+d*(d+2*l)+c):d<=x?(h=0,d=Math.min(Math.max(-s,-l),s),p=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),p=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Ec).addScaledVector(ta,d),p}intersectSphere(e,n){ei.subVectors(e.center,this.origin);const i=ei.dot(this.direction),r=ei.dot(ei)-i*i,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,n):this.at(a,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,o,a,l;const c=1/this.direction.x,f=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),f>=0?(s=(e.min.y-d.y)*f,o=(e.max.y-d.y)*f):(s=(e.max.y-d.y)*f,o=(e.min.y-d.y)*f),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,ei)!==null}intersectTriangle(e,n,i,r,s){Tc.subVectors(n,e),na.subVectors(i,e),wc.crossVectors(Tc,na);let o=this.direction.dot(wc),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Si.subVectors(this.origin,e);const l=a*this.direction.dot(na.crossVectors(Si,na));if(l<0)return null;const c=a*this.direction.dot(Tc.cross(Si));if(c<0||l+c>o)return null;const f=-a*Si.dot(wc);return f<0?null:this.at(f/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class gt{constructor(e,n,i,r,s,o,a,l,c,f,h,d,p,x,_,m){gt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,o,a,l,c,f,h,d,p,x,_,m)}set(e,n,i,r,s,o,a,l,c,f,h,d,p,x,_,m){const u=this.elements;return u[0]=e,u[4]=n,u[8]=i,u[12]=r,u[1]=s,u[5]=o,u[9]=a,u[13]=l,u[2]=c,u[6]=f,u[10]=h,u[14]=d,u[3]=p,u[7]=x,u[11]=_,u[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new gt().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,i=e.elements,r=1/Pr.setFromMatrixColumn(e,0).length(),s=1/Pr.setFromMatrixColumn(e,1).length(),o=1/Pr.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*o,n[9]=i[9]*o,n[10]=i[10]*o,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),f=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const d=o*f,p=o*h,x=a*f,_=a*h;n[0]=l*f,n[4]=-l*h,n[8]=c,n[1]=p+x*c,n[5]=d-_*c,n[9]=-a*l,n[2]=_-d*c,n[6]=x+p*c,n[10]=o*l}else if(e.order==="YXZ"){const d=l*f,p=l*h,x=c*f,_=c*h;n[0]=d+_*a,n[4]=x*a-p,n[8]=o*c,n[1]=o*h,n[5]=o*f,n[9]=-a,n[2]=p*a-x,n[6]=_+d*a,n[10]=o*l}else if(e.order==="ZXY"){const d=l*f,p=l*h,x=c*f,_=c*h;n[0]=d-_*a,n[4]=-o*h,n[8]=x+p*a,n[1]=p+x*a,n[5]=o*f,n[9]=_-d*a,n[2]=-o*c,n[6]=a,n[10]=o*l}else if(e.order==="ZYX"){const d=o*f,p=o*h,x=a*f,_=a*h;n[0]=l*f,n[4]=x*c-p,n[8]=d*c+_,n[1]=l*h,n[5]=_*c+d,n[9]=p*c-x,n[2]=-c,n[6]=a*l,n[10]=o*l}else if(e.order==="YZX"){const d=o*l,p=o*c,x=a*l,_=a*c;n[0]=l*f,n[4]=_-d*h,n[8]=x*h+p,n[1]=h,n[5]=o*f,n[9]=-a*f,n[2]=-c*f,n[6]=p*h+x,n[10]=d-_*h}else if(e.order==="XZY"){const d=o*l,p=o*c,x=a*l,_=a*c;n[0]=l*f,n[4]=-h,n[8]=c*f,n[1]=d*h+_,n[5]=o*f,n[9]=p*h-x,n[2]=x*h-p,n[6]=a*f,n[10]=_*h+d}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Yy,e,$y)}lookAt(e,n,i){const r=this.elements;return ln.subVectors(e,n),ln.lengthSq()===0&&(ln.z=1),ln.normalize(),Mi.crossVectors(i,ln),Mi.lengthSq()===0&&(Math.abs(i.z)===1?ln.x+=1e-4:ln.z+=1e-4,ln.normalize(),Mi.crossVectors(i,ln)),Mi.normalize(),ia.crossVectors(ln,Mi),r[0]=Mi.x,r[4]=ia.x,r[8]=ln.x,r[1]=Mi.y,r[5]=ia.y,r[9]=ln.y,r[2]=Mi.z,r[6]=ia.z,r[10]=ln.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],f=i[1],h=i[5],d=i[9],p=i[13],x=i[2],_=i[6],m=i[10],u=i[14],v=i[3],g=i[7],y=i[11],R=i[15],A=r[0],C=r[4],U=r[8],M=r[12],T=r[1],W=r[5],q=r[9],ie=r[13],P=r[2],O=r[6],X=r[10],Y=r[14],D=r[3],F=r[7],k=r[11],$=r[15];return s[0]=o*A+a*T+l*P+c*D,s[4]=o*C+a*W+l*O+c*F,s[8]=o*U+a*q+l*X+c*k,s[12]=o*M+a*ie+l*Y+c*$,s[1]=f*A+h*T+d*P+p*D,s[5]=f*C+h*W+d*O+p*F,s[9]=f*U+h*q+d*X+p*k,s[13]=f*M+h*ie+d*Y+p*$,s[2]=x*A+_*T+m*P+u*D,s[6]=x*C+_*W+m*O+u*F,s[10]=x*U+_*q+m*X+u*k,s[14]=x*M+_*ie+m*Y+u*$,s[3]=v*A+g*T+y*P+R*D,s[7]=v*C+g*W+y*O+R*F,s[11]=v*U+g*q+y*X+R*k,s[15]=v*M+g*ie+y*Y+R*$,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],f=e[2],h=e[6],d=e[10],p=e[14],x=e[3],_=e[7],m=e[11],u=e[15];return x*(+s*l*h-r*c*h-s*a*d+i*c*d+r*a*p-i*l*p)+_*(+n*l*p-n*c*d+s*o*d-r*o*p+r*c*f-s*l*f)+m*(+n*c*h-n*a*p-s*o*h+i*o*p+s*a*f-i*c*f)+u*(-r*a*f-n*l*h+n*a*d+r*o*h-i*o*d+i*l*f)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],f=e[8],h=e[9],d=e[10],p=e[11],x=e[12],_=e[13],m=e[14],u=e[15],v=h*m*c-_*d*c+_*l*p-a*m*p-h*l*u+a*d*u,g=x*d*c-f*m*c-x*l*p+o*m*p+f*l*u-o*d*u,y=f*_*c-x*h*c+x*a*p-o*_*p-f*a*u+o*h*u,R=x*h*l-f*_*l-x*a*d+o*_*d+f*a*m-o*h*m,A=n*v+i*g+r*y+s*R;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/A;return e[0]=v*C,e[1]=(_*d*s-h*m*s-_*r*p+i*m*p+h*r*u-i*d*u)*C,e[2]=(a*m*s-_*l*s+_*r*c-i*m*c-a*r*u+i*l*u)*C,e[3]=(h*l*s-a*d*s-h*r*c+i*d*c+a*r*p-i*l*p)*C,e[4]=g*C,e[5]=(f*m*s-x*d*s+x*r*p-n*m*p-f*r*u+n*d*u)*C,e[6]=(x*l*s-o*m*s-x*r*c+n*m*c+o*r*u-n*l*u)*C,e[7]=(o*d*s-f*l*s+f*r*c-n*d*c-o*r*p+n*l*p)*C,e[8]=y*C,e[9]=(x*h*s-f*_*s-x*i*p+n*_*p+f*i*u-n*h*u)*C,e[10]=(o*_*s-x*a*s+x*i*c-n*_*c-o*i*u+n*a*u)*C,e[11]=(f*a*s-o*h*s-f*i*c+n*h*c+o*i*p-n*a*p)*C,e[12]=R*C,e[13]=(f*_*r-x*h*r+x*i*d-n*_*d-f*i*m+n*h*m)*C,e[14]=(x*a*r-o*_*r-x*i*l+n*_*l+o*i*m-n*a*m)*C,e[15]=(o*h*r-f*a*r+f*i*l-n*h*l-o*i*d+n*a*d)*C,this}scale(e){const n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,f=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,f*a+i,f*l-r*o,0,c*l-r*a,f*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){const r=this.elements,s=n._x,o=n._y,a=n._z,l=n._w,c=s+s,f=o+o,h=a+a,d=s*c,p=s*f,x=s*h,_=o*f,m=o*h,u=a*h,v=l*c,g=l*f,y=l*h,R=i.x,A=i.y,C=i.z;return r[0]=(1-(_+u))*R,r[1]=(p+y)*R,r[2]=(x-g)*R,r[3]=0,r[4]=(p-y)*A,r[5]=(1-(d+u))*A,r[6]=(m+v)*A,r[7]=0,r[8]=(x+g)*C,r[9]=(m-v)*C,r[10]=(1-(d+_))*C,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){const r=this.elements;let s=Pr.set(r[0],r[1],r[2]).length();const o=Pr.set(r[4],r[5],r[6]).length(),a=Pr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Nn.copy(this);const c=1/s,f=1/o,h=1/a;return Nn.elements[0]*=c,Nn.elements[1]*=c,Nn.elements[2]*=c,Nn.elements[4]*=f,Nn.elements[5]*=f,Nn.elements[6]*=f,Nn.elements[8]*=h,Nn.elements[9]*=h,Nn.elements[10]*=h,n.setFromRotationMatrix(Nn),i.x=s,i.y=o,i.z=a,this}makePerspective(e,n,i,r,s,o,a=ci){const l=this.elements,c=2*s/(n-e),f=2*s/(i-r),h=(n+e)/(n-e),d=(i+r)/(i-r);let p,x;if(a===ci)p=-(o+s)/(o-s),x=-2*o*s/(o-s);else if(a===cl)p=-o/(o-s),x=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=f,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,n,i,r,s,o,a=ci){const l=this.elements,c=1/(n-e),f=1/(i-r),h=1/(o-s),d=(n+e)*c,p=(i+r)*f;let x,_;if(a===ci)x=(o+s)*h,_=-2*h;else if(a===cl)x=s*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*f,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}}const Pr=new N,Nn=new gt,Yy=new N(0,0,0),$y=new N(1,1,1),Mi=new N,ia=new N,ln=new N,ep=new gt,tp=new Po;class Ll{constructor(e=0,n=0,i=0,r=Ll.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],f=r[9],h=r[2],d=r[6],p=r[10];switch(n){case"XYZ":this._y=Math.asin(Gt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-f,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Gt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Gt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Gt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Gt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Gt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-f,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return ep.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ep,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return tp.setFromEuler(this),this.setFromQuaternion(tp,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ll.DEFAULT_ORDER="XYZ";class S0{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Ky=0;const np=new N,Lr=new Po,ti=new gt,ra=new N,zs=new N,Zy=new N,Jy=new Po,ip=new N(1,0,0),rp=new N(0,1,0),sp=new N(0,0,1),Qy={type:"added"},eS={type:"removed"};class Ut extends Es{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ky++}),this.uuid=bo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ut.DEFAULT_UP.clone();const e=new N,n=new Ll,i=new Po,r=new N(1,1,1);function s(){i.setFromEuler(n,!1)}function o(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new gt},normalMatrix:{value:new Ge}}),this.matrix=new gt,this.matrixWorld=new gt,this.matrixAutoUpdate=Ut.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new S0,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return Lr.setFromAxisAngle(e,n),this.quaternion.multiply(Lr),this}rotateOnWorldAxis(e,n){return Lr.setFromAxisAngle(e,n),this.quaternion.premultiply(Lr),this}rotateX(e){return this.rotateOnAxis(ip,e)}rotateY(e){return this.rotateOnAxis(rp,e)}rotateZ(e){return this.rotateOnAxis(sp,e)}translateOnAxis(e,n){return np.copy(e).applyQuaternion(this.quaternion),this.position.add(np.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(ip,e)}translateY(e){return this.translateOnAxis(rp,e)}translateZ(e){return this.translateOnAxis(sp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ti.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?ra.copy(e):ra.set(e,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),zs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ti.lookAt(zs,ra,this.up):ti.lookAt(ra,zs,this.up),this.quaternion.setFromRotationMatrix(ti),r&&(ti.extractRotation(r.matrixWorld),Lr.setFromRotationMatrix(ti),this.quaternion.premultiply(Lr.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(Qy)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(eS)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ti.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ti.multiply(e.parent.matrixWorld)),e.applyMatrix4(ti),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const o=this.children[i].getObjectByProperty(e,n);if(o!==void 0)return o}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zs,e,Zy),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zs,Jy,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++){const s=n[i];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),n===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++){const a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(n){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),f=o(e.images),h=o(e.shapes),d=o(e.skeletons),p=o(e.animations),x=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),f.length>0&&(i.images=f),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),p.length>0&&(i.animations=p),x.length>0&&(i.nodes=x)}return i.object=r,i;function o(a){const l=[];for(const c in a){const f=a[c];delete f.metadata,l.push(f)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}Ut.DEFAULT_UP=new N(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Dn=new N,ni=new N,Ac=new N,ii=new N,Nr=new N,Dr=new N,op=new N,Cc=new N,Rc=new N,bc=new N;let sa=!1;class On{constructor(e=new N,n=new N,i=new N){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),Dn.subVectors(e,n),r.cross(Dn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){Dn.subVectors(r,n),ni.subVectors(i,n),Ac.subVectors(e,n);const o=Dn.dot(Dn),a=Dn.dot(ni),l=Dn.dot(Ac),c=ni.dot(ni),f=ni.dot(Ac),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;const d=1/h,p=(c*l-a*f)*d,x=(o*f-a*l)*d;return s.set(1-p-x,x,p)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,ii)===null?!1:ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getUV(e,n,i,r,s,o,a,l){return sa===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),sa=!0),this.getInterpolation(e,n,i,r,s,o,a,l)}static getInterpolation(e,n,i,r,s,o,a,l){return this.getBarycoord(e,n,i,r,ii)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ii.x),l.addScaledVector(o,ii.y),l.addScaledVector(a,ii.z),l)}static isFrontFacing(e,n,i,r){return Dn.subVectors(i,n),ni.subVectors(e,n),Dn.cross(ni).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Dn.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),Dn.cross(ni).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return On.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return On.getBarycoord(e,this.a,this.b,this.c,n)}getUV(e,n,i,r,s){return sa===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),sa=!0),On.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}getInterpolation(e,n,i,r,s){return On.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return On.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return On.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,r=this.b,s=this.c;let o,a;Nr.subVectors(r,i),Dr.subVectors(s,i),Cc.subVectors(e,i);const l=Nr.dot(Cc),c=Dr.dot(Cc);if(l<=0&&c<=0)return n.copy(i);Rc.subVectors(e,r);const f=Nr.dot(Rc),h=Dr.dot(Rc);if(f>=0&&h<=f)return n.copy(r);const d=l*h-f*c;if(d<=0&&l>=0&&f<=0)return o=l/(l-f),n.copy(i).addScaledVector(Nr,o);bc.subVectors(e,s);const p=Nr.dot(bc),x=Dr.dot(bc);if(x>=0&&p<=x)return n.copy(s);const _=p*c-l*x;if(_<=0&&c>=0&&x<=0)return a=c/(c-x),n.copy(i).addScaledVector(Dr,a);const m=f*x-p*h;if(m<=0&&h-f>=0&&p-x>=0)return op.subVectors(s,r),a=(h-f)/(h-f+(p-x)),n.copy(r).addScaledVector(op,a);const u=1/(m+_+d);return o=_*u,a=d*u,n.copy(i).addScaledVector(Nr,o).addScaledVector(Dr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const M0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},oa={h:0,s:0,l:0};function Pc(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class Xe{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=Nt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=Ze.workingColorSpace){return this.r=e,this.g=n,this.b=i,Ze.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=Ze.workingColorSpace){if(e=By(e,1),n=Gt(n,0,1),i=Gt(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,o=2*i-s;this.r=Pc(o,s,e+1/3),this.g=Pc(o,s,e),this.b=Pc(o,s,e-1/3)}return Ze.toWorkingColorSpace(this,r),this}setStyle(e,n=Nt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(o===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=Nt){const i=M0[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ls(e.r),this.g=ls(e.g),this.b=ls(e.b),this}copyLinearToSRGB(e){return this.r=_c(e.r),this.g=_c(e.g),this.b=_c(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Nt){return Ze.fromWorkingColorSpace(Bt.copy(this),e),Math.round(Gt(Bt.r*255,0,255))*65536+Math.round(Gt(Bt.g*255,0,255))*256+Math.round(Gt(Bt.b*255,0,255))}getHexString(e=Nt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=Ze.workingColorSpace){Ze.fromWorkingColorSpace(Bt.copy(this),n);const i=Bt.r,r=Bt.g,s=Bt.b,o=Math.max(i,r,s),a=Math.min(i,r,s);let l,c;const f=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=f<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=f,e}getRGB(e,n=Ze.workingColorSpace){return Ze.fromWorkingColorSpace(Bt.copy(this),n),e.r=Bt.r,e.g=Bt.g,e.b=Bt.b,e}getStyle(e=Nt){Ze.fromWorkingColorSpace(Bt.copy(this),e);const n=Bt.r,i=Bt.g,r=Bt.b;return e!==Nt?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(Ei),this.setHSL(Ei.h+e,Ei.s+n,Ei.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(Ei),e.getHSL(oa);const i=gc(Ei.h,oa.h,n),r=gc(Ei.s,oa.s,n),s=gc(Ei.l,oa.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Bt=new Xe;Xe.NAMES=M0;let tS=0;class Ts extends Es{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:tS++}),this.uuid=bo(),this.name="",this.type="Material",this.blending=as,this.side=Xi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=zu,this.blendDst=Bu,this.blendEquation=sr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Xe(0,0,0),this.blendAlpha=0,this.depthFunc=sl,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wr,this.stencilZFail=wr,this.stencilZPass=wr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==as&&(i.blending=this.blending),this.side!==Xi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==zu&&(i.blendSrc=this.blendSrc),this.blendDst!==Bu&&(i.blendDst=this.blendDst),this.blendEquation!==sr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==sl&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==jh&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==wr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==wr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==wr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(n){const s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class fl extends Ts{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=r0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const vt=new N,aa=new Me;class Zn{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=qh,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Li,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)aa.fromBufferAttribute(this,n),aa.applyMatrix3(e),this.setXY(n,aa.x,aa.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)vt.fromBufferAttribute(this,n),vt.applyMatrix3(e),this.setXYZ(n,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)vt.fromBufferAttribute(this,n),vt.applyMatrix4(e),this.setXYZ(n,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)vt.fromBufferAttribute(this,n),vt.applyNormalMatrix(e),this.setXYZ(n,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)vt.fromBufferAttribute(this,n),vt.transformDirection(e),this.setXYZ(n,vt.x,vt.y,vt.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=Fs(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=Qt(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=Fs(n,this.array)),n}setX(e,n){return this.normalized&&(n=Qt(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=Fs(n,this.array)),n}setY(e,n){return this.normalized&&(n=Qt(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=Fs(n,this.array)),n}setZ(e,n){return this.normalized&&(n=Qt(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=Fs(n,this.array)),n}setW(e,n){return this.normalized&&(n=Qt(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=Qt(n,this.array),i=Qt(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=Qt(n,this.array),i=Qt(i,this.array),r=Qt(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=Qt(n,this.array),i=Qt(i,this.array),r=Qt(r,this.array),s=Qt(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==qh&&(e.usage=this.usage),e}}class E0 extends Zn{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class T0 extends Zn{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class Mt extends Zn{constructor(e,n,i){super(new Float32Array(e),n,i)}}let nS=0;const xn=new gt,Lc=new Ut,Ur=new N,cn=new Lo,Bs=new Lo,Ct=new N;class bn extends Es{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:nS++}),this.uuid=bo(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(g0(e)?T0:E0)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Ge().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return xn.makeRotationFromQuaternion(e),this.applyMatrix4(xn),this}rotateX(e){return xn.makeRotationX(e),this.applyMatrix4(xn),this}rotateY(e){return xn.makeRotationY(e),this.applyMatrix4(xn),this}rotateZ(e){return xn.makeRotationZ(e),this.applyMatrix4(xn),this}translate(e,n,i){return xn.makeTranslation(e,n,i),this.applyMatrix4(xn),this}scale(e,n,i){return xn.makeScale(e,n,i),this.applyMatrix4(xn),this}lookAt(e){return Lc.lookAt(e),Lc.updateMatrix(),this.applyMatrix4(Lc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ur).negate(),this.translate(Ur.x,Ur.y,Ur.z),this}setFromPoints(e){const n=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Mt(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Lo);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];cn.setFromBufferAttribute(s),this.morphTargetsRelative?(Ct.addVectors(this.boundingBox.min,cn.min),this.boundingBox.expandByPoint(Ct),Ct.addVectors(this.boundingBox.max,cn.max),this.boundingBox.expandByPoint(Ct)):(this.boundingBox.expandByPoint(cn.min),this.boundingBox.expandByPoint(cn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pl);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new N,1/0);return}if(e){const i=this.boundingSphere.center;if(cn.setFromBufferAttribute(e),n)for(let s=0,o=n.length;s<o;s++){const a=n[s];Bs.setFromBufferAttribute(a),this.morphTargetsRelative?(Ct.addVectors(cn.min,Bs.min),cn.expandByPoint(Ct),Ct.addVectors(cn.max,Bs.max),cn.expandByPoint(Ct)):(cn.expandByPoint(Bs.min),cn.expandByPoint(Bs.max))}cn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Ct.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Ct));if(n)for(let s=0,o=n.length;s<o;s++){const a=n[s],l=this.morphTargetsRelative;for(let c=0,f=a.count;c<f;c++)Ct.fromBufferAttribute(a,c),l&&(Ur.fromBufferAttribute(e,c),Ct.add(Ur)),r=Math.max(r,i.distanceToSquared(Ct))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.array,r=n.position.array,s=n.normal.array,o=n.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Zn(new Float32Array(4*a),4));const l=this.getAttribute("tangent").array,c=[],f=[];for(let T=0;T<a;T++)c[T]=new N,f[T]=new N;const h=new N,d=new N,p=new N,x=new Me,_=new Me,m=new Me,u=new N,v=new N;function g(T,W,q){h.fromArray(r,T*3),d.fromArray(r,W*3),p.fromArray(r,q*3),x.fromArray(o,T*2),_.fromArray(o,W*2),m.fromArray(o,q*2),d.sub(h),p.sub(h),_.sub(x),m.sub(x);const ie=1/(_.x*m.y-m.x*_.y);isFinite(ie)&&(u.copy(d).multiplyScalar(m.y).addScaledVector(p,-_.y).multiplyScalar(ie),v.copy(p).multiplyScalar(_.x).addScaledVector(d,-m.x).multiplyScalar(ie),c[T].add(u),c[W].add(u),c[q].add(u),f[T].add(v),f[W].add(v),f[q].add(v))}let y=this.groups;y.length===0&&(y=[{start:0,count:i.length}]);for(let T=0,W=y.length;T<W;++T){const q=y[T],ie=q.start,P=q.count;for(let O=ie,X=ie+P;O<X;O+=3)g(i[O+0],i[O+1],i[O+2])}const R=new N,A=new N,C=new N,U=new N;function M(T){C.fromArray(s,T*3),U.copy(C);const W=c[T];R.copy(W),R.sub(C.multiplyScalar(C.dot(W))).normalize(),A.crossVectors(U,W);const ie=A.dot(f[T])<0?-1:1;l[T*4]=R.x,l[T*4+1]=R.y,l[T*4+2]=R.z,l[T*4+3]=ie}for(let T=0,W=y.length;T<W;++T){const q=y[T],ie=q.start,P=q.count;for(let O=ie,X=ie+P;O<X;O+=3)M(i[O+0]),M(i[O+1]),M(i[O+2])}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Zn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let d=0,p=i.count;d<p;d++)i.setXYZ(d,0,0,0);const r=new N,s=new N,o=new N,a=new N,l=new N,c=new N,f=new N,h=new N;if(e)for(let d=0,p=e.count;d<p;d+=3){const x=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(n,x),s.fromBufferAttribute(n,_),o.fromBufferAttribute(n,m),f.subVectors(o,s),h.subVectors(r,s),f.cross(h),a.fromBufferAttribute(i,x),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(f),l.add(f),c.add(f),i.setXYZ(x,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=n.count;d<p;d+=3)r.fromBufferAttribute(n,d+0),s.fromBufferAttribute(n,d+1),o.fromBufferAttribute(n,d+2),f.subVectors(o,s),h.subVectors(r,s),f.cross(h),i.setXYZ(d+0,f.x,f.y,f.z),i.setXYZ(d+1,f.x,f.y,f.z),i.setXYZ(d+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Ct.fromBufferAttribute(e,n),Ct.normalize(),e.setXYZ(n,Ct.x,Ct.y,Ct.z)}toNonIndexed(){function e(a,l){const c=a.array,f=a.itemSize,h=a.normalized,d=new c.constructor(l.length*f);let p=0,x=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?p=l[_]*a.data.stride+a.offset:p=l[_]*f;for(let u=0;u<f;u++)d[x++]=c[p++]}return new Zn(d,f,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new bn,i=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,i);n.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let f=0,h=c.length;f<h;f++){const d=c[f],p=e(d,i);l.push(p)}n.morphAttributes[a]=l}n.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],f=[];for(let h=0,d=c.length;h<d;h++){const p=c[h];f.push(p.toJSON(e.data))}f.length>0&&(r[l]=f,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(n));const r=e.attributes;for(const c in r){const f=r[c];this.setAttribute(c,f.clone(n))}const s=e.morphAttributes;for(const c in s){const f=[],h=s[c];for(let d=0,p=h.length;d<p;d++)f.push(h[d].clone(n));this.morphAttributes[c]=f}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,f=o.length;c<f;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ap=new gt,Qi=new y0,la=new Pl,lp=new N,Ir=new N,Fr=new N,Or=new N,Nc=new N,ca=new N,ua=new Me,fa=new Me,da=new Me,cp=new N,up=new N,fp=new N,ha=new N,pa=new N;class fn extends Ut{constructor(e=new bn,n=new fl){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,n){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;n.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){ca.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const f=a[l],h=s[l];f!==0&&(Nc.fromBufferAttribute(h,e),o?ca.addScaledVector(Nc,f):ca.addScaledVector(Nc.sub(n),f))}n.add(ca)}return n}raycast(e,n){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),la.copy(i.boundingSphere),la.applyMatrix4(s),Qi.copy(e.ray).recast(e.near),!(la.containsPoint(Qi.origin)===!1&&(Qi.intersectSphere(la,lp)===null||Qi.origin.distanceToSquared(lp)>(e.far-e.near)**2))&&(ap.copy(s).invert(),Qi.copy(e.ray).applyMatrix4(ap),!(i.boundingBox!==null&&Qi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,Qi)))}_computeIntersections(e,n,i){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,f=s.attributes.uv1,h=s.attributes.normal,d=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let x=0,_=d.length;x<_;x++){const m=d[x],u=o[m.materialIndex],v=Math.max(m.start,p.start),g=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let y=v,R=g;y<R;y+=3){const A=a.getX(y),C=a.getX(y+1),U=a.getX(y+2);r=ma(this,u,e,i,c,f,h,A,C,U),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const x=Math.max(0,p.start),_=Math.min(a.count,p.start+p.count);for(let m=x,u=_;m<u;m+=3){const v=a.getX(m),g=a.getX(m+1),y=a.getX(m+2);r=ma(this,o,e,i,c,f,h,v,g,y),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let x=0,_=d.length;x<_;x++){const m=d[x],u=o[m.materialIndex],v=Math.max(m.start,p.start),g=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let y=v,R=g;y<R;y+=3){const A=y,C=y+1,U=y+2;r=ma(this,u,e,i,c,f,h,A,C,U),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const x=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=x,u=_;m<u;m+=3){const v=m,g=m+1,y=m+2;r=ma(this,o,e,i,c,f,h,v,g,y),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}}}function iS(t,e,n,i,r,s,o,a){let l;if(e.side===on?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===Xi,a),l===null)return null;pa.copy(a),pa.applyMatrix4(t.matrixWorld);const c=n.ray.origin.distanceTo(pa);return c<n.near||c>n.far?null:{distance:c,point:pa.clone(),object:t}}function ma(t,e,n,i,r,s,o,a,l,c){t.getVertexPosition(a,Ir),t.getVertexPosition(l,Fr),t.getVertexPosition(c,Or);const f=iS(t,e,n,i,Ir,Fr,Or,ha);if(f){r&&(ua.fromBufferAttribute(r,a),fa.fromBufferAttribute(r,l),da.fromBufferAttribute(r,c),f.uv=On.getInterpolation(ha,Ir,Fr,Or,ua,fa,da,new Me)),s&&(ua.fromBufferAttribute(s,a),fa.fromBufferAttribute(s,l),da.fromBufferAttribute(s,c),f.uv1=On.getInterpolation(ha,Ir,Fr,Or,ua,fa,da,new Me),f.uv2=f.uv1),o&&(cp.fromBufferAttribute(o,a),up.fromBufferAttribute(o,l),fp.fromBufferAttribute(o,c),f.normal=On.getInterpolation(ha,Ir,Fr,Or,cp,up,fp,new N),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new N,materialIndex:0};On.getNormal(Ir,Fr,Or,h.normal),f.face=h}return f}class ws extends bn{constructor(e=1,n=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],f=[],h=[];let d=0,p=0;x("z","y","x",-1,-1,i,n,e,o,s,0),x("z","y","x",1,-1,i,n,-e,o,s,1),x("x","z","y",1,1,e,i,n,r,o,2),x("x","z","y",1,-1,e,i,-n,r,o,3),x("x","y","z",1,-1,e,n,i,r,s,4),x("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new Mt(c,3)),this.setAttribute("normal",new Mt(f,3)),this.setAttribute("uv",new Mt(h,2));function x(_,m,u,v,g,y,R,A,C,U,M){const T=y/C,W=R/U,q=y/2,ie=R/2,P=A/2,O=C+1,X=U+1;let Y=0,D=0;const F=new N;for(let k=0;k<X;k++){const $=k*W-ie;for(let K=0;K<O;K++){const j=K*T-q;F[_]=j*v,F[m]=$*g,F[u]=P,c.push(F.x,F.y,F.z),F[_]=0,F[m]=0,F[u]=A>0?1:-1,f.push(F.x,F.y,F.z),h.push(K/C),h.push(1-k/U),Y+=1}}for(let k=0;k<U;k++)for(let $=0;$<C;$++){const K=d+$+O*k,j=d+$+O*(k+1),Z=d+($+1)+O*(k+1),le=d+($+1)+O*k;l.push(K,j,le),l.push(j,Z,le),D+=6}a.addGroup(p,D,M),p+=D,d+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ws(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function xs(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function qt(t){const e={};for(let n=0;n<t.length;n++){const i=xs(t[n]);for(const r in i)e[r]=i[r]}return e}function rS(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function w0(t){return t.getRenderTarget()===null?t.outputColorSpace:Ze.workingColorSpace}const sS={clone:xs,merge:qt};var oS=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,aS=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Sr extends Ts{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=oS,this.fragmentShader=aS,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=xs(e.uniforms),this.uniformsGroups=rS(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?n.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?n.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?n.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?n.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?n.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?n.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?n.uniforms[r]={type:"m4",value:o.toArray()}:n.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class A0 extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new gt,this.projectionMatrix=new gt,this.projectionMatrixInverse=new gt,this.coordinateSystem=ci}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class En extends A0{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=ju*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(mc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ju*2*Math.atan(Math.tan(mc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,n,i,r,s,o){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(mc*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,n-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const kr=-90,zr=1;class lS extends Ut{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new En(kr,zr,e,n);r.layers=this.layers,this.add(r);const s=new En(kr,zr,e,n);s.layers=this.layers,this.add(s);const o=new En(kr,zr,e,n);o.layers=this.layers,this.add(o);const a=new En(kr,zr,e,n);a.layers=this.layers,this.add(a);const l=new En(kr,zr,e,n);l.layers=this.layers,this.add(l);const c=new En(kr,zr,e,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,r,s,o,a,l]=n;for(const c of n)this.remove(c);if(e===ci)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===cl)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of n)this.add(c),c.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,f]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;const _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,o),e.setRenderTarget(i,2,r),e.render(n,a),e.setRenderTarget(i,3,r),e.render(n,l),e.setRenderTarget(i,4,r),e.render(n,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,r),e.render(n,f),e.setRenderTarget(h,d,p),e.xr.enabled=x,i.texture.needsPMREMUpdate=!0}}class C0 extends pn{constructor(e,n,i,r,s,o,a,l,c,f){e=e!==void 0?e:[],n=n!==void 0?n:gs,super(e,n,i,r,s,o,a,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class cS extends yr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];n.encoding!==void 0&&(eo("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===pr?Nt:Tn),this.texture=new C0(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Mn}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ws(5,5,5),s=new Sr({name:"CubemapFromEquirect",uniforms:xs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:on,blending:Bi});s.uniforms.tEquirect.value=n;const o=new fn(r,s),a=n.minFilter;return n.minFilter===So&&(n.minFilter=Mn),new lS(1,10,this).update(e,o),n.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,n,i,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(n,i,r);e.setRenderTarget(s)}}const Dc=new N,uS=new N,fS=new Ge;class ir{constructor(e=new N(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const r=Dc.subVectors(i,n).cross(uS.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const i=e.delta(Dc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||fS.getNormalMatrix(e),r=this.coplanarPoint(Dc).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const er=new Pl,ga=new N;class qf{constructor(e=new ir,n=new ir,i=new ir,r=new ir,s=new ir,o=new ir){this.planes=[e,n,i,r,s,o]}set(e,n,i,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(n),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=ci){const i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],f=r[5],h=r[6],d=r[7],p=r[8],x=r[9],_=r[10],m=r[11],u=r[12],v=r[13],g=r[14],y=r[15];if(i[0].setComponents(l-s,d-c,m-p,y-u).normalize(),i[1].setComponents(l+s,d+c,m+p,y+u).normalize(),i[2].setComponents(l+o,d+f,m+x,y+v).normalize(),i[3].setComponents(l-o,d-f,m-x,y-v).normalize(),i[4].setComponents(l-a,d-h,m-_,y-g).normalize(),n===ci)i[5].setComponents(l+a,d+h,m+_,y+g).normalize();else if(n===cl)i[5].setComponents(a,h,_,g).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),er.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),er.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(er)}intersectsSprite(e){return er.center.set(0,0,0),er.radius=.7071067811865476,er.applyMatrix4(e.matrixWorld),this.intersectsSphere(er)}intersectsSphere(e){const n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(ga.x=r.normal.x>0?e.max.x:e.min.x,ga.y=r.normal.y>0?e.max.y:e.min.y,ga.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ga)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function R0(){let t=null,e=!1,n=null,i=null;function r(s,o){n(s,o),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function dS(t,e){const n=e.isWebGL2,i=new WeakMap;function r(c,f){const h=c.array,d=c.usage,p=h.byteLength,x=t.createBuffer();t.bindBuffer(f,x),t.bufferData(f,h,d),c.onUploadCallback();let _;if(h instanceof Float32Array)_=t.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(n)_=t.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=t.UNSIGNED_SHORT;else if(h instanceof Int16Array)_=t.SHORT;else if(h instanceof Uint32Array)_=t.UNSIGNED_INT;else if(h instanceof Int32Array)_=t.INT;else if(h instanceof Int8Array)_=t.BYTE;else if(h instanceof Uint8Array)_=t.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)_=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:x,type:_,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:p}}function s(c,f,h){const d=f.array,p=f._updateRange,x=f.updateRanges;if(t.bindBuffer(h,c),p.count===-1&&x.length===0&&t.bufferSubData(h,0,d),x.length!==0){for(let _=0,m=x.length;_<m;_++){const u=x[_];n?t.bufferSubData(h,u.start*d.BYTES_PER_ELEMENT,d,u.start,u.count):t.bufferSubData(h,u.start*d.BYTES_PER_ELEMENT,d.subarray(u.start,u.start+u.count))}f.clearUpdateRanges()}p.count!==-1&&(n?t.bufferSubData(h,p.offset*d.BYTES_PER_ELEMENT,d,p.offset,p.count):t.bufferSubData(h,p.offset*d.BYTES_PER_ELEMENT,d.subarray(p.offset,p.offset+p.count)),p.count=-1),f.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),i.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);const f=i.get(c);f&&(t.deleteBuffer(f.buffer),i.delete(c))}function l(c,f){if(c.isGLBufferAttribute){const d=i.get(c);(!d||d.version<c.version)&&i.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const h=i.get(c);if(h===void 0)i.set(c,r(c,f));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,c,f),h.version=c.version}}return{get:o,remove:a,update:l}}class Eo extends bn{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};const s=e/2,o=n/2,a=Math.floor(i),l=Math.floor(r),c=a+1,f=l+1,h=e/a,d=n/l,p=[],x=[],_=[],m=[];for(let u=0;u<f;u++){const v=u*d-o;for(let g=0;g<c;g++){const y=g*h-s;x.push(y,-v,0),_.push(0,0,1),m.push(g/a),m.push(1-u/l)}}for(let u=0;u<l;u++)for(let v=0;v<a;v++){const g=v+c*u,y=v+c*(u+1),R=v+1+c*(u+1),A=v+1+c*u;p.push(g,y,A),p.push(y,R,A)}this.setIndex(p),this.setAttribute("position",new Mt(x,3)),this.setAttribute("normal",new Mt(_,3)),this.setAttribute("uv",new Mt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Eo(e.width,e.height,e.widthSegments,e.heightSegments)}}var hS=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,pS=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,mS=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gS=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vS=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,_S=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,xS=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,yS=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,SS=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,MS=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,ES=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,TS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wS=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,AS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,CS=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,RS=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,bS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,PS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,LS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,NS=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,DS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,US=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,IS=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,FS=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,OS=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,kS=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,zS=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,BS=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,HS=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,GS=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,VS="gl_FragColor = linearToOutputTexel( gl_FragColor );",WS=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,XS=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,jS=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,qS=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,YS=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,$S=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,KS=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ZS=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,JS=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,QS=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,eM=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,tM=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,nM=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,iM=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,rM=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,sM=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,oM=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,aM=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lM=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,cM=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,uM=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,fM=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,dM=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,hM=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,pM=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,mM=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,gM=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,vM=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_M=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,xM=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,yM=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,SM=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,MM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,EM=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,TM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,wM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,AM=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,CM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,RM=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,bM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,PM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,LM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,NM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,DM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,UM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,IM=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,FM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,OM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,kM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,zM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,BM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,HM=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,GM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,VM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,WM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,XM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,jM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,qM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,YM=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,$M=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,KM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ZM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,JM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,QM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,eE=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,tE=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,nE=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,iE=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,rE=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,sE=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,oE=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,aE=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,lE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,cE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,fE=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const dE=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,hE=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mE=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vE=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_E=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,xE=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,yE=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,SE=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,ME=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,EE=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,TE=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,wE=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,AE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,CE=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,RE=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bE=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,PE=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,LE=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,NE=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,DE=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,UE=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,IE=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,FE=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,OE=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kE=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zE=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,BE=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,HE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,GE=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,VE=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,WE=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,XE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Fe={alphahash_fragment:hS,alphahash_pars_fragment:pS,alphamap_fragment:mS,alphamap_pars_fragment:gS,alphatest_fragment:vS,alphatest_pars_fragment:_S,aomap_fragment:xS,aomap_pars_fragment:yS,batching_pars_vertex:SS,batching_vertex:MS,begin_vertex:ES,beginnormal_vertex:TS,bsdfs:wS,iridescence_fragment:AS,bumpmap_pars_fragment:CS,clipping_planes_fragment:RS,clipping_planes_pars_fragment:bS,clipping_planes_pars_vertex:PS,clipping_planes_vertex:LS,color_fragment:NS,color_pars_fragment:DS,color_pars_vertex:US,color_vertex:IS,common:FS,cube_uv_reflection_fragment:OS,defaultnormal_vertex:kS,displacementmap_pars_vertex:zS,displacementmap_vertex:BS,emissivemap_fragment:HS,emissivemap_pars_fragment:GS,colorspace_fragment:VS,colorspace_pars_fragment:WS,envmap_fragment:XS,envmap_common_pars_fragment:jS,envmap_pars_fragment:qS,envmap_pars_vertex:YS,envmap_physical_pars_fragment:oM,envmap_vertex:$S,fog_vertex:KS,fog_pars_vertex:ZS,fog_fragment:JS,fog_pars_fragment:QS,gradientmap_pars_fragment:eM,lightmap_fragment:tM,lightmap_pars_fragment:nM,lights_lambert_fragment:iM,lights_lambert_pars_fragment:rM,lights_pars_begin:sM,lights_toon_fragment:aM,lights_toon_pars_fragment:lM,lights_phong_fragment:cM,lights_phong_pars_fragment:uM,lights_physical_fragment:fM,lights_physical_pars_fragment:dM,lights_fragment_begin:hM,lights_fragment_maps:pM,lights_fragment_end:mM,logdepthbuf_fragment:gM,logdepthbuf_pars_fragment:vM,logdepthbuf_pars_vertex:_M,logdepthbuf_vertex:xM,map_fragment:yM,map_pars_fragment:SM,map_particle_fragment:MM,map_particle_pars_fragment:EM,metalnessmap_fragment:TM,metalnessmap_pars_fragment:wM,morphcolor_vertex:AM,morphnormal_vertex:CM,morphtarget_pars_vertex:RM,morphtarget_vertex:bM,normal_fragment_begin:PM,normal_fragment_maps:LM,normal_pars_fragment:NM,normal_pars_vertex:DM,normal_vertex:UM,normalmap_pars_fragment:IM,clearcoat_normal_fragment_begin:FM,clearcoat_normal_fragment_maps:OM,clearcoat_pars_fragment:kM,iridescence_pars_fragment:zM,opaque_fragment:BM,packing:HM,premultiplied_alpha_fragment:GM,project_vertex:VM,dithering_fragment:WM,dithering_pars_fragment:XM,roughnessmap_fragment:jM,roughnessmap_pars_fragment:qM,shadowmap_pars_fragment:YM,shadowmap_pars_vertex:$M,shadowmap_vertex:KM,shadowmask_pars_fragment:ZM,skinbase_vertex:JM,skinning_pars_vertex:QM,skinning_vertex:eE,skinnormal_vertex:tE,specularmap_fragment:nE,specularmap_pars_fragment:iE,tonemapping_fragment:rE,tonemapping_pars_fragment:sE,transmission_fragment:oE,transmission_pars_fragment:aE,uv_pars_fragment:lE,uv_pars_vertex:cE,uv_vertex:uE,worldpos_vertex:fE,background_vert:dE,background_frag:hE,backgroundCube_vert:pE,backgroundCube_frag:mE,cube_vert:gE,cube_frag:vE,depth_vert:_E,depth_frag:xE,distanceRGBA_vert:yE,distanceRGBA_frag:SE,equirect_vert:ME,equirect_frag:EE,linedashed_vert:TE,linedashed_frag:wE,meshbasic_vert:AE,meshbasic_frag:CE,meshlambert_vert:RE,meshlambert_frag:bE,meshmatcap_vert:PE,meshmatcap_frag:LE,meshnormal_vert:NE,meshnormal_frag:DE,meshphong_vert:UE,meshphong_frag:IE,meshphysical_vert:FE,meshphysical_frag:OE,meshtoon_vert:kE,meshtoon_frag:zE,points_vert:BE,points_frag:HE,shadow_vert:GE,shadow_frag:VE,sprite_vert:WE,sprite_frag:XE},se={common:{diffuse:{value:new Xe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new Me(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new Xe(16777215)},opacity:{value:1},center:{value:new Me(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},qn={basic:{uniforms:qt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:Fe.meshbasic_vert,fragmentShader:Fe.meshbasic_frag},lambert:{uniforms:qt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Xe(0)}}]),vertexShader:Fe.meshlambert_vert,fragmentShader:Fe.meshlambert_frag},phong:{uniforms:qt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Xe(0)},specular:{value:new Xe(1118481)},shininess:{value:30}}]),vertexShader:Fe.meshphong_vert,fragmentShader:Fe.meshphong_frag},standard:{uniforms:qt([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new Xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag},toon:{uniforms:qt([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new Xe(0)}}]),vertexShader:Fe.meshtoon_vert,fragmentShader:Fe.meshtoon_frag},matcap:{uniforms:qt([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:Fe.meshmatcap_vert,fragmentShader:Fe.meshmatcap_frag},points:{uniforms:qt([se.points,se.fog]),vertexShader:Fe.points_vert,fragmentShader:Fe.points_frag},dashed:{uniforms:qt([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Fe.linedashed_vert,fragmentShader:Fe.linedashed_frag},depth:{uniforms:qt([se.common,se.displacementmap]),vertexShader:Fe.depth_vert,fragmentShader:Fe.depth_frag},normal:{uniforms:qt([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:Fe.meshnormal_vert,fragmentShader:Fe.meshnormal_frag},sprite:{uniforms:qt([se.sprite,se.fog]),vertexShader:Fe.sprite_vert,fragmentShader:Fe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Fe.background_vert,fragmentShader:Fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Fe.backgroundCube_vert,fragmentShader:Fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Fe.cube_vert,fragmentShader:Fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Fe.equirect_vert,fragmentShader:Fe.equirect_frag},distanceRGBA:{uniforms:qt([se.common,se.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Fe.distanceRGBA_vert,fragmentShader:Fe.distanceRGBA_frag},shadow:{uniforms:qt([se.lights,se.fog,{color:{value:new Xe(0)},opacity:{value:1}}]),vertexShader:Fe.shadow_vert,fragmentShader:Fe.shadow_frag}};qn.physical={uniforms:qt([qn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new Me(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new Xe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new Me},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new Xe(0)},specularColor:{value:new Xe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new Me},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag};const va={r:0,b:0,g:0};function jE(t,e,n,i,r,s,o){const a=new Xe(0);let l=s===!0?0:1,c,f,h=null,d=0,p=null;function x(m,u){let v=!1,g=u.isScene===!0?u.background:null;g&&g.isTexture&&(g=(u.backgroundBlurriness>0?n:e).get(g)),g===null?_(a,l):g&&g.isColor&&(_(g,1),v=!0);const y=t.xr.getEnvironmentBlendMode();y==="additive"?i.buffers.color.setClear(0,0,0,1,o):y==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(t.autoClear||v)&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),g&&(g.isCubeTexture||g.mapping===Rl)?(f===void 0&&(f=new fn(new ws(1,1,1),new Sr({name:"BackgroundCubeMaterial",uniforms:xs(qn.backgroundCube.uniforms),vertexShader:qn.backgroundCube.vertexShader,fragmentShader:qn.backgroundCube.fragmentShader,side:on,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),f.geometry.deleteAttribute("uv"),f.onBeforeRender=function(R,A,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(f.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(f)),f.material.uniforms.envMap.value=g,f.material.uniforms.flipEnvMap.value=g.isCubeTexture&&g.isRenderTargetTexture===!1?-1:1,f.material.uniforms.backgroundBlurriness.value=u.backgroundBlurriness,f.material.uniforms.backgroundIntensity.value=u.backgroundIntensity,f.material.toneMapped=Ze.getTransfer(g.colorSpace)!==it,(h!==g||d!==g.version||p!==t.toneMapping)&&(f.material.needsUpdate=!0,h=g,d=g.version,p=t.toneMapping),f.layers.enableAll(),m.unshift(f,f.geometry,f.material,0,0,null)):g&&g.isTexture&&(c===void 0&&(c=new fn(new Eo(2,2),new Sr({name:"BackgroundMaterial",uniforms:xs(qn.background.uniforms),vertexShader:qn.background.vertexShader,fragmentShader:qn.background.fragmentShader,side:Xi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=g,c.material.uniforms.backgroundIntensity.value=u.backgroundIntensity,c.material.toneMapped=Ze.getTransfer(g.colorSpace)!==it,g.matrixAutoUpdate===!0&&g.updateMatrix(),c.material.uniforms.uvTransform.value.copy(g.matrix),(h!==g||d!==g.version||p!==t.toneMapping)&&(c.material.needsUpdate=!0,h=g,d=g.version,p=t.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function _(m,u){m.getRGB(va,w0(t)),i.buffers.color.setClear(va.r,va.g,va.b,u,o)}return{getClearColor:function(){return a},setClearColor:function(m,u=1){a.set(m),l=u,_(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,_(a,l)},render:x}}function qE(t,e,n,i){const r=t.getParameter(t.MAX_VERTEX_ATTRIBS),s=i.isWebGL2?null:e.get("OES_vertex_array_object"),o=i.isWebGL2||s!==null,a={},l=m(null);let c=l,f=!1;function h(P,O,X,Y,D){let F=!1;if(o){const k=_(Y,X,O);c!==k&&(c=k,p(c.object)),F=u(P,Y,X,D),F&&v(P,Y,X,D)}else{const k=O.wireframe===!0;(c.geometry!==Y.id||c.program!==X.id||c.wireframe!==k)&&(c.geometry=Y.id,c.program=X.id,c.wireframe=k,F=!0)}D!==null&&n.update(D,t.ELEMENT_ARRAY_BUFFER),(F||f)&&(f=!1,U(P,O,X,Y),D!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,n.get(D).buffer))}function d(){return i.isWebGL2?t.createVertexArray():s.createVertexArrayOES()}function p(P){return i.isWebGL2?t.bindVertexArray(P):s.bindVertexArrayOES(P)}function x(P){return i.isWebGL2?t.deleteVertexArray(P):s.deleteVertexArrayOES(P)}function _(P,O,X){const Y=X.wireframe===!0;let D=a[P.id];D===void 0&&(D={},a[P.id]=D);let F=D[O.id];F===void 0&&(F={},D[O.id]=F);let k=F[Y];return k===void 0&&(k=m(d()),F[Y]=k),k}function m(P){const O=[],X=[],Y=[];for(let D=0;D<r;D++)O[D]=0,X[D]=0,Y[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:X,attributeDivisors:Y,object:P,attributes:{},index:null}}function u(P,O,X,Y){const D=c.attributes,F=O.attributes;let k=0;const $=X.getAttributes();for(const K in $)if($[K].location>=0){const Z=D[K];let le=F[K];if(le===void 0&&(K==="instanceMatrix"&&P.instanceMatrix&&(le=P.instanceMatrix),K==="instanceColor"&&P.instanceColor&&(le=P.instanceColor)),Z===void 0||Z.attribute!==le||le&&Z.data!==le.data)return!0;k++}return c.attributesNum!==k||c.index!==Y}function v(P,O,X,Y){const D={},F=O.attributes;let k=0;const $=X.getAttributes();for(const K in $)if($[K].location>=0){let Z=F[K];Z===void 0&&(K==="instanceMatrix"&&P.instanceMatrix&&(Z=P.instanceMatrix),K==="instanceColor"&&P.instanceColor&&(Z=P.instanceColor));const le={};le.attribute=Z,Z&&Z.data&&(le.data=Z.data),D[K]=le,k++}c.attributes=D,c.attributesNum=k,c.index=Y}function g(){const P=c.newAttributes;for(let O=0,X=P.length;O<X;O++)P[O]=0}function y(P){R(P,0)}function R(P,O){const X=c.newAttributes,Y=c.enabledAttributes,D=c.attributeDivisors;X[P]=1,Y[P]===0&&(t.enableVertexAttribArray(P),Y[P]=1),D[P]!==O&&((i.isWebGL2?t:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](P,O),D[P]=O)}function A(){const P=c.newAttributes,O=c.enabledAttributes;for(let X=0,Y=O.length;X<Y;X++)O[X]!==P[X]&&(t.disableVertexAttribArray(X),O[X]=0)}function C(P,O,X,Y,D,F,k){k===!0?t.vertexAttribIPointer(P,O,X,D,F):t.vertexAttribPointer(P,O,X,Y,D,F)}function U(P,O,X,Y){if(i.isWebGL2===!1&&(P.isInstancedMesh||Y.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;g();const D=Y.attributes,F=X.getAttributes(),k=O.defaultAttributeValues;for(const $ in F){const K=F[$];if(K.location>=0){let j=D[$];if(j===void 0&&($==="instanceMatrix"&&P.instanceMatrix&&(j=P.instanceMatrix),$==="instanceColor"&&P.instanceColor&&(j=P.instanceColor)),j!==void 0){const Z=j.normalized,le=j.itemSize,de=n.get(j);if(de===void 0)continue;const me=de.buffer,Ne=de.type,Ue=de.bytesPerElement,we=i.isWebGL2===!0&&(Ne===t.INT||Ne===t.UNSIGNED_INT||j.gpuType===o0);if(j.isInterleavedBufferAttribute){const je=j.data,z=je.stride,Wt=j.offset;if(je.isInstancedInterleavedBuffer){for(let ye=0;ye<K.locationSize;ye++)R(K.location+ye,je.meshPerAttribute);P.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=je.meshPerAttribute*je.count)}else for(let ye=0;ye<K.locationSize;ye++)y(K.location+ye);t.bindBuffer(t.ARRAY_BUFFER,me);for(let ye=0;ye<K.locationSize;ye++)C(K.location+ye,le/K.locationSize,Ne,Z,z*Ue,(Wt+le/K.locationSize*ye)*Ue,we)}else{if(j.isInstancedBufferAttribute){for(let je=0;je<K.locationSize;je++)R(K.location+je,j.meshPerAttribute);P.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let je=0;je<K.locationSize;je++)y(K.location+je);t.bindBuffer(t.ARRAY_BUFFER,me);for(let je=0;je<K.locationSize;je++)C(K.location+je,le/K.locationSize,Ne,Z,le*Ue,le/K.locationSize*je*Ue,we)}}else if(k!==void 0){const Z=k[$];if(Z!==void 0)switch(Z.length){case 2:t.vertexAttrib2fv(K.location,Z);break;case 3:t.vertexAttrib3fv(K.location,Z);break;case 4:t.vertexAttrib4fv(K.location,Z);break;default:t.vertexAttrib1fv(K.location,Z)}}}}A()}function M(){q();for(const P in a){const O=a[P];for(const X in O){const Y=O[X];for(const D in Y)x(Y[D].object),delete Y[D];delete O[X]}delete a[P]}}function T(P){if(a[P.id]===void 0)return;const O=a[P.id];for(const X in O){const Y=O[X];for(const D in Y)x(Y[D].object),delete Y[D];delete O[X]}delete a[P.id]}function W(P){for(const O in a){const X=a[O];if(X[P.id]===void 0)continue;const Y=X[P.id];for(const D in Y)x(Y[D].object),delete Y[D];delete X[P.id]}}function q(){ie(),f=!0,c!==l&&(c=l,p(c.object))}function ie(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:q,resetDefaultState:ie,dispose:M,releaseStatesOfGeometry:T,releaseStatesOfProgram:W,initAttributes:g,enableAttribute:y,disableUnusedAttributes:A}}function YE(t,e,n,i){const r=i.isWebGL2;let s;function o(f){s=f}function a(f,h){t.drawArrays(s,f,h),n.update(h,s,1)}function l(f,h,d){if(d===0)return;let p,x;if(r)p=t,x="drawArraysInstanced";else if(p=e.get("ANGLE_instanced_arrays"),x="drawArraysInstancedANGLE",p===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[x](s,f,h,d),n.update(h,s,d)}function c(f,h,d){if(d===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let x=0;x<d;x++)this.render(f[x],h[x]);else{p.multiDrawArraysWEBGL(s,f,0,h,0,d);let x=0;for(let _=0;_<d;_++)x+=h[_];n.update(x,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function $E(t,e,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");i=t.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(C){if(C==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&t.constructor.name==="WebGL2RenderingContext";let a=n.precision!==void 0?n.precision:"highp";const l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const c=o||e.has("WEBGL_draw_buffers"),f=n.logarithmicDepthBuffer===!0,h=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),d=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),p=t.getParameter(t.MAX_TEXTURE_SIZE),x=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),_=t.getParameter(t.MAX_VERTEX_ATTRIBS),m=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),u=t.getParameter(t.MAX_VARYING_VECTORS),v=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),g=d>0,y=o||e.has("OES_texture_float"),R=g&&y,A=o?t.getParameter(t.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:f,maxTextures:h,maxVertexTextures:d,maxTextureSize:p,maxCubemapSize:x,maxAttributes:_,maxVertexUniforms:m,maxVaryings:u,maxFragmentUniforms:v,vertexTextures:g,floatFragmentTextures:y,floatVertexTextures:R,maxSamples:A}}function KE(t){const e=this;let n=null,i=0,r=!1,s=!1;const o=new ir,a=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const p=h.length!==0||d||i!==0||r;return r=d,i=h.length,p},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){n=f(h,d,0)},this.setState=function(h,d,p){const x=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,u=t.get(h);if(!r||x===null||x.length===0||s&&!m)s?f(null):c();else{const v=s?0:i,g=v*4;let y=u.clippingState||null;l.value=y,y=f(x,d,g,p);for(let R=0;R!==g;++R)y[R]=n[R];u.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function f(h,d,p,x){const _=h!==null?h.length:0;let m=null;if(_!==0){if(m=l.value,x!==!0||m===null){const u=p+_*4,v=d.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<u)&&(m=new Float32Array(u));for(let g=0,y=p;g!==_;++g,y+=4)o.copy(h[g]).applyMatrix4(v,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function ZE(t){let e=new WeakMap;function n(o,a){return a===Hu?o.mapping=gs:a===Gu&&(o.mapping=vs),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===Hu||a===Gu)if(e.has(o)){const l=e.get(o).texture;return n(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new cS(l.height/2);return c.fromEquirectangularTexture(t,o),e.set(o,c),o.addEventListener("dispose",r),n(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class b0 extends A0{constructor(e=-1,n=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,o=i+e,a=r+n,l=r-n;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=f*this.view.offsetY,l=a-f*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const Qr=4,dp=[.125,.215,.35,.446,.526,.582],or=20,Uc=new b0,hp=new Xe;let Ic=null,Fc=0,Oc=0;const rr=(1+Math.sqrt(5))/2,Br=1/rr,pp=[new N(1,1,1),new N(-1,1,1),new N(1,1,-1),new N(-1,1,-1),new N(0,rr,Br),new N(0,rr,-Br),new N(Br,0,rr),new N(-Br,0,rr),new N(rr,Br,0),new N(-rr,Br,0)];class mp{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){Ic=this._renderer.getRenderTarget(),Fc=this._renderer.getActiveCubeFace(),Oc=this._renderer.getActiveMipmapLevel(),this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=_p(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ic,Fc,Oc),e.scissorTest=!1,_a(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===gs||e.mapping===vs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ic=this._renderer.getRenderTarget(),Fc=this._renderer.getActiveCubeFace(),Oc=this._renderer.getActiveMipmapLevel();const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Mn,minFilter:Mn,generateMipmaps:!1,type:Mo,format:Bn,colorSpace:mi,depthBuffer:!1},r=gp(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=gp(e,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=JE(s)),this._blurMaterial=QE(s,e,n)}return r}_compileMaterial(e){const n=new fn(this._lodPlanes[0],e);this._renderer.compile(n,Uc)}_sceneToCubeUV(e,n,i,r){const a=new En(90,1,n,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,d=f.toneMapping;f.getClearColor(hp),f.toneMapping=Hi,f.autoClear=!1;const p=new fl({name:"PMREM.Background",side:on,depthWrite:!1,depthTest:!1}),x=new fn(new ws,p);let _=!1;const m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,_=!0):(p.color.copy(hp),_=!0);for(let u=0;u<6;u++){const v=u%3;v===0?(a.up.set(0,l[u],0),a.lookAt(c[u],0,0)):v===1?(a.up.set(0,0,l[u]),a.lookAt(0,c[u],0)):(a.up.set(0,l[u],0),a.lookAt(0,0,c[u]));const g=this._cubeSize;_a(r,v*g,u>2?g:0,g,g),f.setRenderTarget(r),_&&f.render(x,a),f.render(e,a)}x.geometry.dispose(),x.material.dispose(),f.toneMapping=d,f.autoClear=h,e.background=m}_textureToCubeUV(e,n){const i=this._renderer,r=e.mapping===gs||e.mapping===vs;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=_p()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=vp());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new fn(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;_a(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(o,Uc)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){const s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=pp[(r-1)%pp.length];this._blur(e,r-1,r,s,o)}n.autoClear=i}_blur(e,n,i,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,n,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const f=3,h=new fn(this._lodPlanes[r],c),d=c.uniforms,p=this._sizeLods[i]-1,x=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*or-1),_=s/x,m=isFinite(s)?1+Math.floor(f*_):or;m>or&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${or}`);const u=[];let v=0;for(let C=0;C<or;++C){const U=C/_,M=Math.exp(-U*U/2);u.push(M),C===0?v+=M:C<m&&(v+=2*M)}for(let C=0;C<u.length;C++)u[C]=u[C]/v;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=u,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:g}=this;d.dTheta.value=x,d.mipInt.value=g-i;const y=this._sizeLods[r],R=3*y*(r>g-Qr?r-g+Qr:0),A=4*(this._cubeSize-y);_a(n,R,A,3*y,2*y),l.setRenderTarget(n),l.render(h,Uc)}}function JE(t){const e=[],n=[],i=[];let r=t;const s=t-Qr+1+dp.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);n.push(a);let l=1/a;o>t-Qr?l=dp[o-t+Qr-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),f=-c,h=1+c,d=[f,f,h,f,h,h,f,f,h,h,f,h],p=6,x=6,_=3,m=2,u=1,v=new Float32Array(_*x*p),g=new Float32Array(m*x*p),y=new Float32Array(u*x*p);for(let A=0;A<p;A++){const C=A%3*2/3-1,U=A>2?0:-1,M=[C,U,0,C+2/3,U,0,C+2/3,U+1,0,C,U,0,C+2/3,U+1,0,C,U+1,0];v.set(M,_*x*A),g.set(d,m*x*A);const T=[A,A,A,A,A,A];y.set(T,u*x*A)}const R=new bn;R.setAttribute("position",new Zn(v,_)),R.setAttribute("uv",new Zn(g,m)),R.setAttribute("faceIndex",new Zn(y,u)),e.push(R),r>Qr&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function gp(t,e,n){const i=new yr(t,e,n);return i.texture.mapping=Rl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function _a(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function QE(t,e,n){const i=new Float32Array(or),r=new N(0,1,0);return new Sr({name:"SphericalGaussianBlur",defines:{n:or,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Yf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function vp(){return new Sr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Yf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function _p(){return new Sr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Yf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function Yf(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function e1(t){let e=new WeakMap,n=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===Hu||l===Gu,f=l===gs||l===vs;if(c||f)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return n===null&&(n=new mp(t)),h=c?n.fromEquirectangular(a,h):n.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{const h=a.image;if(c&&h&&h.height>0||f&&h&&r(h)){n===null&&(n=new mp(t));const d=c?n.fromEquirectangular(a):n.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",s),d.texture}else return null}}}return a}function r(a){let l=0;const c=6;for(let f=0;f<c;f++)a[f]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:o}}function t1(t){const e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(i){i.isWebGL2?(n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance")):(n("WEBGL_depth_texture"),n("OES_texture_float"),n("OES_texture_half_float"),n("OES_texture_half_float_linear"),n("OES_standard_derivatives"),n("OES_element_index_uint"),n("OES_vertex_array_object"),n("ANGLE_instanced_arrays")),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture")},get:function(i){const r=n(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function n1(t,e,n,i){const r={},s=new WeakMap;function o(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const x in d.attributes)e.remove(d.attributes[x]);for(const x in d.morphAttributes){const _=d.morphAttributes[x];for(let m=0,u=_.length;m<u;m++)e.remove(_[m])}d.removeEventListener("dispose",o),delete r[d.id];const p=s.get(d);p&&(e.remove(p),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,n.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,n.memory.geometries++),d}function l(h){const d=h.attributes;for(const x in d)e.update(d[x],t.ARRAY_BUFFER);const p=h.morphAttributes;for(const x in p){const _=p[x];for(let m=0,u=_.length;m<u;m++)e.update(_[m],t.ARRAY_BUFFER)}}function c(h){const d=[],p=h.index,x=h.attributes.position;let _=0;if(p!==null){const v=p.array;_=p.version;for(let g=0,y=v.length;g<y;g+=3){const R=v[g+0],A=v[g+1],C=v[g+2];d.push(R,A,A,C,C,R)}}else if(x!==void 0){const v=x.array;_=x.version;for(let g=0,y=v.length/3-1;g<y;g+=3){const R=g+0,A=g+1,C=g+2;d.push(R,A,A,C,C,R)}}else return;const m=new(g0(d)?T0:E0)(d,1);m.version=_;const u=s.get(h);u&&e.remove(u),s.set(h,m)}function f(h){const d=s.get(h);if(d){const p=h.index;p!==null&&d.version<p.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:f}}function i1(t,e,n,i){const r=i.isWebGL2;let s;function o(p){s=p}let a,l;function c(p){a=p.type,l=p.bytesPerElement}function f(p,x){t.drawElements(s,x,a,p*l),n.update(x,s,1)}function h(p,x,_){if(_===0)return;let m,u;if(r)m=t,u="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),u="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[u](s,x,a,p*l,_),n.update(x,s,_)}function d(p,x,_){if(_===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let u=0;u<_;u++)this.render(p[u]/l,x[u]);else{m.multiDrawElementsWEBGL(s,x,0,a,p,0,_);let u=0;for(let v=0;v<_;v++)u+=x[v];n.update(u,s,1)}}this.setMode=o,this.setIndex=c,this.render=f,this.renderInstances=h,this.renderMultiDraw=d}function r1(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(n.calls++,o){case t.TRIANGLES:n.triangles+=a*(s/3);break;case t.LINES:n.lines+=a*(s/2);break;case t.LINE_STRIP:n.lines+=a*(s-1);break;case t.LINE_LOOP:n.lines+=a*s;break;case t.POINTS:n.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function s1(t,e){return t[0]-e[0]}function o1(t,e){return Math.abs(e[1])-Math.abs(t[1])}function a1(t,e,n){const i={},r=new Float32Array(8),s=new WeakMap,o=new bt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,f,h){const d=c.morphTargetInfluences;if(e.isWebGL2===!0){const x=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,_=x!==void 0?x.length:0;let m=s.get(f);if(m===void 0||m.count!==_){let O=function(){ie.dispose(),s.delete(f),f.removeEventListener("dispose",O)};var p=O;m!==void 0&&m.texture.dispose();const g=f.morphAttributes.position!==void 0,y=f.morphAttributes.normal!==void 0,R=f.morphAttributes.color!==void 0,A=f.morphAttributes.position||[],C=f.morphAttributes.normal||[],U=f.morphAttributes.color||[];let M=0;g===!0&&(M=1),y===!0&&(M=2),R===!0&&(M=3);let T=f.attributes.position.count*M,W=1;T>e.maxTextureSize&&(W=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const q=new Float32Array(T*W*4*_),ie=new x0(q,T,W,_);ie.type=Li,ie.needsUpdate=!0;const P=M*4;for(let X=0;X<_;X++){const Y=A[X],D=C[X],F=U[X],k=T*W*4*X;for(let $=0;$<Y.count;$++){const K=$*P;g===!0&&(o.fromBufferAttribute(Y,$),q[k+K+0]=o.x,q[k+K+1]=o.y,q[k+K+2]=o.z,q[k+K+3]=0),y===!0&&(o.fromBufferAttribute(D,$),q[k+K+4]=o.x,q[k+K+5]=o.y,q[k+K+6]=o.z,q[k+K+7]=0),R===!0&&(o.fromBufferAttribute(F,$),q[k+K+8]=o.x,q[k+K+9]=o.y,q[k+K+10]=o.z,q[k+K+11]=F.itemSize===4?o.w:1)}}m={count:_,texture:ie,size:new Me(T,W)},s.set(f,m),f.addEventListener("dispose",O)}let u=0;for(let g=0;g<d.length;g++)u+=d[g];const v=f.morphTargetsRelative?1:1-u;h.getUniforms().setValue(t,"morphTargetBaseInfluence",v),h.getUniforms().setValue(t,"morphTargetInfluences",d),h.getUniforms().setValue(t,"morphTargetsTexture",m.texture,n),h.getUniforms().setValue(t,"morphTargetsTextureSize",m.size)}else{const x=d===void 0?0:d.length;let _=i[f.id];if(_===void 0||_.length!==x){_=[];for(let y=0;y<x;y++)_[y]=[y,0];i[f.id]=_}for(let y=0;y<x;y++){const R=_[y];R[0]=y,R[1]=d[y]}_.sort(o1);for(let y=0;y<8;y++)y<x&&_[y][1]?(a[y][0]=_[y][0],a[y][1]=_[y][1]):(a[y][0]=Number.MAX_SAFE_INTEGER,a[y][1]=0);a.sort(s1);const m=f.morphAttributes.position,u=f.morphAttributes.normal;let v=0;for(let y=0;y<8;y++){const R=a[y],A=R[0],C=R[1];A!==Number.MAX_SAFE_INTEGER&&C?(m&&f.getAttribute("morphTarget"+y)!==m[A]&&f.setAttribute("morphTarget"+y,m[A]),u&&f.getAttribute("morphNormal"+y)!==u[A]&&f.setAttribute("morphNormal"+y,u[A]),r[y]=C,v+=C):(m&&f.hasAttribute("morphTarget"+y)===!0&&f.deleteAttribute("morphTarget"+y),u&&f.hasAttribute("morphNormal"+y)===!0&&f.deleteAttribute("morphNormal"+y),r[y]=0)}const g=f.morphTargetsRelative?1:1-v;h.getUniforms().setValue(t,"morphTargetBaseInfluence",g),h.getUniforms().setValue(t,"morphTargetInfluences",r)}}return{update:l}}function l1(t,e,n,i){let r=new WeakMap;function s(l){const c=i.render.frame,f=l.geometry,h=e.get(l,f);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(n.update(l.instanceMatrix,t.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,t.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:s,dispose:o}}class P0 extends pn{constructor(e,n,i,r,s,o,a,l,c,f){if(f=f!==void 0?f:hr,f!==hr&&f!==_s)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&f===hr&&(i=Pi),i===void 0&&f===_s&&(i=dr),super(null,r,s,o,a,l,f,i,c),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=a!==void 0?a:$t,this.minFilter=l!==void 0?l:$t,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const L0=new pn,N0=new P0(1,1);N0.compareFunction=m0;const D0=new x0,U0=new jy,I0=new C0,xp=[],yp=[],Sp=new Float32Array(16),Mp=new Float32Array(9),Ep=new Float32Array(4);function As(t,e,n){const i=t[0];if(i<=0||i>0)return t;const r=e*n;let s=xp[r];if(s===void 0&&(s=new Float32Array(r),xp[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=n,t[o].toArray(s,a)}return s}function Et(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function Tt(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Nl(t,e){let n=yp[e];n===void 0&&(n=new Int32Array(e),yp[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function c1(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function u1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Et(n,e))return;t.uniform2fv(this.addr,e),Tt(n,e)}}function f1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(Et(n,e))return;t.uniform3fv(this.addr,e),Tt(n,e)}}function d1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Et(n,e))return;t.uniform4fv(this.addr,e),Tt(n,e)}}function h1(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Et(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),Tt(n,e)}else{if(Et(n,i))return;Ep.set(i),t.uniformMatrix2fv(this.addr,!1,Ep),Tt(n,i)}}function p1(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Et(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),Tt(n,e)}else{if(Et(n,i))return;Mp.set(i),t.uniformMatrix3fv(this.addr,!1,Mp),Tt(n,i)}}function m1(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Et(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),Tt(n,e)}else{if(Et(n,i))return;Sp.set(i),t.uniformMatrix4fv(this.addr,!1,Sp),Tt(n,i)}}function g1(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function v1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Et(n,e))return;t.uniform2iv(this.addr,e),Tt(n,e)}}function _1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Et(n,e))return;t.uniform3iv(this.addr,e),Tt(n,e)}}function x1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Et(n,e))return;t.uniform4iv(this.addr,e),Tt(n,e)}}function y1(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function S1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Et(n,e))return;t.uniform2uiv(this.addr,e),Tt(n,e)}}function M1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Et(n,e))return;t.uniform3uiv(this.addr,e),Tt(n,e)}}function E1(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Et(n,e))return;t.uniform4uiv(this.addr,e),Tt(n,e)}}function T1(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);const s=this.type===t.SAMPLER_2D_SHADOW?N0:L0;n.setTexture2D(e||s,r)}function w1(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||U0,r)}function A1(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||I0,r)}function C1(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||D0,r)}function R1(t){switch(t){case 5126:return c1;case 35664:return u1;case 35665:return f1;case 35666:return d1;case 35674:return h1;case 35675:return p1;case 35676:return m1;case 5124:case 35670:return g1;case 35667:case 35671:return v1;case 35668:case 35672:return _1;case 35669:case 35673:return x1;case 5125:return y1;case 36294:return S1;case 36295:return M1;case 36296:return E1;case 35678:case 36198:case 36298:case 36306:case 35682:return T1;case 35679:case 36299:case 36307:return w1;case 35680:case 36300:case 36308:case 36293:return A1;case 36289:case 36303:case 36311:case 36292:return C1}}function b1(t,e){t.uniform1fv(this.addr,e)}function P1(t,e){const n=As(e,this.size,2);t.uniform2fv(this.addr,n)}function L1(t,e){const n=As(e,this.size,3);t.uniform3fv(this.addr,n)}function N1(t,e){const n=As(e,this.size,4);t.uniform4fv(this.addr,n)}function D1(t,e){const n=As(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function U1(t,e){const n=As(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function I1(t,e){const n=As(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function F1(t,e){t.uniform1iv(this.addr,e)}function O1(t,e){t.uniform2iv(this.addr,e)}function k1(t,e){t.uniform3iv(this.addr,e)}function z1(t,e){t.uniform4iv(this.addr,e)}function B1(t,e){t.uniform1uiv(this.addr,e)}function H1(t,e){t.uniform2uiv(this.addr,e)}function G1(t,e){t.uniform3uiv(this.addr,e)}function V1(t,e){t.uniform4uiv(this.addr,e)}function W1(t,e,n){const i=this.cache,r=e.length,s=Nl(n,r);Et(i,s)||(t.uniform1iv(this.addr,s),Tt(i,s));for(let o=0;o!==r;++o)n.setTexture2D(e[o]||L0,s[o])}function X1(t,e,n){const i=this.cache,r=e.length,s=Nl(n,r);Et(i,s)||(t.uniform1iv(this.addr,s),Tt(i,s));for(let o=0;o!==r;++o)n.setTexture3D(e[o]||U0,s[o])}function j1(t,e,n){const i=this.cache,r=e.length,s=Nl(n,r);Et(i,s)||(t.uniform1iv(this.addr,s),Tt(i,s));for(let o=0;o!==r;++o)n.setTextureCube(e[o]||I0,s[o])}function q1(t,e,n){const i=this.cache,r=e.length,s=Nl(n,r);Et(i,s)||(t.uniform1iv(this.addr,s),Tt(i,s));for(let o=0;o!==r;++o)n.setTexture2DArray(e[o]||D0,s[o])}function Y1(t){switch(t){case 5126:return b1;case 35664:return P1;case 35665:return L1;case 35666:return N1;case 35674:return D1;case 35675:return U1;case 35676:return I1;case 5124:case 35670:return F1;case 35667:case 35671:return O1;case 35668:case 35672:return k1;case 35669:case 35673:return z1;case 5125:return B1;case 36294:return H1;case 36295:return G1;case 36296:return V1;case 35678:case 36198:case 36298:case 36306:case 35682:return W1;case 35679:case 36299:case 36307:return X1;case 35680:case 36300:case 36308:case 36293:return j1;case 36289:case 36303:case 36311:case 36292:return q1}}class $1{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=R1(n.type)}}class K1{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=Y1(n.type)}}class Z1{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,n[a.id],i)}}}const kc=/(\w+)(\])?(\[|\.)?/g;function Tp(t,e){t.seq.push(e),t.map[e.id]=e}function J1(t,e,n){const i=t.name,r=i.length;for(kc.lastIndex=0;;){const s=kc.exec(i),o=kc.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Tp(n,c===void 0?new $1(a,t,e):new K1(a,t,e));break}else{let h=n.map[a];h===void 0&&(h=new Z1(a),Tp(n,h)),n=h}}}class Ua{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(n,r),o=e.getUniformLocation(n,s.name);J1(s,o,this)}}setValue(e,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){const r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,o=n.length;s!==o;++s){const a=n[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,n){const i=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in n&&i.push(o)}return i}}function wp(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const Q1=37297;let eT=0;function tT(t,e){const n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let o=r;o<s;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${n[o]}`)}return i.join(`
`)}function nT(t){const e=Ze.getPrimaries(Ze.workingColorSpace),n=Ze.getPrimaries(t);let i;switch(e===n?i="":e===ll&&n===al?i="LinearDisplayP3ToLinearSRGB":e===al&&n===ll&&(i="LinearSRGBToLinearDisplayP3"),t){case mi:case bl:return[i,"LinearTransferOETF"];case Nt:case jf:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[i,"LinearTransferOETF"]}}function Ap(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+tT(t.getShaderSource(e),o)}else return r}function iT(t,e){const n=nT(e);return`vec4 ${t}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function rT(t,e){let n;switch(e){case my:n="Linear";break;case gy:n="Reinhard";break;case vy:n="OptimizedCineon";break;case _y:n="ACESFilmic";break;case yy:n="AgX";break;case xy:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}function sT(t){return[t.extensionDerivatives||t.envMapCubeUVHeight||t.bumpMap||t.normalMapTangentSpace||t.clearcoatNormalMap||t.flatShading||t.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(t.extensionFragDepth||t.logarithmicDepthBuffer)&&t.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",t.extensionDrawBuffers&&t.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(t.extensionShaderTextureLOD||t.envMap||t.transmission)&&t.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(es).join(`
`)}function oT(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(es).join(`
`)}function aT(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function lT(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=t.getActiveAttrib(e,r),o=s.name;let a=1;s.type===t.FLOAT_MAT2&&(a=2),s.type===t.FLOAT_MAT3&&(a=3),s.type===t.FLOAT_MAT4&&(a=4),n[o]={type:s.type,location:t.getAttribLocation(e,o),locationSize:a}}return n}function es(t){return t!==""}function Cp(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Rp(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const cT=/^[ \t]*#include +<([\w\d./]+)>/gm;function Yu(t){return t.replace(cT,fT)}const uT=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function fT(t,e){let n=Fe[e];if(n===void 0){const i=uT.get(e);if(i!==void 0)n=Fe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Yu(n)}const dT=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function bp(t){return t.replace(dT,hT)}function hT(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Pp(t){let e="precision "+t.precision+` float;
precision `+t.precision+" int;";return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function pT(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===i0?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===Vx?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===ri&&(e="SHADOWMAP_TYPE_VSM"),e}function mT(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case gs:case vs:e="ENVMAP_TYPE_CUBE";break;case Rl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function gT(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case vs:e="ENVMAP_MODE_REFRACTION";break}return e}function vT(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case r0:e="ENVMAP_BLENDING_MULTIPLY";break;case hy:e="ENVMAP_BLENDING_MIX";break;case py:e="ENVMAP_BLENDING_ADD";break}return e}function _T(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function xT(t,e,n,i){const r=t.getContext(),s=n.defines;let o=n.vertexShader,a=n.fragmentShader;const l=pT(n),c=mT(n),f=gT(n),h=vT(n),d=_T(n),p=n.isWebGL2?"":sT(n),x=oT(n),_=aT(s),m=r.createProgram();let u,v,g=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(u=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(es).join(`
`),u.length>0&&(u+=`
`),v=[p,"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(es).join(`
`),v.length>0&&(v+=`
`)):(u=[Pp(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+f:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors&&n.isWebGL2?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0&&n.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",n.morphTargetsCount>0&&n.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0&&n.isWebGL2?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.useLegacyLights?"#define LEGACY_LIGHTS":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.logarithmicDepthBuffer&&n.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(es).join(`
`),v=[p,Pp(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+f:"",n.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.useLegacyLights?"#define LEGACY_LIGHTS":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.logarithmicDepthBuffer&&n.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Hi?"#define TONE_MAPPING":"",n.toneMapping!==Hi?Fe.tonemapping_pars_fragment:"",n.toneMapping!==Hi?rT("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Fe.colorspace_pars_fragment,iT("linearToOutputTexel",n.outputColorSpace),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(es).join(`
`)),o=Yu(o),o=Cp(o,n),o=Rp(o,n),a=Yu(a),a=Cp(a,n),a=Rp(a,n),o=bp(o),a=bp(a),n.isWebGL2&&n.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,u=[x,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+u,v=["precision mediump sampler2DArray;","#define varying in",n.glslVersion===Yh?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Yh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);const y=g+u+o,R=g+v+a,A=wp(r,r.VERTEX_SHADER,y),C=wp(r,r.FRAGMENT_SHADER,R);r.attachShader(m,A),r.attachShader(m,C),n.index0AttributeName!==void 0?r.bindAttribLocation(m,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(m,0,"position"),r.linkProgram(m);function U(q){if(t.debug.checkShaderErrors){const ie=r.getProgramInfoLog(m).trim(),P=r.getShaderInfoLog(A).trim(),O=r.getShaderInfoLog(C).trim();let X=!0,Y=!0;if(r.getProgramParameter(m,r.LINK_STATUS)===!1)if(X=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,m,A,C);else{const D=Ap(r,A,"vertex"),F=Ap(r,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(m,r.VALIDATE_STATUS)+`

Program Info Log: `+ie+`
`+D+`
`+F)}else ie!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ie):(P===""||O==="")&&(Y=!1);Y&&(q.diagnostics={runnable:X,programLog:ie,vertexShader:{log:P,prefix:u},fragmentShader:{log:O,prefix:v}})}r.deleteShader(A),r.deleteShader(C),M=new Ua(r,m),T=lT(r,m)}let M;this.getUniforms=function(){return M===void 0&&U(this),M};let T;this.getAttributes=function(){return T===void 0&&U(this),T};let W=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return W===!1&&(W=r.getProgramParameter(m,Q1)),W},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=eT++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=A,this.fragmentShader=C,this}let yT=0;class ST{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new MT(e),n.set(e,i)),i}}class MT{constructor(e){this.id=yT++,this.code=e,this.usedTimes=0}}function ET(t,e,n,i,r,s,o){const a=new S0,l=new ST,c=[],f=r.isWebGL2,h=r.logarithmicDepthBuffer,d=r.vertexTextures;let p=r.precision;const x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(M){return M===0?"uv":`uv${M}`}function m(M,T,W,q,ie){const P=q.fog,O=ie.geometry,X=M.isMeshStandardMaterial?q.environment:null,Y=(M.isMeshStandardMaterial?n:e).get(M.envMap||X),D=Y&&Y.mapping===Rl?Y.image.height:null,F=x[M.type];M.precision!==null&&(p=r.getMaxPrecision(M.precision),p!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",p,"instead."));const k=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,$=k!==void 0?k.length:0;let K=0;O.morphAttributes.position!==void 0&&(K=1),O.morphAttributes.normal!==void 0&&(K=2),O.morphAttributes.color!==void 0&&(K=3);let j,Z,le,de;if(F){const Xt=qn[F];j=Xt.vertexShader,Z=Xt.fragmentShader}else j=M.vertexShader,Z=M.fragmentShader,l.update(M),le=l.getVertexShaderID(M),de=l.getFragmentShaderID(M);const me=t.getRenderTarget(),Ne=ie.isInstancedMesh===!0,Ue=ie.isBatchedMesh===!0,we=!!M.map,je=!!M.matcap,z=!!Y,Wt=!!M.aoMap,ye=!!M.lightMap,Pe=!!M.bumpMap,ge=!!M.normalMap,ot=!!M.displacementMap,Oe=!!M.emissiveMap,w=!!M.metalnessMap,S=!!M.roughnessMap,H=M.anisotropy>0,te=M.clearcoat>0,Q=M.iridescence>0,ne=M.sheen>0,ve=M.transmission>0,ce=H&&!!M.anisotropyMap,he=te&&!!M.clearcoatMap,Te=te&&!!M.clearcoatNormalMap,ke=te&&!!M.clearcoatRoughnessMap,J=Q&&!!M.iridescenceMap,Ke=Q&&!!M.iridescenceThicknessMap,Ve=ne&&!!M.sheenColorMap,be=ne&&!!M.sheenRoughnessMap,xe=!!M.specularMap,pe=!!M.specularColorMap,Ie=!!M.specularIntensityMap,Ye=ve&&!!M.transmissionMap,ft=ve&&!!M.thicknessMap,Be=!!M.gradientMap,re=!!M.alphaMap,b=M.alphaTest>0,oe=!!M.alphaHash,ae=!!M.extensions,Ae=!!O.attributes.uv1,Se=!!O.attributes.uv2,Je=!!O.attributes.uv3;let Qe=Hi;return M.toneMapped&&(me===null||me.isXRRenderTarget===!0)&&(Qe=t.toneMapping),{isWebGL2:f,shaderID:F,shaderType:M.type,shaderName:M.name,vertexShader:j,fragmentShader:Z,defines:M.defines,customVertexShaderID:le,customFragmentShaderID:de,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:p,batching:Ue,instancing:Ne,instancingColor:Ne&&ie.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:me===null?t.outputColorSpace:me.isXRRenderTarget===!0?me.texture.colorSpace:mi,map:we,matcap:je,envMap:z,envMapMode:z&&Y.mapping,envMapCubeUVHeight:D,aoMap:Wt,lightMap:ye,bumpMap:Pe,normalMap:ge,displacementMap:d&&ot,emissiveMap:Oe,normalMapObjectSpace:ge&&M.normalMapType===Ny,normalMapTangentSpace:ge&&M.normalMapType===p0,metalnessMap:w,roughnessMap:S,anisotropy:H,anisotropyMap:ce,clearcoat:te,clearcoatMap:he,clearcoatNormalMap:Te,clearcoatRoughnessMap:ke,iridescence:Q,iridescenceMap:J,iridescenceThicknessMap:Ke,sheen:ne,sheenColorMap:Ve,sheenRoughnessMap:be,specularMap:xe,specularColorMap:pe,specularIntensityMap:Ie,transmission:ve,transmissionMap:Ye,thicknessMap:ft,gradientMap:Be,opaque:M.transparent===!1&&M.blending===as,alphaMap:re,alphaTest:b,alphaHash:oe,combine:M.combine,mapUv:we&&_(M.map.channel),aoMapUv:Wt&&_(M.aoMap.channel),lightMapUv:ye&&_(M.lightMap.channel),bumpMapUv:Pe&&_(M.bumpMap.channel),normalMapUv:ge&&_(M.normalMap.channel),displacementMapUv:ot&&_(M.displacementMap.channel),emissiveMapUv:Oe&&_(M.emissiveMap.channel),metalnessMapUv:w&&_(M.metalnessMap.channel),roughnessMapUv:S&&_(M.roughnessMap.channel),anisotropyMapUv:ce&&_(M.anisotropyMap.channel),clearcoatMapUv:he&&_(M.clearcoatMap.channel),clearcoatNormalMapUv:Te&&_(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ke&&_(M.clearcoatRoughnessMap.channel),iridescenceMapUv:J&&_(M.iridescenceMap.channel),iridescenceThicknessMapUv:Ke&&_(M.iridescenceThicknessMap.channel),sheenColorMapUv:Ve&&_(M.sheenColorMap.channel),sheenRoughnessMapUv:be&&_(M.sheenRoughnessMap.channel),specularMapUv:xe&&_(M.specularMap.channel),specularColorMapUv:pe&&_(M.specularColorMap.channel),specularIntensityMapUv:Ie&&_(M.specularIntensityMap.channel),transmissionMapUv:Ye&&_(M.transmissionMap.channel),thicknessMapUv:ft&&_(M.thicknessMap.channel),alphaMapUv:re&&_(M.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(ge||H),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,vertexUv1s:Ae,vertexUv2s:Se,vertexUv3s:Je,pointsUvs:ie.isPoints===!0&&!!O.attributes.uv&&(we||re),fog:!!P,useFog:M.fog===!0,fogExp2:P&&P.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:ie.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:$,morphTextureStride:K,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:t.shadowMap.enabled&&W.length>0,shadowMapType:t.shadowMap.type,toneMapping:Qe,useLegacyLights:t._useLegacyLights,decodeVideoTexture:we&&M.map.isVideoTexture===!0&&Ze.getTransfer(M.map.colorSpace)===it,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===kn,flipSided:M.side===on,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionDerivatives:ae&&M.extensions.derivatives===!0,extensionFragDepth:ae&&M.extensions.fragDepth===!0,extensionDrawBuffers:ae&&M.extensions.drawBuffers===!0,extensionShaderTextureLOD:ae&&M.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ae&&M.extensions.clipCullDistance&&i.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:f||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:f||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:f||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()}}function u(M){const T=[];if(M.shaderID?T.push(M.shaderID):(T.push(M.customVertexShaderID),T.push(M.customFragmentShaderID)),M.defines!==void 0)for(const W in M.defines)T.push(W),T.push(M.defines[W]);return M.isRawShaderMaterial===!1&&(v(T,M),g(T,M),T.push(t.outputColorSpace)),T.push(M.customProgramCacheKey),T.join()}function v(M,T){M.push(T.precision),M.push(T.outputColorSpace),M.push(T.envMapMode),M.push(T.envMapCubeUVHeight),M.push(T.mapUv),M.push(T.alphaMapUv),M.push(T.lightMapUv),M.push(T.aoMapUv),M.push(T.bumpMapUv),M.push(T.normalMapUv),M.push(T.displacementMapUv),M.push(T.emissiveMapUv),M.push(T.metalnessMapUv),M.push(T.roughnessMapUv),M.push(T.anisotropyMapUv),M.push(T.clearcoatMapUv),M.push(T.clearcoatNormalMapUv),M.push(T.clearcoatRoughnessMapUv),M.push(T.iridescenceMapUv),M.push(T.iridescenceThicknessMapUv),M.push(T.sheenColorMapUv),M.push(T.sheenRoughnessMapUv),M.push(T.specularMapUv),M.push(T.specularColorMapUv),M.push(T.specularIntensityMapUv),M.push(T.transmissionMapUv),M.push(T.thicknessMapUv),M.push(T.combine),M.push(T.fogExp2),M.push(T.sizeAttenuation),M.push(T.morphTargetsCount),M.push(T.morphAttributeCount),M.push(T.numDirLights),M.push(T.numPointLights),M.push(T.numSpotLights),M.push(T.numSpotLightMaps),M.push(T.numHemiLights),M.push(T.numRectAreaLights),M.push(T.numDirLightShadows),M.push(T.numPointLightShadows),M.push(T.numSpotLightShadows),M.push(T.numSpotLightShadowsWithMaps),M.push(T.numLightProbes),M.push(T.shadowMapType),M.push(T.toneMapping),M.push(T.numClippingPlanes),M.push(T.numClipIntersection),M.push(T.depthPacking)}function g(M,T){a.disableAll(),T.isWebGL2&&a.enable(0),T.supportsVertexTextures&&a.enable(1),T.instancing&&a.enable(2),T.instancingColor&&a.enable(3),T.matcap&&a.enable(4),T.envMap&&a.enable(5),T.normalMapObjectSpace&&a.enable(6),T.normalMapTangentSpace&&a.enable(7),T.clearcoat&&a.enable(8),T.iridescence&&a.enable(9),T.alphaTest&&a.enable(10),T.vertexColors&&a.enable(11),T.vertexAlphas&&a.enable(12),T.vertexUv1s&&a.enable(13),T.vertexUv2s&&a.enable(14),T.vertexUv3s&&a.enable(15),T.vertexTangents&&a.enable(16),T.anisotropy&&a.enable(17),T.alphaHash&&a.enable(18),T.batching&&a.enable(19),M.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.skinning&&a.enable(4),T.morphTargets&&a.enable(5),T.morphNormals&&a.enable(6),T.morphColors&&a.enable(7),T.premultipliedAlpha&&a.enable(8),T.shadowMapEnabled&&a.enable(9),T.useLegacyLights&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),M.push(a.mask)}function y(M){const T=x[M.type];let W;if(T){const q=qn[T];W=sS.clone(q.uniforms)}else W=M.uniforms;return W}function R(M,T){let W;for(let q=0,ie=c.length;q<ie;q++){const P=c[q];if(P.cacheKey===T){W=P,++W.usedTimes;break}}return W===void 0&&(W=new xT(t,T,M,s),c.push(W)),W}function A(M){if(--M.usedTimes===0){const T=c.indexOf(M);c[T]=c[c.length-1],c.pop(),M.destroy()}}function C(M){l.remove(M)}function U(){l.dispose()}return{getParameters:m,getProgramCacheKey:u,getUniforms:y,acquireProgram:R,releaseProgram:A,releaseShaderCache:C,programs:c,dispose:U}}function TT(){let t=new WeakMap;function e(s){let o=t.get(s);return o===void 0&&(o={},t.set(s,o)),o}function n(s){t.delete(s)}function i(s,o,a){t.get(s)[o]=a}function r(){t=new WeakMap}return{get:e,remove:n,update:i,dispose:r}}function wT(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function Lp(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function Np(){const t=[];let e=0;const n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function o(h,d,p,x,_,m){let u=t[e];return u===void 0?(u={id:h.id,object:h,geometry:d,material:p,groupOrder:x,renderOrder:h.renderOrder,z:_,group:m},t[e]=u):(u.id=h.id,u.object=h,u.geometry=d,u.material=p,u.groupOrder=x,u.renderOrder=h.renderOrder,u.z=_,u.group=m),e++,u}function a(h,d,p,x,_,m){const u=o(h,d,p,x,_,m);p.transmission>0?i.push(u):p.transparent===!0?r.push(u):n.push(u)}function l(h,d,p,x,_,m){const u=o(h,d,p,x,_,m);p.transmission>0?i.unshift(u):p.transparent===!0?r.unshift(u):n.unshift(u)}function c(h,d){n.length>1&&n.sort(h||wT),i.length>1&&i.sort(d||Lp),r.length>1&&r.sort(d||Lp)}function f(){for(let h=e,d=t.length;h<d;h++){const p=t[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:f,sort:c}}function AT(){let t=new WeakMap;function e(i,r){const s=t.get(i);let o;return s===void 0?(o=new Np,t.set(i,[o])):r>=s.length?(o=new Np,s.push(o)):o=s[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}function CT(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new N,color:new Xe};break;case"SpotLight":n={position:new N,direction:new N,color:new Xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new N,color:new Xe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new N,skyColor:new Xe,groundColor:new Xe};break;case"RectAreaLight":n={color:new Xe,position:new N,halfWidth:new N,halfHeight:new N};break}return t[e.id]=n,n}}}function RT(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me};break;case"SpotLight":n={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me};break;case"PointLight":n={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let bT=0;function PT(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function LT(t,e){const n=new CT,i=RT(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let f=0;f<9;f++)r.probe.push(new N);const s=new N,o=new gt,a=new gt;function l(f,h){let d=0,p=0,x=0;for(let q=0;q<9;q++)r.probe[q].set(0,0,0);let _=0,m=0,u=0,v=0,g=0,y=0,R=0,A=0,C=0,U=0,M=0;f.sort(PT);const T=h===!0?Math.PI:1;for(let q=0,ie=f.length;q<ie;q++){const P=f[q],O=P.color,X=P.intensity,Y=P.distance,D=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)d+=O.r*X*T,p+=O.g*X*T,x+=O.b*X*T;else if(P.isLightProbe){for(let F=0;F<9;F++)r.probe[F].addScaledVector(P.sh.coefficients[F],X);M++}else if(P.isDirectionalLight){const F=n.get(P);if(F.color.copy(P.color).multiplyScalar(P.intensity*T),P.castShadow){const k=P.shadow,$=i.get(P);$.shadowBias=k.bias,$.shadowNormalBias=k.normalBias,$.shadowRadius=k.radius,$.shadowMapSize=k.mapSize,r.directionalShadow[_]=$,r.directionalShadowMap[_]=D,r.directionalShadowMatrix[_]=P.shadow.matrix,y++}r.directional[_]=F,_++}else if(P.isSpotLight){const F=n.get(P);F.position.setFromMatrixPosition(P.matrixWorld),F.color.copy(O).multiplyScalar(X*T),F.distance=Y,F.coneCos=Math.cos(P.angle),F.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),F.decay=P.decay,r.spot[u]=F;const k=P.shadow;if(P.map&&(r.spotLightMap[C]=P.map,C++,k.updateMatrices(P),P.castShadow&&U++),r.spotLightMatrix[u]=k.matrix,P.castShadow){const $=i.get(P);$.shadowBias=k.bias,$.shadowNormalBias=k.normalBias,$.shadowRadius=k.radius,$.shadowMapSize=k.mapSize,r.spotShadow[u]=$,r.spotShadowMap[u]=D,A++}u++}else if(P.isRectAreaLight){const F=n.get(P);F.color.copy(O).multiplyScalar(X),F.halfWidth.set(P.width*.5,0,0),F.halfHeight.set(0,P.height*.5,0),r.rectArea[v]=F,v++}else if(P.isPointLight){const F=n.get(P);if(F.color.copy(P.color).multiplyScalar(P.intensity*T),F.distance=P.distance,F.decay=P.decay,P.castShadow){const k=P.shadow,$=i.get(P);$.shadowBias=k.bias,$.shadowNormalBias=k.normalBias,$.shadowRadius=k.radius,$.shadowMapSize=k.mapSize,$.shadowCameraNear=k.camera.near,$.shadowCameraFar=k.camera.far,r.pointShadow[m]=$,r.pointShadowMap[m]=D,r.pointShadowMatrix[m]=P.shadow.matrix,R++}r.point[m]=F,m++}else if(P.isHemisphereLight){const F=n.get(P);F.skyColor.copy(P.color).multiplyScalar(X*T),F.groundColor.copy(P.groundColor).multiplyScalar(X*T),r.hemi[g]=F,g++}}v>0&&(e.isWebGL2?t.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=se.LTC_FLOAT_1,r.rectAreaLTC2=se.LTC_FLOAT_2):(r.rectAreaLTC1=se.LTC_HALF_1,r.rectAreaLTC2=se.LTC_HALF_2):t.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=se.LTC_FLOAT_1,r.rectAreaLTC2=se.LTC_FLOAT_2):t.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=se.LTC_HALF_1,r.rectAreaLTC2=se.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=d,r.ambient[1]=p,r.ambient[2]=x;const W=r.hash;(W.directionalLength!==_||W.pointLength!==m||W.spotLength!==u||W.rectAreaLength!==v||W.hemiLength!==g||W.numDirectionalShadows!==y||W.numPointShadows!==R||W.numSpotShadows!==A||W.numSpotMaps!==C||W.numLightProbes!==M)&&(r.directional.length=_,r.spot.length=u,r.rectArea.length=v,r.point.length=m,r.hemi.length=g,r.directionalShadow.length=y,r.directionalShadowMap.length=y,r.pointShadow.length=R,r.pointShadowMap.length=R,r.spotShadow.length=A,r.spotShadowMap.length=A,r.directionalShadowMatrix.length=y,r.pointShadowMatrix.length=R,r.spotLightMatrix.length=A+C-U,r.spotLightMap.length=C,r.numSpotLightShadowsWithMaps=U,r.numLightProbes=M,W.directionalLength=_,W.pointLength=m,W.spotLength=u,W.rectAreaLength=v,W.hemiLength=g,W.numDirectionalShadows=y,W.numPointShadows=R,W.numSpotShadows=A,W.numSpotMaps=C,W.numLightProbes=M,r.version=bT++)}function c(f,h){let d=0,p=0,x=0,_=0,m=0;const u=h.matrixWorldInverse;for(let v=0,g=f.length;v<g;v++){const y=f[v];if(y.isDirectionalLight){const R=r.directional[d];R.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(u),d++}else if(y.isSpotLight){const R=r.spot[x];R.position.setFromMatrixPosition(y.matrixWorld),R.position.applyMatrix4(u),R.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(u),x++}else if(y.isRectAreaLight){const R=r.rectArea[_];R.position.setFromMatrixPosition(y.matrixWorld),R.position.applyMatrix4(u),a.identity(),o.copy(y.matrixWorld),o.premultiply(u),a.extractRotation(o),R.halfWidth.set(y.width*.5,0,0),R.halfHeight.set(0,y.height*.5,0),R.halfWidth.applyMatrix4(a),R.halfHeight.applyMatrix4(a),_++}else if(y.isPointLight){const R=r.point[p];R.position.setFromMatrixPosition(y.matrixWorld),R.position.applyMatrix4(u),p++}else if(y.isHemisphereLight){const R=r.hemi[m];R.direction.setFromMatrixPosition(y.matrixWorld),R.direction.transformDirection(u),m++}}}return{setup:l,setupView:c,state:r}}function Dp(t,e){const n=new LT(t,e),i=[],r=[];function s(){i.length=0,r.length=0}function o(h){i.push(h)}function a(h){r.push(h)}function l(h){n.setup(i,h)}function c(h){n.setupView(i,h)}return{init:s,state:{lightsArray:i,shadowsArray:r,lights:n},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function NT(t,e){let n=new WeakMap;function i(s,o=0){const a=n.get(s);let l;return a===void 0?(l=new Dp(t,e),n.set(s,[l])):o>=a.length?(l=new Dp(t,e),a.push(l)):l=a[o],l}function r(){n=new WeakMap}return{get:i,dispose:r}}class DT extends Ts{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Py,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class UT extends Ts{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const IT=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,FT=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function OT(t,e,n){let i=new qf;const r=new Me,s=new Me,o=new bt,a=new DT({depthPacking:Ly}),l=new UT,c={},f=n.maxTextureSize,h={[Xi]:on,[on]:Xi,[kn]:kn},d=new Sr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Me},radius:{value:4}},vertexShader:IT,fragmentShader:FT}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const x=new bn;x.setAttribute("position",new Zn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new fn(x,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=i0;let u=this.type;this.render=function(A,C,U){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const M=t.getRenderTarget(),T=t.getActiveCubeFace(),W=t.getActiveMipmapLevel(),q=t.state;q.setBlending(Bi),q.buffers.color.setClear(1,1,1,1),q.buffers.depth.setTest(!0),q.setScissorTest(!1);const ie=u!==ri&&this.type===ri,P=u===ri&&this.type!==ri;for(let O=0,X=A.length;O<X;O++){const Y=A[O],D=Y.shadow;if(D===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(D.autoUpdate===!1&&D.needsUpdate===!1)continue;r.copy(D.mapSize);const F=D.getFrameExtents();if(r.multiply(F),s.copy(D.mapSize),(r.x>f||r.y>f)&&(r.x>f&&(s.x=Math.floor(f/F.x),r.x=s.x*F.x,D.mapSize.x=s.x),r.y>f&&(s.y=Math.floor(f/F.y),r.y=s.y*F.y,D.mapSize.y=s.y)),D.map===null||ie===!0||P===!0){const $=this.type!==ri?{minFilter:$t,magFilter:$t}:{};D.map!==null&&D.map.dispose(),D.map=new yr(r.x,r.y,$),D.map.texture.name=Y.name+".shadowMap",D.camera.updateProjectionMatrix()}t.setRenderTarget(D.map),t.clear();const k=D.getViewportCount();for(let $=0;$<k;$++){const K=D.getViewport($);o.set(s.x*K.x,s.y*K.y,s.x*K.z,s.y*K.w),q.viewport(o),D.updateMatrices(Y,$),i=D.getFrustum(),y(C,U,D.camera,Y,this.type)}D.isPointLightShadow!==!0&&this.type===ri&&v(D,U),D.needsUpdate=!1}u=this.type,m.needsUpdate=!1,t.setRenderTarget(M,T,W)};function v(A,C){const U=e.update(_);d.defines.VSM_SAMPLES!==A.blurSamples&&(d.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new yr(r.x,r.y)),d.uniforms.shadow_pass.value=A.map.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,t.setRenderTarget(A.mapPass),t.clear(),t.renderBufferDirect(C,null,U,d,_,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,t.setRenderTarget(A.map),t.clear(),t.renderBufferDirect(C,null,U,p,_,null)}function g(A,C,U,M){let T=null;const W=U.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(W!==void 0)T=W;else if(T=U.isPointLight===!0?l:a,t.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0){const q=T.uuid,ie=C.uuid;let P=c[q];P===void 0&&(P={},c[q]=P);let O=P[ie];O===void 0&&(O=T.clone(),P[ie]=O,C.addEventListener("dispose",R)),T=O}if(T.visible=C.visible,T.wireframe=C.wireframe,M===ri?T.side=C.shadowSide!==null?C.shadowSide:C.side:T.side=C.shadowSide!==null?C.shadowSide:h[C.side],T.alphaMap=C.alphaMap,T.alphaTest=C.alphaTest,T.map=C.map,T.clipShadows=C.clipShadows,T.clippingPlanes=C.clippingPlanes,T.clipIntersection=C.clipIntersection,T.displacementMap=C.displacementMap,T.displacementScale=C.displacementScale,T.displacementBias=C.displacementBias,T.wireframeLinewidth=C.wireframeLinewidth,T.linewidth=C.linewidth,U.isPointLight===!0&&T.isMeshDistanceMaterial===!0){const q=t.properties.get(T);q.light=U}return T}function y(A,C,U,M,T){if(A.visible===!1)return;if(A.layers.test(C.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&T===ri)&&(!A.frustumCulled||i.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,A.matrixWorld);const ie=e.update(A),P=A.material;if(Array.isArray(P)){const O=ie.groups;for(let X=0,Y=O.length;X<Y;X++){const D=O[X],F=P[D.materialIndex];if(F&&F.visible){const k=g(A,F,M,T);A.onBeforeShadow(t,A,C,U,ie,k,D),t.renderBufferDirect(U,null,ie,k,A,D),A.onAfterShadow(t,A,C,U,ie,k,D)}}}else if(P.visible){const O=g(A,P,M,T);A.onBeforeShadow(t,A,C,U,ie,O,null),t.renderBufferDirect(U,null,ie,O,A,null),A.onAfterShadow(t,A,C,U,ie,O,null)}}const q=A.children;for(let ie=0,P=q.length;ie<P;ie++)y(q[ie],C,U,M,T)}function R(A){A.target.removeEventListener("dispose",R);for(const U in c){const M=c[U],T=A.target.uuid;T in M&&(M[T].dispose(),delete M[T])}}}function kT(t,e,n){const i=n.isWebGL2;function r(){let b=!1;const oe=new bt;let ae=null;const Ae=new bt(0,0,0,0);return{setMask:function(Se){ae!==Se&&!b&&(t.colorMask(Se,Se,Se,Se),ae=Se)},setLocked:function(Se){b=Se},setClear:function(Se,Je,Qe,wt,Xt){Xt===!0&&(Se*=wt,Je*=wt,Qe*=wt),oe.set(Se,Je,Qe,wt),Ae.equals(oe)===!1&&(t.clearColor(Se,Je,Qe,wt),Ae.copy(oe))},reset:function(){b=!1,ae=null,Ae.set(-1,0,0,0)}}}function s(){let b=!1,oe=null,ae=null,Ae=null;return{setTest:function(Se){Se?Ue(t.DEPTH_TEST):we(t.DEPTH_TEST)},setMask:function(Se){oe!==Se&&!b&&(t.depthMask(Se),oe=Se)},setFunc:function(Se){if(ae!==Se){switch(Se){case oy:t.depthFunc(t.NEVER);break;case ay:t.depthFunc(t.ALWAYS);break;case ly:t.depthFunc(t.LESS);break;case sl:t.depthFunc(t.LEQUAL);break;case cy:t.depthFunc(t.EQUAL);break;case uy:t.depthFunc(t.GEQUAL);break;case fy:t.depthFunc(t.GREATER);break;case dy:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}ae=Se}},setLocked:function(Se){b=Se},setClear:function(Se){Ae!==Se&&(t.clearDepth(Se),Ae=Se)},reset:function(){b=!1,oe=null,ae=null,Ae=null}}}function o(){let b=!1,oe=null,ae=null,Ae=null,Se=null,Je=null,Qe=null,wt=null,Xt=null;return{setTest:function(et){b||(et?Ue(t.STENCIL_TEST):we(t.STENCIL_TEST))},setMask:function(et){oe!==et&&!b&&(t.stencilMask(et),oe=et)},setFunc:function(et,jt,Wn){(ae!==et||Ae!==jt||Se!==Wn)&&(t.stencilFunc(et,jt,Wn),ae=et,Ae=jt,Se=Wn)},setOp:function(et,jt,Wn){(Je!==et||Qe!==jt||wt!==Wn)&&(t.stencilOp(et,jt,Wn),Je=et,Qe=jt,wt=Wn)},setLocked:function(et){b=et},setClear:function(et){Xt!==et&&(t.clearStencil(et),Xt=et)},reset:function(){b=!1,oe=null,ae=null,Ae=null,Se=null,Je=null,Qe=null,wt=null,Xt=null}}}const a=new r,l=new s,c=new o,f=new WeakMap,h=new WeakMap;let d={},p={},x=new WeakMap,_=[],m=null,u=!1,v=null,g=null,y=null,R=null,A=null,C=null,U=null,M=new Xe(0,0,0),T=0,W=!1,q=null,ie=null,P=null,O=null,X=null;const Y=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let D=!1,F=0;const k=t.getParameter(t.VERSION);k.indexOf("WebGL")!==-1?(F=parseFloat(/^WebGL (\d)/.exec(k)[1]),D=F>=1):k.indexOf("OpenGL ES")!==-1&&(F=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),D=F>=2);let $=null,K={};const j=t.getParameter(t.SCISSOR_BOX),Z=t.getParameter(t.VIEWPORT),le=new bt().fromArray(j),de=new bt().fromArray(Z);function me(b,oe,ae,Ae){const Se=new Uint8Array(4),Je=t.createTexture();t.bindTexture(b,Je),t.texParameteri(b,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(b,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let Qe=0;Qe<ae;Qe++)i&&(b===t.TEXTURE_3D||b===t.TEXTURE_2D_ARRAY)?t.texImage3D(oe,0,t.RGBA,1,1,Ae,0,t.RGBA,t.UNSIGNED_BYTE,Se):t.texImage2D(oe+Qe,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,Se);return Je}const Ne={};Ne[t.TEXTURE_2D]=me(t.TEXTURE_2D,t.TEXTURE_2D,1),Ne[t.TEXTURE_CUBE_MAP]=me(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(Ne[t.TEXTURE_2D_ARRAY]=me(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),Ne[t.TEXTURE_3D]=me(t.TEXTURE_3D,t.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),Ue(t.DEPTH_TEST),l.setFunc(sl),Oe(!1),w(ph),Ue(t.CULL_FACE),ge(Bi);function Ue(b){d[b]!==!0&&(t.enable(b),d[b]=!0)}function we(b){d[b]!==!1&&(t.disable(b),d[b]=!1)}function je(b,oe){return p[b]!==oe?(t.bindFramebuffer(b,oe),p[b]=oe,i&&(b===t.DRAW_FRAMEBUFFER&&(p[t.FRAMEBUFFER]=oe),b===t.FRAMEBUFFER&&(p[t.DRAW_FRAMEBUFFER]=oe)),!0):!1}function z(b,oe){let ae=_,Ae=!1;if(b)if(ae=x.get(oe),ae===void 0&&(ae=[],x.set(oe,ae)),b.isWebGLMultipleRenderTargets){const Se=b.texture;if(ae.length!==Se.length||ae[0]!==t.COLOR_ATTACHMENT0){for(let Je=0,Qe=Se.length;Je<Qe;Je++)ae[Je]=t.COLOR_ATTACHMENT0+Je;ae.length=Se.length,Ae=!0}}else ae[0]!==t.COLOR_ATTACHMENT0&&(ae[0]=t.COLOR_ATTACHMENT0,Ae=!0);else ae[0]!==t.BACK&&(ae[0]=t.BACK,Ae=!0);Ae&&(n.isWebGL2?t.drawBuffers(ae):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(ae))}function Wt(b){return m!==b?(t.useProgram(b),m=b,!0):!1}const ye={[sr]:t.FUNC_ADD,[Xx]:t.FUNC_SUBTRACT,[jx]:t.FUNC_REVERSE_SUBTRACT};if(i)ye[_h]=t.MIN,ye[xh]=t.MAX;else{const b=e.get("EXT_blend_minmax");b!==null&&(ye[_h]=b.MIN_EXT,ye[xh]=b.MAX_EXT)}const Pe={[qx]:t.ZERO,[Yx]:t.ONE,[$x]:t.SRC_COLOR,[zu]:t.SRC_ALPHA,[ty]:t.SRC_ALPHA_SATURATE,[Qx]:t.DST_COLOR,[Zx]:t.DST_ALPHA,[Kx]:t.ONE_MINUS_SRC_COLOR,[Bu]:t.ONE_MINUS_SRC_ALPHA,[ey]:t.ONE_MINUS_DST_COLOR,[Jx]:t.ONE_MINUS_DST_ALPHA,[ny]:t.CONSTANT_COLOR,[iy]:t.ONE_MINUS_CONSTANT_COLOR,[ry]:t.CONSTANT_ALPHA,[sy]:t.ONE_MINUS_CONSTANT_ALPHA};function ge(b,oe,ae,Ae,Se,Je,Qe,wt,Xt,et){if(b===Bi){u===!0&&(we(t.BLEND),u=!1);return}if(u===!1&&(Ue(t.BLEND),u=!0),b!==Wx){if(b!==v||et!==W){if((g!==sr||A!==sr)&&(t.blendEquation(t.FUNC_ADD),g=sr,A=sr),et)switch(b){case as:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case mh:t.blendFunc(t.ONE,t.ONE);break;case gh:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case vh:t.blendFuncSeparate(t.ZERO,t.SRC_COLOR,t.ZERO,t.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",b);break}else switch(b){case as:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case mh:t.blendFunc(t.SRC_ALPHA,t.ONE);break;case gh:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case vh:t.blendFunc(t.ZERO,t.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",b);break}y=null,R=null,C=null,U=null,M.set(0,0,0),T=0,v=b,W=et}return}Se=Se||oe,Je=Je||ae,Qe=Qe||Ae,(oe!==g||Se!==A)&&(t.blendEquationSeparate(ye[oe],ye[Se]),g=oe,A=Se),(ae!==y||Ae!==R||Je!==C||Qe!==U)&&(t.blendFuncSeparate(Pe[ae],Pe[Ae],Pe[Je],Pe[Qe]),y=ae,R=Ae,C=Je,U=Qe),(wt.equals(M)===!1||Xt!==T)&&(t.blendColor(wt.r,wt.g,wt.b,Xt),M.copy(wt),T=Xt),v=b,W=!1}function ot(b,oe){b.side===kn?we(t.CULL_FACE):Ue(t.CULL_FACE);let ae=b.side===on;oe&&(ae=!ae),Oe(ae),b.blending===as&&b.transparent===!1?ge(Bi):ge(b.blending,b.blendEquation,b.blendSrc,b.blendDst,b.blendEquationAlpha,b.blendSrcAlpha,b.blendDstAlpha,b.blendColor,b.blendAlpha,b.premultipliedAlpha),l.setFunc(b.depthFunc),l.setTest(b.depthTest),l.setMask(b.depthWrite),a.setMask(b.colorWrite);const Ae=b.stencilWrite;c.setTest(Ae),Ae&&(c.setMask(b.stencilWriteMask),c.setFunc(b.stencilFunc,b.stencilRef,b.stencilFuncMask),c.setOp(b.stencilFail,b.stencilZFail,b.stencilZPass)),H(b.polygonOffset,b.polygonOffsetFactor,b.polygonOffsetUnits),b.alphaToCoverage===!0?Ue(t.SAMPLE_ALPHA_TO_COVERAGE):we(t.SAMPLE_ALPHA_TO_COVERAGE)}function Oe(b){q!==b&&(b?t.frontFace(t.CW):t.frontFace(t.CCW),q=b)}function w(b){b!==Hx?(Ue(t.CULL_FACE),b!==ie&&(b===ph?t.cullFace(t.BACK):b===Gx?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):we(t.CULL_FACE),ie=b}function S(b){b!==P&&(D&&t.lineWidth(b),P=b)}function H(b,oe,ae){b?(Ue(t.POLYGON_OFFSET_FILL),(O!==oe||X!==ae)&&(t.polygonOffset(oe,ae),O=oe,X=ae)):we(t.POLYGON_OFFSET_FILL)}function te(b){b?Ue(t.SCISSOR_TEST):we(t.SCISSOR_TEST)}function Q(b){b===void 0&&(b=t.TEXTURE0+Y-1),$!==b&&(t.activeTexture(b),$=b)}function ne(b,oe,ae){ae===void 0&&($===null?ae=t.TEXTURE0+Y-1:ae=$);let Ae=K[ae];Ae===void 0&&(Ae={type:void 0,texture:void 0},K[ae]=Ae),(Ae.type!==b||Ae.texture!==oe)&&($!==ae&&(t.activeTexture(ae),$=ae),t.bindTexture(b,oe||Ne[b]),Ae.type=b,Ae.texture=oe)}function ve(){const b=K[$];b!==void 0&&b.type!==void 0&&(t.bindTexture(b.type,null),b.type=void 0,b.texture=void 0)}function ce(){try{t.compressedTexImage2D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function he(){try{t.compressedTexImage3D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Te(){try{t.texSubImage2D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ke(){try{t.texSubImage3D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function J(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Ke(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Ve(){try{t.texStorage2D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function be(){try{t.texStorage3D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function xe(){try{t.texImage2D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function pe(){try{t.texImage3D.apply(t,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Ie(b){le.equals(b)===!1&&(t.scissor(b.x,b.y,b.z,b.w),le.copy(b))}function Ye(b){de.equals(b)===!1&&(t.viewport(b.x,b.y,b.z,b.w),de.copy(b))}function ft(b,oe){let ae=h.get(oe);ae===void 0&&(ae=new WeakMap,h.set(oe,ae));let Ae=ae.get(b);Ae===void 0&&(Ae=t.getUniformBlockIndex(oe,b.name),ae.set(b,Ae))}function Be(b,oe){const Ae=h.get(oe).get(b);f.get(oe)!==Ae&&(t.uniformBlockBinding(oe,Ae,b.__bindingPointIndex),f.set(oe,Ae))}function re(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),i===!0&&(t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null)),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),d={},$=null,K={},p={},x=new WeakMap,_=[],m=null,u=!1,v=null,g=null,y=null,R=null,A=null,C=null,U=null,M=new Xe(0,0,0),T=0,W=!1,q=null,ie=null,P=null,O=null,X=null,le.set(0,0,t.canvas.width,t.canvas.height),de.set(0,0,t.canvas.width,t.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:Ue,disable:we,bindFramebuffer:je,drawBuffers:z,useProgram:Wt,setBlending:ge,setMaterial:ot,setFlipSided:Oe,setCullFace:w,setLineWidth:S,setPolygonOffset:H,setScissorTest:te,activeTexture:Q,bindTexture:ne,unbindTexture:ve,compressedTexImage2D:ce,compressedTexImage3D:he,texImage2D:xe,texImage3D:pe,updateUBOMapping:ft,uniformBlockBinding:Be,texStorage2D:Ve,texStorage3D:be,texSubImage2D:Te,texSubImage3D:ke,compressedTexSubImage2D:J,compressedTexSubImage3D:Ke,scissor:Ie,viewport:Ye,reset:re}}function zT(t,e,n,i,r,s,o){const a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),f=new WeakMap;let h;const d=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(w,S){return p?new OffscreenCanvas(w,S):ul("canvas")}function _(w,S,H,te){let Q=1;if((w.width>te||w.height>te)&&(Q=te/Math.max(w.width,w.height)),Q<1||S===!0)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap){const ne=S?qu:Math.floor,ve=ne(Q*w.width),ce=ne(Q*w.height);h===void 0&&(h=x(ve,ce));const he=H?x(ve,ce):h;return he.width=ve,he.height=ce,he.getContext("2d").drawImage(w,0,0,ve,ce),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+w.width+"x"+w.height+") to ("+ve+"x"+ce+")."),he}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+w.width+"x"+w.height+")."),w;return w}function m(w){return $h(w.width)&&$h(w.height)}function u(w){return a?!1:w.wrapS!==zn||w.wrapT!==zn||w.minFilter!==$t&&w.minFilter!==Mn}function v(w,S){return w.generateMipmaps&&S&&w.minFilter!==$t&&w.minFilter!==Mn}function g(w){t.generateMipmap(w)}function y(w,S,H,te,Q=!1){if(a===!1)return S;if(w!==null){if(t[w]!==void 0)return t[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let ne=S;if(S===t.RED&&(H===t.FLOAT&&(ne=t.R32F),H===t.HALF_FLOAT&&(ne=t.R16F),H===t.UNSIGNED_BYTE&&(ne=t.R8)),S===t.RED_INTEGER&&(H===t.UNSIGNED_BYTE&&(ne=t.R8UI),H===t.UNSIGNED_SHORT&&(ne=t.R16UI),H===t.UNSIGNED_INT&&(ne=t.R32UI),H===t.BYTE&&(ne=t.R8I),H===t.SHORT&&(ne=t.R16I),H===t.INT&&(ne=t.R32I)),S===t.RG&&(H===t.FLOAT&&(ne=t.RG32F),H===t.HALF_FLOAT&&(ne=t.RG16F),H===t.UNSIGNED_BYTE&&(ne=t.RG8)),S===t.RGBA){const ve=Q?ol:Ze.getTransfer(te);H===t.FLOAT&&(ne=t.RGBA32F),H===t.HALF_FLOAT&&(ne=t.RGBA16F),H===t.UNSIGNED_BYTE&&(ne=ve===it?t.SRGB8_ALPHA8:t.RGBA8),H===t.UNSIGNED_SHORT_4_4_4_4&&(ne=t.RGBA4),H===t.UNSIGNED_SHORT_5_5_5_1&&(ne=t.RGB5_A1)}return(ne===t.R16F||ne===t.R32F||ne===t.RG16F||ne===t.RG32F||ne===t.RGBA16F||ne===t.RGBA32F)&&e.get("EXT_color_buffer_float"),ne}function R(w,S,H){return v(w,H)===!0||w.isFramebufferTexture&&w.minFilter!==$t&&w.minFilter!==Mn?Math.log2(Math.max(S.width,S.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?S.mipmaps.length:1}function A(w){return w===$t||w===yh||w===cc?t.NEAREST:t.LINEAR}function C(w){const S=w.target;S.removeEventListener("dispose",C),M(S),S.isVideoTexture&&f.delete(S)}function U(w){const S=w.target;S.removeEventListener("dispose",U),W(S)}function M(w){const S=i.get(w);if(S.__webglInit===void 0)return;const H=w.source,te=d.get(H);if(te){const Q=te[S.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&T(w),Object.keys(te).length===0&&d.delete(H)}i.remove(w)}function T(w){const S=i.get(w);t.deleteTexture(S.__webglTexture);const H=w.source,te=d.get(H);delete te[S.__cacheKey],o.memory.textures--}function W(w){const S=w.texture,H=i.get(w),te=i.get(S);if(te.__webglTexture!==void 0&&(t.deleteTexture(te.__webglTexture),o.memory.textures--),w.depthTexture&&w.depthTexture.dispose(),w.isWebGLCubeRenderTarget)for(let Q=0;Q<6;Q++){if(Array.isArray(H.__webglFramebuffer[Q]))for(let ne=0;ne<H.__webglFramebuffer[Q].length;ne++)t.deleteFramebuffer(H.__webglFramebuffer[Q][ne]);else t.deleteFramebuffer(H.__webglFramebuffer[Q]);H.__webglDepthbuffer&&t.deleteRenderbuffer(H.__webglDepthbuffer[Q])}else{if(Array.isArray(H.__webglFramebuffer))for(let Q=0;Q<H.__webglFramebuffer.length;Q++)t.deleteFramebuffer(H.__webglFramebuffer[Q]);else t.deleteFramebuffer(H.__webglFramebuffer);if(H.__webglDepthbuffer&&t.deleteRenderbuffer(H.__webglDepthbuffer),H.__webglMultisampledFramebuffer&&t.deleteFramebuffer(H.__webglMultisampledFramebuffer),H.__webglColorRenderbuffer)for(let Q=0;Q<H.__webglColorRenderbuffer.length;Q++)H.__webglColorRenderbuffer[Q]&&t.deleteRenderbuffer(H.__webglColorRenderbuffer[Q]);H.__webglDepthRenderbuffer&&t.deleteRenderbuffer(H.__webglDepthRenderbuffer)}if(w.isWebGLMultipleRenderTargets)for(let Q=0,ne=S.length;Q<ne;Q++){const ve=i.get(S[Q]);ve.__webglTexture&&(t.deleteTexture(ve.__webglTexture),o.memory.textures--),i.remove(S[Q])}i.remove(S),i.remove(w)}let q=0;function ie(){q=0}function P(){const w=q;return w>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+r.maxTextures),q+=1,w}function O(w){const S=[];return S.push(w.wrapS),S.push(w.wrapT),S.push(w.wrapR||0),S.push(w.magFilter),S.push(w.minFilter),S.push(w.anisotropy),S.push(w.internalFormat),S.push(w.format),S.push(w.type),S.push(w.generateMipmaps),S.push(w.premultiplyAlpha),S.push(w.flipY),S.push(w.unpackAlignment),S.push(w.colorSpace),S.join()}function X(w,S){const H=i.get(w);if(w.isVideoTexture&&ot(w),w.isRenderTargetTexture===!1&&w.version>0&&H.__version!==w.version){const te=w.image;if(te===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(te.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{le(H,w,S);return}}n.bindTexture(t.TEXTURE_2D,H.__webglTexture,t.TEXTURE0+S)}function Y(w,S){const H=i.get(w);if(w.version>0&&H.__version!==w.version){le(H,w,S);return}n.bindTexture(t.TEXTURE_2D_ARRAY,H.__webglTexture,t.TEXTURE0+S)}function D(w,S){const H=i.get(w);if(w.version>0&&H.__version!==w.version){le(H,w,S);return}n.bindTexture(t.TEXTURE_3D,H.__webglTexture,t.TEXTURE0+S)}function F(w,S){const H=i.get(w);if(w.version>0&&H.__version!==w.version){de(H,w,S);return}n.bindTexture(t.TEXTURE_CUBE_MAP,H.__webglTexture,t.TEXTURE0+S)}const k={[Vu]:t.REPEAT,[zn]:t.CLAMP_TO_EDGE,[Wu]:t.MIRRORED_REPEAT},$={[$t]:t.NEAREST,[yh]:t.NEAREST_MIPMAP_NEAREST,[cc]:t.NEAREST_MIPMAP_LINEAR,[Mn]:t.LINEAR,[Sy]:t.LINEAR_MIPMAP_NEAREST,[So]:t.LINEAR_MIPMAP_LINEAR},K={[Dy]:t.NEVER,[zy]:t.ALWAYS,[Uy]:t.LESS,[m0]:t.LEQUAL,[Iy]:t.EQUAL,[ky]:t.GEQUAL,[Fy]:t.GREATER,[Oy]:t.NOTEQUAL};function j(w,S,H){if(H?(t.texParameteri(w,t.TEXTURE_WRAP_S,k[S.wrapS]),t.texParameteri(w,t.TEXTURE_WRAP_T,k[S.wrapT]),(w===t.TEXTURE_3D||w===t.TEXTURE_2D_ARRAY)&&t.texParameteri(w,t.TEXTURE_WRAP_R,k[S.wrapR]),t.texParameteri(w,t.TEXTURE_MAG_FILTER,$[S.magFilter]),t.texParameteri(w,t.TEXTURE_MIN_FILTER,$[S.minFilter])):(t.texParameteri(w,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(w,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),(w===t.TEXTURE_3D||w===t.TEXTURE_2D_ARRAY)&&t.texParameteri(w,t.TEXTURE_WRAP_R,t.CLAMP_TO_EDGE),(S.wrapS!==zn||S.wrapT!==zn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),t.texParameteri(w,t.TEXTURE_MAG_FILTER,A(S.magFilter)),t.texParameteri(w,t.TEXTURE_MIN_FILTER,A(S.minFilter)),S.minFilter!==$t&&S.minFilter!==Mn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),S.compareFunction&&(t.texParameteri(w,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(w,t.TEXTURE_COMPARE_FUNC,K[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const te=e.get("EXT_texture_filter_anisotropic");if(S.magFilter===$t||S.minFilter!==cc&&S.minFilter!==So||S.type===Li&&e.has("OES_texture_float_linear")===!1||a===!1&&S.type===Mo&&e.has("OES_texture_half_float_linear")===!1)return;(S.anisotropy>1||i.get(S).__currentAnisotropy)&&(t.texParameterf(w,te.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,r.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy)}}function Z(w,S){let H=!1;w.__webglInit===void 0&&(w.__webglInit=!0,S.addEventListener("dispose",C));const te=S.source;let Q=d.get(te);Q===void 0&&(Q={},d.set(te,Q));const ne=O(S);if(ne!==w.__cacheKey){Q[ne]===void 0&&(Q[ne]={texture:t.createTexture(),usedTimes:0},o.memory.textures++,H=!0),Q[ne].usedTimes++;const ve=Q[w.__cacheKey];ve!==void 0&&(Q[w.__cacheKey].usedTimes--,ve.usedTimes===0&&T(S)),w.__cacheKey=ne,w.__webglTexture=Q[ne].texture}return H}function le(w,S,H){let te=t.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(te=t.TEXTURE_2D_ARRAY),S.isData3DTexture&&(te=t.TEXTURE_3D);const Q=Z(w,S),ne=S.source;n.bindTexture(te,w.__webglTexture,t.TEXTURE0+H);const ve=i.get(ne);if(ne.version!==ve.__version||Q===!0){n.activeTexture(t.TEXTURE0+H);const ce=Ze.getPrimaries(Ze.workingColorSpace),he=S.colorSpace===Tn?null:Ze.getPrimaries(S.colorSpace),Te=S.colorSpace===Tn||ce===he?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);const ke=u(S)&&m(S.image)===!1;let J=_(S.image,ke,!1,r.maxTextureSize);J=Oe(S,J);const Ke=m(J)||a,Ve=s.convert(S.format,S.colorSpace);let be=s.convert(S.type),xe=y(S.internalFormat,Ve,be,S.colorSpace,S.isVideoTexture);j(te,S,Ke);let pe;const Ie=S.mipmaps,Ye=a&&S.isVideoTexture!==!0&&xe!==d0,ft=ve.__version===void 0||Q===!0,Be=R(S,J,Ke);if(S.isDepthTexture)xe=t.DEPTH_COMPONENT,a?S.type===Li?xe=t.DEPTH_COMPONENT32F:S.type===Pi?xe=t.DEPTH_COMPONENT24:S.type===dr?xe=t.DEPTH24_STENCIL8:xe=t.DEPTH_COMPONENT16:S.type===Li&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),S.format===hr&&xe===t.DEPTH_COMPONENT&&S.type!==Xf&&S.type!==Pi&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),S.type=Pi,be=s.convert(S.type)),S.format===_s&&xe===t.DEPTH_COMPONENT&&(xe=t.DEPTH_STENCIL,S.type!==dr&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),S.type=dr,be=s.convert(S.type))),ft&&(Ye?n.texStorage2D(t.TEXTURE_2D,1,xe,J.width,J.height):n.texImage2D(t.TEXTURE_2D,0,xe,J.width,J.height,0,Ve,be,null));else if(S.isDataTexture)if(Ie.length>0&&Ke){Ye&&ft&&n.texStorage2D(t.TEXTURE_2D,Be,xe,Ie[0].width,Ie[0].height);for(let re=0,b=Ie.length;re<b;re++)pe=Ie[re],Ye?n.texSubImage2D(t.TEXTURE_2D,re,0,0,pe.width,pe.height,Ve,be,pe.data):n.texImage2D(t.TEXTURE_2D,re,xe,pe.width,pe.height,0,Ve,be,pe.data);S.generateMipmaps=!1}else Ye?(ft&&n.texStorage2D(t.TEXTURE_2D,Be,xe,J.width,J.height),n.texSubImage2D(t.TEXTURE_2D,0,0,0,J.width,J.height,Ve,be,J.data)):n.texImage2D(t.TEXTURE_2D,0,xe,J.width,J.height,0,Ve,be,J.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Ye&&ft&&n.texStorage3D(t.TEXTURE_2D_ARRAY,Be,xe,Ie[0].width,Ie[0].height,J.depth);for(let re=0,b=Ie.length;re<b;re++)pe=Ie[re],S.format!==Bn?Ve!==null?Ye?n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,re,0,0,0,pe.width,pe.height,J.depth,Ve,pe.data,0,0):n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,re,xe,pe.width,pe.height,J.depth,0,pe.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ye?n.texSubImage3D(t.TEXTURE_2D_ARRAY,re,0,0,0,pe.width,pe.height,J.depth,Ve,be,pe.data):n.texImage3D(t.TEXTURE_2D_ARRAY,re,xe,pe.width,pe.height,J.depth,0,Ve,be,pe.data)}else{Ye&&ft&&n.texStorage2D(t.TEXTURE_2D,Be,xe,Ie[0].width,Ie[0].height);for(let re=0,b=Ie.length;re<b;re++)pe=Ie[re],S.format!==Bn?Ve!==null?Ye?n.compressedTexSubImage2D(t.TEXTURE_2D,re,0,0,pe.width,pe.height,Ve,pe.data):n.compressedTexImage2D(t.TEXTURE_2D,re,xe,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ye?n.texSubImage2D(t.TEXTURE_2D,re,0,0,pe.width,pe.height,Ve,be,pe.data):n.texImage2D(t.TEXTURE_2D,re,xe,pe.width,pe.height,0,Ve,be,pe.data)}else if(S.isDataArrayTexture)Ye?(ft&&n.texStorage3D(t.TEXTURE_2D_ARRAY,Be,xe,J.width,J.height,J.depth),n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,Ve,be,J.data)):n.texImage3D(t.TEXTURE_2D_ARRAY,0,xe,J.width,J.height,J.depth,0,Ve,be,J.data);else if(S.isData3DTexture)Ye?(ft&&n.texStorage3D(t.TEXTURE_3D,Be,xe,J.width,J.height,J.depth),n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,Ve,be,J.data)):n.texImage3D(t.TEXTURE_3D,0,xe,J.width,J.height,J.depth,0,Ve,be,J.data);else if(S.isFramebufferTexture){if(ft)if(Ye)n.texStorage2D(t.TEXTURE_2D,Be,xe,J.width,J.height);else{let re=J.width,b=J.height;for(let oe=0;oe<Be;oe++)n.texImage2D(t.TEXTURE_2D,oe,xe,re,b,0,Ve,be,null),re>>=1,b>>=1}}else if(Ie.length>0&&Ke){Ye&&ft&&n.texStorage2D(t.TEXTURE_2D,Be,xe,Ie[0].width,Ie[0].height);for(let re=0,b=Ie.length;re<b;re++)pe=Ie[re],Ye?n.texSubImage2D(t.TEXTURE_2D,re,0,0,Ve,be,pe):n.texImage2D(t.TEXTURE_2D,re,xe,Ve,be,pe);S.generateMipmaps=!1}else Ye?(ft&&n.texStorage2D(t.TEXTURE_2D,Be,xe,J.width,J.height),n.texSubImage2D(t.TEXTURE_2D,0,0,0,Ve,be,J)):n.texImage2D(t.TEXTURE_2D,0,xe,Ve,be,J);v(S,Ke)&&g(te),ve.__version=ne.version,S.onUpdate&&S.onUpdate(S)}w.__version=S.version}function de(w,S,H){if(S.image.length!==6)return;const te=Z(w,S),Q=S.source;n.bindTexture(t.TEXTURE_CUBE_MAP,w.__webglTexture,t.TEXTURE0+H);const ne=i.get(Q);if(Q.version!==ne.__version||te===!0){n.activeTexture(t.TEXTURE0+H);const ve=Ze.getPrimaries(Ze.workingColorSpace),ce=S.colorSpace===Tn?null:Ze.getPrimaries(S.colorSpace),he=S.colorSpace===Tn||ve===ce?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,he);const Te=S.isCompressedTexture||S.image[0].isCompressedTexture,ke=S.image[0]&&S.image[0].isDataTexture,J=[];for(let re=0;re<6;re++)!Te&&!ke?J[re]=_(S.image[re],!1,!0,r.maxCubemapSize):J[re]=ke?S.image[re].image:S.image[re],J[re]=Oe(S,J[re]);const Ke=J[0],Ve=m(Ke)||a,be=s.convert(S.format,S.colorSpace),xe=s.convert(S.type),pe=y(S.internalFormat,be,xe,S.colorSpace),Ie=a&&S.isVideoTexture!==!0,Ye=ne.__version===void 0||te===!0;let ft=R(S,Ke,Ve);j(t.TEXTURE_CUBE_MAP,S,Ve);let Be;if(Te){Ie&&Ye&&n.texStorage2D(t.TEXTURE_CUBE_MAP,ft,pe,Ke.width,Ke.height);for(let re=0;re<6;re++){Be=J[re].mipmaps;for(let b=0;b<Be.length;b++){const oe=Be[b];S.format!==Bn?be!==null?Ie?n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,b,0,0,oe.width,oe.height,be,oe.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,b,pe,oe.width,oe.height,0,oe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ie?n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,b,0,0,oe.width,oe.height,be,xe,oe.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,b,pe,oe.width,oe.height,0,be,xe,oe.data)}}}else{Be=S.mipmaps,Ie&&Ye&&(Be.length>0&&ft++,n.texStorage2D(t.TEXTURE_CUBE_MAP,ft,pe,J[0].width,J[0].height));for(let re=0;re<6;re++)if(ke){Ie?n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,J[re].width,J[re].height,be,xe,J[re].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,pe,J[re].width,J[re].height,0,be,xe,J[re].data);for(let b=0;b<Be.length;b++){const ae=Be[b].image[re].image;Ie?n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,b+1,0,0,ae.width,ae.height,be,xe,ae.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,b+1,pe,ae.width,ae.height,0,be,xe,ae.data)}}else{Ie?n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,be,xe,J[re]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,pe,be,xe,J[re]);for(let b=0;b<Be.length;b++){const oe=Be[b];Ie?n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,b+1,0,0,be,xe,oe.image[re]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+re,b+1,pe,be,xe,oe.image[re])}}}v(S,Ve)&&g(t.TEXTURE_CUBE_MAP),ne.__version=Q.version,S.onUpdate&&S.onUpdate(S)}w.__version=S.version}function me(w,S,H,te,Q,ne){const ve=s.convert(H.format,H.colorSpace),ce=s.convert(H.type),he=y(H.internalFormat,ve,ce,H.colorSpace);if(!i.get(S).__hasExternalTextures){const ke=Math.max(1,S.width>>ne),J=Math.max(1,S.height>>ne);Q===t.TEXTURE_3D||Q===t.TEXTURE_2D_ARRAY?n.texImage3D(Q,ne,he,ke,J,S.depth,0,ve,ce,null):n.texImage2D(Q,ne,he,ke,J,0,ve,ce,null)}n.bindFramebuffer(t.FRAMEBUFFER,w),ge(S)?l.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,te,Q,i.get(H).__webglTexture,0,Pe(S)):(Q===t.TEXTURE_2D||Q>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,te,Q,i.get(H).__webglTexture,ne),n.bindFramebuffer(t.FRAMEBUFFER,null)}function Ne(w,S,H){if(t.bindRenderbuffer(t.RENDERBUFFER,w),S.depthBuffer&&!S.stencilBuffer){let te=a===!0?t.DEPTH_COMPONENT24:t.DEPTH_COMPONENT16;if(H||ge(S)){const Q=S.depthTexture;Q&&Q.isDepthTexture&&(Q.type===Li?te=t.DEPTH_COMPONENT32F:Q.type===Pi&&(te=t.DEPTH_COMPONENT24));const ne=Pe(S);ge(S)?l.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,ne,te,S.width,S.height):t.renderbufferStorageMultisample(t.RENDERBUFFER,ne,te,S.width,S.height)}else t.renderbufferStorage(t.RENDERBUFFER,te,S.width,S.height);t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.RENDERBUFFER,w)}else if(S.depthBuffer&&S.stencilBuffer){const te=Pe(S);H&&ge(S)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,te,t.DEPTH24_STENCIL8,S.width,S.height):ge(S)?l.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,te,t.DEPTH24_STENCIL8,S.width,S.height):t.renderbufferStorage(t.RENDERBUFFER,t.DEPTH_STENCIL,S.width,S.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.RENDERBUFFER,w)}else{const te=S.isWebGLMultipleRenderTargets===!0?S.texture:[S.texture];for(let Q=0;Q<te.length;Q++){const ne=te[Q],ve=s.convert(ne.format,ne.colorSpace),ce=s.convert(ne.type),he=y(ne.internalFormat,ve,ce,ne.colorSpace),Te=Pe(S);H&&ge(S)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,Te,he,S.width,S.height):ge(S)?l.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Te,he,S.width,S.height):t.renderbufferStorage(t.RENDERBUFFER,he,S.width,S.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function Ue(w,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,w),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(S.depthTexture).__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),X(S.depthTexture,0);const te=i.get(S.depthTexture).__webglTexture,Q=Pe(S);if(S.depthTexture.format===hr)ge(S)?l.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,te,0,Q):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,te,0);else if(S.depthTexture.format===_s)ge(S)?l.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,te,0,Q):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,te,0);else throw new Error("Unknown depthTexture format")}function we(w){const S=i.get(w),H=w.isWebGLCubeRenderTarget===!0;if(w.depthTexture&&!S.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");Ue(S.__webglFramebuffer,w)}else if(H){S.__webglDepthbuffer=[];for(let te=0;te<6;te++)n.bindFramebuffer(t.FRAMEBUFFER,S.__webglFramebuffer[te]),S.__webglDepthbuffer[te]=t.createRenderbuffer(),Ne(S.__webglDepthbuffer[te],w,!1)}else n.bindFramebuffer(t.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer=t.createRenderbuffer(),Ne(S.__webglDepthbuffer,w,!1);n.bindFramebuffer(t.FRAMEBUFFER,null)}function je(w,S,H){const te=i.get(w);S!==void 0&&me(te.__webglFramebuffer,w,w.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),H!==void 0&&we(w)}function z(w){const S=w.texture,H=i.get(w),te=i.get(S);w.addEventListener("dispose",U),w.isWebGLMultipleRenderTargets!==!0&&(te.__webglTexture===void 0&&(te.__webglTexture=t.createTexture()),te.__version=S.version,o.memory.textures++);const Q=w.isWebGLCubeRenderTarget===!0,ne=w.isWebGLMultipleRenderTargets===!0,ve=m(w)||a;if(Q){H.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(a&&S.mipmaps&&S.mipmaps.length>0){H.__webglFramebuffer[ce]=[];for(let he=0;he<S.mipmaps.length;he++)H.__webglFramebuffer[ce][he]=t.createFramebuffer()}else H.__webglFramebuffer[ce]=t.createFramebuffer()}else{if(a&&S.mipmaps&&S.mipmaps.length>0){H.__webglFramebuffer=[];for(let ce=0;ce<S.mipmaps.length;ce++)H.__webglFramebuffer[ce]=t.createFramebuffer()}else H.__webglFramebuffer=t.createFramebuffer();if(ne)if(r.drawBuffers){const ce=w.texture;for(let he=0,Te=ce.length;he<Te;he++){const ke=i.get(ce[he]);ke.__webglTexture===void 0&&(ke.__webglTexture=t.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&w.samples>0&&ge(w)===!1){const ce=ne?S:[S];H.__webglMultisampledFramebuffer=t.createFramebuffer(),H.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let he=0;he<ce.length;he++){const Te=ce[he];H.__webglColorRenderbuffer[he]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,H.__webglColorRenderbuffer[he]);const ke=s.convert(Te.format,Te.colorSpace),J=s.convert(Te.type),Ke=y(Te.internalFormat,ke,J,Te.colorSpace,w.isXRRenderTarget===!0),Ve=Pe(w);t.renderbufferStorageMultisample(t.RENDERBUFFER,Ve,Ke,w.width,w.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+he,t.RENDERBUFFER,H.__webglColorRenderbuffer[he])}t.bindRenderbuffer(t.RENDERBUFFER,null),w.depthBuffer&&(H.__webglDepthRenderbuffer=t.createRenderbuffer(),Ne(H.__webglDepthRenderbuffer,w,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(Q){n.bindTexture(t.TEXTURE_CUBE_MAP,te.__webglTexture),j(t.TEXTURE_CUBE_MAP,S,ve);for(let ce=0;ce<6;ce++)if(a&&S.mipmaps&&S.mipmaps.length>0)for(let he=0;he<S.mipmaps.length;he++)me(H.__webglFramebuffer[ce][he],w,S,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ce,he);else me(H.__webglFramebuffer[ce],w,S,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);v(S,ve)&&g(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(ne){const ce=w.texture;for(let he=0,Te=ce.length;he<Te;he++){const ke=ce[he],J=i.get(ke);n.bindTexture(t.TEXTURE_2D,J.__webglTexture),j(t.TEXTURE_2D,ke,ve),me(H.__webglFramebuffer,w,ke,t.COLOR_ATTACHMENT0+he,t.TEXTURE_2D,0),v(ke,ve)&&g(t.TEXTURE_2D)}n.unbindTexture()}else{let ce=t.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(a?ce=w.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),n.bindTexture(ce,te.__webglTexture),j(ce,S,ve),a&&S.mipmaps&&S.mipmaps.length>0)for(let he=0;he<S.mipmaps.length;he++)me(H.__webglFramebuffer[he],w,S,t.COLOR_ATTACHMENT0,ce,he);else me(H.__webglFramebuffer,w,S,t.COLOR_ATTACHMENT0,ce,0);v(S,ve)&&g(ce),n.unbindTexture()}w.depthBuffer&&we(w)}function Wt(w){const S=m(w)||a,H=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let te=0,Q=H.length;te<Q;te++){const ne=H[te];if(v(ne,S)){const ve=w.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:t.TEXTURE_2D,ce=i.get(ne).__webglTexture;n.bindTexture(ve,ce),g(ve),n.unbindTexture()}}}function ye(w){if(a&&w.samples>0&&ge(w)===!1){const S=w.isWebGLMultipleRenderTargets?w.texture:[w.texture],H=w.width,te=w.height;let Q=t.COLOR_BUFFER_BIT;const ne=[],ve=w.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ce=i.get(w),he=w.isWebGLMultipleRenderTargets===!0;if(he)for(let Te=0;Te<S.length;Te++)n.bindFramebuffer(t.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Te,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,ce.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+Te,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let Te=0;Te<S.length;Te++){ne.push(t.COLOR_ATTACHMENT0+Te),w.depthBuffer&&ne.push(ve);const ke=ce.__ignoreDepthValues!==void 0?ce.__ignoreDepthValues:!1;if(ke===!1&&(w.depthBuffer&&(Q|=t.DEPTH_BUFFER_BIT),w.stencilBuffer&&(Q|=t.STENCIL_BUFFER_BIT)),he&&t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,ce.__webglColorRenderbuffer[Te]),ke===!0&&(t.invalidateFramebuffer(t.READ_FRAMEBUFFER,[ve]),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[ve])),he){const J=i.get(S[Te]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,J,0)}t.blitFramebuffer(0,0,H,te,0,0,H,te,Q,t.NEAREST),c&&t.invalidateFramebuffer(t.READ_FRAMEBUFFER,ne)}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),he)for(let Te=0;Te<S.length;Te++){n.bindFramebuffer(t.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Te,t.RENDERBUFFER,ce.__webglColorRenderbuffer[Te]);const ke=i.get(S[Te]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,ce.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+Te,t.TEXTURE_2D,ke,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}}function Pe(w){return Math.min(r.maxSamples,w.samples)}function ge(w){const S=i.get(w);return a&&w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function ot(w){const S=o.render.frame;f.get(w)!==S&&(f.set(w,S),w.update())}function Oe(w,S){const H=w.colorSpace,te=w.format,Q=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||w.format===Xu||H!==mi&&H!==Tn&&(Ze.getTransfer(H)===it?a===!1?e.has("EXT_sRGB")===!0&&te===Bn?(w.format=Xu,w.minFilter=Mn,w.generateMipmaps=!1):S=v0.sRGBToLinear(S):(te!==Bn||Q!==Gi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),S}this.allocateTextureUnit=P,this.resetTextureUnits=ie,this.setTexture2D=X,this.setTexture2DArray=Y,this.setTexture3D=D,this.setTextureCube=F,this.rebindTextures=je,this.setupRenderTarget=z,this.updateRenderTargetMipmap=Wt,this.updateMultisampleRenderTarget=ye,this.setupDepthRenderbuffer=we,this.setupFrameBufferTexture=me,this.useMultisampledRTT=ge}function BT(t,e,n){const i=n.isWebGL2;function r(s,o=Tn){let a;const l=Ze.getTransfer(o);if(s===Gi)return t.UNSIGNED_BYTE;if(s===a0)return t.UNSIGNED_SHORT_4_4_4_4;if(s===l0)return t.UNSIGNED_SHORT_5_5_5_1;if(s===My)return t.BYTE;if(s===Ey)return t.SHORT;if(s===Xf)return t.UNSIGNED_SHORT;if(s===o0)return t.INT;if(s===Pi)return t.UNSIGNED_INT;if(s===Li)return t.FLOAT;if(s===Mo)return i?t.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===Ty)return t.ALPHA;if(s===Bn)return t.RGBA;if(s===wy)return t.LUMINANCE;if(s===Ay)return t.LUMINANCE_ALPHA;if(s===hr)return t.DEPTH_COMPONENT;if(s===_s)return t.DEPTH_STENCIL;if(s===Xu)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===Cy)return t.RED;if(s===c0)return t.RED_INTEGER;if(s===Ry)return t.RG;if(s===u0)return t.RG_INTEGER;if(s===f0)return t.RGBA_INTEGER;if(s===uc||s===fc||s===dc||s===hc)if(l===it)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===uc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===fc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===dc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===hc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===uc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===fc)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===dc)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===hc)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===Sh||s===Mh||s===Eh||s===Th)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===Sh)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Mh)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Eh)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Th)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===d0)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===wh||s===Ah)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===wh)return l===it?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===Ah)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Ch||s===Rh||s===bh||s===Ph||s===Lh||s===Nh||s===Dh||s===Uh||s===Ih||s===Fh||s===Oh||s===kh||s===zh||s===Bh)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===Ch)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Rh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===bh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Ph)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Lh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Nh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Dh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Uh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Ih)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Fh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Oh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===kh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===zh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Bh)return l===it?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===pc||s===Hh||s===Gh)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===pc)return l===it?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Hh)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Gh)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===by||s===Vh||s===Wh||s===Xh)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===pc)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Vh)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Wh)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Xh)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===dr?i?t.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):t[s]!==void 0?t[s]:null}return{convert:r}}class HT extends En{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class xa extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}}const GT={type:"move"};class zc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new xa,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new xa,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new xa,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=n.getJointPose(_,i),u=this._getHandJoint(c,_);m!==null&&(u.matrix.fromArray(m.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=m.radius),u.visible=m!==null}const f=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=f.position.distanceTo(h.position),p=.02,x=.005;c.inputState.pinching&&d>p+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(GT)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new xa;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}class VT extends Es{constructor(e,n){super();const i=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,f=null,h=null,d=null,p=null,x=null;const _=n.getContextAttributes();let m=null,u=null;const v=[],g=[],y=new Me;let R=null;const A=new En;A.layers.enable(1),A.viewport=new bt;const C=new En;C.layers.enable(2),C.viewport=new bt;const U=[A,C],M=new HT;M.layers.enable(1),M.layers.enable(2);let T=null,W=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let Z=v[j];return Z===void 0&&(Z=new zc,v[j]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(j){let Z=v[j];return Z===void 0&&(Z=new zc,v[j]=Z),Z.getGripSpace()},this.getHand=function(j){let Z=v[j];return Z===void 0&&(Z=new zc,v[j]=Z),Z.getHandSpace()};function q(j){const Z=g.indexOf(j.inputSource);if(Z===-1)return;const le=v[Z];le!==void 0&&(le.update(j.inputSource,j.frame,c||o),le.dispatchEvent({type:j.type,data:j.inputSource}))}function ie(){r.removeEventListener("select",q),r.removeEventListener("selectstart",q),r.removeEventListener("selectend",q),r.removeEventListener("squeeze",q),r.removeEventListener("squeezestart",q),r.removeEventListener("squeezeend",q),r.removeEventListener("end",ie),r.removeEventListener("inputsourceschange",P);for(let j=0;j<v.length;j++){const Z=g[j];Z!==null&&(g[j]=null,v[j].disconnect(Z))}T=null,W=null,e.setRenderTarget(m),p=null,d=null,h=null,r=null,u=null,K.stop(),i.isPresenting=!1,e.setPixelRatio(R),e.setSize(y.width,y.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){a=j,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return h},this.getFrame=function(){return x},this.getSession=function(){return r},this.setSession=async function(j){if(r=j,r!==null){if(m=e.getRenderTarget(),r.addEventListener("select",q),r.addEventListener("selectstart",q),r.addEventListener("selectend",q),r.addEventListener("squeeze",q),r.addEventListener("squeezestart",q),r.addEventListener("squeezeend",q),r.addEventListener("end",ie),r.addEventListener("inputsourceschange",P),_.xrCompatible!==!0&&await n.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(y),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const Z={antialias:r.renderState.layers===void 0?_.antialias:!0,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,n,Z),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),u=new yr(p.framebufferWidth,p.framebufferHeight,{format:Bn,type:Gi,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil})}else{let Z=null,le=null,de=null;_.depth&&(de=_.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,Z=_.stencil?_s:hr,le=_.stencil?dr:Pi);const me={colorFormat:n.RGBA8,depthFormat:de,scaleFactor:s};h=new XRWebGLBinding(r,n),d=h.createProjectionLayer(me),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),u=new yr(d.textureWidth,d.textureHeight,{format:Bn,type:Gi,depthTexture:new P0(d.textureWidth,d.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,Z),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0});const Ne=e.properties.get(u);Ne.__ignoreDepthValues=d.ignoreDepthValues}u.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),K.setContext(r),K.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function P(j){for(let Z=0;Z<j.removed.length;Z++){const le=j.removed[Z],de=g.indexOf(le);de>=0&&(g[de]=null,v[de].disconnect(le))}for(let Z=0;Z<j.added.length;Z++){const le=j.added[Z];let de=g.indexOf(le);if(de===-1){for(let Ne=0;Ne<v.length;Ne++)if(Ne>=g.length){g.push(le),de=Ne;break}else if(g[Ne]===null){g[Ne]=le,de=Ne;break}if(de===-1)break}const me=v[de];me&&me.connect(le)}}const O=new N,X=new N;function Y(j,Z,le){O.setFromMatrixPosition(Z.matrixWorld),X.setFromMatrixPosition(le.matrixWorld);const de=O.distanceTo(X),me=Z.projectionMatrix.elements,Ne=le.projectionMatrix.elements,Ue=me[14]/(me[10]-1),we=me[14]/(me[10]+1),je=(me[9]+1)/me[5],z=(me[9]-1)/me[5],Wt=(me[8]-1)/me[0],ye=(Ne[8]+1)/Ne[0],Pe=Ue*Wt,ge=Ue*ye,ot=de/(-Wt+ye),Oe=ot*-Wt;Z.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(Oe),j.translateZ(ot),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert();const w=Ue+ot,S=we+ot,H=Pe-Oe,te=ge+(de-Oe),Q=je*we/S*w,ne=z*we/S*w;j.projectionMatrix.makePerspective(H,te,Q,ne,w,S),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}function D(j,Z){Z===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(Z.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(r===null)return;M.near=C.near=A.near=j.near,M.far=C.far=A.far=j.far,(T!==M.near||W!==M.far)&&(r.updateRenderState({depthNear:M.near,depthFar:M.far}),T=M.near,W=M.far);const Z=j.parent,le=M.cameras;D(M,Z);for(let de=0;de<le.length;de++)D(le[de],Z);le.length===2?Y(M,A,C):M.projectionMatrix.copy(A.projectionMatrix),F(j,M,Z)};function F(j,Z,le){le===null?j.matrix.copy(Z.matrixWorld):(j.matrix.copy(le.matrixWorld),j.matrix.invert(),j.matrix.multiply(Z.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(Z.projectionMatrix),j.projectionMatrixInverse.copy(Z.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=ju*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(j){l=j,d!==null&&(d.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)};let k=null;function $(j,Z){if(f=Z.getViewerPose(c||o),x=Z,f!==null){const le=f.views;p!==null&&(e.setRenderTargetFramebuffer(u,p.framebuffer),e.setRenderTarget(u));let de=!1;le.length!==M.cameras.length&&(M.cameras.length=0,de=!0);for(let me=0;me<le.length;me++){const Ne=le[me];let Ue=null;if(p!==null)Ue=p.getViewport(Ne);else{const je=h.getViewSubImage(d,Ne);Ue=je.viewport,me===0&&(e.setRenderTargetTextures(u,je.colorTexture,d.ignoreDepthValues?void 0:je.depthStencilTexture),e.setRenderTarget(u))}let we=U[me];we===void 0&&(we=new En,we.layers.enable(me),we.viewport=new bt,U[me]=we),we.matrix.fromArray(Ne.transform.matrix),we.matrix.decompose(we.position,we.quaternion,we.scale),we.projectionMatrix.fromArray(Ne.projectionMatrix),we.projectionMatrixInverse.copy(we.projectionMatrix).invert(),we.viewport.set(Ue.x,Ue.y,Ue.width,Ue.height),me===0&&(M.matrix.copy(we.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),de===!0&&M.cameras.push(we)}}for(let le=0;le<v.length;le++){const de=g[le],me=v[le];de!==null&&me!==void 0&&me.update(de,Z,c||o)}k&&k(j,Z),Z.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Z}),x=null}const K=new R0;K.setAnimationLoop($),this.setAnimationLoop=function(j){k=j},this.dispose=function(){}}}function WT(t,e){function n(m,u){m.matrixAutoUpdate===!0&&m.updateMatrix(),u.value.copy(m.matrix)}function i(m,u){u.color.getRGB(m.fogColor.value,w0(t)),u.isFog?(m.fogNear.value=u.near,m.fogFar.value=u.far):u.isFogExp2&&(m.fogDensity.value=u.density)}function r(m,u,v,g,y){u.isMeshBasicMaterial||u.isMeshLambertMaterial?s(m,u):u.isMeshToonMaterial?(s(m,u),h(m,u)):u.isMeshPhongMaterial?(s(m,u),f(m,u)):u.isMeshStandardMaterial?(s(m,u),d(m,u),u.isMeshPhysicalMaterial&&p(m,u,y)):u.isMeshMatcapMaterial?(s(m,u),x(m,u)):u.isMeshDepthMaterial?s(m,u):u.isMeshDistanceMaterial?(s(m,u),_(m,u)):u.isMeshNormalMaterial?s(m,u):u.isLineBasicMaterial?(o(m,u),u.isLineDashedMaterial&&a(m,u)):u.isPointsMaterial?l(m,u,v,g):u.isSpriteMaterial?c(m,u):u.isShadowMaterial?(m.color.value.copy(u.color),m.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function s(m,u){m.opacity.value=u.opacity,u.color&&m.diffuse.value.copy(u.color),u.emissive&&m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(m.map.value=u.map,n(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,n(u.alphaMap,m.alphaMapTransform)),u.bumpMap&&(m.bumpMap.value=u.bumpMap,n(u.bumpMap,m.bumpMapTransform),m.bumpScale.value=u.bumpScale,u.side===on&&(m.bumpScale.value*=-1)),u.normalMap&&(m.normalMap.value=u.normalMap,n(u.normalMap,m.normalMapTransform),m.normalScale.value.copy(u.normalScale),u.side===on&&m.normalScale.value.negate()),u.displacementMap&&(m.displacementMap.value=u.displacementMap,n(u.displacementMap,m.displacementMapTransform),m.displacementScale.value=u.displacementScale,m.displacementBias.value=u.displacementBias),u.emissiveMap&&(m.emissiveMap.value=u.emissiveMap,n(u.emissiveMap,m.emissiveMapTransform)),u.specularMap&&(m.specularMap.value=u.specularMap,n(u.specularMap,m.specularMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest);const v=e.get(u).envMap;if(v&&(m.envMap.value=v,m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=u.reflectivity,m.ior.value=u.ior,m.refractionRatio.value=u.refractionRatio),u.lightMap){m.lightMap.value=u.lightMap;const g=t._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=u.lightMapIntensity*g,n(u.lightMap,m.lightMapTransform)}u.aoMap&&(m.aoMap.value=u.aoMap,m.aoMapIntensity.value=u.aoMapIntensity,n(u.aoMap,m.aoMapTransform))}function o(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,u.map&&(m.map.value=u.map,n(u.map,m.mapTransform))}function a(m,u){m.dashSize.value=u.dashSize,m.totalSize.value=u.dashSize+u.gapSize,m.scale.value=u.scale}function l(m,u,v,g){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.size.value=u.size*v,m.scale.value=g*.5,u.map&&(m.map.value=u.map,n(u.map,m.uvTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,n(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function c(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.rotation.value=u.rotation,u.map&&(m.map.value=u.map,n(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,n(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function f(m,u){m.specular.value.copy(u.specular),m.shininess.value=Math.max(u.shininess,1e-4)}function h(m,u){u.gradientMap&&(m.gradientMap.value=u.gradientMap)}function d(m,u){m.metalness.value=u.metalness,u.metalnessMap&&(m.metalnessMap.value=u.metalnessMap,n(u.metalnessMap,m.metalnessMapTransform)),m.roughness.value=u.roughness,u.roughnessMap&&(m.roughnessMap.value=u.roughnessMap,n(u.roughnessMap,m.roughnessMapTransform)),e.get(u).envMap&&(m.envMapIntensity.value=u.envMapIntensity)}function p(m,u,v){m.ior.value=u.ior,u.sheen>0&&(m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),m.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(m.sheenColorMap.value=u.sheenColorMap,n(u.sheenColorMap,m.sheenColorMapTransform)),u.sheenRoughnessMap&&(m.sheenRoughnessMap.value=u.sheenRoughnessMap,n(u.sheenRoughnessMap,m.sheenRoughnessMapTransform))),u.clearcoat>0&&(m.clearcoat.value=u.clearcoat,m.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(m.clearcoatMap.value=u.clearcoatMap,n(u.clearcoatMap,m.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,n(u.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(m.clearcoatNormalMap.value=u.clearcoatNormalMap,n(u.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===on&&m.clearcoatNormalScale.value.negate())),u.iridescence>0&&(m.iridescence.value=u.iridescence,m.iridescenceIOR.value=u.iridescenceIOR,m.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(m.iridescenceMap.value=u.iridescenceMap,n(u.iridescenceMap,m.iridescenceMapTransform)),u.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=u.iridescenceThicknessMap,n(u.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),u.transmission>0&&(m.transmission.value=u.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),u.transmissionMap&&(m.transmissionMap.value=u.transmissionMap,n(u.transmissionMap,m.transmissionMapTransform)),m.thickness.value=u.thickness,u.thicknessMap&&(m.thicknessMap.value=u.thicknessMap,n(u.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=u.attenuationDistance,m.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(m.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(m.anisotropyMap.value=u.anisotropyMap,n(u.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=u.specularIntensity,m.specularColor.value.copy(u.specularColor),u.specularColorMap&&(m.specularColorMap.value=u.specularColorMap,n(u.specularColorMap,m.specularColorMapTransform)),u.specularIntensityMap&&(m.specularIntensityMap.value=u.specularIntensityMap,n(u.specularIntensityMap,m.specularIntensityMapTransform))}function x(m,u){u.matcap&&(m.matcap.value=u.matcap)}function _(m,u){const v=e.get(u).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function XT(t,e,n,i){let r={},s={},o=[];const a=n.isWebGL2?t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(v,g){const y=g.program;i.uniformBlockBinding(v,y)}function c(v,g){let y=r[v.id];y===void 0&&(x(v),y=f(v),r[v.id]=y,v.addEventListener("dispose",m));const R=g.program;i.updateUBOMapping(v,R);const A=e.render.frame;s[v.id]!==A&&(d(v),s[v.id]=A)}function f(v){const g=h();v.__bindingPointIndex=g;const y=t.createBuffer(),R=v.__size,A=v.usage;return t.bindBuffer(t.UNIFORM_BUFFER,y),t.bufferData(t.UNIFORM_BUFFER,R,A),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,g,y),y}function h(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){const g=r[v.id],y=v.uniforms,R=v.__cache;t.bindBuffer(t.UNIFORM_BUFFER,g);for(let A=0,C=y.length;A<C;A++){const U=Array.isArray(y[A])?y[A]:[y[A]];for(let M=0,T=U.length;M<T;M++){const W=U[M];if(p(W,A,M,R)===!0){const q=W.__offset,ie=Array.isArray(W.value)?W.value:[W.value];let P=0;for(let O=0;O<ie.length;O++){const X=ie[O],Y=_(X);typeof X=="number"||typeof X=="boolean"?(W.__data[0]=X,t.bufferSubData(t.UNIFORM_BUFFER,q+P,W.__data)):X.isMatrix3?(W.__data[0]=X.elements[0],W.__data[1]=X.elements[1],W.__data[2]=X.elements[2],W.__data[3]=0,W.__data[4]=X.elements[3],W.__data[5]=X.elements[4],W.__data[6]=X.elements[5],W.__data[7]=0,W.__data[8]=X.elements[6],W.__data[9]=X.elements[7],W.__data[10]=X.elements[8],W.__data[11]=0):(X.toArray(W.__data,P),P+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,q,W.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function p(v,g,y,R){const A=v.value,C=g+"_"+y;if(R[C]===void 0)return typeof A=="number"||typeof A=="boolean"?R[C]=A:R[C]=A.clone(),!0;{const U=R[C];if(typeof A=="number"||typeof A=="boolean"){if(U!==A)return R[C]=A,!0}else if(U.equals(A)===!1)return U.copy(A),!0}return!1}function x(v){const g=v.uniforms;let y=0;const R=16;for(let C=0,U=g.length;C<U;C++){const M=Array.isArray(g[C])?g[C]:[g[C]];for(let T=0,W=M.length;T<W;T++){const q=M[T],ie=Array.isArray(q.value)?q.value:[q.value];for(let P=0,O=ie.length;P<O;P++){const X=ie[P],Y=_(X),D=y%R;D!==0&&R-D<Y.boundary&&(y+=R-D),q.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=y,y+=Y.storage}}}const A=y%R;return A>0&&(y+=R-A),v.__size=y,v.__cache={},this}function _(v){const g={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(g.boundary=4,g.storage=4):v.isVector2?(g.boundary=8,g.storage=8):v.isVector3||v.isColor?(g.boundary=16,g.storage=12):v.isVector4?(g.boundary=16,g.storage=16):v.isMatrix3?(g.boundary=48,g.storage=48):v.isMatrix4?(g.boundary=64,g.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),g}function m(v){const g=v.target;g.removeEventListener("dispose",m);const y=o.indexOf(g.__bindingPointIndex);o.splice(y,1),t.deleteBuffer(r[g.id]),delete r[g.id],delete s[g.id]}function u(){for(const v in r)t.deleteBuffer(r[v]);o=[],r={},s={}}return{bind:l,update:c,dispose:u}}class F0{constructor(e={}){const{canvas:n=Hy(),context:i=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;i!==null?d=i.getContextAttributes().alpha:d=o;const p=new Uint32Array(4),x=new Int32Array(4);let _=null,m=null;const u=[],v=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Nt,this._useLegacyLights=!1,this.toneMapping=Hi,this.toneMappingExposure=1;const g=this;let y=!1,R=0,A=0,C=null,U=-1,M=null;const T=new bt,W=new bt;let q=null;const ie=new Xe(0);let P=0,O=n.width,X=n.height,Y=1,D=null,F=null;const k=new bt(0,0,O,X),$=new bt(0,0,O,X);let K=!1;const j=new qf;let Z=!1,le=!1,de=null;const me=new gt,Ne=new Me,Ue=new N,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function je(){return C===null?Y:1}let z=i;function Wt(E,I){for(let G=0;G<E.length;G++){const V=E[G],B=n.getContext(V,I);if(B!==null)return B}return null}try{const E={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:h};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${Wf}`),n.addEventListener("webglcontextlost",re,!1),n.addEventListener("webglcontextrestored",b,!1),n.addEventListener("webglcontextcreationerror",oe,!1),z===null){const I=["webgl2","webgl","experimental-webgl"];if(g.isWebGL1Renderer===!0&&I.shift(),z=Wt(I,E),z===null)throw Wt(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&z instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),z.getShaderPrecisionFormat===void 0&&(z.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let ye,Pe,ge,ot,Oe,w,S,H,te,Q,ne,ve,ce,he,Te,ke,J,Ke,Ve,be,xe,pe,Ie,Ye;function ft(){ye=new t1(z),Pe=new $E(z,ye,e),ye.init(Pe),pe=new BT(z,ye,Pe),ge=new kT(z,ye,Pe),ot=new r1(z),Oe=new TT,w=new zT(z,ye,ge,Oe,Pe,pe,ot),S=new ZE(g),H=new e1(g),te=new dS(z,Pe),Ie=new qE(z,ye,te,Pe),Q=new n1(z,te,ot,Ie),ne=new l1(z,Q,te,ot),Ve=new a1(z,Pe,w),ke=new KE(Oe),ve=new ET(g,S,H,ye,Pe,Ie,ke),ce=new WT(g,Oe),he=new AT,Te=new NT(ye,Pe),Ke=new jE(g,S,H,ge,ne,d,l),J=new OT(g,ne,Pe),Ye=new XT(z,ot,Pe,ge),be=new YE(z,ye,ot,Pe),xe=new i1(z,ye,ot,Pe),ot.programs=ve.programs,g.capabilities=Pe,g.extensions=ye,g.properties=Oe,g.renderLists=he,g.shadowMap=J,g.state=ge,g.info=ot}ft();const Be=new VT(g,z);this.xr=Be,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const E=ye.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=ye.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(E){E!==void 0&&(Y=E,this.setSize(O,X,!1))},this.getSize=function(E){return E.set(O,X)},this.setSize=function(E,I,G=!0){if(Be.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=E,X=I,n.width=Math.floor(E*Y),n.height=Math.floor(I*Y),G===!0&&(n.style.width=E+"px",n.style.height=I+"px"),this.setViewport(0,0,E,I)},this.getDrawingBufferSize=function(E){return E.set(O*Y,X*Y).floor()},this.setDrawingBufferSize=function(E,I,G){O=E,X=I,Y=G,n.width=Math.floor(E*G),n.height=Math.floor(I*G),this.setViewport(0,0,E,I)},this.getCurrentViewport=function(E){return E.copy(T)},this.getViewport=function(E){return E.copy(k)},this.setViewport=function(E,I,G,V){E.isVector4?k.set(E.x,E.y,E.z,E.w):k.set(E,I,G,V),ge.viewport(T.copy(k).multiplyScalar(Y).floor())},this.getScissor=function(E){return E.copy($)},this.setScissor=function(E,I,G,V){E.isVector4?$.set(E.x,E.y,E.z,E.w):$.set(E,I,G,V),ge.scissor(W.copy($).multiplyScalar(Y).floor())},this.getScissorTest=function(){return K},this.setScissorTest=function(E){ge.setScissorTest(K=E)},this.setOpaqueSort=function(E){D=E},this.setTransparentSort=function(E){F=E},this.getClearColor=function(E){return E.copy(Ke.getClearColor())},this.setClearColor=function(){Ke.setClearColor.apply(Ke,arguments)},this.getClearAlpha=function(){return Ke.getClearAlpha()},this.setClearAlpha=function(){Ke.setClearAlpha.apply(Ke,arguments)},this.clear=function(E=!0,I=!0,G=!0){let V=0;if(E){let B=!1;if(C!==null){const ue=C.texture.format;B=ue===f0||ue===u0||ue===c0}if(B){const ue=C.texture.type,_e=ue===Gi||ue===Pi||ue===Xf||ue===dr||ue===a0||ue===l0,Ee=Ke.getClearColor(),Ce=Ke.getClearAlpha(),ze=Ee.r,Le=Ee.g,De=Ee.b;_e?(p[0]=ze,p[1]=Le,p[2]=De,p[3]=Ce,z.clearBufferuiv(z.COLOR,0,p)):(x[0]=ze,x[1]=Le,x[2]=De,x[3]=Ce,z.clearBufferiv(z.COLOR,0,x))}else V|=z.COLOR_BUFFER_BIT}I&&(V|=z.DEPTH_BUFFER_BIT),G&&(V|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",re,!1),n.removeEventListener("webglcontextrestored",b,!1),n.removeEventListener("webglcontextcreationerror",oe,!1),he.dispose(),Te.dispose(),Oe.dispose(),S.dispose(),H.dispose(),ne.dispose(),Ie.dispose(),Ye.dispose(),ve.dispose(),Be.dispose(),Be.removeEventListener("sessionstart",Xt),Be.removeEventListener("sessionend",et),de&&(de.dispose(),de=null),jt.stop()};function re(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),y=!0}function b(){console.log("THREE.WebGLRenderer: Context Restored."),y=!1;const E=ot.autoReset,I=J.enabled,G=J.autoUpdate,V=J.needsUpdate,B=J.type;ft(),ot.autoReset=E,J.enabled=I,J.autoUpdate=G,J.needsUpdate=V,J.type=B}function oe(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function ae(E){const I=E.target;I.removeEventListener("dispose",ae),Ae(I)}function Ae(E){Se(E),Oe.remove(E)}function Se(E){const I=Oe.get(E).programs;I!==void 0&&(I.forEach(function(G){ve.releaseProgram(G)}),E.isShaderMaterial&&ve.releaseShaderCache(E))}this.renderBufferDirect=function(E,I,G,V,B,ue){I===null&&(I=we);const _e=B.isMesh&&B.matrixWorld.determinant()<0,Ee=V0(E,I,G,V,B);ge.setMaterial(V,_e);let Ce=G.index,ze=1;if(V.wireframe===!0){if(Ce=Q.getWireframeAttribute(G),Ce===void 0)return;ze=2}const Le=G.drawRange,De=G.attributes.position;let pt=Le.start*ze,an=(Le.start+Le.count)*ze;ue!==null&&(pt=Math.max(pt,ue.start*ze),an=Math.min(an,(ue.start+ue.count)*ze)),Ce!==null?(pt=Math.max(pt,0),an=Math.min(an,Ce.count)):De!=null&&(pt=Math.max(pt,0),an=Math.min(an,De.count));const At=an-pt;if(At<0||At===1/0)return;Ie.setup(B,V,Ee,G,Ce);let Jn,at=be;if(Ce!==null&&(Jn=te.get(Ce),at=xe,at.setIndex(Jn)),B.isMesh)V.wireframe===!0?(ge.setLineWidth(V.wireframeLinewidth*je()),at.setMode(z.LINES)):at.setMode(z.TRIANGLES);else if(B.isLine){let He=V.linewidth;He===void 0&&(He=1),ge.setLineWidth(He*je()),B.isLineSegments?at.setMode(z.LINES):B.isLineLoop?at.setMode(z.LINE_LOOP):at.setMode(z.LINE_STRIP)}else B.isPoints?at.setMode(z.POINTS):B.isSprite&&at.setMode(z.TRIANGLES);if(B.isBatchedMesh)at.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else if(B.isInstancedMesh)at.renderInstances(pt,At,B.count);else if(G.isInstancedBufferGeometry){const He=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,Dl=Math.min(G.instanceCount,He);at.renderInstances(pt,At,Dl)}else at.render(pt,At)};function Je(E,I,G){E.transparent===!0&&E.side===kn&&E.forceSinglePass===!1?(E.side=on,E.needsUpdate=!0,Do(E,I,G),E.side=Xi,E.needsUpdate=!0,Do(E,I,G),E.side=kn):Do(E,I,G)}this.compile=function(E,I,G=null){G===null&&(G=E),m=Te.get(G),m.init(),v.push(m),G.traverseVisible(function(B){B.isLight&&B.layers.test(I.layers)&&(m.pushLight(B),B.castShadow&&m.pushShadow(B))}),E!==G&&E.traverseVisible(function(B){B.isLight&&B.layers.test(I.layers)&&(m.pushLight(B),B.castShadow&&m.pushShadow(B))}),m.setupLights(g._useLegacyLights);const V=new Set;return E.traverse(function(B){const ue=B.material;if(ue)if(Array.isArray(ue))for(let _e=0;_e<ue.length;_e++){const Ee=ue[_e];Je(Ee,G,B),V.add(Ee)}else Je(ue,G,B),V.add(ue)}),v.pop(),m=null,V},this.compileAsync=function(E,I,G=null){const V=this.compile(E,I,G);return new Promise(B=>{function ue(){if(V.forEach(function(_e){Oe.get(_e).currentProgram.isReady()&&V.delete(_e)}),V.size===0){B(E);return}setTimeout(ue,10)}ye.get("KHR_parallel_shader_compile")!==null?ue():setTimeout(ue,10)})};let Qe=null;function wt(E){Qe&&Qe(E)}function Xt(){jt.stop()}function et(){jt.start()}const jt=new R0;jt.setAnimationLoop(wt),typeof self<"u"&&jt.setContext(self),this.setAnimationLoop=function(E){Qe=E,Be.setAnimationLoop(E),E===null?jt.stop():jt.start()},Be.addEventListener("sessionstart",Xt),Be.addEventListener("sessionend",et),this.render=function(E,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(y===!0)return;E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),Be.enabled===!0&&Be.isPresenting===!0&&(Be.cameraAutoUpdate===!0&&Be.updateCamera(I),I=Be.getCamera()),E.isScene===!0&&E.onBeforeRender(g,E,I,C),m=Te.get(E,v.length),m.init(),v.push(m),me.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),j.setFromProjectionMatrix(me),le=this.localClippingEnabled,Z=ke.init(this.clippingPlanes,le),_=he.get(E,u.length),_.init(),u.push(_),Wn(E,I,0,g.sortObjects),_.finish(),g.sortObjects===!0&&_.sort(D,F),this.info.render.frame++,Z===!0&&ke.beginShadows();const G=m.state.shadowsArray;if(J.render(G,E,I),Z===!0&&ke.endShadows(),this.info.autoReset===!0&&this.info.reset(),Ke.render(_,E),m.setupLights(g._useLegacyLights),I.isArrayCamera){const V=I.cameras;for(let B=0,ue=V.length;B<ue;B++){const _e=V[B];Qf(_,E,_e,_e.viewport)}}else Qf(_,E,I);C!==null&&(w.updateMultisampleRenderTarget(C),w.updateRenderTargetMipmap(C)),E.isScene===!0&&E.onAfterRender(g,E,I),Ie.resetDefaultState(),U=-1,M=null,v.pop(),v.length>0?m=v[v.length-1]:m=null,u.pop(),u.length>0?_=u[u.length-1]:_=null};function Wn(E,I,G,V){if(E.visible===!1)return;if(E.layers.test(I.layers)){if(E.isGroup)G=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(I);else if(E.isLight)m.pushLight(E),E.castShadow&&m.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||j.intersectsSprite(E)){V&&Ue.setFromMatrixPosition(E.matrixWorld).applyMatrix4(me);const _e=ne.update(E),Ee=E.material;Ee.visible&&_.push(E,_e,Ee,G,Ue.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||j.intersectsObject(E))){const _e=ne.update(E),Ee=E.material;if(V&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ue.copy(E.boundingSphere.center)):(_e.boundingSphere===null&&_e.computeBoundingSphere(),Ue.copy(_e.boundingSphere.center)),Ue.applyMatrix4(E.matrixWorld).applyMatrix4(me)),Array.isArray(Ee)){const Ce=_e.groups;for(let ze=0,Le=Ce.length;ze<Le;ze++){const De=Ce[ze],pt=Ee[De.materialIndex];pt&&pt.visible&&_.push(E,_e,pt,G,Ue.z,De)}}else Ee.visible&&_.push(E,_e,Ee,G,Ue.z,null)}}const ue=E.children;for(let _e=0,Ee=ue.length;_e<Ee;_e++)Wn(ue[_e],I,G,V)}function Qf(E,I,G,V){const B=E.opaque,ue=E.transmissive,_e=E.transparent;m.setupLightsView(G),Z===!0&&ke.setGlobalState(g.clippingPlanes,G),ue.length>0&&G0(B,ue,I,G),V&&ge.viewport(T.copy(V)),B.length>0&&No(B,I,G),ue.length>0&&No(ue,I,G),_e.length>0&&No(_e,I,G),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function G0(E,I,G,V){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;const ue=Pe.isWebGL2;de===null&&(de=new yr(1,1,{generateMipmaps:!0,type:ye.has("EXT_color_buffer_half_float")?Mo:Gi,minFilter:So,samples:ue?4:0})),g.getDrawingBufferSize(Ne),ue?de.setSize(Ne.x,Ne.y):de.setSize(qu(Ne.x),qu(Ne.y));const _e=g.getRenderTarget();g.setRenderTarget(de),g.getClearColor(ie),P=g.getClearAlpha(),P<1&&g.setClearColor(16777215,.5),g.clear();const Ee=g.toneMapping;g.toneMapping=Hi,No(E,G,V),w.updateMultisampleRenderTarget(de),w.updateRenderTargetMipmap(de);let Ce=!1;for(let ze=0,Le=I.length;ze<Le;ze++){const De=I[ze],pt=De.object,an=De.geometry,At=De.material,Jn=De.group;if(At.side===kn&&pt.layers.test(V.layers)){const at=At.side;At.side=on,At.needsUpdate=!0,ed(pt,G,V,an,At,Jn),At.side=at,At.needsUpdate=!0,Ce=!0}}Ce===!0&&(w.updateMultisampleRenderTarget(de),w.updateRenderTargetMipmap(de)),g.setRenderTarget(_e),g.setClearColor(ie,P),g.toneMapping=Ee}function No(E,I,G){const V=I.isScene===!0?I.overrideMaterial:null;for(let B=0,ue=E.length;B<ue;B++){const _e=E[B],Ee=_e.object,Ce=_e.geometry,ze=V===null?_e.material:V,Le=_e.group;Ee.layers.test(G.layers)&&ed(Ee,I,G,Ce,ze,Le)}}function ed(E,I,G,V,B,ue){E.onBeforeRender(g,I,G,V,B,ue),E.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),B.onBeforeRender(g,I,G,V,E,ue),B.transparent===!0&&B.side===kn&&B.forceSinglePass===!1?(B.side=on,B.needsUpdate=!0,g.renderBufferDirect(G,I,V,B,E,ue),B.side=Xi,B.needsUpdate=!0,g.renderBufferDirect(G,I,V,B,E,ue),B.side=kn):g.renderBufferDirect(G,I,V,B,E,ue),E.onAfterRender(g,I,G,V,B,ue)}function Do(E,I,G){I.isScene!==!0&&(I=we);const V=Oe.get(E),B=m.state.lights,ue=m.state.shadowsArray,_e=B.state.version,Ee=ve.getParameters(E,B.state,ue,I,G),Ce=ve.getProgramCacheKey(Ee);let ze=V.programs;V.environment=E.isMeshStandardMaterial?I.environment:null,V.fog=I.fog,V.envMap=(E.isMeshStandardMaterial?H:S).get(E.envMap||V.environment),ze===void 0&&(E.addEventListener("dispose",ae),ze=new Map,V.programs=ze);let Le=ze.get(Ce);if(Le!==void 0){if(V.currentProgram===Le&&V.lightsStateVersion===_e)return nd(E,Ee),Le}else Ee.uniforms=ve.getUniforms(E),E.onBuild(G,Ee,g),E.onBeforeCompile(Ee,g),Le=ve.acquireProgram(Ee,Ce),ze.set(Ce,Le),V.uniforms=Ee.uniforms;const De=V.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(De.clippingPlanes=ke.uniform),nd(E,Ee),V.needsLights=X0(E),V.lightsStateVersion=_e,V.needsLights&&(De.ambientLightColor.value=B.state.ambient,De.lightProbe.value=B.state.probe,De.directionalLights.value=B.state.directional,De.directionalLightShadows.value=B.state.directionalShadow,De.spotLights.value=B.state.spot,De.spotLightShadows.value=B.state.spotShadow,De.rectAreaLights.value=B.state.rectArea,De.ltc_1.value=B.state.rectAreaLTC1,De.ltc_2.value=B.state.rectAreaLTC2,De.pointLights.value=B.state.point,De.pointLightShadows.value=B.state.pointShadow,De.hemisphereLights.value=B.state.hemi,De.directionalShadowMap.value=B.state.directionalShadowMap,De.directionalShadowMatrix.value=B.state.directionalShadowMatrix,De.spotShadowMap.value=B.state.spotShadowMap,De.spotLightMatrix.value=B.state.spotLightMatrix,De.spotLightMap.value=B.state.spotLightMap,De.pointShadowMap.value=B.state.pointShadowMap,De.pointShadowMatrix.value=B.state.pointShadowMatrix),V.currentProgram=Le,V.uniformsList=null,Le}function td(E){if(E.uniformsList===null){const I=E.currentProgram.getUniforms();E.uniformsList=Ua.seqWithValue(I.seq,E.uniforms)}return E.uniformsList}function nd(E,I){const G=Oe.get(E);G.outputColorSpace=I.outputColorSpace,G.batching=I.batching,G.instancing=I.instancing,G.instancingColor=I.instancingColor,G.skinning=I.skinning,G.morphTargets=I.morphTargets,G.morphNormals=I.morphNormals,G.morphColors=I.morphColors,G.morphTargetsCount=I.morphTargetsCount,G.numClippingPlanes=I.numClippingPlanes,G.numIntersection=I.numClipIntersection,G.vertexAlphas=I.vertexAlphas,G.vertexTangents=I.vertexTangents,G.toneMapping=I.toneMapping}function V0(E,I,G,V,B){I.isScene!==!0&&(I=we),w.resetTextureUnits();const ue=I.fog,_e=V.isMeshStandardMaterial?I.environment:null,Ee=C===null?g.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:mi,Ce=(V.isMeshStandardMaterial?H:S).get(V.envMap||_e),ze=V.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Le=!!G.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),De=!!G.morphAttributes.position,pt=!!G.morphAttributes.normal,an=!!G.morphAttributes.color;let At=Hi;V.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(At=g.toneMapping);const Jn=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,at=Jn!==void 0?Jn.length:0,He=Oe.get(V),Dl=m.state.lights;if(Z===!0&&(le===!0||E!==M)){const _n=E===M&&V.id===U;ke.setState(V,E,_n)}let dt=!1;V.version===He.__version?(He.needsLights&&He.lightsStateVersion!==Dl.state.version||He.outputColorSpace!==Ee||B.isBatchedMesh&&He.batching===!1||!B.isBatchedMesh&&He.batching===!0||B.isInstancedMesh&&He.instancing===!1||!B.isInstancedMesh&&He.instancing===!0||B.isSkinnedMesh&&He.skinning===!1||!B.isSkinnedMesh&&He.skinning===!0||B.isInstancedMesh&&He.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&He.instancingColor===!1&&B.instanceColor!==null||He.envMap!==Ce||V.fog===!0&&He.fog!==ue||He.numClippingPlanes!==void 0&&(He.numClippingPlanes!==ke.numPlanes||He.numIntersection!==ke.numIntersection)||He.vertexAlphas!==ze||He.vertexTangents!==Le||He.morphTargets!==De||He.morphNormals!==pt||He.morphColors!==an||He.toneMapping!==At||Pe.isWebGL2===!0&&He.morphTargetsCount!==at)&&(dt=!0):(dt=!0,He.__version=V.version);let $i=He.currentProgram;dt===!0&&($i=Do(V,I,B));let id=!1,Cs=!1,Ul=!1;const Ft=$i.getUniforms(),Ki=He.uniforms;if(ge.useProgram($i.program)&&(id=!0,Cs=!0,Ul=!0),V.id!==U&&(U=V.id,Cs=!0),id||M!==E){Ft.setValue(z,"projectionMatrix",E.projectionMatrix),Ft.setValue(z,"viewMatrix",E.matrixWorldInverse);const _n=Ft.map.cameraPosition;_n!==void 0&&_n.setValue(z,Ue.setFromMatrixPosition(E.matrixWorld)),Pe.logarithmicDepthBuffer&&Ft.setValue(z,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&Ft.setValue(z,"isOrthographic",E.isOrthographicCamera===!0),M!==E&&(M=E,Cs=!0,Ul=!0)}if(B.isSkinnedMesh){Ft.setOptional(z,B,"bindMatrix"),Ft.setOptional(z,B,"bindMatrixInverse");const _n=B.skeleton;_n&&(Pe.floatVertexTextures?(_n.boneTexture===null&&_n.computeBoneTexture(),Ft.setValue(z,"boneTexture",_n.boneTexture,w)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}B.isBatchedMesh&&(Ft.setOptional(z,B,"batchingTexture"),Ft.setValue(z,"batchingTexture",B._matricesTexture,w));const Il=G.morphAttributes;if((Il.position!==void 0||Il.normal!==void 0||Il.color!==void 0&&Pe.isWebGL2===!0)&&Ve.update(B,G,$i),(Cs||He.receiveShadow!==B.receiveShadow)&&(He.receiveShadow=B.receiveShadow,Ft.setValue(z,"receiveShadow",B.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(Ki.envMap.value=Ce,Ki.flipEnvMap.value=Ce.isCubeTexture&&Ce.isRenderTargetTexture===!1?-1:1),Cs&&(Ft.setValue(z,"toneMappingExposure",g.toneMappingExposure),He.needsLights&&W0(Ki,Ul),ue&&V.fog===!0&&ce.refreshFogUniforms(Ki,ue),ce.refreshMaterialUniforms(Ki,V,Y,X,de),Ua.upload(z,td(He),Ki,w)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Ua.upload(z,td(He),Ki,w),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&Ft.setValue(z,"center",B.center),Ft.setValue(z,"modelViewMatrix",B.modelViewMatrix),Ft.setValue(z,"normalMatrix",B.normalMatrix),Ft.setValue(z,"modelMatrix",B.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){const _n=V.uniformsGroups;for(let Fl=0,j0=_n.length;Fl<j0;Fl++)if(Pe.isWebGL2){const rd=_n[Fl];Ye.update(rd,$i),Ye.bind(rd,$i)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return $i}function W0(E,I){E.ambientLightColor.needsUpdate=I,E.lightProbe.needsUpdate=I,E.directionalLights.needsUpdate=I,E.directionalLightShadows.needsUpdate=I,E.pointLights.needsUpdate=I,E.pointLightShadows.needsUpdate=I,E.spotLights.needsUpdate=I,E.spotLightShadows.needsUpdate=I,E.rectAreaLights.needsUpdate=I,E.hemisphereLights.needsUpdate=I}function X0(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(E,I,G){Oe.get(E.texture).__webglTexture=I,Oe.get(E.depthTexture).__webglTexture=G;const V=Oe.get(E);V.__hasExternalTextures=!0,V.__hasExternalTextures&&(V.__autoAllocateDepthBuffer=G===void 0,V.__autoAllocateDepthBuffer||ye.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),V.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(E,I){const G=Oe.get(E);G.__webglFramebuffer=I,G.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(E,I=0,G=0){C=E,R=I,A=G;let V=!0,B=null,ue=!1,_e=!1;if(E){const Ce=Oe.get(E);Ce.__useDefaultFramebuffer!==void 0?(ge.bindFramebuffer(z.FRAMEBUFFER,null),V=!1):Ce.__webglFramebuffer===void 0?w.setupRenderTarget(E):Ce.__hasExternalTextures&&w.rebindTextures(E,Oe.get(E.texture).__webglTexture,Oe.get(E.depthTexture).__webglTexture);const ze=E.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(_e=!0);const Le=Oe.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Le[I])?B=Le[I][G]:B=Le[I],ue=!0):Pe.isWebGL2&&E.samples>0&&w.useMultisampledRTT(E)===!1?B=Oe.get(E).__webglMultisampledFramebuffer:Array.isArray(Le)?B=Le[G]:B=Le,T.copy(E.viewport),W.copy(E.scissor),q=E.scissorTest}else T.copy(k).multiplyScalar(Y).floor(),W.copy($).multiplyScalar(Y).floor(),q=K;if(ge.bindFramebuffer(z.FRAMEBUFFER,B)&&Pe.drawBuffers&&V&&ge.drawBuffers(E,B),ge.viewport(T),ge.scissor(W),ge.setScissorTest(q),ue){const Ce=Oe.get(E.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+I,Ce.__webglTexture,G)}else if(_e){const Ce=Oe.get(E.texture),ze=I||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,Ce.__webglTexture,G||0,ze)}U=-1},this.readRenderTargetPixels=function(E,I,G,V,B,ue,_e){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=Oe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&_e!==void 0&&(Ee=Ee[_e]),Ee){ge.bindFramebuffer(z.FRAMEBUFFER,Ee);try{const Ce=E.texture,ze=Ce.format,Le=Ce.type;if(ze!==Bn&&pe.convert(ze)!==z.getParameter(z.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const De=Le===Mo&&(ye.has("EXT_color_buffer_half_float")||Pe.isWebGL2&&ye.has("EXT_color_buffer_float"));if(Le!==Gi&&pe.convert(Le)!==z.getParameter(z.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Le===Li&&(Pe.isWebGL2||ye.has("OES_texture_float")||ye.has("WEBGL_color_buffer_float")))&&!De){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=E.width-V&&G>=0&&G<=E.height-B&&z.readPixels(I,G,V,B,pe.convert(ze),pe.convert(Le),ue)}finally{const Ce=C!==null?Oe.get(C).__webglFramebuffer:null;ge.bindFramebuffer(z.FRAMEBUFFER,Ce)}}},this.copyFramebufferToTexture=function(E,I,G=0){const V=Math.pow(2,-G),B=Math.floor(I.image.width*V),ue=Math.floor(I.image.height*V);w.setTexture2D(I,0),z.copyTexSubImage2D(z.TEXTURE_2D,G,0,0,E.x,E.y,B,ue),ge.unbindTexture()},this.copyTextureToTexture=function(E,I,G,V=0){const B=I.image.width,ue=I.image.height,_e=pe.convert(G.format),Ee=pe.convert(G.type);w.setTexture2D(G,0),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,G.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,G.unpackAlignment),I.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,V,E.x,E.y,B,ue,_e,Ee,I.image.data):I.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,V,E.x,E.y,I.mipmaps[0].width,I.mipmaps[0].height,_e,I.mipmaps[0].data):z.texSubImage2D(z.TEXTURE_2D,V,E.x,E.y,_e,Ee,I.image),V===0&&G.generateMipmaps&&z.generateMipmap(z.TEXTURE_2D),ge.unbindTexture()},this.copyTextureToTexture3D=function(E,I,G,V,B=0){if(g.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const ue=E.max.x-E.min.x+1,_e=E.max.y-E.min.y+1,Ee=E.max.z-E.min.z+1,Ce=pe.convert(V.format),ze=pe.convert(V.type);let Le;if(V.isData3DTexture)w.setTexture3D(V,0),Le=z.TEXTURE_3D;else if(V.isDataArrayTexture||V.isCompressedArrayTexture)w.setTexture2DArray(V,0),Le=z.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,V.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,V.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,V.unpackAlignment);const De=z.getParameter(z.UNPACK_ROW_LENGTH),pt=z.getParameter(z.UNPACK_IMAGE_HEIGHT),an=z.getParameter(z.UNPACK_SKIP_PIXELS),At=z.getParameter(z.UNPACK_SKIP_ROWS),Jn=z.getParameter(z.UNPACK_SKIP_IMAGES),at=G.isCompressedTexture?G.mipmaps[B]:G.image;z.pixelStorei(z.UNPACK_ROW_LENGTH,at.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,at.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,E.min.x),z.pixelStorei(z.UNPACK_SKIP_ROWS,E.min.y),z.pixelStorei(z.UNPACK_SKIP_IMAGES,E.min.z),G.isDataTexture||G.isData3DTexture?z.texSubImage3D(Le,B,I.x,I.y,I.z,ue,_e,Ee,Ce,ze,at.data):G.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),z.compressedTexSubImage3D(Le,B,I.x,I.y,I.z,ue,_e,Ee,Ce,at.data)):z.texSubImage3D(Le,B,I.x,I.y,I.z,ue,_e,Ee,Ce,ze,at),z.pixelStorei(z.UNPACK_ROW_LENGTH,De),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,pt),z.pixelStorei(z.UNPACK_SKIP_PIXELS,an),z.pixelStorei(z.UNPACK_SKIP_ROWS,At),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Jn),B===0&&V.generateMipmaps&&z.generateMipmap(Le),ge.unbindTexture()},this.initTexture=function(E){E.isCubeTexture?w.setTextureCube(E,0):E.isData3DTexture?w.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?w.setTexture2DArray(E,0):w.setTexture2D(E,0),ge.unbindTexture()},this.resetState=function(){R=0,A=0,C=null,ge.reset(),Ie.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ci}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=e===jf?"display-p3":"srgb",n.unpackColorSpace=Ze.workingColorSpace===bl?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===Nt?pr:h0}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===pr?Nt:mi}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class jT extends F0{}jT.prototype.isWebGL1Renderer=!0;class qT extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n}}class $f extends Ts{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Xe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Up=new N,Ip=new N,Fp=new gt,Bc=new y0,ya=new Pl;class YT extends Ut{constructor(e=new bn,n=new $f){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const n=e.attributes.position,i=[0];for(let r=1,s=n.count;r<s;r++)Up.fromBufferAttribute(n,r-1),Ip.fromBufferAttribute(n,r),i[r]=i[r-1],i[r]+=Up.distanceTo(Ip);e.setAttribute("lineDistance",new Mt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,n){const i=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ya.copy(i.boundingSphere),ya.applyMatrix4(r),ya.radius+=s,e.ray.intersectsSphere(ya)===!1)return;Fp.copy(r).invert(),Bc.copy(e.ray).applyMatrix4(Fp);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=new N,f=new N,h=new N,d=new N,p=this.isLineSegments?2:1,x=i.index,m=i.attributes.position;if(x!==null){const u=Math.max(0,o.start),v=Math.min(x.count,o.start+o.count);for(let g=u,y=v-1;g<y;g+=p){const R=x.getX(g),A=x.getX(g+1);if(c.fromBufferAttribute(m,R),f.fromBufferAttribute(m,A),Bc.distanceSqToSegment(c,f,d,h)>l)continue;d.applyMatrix4(this.matrixWorld);const U=e.ray.origin.distanceTo(d);U<e.near||U>e.far||n.push({distance:U,point:h.clone().applyMatrix4(this.matrixWorld),index:g,face:null,faceIndex:null,object:this})}}else{const u=Math.max(0,o.start),v=Math.min(m.count,o.start+o.count);for(let g=u,y=v-1;g<y;g+=p){if(c.fromBufferAttribute(m,g),f.fromBufferAttribute(m,g+1),Bc.distanceSqToSegment(c,f,d,h)>l)continue;d.applyMatrix4(this.matrixWorld);const A=e.ray.origin.distanceTo(d);A<e.near||A>e.far||n.push({distance:A,point:h.clone().applyMatrix4(this.matrixWorld),index:g,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}const Op=new N,kp=new N;class O0 extends YT{constructor(e,n){super(e,n),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const n=e.attributes.position,i=[];for(let r=0,s=n.count;r<s;r+=2)Op.fromBufferAttribute(n,r),kp.fromBufferAttribute(n,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+Op.distanceTo(kp);e.setAttribute("lineDistance",new Mt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class vi{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,n){const i=this.getUtoTmapping(e);return this.getPoint(i,n)}getPoints(e=5){const n=[];for(let i=0;i<=e;i++)n.push(this.getPoint(i/e));return n}getSpacedPoints(e=5){const n=[];for(let i=0;i<=e;i++)n.push(this.getPointAt(i/e));return n}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const n=[];let i,r=this.getPoint(0),s=0;n.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),n.push(s),r=i;return this.cacheArcLengths=n,n}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,n){const i=this.getLengths();let r=0;const s=i.length;let o;n?o=n:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);const f=i[r],d=i[r+1]-f,p=(o-f)/d;return(r+p)/(s-1)}getTangent(e,n){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const o=this.getPoint(r),a=this.getPoint(s),l=n||(o.isVector2?new Me:new N);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,n){const i=this.getUtoTmapping(e);return this.getTangent(i,n)}computeFrenetFrames(e,n){const i=new N,r=[],s=[],o=[],a=new N,l=new gt;for(let p=0;p<=e;p++){const x=p/e;r[p]=this.getTangentAt(x,new N)}s[0]=new N,o[0]=new N;let c=Number.MAX_VALUE;const f=Math.abs(r[0].x),h=Math.abs(r[0].y),d=Math.abs(r[0].z);f<=c&&(c=f,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),d<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(r[p-1],r[p]),a.length()>Number.EPSILON){a.normalize();const x=Math.acos(Gt(r[p-1].dot(r[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(a,x))}o[p].crossVectors(r[p],s[p])}if(n===!0){let p=Math.acos(Gt(s[0].dot(s[e]),-1,1));p/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(p=-p);for(let x=1;x<=e;x++)s[x].applyMatrix4(l.makeRotationAxis(r[x],p*x)),o[x].crossVectors(r[x],s[x])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class k0 extends vi{constructor(e=0,n=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=n,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,n){const i=n||new Me,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);const a=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const f=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*f-p*h+this.aX,c=d*h+p*f+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class $T extends k0{constructor(e,n,i,r,s,o){super(e,n,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Kf(){let t=0,e=0,n=0,i=0;function r(s,o,a,l){t=s,e=a,n=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,f,h){let d=(o-s)/c-(a-s)/(c+f)+(a-o)/f,p=(a-o)/f-(l-o)/(f+h)+(l-a)/h;d*=f,p*=f,r(o,a,d,p)},calc:function(s){const o=s*s,a=o*s;return t+e*s+n*o+i*a}}}const Sa=new N,Hc=new Kf,Gc=new Kf,Vc=new Kf;class z0 extends vi{constructor(e=[],n=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=n,this.curveType=i,this.tension=r}getPoint(e,n=new N){const i=n,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,f;this.closed||a>0?c=r[(a-1)%s]:(Sa.subVectors(r[0],r[1]).add(r[0]),c=Sa);const h=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?f=r[(a+2)%s]:(Sa.subVectors(r[s-1],r[s-2]).add(r[s-1]),f=Sa),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let x=Math.pow(c.distanceToSquared(h),p),_=Math.pow(h.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(f),p);_<1e-4&&(_=1),x<1e-4&&(x=_),m<1e-4&&(m=_),Hc.initNonuniformCatmullRom(c.x,h.x,d.x,f.x,x,_,m),Gc.initNonuniformCatmullRom(c.y,h.y,d.y,f.y,x,_,m),Vc.initNonuniformCatmullRom(c.z,h.z,d.z,f.z,x,_,m)}else this.curveType==="catmullrom"&&(Hc.initCatmullRom(c.x,h.x,d.x,f.x,this.tension),Gc.initCatmullRom(c.y,h.y,d.y,f.y,this.tension),Vc.initCatmullRom(c.z,h.z,d.z,f.z,this.tension));return i.set(Hc.calc(l),Gc.calc(l),Vc.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let n=0,i=e.points.length;n<i;n++){const r=e.points[n];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let n=0,i=this.points.length;n<i;n++){const r=this.points[n];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let n=0,i=e.points.length;n<i;n++){const r=e.points[n];this.points.push(new N().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function zp(t,e,n,i,r){const s=(i-e)*.5,o=(r-n)*.5,a=t*t,l=t*a;return(2*n-2*i+s+o)*l+(-3*n+3*i-2*s-o)*a+s*t+n}function KT(t,e){const n=1-t;return n*n*e}function ZT(t,e){return 2*(1-t)*t*e}function JT(t,e){return t*t*e}function to(t,e,n,i){return KT(t,e)+ZT(t,n)+JT(t,i)}function QT(t,e){const n=1-t;return n*n*n*e}function ew(t,e){const n=1-t;return 3*n*n*t*e}function tw(t,e){return 3*(1-t)*t*t*e}function nw(t,e){return t*t*t*e}function no(t,e,n,i,r){return QT(t,e)+ew(t,n)+tw(t,i)+nw(t,r)}class iw extends vi{constructor(e=new Me,n=new Me,i=new Me,r=new Me){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=n,this.v2=i,this.v3=r}getPoint(e,n=new Me){const i=n,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(no(e,r.x,s.x,o.x,a.x),no(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class rw extends vi{constructor(e=new N,n=new N,i=new N,r=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=n,this.v2=i,this.v3=r}getPoint(e,n=new N){const i=n,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(no(e,r.x,s.x,o.x,a.x),no(e,r.y,s.y,o.y,a.y),no(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class sw extends vi{constructor(e=new Me,n=new Me){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=n}getPoint(e,n=new Me){const i=n;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,n){return this.getPoint(e,n)}getTangent(e,n=new Me){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,n){return this.getTangent(e,n)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ow extends vi{constructor(e=new N,n=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=n}getPoint(e,n=new N){const i=n;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,n){return this.getPoint(e,n)}getTangent(e,n=new N){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,n){return this.getTangent(e,n)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class aw extends vi{constructor(e=new Me,n=new Me,i=new Me){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=n,this.v2=i}getPoint(e,n=new Me){const i=n,r=this.v0,s=this.v1,o=this.v2;return i.set(to(e,r.x,s.x,o.x),to(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class B0 extends vi{constructor(e=new N,n=new N,i=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=n,this.v2=i}getPoint(e,n=new N){const i=n,r=this.v0,s=this.v1,o=this.v2;return i.set(to(e,r.x,s.x,o.x),to(e,r.y,s.y,o.y),to(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class lw extends vi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,n=new Me){const i=n,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],f=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(zp(a,l.x,c.x,f.x,h.x),zp(a,l.y,c.y,f.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let n=0,i=e.points.length;n<i;n++){const r=e.points[n];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let n=0,i=this.points.length;n<i;n++){const r=this.points[n];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let n=0,i=e.points.length;n<i;n++){const r=e.points[n];this.points.push(new Me().fromArray(r))}return this}}var cw=Object.freeze({__proto__:null,ArcCurve:$T,CatmullRomCurve3:z0,CubicBezierCurve:iw,CubicBezierCurve3:rw,EllipseCurve:k0,LineCurve:sw,LineCurve3:ow,QuadraticBezierCurve:aw,QuadraticBezierCurve3:B0,SplineCurve:lw});class Zf extends bn{constructor(e=1,n=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:n,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let c=0;const f=[],h=new N,d=new N,p=[],x=[],_=[],m=[];for(let u=0;u<=i;u++){const v=[],g=u/i;let y=0;u===0&&o===0?y=.5/n:u===i&&l===Math.PI&&(y=-.5/n);for(let R=0;R<=n;R++){const A=R/n;h.x=-e*Math.cos(r+A*s)*Math.sin(o+g*a),h.y=e*Math.cos(o+g*a),h.z=e*Math.sin(r+A*s)*Math.sin(o+g*a),x.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(A+y,1-g),v.push(c++)}f.push(v)}for(let u=0;u<i;u++)for(let v=0;v<n;v++){const g=f[u][v+1],y=f[u][v],R=f[u+1][v],A=f[u+1][v+1];(u!==0||o>0)&&p.push(g,y,A),(u!==i-1||l<Math.PI)&&p.push(y,R,A)}this.setIndex(p),this.setAttribute("position",new Mt(x,3)),this.setAttribute("normal",new Mt(_,3)),this.setAttribute("uv",new Mt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zf(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Jf extends bn{constructor(e=new B0(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),n=64,i=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:n,radius:i,radialSegments:r,closed:s};const o=e.computeFrenetFrames(n,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new N,l=new N,c=new Me;let f=new N;const h=[],d=[],p=[],x=[];_(),this.setIndex(x),this.setAttribute("position",new Mt(h,3)),this.setAttribute("normal",new Mt(d,3)),this.setAttribute("uv",new Mt(p,2));function _(){for(let g=0;g<n;g++)m(g);m(s===!1?n:0),v(),u()}function m(g){f=e.getPointAt(g/n,f);const y=o.normals[g],R=o.binormals[g];for(let A=0;A<=r;A++){const C=A/r*Math.PI*2,U=Math.sin(C),M=-Math.cos(C);l.x=M*y.x+U*R.x,l.y=M*y.y+U*R.y,l.z=M*y.z+U*R.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=f.x+i*l.x,a.y=f.y+i*l.y,a.z=f.z+i*l.z,h.push(a.x,a.y,a.z)}}function u(){for(let g=1;g<=n;g++)for(let y=1;y<=r;y++){const R=(r+1)*(g-1)+(y-1),A=(r+1)*g+(y-1),C=(r+1)*g+y,U=(r+1)*(g-1)+y;x.push(R,A,U),x.push(A,C,U)}}function v(){for(let g=0;g<=n;g++)for(let y=0;y<=r;y++)c.x=g/n,c.y=y/r,p.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Jf(new cw[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class Wc extends Ts{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=p0,this.normalScale=new Me(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class H0 extends Ut{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Xe(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),n}}const Xc=new gt,Bp=new N,Hp=new N;class uw{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Me(512,512),this.map=null,this.mapPass=null,this.matrix=new gt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new qf,this._frameExtents=new Me(1,1),this._viewportCount=1,this._viewports=[new bt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera,i=this.matrix;Bp.setFromMatrixPosition(e.matrixWorld),n.position.copy(Bp),Hp.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(Hp),n.updateMatrixWorld(),Xc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Xc),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Xc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class fw extends uw{constructor(){super(new b0(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class dw extends H0{constructor(e,n){super(e,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new fw}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class hw extends H0{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}}class pw extends O0{constructor(e=10,n=10,i=4473924,r=8947848){i=new Xe(i),r=new Xe(r);const s=n/2,o=e/n,a=e/2,l=[],c=[];for(let d=0,p=0,x=-a;d<=n;d++,x+=o){l.push(-a,0,x,a,0,x),l.push(x,0,-a,x,0,a);const _=d===s?i:r;_.toArray(c,p),p+=3,_.toArray(c,p),p+=3,_.toArray(c,p),p+=3,_.toArray(c,p),p+=3}const f=new bn;f.setAttribute("position",new Mt(l,3)),f.setAttribute("color",new Mt(c,3));const h=new $f({vertexColors:!0,toneMapped:!1});super(f,h),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class mw extends O0{constructor(e=1){const n=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],i=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],r=new bn;r.setAttribute("position",new Mt(n,3)),r.setAttribute("color",new Mt(i,3));const s=new $f({vertexColors:!0,toneMapped:!1});super(r,s),this.type="AxesHelper"}setColors(e,n,i){const r=new Xe,s=this.geometry.attributes.color.array;return r.set(e),r.toArray(s,0),r.toArray(s,3),r.set(n),r.toArray(s,6),r.toArray(s,9),r.set(i),r.toArray(s,12),r.toArray(s,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Wf}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Wf);function gw({trajectoryPoses:t=[],currentFrameIndex:e=0}){const n=Re.useRef(null),i=Re.useRef(null),r=Re.useRef(null),s=Re.useRef(null);return Re.useEffect(()=>{const o=n.current;if(!o)return;const a=new qT;a.background=new Xe(658967),i.current=a;const l=new En(45,o.clientWidth/o.clientHeight,.01,50);l.position.set(.4,-.45,.4),l.up.set(0,0,1),l.lookAt(.075,.025,.05);const c=new F0({antialias:!0,alpha:!0});c.setSize(o.clientWidth,o.clientHeight),c.setPixelRatio(Math.min(window.devicePixelRatio,2)),c.shadowMap.enabled=!0,o.appendChild(c.domElement);const f=new hw(16777215,.7);a.add(f);const h=new dw(16777215,1.2);h.position.set(1,-1,2),a.add(h);const d=new ws(.8,.6,.02),p=new Wc({color:1976635,roughness:.4}),x=new fn(d,p);x.position.set(.15,.1,-.01),a.add(x);const _=new pw(.8,16,4674921,3359061);_.rotation.x=Math.PI/2,_.position.set(.15,.1,.001),a.add(_);const m=new Eo(.1,.1),u=new fl({color:1096065,side:kn}),v=new fn(m,u);v.position.set(.05,.05,.002),a.add(v);const g=new Eo(.05,.05),y=new fl({color:3718648,side:kn}),R=new fn(g,y);R.position.set(.175,.025,.002),a.add(R);const A=new mw(.08);A.position.set(0,0,.005),a.add(A);const C=new Zf(.012,32,32),U=new Wc({color:16096779,emissive:16096779,emissiveIntensity:.5}),M=new fn(C,U);s.current=M,a.add(M);let T;const W=()=>{T=requestAnimationFrame(W),c.render(a,l)};W();const q=()=>{o&&(l.aspect=o.clientWidth/o.clientHeight,l.updateProjectionMatrix(),c.setSize(o.clientWidth,o.clientHeight))};return window.addEventListener("resize",q),()=>{cancelAnimationFrame(T),window.removeEventListener("resize",q),c.domElement&&o.contains(c.domElement)&&o.removeChild(c.domElement)}},[]),Re.useEffect(()=>{const o=i.current;if(o){if(r.current&&(o.remove(r.current),r.current=null),t.length>1){const a=t.map(d=>new N(d[0],d[1],d[2])),l=new z0(a),c=new Jf(l,Math.max(20,t.length),.004,8,!1),f=new Wc({color:6514417,emissive:5195493,emissiveIntensity:.4,roughness:.3}),h=new fn(c,f);r.current=h,o.add(h)}if(s.current&&t.length>0){const a=Math.min(e,t.length-1),l=t[a];s.current.position.set(l[0],l[1],l[2])}}},[t,e]),L.jsxs("div",{className:"w-full h-full relative rounded-2xl overflow-hidden glass-card",children:[L.jsx("div",{ref:n,className:"w-full h-full"}),L.jsxs("div",{className:"absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 pointer-events-none",children:[L.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-pulse"}),L.jsx("span",{children:"3D World Frame: Dual-ArUco Table Origin (0,0,0)"})]})]})}function vw({videoUrl:t,isPlaying:e,currentFrameIndex:n,totalFrames:i,fps:r=30,onTimeUpdate:s}){const o=Re.useRef(null);return Re.useEffect(()=>{const a=o.current;a&&(e?a.play().catch(()=>{}):a.pause())},[e]),Re.useEffect(()=>{const a=o.current;if(!a||!i||i<=0)return;const l=n/r;Math.abs(a.currentTime-l)>.15&&(a.currentTime=l)},[n,r,i]),L.jsxs("div",{className:"w-full h-full relative rounded-2xl overflow-hidden glass-card flex items-center justify-center bg-black",children:[t?L.jsx("video",{ref:o,src:t,playsInline:!0,muted:!0,className:"w-full h-full object-cover",onTimeUpdate:()=>{o.current&&s&&s(o.current.currentTime)}}):L.jsxs("div",{className:"flex flex-col items-center gap-2 text-slate-500",children:[L.jsx(kx,{className:"w-8 h-8 stroke-1"}),L.jsx("span",{className:"text-xs",children:"No video recording loaded"})]}),L.jsxs("div",{className:"absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 pointer-events-none",children:[L.jsx("span",{className:"w-2 h-2 rounded-full bg-indigo-400"}),L.jsx("span",{children:"Camera Viewfinder Stream"})]})]})}function _w({episodes:t,selectedEpIdx:e,setSelectedEpIdx:n,onRefreshEpisodes:i,onDeleteEpisode:r,onReprocessActive:s}){var v;const[o,a]=Re.useState(!1),[l,c]=Re.useState(0),f=t.find(g=>g.episode_index===e)||t[0]||null,h=(f==null?void 0:f.poses)||[],d=(f==null?void 0:f.num_frames)||0,p=h[l]||[0,0,0,0,0,0];Re.useEffect(()=>{c(0),a(!1)},[e]),Re.useEffect(()=>{let g=null;return o&&d>0&&(g=setInterval(()=>{c(y=>y>=d-1?(a(!1),0):y+1)},1e3/((f==null?void 0:f.fps)||30))),()=>clearInterval(g)},[o,d,f==null?void 0:f.fps]);const x=p[0]||0,_=p[1]||0,m=p[2]||0,u=Math.sqrt(x*x+_*_+m*m);return L.jsxs("div",{className:"flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden h-[calc(100vh-60px)]",children:[L.jsxs("div",{className:"lg:col-span-3 flex flex-col gap-3 h-full",children:[L.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0",children:[L.jsx(gw,{trajectoryPoses:h,currentFrameIndex:l}),L.jsx(vw,{videoUrl:f==null?void 0:f.video_url,isPlaying:o,currentFrameIndex:l,totalFrames:d,fps:(f==null?void 0:f.fps)||30})]}),L.jsxs("div",{className:"glass-card p-4 rounded-2xl flex flex-col gap-3",children:[L.jsxs("div",{className:"flex items-center gap-3",children:[L.jsx("button",{onClick:()=>a(!o),disabled:d===0,className:"p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50",children:o?L.jsx(Px,{className:"w-5 h-5 fill-current"}):L.jsx(Lx,{className:"w-5 h-5 fill-current ml-0.5"})}),L.jsxs("div",{className:"flex-1 flex flex-col gap-1",children:[L.jsx("input",{type:"range",min:"0",max:Math.max(0,d-1),value:l,onChange:g=>{a(!1),c(parseInt(g.target.value)||0)},className:"w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"}),L.jsxs("div",{className:"flex justify-between text-[11px] font-mono text-slate-400",children:[L.jsxs("span",{children:["Frame ",l+1," of ",d]}),L.jsxs("span",{children:[(l/((f==null?void 0:f.fps)||30)||0).toFixed(2),"s / ",((f==null?void 0:f.duration)||0).toFixed(2),"s"]})]})]})]}),L.jsxs("div",{className:"grid grid-cols-5 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-left font-mono",children:[L.jsxs("div",{children:[L.jsx("span",{className:"text-[10px] text-slate-500 uppercase block",children:"X (Right)"}),L.jsxs("span",{className:"text-xs font-semibold text-slate-200",children:[(x*100).toFixed(1)," cm"]})]}),L.jsxs("div",{children:[L.jsx("span",{className:"text-[10px] text-slate-500 uppercase block",children:"Y (Forward)"}),L.jsxs("span",{className:"text-xs font-semibold text-slate-200",children:[(_*100).toFixed(1)," cm"]})]}),L.jsxs("div",{children:[L.jsx("span",{className:"text-[10px] text-slate-500 uppercase block",children:"Z (Height)"}),L.jsxs("span",{className:"text-xs font-semibold text-emerald-400",children:[(m*100).toFixed(1)," cm"]})]}),L.jsxs("div",{children:[L.jsx("span",{className:"text-[10px] text-slate-500 uppercase block",children:"Dist to Origin"}),L.jsxs("span",{className:"text-xs font-semibold text-sky-400",children:[(u*100).toFixed(1)," cm"]})]}),L.jsxs("div",{children:[L.jsx("span",{className:"text-[10px] text-slate-500 uppercase block",children:"Gripper"}),L.jsx("span",{className:"text-xs font-semibold text-amber-400",children:(v=f==null?void 0:f.gripper_states)!=null&&v[l]?`${f.gripper_states[l].toFixed(0)}%`:"100%"})]})]})]})]}),L.jsxs("div",{className:"glass-card p-4 rounded-2xl flex flex-col gap-3 h-full overflow-hidden text-left",children:[L.jsxs("div",{className:"flex items-center justify-between border-b border-slate-800 pb-3",children:[L.jsxs("div",{className:"flex items-center gap-2",children:[L.jsx(Ax,{className:"w-4 h-4 text-indigo-400"}),L.jsxs("h2",{className:"text-xs font-bold uppercase tracking-wider text-slate-200",children:["Episodes (",t.length,")"]})]}),L.jsx("button",{onClick:i,className:"p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800",children:L.jsx(e0,{className:"w-4 h-4"})})]}),L.jsx("div",{className:"flex-1 overflow-y-auto flex flex-col gap-2 pr-1",children:t.length===0?L.jsxs("div",{className:"flex flex-col items-center justify-center h-48 text-center gap-2 text-slate-500",children:[L.jsx(Tx,{className:"w-8 h-8 stroke-1"}),L.jsx("p",{className:"text-xs",children:"No episodes recorded yet."})]}):t.map(g=>{const y=g.episode_index===e;return L.jsxs("div",{onClick:()=>n(g.episode_index),className:`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${y?"bg-indigo-600/20 border-indigo-500/80 shadow-lg shadow-indigo-500/10":"bg-slate-900/60 border-slate-800 hover:border-slate-700"}`,children:[L.jsxs("div",{className:"flex items-center justify-between",children:[L.jsxs("span",{className:"text-xs font-bold text-slate-200",children:["Episode #",g.episode_index]}),L.jsx("button",{onClick:R=>{R.stopPropagation(),r(g.episode_index)},className:"text-slate-500 hover:text-rose-400 p-1",children:L.jsx(Ox,{className:"w-3.5 h-3.5"})})]}),L.jsxs("div",{className:"text-[11px] text-slate-400 flex items-center gap-1",children:[L.jsx(Rx,{className:"w-3 h-3 text-indigo-400"}),L.jsx("span",{className:"truncate",children:g.task})]}),L.jsxs("div",{className:"flex items-center justify-between text-[10px] text-slate-500 font-mono",children:[L.jsxs("span",{children:[g.num_frames," frames (",g.fps," FPS)"]}),L.jsxs("span",{children:[(g.duration||0).toFixed(1),"s"]})]})]},g.episode_index)})})]})]})}function xw({onUploadSuccess:t}){const e=Re.useRef(null),[n,i]=Re.useState(!1),[r,s]=Re.useState(!1),[o,a]=Re.useState("draw 3d circle"),[l,c]=Re.useState(""),[f,h]=Re.useState("Point at ArUco marker on table"),[d,p]=Re.useState("00:00.0"),[x,_]=Re.useState([0,0,9.81]),[m,u]=Re.useState([0,0,0]),[v,g]=Re.useState(0),y=Re.useRef(null),R=Re.useRef([]),A=Re.useRef([]),C=Re.useRef(0),U=Re.useRef(0),M=Re.useRef(null),T=async()=>{if(typeof DeviceMotionEvent<"u"&&typeof DeviceMotionEvent.requestPermission=="function")try{await DeviceMotionEvent.requestPermission()}catch(P){console.log("Motion permission:",P)}try{const P={video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:!1},O=await navigator.mediaDevices.getUserMedia(P);e.current&&(e.current.srcObject=O,await e.current.play()),i(!0),h("Point at ArUco marker & press record"),W()}catch(P){console.error(P),h("Camera error: "+P.message)}},W=()=>{window.DeviceMotionEvent&&window.addEventListener("devicemotion",P=>{const O=P.accelerationIncludingGravity||P.acceleration||{x:0,y:0,z:9.81},X=P.rotationRate||{alpha:0,beta:0,gamma:0},Y=[O.x||0,O.y||0,O.z||9.81],D=[X.alpha||0,X.beta||0,X.gamma||0];if(_(Y),u(D),r){const F=performance.timeOrigin+performance.now(),k=(F-U.current)/1e3;A.current.push({timestamp:k,epoch_ms:F,accel:Y,gyro:D}),C.current+=1}}),setInterval(()=>{g(C.current),C.current=0},1e3)},q=()=>{if(!e.current||!e.current.srcObject)return;R.current=[],A.current=[],U.current=performance.timeOrigin+performance.now(),s(!0);let P="video/webm;codecs=vp8";MediaRecorder.isTypeSupported(P)||(P=MediaRecorder.isTypeSupported("video/mp4")?"video/mp4":"video/webm");const O=new MediaRecorder(e.current.srcObject,{mimeType:P});y.current=O,O.ondataavailable=X=>{X.data.size>0&&R.current.push(X.data)},O.start(30),h("Drawing 3D shape relative to marker..."),M.current=setInterval(()=>{const X=(performance.timeOrigin+performance.now()-U.current)/1e3,Y=Math.floor(X/60).toString().padStart(2,"0"),D=(X%60).toFixed(1).padStart(4,"0");p(`${Y}:${D}`)},100)},ie=async()=>{s(!1),clearInterval(M.current),h("Uploading raw sensor logs to server...");const P=y.current;P&&(P.stop(),P.onstop=async()=>{var k;const O=((k=R.current[0])==null?void 0:k.type)||"video/webm",X=O.includes("mp4")?".mp4":".webm",Y=new Blob(R.current,{type:O}),D=o==="custom"?l:o,F=new FormData;F.append("video",Y,`recording${X}`),F.append("imu_data",JSON.stringify(A.current)),F.append("task",D);try{h("⚙️ Server is calculating 3D Trajectory (Dual-ArUco PnP + EKF Fusion)...");const K=await(await fetch("/api/recordings/save",{method:"POST",body:F})).json();K.status==="success"?(h(`🎉 Server Saved Episode #${K.episode_index} (${K.num_frames} frames)!`),t&&t()):h("❌ Server error: "+(K.message||"Processing failed"))}catch($){console.error($),h("❌ Upload failed: "+$.message)}})};return L.jsxs("div",{className:"flex-1 flex flex-col h-[calc(100vh-60px)] relative overflow-hidden bg-black text-left",children:[L.jsxs("div",{className:"relative flex-1 bg-black flex items-center justify-center overflow-hidden",children:[L.jsx("video",{ref:e,autoPlay:!0,playsInline:!0,muted:!0,className:"w-full h-full object-cover"}),L.jsx("div",{className:"absolute w-40 h-40 border-2 border-dashed border-emerald-400/60 rounded-2xl pointer-events-none flex items-end justify-center pb-2",children:L.jsx("span",{className:"bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold",children:"ArUco Anchor"})}),!n&&L.jsxs("div",{className:"absolute inset-4 glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 z-20",children:[L.jsx(Ex,{className:"w-12 h-12 text-indigo-400"}),L.jsxs("div",{children:[L.jsx("h2",{className:"text-base font-bold text-slate-100",children:"🎯 ArUco 3D Trajectory Anchor"}),L.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Aim camera at printed Dual-ArUco board and record 3D motion in the air."})]}),L.jsx("button",{onClick:T,className:"px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30",children:"⚡ START CAMERA & IMU"})]}),L.jsxs("div",{className:"absolute top-3 left-3 right-3 flex justify-between pointer-events-none z-10",children:[L.jsxs("div",{className:"bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono flex items-center gap-2",children:[L.jsx("span",{className:`w-2.5 h-2.5 rounded-full ${r?"bg-rose-500 animate-pulse":"bg-slate-500"}`}),L.jsx("span",{className:"text-slate-200",children:d})]}),L.jsxs("div",{className:"bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono text-slate-300",children:["IMU: ",L.jsx("strong",{className:"text-indigo-400",children:v})," Hz"]})]}),L.jsxs("div",{className:"absolute bottom-3 left-3 right-3 flex justify-between pointer-events-none z-10 text-[10px] font-mono text-slate-400",children:[L.jsxs("div",{className:"bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800",children:["ACC: [",x[0].toFixed(1),", ",x[1].toFixed(1),", ",x[2].toFixed(1),"]"]}),L.jsxs("div",{className:"bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800",children:["GYR: [",m[0].toFixed(1),", ",m[1].toFixed(1),", ",m[2].toFixed(1),"]"]})]})]}),L.jsxs("div",{className:"glass-card p-4 flex flex-col gap-3 z-20 border-t border-slate-800",children:[L.jsxs("div",{className:"flex gap-2",children:[L.jsxs("select",{value:o,onChange:P=>a(P.target.value),className:"flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 outline-none",children:[L.jsx("option",{value:"draw 3d circle",children:"draw 3d circle"}),L.jsx("option",{value:"reach to apple",children:"reach to apple"}),L.jsx("option",{value:"reach to banana",children:"reach to banana"}),L.jsx("option",{value:"pick up cup",children:"pick up cup"}),L.jsx("option",{value:"custom",children:"Custom..."})]}),o==="custom"&&L.jsx("input",{type:"text",placeholder:"Enter task...",value:l,onChange:P=>c(P.target.value),className:"flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"})]}),L.jsxs("button",{onClick:r?ie:q,disabled:!n,className:`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 ${r?"bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-900/50":"bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/30"}`,children:[L.jsx(Dx,{className:"w-5 h-5"}),L.jsx("span",{children:r?"STOP RECORDING":"START RECORDING"})]}),L.jsx("p",{className:"text-[11px] text-center text-slate-400 font-medium",children:f})]})]})}function yw({isOpen:t,onClose:e,activeEpisodeIndex:n,onReprocessComplete:i}){const[r,s]=Re.useState({q_vel:.01,r_pos_dual:.001,r_pos_single:.004,q_gyro:.001}),[o,a]=Re.useState({}),[l,c]=Re.useState(!0),[f,h]=Re.useState(!1);if(Re.useEffect(()=>{t&&fetch("/api/ekf/params").then(_=>_.json()).then(_=>{_.params&&s(_.params),_.presets&&a(_.presets)}).catch(console.error)},[t]),!t)return null;const d=(_,m)=>{const u={...r,[_]:parseFloat(m)};s(u),fetch("/api/ekf/params",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)}).then(()=>{l&&n>=0&&x()})},p=_=>{const m=o[_];m&&(s(m),fetch("/api/ekf/params",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(m)}).then(()=>{n>=0&&x()}))},x=async()=>{if(!(n<0)){h(!0);try{const m=await(await fetch(`/api/episodes/${n}/reprocess`,{method:"POST"})).json();m.status==="success"&&i&&i(m.poses)}catch(_){console.error(_)}finally{h(!1)}}};return L.jsx("div",{className:"fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4",children:L.jsxs("div",{className:"bg-slate-900 border border-slate-700/70 w-full max-w-xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-left",children:[L.jsxs("div",{className:"flex items-center justify-between",children:[L.jsxs("div",{className:"flex items-center gap-2",children:[L.jsx("div",{className:"p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400",children:L.jsx(t0,{className:"w-5 h-5"})}),L.jsxs("div",{children:[L.jsx("h2",{className:"text-base font-bold text-slate-100",children:"⚙️ Extended Kalman Filter (EKF) Tuning"}),L.jsx("p",{className:"text-xs text-slate-400",children:"12-State Visual-Inertial Fusion Parameters"})]})]}),L.jsx("button",{onClick:e,className:"p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800",children:L.jsx(zx,{className:"w-5 h-5"})})]}),L.jsxs("div",{children:[L.jsx("label",{className:"text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2",children:"Tuning Presets"}),L.jsxs("div",{className:"grid grid-cols-3 gap-2",children:[L.jsxs("button",{onClick:()=>p("balanced"),className:"py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-indigo-500 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-all",children:[L.jsx(Ux,{className:"w-3.5 h-3.5 text-indigo-400"}),L.jsx("span",{children:"Balanced"})]}),L.jsxs("button",{onClick:()=>p("smooth"),className:"py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-emerald-500 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-all",children:[L.jsx(Fx,{className:"w-3.5 h-3.5 text-emerald-400"}),L.jsx("span",{children:"Smooth"})]}),L.jsxs("button",{onClick:()=>p("agile"),className:"py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-amber-500 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-all",children:[L.jsx(n0,{className:"w-3.5 h-3.5 text-amber-400"}),L.jsx("span",{children:"Agile"})]})]})]}),L.jsxs("div",{className:"flex flex-col gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800",children:[L.jsxs("div",{children:[L.jsxs("div",{className:"flex justify-between text-xs font-medium mb-1",children:[L.jsx("span",{className:"text-slate-200",children:"⚡ Velocity Dynamics (Q_vel)"}),L.jsx("span",{className:"font-mono text-sky-400",children:r.q_vel.toFixed(4)})]}),L.jsx("input",{type:"range",min:"0.0005",max:"0.08",step:"0.0005",value:r.q_vel,onChange:_=>d("q_vel",_.target.value),className:"w-full accent-sky-400 cursor-pointer"}),L.jsx("p",{className:"text-[10px] text-slate-500 mt-0.5",children:"Higher = rapid responsiveness to jerks; Lower = heavy velocity damping."})]}),L.jsxs("div",{children:[L.jsxs("div",{className:"flex justify-between text-xs font-medium mb-1",children:[L.jsx("span",{className:"text-slate-200",children:"🎯 Dual-Tag Position Error (R_dual)"}),L.jsxs("span",{className:"font-mono text-sky-400",children:[(r.r_pos_dual*1e3).toFixed(1)," mm"]})]}),L.jsx("input",{type:"range",min:"0.1",max:"5.0",step:"0.1",value:r.r_pos_dual*1e3,onChange:_=>d("r_pos_dual",_.target.value/1e3),className:"w-full accent-sky-400 cursor-pointer"}),L.jsx("p",{className:"text-[10px] text-slate-500 mt-0.5",children:"Expected 8-point measurement noise in mm (Lower = tighter camera lock)."})]}),L.jsxs("div",{children:[L.jsxs("div",{className:"flex justify-between text-xs font-medium mb-1",children:[L.jsx("span",{className:"text-slate-200",children:"📐 Single-Tag Position Error (R_single)"}),L.jsxs("span",{className:"font-mono text-sky-400",children:[(r.r_pos_single*1e3).toFixed(1)," mm"]})]}),L.jsx("input",{type:"range",min:"0.5",max:"15.0",step:"0.5",value:r.r_pos_single*1e3,onChange:_=>d("r_pos_single",_.target.value/1e3),className:"w-full accent-sky-400 cursor-pointer"}),L.jsx("p",{className:"text-[10px] text-slate-500 mt-0.5",children:"Expected 4-point measurement noise when only 1 marker is visible."})]}),L.jsxs("div",{children:[L.jsxs("div",{className:"flex justify-between text-xs font-medium mb-1",children:[L.jsx("span",{className:"text-slate-200",children:"🔄 Gyroscope Trust (Q_gyro)"}),L.jsx("span",{className:"font-mono text-sky-400",children:r.q_gyro.toFixed(4)})]}),L.jsx("input",{type:"range",min:"0.0001",max:"0.01",step:"0.0001",value:r.q_gyro,onChange:_=>d("q_gyro",_.target.value),className:"w-full accent-sky-400 cursor-pointer"}),L.jsx("p",{className:"text-[10px] text-slate-500 mt-0.5",children:"Controls orientation propagation rate from IMU gyroscope."})]})]}),L.jsxs("div",{className:"flex items-center justify-between pt-2",children:[L.jsxs("label",{className:"text-xs text-slate-400 flex items-center gap-2 cursor-pointer",children:[L.jsx("input",{type:"checkbox",checked:l,onChange:_=>c(_.target.checked),className:"accent-sky-400 rounded"}),L.jsx("span",{children:"Live Re-Filter active episode on slider change"})]}),L.jsxs("div",{className:"flex gap-2",children:[L.jsxs("button",{onClick:x,disabled:f||n<0,className:"px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 disabled:opacity-50",children:[L.jsx(e0,{className:`w-3.5 h-3.5 ${f?"animate-spin":""}`}),L.jsx("span",{children:f?"Filtering...":"Re-Filter Now"})]}),L.jsx("button",{onClick:e,className:"px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700",children:"Close"})]})]})]})})}function Sw(){const[t,e]=Re.useState("dashboard"),[n,i]=Re.useState([]),[r,s]=Re.useState(-1),[o,a]=Re.useState(!1),l=async()=>{try{const _=await(await fetch("/api/episodes")).json();i(_||[]),_&&_.length>0&&r===-1&&s(_[0].episode_index)}catch(x){console.error("Failed to fetch episodes",x)}};Re.useEffect(()=>{l()},[]);const c=async x=>{if(window.confirm(`Delete Episode #${x}?`))try{await fetch(`/api/episodes/${x}`,{method:"DELETE"}),l()}catch(_){console.error(_)}},f=async()=>{try{await fetch("/api/recordings/sample?shape=circle",{method:"POST"}),l()}catch(x){console.error(x)}},h=async()=>{try{const _=await(await fetch("/api/export_lerobot",{method:"POST"})).json();alert(`LeRobot Dataset Exported Successfully!

Path: ${_.export_path}
Total Episodes: ${_.total_episodes}`)}catch(x){console.error(x)}},d=async()=>{const x=r>=0?r:0;try{const m=await(await fetch(`/api/isaac_lab/replay?episode_index=${x}`,{method:"POST"})).json();alert(m.message||"Isaac Lab launched!")}catch(_){console.error(_)}},p=x=>{i(_=>_.map(m=>m.episode_index===r?{...m,poses:x}:m))};return L.jsxs("div",{className:"min-h-screen bg-[#060911] text-gray-100 flex flex-col font-sans",children:[L.jsx(Bx,{currentView:t,setCurrentView:e,onOpenEkfModal:()=>a(!0),onAddSample:f,onExportLeRobot:h,onIsaacReplay:d}),L.jsx("main",{className:"flex-1 flex flex-col overflow-hidden",children:t==="dashboard"?L.jsx(_w,{episodes:n,selectedEpIdx:r,setSelectedEpIdx:s,onRefreshEpisodes:l,onDeleteEpisode:c}):L.jsx(xw,{onUploadSuccess:l})}),L.jsx(yw,{isOpen:o,onClose:()=>a(!1),activeEpisodeIndex:r,onReprocessComplete:p})]})}jc.createRoot(document.getElementById("root")).render(L.jsx(cv.StrictMode,{children:L.jsx(Sw,{})}));
