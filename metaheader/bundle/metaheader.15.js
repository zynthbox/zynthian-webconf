(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{418:function(n,e,t){"use strict";t.r(e);var o=t(26),c=t.n(o),a=t(36),s=t.n(a),r=t(1),i=t.n(r),p=t(27),u=t.n(p),h=t(0),l=t.n(h);e.default=function(n){console.log(n,"props pattern editor");var e=["a","b","c","d","e","f","g","h","i","j"],t=n.trackIndex,o=Object(h.useState)([]),a=i()(o,2),r=a[0],p=a[1];return console.log(r,"patterns"),Object(h.useEffect)((function(){!function n(o,a){var r=o||0,i=a?s()(a):[],h=e[t],l="/home/pi/zynthian-my-data/sketches/my-sketches/temp/sequences/scene-".concat(h,"/patterns/scene-").concat(h,"-").concat(r+1,".pattern.json");console.log(l,"pattern path"),fetch("http://".concat(window.location.hostname,":3000/json/").concat(l.split("/").join("+++")),{method:"GET",headers:{"Content-Type":"application/json"}}).catch((function(n){console.log(n,"error")})).then(function(){var e=c()(u.a.mark((function e(t){var o;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(500!==t.status){e.next=4;break}console.log("ERROR"),e.next=8;break;case 4:return e.next=6,t.json();case 6:(o=e.sent)&&!0===o.hasNotes&&(o.name="scene-".concat(h,"-").concat(r),console.log(JSON.parse(o.notes)),i.push(o));case 8:r+1>=10?p(i):n(r+1,i);case 9:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}())}()}),[]),l.a.createElement("div",{id:"pattern-editor-container"})}}}]);