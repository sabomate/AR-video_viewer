import { storage } from "./firebase.js";

// Firebase Storageから動画をダウンロード
const videoRef = storage.ref().child('videos/example.mp4'); // パスは保存した動画のパスに変更
const video = document.getElementById('video_sample');

videoRef.getDownloadURL().then((url) => {
  video.src = url;
  video.setAttribute('crossorigin', 'anonymous'); // CORSポリシーの制約を回避するために crossorigin を設定
}).catch((error) => {
  console.error('動画のダウンロードに失敗しました', error);
});

// クリック時に動画再生
window.addEventListener('click', () => {
  video.play();
});