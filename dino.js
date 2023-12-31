const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

var audio = new Audio('bgm.mp3');
var jumpsound = new Audio('jump.wav');
var point = new Audio('point.wav')
let score; //현재 점수
let score2; //낮과 밤 조정시 사용
let score3; //500점 마다 사운드 출력시 사용
let score2Text;
let scoreText; //현재 점수 텍스트
let highscore; //최고 점수
let highscoreText; //최고 점수 텍스트
let dino; //공룡
let gravity; // 중력값
let obstacles = []; //장애물
let gameSpeed; // 게임 속도
let keys = {}; // 키 값

let tempSeoul = 0;
//이벤트 리스너 추가
document.addEventListener('keydown', function (evt) {
    keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
    keys[evt.code] = false;
});

const getJSON = function(url, callback){
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json'
  xhr.onload = function() {
    const status = xhr.status;
    if(status === 200){
      callback(null, xhr.response);
    }
    else{
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

// getJSON('https://api.openweathermap.org/data/2.5/weather?q=%20seoul&appid=475f32616c3a7d7421e40edcde2c0227&units=metric'
// ,
// function(err, data){
//   if(err !== null){
//     alert('예상치 못한 오류 발생.' + err);
//   }
//   else{
//     tempSeoul = data.main.temp;
//     alert(`현재
//       온도는 ${data.main.temp}°
//       풍속은 ${data.wind.speed}m/s
//       습도는 ${data.main.humidity}%
//       입니다.

//       오늘의
//         최고기온은 ${data.main.temp_max}°
//         최저기온은 ${data.main.temp_min}°
//       입니다.`)
//   }
// });

class Text{
  constructor(t, x, y, a, c, s){
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw(){
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = this.s + "px sans-serif";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }

}

class Obstacle{
  constructor(x, y, w, h, c){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dx = -gameSpeed;
    this.isBird = false;
  }

  Update(){
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw(){
    var img = new Image()
    if(this.isBird == true){
      img.src = 'bird.png'
      ctx.drawImage(img,this.x, this.y, this.w, this.h);
    }
    else{
      img.src = 'catus.png'
      ctx.drawImage(img,this.x, this.y, this.w, this.h)
    }
  }
}

class Dino {
    constructor (x, y, w, h, c) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.c = c;
  
      this.dy = 0; //점프를 위한 
      this.jumpForce = 10; //
      this.originalHeight = h; //숙이기 전 높이
      this.grounded = false; //땅에 있는지 판단
      this.jumpTimer =0 ; // 점프 시간 체크를 위한 타이머 추가
    }

    Draw(){
        var img = new Image()
        if((keys[''] || keys['']) && this.grounded){
          img.src = 'dino_down.png'
          ctx.drawImage(img,this.x, this.y, this.w, this.h)
        }
        else{
          if(tempSeoul<15){
          img.src = 'dino_up.png'
        ctx.drawImage(img,this.x, this.y, this.w, this.h);
      }
      else{
        img.src = 'dino_up.png'
        ctx.drawImage(img,this.x, this.y, this.w, this.h);
      }
    }
  }

    Jump () { //점프함수 추가
        if (this.grounded && this.jumpTimer == 0) {  //땅에 있는지 && 타이머 =0 
          this.jumpTimer = 1;
          this.dy = -this.jumpForce; 
          jumpsound.volume = 1;
          jumpsound.play();
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
          this.jumpTimer++;
          this.dy = -this.jumpForce - (this.jumpTimer / 50); //갈수록 빠르게 떨어지는 것 구현
        }
    }

    Animate () {
        // 키 입력 
        if (keys['Space'] || keys['KeyW']) { // 스페이스바 or 키보드 W 입력시
            this.Jump();
        } else {
            this.jumpTimer = 0;
        }
    
        if ((keys[''] || keys['']) && this.grounded) {  // 왼쉬프트 or 키보드 S 입력시
            this.y += this.h/2 
            this.h = this.originalHeight / 2; //h를 절반으로 줄여서 숙인 것과 같은 효과
        } else {
            this.h = this.originalHeight;
        }
    
        this.y += this.dy; //위치 변경

        //중력적용
        if (this.y + this.h < canvas.height) { //공중에 떠 있을 때
          this.dy += gravity; // 중력만큼 dy++
          this.grounded = false; 
        } else {
          this.dy = 0; 
          this.grounded = true;
          this.y = canvas.height - this.h; //바닥에 딱 붙어 있게 해줌
        }

        //this.y += this.dy; <-삭제 (뒤에 쓰면 중력 적용할 때 문제가 생김)

        this.Draw();
      }
  }

// 배경 색상을 변경하는 함수
function changeBackgroundColor() {
  const body = document.body;

  // 만약 점수가 특정 값에 도달하면 배경 색상을 변경
  if (score2 >= 2000 && score2 <= 4000) {
    body.classList.add('score-reached');
    if(score2 == 4000){
      score2 = 0;
    }
  } else {
    body.classList.remove('score-reached');
  }
}

  function init() {
    obstacles = [];
    score = 0;
    score2 = 0;
    score3 = 0;
    spawnTimer = initialSpawnTimer;
    gameSpeed = 3;
    window.localStorage.setItem('highscore', highscore);
    location.href = 'GameOver.html'
  }

function SpawnObstacle(){
  let size = RandomIntRange(20, 70);
  let type = RandomIntRange(0, 1);
  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#2484E4')

  if(type == 1){
    obstacle.y -= dino.originalHeight - 10;
    obstacle.isBird = true;
  }
  obstacles.push(obstacle);
}

function RandomIntRange (min, max){
  return Math.round(Math.random() * (max - min) + min);
}

function Start () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    ctx.font = "20px sans-serif";
  
    gameSpeed = 3;
    gravity = 1;
  
    score = 0;
    score2 = 0;
    score3 = 0;
    highscore = 0;
    // audio.play();
    // audio.loop = true;
    // audio.volume = 0.02;
  
  if(localStorage.getItem('highscore')){
    highscore = localStorage.getItem('highscore');
  }

    dino = new Dino(25,canvas.height-150,50,50,"pink");
    //dino.Draw();// <- 업데이트 함수에서 그리기 위해서 삭제
    scoreText = new Text("Score: " + score, 25, 25, "left", "212121", "20")
    score2Text = new Text("Score: " + score, 50, 50, "left", "212121", "20")

    highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

    requestAnimationFrame(Update); // 추가
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update () {
    requestAnimationFrame(Update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dino.Animate(); //공룡한테 애니메이션 주는 함수 <-여기서 그려줄거임
    changeBackgroundColor();
    spawnTimer--;
    if(spawnTimer <= 0){
      SpawnObstacle();
      console.log(obstacles);
      spawnTimer = initialSpawnTimer - gameSpeed * 8;

      if(spawnTimer < 60){
        spawnTimer = 60;
      }
    }

    for(let i = 0; i<obstacles.length; i++){
      let o = obstacles[i];

      if(o.x + o.w < 0){
        obstacles.splice(i, 1);
      }
      if(
        dino.x < o.x + o.w &&
        dino.x + dino.w > o.x &&
        dino.y < o.y + o.h &&
        dino.y + dino.h > o.y
      ){
        init();
      }
      o.Update();
    }
    score3++;
    score2++;
    score++;
    if(score3 / 1000 == 1){
      point.volume = 1;
      point.play();
      score3 = 0;
    }
    scoreText.t = "Score: " + score;
    score2Text.t = "Score2: " + score2;
    //score2Text.Draw()
    scoreText.Draw();

    if(score > highscore){
      highscore = score;
      highscoreText.t = "Highscore: " + highscore;
    }

    highscoreText.Draw();

    gameSpeed += 0.003;
}  
Start();