const bc = 8; //bulletの数
const mc = 20; //モンスターの数
var startTime = new Array(bc);
var nowTime = new Array(bc);
var csx = new Array(bc); //カメラの向きｘ
var csy = new Array(bc); //カメラの向きｙ
var spx = new Array(bc); //カメラの位置ｘ
var spy = new Array(bc); //カメラの位置ｙ
var spz = new Array(bc); //カメラの位置ｚ
var hitCount = 0; //被弾したモンスターの数
var time = 60; //タイマー秒数
var warningFlag = false; //警告音が鳴ったかどうか
var gameFlag = false; //ゲームがスタートしたかどうか
var retryFlag = false; //リトライしてもよいか
var shootOn; //ID
var timerId; //ID
var beforeId; //1つ前のshootOnID
var shootCnt=0; //連射の数

//クリックON
function clickOn() {
  const scene = document.querySelector("a-scene");
  const camera = document.getElementById("camera");
  let startText = document.getElementById("startText");
  let timerText = document.getElementById("timerText");
  let countText = document.getElementById("countText");
  let endText = document.getElementById("endText");

  if(retryFlag){
    return;
  }
  if (!gameFlag && startText.getAttribute("visible")) {
    if(endText){
      camera.removeChild(endText);
    }
    startText.setAttribute("visible", "false");
    monsterDisp();
    
    hitCount = 0;
    time = 60;
    timerText.setAttribute("color", "cyan");
    timerText.setAttribute("value", time);
    let str = hitCount + " / " + mc;
    countText.setAttribute("value", str);
    timerId = setInterval(showClock, 1000);
    gameFlag = true;
  } else {
    setTimeout(shot);
    beforeId=shootOn;
    shootOn = setInterval(shot, 300);
  }
}

//弾の発射
var shot = function () {
  let num = getBullet();
  startTime[num] = new Date().getTime();
  const ban = new Audio(
    "https://cdn.glitch.global/95f1d303-7f12-4a05-9cdf-ccadca6e370f/shot.mp3?v=1713753072464"
  );
  ban.play();
  shootCnt++;
  if(shootCnt>4){
    clearInterval(shootOn);
    shootCnt=0;
  }
};

//クリックOFF
function clickOff() {
  if (gameFlag) {
    clearInterval(beforeId);
    clearInterval(shootOn);
    shootCnt=0;
  }
}

//モンスターの表示
function monsterDisp(){
  for (let i = 0; i < mc; i++) {
    let monster = document.getElementById("monster" + i);
    monster.setAttribute("visible", "true");
  }
}
//モンスターを非表示にする
function monsterHidden(){
  for (let i = 0; i < mc; i++) {
    let monster = document.getElementById("monster" + i);
    monster.setAttribute("visible", "false");
  }
}

//発射可能な弾の取得
function getBullet() {
  let cnt;
  for (cnt = 0; cnt < bc; cnt++) {
    let bullet = document.getElementById("bullet" + cnt);
    if (bullet.getAttribute("visible") == false) {
      const camera = document.querySelector("#camera");
      let cameraPosition = camera.getAttribute("position");
      let cameraRotation = camera.getAttribute("rotation");
      spx[cnt] = cameraPosition.x;
      spy[cnt] = cameraPosition.y;
      spz[cnt] = cameraPosition.z;
      csx[cnt] = cameraRotation.x;
      csy[cnt] = cameraRotation.y;
      bullet.setAttribute("position", {
        x: spx[cnt],
        y: spy[cnt],
        z: spz[cnt],
      });
      bullet.setAttribute("visible", "true");
      break;
    }
  }
  return cnt;
}

//発射済み弾の移動
var bulletMove = function () {
  for (let i = 0; i < bc; i++) {
    let bullet = document.getElementById("bullet" + i);

    if (bullet) {
      nowTime[i] = new Date().getTime();
      let time = nowTime[i] - startTime[i];
      if (time >= 2000) {
        bullet.setAttribute("visible", "false");
      } else {
        let bulletPos = bullet.getAttribute("position");
        bullet.setAttribute("position", {
          x:
            bulletPos.x +
            (Math.sin((csy[i] * Math.PI) / 180) *
              Math.cos((csx[i] * Math.PI) / 180) *
              -time) /
              500,
          y: bulletPos.y + (Math.sin((csx[i] * Math.PI) / 180) * time) / 500,
          z:
            bulletPos.z +
            (Math.cos((csy[i] * Math.PI) / 180) *
              Math.cos((csx[i] * Math.PI) / 180) *
              -time) /
              500,
        });

        colliderCheck(bullet);
      }
    }
  }
};
setInterval(bulletMove, 100);

//モンスターと弾の衝突チェック
function colliderCheck(bullet) {
  let bulletPos = bullet.getAttribute("position");
  let bulletRad = bullet.getAttribute("scale");
  let bulletX = bulletPos.x;
  let bulletY = bulletPos.y;
  let bulletZ = bulletPos.z;
  let bulletR = bulletRad.x;
  if (!gameFlag) {
    return;
  }
  for (let i = 0; i < mc; i++) {
    let monster = document.getElementById("monster" + i);
    let monsterPos = monster.getAttribute("position");
    let monsterRad = monster.getAttribute("scale");
    let monsterX = monsterPos.x;
    let monsterY = monsterPos.y;
    let monsterZ = monsterPos.z;
    let monsterR = monsterRad.x;

    let distance = Math.sqrt(
      (monsterX - bulletX) * (monsterX - bulletX) +
        (monsterY - bulletY) * (monsterY - bulletY) +
        (monsterZ - bulletZ) * (monsterZ - bulletZ)
    );
    if (distance < monsterR) {
      if (monster.getAttribute("visible")) {
        bullet.setAttribute("visible", "false");
        //エフェクト表示
        effect(monsterPos);
        setTimeout(ce, 1500);
        const don = new Audio(
          "https://cdn.glitch.global/95f1d303-7f12-4a05-9cdf-ccadca6e370f/hit.mp3?v=1714116939953"
        );
        don.play();
        hitCount++;
        const countText = document.getElementById("countText");
        let str = hitCount + " / " + mc;
        countText.setAttribute("value", str);
        if (hitCount == mc) {
          clearInterval(timerId);
          gameEnd();
        }
      }
      monster.setAttribute("visible", "false");
    }
  }
}

//タイマー表示
function showClock() {
  if (!gameFlag) {
    return;
  }
  time--;
  const beep = new Audio(
    "https://cdn.glitch.global/95f1d303-7f12-4a05-9cdf-ccadca6e370f/warning.mp3?v=1714190612758"
  );
  const timerText = document.getElementById("timerText");
  if (time > 21) {
    timerText.setAttribute("color", "cyan");
  } else if (time > 6 && time < 21) {
    timerText.setAttribute("color", "yellow");
    if (!warningFlag) {
      beep.play();
      warningFlag = true;
    }
  } else if (time > 0 && time < 6) {
    timerText.setAttribute("color", "red");
    beep.play();
  }

  timerText.setAttribute("value", time);
  if (time <= 0) {
    clearInterval(timerId);
    warningFlag = false;
    gameEnd();
  }
}

//ゲームの終了処理
function gameEnd() {
  const camera = document.getElementById("camera");
  let startText = document.getElementById("startText");
  let text = document.createElement("a-text");
  text.setAttribute("id", "endText");
  text.setAttribute("position", "-0.28 0.2 -1");
  text.setAttribute("width", "2");
  if (hitCount == mc && time > 0) {
    text.setAttribute("color", "blue");
    text.setAttribute("value", "GAME CLEAR");
  } else {
    text.setAttribute("color", "red");
    text.setAttribute("value", "GAME OVER!");
  }
  camera.appendChild(text);
  startText.setAttribute("visible", "true");
  gameFlag = false;
  clearInterval(shootOn);
  monsterHidden();
  retryFlag = true;
  monsterReset();
  setTimeout(() => {
    retryFlag = false;
  }, 3000);
}
 
//弾の作成
function bulletCreat(){
  const scene = document.querySelector("a-scene");
    for (let i = 0; i < bc; i++) {
      let bullet = document.createElement("a-sphere");
      bullet.setAttribute("bulletMove", "");
      bullet.setAttribute("id", "bullet" + i);
      bullet.setAttribute("position", "0 0 0");
      bullet.setAttribute("scale", "0.3 0.3 0.3");
      bullet.setAttribute("color", "yellow");
      bullet.setAttribute("visible", "false");
      bullet.setAttribute("class", "collidable");
      scene.appendChild(bullet);
    }
 }
//モンスターの作成
function monsterCreat() {
  const scene = document.querySelector("a-scene");
  let posx;
  let posz;
  for (let i = 0; i < mc; i++) {
    let monster = document.createElement("a-entity");
    var random = Math.random() * 8;
    if (Math.floor(Math.random() * 2) == 1) {
      posx = random;
    } else {
      posx = -random;
    }

    let posy = Math.random() * 5;
    random = Math.random() * 16;
    if (Math.floor(Math.random() * 2) == 1) {
      posz = random;
    } else {
      posz = -random;
    }
    let roty = Math.random() * 360;
    let animno = i % (mc / (mc / 5));
    monster.setAttribute("id", "monster" + i);
    monster.setAttribute("position", { x: posx, y: posy, z: posz });
    monster.setAttribute("scale", "1 1 1");
    monster.setAttribute("rotation", { x: 0, y: roty, z: 0 });
    if (Math.floor(Math.random() * 2) == 1) {
      monster.setAttribute("gltf-model", "#red");
    } else {
      monster.setAttribute("gltf-model", "#blue");
    }
    switch (animno) {
      //回転
      case 0:
        monster.setAttribute("animation", {
          property: "rotation",
          from: "0 0 0",
          to: "0 360 0",
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //左右移動
      case 1:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx + 2, y: posy, z: posz },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //上下移動
      case 2:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx, y: posy + 2, z: posz },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //前後移動
      case 3:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx, y: posy, z: posz + 2 },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //斜め移動
      default:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx + 2.0, y: posy + 2.0, z: posz + 2.0 },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
    }
    monster.setAttribute("visible", "false");
    scene.appendChild(monster);
  }
}

//モンスターの再設定
function monsterReset(){
  let posx;
  let posz;
  for (let i = 0; i < mc; i++) {
    let monster = document.getElementById("monster" + i);
    var random = Math.random() * 8;
    if (Math.floor(Math.random() * 2) == 1) {
      posx = random;
    } else {
      posx = -random;
    }

    let posy = Math.random() * 5;
    random = Math.random() * 16;
    if (Math.floor(Math.random() * 2) == 1) {
      posz = random;
    } else {
      posz = -random;
    }
    let roty = Math.random() * 360;
    let animno = i % (mc / (mc / 5));
    monster.setAttribute("position", { x: posx, y: posy, z: posz });
    monster.setAttribute("rotation", { x: 0, y: roty, z: 0 });
    if (Math.floor(Math.random() * 2) == 1) {
      monster.setAttribute("gltf-model", "#red");
    } else {
      monster.setAttribute("gltf-model", "#blue");
    }
    switch (animno) {
      //回転
      case 0:
        monster.setAttribute("animation", {
          property: "rotation",
          from: "0 0 0",
          to: "0 360 0",
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //左右移動
      case 1:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx + 2, y: posy, z: posz },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //上下移動
      case 2:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx, y: posy + 2, z: posz },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //前後移動
      case 3:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx, y: posy, z: posz + 2 },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //斜め移動
      default:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx + 2.0, y: posy + 2.0, z: posz + 2.0 },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
    }
    monster.setAttribute("visible", "false");
  }
}

//エフェクトの表示
function effect(monsterPos) {
  var posx = monsterPos.x;
  var posy = monsterPos.y;
  var posz = monsterPos.z;
  const scene = document.querySelector("a-scene");
  const entity = document.createElement("a-entity");

  for (let i = 0; i < 360; i += 30) {
    let sphere1 = document.createElement("a-sphere");
    let radian = (i * Math.PI) / 180;
    let posx1 = posx + Math.cos(radian) * 0.5;
    let posz1 = posz + Math.sin(radian) * 0.5;
    let dur1 = 2000 + Math.random() * 2000;
    let rad1 = 0.08 + Math.random() * 0.1;
    sphere1.setAttribute("position", { x: posx1, y: posy, z: posz1 });
    sphere1.setAttribute("radius", rad1);
    sphere1.setAttribute("material", {
      shader: "gradientshader",
      topColor: "purple",
      bottomColor: "white",
    });
    sphere1.setAttribute("animation", {
      property: "position",
      from: { x: posx1, y: posy, z: posz1 },
      to: { x: posx1, y: posy + 10, z: posz1 },
      dur: dur1,
      loop: false,
    });
    entity.appendChild(sphere1);
  }
  entity.setAttribute("id", "ef");
  scene.appendChild(entity);
}

//エフェクト削除
var ce = function clearEffect() {
  const scene = document.querySelector("a-scene");
  let ef = document.getElementById("ef");
  scene.removeChild(ef);
};
