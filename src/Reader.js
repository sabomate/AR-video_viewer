import { storage, ref, getDownloadURL } from "./firebase.js";

// 動画の処理
const videoPaths = [
  'videos/taga.mp4',
  'videos/river.mp4'
]

const videoElements = [
  document.getElementById('video_sample_1'),
  document.getElementById('video_sample_2')
]

const arVideos = [
  document.getElementById("arVideo_1"),
  document.getElementById("arVideo_2")
]

const setVideoAttributes = (video, url) => {
  video.setAttribute('crossorigin', 'anonymous'); // CORS回避の保険
  video.src = url;
};

videoPaths.forEach((path, index) => {
  const videoRef = ref(storage, path);
  console.log("デバッグだよ：", videoRef)

  getDownloadURL(videoRef)
    .then(url => setVideoAttributes(videoElements[index], url))
    .catch(error => console.error(`動画のダウンロードに失敗しました: ${error}`));
});

// 再生用動画のindex
let currentVideoIndex = 0;
// 再生中の動画を管理する変数
let currentPlayingVideo = null;

// クリック時に動画再生
window.addEventListener("click", ()=>{
  // 他の動画が再生中なら停止
  if (currentPlayingVideo) {
    currentPlayingVideo.pause();
    currentPlayingVideo.currentTime = 0;
  }

  const video = videoElements[currentVideoIndex];
  console.log("確認：", video)

  arVideos[currentVideoIndex].setAttribute("visible", true);
  if (currentVideoIndex > 0){
    arVideos[currentVideoIndex - 1].setAttribute("visible", false);
  } else {
    arVideos[arVideos.length - 1].setAttribute("visible", false);
  }


  // 動画を再生
  video.play()
  currentPlayingVideo = video;

  // 次の動画を再生
  if (currentVideoIndex + 1 == videoElements.length){
    currentVideoIndex = 0;
  } else {
    currentVideoIndex = (currentVideoIndex + 1) % videoElements.length;
  }
});