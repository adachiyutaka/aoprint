import CreateController from './createController.js';

const updateInfoPosition = () => {
  let x;
  let y;
  
  let previewWindowX = 700;
  let previewWindowY = 495;
  let windowMargin = 16;
  let objectMargin = 24;

  let info = CreateController.info;
  let infoWidth = info.clientWidth;
  let infoHeight = info.clientHeight;

  let elementStyle = CreateController.selectedElement.style;

  let objectX = parseFloat(elementStyle.left);
  let objectY = parseFloat(elementStyle.top);
  let objectWidth = parseFloat(elementStyle.width);
  let objectHeight = parseFloat(elementStyle.height);

  let xMin = windowMargin;
  let xMax = previewWindowX - windowMargin;
  let yMin = windowMargin;
  let yMax = previewWindowY - windowMargin - infoHeight;

  let centerX = objectX + objectWidth / 2;
  let centerY = objectY + objectHeight / 2;


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
    // 下の場合、info欄をオブジェクトの上側に表示する
    y = objectY - objectMargin - infoHeight;

    // プレビューウィンドウの下限以下の場合、上限の値に
    if (y < yMin) {
      y = yMin;
    }
  }
  else {
    // 上の場合、info欄をオブジェクトの下側に表示する
    y = objectY + objectHeight + objectMargin;

    // プレビューウィンドウの上限以上の場合、下限の値に
    if (y > yMax) {
      y = yMax;
    }
  }

  // 計算した x, y 位置を設定
  info.style.left = x.toString() + "px";
  info.style.top = y.toString() + "px";
}

export default updateInfoPosition;