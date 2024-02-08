import { storage, ref, getDownloadURL, listAll} from "./firebase.js";

// assetのビデオタグ要素
const video = document.getElementById('arVideo');
// ピン止め用ビデオ要素
const pinVideo = document.getElementById("pinVideo");
// ビデオのピンボタン
const  VideoPinBtn = document.getElementById('VideoPinBtn');
const videoFrame = document.getElementById("videoFrame");

// プレゼント開封のフラグ
let startBtnFlag = false;

// マーカー認識のフラグ
let markerLoadFlag = false;

// Firebase Storageから動画をダウンロード
const videoUrlArr = []

let url = new URL(window.location.href);

let grade = url.searchParams.get("grade");
// Debug用
grade = (grade == null) ? 'M1' : grade;

// URLからクエリパラメータを削除
history.replaceState('', '', url.pathname);

const listRef = ref(storage, 'videos/' + grade);
listAll(listRef)
  .then((res) => {
    res.items.forEach((itemRef,index) => {
      getDownloadURL(itemRef).then((url) => {
        console.log(index + " " +url);
        videoUrlArr.push(url);
        if (index == 0){
          video.src = url;
          pinVideo.src = url;
        }
      }).catch((error) => {
        console.error(`動画のダウンロードに失敗しました: ${error}`);
      });
    });
  }).catch((error) => {
    console.error(`動画のダウンロードに失敗しました: ${error}`);
  });

VideoPinBtn.addEventListener('click', () => {
  console.log("click pin btn")
  // 切り替え時にどちらか片方が表示されるようにする
  pinVideo.classList.toggle('hidden');
  // videoFrame.classList.toggle('hidden');
  videoFrame.setAttribute("visible", !videoFrame.getAttribute("visible"));
  console.log(pinVideo.classList);
  console.log(videoFrame.classList);

  // 表示されている方を再生する
  if (!pinVideo.classList.contains('hidden')) {
    video.pause()
    pinVideo.play();
    console.log("pin video on");
  } else {
    pinVideo.pause();
    video.play();
    console.log("ar video on");
  }
});

let videoIndex = 0;

// プレゼント開封で動画の再生開始
const isTouchable = "ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch);
if (isTouchable) {
  window.addEventListener('touchstart', () => {
    console.log("tap!");
    if (!startBtnFlag){
      if (markerLoadFlag){
        console.log("tap!");
        document.getElementById("thumbnailText").setAttribute("visible", false)
        document.getElementById("gift_box").setAttribute("visible", false)
        document.getElementById("videoFrame").setAttribute("visible", true)
        changeNextVideoBtn.classList.toggle('hidden');
        changePreviousVideoBtn.classList.toggle('hidden');
        VideoPinBtn.classList.toggle('hidden');
        startBtnFlag = true;
        video.play();
      }
    }
  });
} else {
  window.addEventListener('click', () => {
    console.log("click!");
    if (!startBtnFlag){
      if (markerLoadFlag){
        document.getElementById("thumbnailText").setAttribute("visible", false)
        document.getElementById("gift_box").setAttribute("visible", false)
        document.getElementById("videoFrame").setAttribute("visible", true)
        changeNextVideoBtn.classList.toggle('hidden');
        changePreviousVideoBtn.classList.toggle('hidden');
        VideoPinBtn.classList.toggle('hidden');
        startBtnFlag = true;
        video.play();
      }
    }
  });
}

// 次の動画ボタン
const  changeNextVideoBtn = document.getElementById('changeNextVideoBtn');
changeNextVideoBtn.addEventListener('click', () => {
  videoIndex = (videoIndex + 1) % videoUrlArr.length;
  console.log('changeNextVideoBtn click' + videoIndex + ' ' + videoUrlArr[videoIndex]);
  pinVideo.src = videoUrlArr[videoIndex];
  video.src = videoUrlArr[videoIndex];
  // 表示されている方を再生する
  if (!pinVideo.classList.contains('hidden')) {
    pinVideo.play();
    console.log("pin video on");
  } else {
    video.play();
    console.log("ar video on");
  }
  // video.play();
});

// 前の動画ボタン
const  changePreviousVideoBtn = document.getElementById('changePreviousVideoBtn');
changePreviousVideoBtn.addEventListener('click', () => {
  videoIndex = (videoIndex - 1 + videoUrlArr.length) % videoUrlArr.length;
  console.log('changePreviousVideoBtn click' + videoIndex + ' ' + videoUrlArr[videoIndex]);
  pinVideo.src = videoUrlArr[videoIndex];
  video.src = videoUrlArr[videoIndex];
  // 表示されている方を再生する
  if (!pinVideo.classList.contains('hidden')) {
    pinVideo.play();
    console.log("pin video on");
  } else {
    video.play();
    console.log("ar video on");
  }
  // video.play();
});

const nft = document.getElementById('nft');
// marker発見時のイベント
nft.addEventListener('markerFound', () => {
  console.log('nft markerFound');
  video.src = videoUrlArr[videoIndex];
  pinVideo.src = videoUrlArr[videoIndex];
  // playVideBtn.classList.remove('hidden');
  // マーカー認識時
  markerLoadFlag = true;
  console.log(markerLoadFlag)
  if (startBtnFlag) {
    changeNextVideoBtn.classList.toggle('hidden');
    changePreviousVideoBtn.classList.toggle('hidden');
    VideoPinBtn.classList.toggle('hidden');
  }
});

// marker消失時のイベント
nft.addEventListener('markerLost', () => {
  console.log('nft markerLost');
  // playVideBtn.classList.add('hidden');
  // マーカー非認識時
  markerLoadFlag = false;
  console.log(markerLoadFlag)
  if (startBtnFlag) {
    changeNextVideoBtn.classList.toggle('hidden');
    changePreviousVideoBtn.classList.toggle('hidden');
    VideoPinBtn.classList.toggle('hidden');
  }
});