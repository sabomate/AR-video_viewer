import { storage, ref, getDownloadURL } from "./firebase.js";

// 動画のパス
const videoPathArr = [
  'videos/taga.mp4',
  'videos/river.mp4',
  'videos/huji.mp4'
]

// Firebase Storageから動画をダウンロード
const video = document.getElementById('video_sample');
const videoUrlArr = []
videoPathArr.forEach((path) => {
  const videoRef = ref(storage, path);
  getDownloadURL(videoRef).then((url) => {
    videoUrlArr.push(url);
  }).catch((error) => {
    console.error(`動画のダウンロードに失敗しました: ${error}`);
  });
});

let videoIndex = 0;
const  playVideBtn = document.getElementById('playVideBtn');
playVideBtn.addEventListener('click', () => {
  console.log('playVideBtn click');
  video.play();
});

const  changeNextVideoBtn = document.getElementById('changeNextVideoBtn');
changeNextVideoBtn.addEventListener('click', () => {
  videoIndex = (videoIndex + 1) % videoUrlArr.length;
  console.log('changeNextVideoBtn click' + videoIndex + ' ' + videoUrlArr[videoIndex]);
  video.src = videoUrlArr[videoIndex];
  video.play();
});

const  changePreviousVideoBtn = document.getElementById('changePreviousVideoBtn');
changePreviousVideoBtn.addEventListener('click', () => {
  videoIndex = (videoIndex - 1 + videoUrlArr.length) % videoUrlArr.length;
  console.log('changePreviousVideoBtn click' + videoIndex + ' ' + videoUrlArr[videoIndex]);
  video.src = videoUrlArr[videoIndex];
  video.play();
});

const nft = document.getElementById('nft');
// marker発見時のイベント
nft.addEventListener('markerFound', () => {
  console.log('nft markerFound');
  video.src = videoUrlArr[videoIndex];
  playVideBtn.classList.remove('hidden');
  changeNextVideoBtn.classList.remove('hidden');
  changePreviousVideoBtn.classList.remove('hidden');
});

// marker消失時のイベント
nft.addEventListener('markerLost', () => {
  console.log('nft markerLost');
  playVideBtn.classList.add('hidden');
  changeNextVideoBtn.classList.add('hidden');
  changePreviousVideoBtn.classList.add('hidden');
});