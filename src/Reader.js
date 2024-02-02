import { storage, ref, getDownloadURL } from "./firebase.js";

// 動画のパス
const videoPathArr = [
  'videos/taga.mp4',
  'videos/river.mp4'
]

// Firebase Storageから動画をダウンロード
const video = document.getElementById('video_sample');
const videoUrlArr = []
videoPathArr.forEach((path) => {
  const videoRef = ref(storage, path);
  getDownloadURL(videoRef).then((url) => {
    videoUrlArr.push(url);
    video.src = url;
  }).catch((error) => {
    console.error(`動画のダウンロードに失敗しました: ${error}`);
  });
});

let videoIndex = 0;
// クリック時に動画再生
window.addEventListener("click", ()=>{
  // 他の動画が再生中なら停止
  videoIndex = (videoIndex + 1) % videoUrlArr.length;
  video.src = videoUrlArr[videoIndex];

  // // 動画を再生
  video.play()
});