const path = require('path');

module.exports = {
    // エントリーポイントの設定
    entry: './src/index.js',
    // ビルド後、'./dist/my-bundle.js'というbundleファイルを生成する
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
};