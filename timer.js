function CocoaTimer() {
  this.remainingTime = 0;
  this.targetTime = 0;
  this.timer = 0;
  // timer-image
  this.TIMER_CANVAS_SIZE = 380;
  this.TIMER_COVER_COLOR = '#f0fff0';
  this.TIMER_COVER_LINE_COLOR = '#2e8b57';
  // canvas準備
  const canvas = document.getElementById('timer-canvas');
  canvas.height  = this.TIMER_CANVAS_SIZE;
  canvas.width  = this.TIMER_CANVAS_SIZE;
  this.ctx = canvas.getContext('2d');

  // 画像
  this.baseImage = new Image();
  this.baseImage.src = 'timer-base.png';  // 画像のURLを指定
  const cocoa = this;
  this.baseImage.onload = function(){
    cocoa.drawCover(360);
  };
  // alerm
  this.alerm = new Audio('hato2.mp3');
  this.isAlermPlaying = false;
};

CocoaTimer.prototype.clearTimerCanvas = function() {
  this.ctx.clearRect(0, 0, this.TIMER_CANVAS_SIZE, this.TIMER_CANVAS_SIZE);
  // 横幅に合わせて正方形で表示
  this.ctx.drawImage(this.baseImage, 0, 0, 
                      this.baseImage.naturalWidth, this.baseImage.naturalWidth,
                      0, 0, this.TIMER_CANVAS_SIZE, this.TIMER_CANVAS_SIZE );
};

// 12時の位置からの角度を指定
CocoaTimer.prototype.drawCover = function(degree){
  const radius = this.TIMER_CANVAS_SIZE/2
  // パスをリセット
  this.ctx.beginPath () ;
  // 開始角度: 90 * Math.PI / 180 : 12時の方向からスタート
  // 終了角度: -1 * (degree + 90) * Math.PI / 180 : degreeは初期値360度で段々減っていく
  // 方向: true=反時計回りの円、false=時計回りの円
  this.ctx.arc( radius, radius, radius, -90 * Math.PI / 180, -1 * (degree + 90) * Math.PI / 180, true ) ;
  this.ctx.lineTo(radius, radius);

  // 塗りつぶしの色
  this.ctx.fillStyle = this.TIMER_COVER_COLOR;
  // 塗りつぶしを実行
  this.ctx.fill() ;

  // 線の色
  this.ctx.strokeStyle = this.TIMER_COVER_COLOR;
  // 線の太さ
  this.ctx.lineWidth = 2 ;
  // 線を描画を実行
  this.ctx.stroke() ;


  // パスをリセット
  this.ctx.beginPath () ;
  this.ctx.arc( radius, radius, radius, -1 * (degree + 90) * Math.PI / 180, -1 * (degree + 90) * Math.PI / 180, true ) ;
  this.ctx.lineTo(radius, radius);
  // 線の色
  this.ctx.strokeStyle = this.TIMER_COVER_LINE_COLOR ;
  // 線の太さ
  this.ctx.lineWidth = 1 ;
  // 線を描画する
  this.ctx.stroke() ;
};

 CocoaTimer.prototype.startAlerm = function() {
    this.alerm.play();
    this.alerm.loop = true;  // ループ再生
    this.isAlermPlaying = true;
 };

 CocoaTimer.prototype.stopAlerm = function() {
  this.alerm.pause();
  this.alerm.loop = false;
  this.alerm.currentTime = 0;
  this.isAlermPlaying = false;
};



CocoaTimer.prototype.drawTime = function() {
  let degree = 360;
  if(this.targetTime > 0) {
    degree = (360* this.remainingTime/ this.targetTime);
  }
  console.log('drawTime: degree:' + degree);
  this.clearTimerCanvas();
  this.drawCover(degree);

  let timeArray = cocoaTimer.remainingTimeArray()
  document.getElementById('timer-digit').innerHTML =
    timeArray[0] + timeArray[1] + ':' + timeArray[2] + timeArray[3];
};

CocoaTimer.prototype.resetTime = function(){
  this.remainingTime = 0;
  this.targetTime = 0;
  this.timer = 0;
  this.drawTime();
  this.stopAlerm();
}

/*
  1minute = 60000ms
  1second = 1000ms
*/
CocoaTimer.prototype.remainingTimeArray = function(){
  const minute = Math.floor(this.remainingTime /60000);
  const second = Math.floor((this.remainingTime - 60000 * minute) / 1000 );
  console.log('minute: ' + minute + ' secont:' + second);
  return [ String(Math.floor(minute/10)), String(minute % 10), 
           String(Math.floor(second/10)), String(second % 10)
         ];
}

CocoaTimer.prototype.addRemainingTime = function(milliSeconds) {
  const newRemainingTime = this.remainingTime + milliSeconds;
  
  // 60分未満の時だけ足す
  if (newRemainingTime < 3600000) {
    this.remainingTime = newRemainingTime;
    // タイムをセットする時だけターゲットにセット
    if(cocoaTimer.timer == 0) {
      this.targetTime = newRemainingTime;
      console.log('targetTime:' + this.targetTime);
    }
  }
}

CocoaTimer.prototype.start = function(milliSeconds) {
  const INTERVAL_TIME = 1000;
  const cocoaTimer = this;
  const recalc = function(){
    
    cocoaTimer.addRemainingTime(-1 * INTERVAL_TIME);
    console.log('cocoaTimer.remainingTime: ' + cocoaTimer.remainingTime );

    if( cocoaTimer.remainingTime < 0) {
      // アラーム音
      if( !cocoaTimer.isAlermPlaying) {
        cocoaTimer.startAlerm();
      }
      // カバーなしにクリア
      cocoaTimer.clearTimerCanvas();
      document.getElementById('timer-digit').innerHTML = '時間だよ！'
    } else {
      cocoaTimer.drawTime();
      console.log(cocoaTimer.remainingTimeArray());
    }    
  }
  // setInterval実行中は処理しない
  // setIntervalは、0ではない正の整数値を戻す
  if (cocoaTimer.timer == 0) {
    cocoaTimer.timer = setInterval(recalc, INTERVAL_TIME);
    console.log('cocoaTimer.timer:' + cocoaTimer.timer);
  }
}


const cocoaTimer = new CocoaTimer();

window.onload = function(){

  cocoaTimer.resetTime();

  // スタートボタン
  document.getElementById('timer-start').addEventListener("click", function(){
    cocoaTimer.start();
  });
 
  // ストップボタン
   document.getElementById('timer-stop').addEventListener("click", function(){
    clearInterval(cocoaTimer.timer );
    cocoaTimer.timer = 0;
    cocoaTimer.stopAlerm();
  });

  // リセットボタン
  document.getElementById('timer-reset').addEventListener("click", function(){
    clearInterval(cocoaTimer.timer );
    cocoaTimer.resetTime();
    cocoaTimer.stopAlerm();
  });

  // 10分
  document.getElementById('button-10min').addEventListener("click", function(){
    cocoaTimer.addRemainingTime(600000);
    cocoaTimer.drawTime();
    console.log( cocoaTimer.remainingTime);
  });

  // 1分
  document.getElementById('button-1min').addEventListener("click", function(){
    cocoaTimer.addRemainingTime(60000);
    cocoaTimer.drawTime();
    console.log( cocoaTimer.remainingTime);
  });

  // 10秒
  document.getElementById('button-10sec').addEventListener("click", function(){
    cocoaTimer.addRemainingTime(10000);
    cocoaTimer.drawTime();
    console.log( cocoaTimer.remainingTime);
  });

  // 1秒
  document.getElementById('button-1sec').addEventListener("click", function(){
    cocoaTimer.addRemainingTime(1000);
    cocoaTimer.drawTime();
    console.log( cocoaTimer.remainingTime);
  });
}