(()=>{"use strict";chrome.runtime.onInstalled.addListener((()=>{chrome.storage.local.get(["hotlinks","todolist","theme"],(e=>{e.hotlinks||chrome.storage.local.set({hotlinks:[]}),e.todolist||chrome.storage.local.set({todolist:[]}),e.theme||chrome.storage.local.set({theme:"daybreakBlue"})}))})),chrome.runtime.onMessage.addListener(((e,t,o)=>"getData"===e.action?(chrome.storage.local.get(["hotlinks","todolist","theme"],(e=>{o(e)})),!0):"saveData"===e.action?(chrome.storage.local.set({[e.dataType]:e.data},(()=>{o({success:!0})})),!0):void 0))})();