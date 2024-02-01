import { storage, ref, getDownloadURL } from "./firebase.js";

// Firebase Storageから動画をダウンロード
const videoRef = ref(storage, 'videos/taga.mp4'); // パスは保存した動画のパスに変更
const video = document.getElementById('video_sample');

getDownloadURL(videoRef).then((url) => {
  video.src = url;
}).catch((error) => {
  console.error('動画のダウンロードに失敗しました', error);
});

// クリック時に動画再生
window.addEventListener('click', () => {
  video.play();
});