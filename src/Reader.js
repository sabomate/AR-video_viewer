import { storage, ref, getDownloadURL } from "./firebase.js";

// Firebase Storageから動画をダウンロード
const videoRef = ref(storage, 'videos/taga.mp4'); // パスは保存した動画のパスに変更
const video = document.getElementById('video_sample');
const arVideo = document.getElementById("arVideo")
console.log(videoRef)

const thumbnailText = document.getElementById("thumbnailText")
const gift_box = document.getElementById("gift_box")


getDownloadURL(videoRef).then((url) => {
  video.setAttribute('crossorigin', 'anonymous'); // CORSポリシーの制約を回避するために crossorigin を設定
  video.src = url;
}).catch((error) => {
  console.error('動画のダウンロードに失敗しました', error);
});

// クリック時に動画再生
window.addEventListener("click", ()=>{
  thumbnailText.setAttribute("visible", false)
  gift_box.setAttribute("visible", false)
  arVideo.setAttribute("visible", true)

  video.play()
});