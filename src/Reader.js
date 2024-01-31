import { storage, ref, getDownloadURL } from "./firebase.js";

// Firebase Storageから動画をダウンロード
const videoRef = ref(storage, 'videos/taga.mp4'); // パスは保存した動画のパスに変更
const thumbnailRef = ref(storage, 'img/start.png')

const video = document.getElementById('video_sample');
const thumbnail = document.getElementById('thumbnail');

const arVideo = document.getElementById("arVideo")
const thumbnailImg = document.getElementById("thumbnailImg")

console.log(videoRef)
console.log(thumbnailRef)

getDownloadURL(videoRef).then((url) => {
  video.setAttribute('crossorigin', 'anonymous'); // CORSポリシーの制約を回避するために crossorigin を設定
  video.src = url;
}).catch((error) => {
  console.error('動画のダウンロードに失敗しました', error);
});

getDownloadURL(thumbnailRef).then((url) => {
  thumbnail.setAttribute('crossorigin', 'anonymous'); // CORSポリシーの制約を回避するために crossorigin を設定
  thumbnail.src = url;
}).catch((error) => {
  console.error('サムネイル画像のダウンロードに失敗しました', error);
});

// クリック時に動画再生
window.addEventListener("click", ()=>{
  thumbnailImg.setAttribute("visible", false)
  arVideo.setAttribute("visible", true)

  video.play()
});