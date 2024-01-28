# AR-video_viewer

前身のARバムめーかー( https://github.com/minari515/Hack-U )を踏襲して，シームレスな動画閲覧を目指したウェブサービス

うまくいくかは全然わかりません

## 行ったこと

とりあえず実行したコマンドとか書いていく

## firebase接続のための設定

firebase CLIのインストール
```
npm install -g firebase-tools
```

firebaseにログインしてCLIのテスト（ウェブサイトが起動するので許可）
```
firebase Login
```

firebaseプロジェクト一覧の確認
```
firebase projects:list
```

## firebase hostionの設定

firebaseの確立？
```
firebase init
```
その後は…
- 指定のプロジェクトを選ぶ
- 任意の設定を選ぶ

## github actionについて
それぞれの設定が終わると，github actionの設定を行う
基本的に```firebae init```後，github action設定を選択すると勝手に進めてくれる

githubに追加するfirebase Tokenの取得方法
```
firebase login:ci
```