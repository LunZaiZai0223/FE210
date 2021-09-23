if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// 環境變數的設定！？？？？？？？？？？？
// 我看還是先做 RWD XD

const getLang = require('./utils.js');
// 要打包套件的話就把套件用 npm 下載引用
const axios = require('axios');
const contentObj = require('./i18n/content.js');

const clientId = process.env.CLIENTID;
const OAuthToken = process.env.OAUTHTOKEN;
// const gameName = 'League of Legends';
const gameId = '21779';
const limit = 15;
let language = 'zh';
const getStremsApiUrl = 'https://api.twitch.tv/helix/streams';
const langBtn = document.querySelectorAll('button');
let idsArr = [];
let isLodding = false;
let paginationCursor;
console.log(contentObj.LOCAL_ID.TITLE);

const getStreamsConfig = {
  url: '/streams',
  method: 'GET',
  // 乾...我把物件跟陣列搞混了
  baseURL: 'https://api.twitch.tv/helix',
  headers: {
    'Authorization': OAuthToken,
    'client-id': clientId
  },
  params: {
    game_id: gameId,
    first: limit,
    language
  }
};

const getUsersConfig = {
  url: '/users',
  method: 'GET',
  baseURL: 'https://api.twitch.tv/helix',
  headers: {
    'Authorization': OAuthToken,
    'client-id': clientId
  },
  params: {
    id: idsArr
  }
};

// 原本放在元素 onclick 是拿全域變數，現在打包之後就不會在全域變數新增該函式
// 所以要分別 addEventListener
for (const b of langBtn) {
  b.addEventListener('click', (event) => {
    const lang = event.currentTarget.id;
    changeLang(lang);
  });
}

function changeLang (lang) {
  const title = document.querySelector('.changeLangBtnContainer .title h1');
  const list = document.querySelector('.list');
  title.textContent = getLang(lang, contentObj.LOCAL_ID.TITLE);
  console.log(getLang(lang));
  // 更新語言
  language = lang;
  getStreamsConfig.params.language = language;
  paginationCursor = '';
  // 把 list 內的元素淨空
  list.innerHTML = '';
  // 既然刪不掉該 key 就把 value 淨空，讓 Twitch 服務端沒辦法抓，所以丟的資料還是從 view_count 多 -> 少
  getStreamsConfig.params.after = paginationCursor;
  getData(getStremsApiUrl);
}

const getData = (getStremsApiUrl) => {
  // axios 會回傳 Promise
  console.log(paginationCursor);
  axios.get(getStremsApiUrl, getStreamsConfig).then((result) => {
    const {
      data
    } = result;
    console.log(data.data);
    getUserid(data.data);
    paginationCursor = data.pagination.cursor;
    console.log(paginationCursor);
    createItemDiv(data.data);
    getUsersConfig.params.id = idsArr;
    console.log(getUsersConfig);
    return axios.get('https://api.twitch.tv/helix/users', getUsersConfig);
  }).then((result) => {
    const {
      data
    } = result;
    const rightData = reorderResponse(mapResponse(data.data));
    createAvatar(rightData);
    // 初始化
    idsArr = [];
    isLodding = false;
  }).catch((error) => {
    console.log(error);
  });
};

function getUserid (data) {
  for (const d of data) {
    idsArr.push(d.user_id);
  }
}

function createItemDiv (data) {
  const list = document.querySelector('.list');
  for (const d of data) {
    const itemDiv = document.createElement('div');
    let originalThumbnailUrl = d.thumbnail_url;
    originalThumbnailUrl = originalThumbnailUrl.replace('{width}x{height}', '320x180');
    itemDiv.innerHTML = `
         <div class=preview>
            <img src=${originalThumbnailUrl} onload=this.style.opacity=1;>
        </div>
        <div class=content>
            <div class=text>
                <h3>${d.title}</h3>
                <p>${d.user_name}</p>
            </div>
        </div>
         `;
    // 加上 class 及 推倒 listDiv 裡面
    itemDiv.classList.add('item');
    list.append(itemDiv);
  }
}

function createAvatar (data) {
  const contentDivs = document.querySelectorAll('.content');
  for (let i = contentDivs.length - data.length, j = 0; j < data.length; i++, j++) {
    const refNode = contentDivs[i].children[0];
    let originalProfileImageUrl = data[j].profile_image_url;
    originalProfileImageUrl = originalProfileImageUrl.replace('300x300', '50x50');
    // avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.innerHTML = `<img src=${originalProfileImageUrl}>`;
    avatarDiv.classList.add('avatar');
    // 找到 content 的子元素 textDiv，並推到它前面
    contentDivs[i].insertBefore(avatarDiv, refNode);
  }
}

function mapResponse (data) {
  const map = data.map(r => ({
    id: r.id,
    profile_image_url: r.profile_image_url
  }));
  return map;
}

function reorderResponse (map) {
  const isOrderedData = [];
  for (const data of map) {
    let indexNum;
    indexNum = idsArr.indexOf(data.id);
    isOrderedData[indexNum] = data;
  }
  return isOrderedData;
}

function getFurtherData () {
  isLodding = true;
  // 要滾輪抓資料的話再新增 params
  getStreamsConfig.params.after = paginationCursor;
  getData(getStremsApiUrl);
}

window.addEventListener('scroll', () => {
  const scrollable = Math.ceil(document.documentElement.scrollHeight - 200 - window.innerHeight);
  const scroll = Math.ceil(window.scrollY);
  if (scroll > scrollable) {
    if (!isLodding) {
    // 收到 response 前，網頁維持 list.innerHTML = ''
    // 這個短暫的空白時間(從''到塞滿)會讓 document.documentElement.scrollHeight = window.innerHeight
    // 造成又發送 request
      if (document.documentElement.scrollHeight === window.innerHeight) {
        return;
      } else {
        console.log('準備載入新資料');
        getFurtherData();
      }
    }
  }
});

getData(getStremsApiUrl);
