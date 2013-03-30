# jquery.slider.js

transform & transition によるスライダー jQuery プラグイン  
transform & transition 非対応環境では通常のアニメーション  
chrome, IE9, GalaxyNexus(chrome) でのみ検証済み。

##  Demo

- [simlpe](http://jsrun.it/kkeisuke/n7iO)[old]
- [presen mode](http://jsrun.it/kkeisuke/ttJM)[old]  
右矢印、下矢印：進む  
左矢印、上矢印：戻る
- [swipe mode](http://jsrun.it/kkeisuke/wvHX)[new]  
右から左、上から下：進む  
左から右、下から上：戻る

## Requirements

- jQuery >= v1.8.0
- jquery.easing.1.3

## Others

- ブラウザのタブが切り替わっている間はスライドショーが停止します。
- スライド上にマウスがある間はスライドショーが停止します。

##  Options

    $(".slider").slider({
            auto:true, // 自動スライドショー
            pause:true, // オンマウス時に自動スライドショーを停止
            presen:false, // プレゼンモード(auto が強制的に false になります)
            swipe:false, // スワイプモード(auto が強制的に false になります)
            swipeOffSet:10, // スワイプ時の無効距離
            direction:"left", // トランジッションの向き top right bottom left が選択可 
            interval:3000, // 自動スライドショーのインターバル
            duration:500, // トランジッションのスピード
            easing:"linear", // jquery.easing.js を別途使用すれば、イージングの指定も可能
            // 例 ease-In-Out-Cubic ( CSS3 と JSでの名前の違いあり。CSS3 では Cubic を省略)
            zIndexOffSet:1000, // z-index のオフセット値
            thum:"", // セレクタを指定することで、サムネイルにも対応
            pre:"", // セレクタを指定することで、サムネイルにも対応
            next:"", // セレクタを指定することで、サムネイルにも対応
            cursor:"e-resize", // swipe が true の時、cursor が変わる。
            init:function(main, thum){}, // 初期化時コールバック
            change:function(main, thum){}, // 切替時コールバック
            complete:function(main, thum){} // 切り替え終了時コールバック
        });

## Example

### HTML

    <div class="slider">
       <p>First</p>
       <p>Second</p>
       <p>Third</p>
       <p>Forth</p>
       <p>Fifth</p>
    </div>
    <div>
        <ul class="thumbnails">
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
            <li>5</li>
        </ul>
    </div>

### CSS

    .slider{
        position:relative;
        width:400px;
        height:250px;
        overflow:hidden;
    }

    .slider p{
        margin:0;
        position:absolute;
        width:400px;
        height:250px;
    }

    @media screen and (max-width: 400px){
        .slider,
        .slider p{
            width:100%;
        }
    }