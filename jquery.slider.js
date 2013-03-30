/**
 * @fileoverview 簡易的な jQuery スライダープラグイン 2013/03/31
 */
(function($, window, document, undefined){
    
    /**
     * クラス
     * @param {jQuery Object} $target jQuery Elements
     */
    $.Slider = function($target){
        this.$target = $target;
        this.current = 0;
        this.intervalID = null;
        this.main = null;
        this.thum = null;
        this.cv = null;
        this.option = {
            auto:true, // 自動スライドショー
            pause:true, // オンマウス時に自動スライドショーを停止
            presen:false, // プレゼンモード(auto が強制的に false になります)
            swipe:false, // スワイプモード(auto が強制的に false になります)
            swipeOffSet:10, // スワイプ時の無効距離
            direction:"left", // トランジッションの向き top right bottom left が選択可 
            interval:3000, // 自動スライドショーのインターバル
            duration:500, // トランジッションのスピード
            easing:"linear", // jquery.easing.js を別途使用すれば、イージングの指定も可能
            zIndexOffSet:1000, // z-index のオフセット値
            thum:"", // セレクタを指定することで、サムネイルにも対応
            pre:"", // セレクタを指定することで、サムネイルにも対応
            next:"", // セレクタを指定することで、サムネイルにも対応
            cursor:"e-resize", // swipe が true の時、cursor が変わる。
            init:function(main, thum){}, // 初期化時コールバック
            change:function(main, thum){/* console.log(this, main, thum) */}, // 切替時コールバック
            complete:function(main, thum){/* console.log(thum.$pre, thum.$current) */} // 切り替え終了時コールバック
        };
    };
    
    /**
     * クラスメンバー
     */
    $.Slider.hasTouch = "ontouchstart" in window;
    $.Slider.hasTransition = String($("<div>").css("transition", "0").attr("style")).indexOf("transition") !== -1;
    $.Slider.transform = String($("<div>").css("transform", "translate(0)").attr("style")).split(":").shift();
    $.Slider.hasTransform = $.Slider.transform.indexOf("transform") !== -1;
    $.Slider.evClick = $.Slider.hasTouch ? "touchend" : "click";
    $.Slider.gethidden = function(){
        var doc = window.document;
        return doc.hidden || doc.mozHidden || doc.msHidden || doc.webkitHidden;
    };
    $.Slider.transitionOffSet = 100;
    $.Slider.event = {
        change:"changeSlider",
        transitionend:"transitionend MSTransitionEnd webkitTransitionEnd",
        visibilitychange:"visibilitychange mozvisibilitychange msvisibilitychange webkitvisibilitychange"
    };
    $.Slider.isAnimate = false;
    $.Slider.R_ARROW = 39;
    $.Slider.L_ARROW = 37;
    $.Slider.U_ARROW = 38;
    $.Slider.D_ARROW = 40;
    
    /**
     * スライダーメインエリア クラス
     */
    $.Slider.Main = function($list){
        this.$list = $list;
        this.$pre = null;
        this.$current = $list.eq(0);
        this.num = $list.size();
        this.from = {};
        this.to = {};
        this._init();
    };
    
    $.Slider.Main.prototype = {
        _init:function(){
            this.$current.css({
                zIndex:this.num + $.Slider.zIndexOffSet
            });
            this.from.zIndex = this.num + $.Slider.zIndexOffSet;
            if($.Slider.hasTransition && $.Slider.hasTransform){
                // GPUアクセラレーターのON/OFFが切り替わったタイミングでのチラつき防止
                this.$list.css("transform-style", "preserve-3d");
                var index = $.Slider.easing.lastIndexOf("-");
                if(index !== -1){
                    $.Slider.easing = $.Slider.easing.slice(0, index);
                }
                this._setTransitionEvent();
            }else{
                $.Slider.easing = $.Slider.easing.split("-").join("");
            }
        },
        _setTransform:function(){
            switch($.Slider.direction){
                case "top":
                    this.from.transform = "translate3d(0px, " + -this.$current.outerHeight() + "px, 0px)";
                    break;
                case "bottom":
                    this.from.transform = "translate3d(0px, " + this.$current.outerHeight() + "px, 0px)";
                    break;
                case "left":
                    this.from.transform = "translate3d(" + this.$current.outerWidth() + "px, 0px, 0px)";
                    break;
                case "right":
                    this.from.transform = "translate3d(" + -this.$current.outerWidth() + "px, 0px, 0px)";
                    break;
                default :
                    break;
            }
            this.to.transform = "translate3d(0px, 0px, 0px)";
            this.to.transition = ($.Slider.duration - $.Slider.transitionOffSet) * 0.001 + "s " + $.Slider.transform + " " + $.Slider.easing;
        },
        _setTransitionEvent:function(){
            var that = this;
            this.$list.on($.Slider.event.transitionend, function(e){
                if($.Slider.isAnimate && e.originalEvent.propertyName === $.Slider.transform){
                    that.$pre.css({
                        zIndex:"",
                        transition:"",
                        transform:""
                    });
                    $.Slider.isAnimate = false;
                    $(that).trigger($.Slider.event.change);
                }
            });
        },
        _setdirection:function(){
            delete this.from.top;
            delete this.from.bottom;
            delete this.from.left;
            delete this.from.right;
            this.to = {};
            switch($.Slider.direction){
                case "top":
                case "bottom":
                    this.from[$.Slider.direction] = -this.$current.outerHeight();
                    break;
                case "left":
                case "right":
                    this.from[$.Slider.direction] = this.$current.outerWidth();
                    break;
                default :
                    break;
            }
            this.to[$.Slider.direction] = 0;
        },
        _changeEx:function(index){
            $.Slider.isAnimate = true;
            this.$pre = this.$current;
            this.$pre.css("zIndex", this.num - 1 + $.Slider.zIndexOffSet);
            this.$current = this.$list.eq(index);
            this.$current.css(this.from);
        },
        _change:function(index){
            var that = this;
            this._changeEx(index);
            this.$current
                .stop(true, false)
                .animate(this.to, $.Slider.duration, $.Slider.easing, function(){
                    that.$pre.css({
                        zIndex:"",
                        top:"",
                        bottom:"",
                        left:"",
                        right:""
                    });
                    $.Slider.isAnimate = false;
                    $(that).trigger($.Slider.event.change);
                });
        },
        _changeTransition:function(index){
            var that = this;
            this._changeEx(index);
            window.setTimeout(function(){ that.$current.css(that.to); }, $.Slider.transitionOffSet);
        },
        change:function(index){
            if($.Slider.hasTransition && $.Slider.hasTransform){
                this._setTransform();
                this._changeTransition(index);
            }else{
                this._setdirection();
                this._change(index);
            }
        },
        _slide:function(index, direction){
            $.Slider.direction = direction;
            this._setdirection();
            this._change(index);
        },
        _slideTransition:function(index, direction){
            $.Slider.direction = direction;
            this._setTransform();
            this._changeTransition(index);
        },
        slide:function(index, direction){
            if($.Slider.hasTransition && $.Slider.hasTransform){
                this._slideTransition(index, direction);
            }else{
                this._slide(index, direction);
            }
        }
    };
    
    /**
     * スライダーサムネイル クラス
     */
    $.Slider.Thum = function(){
        this.$list = $($.Slider.thum).children();
        this.$pre = null;
        this.$current = this.$list.eq(0);
        this.num = this.$list.size();
        this._init();
    };
    
    $.Slider.Thum.prototype = {
        _init:function(){
            this._setEvent();
        },
        _setEvent:function(){
            var that = this;
            this.$list.on($.Slider.evClick, function(){
                if(!$.Slider.isAnimate && that.$current.index() !== $(this).index()){
                    $(that).trigger($.Slider.event.change, [this]);
                }
            });
        },
        change:function(index){
            this.$pre = this.$current;
            this.$current = this.$list.eq(index);
        }
    };
    
    /**
     * スライダーコントローラビュー クラス
     */
    $.Slider.ControllerView = function(){
        this.$pre = null;
        this.$next = null;
        this._init();
    };
    
    $.Slider.ControllerView.prototype = {
        _init:function(){
            if($.Slider.pre !== ""){
                this.$pre = $($.Slider.pre);
            }
            if($.Slider.next !== ""){
                this.$next = $($.Slider.next);
            }
            this._setEvent();
        },
        _setEvent:function(){
            var that = this;
            if(this.$pre !== null){
                this.$pre.on($.Slider.evClick, function(){
                    that._triggerChange.call(that, -1);
                });
            }
            if(this.$next !== null){
                this.$next.on($.Slider.evClick, function(){
                    that._triggerChange.call(that, 1);
                });
            }
        },
        _triggerChange:function(offset){
            if(!$.Slider.isAnimate){
                $(this).trigger($.Slider.event.change, [offset]);
            }
        }
    };
    
    /**
     * インスタンスメソッド
     */
    $.extend($.Slider.prototype,{
        // オプションを継承
        _setOption:function(option){
            if(option === undefined) { return; }
            $.extend(this.option, option);
        },
        _init:function(){
            if(this.option.presen || this.option.swipe){
                this.option.auto = false;
                this.option.pause = false;
            }
            $.extend($.Slider, this.option);
            this.main = new $.Slider.Main(this.$target.children());
            if(this.option.thum !== ""){
                this.thum = new $.Slider.Thum();
            }
            if(this.option.pre !== "" || this.option.next !== ""){
                this.cv = new $.Slider.ControllerView();
            }
            this.option.init.call(this, this.main, this.thum);
            this.start();
            this._setEvent();
        },
        _setEvent:function(){
            var that = this;
            $(this.main).on($.Slider.event.change, function(){
                that.option.complete.call(that, that.main, that.thum);
            });
            if(this.option.pause && this.option.auto && !$.Slider.hasTouch){
                this.$target.on({
                    mouseenter:function(){
                        if(that.intervalID){
                            window.clearInterval(that.intervalID);
                            that.intervalID = null;
                        }
                    },
                    mouseleave:function(){
                        that.start.call(that);
                    }
                });
            }
            if(this.thum){
                $(this.thum).on($.Slider.event.change, function(e, current){
                    that.restart.call(that, $(current).index());
                });
            }
            if(this.cv){
                $(this.cv).on($.Slider.event.change, function(e, offset){
                    that.restartOffset.call(that, offset);
                });
            }
            $(window.document).on($.Slider.event.visibilitychange, function(){
                if($.Slider.gethidden()){
                    if(that.intervalID){
                        window.clearInterval(that.intervalID);
                        that.intervalID = null;
                    }
                }else{
                    if(that.intervalID === null){
                        that.start.call(that);
                    }
                }
            });
            if(this.option.presen){
                $(window.document).on("keydown", function(e){
                    if(!$.Slider.isAnimate){
                        switch(e.keyCode){
                            case $.Slider.R_ARROW:
                                that.slide(1, "left");
                                break;
                            case $.Slider.L_ARROW:
                                that.slide(-1, "right");
                                break;
                            case $.Slider.U_ARROW:
                                that.slide(-1, "bottom");
                                break;
                            case $.Slider.D_ARROW:
                                that.slide(1, "top");
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
            if(this.option.swipe){
                this._setSwipeEvent();
            }
        },
        _setSwipeEvent:function(){
            var that = this;
            var evEnd = $.Slider.hasTouch ? "touchend" : "mouseup";
            var evStart = $.Slider.hasTouch ? "touchstart" : "mousedown";
            var pageX;
            var pageY;
            this.$target.css({
                cursor:this.option.cursor
            });
            this.$target.on(evStart, function(e){
                // テキスト選択不可
                e.preventDefault();
                if(evStart === "touchstart"){
                    pageX = e.originalEvent.touches[0].pageX;
                    pageY = e.originalEvent.touches[0].pageY;
                }else{
                    pageX = e.pageX;
                    pageY = e.pageY;
                }
            });
            this.$target.on(evEnd, function(e){
                var _pageX;
                var _pageY;
                if(evStart === "touchstart"){
                    _pageX = e.originalEvent.changedTouches[0].pageX;
                    _pageY = e.originalEvent.changedTouches[0].pageY;
                }else{
                    _pageX = e.pageX;
                    _pageY = e.pageY;
                }
                var px = (pageX - _pageX);
                var absPx = px > 0 ? px : -px;
                var py = (pageY - _pageY);
                var absPy = py > 0 ? py : -py;
                if(!$.Slider.isAnimate){
                    if(absPx > absPy){
                        if(absPx > that.option.swipeOffSet){
                            if(px > 0){
                                that.slide(1, "left");
                            }else{
                                that.slide(-1, "right");
                            }
                        }
                    }else{
                        if(absPy > that.option.swipeOffSet){
                            if(py > 0){
                                that.slide(-1, "bottom");
                            }else{
                                that.slide(1, "top");
                            }
                        }
                    }
                }
            });
        },
        start:function(){
            var that = this;
            if(this.option.auto){
                this.intervalID = window.setInterval(function(){
                    that._complete.call(that);
                }, this.option.interval);
            }
        },
        restart:function(index){
            if(this.intervalID){
                window.clearInterval(this.intervalID);
                this.intervalID = null;
            }
            this.current = index;
            this.change.call(this);
            this.start.call(this);
        },
        restartOffset:function(offset){
            var max = this.main.num - 1;
            var count = this.current + offset;
            if(count > max){
                count = 0;
            }
            if(count < 0){
                count = max;
            }
            this.restart(count);
        },
        change:function(){
            this.main.change(this.current);
            if(this.thum){
                this.thum.change(this.current);
            }
            this.option.change.call(this, this.main, this.thum);
        },
        slide:function(val, direction){
            this.current = this.current + val;
            if(this.current >= this.main.num){
                this.current = 0;
            }else if(this.current < 0){
                this.current = this.main.num - 1;
            }
            this.main.slide(this.current, direction);
            if(this.thum){
                this.thum.change(this.current);
            }
            this.option.change.call(this, this.main, this.thum);
        },
        _complete:function(){
            if(this.current < this.main.num - 1){
                this.current++;
            }else{
                this.current = 0;
            }
            this.change();
        }
    });
    
    /**
     * 各セレクタをターゲットにインスタンスを生成する。
     */
    $.fn.slider = function(option){
        return this.each(function(){
            var instance = new $.Slider($(this));
            instance._setOption(option);
            instance._init();
        });
    };
    
})(jQuery, this, this.document);

$(function(){
    $(".slider").slider({
        // presen:true,
        swipe:true,
        thum:".thumbnails",
        pre:".pre",
        next:".next",
        easing:"ease-In-Out-Cubic", // CSS3 と JSでの名前の違いあり。(CSS3では Cubic を省略)
        duration:800,
        init:function(main, thum){
            thum.$current.css("background", "#0000ff");
        },
        change:function(main, thum){
            thum.$pre.css("background", "#336699");
            thum.$current.css("background", "#0000ff");
        }
    });
});