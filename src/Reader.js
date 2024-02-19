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

const camera = document.getElementById("camera");

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

let check;
const nft = document.getElementById("nft");
// marker発見時のイベント
nft.addEventListener("markerFound", () => {
  console.log("nft markerFound");

  let cameraPosition = camera.object3D.position;
  let markerPosition = nft.object3D.position;
  let distance = cameraPosition.distanceTo(markerPosition);
  check = setInterval(() => {
    cameraPosition = camera.object3D.position;
    markerPosition = nft.object3D.position;
    distance = cameraPosition.distanceTo(markerPosition);

    // do what you want with the distance:
    console.log(distance);
  }, 100);



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
  clearInterval(check);

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