import CreateController from './createController.js';

const showInfo = (element) => {
  console.log("showInfo");

  let x;
  let y;

  let previewWindowX = 700;
  let previewWindowY = 495;
  let windowMargin = 16;
  let objectMargin = 36;

  let xMin = windowMargin;
  let xMax = previewWindowX - windowMargin;
  let yMin = windowMargin;
  let yMax = previewWindowY - windowMargin;

  let objectX = parseFloat(element.style.left);
  let objectY = parseFloat(element.style.top);
  let objectWidth = parseFloat(element.style.width);
  let objectHeight = parseFloat(element.style.height);

  let centerX = objectX + objectWidth / 2;
  let centerY = objectY + objectHeight / 2;

  let info = document.getElementById('object_info');

  let infoWidth = info.clientWidth;
  let infoHeight = info.clientHeight;

  console.log("info.clientWidth", info.clientWidth);
  // x位置の計算
  // オブジェクトの中心に合わせたinfo欄の左端が下限か
  if (centerX - (infoWidth / 2) < xMin){
    x = xMin;
  }
  // オブジェクトの中心に合わせたinfo欄の右端が上限か
  else if (centerX + (infoWidth / 2) > xMax) {
    x = xMax - infoWidth;
  }
  // どちらでもない場合はそのまま
  else {
    x = centerX - (infoWidth / 2);
  }

  // y位置の計算
  // オブジェクトの中心がプレビューウィンドウの中心より下か上か
  if (centerY > previewWindowY / 2) {
    // オブジェクトの上側に表示する
    y = objectY - objectMargin - infoHeight;

    // プレビューウィンドウの下限以下の場合、上限の値に
    if (y < yMin) {
      y = yMin;
    }
  }
  else {
    // オブジェクトの下側に表示する
    y = objectY + objectHeight + objectMargin;

    // プレビューウィンドウの上限以上の場合、下限の値に
    if (y > yMax) {
      y = yMax - infoHeight;
    }
  }

  console.log("objectY", objectY,"objectMargin", objectMargin,"infoHeight:", infoHeight);
  info.style.left = x.toString() + "px";
  info.style.top = y.toString() + "px";
}

export default showInfo;