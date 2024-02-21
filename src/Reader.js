import { storage, ref, getDownloadURL, listAll } from "./firebase.js";

// assetのビデオタグ要素
const video = document.getElementById("arVideo");
const arVideoFrame = document.getElementById("videoFrame");
// ピン止め用ビデオ要素
const pinVideoFrame = document.getElementById("pinVideo");
const pinThumbnail = document.getElementById("pinThumbnail");
const playPinVideoBtn = document.getElementById("playPinVideoBtn");
const openAllVideoViewBtn = document.getElementById("openAllVideoViewBtn");
const closeAllVideoViewBtn = document.getElementById("closeAllVideoViewBtn");

const changeNextVideoBtn = document.getElementById("changeNextVideoBtn");
const changePreviousVideoBtn = document.getElementById("changePreviousVideoBtn");
// ビデオのview切り替えボタン
const changeViewBtn = document.getElementById("changeViewBtn");

const guideUi = document.getElementById("guideUi");

const firstPlayVideoBtn = document.getElementById("playVideoBtn");

// 状態列挙
const viewStates = {
  isArView: "ArView",
  isPinView: "pinView",
};

let deviceType;

// プレゼント開封のフラグ
// TODO: 意味が逆な気がする
let isOpenedPresent = false;

// マーカー認識のフラグ
let isFindMarker = false;

// 現在の状態
let currentViewState = viewStates.isArView;
setArViewUI();
arVideoFrame.setAttribute("visible", false);


let url = new URL(window.location.href);
let grade = url.searchParams.get("grade");
let personal = url.searchParams.get("personals");

// Debug用
grade = grade == null ? "B4" : grade;
grade = (grade == "M2") ? "M1" : grade;

// URLからクエリパラメータを削除
// history.replaceState("", "", url.pathname);

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
      console.log("IOS");
      deviceType = "IOS";
      thumnailText.setAttribute('position', '50 -132 -50');
      giftBox.setAttribute('position', '180 -130 120');
      videoFrame.setAttribute('position', '180 55 150');
    }
    // Androidの場合の位置調整
  else if (/Android/.test(navigator.userAgent)) {
      console.log("android OS");
      deviceType = "android";
      thumnailText.setAttribute('position', '20 2 -400');
      giftBox.setAttribute('position', '150 100 -200');
      videoFrame.setAttribute('position', '150 155 -300');
  }
  // それ以外（PCなど）の場合の位置調整
  else {
      console.log("else OS");
      deviceType = "PC";
      thumnailText.setAttribute('position', '150 2 -250');
      giftBox.setAttribute('position', '300 100 -100');
      videoFrame.setAttribute('position', '300 105 -100');
  }
}

// ページ読み込み時に位置調整を行う
window.onload = adjustPositionForPlatform;


let contentsList = [];
let videoIndex = 0;
const listRef = ref(storage, "videos/" + grade);
await listAll(listRef)
  .then(async (res) => {
    const prefixes = res.prefixes;
    for(const prefix of prefixes) {
      let thumbnailRef, videoRef,thumbnailUrl;
      await listAll(prefix).then(async (result) => {
        // 動画とサムネイルの参照を取得
        for(const fileRef of result.items) {
          let fileType = fileRef.name.split(".").pop();
          if (fileType === "mp4") {
            videoRef = fileRef;
          } else {
            thumbnailRef = fileRef;
          }
        }
        // サムネイルURLの取得
        await getDownloadURL(thumbnailRef).then((url) => {
          thumbnailUrl = url
        }).catch((error) => {
          console.error(`サムネイルURLの取得に失敗しました: ${error}`);
        });
      });
      const content = { videoRef: videoRef, thumbnailRef: thumbnailRef, thumbnailUrl: thumbnailUrl};
      contentsList.push(content);
    }
  })
  .catch((error) => {
    console.error(`動画参照リストの取得に失敗しました: ${error}`);
  });

if (personal != null) {
  const personalListRef = ref(storage, "videos/personals/" + personal);
  await listAll(personalListRef)
    .then(async (res) => {
      const prefixes = res.prefixes;
      for(const prefix of prefixes) {
        let thumbnailRef, videoRef,thumbnailUrl;
        await listAll(prefix).then(async (result) => {
          // 動画とサムネイルの参照を取得
          for(const fileRef of result.items) {
            let fileType = fileRef.name.split(".").pop();
            if (fileType === "mp4") {
              videoRef = fileRef;
            } else {
              thumbnailRef = fileRef;
            }
          }
          // サムネイルURLの取得
          await getDownloadURL(thumbnailRef).then((url) => {
            thumbnailUrl = url
          }).catch((error) => {
            console.error(`サムネイルURLの取得に失敗しました: ${error}`);
          });
        });
        const content = { videoRef: videoRef, thumbnailRef: thumbnailRef, thumbnailUrl: thumbnailUrl};
        contentsList.push(content);
      }
    })
    .catch((error) => {
      console.error(`動画参照リストの取得に失敗しました: ${error}`);
    });
}

// サムネイルの表示
setAllViewThumbnail(contentsList);


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
  if (!isOpenedPresent && isFindMarker) {
    document.getElementById("thumbnailText").setAttribute("visible", false);
    document.getElementById("gift_box").setAttribute("visible", false);
    document.getElementById("videoFrame").setAttribute("visible", true);
    changeNextVideoBtn.classList.toggle("hidden");
    changePreviousVideoBtn.classList.toggle("hidden");
    changeViewBtn.classList.toggle("hidden");
    firstPlayVideoBtn.classList.toggle("hidden");
    isOpenedPresent = true;
    getDownloadURL(contentsList[videoIndex].videoRef).then((url) => {
      console.log("set url:" + url);
      pinVideoFrame.src = url;
      pinThumbnail.src = contentsList[videoIndex].thumbnailUrl;
      video.src = url;
      // TODO: 時々DOMExceptionエラーが発生する 再現方法不明
      // TODO: IOSでは自動再生されない
      video.play();
    });
  }
}

firstPlayVideoBtn.addEventListener("click", () => {
  handleTap();
});


// 次の動画ボタン
changeNextVideoBtn.addEventListener("click", () => {
  videoIndex = (videoIndex + 1) % contentsList.length;
  changeVideo(videoIndex);
});

// 前の動画ボタン
changePreviousVideoBtn.addEventListener("click", () => {
  videoIndex = (videoIndex - 1 + contentsList.length) % contentsList.length;
  changeVideo(videoIndex);
});

// 動画の変更処理
function changeVideo(videoIndex) {
  pinThumbnail.classList.add("hidden");
  playPinVideoBtn.classList.add("hidden");
  getDownloadURL(contentsList[videoIndex].videoRef)
    .then((url) => {
      pinVideoFrame.src = url;
      pinThumbnail.src = contentsList[videoIndex].thumbnailUrl;
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

// ピン状態の再生処理
playPinVideoBtn.addEventListener("click", () => {
  pinThumbnail.classList.add("hidden");
  pinVideoFrame.play();
  if(deviceType==="PC" || deviceType==="android"){
    playPinVideoBtn.classList.add("hidden");
  }else{
    console.log(playPinVideoBtn.classList)
  }
});

// ピン止め動画変更時のボタン表示
pinVideoFrame.addEventListener("loadedmetadata", () => {
  console.log("video metadata loaded");
  if (currentViewState === viewStates.isPinView && pinVideoFrame.paused) {
    pinThumbnail.classList.remove("hidden");
    playPinVideoBtn.classList.remove("hidden");
  }
});


// ピン止め動画の再再生
pinVideoFrame.addEventListener("ended", function () {
  console.log("movie ended!");
  if (currentViewState === viewStates.isPinView && pinVideoFrame.paused) {
    playPinVideoBtn.classList.remove("hidden");
  }
});

const dialog = document.getElementById("dialog");

openAllVideoViewBtn.addEventListener(
  "click",
  () => {
    dialog.classList.remove("hidden_dialog");
  },
  false
);

closeAllVideoViewBtn.addEventListener(
  "click",
  () => {
    dialog.classList.add("hidden_dialog");
  },
  false
);

// TODO:もっといいやり方あるかも
// フラグ変化検知用のフラグ
let flagChangeTimeout;

const nft = document.getElementById("nft");
// marker発見時のイベント
nft.addEventListener("markerFound", () => {
  console.log("nft markerFound");
  isFindMarker = true;
  guideUi.classList.add("hidden");
  clearTimeout(flagChangeTimeout);
  if (currentViewState === viewStates.isArView) {
    if (isOpenedPresent) {
      changeNextVideoBtn.classList.toggle("hidden");
      changePreviousVideoBtn.classList.toggle("hidden");
      changeViewBtn.classList.toggle("hidden");
      console.log("video.src:" + video.src);
      video.play();
    }else{
      firstPlayVideoBtn.classList.remove("hidden")
    }
  }
});

function checkFlagsAndRemoveHidden() {
  if (!isFindMarker && !isOpenedPresent) {
    guideUi.classList.remove("hidden");
  }
}
function startFlagChangeTimeout() {
  // 5秒後にフラグが変化しなかったらガイドUIを表示
  flagChangeTimeout = setTimeout(checkFlagsAndRemoveHidden, 5000);
}

// marker消失時のイベント
nft.addEventListener("markerLost", () => {
  isFindMarker = false;
  if (currentViewState === viewStates.isArView) {
    console.log("nft markerLost");
    video.pause();
    pinVideoFrame.pause();

    if (isOpenedPresent) {
      changeNextVideoBtn.classList.toggle("hidden");
      changePreviousVideoBtn.classList.toggle("hidden");
      changeViewBtn.classList.toggle("hidden");
    } else {
      startFlagChangeTimeout();
    }
  }
});

// PIN・AR状態の切り替え
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
  changeViewBtn.classList.add("ar_view");
  pinVideoFrame.classList.remove("hidden");
  pinThumbnail.classList.remove("hidden");
  playPinVideoBtn.classList.remove("hidden");
  openAllVideoViewBtn.classList.remove("hidden");
  arVideoFrame.setAttribute("visible", false);
}

function setArViewUI() {
  changeViewBtn.classList.remove("ar_view");
  pinVideoFrame.classList.add("hidden");
  pinThumbnail.classList.add("hidden");
  playPinVideoBtn.classList.add("hidden");
  openAllVideoViewBtn.classList.add("hidden");
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

function setAllViewThumbnail(theContentsList) {
  const allVideView = document.getElementById("allVideoView");
  theContentsList.forEach((content, index) => {
    const imgBtn = document.createElement("button");
    imgBtn.value = index;

    // サムネイルクリック時のイベント
    imgBtn.addEventListener("click", () => {
      videoIndex = index;
      console.log("click:" + index);
      changeVideo(index);
      dialog.classList.add("hidden_dialog");
    });
    const img = document.createElement("img");
    img.src = content.thumbnailUrl;
    imgBtn.appendChild(img);
    allVideView.appendChild(imgBtn);
  });
}