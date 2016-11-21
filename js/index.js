(function () {
    var dataAry = ["img/banner1.png", "img/banner2.png", "img/banner3.png", "img/banner4.png", "img/banner5.png"];

    var count = dataAry.length, step = 1;
    var inner = document.getElementById("inner"), imgList = inner.getElementsByTagName("img");
    var tip = document.getElementById("tip"), tipList = tip.getElementsByTagName("span");
    var winW = document.querySelector(".banner").offsetWidth;

    //1、实现数据绑定
    ~function () {
        var str = "", strTip = "";
        str += "<img src='' trueImg='" + dataAry[count - 1] + "'/>";
        for (var i = 0; i < count; i++) {
            str += "<img src='' trueImg='" + dataAry[i] + "'/>";

            strTip += "<span></span>";
        }
        str += "<img src='' trueImg='" + dataAry[0] + "'/>";
        inner.innerHTML = str;
        tip.innerHTML = strTip;

        //->需要给inner及里面的图片动态的绑定一些基本的样式
        inner.style.width = (count + 2) * winW + "px";
        inner.style.left = -winW + "px";
        [].forEach.call(imgList, function (curImg, index) {
            curImg.style.width = winW + "px";
        });
        selectTip();
    }();

    //2、实现图片的延迟加载
    window.setTimeout(lazyImg, 500);
    function lazyImg() {
        [].forEach.call(imgList, function (curImg, index) {
            var oImg = new Image;
            oImg.src = curImg.getAttribute("trueImg");
            oImg.onload = function () {
                curImg.src = this.src;
                curImg.className = "opacityMove";
            }
        });
    }

    //3、实现焦点选中
    function selectTip() {
        var temp = step;
        temp > count ? temp = 1 : null;
        temp < 1 ? temp = count : null;
        [].forEach.call(tipList, function (curTip, index) {
            curTip.className = (temp - 1) === index ? "select" : null;
        });
    }


    //4、实现自动轮播
    var autoTimer = null, autoInterval = 3000;
    autoTimer = window.setInterval(autoMove, autoInterval);
    function autoMove() {
        inner.style.webkitTransitionDuration = "0.5s";
        step++;
        inner.style.left = -step * winW + "px";
        selectTip();

        if (step > count) {
            window.setTimeout(function () {
                inner.style.webkitTransitionDuration = "0s";
                inner.style.left = -winW + "px";
                step = 1;
            }, 500);
        }
    }

    //5、实现左右滑动
    ["start", "move", "end"].forEach(function (item) {
        inner.addEventListener("touch" + item, eval(item), false);
    });

    function start(e) {
        //console.dir(e);//->TouchEvent:changedTouches、targetTouches、touches(TouchList->包含了当前手的位置信息)

        //->滑动开始:禁止自动轮播,取消当前元素的过渡效果
        window.clearInterval(autoTimer);
        this.style.webkitTransitionDuration = "0s";

        //->记录当前元素的开始的坐标和left值
        var touchPoint = e.touches[0];
        this["strX"] = touchPoint.pageX;
        this["strY"] = touchPoint.pageY;
        this["strL"] = parseFloat(this.style.left);
    }

    function move(e) {
        //->获取最新的坐标
        var touchPoint = e.touches[0];
        this["endX"] = touchPoint.pageX;
        this["endY"] = touchPoint.pageY;

        //->判断是否发生滑动，并且获取滑动的方向
        this["swipeFlag"] = isSwipe(this["strX"], this["endX"], this["strY"], this["endY"]);
        //->说明发生了滑动
        if (this["swipeFlag"]) {
            this["swipeDir"] = swipeDirection(this["strX"], this["endX"], this["strY"], this["endY"]);
            //->只有左右滑动才操作
            if (/^(Right|Left)$/.test(this["swipeDir"])) {

                //->计算滑动的距离,并且让当前的元素的left跟着改变
                this["changeX"] = this["endX"] - this["strX"];
                this.style.left = this["strL"] + this["changeX"] + "px";
            }
        }
    }

    function end(e) {
        //->结束的时候判断是否发生滑动
        if (this["swipeFlag"]) {
            if (this["swipeDir"] === "Left") {
                if (Math.abs(this["changeX"]) >= (winW / 4)) {
                    step++;
                }
            }
            if (this["swipeDir"] === "Right") {
                if (Math.abs(this["changeX"]) >= (winW / 4)) {
                    step--;
                }
            }
        }
        this.style.webkitTransitionDuration = "0.5s";
        this.style.left = -step * winW + "px";
        selectTip();

        //->滑动的边界判断:当我们滑动到最后一张的时候(0.5s),我们让当前的inner立马回到step=1的时候的位置
        var _this = this;
        if (step > count) {
            window.setTimeout(function () {
                _this.style.webkitTransitionDuration = "0s";
                _this.style.left = -winW + "px";
                step = 1;
            }, 500);
        }
        if (step < 1) {
            window.setTimeout(function () {
                _this.style.webkitTransitionDuration = "0s";
                _this.style.left = -count * winW + "px";
                step = count;
            }, 500);
        }

        //->开启自动轮播,并且把之前设置的那些自定义属性的值赋值为null
        autoTimer = window.setInterval(autoMove, autoInterval);
        ["strX", "strY", "strL", "endX", "endY", "swipeDir", "swipeFlag", "changeX"].forEach(function (item) {
            _this[item] = null;
        });
    }

    function isSwipe(strX, endX, strY, endY) {
        return Math.abs(endX - strX) > 30 || Math.abs(endY - strY) > 30;
    }

    function swipeDirection(strX, endX, strY, endY) {
        var changeX = endX - strX;
        var changeY = endY - strY;
        return Math.abs(changeX) > Math.abs(changeY) ? (changeX > 0 ? "Right" : "Left") : (changeY > 0 ? "Down" : "Up");
    }

})();






//下面是实现切换页面的代码
//var main = document.querySelector("#main");
//var oLis = document.querySelectorAll("#list>li");
//var winW = document.documentElement.clientWidth;
//var winH = document.documentElement.clientHeight;
//var desW = 640;//得到设计稿的宽和高
//var desH = 960;
//if(winW/winH<desW/desH){//按照高度比例去缩放
//    main.style.webkitTransform = "scale("+winH/desH+")";
//}else{//按照宽度比例去缩放
//    main.style.webkitTransform = "scale("+winW/desW+")";
//}
//
//[].forEach.call(oLis,function(){
//    var oLi = arguments[0];
//    oLi.index = arguments[1];
//    oLi.addEventListener("touchstart",start,false);
//    oLi.addEventListener("touchmove",move,false);
//    oLi.addEventListener("touchend",end,false);
//});
//
//function start(e){
//    this.startX = e.changedTouches[0].pageY;
//}
//function move(e){
//    this.flag = true;
//    var moveTouch = e.changedTouches[0].pageY;
//    var movePos = moveTouch-this.startX;
//    var index = this.index;
//    [].forEach.call(oLis,function(){
//        arguments[0].className = "";
//        if(arguments[1]!=index){
//            arguments[0].style.display = "none"
//        }
//        arguments[0].firstElementChild.id="";
//
//    });
//    if(movePos>0){
//        this.prevSIndex = (index == 0?oLis.length-1:index-1);
//        var duration = -winH+movePos;
//    }else if(movePos<0){
//        this.prevSIndex = (index == oLis.length-1?0:index+1);
//        var duration = winH+movePos;
//    }
//    oLis[this.prevSIndex].style.webkitTransform = "translate(0,"+duration+"px)"
//    oLis[this.prevSIndex].className = 'zIndex';
//    oLis[this.prevSIndex].style.display ="block";
//}
//function end(e){
//    if(this.flag){
//        oLis[this.prevSIndex].style.webkitTransform = "translate(0,0)";
//        oLis[this.prevSIndex].style.webkitTransition = "0.5s ease-out";
//        oLis[this.prevSIndex].addEventListener("webkitTransitionEnd",function(e){
//            if(e.target.tagName =="LI"){
//                this.style.webkitTransition = "";
//            }
//            this.firstElementChild.id="a"+(this.index+1);
//        },false)
//    }
//
//}
//window.addEventListener("load", function () {
//    //init music
//    var music = document.querySelector(".music");
//    var musicAudio = music.querySelector("audio");
//    musicAudio.addEventListener("canplay", function () {
//        music.style.display = "block";
//        music.className = "music move";
//    }, false);
//    musicAudio.play();
//
//    $t.tap(music, {
//        end: function () {
//            if (musicAudio.paused) {
//                musicAudio.play();
//                music.className = "music move";
//                return;
//            }
//            musicAudio.pause();
//            music.className = "music";
//        }
//    });
//}, false);