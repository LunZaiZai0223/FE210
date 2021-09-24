const i18n = require('../i18n/i18n.js');

function getLang (lang, id) {
  return i18n[lang][id];
}

module.exports = getLang;

// 如果一次多個變數&函式要輸出，就用物件的方式
// module.exports = { getLang, variable1, variable2 ...}
// = module.exports = { getLang: getLang, variable1: variable1, variable2: variable1 ...}
// 但接收的時候要記得 { } 解構，因為我們要的東西在 key 裡
// https://ithelp.ithome.com.tw/articles/10188007
