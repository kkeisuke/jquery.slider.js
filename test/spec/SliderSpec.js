(function($, window, document, undefined){
	
    describe("jQuery Slider Plugin テスト", function() {
        var $testMainNode;
        var main;
        var count = 0;
        
        beforeEach(function(){
            if( count > 0 ){return;}
            
            $.extend($.Slider, {
                auto:true, // 自動スライドショー
                presen:false, // プレゼンモード(auto が強制的に false になります)
                pause:true, // オンマウス時に自動スライドショーを停止
                direction:"left", // トランジッションの向き top right bottom left が選択可 
                interval:3000, // 自動スライドショーのインターバル
                duration:500, // トランジッションのスピード
                easing:"ease-In-Out-Cubic", // jquery.easing.js を別途使用すれば、イージングの指定も可能
                zIndexOffSet:1000, // z-index のオフセット値
                thum:"", // セレクタを指定することで、サムネイルにも対応
                init:function(main, thum){}, // 初期化時コールバック
                change:function(main, thum){/* console.log(this, main, thum) */}, // 切替時コールバック
                complete:function(main, thum){/* console.log(thum.$pre, thum.$current) */} // 切り替え終了時コールバック
            });
            
            $testMainNode = $("<li>test</li><li>test</li><li>test</li>");
            $testMainNode.width(100);
            $testMainNode.height(100);
            
            main = new $.Slider.Main($testMainNode);
            
            count++;
        });
        
        it("$.Slider.Main プロパティ テスト", function(){
            expect(main.$list).toEqual($testMainNode);
            expect(main.$current).toEqual($testMainNode.eq(0));
            expect(main.num).toEqual($testMainNode.size());
        });
        
        it("$.Slider.Main.prototype._init テスト", function(){
            expect(Number(main.$current.css("zIndex"))).toEqual($.Slider.zIndexOffSet + main.num);
            expect(main.from.zIndex).toEqual($.Slider.zIndexOffSet + main.num);
            if($.Slider.hasTransition && $.Slider.hasTransform){
                expect($.Slider.easing).toEqual("ease-In-Out");
            }else{
                expect($.Slider.easing).toEqual("easeInOutCubic");
            }
        });
        
        it("$.Slider.Main.prototype._setTransform & $.Slider.Main.prototype._setdirection テスト", function(){
            expect($.Slider.direction).toEqual("left");
            if($.Slider.hasTransition && $.Slider.hasTransform){
                expect(main.from.transform).toEqual("translate3d(" + main.$current.outerWidth() + "px, 0px, 0px)");
            }else{
               expect(main.from[$.Slider.direction]).toEqual(main.$current.outerWidth());
            }
        });
        
        it("$.Slider.Main.prototype._change, change テスト", function(){
            main.change(1);
            
            expect($.Slider.isAnimate).toBeTruthy();
            expect(main.$pre).toEqual($testMainNode.eq(0));
            expect(main.$current).toEqual($testMainNode.eq(1));
            expect(Number(main.$current.css("zIndex"))).toEqual($.Slider.zIndexOffSet + main.num);
            
            if($.Slider.hasTransition && $.Slider.hasTransform){
                waitsFor(function(){
                    return main.$current.css("transform") === "translate3d(0px, 0px, 0px)";
                }, "timeout animate", $.Slider.interval*2);
                // TODO transitionend がとれない。
            }else{
                waitsFor(function(){
                    return main.$current.css($.Slider.direction) === "0px";
                }, "timeout animate", $.Slider.interval*2);
                // TODO jquery.easing 使うと取れない。
                /* runs(function(){
                    expect(main.$pre.attr("style").indexOf("z-index")).toEqual(-1);
                    expect($.Slider.isAnimate).toBeFalsy();
                }); */
            }
        });
    });
	
})(jQuery, this, this.document);