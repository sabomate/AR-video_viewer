import { storage, ref, getDownloadURL, listAll } from "./firebase.js";

// assetのビデオタグ要素
const video = document.getElementById("arVideo");
// ピン止め用ビデオ要素
const pinVideo = document.getElementById("pinVideo");
// ビデオのview切り替えボタン
const changeViewBtn = document.getElementById("changeViewBtn");
const videoFrame = document.getElementById("videoFrame");

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
changeViewBtn.addEventListener("click", () => {
  changeViewBtn.classList.toggle("ar_view");
  console.log("click pin btn");
  // viewModeの切り替え
  changeViewMode();

  // 切り替え時にどちらか片方が表示されるようにする
  pinVideo.classList.toggle("hidden");
  // videoFrame.classList.toggle('hidden');
  videoFrame.setAttribute("visible", !videoFrame.getAttribute("visible"));
  console.log(pinVideo.classList);
  console.log(videoFrame.classList);

  // 表示されている方を再生する
  if (currentViewState === viewStates.isPinView) {
    // Pin
    video.pause();
    pinVideo.play();
    console.log("pin video on");
  } else {
    // AR
    pinVideo.pause();
    if(isFindMarker) video.play();
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
    changeViewBtn.classList.toggle("hidden");
    canOpenPresent = true;
    getDownloadURL(videoRefList[videoIndex]).then((url) => {
      console.log("set url:" + url);
      pinVideo.src = url;
      video.src = url;
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
  getDownloadURL(videoRefList[videoIndex])
    .then((url) => {
      pinVideo.src = url;
      video.src = url;
      // 表示されている方を再生する
      if (currentViewState === viewStates.isPinView) {
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
      if (currentViewState === viewStates.isPinView) {
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
  isFindMarker = true;
  guideUi.classList.add("hidden");
  if (currentViewState === viewStates.isArView) {
    playVideBtn.classList.remove("hidden");
    if (canOpenPresent) {
      changeNextVideoBtn.classList.toggle("hidden");
      changePreviousVideoBtn.classList.toggle("hidden");
      changeViewBtn.classList.toggle("hidden");
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
    pinVideo.pause();

    // UI制御
    playVideBtn.classList.add("hidden");

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
  } else {
    // AR
    currentViewState = viewStates.isArView;
    setArViewUI();
  }
  console.log("currentViewState:" + currentViewState);
}

function setArViewUI() {
  console.log("setArViewUI: " + isFindMarker)
  playVideBtn.classList.add("hidden");
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