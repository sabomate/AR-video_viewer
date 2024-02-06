

// ビデオのピンボタン
const  VideoPinBtn = document.getElementById('VideoPinBtn');
const videoFrame = document.getElementById("videoFrame");
const pinVideo = document.getElementById("pinVideo");

VideoPinBtn.addEventListener('click', () => {
  console.log("click pin btn")
  // 切り替え時にどちらか片方が表示されるようにする
  pinVideo.classList.toggle('hidden');
  // videoFrame.classList.toggle('hidden');
  videoFrame.setAttribute("visible", !videoFrame.getAttribute("visible"));
  console.log(pinVideo.classList);
  console.log(videoFrame.classList);

  // 表示されている方を再生する（任意の条件で再生・停止の切り替えができます）
  if (!pinVideo.classList.contains('hidden')) {
    // pinVideo.src = videoFrame.src;
    pinVideo.play();
    console.log("pin video on");
  } else {
    // videoFrame.src = pinVideo.src;
    videoFrame.play();
    console.log("ar video on");
  }
});

const hiroMarker = document.getElementById('hiroMarker');
// marker発見時のイベント
hiroMarker.addEventListener('markerFound', () => {
  console.log('hiroMarker markerFound');
  VideoPinBtn.classList.toggle('hidden');
});

// marker消失時のイベント
hiroMarker.addEventListener('markerLost', () => {
  console.log('hiroMarker markerLost');
  VideoPinBtn.classList.toggle('hidden');
});

window.addEventListener("click", ()=>{
  const video = document.getElementById("video_sample")
  video.play();
})