import { storage, ref, getDownloadURL, listAll } from "./firebase.js";

// assetのビデオタグ要素
const video = document.getElementById("arVideo");
const arVideoFrame = document.getElementById("videoFrame");
// ピン止め用ビデオ要素
const pinVideoFrame = document.getElementById("pinVideo");
const playPinVideBtn = document.getElementById("playPinVideBtn");
// ビデオのview切り替えボタン
const changeViewBtn = document.getElementById("changeViewBtn");

const guideUi = document.getElementById("guideUi");

// 状態列挙
const viewStates = {
  isArView: "ArView",
  isPinView: "pinView",
};

// 現在の状態
let currentViewState = viewStates.isArView;

// プレゼント開封のフラグ
// TODO: 意味が逆な気がする
let canOpenPresent = false;

// マーカー認識のフラグ
let isFindMarker = false;

let url = new URL(window.location.href);
let grade = url.searchParams.get("grade");
let personal = url.searchParams.get("personal");

// Debug用
grade = grade == null ? "B4" : grade;

// URLからクエリパラメータを削除
history.replaceState("", "", url.pathname);

// 異なるプラットフォームに対応した位置調整
function adjustPositionForPlatform() {
  var thumnailText = document.getElementById('thumbnailText');
  var giftBox = document.getElementById('gift_box');
  var videoFrame = document.getElementById('videoFrame');

  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight;
  console.log("画面サイズ：", screenWidth, screenHeight)

  // iOSの場合の位置調整
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      console.log("IOS")
      thumnailText.setAttribute('position', '50 -132 -50');
      giftBox.setAttribute('position', '180 -130 120');
      videoFrame.setAttribute('position', '180 55 150');
  }
  // Androidの場合の位置調整
  else if (/Android/.test(navigator.userAgent)) {
      console.log("android OS")
      thumnailText.setAttribute('position', '20 2 -400');
      giftBox.setAttribute('position', '150 100 -200');
      videoFrame.setAttribute('position', '150 155 -300');
  }
  // それ以外（PCなど）の場合の位置調整
  else {
      console.log("else OS")
      thumnailText.setAttribute('position', '150 2 -250');
      giftBox.setAttribute('position', '300 100 -100');
      videoFrame.setAttribute('position', '300 105 -100');
  }
}

// ページ読み込み時に位置調整を行う
window.onload = adjustPositionForPlatform;


// 動画の参照リストの取得
let videoRefList = [];
let videoIndex = 0;
const listRef = ref(storage, "videos/" + grade);
listAll(listRef)
  .then((res) => {
    res.items.forEach((itemRef, index) => {
      videoRefList.push(itemRef);
    });
  })
  .catch((error) => {
    console.error(`動画参照リストの取得に失敗しました: ${error}`);
  });

if (personal != null) {
  const personalListRef = ref(storage, "videos/personals/" + personal);
  listAll(personalListRef)
    .then((res) => {
      let personalVideoRefList = [];
      res.items.forEach((itemRef, index) => {
        personalVideoRefList.push(itemRef);
      });
      videoRefList = videoRefList.concat(personalVideoRefList);
    })
    .catch((error) => {
      console.error(`動画参照リストの取得に失敗しました: ${error}`);
    });
}


// ViewModeの切り替えボタン
changeViewBtn.addEventListener("click", () => {
  // viewModeの切り替え
  changeViewMode();

  // 表示されている方を再生する
  if (currentViewState === viewStates.isPinView) {
    // Pin
    video.pause();
    console.log("pin video on");
  } else {
    // AR
    pinVideoFrame.pause();
    if (isFindMarker) video.play();
    console.log("ar video on");
  }
});

// プレゼント開封で動画の再生開始
function handleTap() {
  if (!canOpenPresent && isFindMarker) {
    document.getElementById("thumbnailText").setAttribute("visible", false);
    document.getElementById("gift_box").setAttribute("visible", false);
    document.getElementById("videoFrame").setAttribute("visible", true);
    changeNextVideoBtn.classList.toggle("hidden");
    changePreviousVideoBtn.classList.toggle("hidden");
    changeViewBtn.classList.toggle("hidden");
    canOpenPresent = true;
    getDownloadURL(videoRefList[videoIndex]).then((url) => {
      console.log("set url:" + url);
      pinVideoFrame.src = url;
      video.src = url;
      // TODO: 時々DOMExceptionエラーが発生する 再現方法不明
      // TODO: IOSでは自動再生されない
      video.play();
    });
  }
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
  changeVideo(videoIndex);
});

// 前の動画ボタン
const changePreviousVideoBtn = document.getElementById(
  "changePreviousVideoBtn"
);
changePreviousVideoBtn.addEventListener("click", () => {
  videoIndex = (videoIndex - 1 + videoRefList.length) % videoRefList.length;
  changeVideo(videoIndex);
});

// 動画の変更処理
function changeVideo(videoIndex) {
  playPinVideBtn.classList.add("hidden");
  getDownloadURL(videoRefList[videoIndex])
    .then((url) => {
      pinVideoFrame.src = url;
      video.src = url;
      // 表示されている方を再生する
      if (currentViewState === viewStates.isArView) {
        video.play();
        console.log("ar video on" + url);
      }
    })
    .catch((error) => {
      console.error(`動画URLの取得に失敗しました: ${error}`);
    });
}

// ピン止め動画変更時のボタン表示
pinVideoFrame.addEventListener("canplay", () => {
  if (currentViewState === viewStates.isPinView && pinVideoFrame.paused) {
    playPinVideBtn.classList.remove("hidden");
  }
});

// ピン止め動画の再再生
pinVideoFrame.addEventListener("ended", function () {
  console.log()
  if (currentViewState === viewStates.isPinView && pinVideoFrame.paused) {
    playPinVideBtn.classList.remove("hidden");
  }
});

const nft = document.getElementById("nft");
// marker発見時のイベント
nft.addEventListener("markerFound", () => {
  console.log("nft markerFound");
  isFindMarker = true;
  guideUi.classList.add("hidden");
  if (currentViewState === viewStates.isArView) {
    if (canOpenPresent) {
      changeNextVideoBtn.classList.toggle("hidden");
      changePreviousVideoBtn.classList.toggle("hidden");
      changeViewBtn.classList.toggle("hidden");
      console.log("video.src:" + video.src);
      video.play();
    }
  }
});

// marker消失時のイベント
nft.addEventListener("markerLost", () => {
  isFindMarker = false;
  if (currentViewState === viewStates.isArView) {
    console.log("nft markerLost");
    video.pause();
    pinVideoFrame.pause();

    if (canOpenPresent) {
      changeNextVideoBtn.classList.toggle("hidden");
      changePreviousVideoBtn.classList.toggle("hidden");
      changeViewBtn.classList.toggle("hidden");
    }
  }
});

function changeViewMode() {
  if (currentViewState === viewStates.isArView) {
    // Pin
    currentViewState = viewStates.isPinView;
    setPinViewUI();
  } else {
    // AR
    currentViewState = viewStates.isArView;
    setArViewUI();
  }
  console.log("currentViewState:" + currentViewState);
}

function setPinViewUI() {
  changeViewBtn.classList.remove("ar_view");
  pinVideoFrame.classList.remove("hidden");
  playPinVideBtn.classList.remove("hidden");
  arVideoFrame.setAttribute("visible", false);
}

function setArViewUI() {
  changeViewBtn.classList.add("ar_view");
  pinVideoFrame.classList.add("hidden");
  playPinVideBtn.classList.add("hidden");
  arVideoFrame.setAttribute("visible", true);
  if (isFindMarker) {
    changeNextVideoBtn.classList.remove("hidden");
    changePreviousVideoBtn.classList.remove("hidden");
    changeViewBtn.classList.remove("hidden");
  } else {
    changeNextVideoBtn.classList.add("hidden");
    changePreviousVideoBtn.classList.add("hidden");
    changeViewBtn.classList.add("hidden");
  }
}
