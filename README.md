# AR-video_viewer

前身の AR バムめーかー( https://github.com/minari515/Hack-U )を踏襲して，
シームレスな動画閲覧を目指したウェブサービス

うまくいくかは全然わかりません

## 行ったこと

とりあえず実行したコマンドとか書いていく

## firebase 接続のための設定

firebase CLI のインストール

```
npm install -g firebase-tools
```

firebase にログインして CLI のテスト（ウェブサイトが起動するので許可）

```
firebase Login
```

firebase プロジェクト一覧の確認

```
firebase projects:list
```

## firebase hostion の設定

firebase の確立？

```
firebase init
```

その後は…

- 指定のプロジェクトを選ぶ
- 任意の設定を選ぶ

## build について

github action と連携するためにビルド環境をつくる

```
npm init
```

わからんから webpack のインストール

```
npm install webpack --save-dev
npm install --save-dev webpack-cli
```

webpack.config.js を作成（内容はコピペ）

## github action について

それぞれの設定が終えたら，github action の設定を行う
基本的に`firebae init`後，github action 設定を選択すると勝手に進めてくれる

https://tm-progapp.hatenablog.com/entry/2023/02/05/133737

これを参考にしながら

- IAM API を有効にする
- サービスアカウントを作成する
- 権限を割り当てる（割り当て過ぎらしいけど今回はオーナーを割り当てた）
- ID を発行する（JSON）
- アカウント ID をコピペする

この辺を行ったらなんとかできた

# 始め方！！まずすること！！！

```
npm install -g firebase-tools
firebase login
firebase deploy
```

これでいけたけどログインのとこで俺のアカウント選択してるからできてるだけ説あるなぁ