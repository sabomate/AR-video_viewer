import { storage, ref, getDownloadURL, listAll} from "./firebase.js";

let url = new URL(window.location.href);
let grade = url.searchParams.get("grade");

// 動画のパス
const videoPathArr = []

// Debug用
grade = (grade == null) ? 'M1' : grade;
// const listRef = ref(storage, 'videos');

// Firebase Storageから動画をダウンロード
const video = document.getElementById('arVideo');
const videoUrlArr = []

const listRef = ref(storage, 'videos/' + grade);
listAll(listRef)
  .then((res) => {
    res.items.forEach((itemRef,index) => {
      getDownloadURL(itemRef).then((url) => {
        console.log(index + " " +url);
        videoUrlArr.push(url);
        if (index == 0){
          video.src = url;
        }
      }).catch((error) => {
        console.error(`動画のダウンロードに失敗しました: ${error}`);
      });
    });
  }).catch((error) => {
    // Uh-oh, an error occurred!
    console.error(`動画のダウンロードに失敗しました: ${error}`);
  });

let videoIndex = 0;
let videoClickCount = 0;

// 再生ボタン
const  playVideBtn = document.getElementById('playVideBtn');
playVideBtn.addEventListener('click', () => {
  // 最初だけサムネイル要素の削除を実行
  if (videoClickCount == 0){
    document.getElementById("thumbnailText").setAttribute("visible", false)
    document.getElementById("gift_box").setAttribute("visible", false)
    document.getElementById("videoFrame").setAttribute("visible", true)
  }
  videoClickCount += 1;
  console.log('playVideBtn click');
  video.play();
});

// 次の動画ボタン
const  changeNextVideoBtn = document.getElementById('changeNextVideoBtn');
changeNextVideoBtn.addEventListener('click', () => {
  videoIndex = (videoIndex + 1) % videoUrlArr.length;
  console.log('changeNextVideoBtn click' + videoIndex + ' ' + videoUrlArr[videoIndex]);
  video.src = videoUrlArr[videoIndex];
  video.play();
});

// 前の動画ボタン
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