// Twitch API

const clientId = 'v4cbdvjc8zf6pj6mrogkycdx0h51z0';
const clientSecret = '3f9vav3u6iqdakjzx5668si7itdcfp';
const OAuthToken = 'Bearer 6enwr0jv7bz7r9jc1lzenekqckxq7z';
const gameName = 'League of Legends';
const gameId = '21779';
const limit = 12;
const getStremsApiUrl = 'https://api.twitch.tv/helix/streams';
const getStremsApiUrlQueries = `?game_id=${gameId}&first=${limit}`;
const getUserApiUrl = 'https://api.twitch.tv/helix/users';
const getUserApiQueries = `?id=`;

// 阻擋滑輪一次發出過多 requests
let isLodding = false;

// pagination key 
let cursor = '';
let getStremsApiUrlQueryAfter = `&after=${cursor}`;

// 只有 user_id，用來整理大頭貼的順序
let pureUserIdInOrder = [];

function createItemDiv(data) {
    const list = document.querySelector('.list');
    for (let d of data) {
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
    // 太多東西的話其實只要知道 HTML 架構就可以用 element.innerHTML 直接新增
    // data.forEach(r => {
    //     //list - item - preview, content 
    //     //               <img>  | avatar - <img>, text - <h3>, <p>

    //     const preivewDiv = document.createElement('div');
    //     const contentDiv = document.createElement('div');
    //     const textDiv = document.createElement('div');

    //     // preivewDiv
    //     //https://static-cdn.jtvnw.net/previews-ttv/live_user_faker-{width}x{height}.jpg
    //     //https://static-cdn.jtvnw.net/previews-ttv/live_user_faker-320x180.jpg

    //     preivewDiv.innerHTML = `<img src=${originalThumbnailUrl}>`;
    //     preivewDiv.classList.add('preview');
    //     itemDiv.append(preivewDiv);

    //     //text
    //     textDiv.innerHTML = `<h3>${r.title}</h3><p>${r.user_name}</p>`;
    //     textDiv.classList.add('text');
    //     contentDiv.append(textDiv);

    //     contentDiv.classList.add('content');

    //     itemDiv.append(contentDiv);
    //     itemDiv.classList.add('item');
    //     list.append(itemDiv);
    // });

    // 補上缺的空白，讓版面不會跑掉
    // if (data.length % 3 === 1) {
    //     const itemDiv = document.createElement('div');
    //     itemDiv.classList.add('item');
    //     list.append(itemDiv);
    // } else if (data.length % 3 === 2) {
    //     const itemDiv1 = document.createElement('div');
    //     const itemDiv2 = document.createElement('div');
    //     itemDiv1.classList.add('item');
    //     itemDiv2.classList.add('item');
    //     list.append(itemDiv1, itemDiv2);
    // }
}


function createAvatar(data) {
    let contentDivs = document.querySelectorAll('.content');
    for (let i = contentDivs.length - limit, j = 0; i < contentDivs.length; i++, j++) {
        const refNode = contentDivs[i].children[0];
        let originalProfileImageUrl = data[j].profile_image_url;
        originalProfileImageUrl = originalProfileImageUrl.replace('300x300', '50x50');
        //avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.innerHTML = `<img src=${originalProfileImageUrl}>`;
        avatarDiv.classList.add('avatar');
        //找到 content 的子元素 textDiv，並推到它前面
        contentDivs[i].insertBefore(avatarDiv, refNode);
    }
}



// 每次 request 的 Url 都不同，因此把 Url 當作 argument，並附加 callback 處理會是比較好的方式
// - 回傳的 JSON 都會先被 data 包起來
// - 這樣子 getData 的任務就會變得很簡單：
//   - 原本：送請求、收請求、新增資料到 DOM
//   - 現在：送請求、收請求(把結果傳到 callback)。再依照不同的需求再 callback 中新增函式

// function getData(apiUrl, query, callback) {
//     const xhr = new XMLHttpRequest();
//     xhr.open('GET', apiUrl + query, true);
//     xhr.setRequestHeader('client-id', clientId);
//     xhr.setRequestHeader('Authorization', OAuthToken);
//     xhr.send();
//     xhr.onreadystatechange = function() {
//         if (xhr.readyState === 4 && xhr.status === 200) {
//             const result = JSON.parse(xhr.responseText);
//             // console.log(result);
//             //如果回傳的result有'pagination'才更新cursor
//             if (result.hasOwnProperty('pagination')) {
//                 cursor = result.pagination.cursor;
//             }
//             callback(undefined, result);
//         } else if (xhr.readyState === 4) {
//             callback('錯誤了喔', undefined);
//         }
//     };
// }

function getData(apiUrl, query) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl + query, true);
        xhr.setRequestHeader('client-id', clientId);
        xhr.setRequestHeader('Authorization', OAuthToken);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                // 接續取得資料 
                // 讓 Twitch Server 知道從下一頁給資料 (Get Streams => obj.pagination.cursor)
                if (result.hasOwnProperty('pagination')) {
                    cursor = result.pagination.cursor;
                }
                resolve(result);
                const userIdArrJoined = makeUserIdArr(result.data);
            } else if (xhr.readyState === 4) {
                reject('有錯誤');
            }
        };
    });
}

function makeUserIdArr(data) {
    let userIdArr = [];
    data.forEach(d => {
        userIdArr.push(d.user_id);
    });
    userIdArr = userIdArr.join('&id=');
    return userIdArr;
}

function getUserIdInOrder(data) {
    data.forEach(d => {
        pureUserIdInOrder.push(d.user_id);
    });
    console.log(pureUserIdInOrder);
}

// 重新整理 response 的資料，因為 id 沒有按照 request 的順序
// => 用發 request 的 user.id Arr 當作對應基準
// => arr.indexOf 取得 indexNum，再指定新 arr 為對應 indexNum 的資料
function sortUserIdAndPic(map) {
    let sorted = [];
    for (let i = 0; i < pureUserIdInOrder.length; i++) {
        let indexNum;
        indexNum = pureUserIdInOrder.indexOf(map[i].id);
        sorted[indexNum] = map[i];
    }
    console.log(sorted);
    //重整 => 避免後來的 user.id 會一直加進去
    pureUserIdInOrder = [];
    return sorted;
}

function mapUserIdArr(result){
    const map = result.data.map(d =>({
        id: d.id, profile_image_url: d.profile_image_url
    }));
    return map;
}

function getFurtherData() {
    isLodding = true;
    console.log(isLodding);
    getData(getStremsApiUrl, getStremsApiUrlQueries + `&after=${cursor}`).then(result => {
        console.log(result);
        createItemDiv(result.data);
        getUserIdInOrder(result.data);
        const userIdArrJoined = makeUserIdArr(result.data);
        return getData(getUserApiUrl, getUserApiQueries + userIdArrJoined);
    }).then(result => {
        console.log(result);
        const map = result.data.map(d => ({
            id: d.id,
            profile_image_url: d.profile_image_url
        }));
        // map 為回傳的 respones(未整理)
        console.log(map);
        let sortedData = sortUserIdAndPic(map);
        createAvatar(sortedData);
        // 可以再次載入資料了
        // => 載入完 DOM 就可以支援下次的請求
        isLodding = false;
        console.log(isLodding);
    }).catch((error) => {
        console.log(error);
    });
}

getData(getStremsApiUrl, getStremsApiUrlQueries).then((result) => {
    console.log(`資料獲取成功`);
    console.log(result);
    createItemDiv(result.data);
    getUserIdInOrder(result.data);
    const userIdArrJoined = makeUserIdArr(result.data);
    return getData(getUserApiUrl, getUserApiQueries + userIdArrJoined);
}).then(result => {
    console.log(result);
    const map = result.data.map(d => ({
        id: d.id,
        profile_image_url: d.profile_image_url
    }));
    const sortedData = sortUserIdAndPic(map);
    createAvatar(sortedData);
}).catch((error) => {
    console.log(error);
});

// getData(`https://api.twitch.tv/helix/streams`, `?game_id=${gameId}&first=${limit}`, (error, data) => {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log(data);
//         //擷取只擷取 user_id => data.data loop user_id
//         let testArr = [];
//         for (d of data.data) {
//             testArr.push(d.user_id);
//         }
//         console.log(testArr);
//         createItemDiv(data.data);
//         //為了多個 id query 將擷取出來的 array 變成中間以 `&id=` 隔開 (arr.join('&id=`))
//         const userIds = makeUserIdArr(data.data);
//         getData(`https://api.twitch.tv/helix/users`, `?id=${userIds}`, (error, data) => {
//             if (error) {
//                 console.log(error);
//             } else {
//                 console.log(`https://api.twitch.tv/helix/users?id=${userIds}`);
//                 let testOne = [];
//                 // for(d of data.data) {
//                 //     testOne.push({d.id, d.profile_image_url});
//                 // }
//                 console.log(testOne);
//                 console.log(data.data);
//                 // const pic = req.files.map(x => ({ url: x.path, filename: x.filename }));
//                 const map1 = data.data.map(d => ({
//                     id: d.id,
//                     profile_image_url: d.profile_image_url
//                 }));
//                 console.log(map1);
//                 console.log(testArr);
//                 //發現是回傳的 response 沒按照 request 的 id 順序
//                 //重整回傳 response 資料
//                 // => arr.map 直接建立只有 [{id, picurl}, {id, picurl}...] 的 array
//                 // => 重新編排順序 (未 id= 的 array.indexOf(arr.map))
//                 // => 根據未 id= 的 array 的 indexNum 重新編排 array 再丟給新增 avatar 的 function
//                 let newArr = [];
//                 for (let i = 0; i < testArr.length; i++) {
//                     let x;
//                     x = testArr.indexOf(map1[i].id);
//                     newArr[x] = map1[i];
//                 }
//                 console.log(newArr);
//                 createAvatar(newArr);
//             }
//         });
//     }
// });
// let isLodding = true;

// function getFurtherData() {
//     isLodding = true;
//     console.log('一直載入耶');
//     console.log(`isLodding: ${isLodding}`);
//     getData(`https://api.twitch.tv/helix/streams?game_id=${gameId}&first=${limit}`, `&after=${cursor}`, (error, data) => {
//         if (error) {
//             console.log(error);
//         } else {
//             console.log(data);
//             //一樣來整理arr資料
//             let newArr2 = [];
//             for (let d of data.data) {
//                 newArr2.push(d.user_id);
//             }
//             console.log(newArr2);
//             createItemDiv(data.data);
//             isLodding = false;
//             console.log(`isLodding: ${isLodding}`);
//             const userIds = makeUserIdArr(data.data);
//             getData(`https://api.twitch.tv/helix/users`, `?id=${userIds}`, (error, data) => {
//                 if (error) {
//                     console.log(error);
//                 } else {
//                     console.log(data);
//                     const map2 = data.data.map(d => ({
//                         id: d.id,
//                         profile_image_url: d.profile_image_url
//                     }));
//                     let newArr3 = [];
//                     for (let i = 0; i < map2.length; i++) {
//                         let x;
//                         x = newArr2.indexOf(map2[i].id);
//                         newArr3[x] = map2[i];
//                     }
//                     console.log(newArr3);
//                     createAvatar(newArr3);
//                 }
//             });
//         }
//     });
// }

window.addEventListener('scroll', (event) => {
    //document.documentElement => html 元素標籤
    //document.documentElement.scrollHeight => html 的 height
    //window.innerHeight => 瀏覽器視窗的高度(扣掉上層的選單!)
    //確認是不是到底了 => 要先跟 JS 說總共可以滾多少 + 目前滾到哪裡 => 提供判斷是不是真的到底了(目前到哪 = 可以滾多少的值)
    //因為超過 window.innerHTML 才要滾，所以 document.documentElement.scrollHeight(HTML 的高) - window.innerHeight(瀏覽器視窗能放多少) = 在視窗外的，要用滾輪的區域
    // Math.ceil 無條件進位
    const scrollable = Math.ceil(document.documentElement.scrollHeight - 500 - window.innerHeight);
    // window.scrollY => 使用者實際轉了多少px
    const scrolled = window.scrollY;
    // console.log(`window.innerHeight: ${window.innerHeight}`);
    // console.log(`目前滾了: ${scrolled}`);
    // console.log(`可以滾的範圍: ${scrollable}`);
    if (Math.ceil(scrolled) >= scrollable) {
        if (!isLodding) {
            console.log(`isLodding: ${isLodding}`);
            getFurtherData();
            console.log(`isLodding: ${isLodding}`);
        }
        // getData(`https://api.twitch.tv/helix/streams?game_id=${gameId}&first=${limit}`, `&after=${cursor}`, (error, data) => {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         // console.log(data);
        //         console.log('bottom');
        //         createItemDiv(data.data);
        // const userIds = makeUserIdArr(data.data);
        // getData(`https://api.twitch.tv/helix/users`, `?id=${userIds}`, (error, data) => {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log(data);
        //         createAvatar(data.data);
        //     }
        // });
    }
    // });
    // }
});

// 如果頁面符合 window.innerHeight, 就不用滾

// body.addEventListener('scroll', function(event) {
//     var element = event.target;
//     console.log(element);
//     console.log('有在轉了');
//     console.log(element.scrollHeight, element.scrollTop, element.clientHeight);
//     if (element.scrollHeight - element.scrollTop === element.clientHeight); {
//         console.log('scrolled');
//     }
// });
// 有了雛形就可以思考怎麼樣可以優化函式，盡可能的讓每個函式只做一件事情

// function getStreams(queryString, callback) {
//     const apiUrl = 'https://api.twitch.tv/helix/streams';
//     const clientId = 'v4cbdvjc8zf6pj6mrogkycdx0h51z0';
//     const OAuthToken = 'Bearer 6enwr0jv7bz7r9jc1lzenekqckxq7z';
//     const xhr = new XMLHttpRequest();
//     xhr.open('GET', apiUrl + queryString, true);
//     xhr.setRequestHeader('client-id', clientId);
//     xhr.setRequestHeader('Authorization', OAuthToken);
//     xhr.send();
//     xhr.onload = function(){
//         let result = JSON.parse(xhr.responseText).data;
//         createItemDiv(result);
//         result.forEach(data => {
//             userIdArr.push(data.user_id);
//         });
//         console.log(result);
//         userIdArr = userIdArr.join('&id=');
//         getUsersDetails = `https://api.twitch.tv/helix/users?id=${userIdArr}`;
//         callback(getUsersDetails);
//     };
// }

// function getUsersID(apiUrl){
//     const clientId = 'v4cbdvjc8zf6pj6mrogkycdx0h51z0';
//     const OAuthToken = 'Bearer 6enwr0jv7bz7r9jc1lzenekqckxq7z';
//     const xhr = new XMLHttpRequest();
//     xhr.open('GET', apiUrl, true);
//     xhr.setRequestHeader('client-id', clientId);
//     xhr.setRequestHeader('Authorization', OAuthToken);
//     xhr.send();
//     xhr.onload = function(){
//         let result = JSON.parse(xhr.responseText).data;
//         createAvatar(result);
//         console.log(result);
//     };
// }

// function testCallbackFun(result){
//     console.log(result.length);
//     result.forEach(data =>{
//         console.log(data);
//     });
// }

// getStreams('?game_id=21779&?first=30', getUsersID);

// let xhr = new XMLHttpRequest();
// xhr.open('GET', `https://api.twitch.tv/helix/streams?game_id=21779&?first=20`, true);

// //因為文件說 Get Streams 需要 client-id 以及 Authorization
// //用 xhr.setRequestHeader(header, value)，設定我的 HTTP 請求頭，
// //告訴 Twitch Api 的服務端他所需要的資料，這樣子我就可以得到我的資料..
// //註：xhr.setRequestHeader 必須在 xhr.open 之後， xhr.send 之前
// xhr.setRequestHeader('client-id', clientId);
// xhr.setRequestHeader('Authorization', OAuthToken);
// // xhr.setRequestHeader('game_id', '511224');

// //如果 xhr.readyState 屬性改變時，就會叫用該方法
// xhr.onreadystatechange = function() {
//     if (xhr.readyState === 4) {
//         console.log(`xhr請求:`, xhr);
//         const result = JSON.parse(this.responseText);
//         const { data } = result;
//         console.log(data);

//         for(let i = 0; i < data.length; i++) {
//             console.log(data[i].user_id);
//             userIdArr.push(data[i].user_id);
//         }
//         createItemDiv(data);
//         console.log(userIdArr);
//     }
// };
// xhr.send(null);