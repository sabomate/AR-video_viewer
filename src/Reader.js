import { storage, ref, getDownloadURL, listAll } from "./firebase.js";

// assetのビデオタグ要素
const video = document.getElementById("arVideo");
// ピン止め用ビデオ要素
const pinVideo = document.getElementById("pinVideo");
// ビデオのピンボタン
const VideoPinBtn = document.getElementById("VideoPinBtn");
const videoFrame = document.getElementById("videoFrame");

const guideUi = document.getElementById("guideUi");

// プレゼント開封のフラグ
let canOpenPresent = false;

// マーカー認識のフラグ
let isFindMarker = false;

let url = new URL(window.location.href);
let grade = url.searchParams.get("grade");
// Debug用
grade = grade == null ? "B4" : grade;

// URLからクエリパラメータを削除
history.replaceState("", "", url.pathname);

// 動画の参照リストの取得
let videoRefList = [];
const listRef = ref(storage, "videos/" + grade);
listAll(listRef)
  .then(async (res) => {
    res.items.forEach(async (itemRef, index) => {
      videoRefList.push(itemRef);
    });
  })
  .catch((error) => {
    console.error(`動画参照リストの取得に失敗しました: ${error}`);
  });

// ピン止めボタン
VideoPinBtn.addEventListener("click", () => {
  console.log("click pin btn");
  // 切り替え時にどちらか片方が表示されるようにする
  pinVideo.classList.toggle("hidden");
  // videoFrame.classList.toggle('hidden');
  videoFrame.setAttribute("visible", !videoFrame.getAttribute("visible"));
  console.log(pinVideo.classList);
  console.log(videoFrame.classList);

  // 表示されている方を再生する
  if (!pinVideo.classList.contains("hidden")) {
    video.pause();
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
function handleTap() {
  if (!canOpenPresent && isFindMarker) {
    document.getElementById("thumbnailText").setAttribute("visible", false);
    document.getElementById("gift_box").setAttribute("visible", false);
    document.getElementById("videoFrame").setAttribute("visible", true);
    changeNextVideoBtn.classList.toggle("hidden");
    changePreviousVideoBtn.classList.toggle("hidden");
    VideoPinBtn.classList.toggle("hidden");
    canOpenPresent = true;
    video.play();
  }
  video.play();
}

const isTouchable =
  "ontouchstart" in window ||
  (window.DocumentTouch && document instanceof DocumentTouch);

if (isTouchable) {
  window.addEventListener("touchstart", handleTap);
} else {
  window.addEventListener("click", handleTap);
}

// 次の動画ボタン
const changeNextVideoBtn = document.getElementById("changeNextVideoBtn");
changeNextVideoBtn.addEventListener("click", () => {
  videoIndex = (videoIndex + 1) % videoRefList.length;
  getDownloadURL(videoRefList[videoIndex])
    .then((url) => {
      pinVideo.src = url;
      video.src = url;
      // 表示されている方を再生する
      if (!pinVideo.classList.contains("hidden")) {
        pinVideo.play();
        console.log("pin video on");
      } else {
        video.play();
        console.log("ar video on");
      }
    })
    .catch((error) => {
      console.error(`動画URLの取得に失敗しました: ${error}`);
    });
});

// 前の動画ボタン
const changePreviousVideoBtn = document.getElementById(
  "changePreviousVideoBtn"
);
changePreviousVideoBtn.addEventListener("click", () => {
  videoIndex = (videoIndex - 1 + videoRefList.length) % videoRefList.length;
  getDownloadURL(videoRefList[videoIndex])
    .then((url) => {
      pinVideo.src = url;
      video.src = url;
      // 表示されている方を再生する
      if (!pinVideo.classList.contains("hidden")) {
        pinVideo.play();
        console.log("pin video on");
      } else {
        video.play();
        console.log("ar video on");
      }
    })
    .catch((error) => {
      console.error(`動画URLの取得に失敗しました: ${error}`);
    });
});

const nft = document.getElementById("nft");
// marker発見時のイベント
nft.addEventListener("markerFound", () => {
  console.log("nft markerFound");
  guideUi.classList.add("hidden");
  getDownloadURL(videoRefList[videoIndex]).then((url) => {
    pinVideo.src = url;
    video.src = url;
  });
  playVideBtn.classList.remove("hidden");
  isFindMarker = true;

  if (canOpenPresent) {
    changeNextVideoBtn.classList.toggle("hidden");
    changePreviousVideoBtn.classList.toggle("hidden");
    VideoPinBtn.classList.toggle("hidden");
  }
});

// marker消失時のイベント
nft.addEventListener("markerLost", () => {
  console.log("nft markerLost");
  // 再生制御
  video.pause();
  pinVideo.pause();

  // UI制御
  playVideBtn.classList.add("hidden");
  isFindMarker = false;

  if (canOpenPresent) {
    changeNextVideoBtn.classList.toggle("hidden");
    changePreviousVideoBtn.classList.toggle("hidden");
    VideoPinBtn.classList.toggle("hidden");
  }
});
