const e = require("turbolinks");

const inputMesh = () => { 
    // storage = cv.CreateMemStorage(0);
    // rect=(0, 0, 100, 100);
    // subdiv = cv.CreateSubdivDelaunay2D( rect, storage );
    // console.log(subdiv);

  const input = document.createElement('input');
  input.type = 'file';
  input.id = 'mesh';
  document.getElementById('div1').appendChild(input);

  input.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    
    const file = e.target.files[0];
    const img = new Image();
    img.src = window.URL.createObjectURL(file);
    img.onload = () => {
      createMesh(img);
    }
  });
}

const createMesh = (img) => {
  for (let i = 1; i < 40; i++) {
    const output = document.createElement('canvas');
    output.id = "output" + i;
    output.setAttribute('width', img.naturalWidth);
    output.setAttribute('height', img.naturalHeight);
    document.getElementById('div1').appendChild(output);
  };

  let src = cv.imread(img);

  // 最外輪郭を取得
  let outlineContours = getOutlineContours(src);

  // 大まかな形状に分割
  // 輪郭線でぬりつぶした画像を作成
  let segmentSrc = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.drawContours(segmentSrc, outlineContours, -1, new cv.Scalar(255, 255, 255), -1, cv.LINE_8);
  cv.imshow('output9', segmentSrc);

  // 輪郭線取得のための2値化
  cv.cvtColor(segmentSrc, segmentSrc, cv.COLOR_RGBA2GRAY);
  cv.threshold(segmentSrc, segmentSrc, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

  // 大まかな形状を取得
  let segments = [];
  findSegment(segmentSrc, segments);

  let seedContours = new cv.MatVector();
  segments.forEach((segment) => {
    seedContours.push_back(segment.contour);
  });
  cv.drawContours(segmentSrc, seedContours, -1, new cv.Scalar(255, 255, 0), 1, cv.LINE_8);
  cv.imshow('output11', segmentSrc);

  // 凸性欠陥の検出

  // テスト表示
  let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // テスト表示

  let maxArea = {}; // 最大の面積とその輪郭を収納するためのオブジェクト
  getMaxArea(outlineContours, maxArea);
  let maxAreaContour = maxArea.contour;
  let hull = new cv.Mat();
  let defectMat = new cv.Mat();
  cv.convexHull(maxAreaContour, hull, false, false);
  cv.convexityDefects(maxAreaContour, hull, defectMat);
  defects = [];
  console.log("defectMat.rows", defectMat.rows);
  // 凸性欠陥の結果をxy座標に置き換え
  if(defectMat){
    for (let i = 0; i < defectMat.rows; ++i) {
      let defect = {};
      let start = {};
      let end = {};
      let center = {};
      let far = {};
      start.point = new cv.Point(maxAreaContour.data32S[defectMat.data32S[i * 4] * 2],
                               maxAreaContour.data32S[defectMat.data32S[i * 4] * 2 + 1]);
      start.id = defectMat.data32S[i * 4];
      end.point = new cv.Point(maxAreaContour.data32S[defectMat.data32S[i * 4 + 1] * 2],
                             maxAreaContour.data32S[defectMat.data32S[i * 4 + 1] * 2 + 1]);
      end.id = defectMat.data32S[i * 4 + 1];
      center.point = new cv.Point(start.point.x + end.point.x / 2,
                                  start.point.y + end.point.y / 2);
      far.point = new cv.Point(maxAreaContour.data32S[defectMat.data32S[i * 4 + 2] * 2],
                             maxAreaContour.data32S[defectMat.data32S[i * 4 + 2] * 2 + 1]);
      far.id = defectMat.data32S[i * 4 + 2];

      defect.depth = defectMat.data32S[i * 4 + 3];
      defect.start = start;
      defect.end = end;
      defect.center = center;
      defect.far = far;
      defects.push(defect);

      // テスト表示
      cv.line(dst, defect.start.point, defect.end.point, new cv.Scalar(255, 255, 255), 2, cv.LINE_AA, 0);
      cv.circle(dst, defect.far.point, 3, new cv.Scalar(255, 0, 0), -1);
      // テスト表示
    }
  }

  // 図形全体の大きさを知るため、外接矩形を取得
  let boundingRect = cv.boundingRect(maxAreaContour);

  // 長いdepthの値をたくさん持っているセグメントを胴体とする
  // centerの位置が低く、farが胴体より下側のものを足
  // start, endの位置が左右に大きく寄っていて、farの値が大きく、胴体の左右にあるものを手とする
 
  // 胴体を判定する
  // そのsegmentに含まれるdefectのdepthの合計値を計算する
  segments.forEach((segment) => {
    let defectDepthSum = 0;
    defects.forEach((defect) => {
      // defectのfarの点が、segmentの輪郭線ないにあるかどうか
      if(cv.pointPolygonTest(segment.contour, defect.far.point, false) >= 0){
        // 輪郭線内にある場合はカウントを増やす
        defectDepthSum += defect.depth;
      }
    });
    segment.defectDepthSum = defectDepthSum;
  });
  // もっともdefectDepthの値が大きいsegmentを胴体とする
  segments.sort((a, b) => b.defectDepthSum - a.defectDepthSum);
  let body = segments[0];
  let bodyRect = cv.boundingRect(body.contour);
  console.log("body depth", body.defectDepthSum)
  let bodyPoint1 = new cv.Point(bodyRect.x, bodyRect.y);
  let bodyPoint2 = new cv.Point(bodyRect.x + bodyRect.width, bodyRect.y + bodyRect.height);
  cv.rectangle(dst, bodyPoint1, bodyPoint2, new cv.Scalar(230, 230, 200), 2, cv.LINE_AA, 0);


  // テスト表示
  segments.forEach((segment) => {
    console.log("segment.defectDepth", segment.defectDepthSum);
  });

  let point1 = new cv.Point(boundingRect.x, boundingRect.y);
  let point2 = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
  cv.rectangle(dst, point1, point2, new cv.Scalar(100, 100, 255), 2, cv.LINE_AA, 0);



  // テスト表示

  // 足を判定する
  // 足のもっとも高い位置、最小の長さを決める
  //  位置は足元から全長の1/2が最大、長さは全長の1/10以上
  // const footPosition = boundingRect.y + (boundingRect.height / 2);
  // const footLength = boundingRect.height / 10;

  // 凸性欠陥の開始と終了の中間点のy座標を基準にして降順ソート（中間点が低い位置にある（足らしい）凸性欠陥が一番に来る）
  defects.sort((a, b) => b.center.point.y - a.center.point.y);
  
  // 足の位置が適当な凸性欠陥を探す
  //  - もっとも低い位置のcenterから、全長の1/10以内の低さにあるもの
  //  - 胴体の半分より下にfarの点があるもの（胴体の下側についている）
  const footPosition = defects[0].center.point.y - boundingRect.height / 10;
  const hipPosition = bodyRect.y + bodyRect.height - bodyRect.height / 2;
  let lowerDefects = defects.filter(defect => defect.center.point.y >= footPosition && defect.far.point.y >= hipPosition);

  lowerDefects.sort((a, b) => b.depth - a.depth);
  let footDefect = lowerDefects[0];

  // 輪郭線を伝って右足、左足の輪郭線を指定する
  let leftFoot = {};
  let rightFoot = {};
  findSeparatePoints(maxAreaContour, footDefect.start, 0, 1, -footDefect.far.point.y, dst, leftFoot);
  findSeparatePoints(maxAreaContour, footDefect.end, 0, 1, -footDefect.far.point.y, dst, rightFoot);

  // 足がない場合

  // 腕を判定する
  // bodyの左右にあるdepthが最大のもの
  const leftArmX = bodyRect.x + bodyRect.width / 2;
  const rightArmX = bodyRect.x + bodyRect.width - bodyRect.width / 2;
  const armHeightMax = bodyRect.y + bodyRect.height;
  const armHeightMin = bodyRect.y;
  let leftDefects = defects.filter(defect => defect.far.point.x <= leftArmX && defect.far.point.y >= armHeightMin && defect.far.point.y <= armHeightMax);
  let rightDefects = defects.filter(defect => defect.far.point.x >= rightArmX && defect.far.point.y >= armHeightMin && defect.far.point.y <= armHeightMax);

  leftDefects.sort((a, b) => b.depth - a.depth);
  rightDefects.sort((a, b) => b.depth - a.depth);
  leftDefects.forEach((defect) => {
    cv.circle(dst, defect.far.point, 3, new cv.Scalar(0, 255, 0), -1);
  });
  let leftArmDefect = leftDefects[0];
  let rightArmDefect = rightDefects[0];
  console.log("leftArmDefects", leftDefects.length);
  let leftArmEdges = [];
  leftArmEdges[0] = {};
  leftArmEdges[1] = {};
  if(leftDefects[0].far.point.y <= leftDefects[1].far.point.y){
    leftArmEdges[0].separatePoint = leftDefects[0].far.point;
    leftArmEdges[1].separatePoint = leftDefects[1].far.point;
    leftArmEdges[0].oneBeforeId = leftDefects[0].far.id;
    leftArmEdges[1].oneBeforeId = leftDefects[1].far.id;
  }else{
    leftArmEdges[0].separatePoint = leftDefects[1].far.point;
    leftArmEdges[1].separatePoint = leftDefects[0].far.point;
    leftArmEdges[0].oneBeforeId = leftDefects[1].far.id;
    leftArmEdges[1].oneBeforeId = leftDefects[0].far.id;
  }

  let leftArmContour = new cv.Mat();
  separateContour(maxAreaContour, leftArmEdges, leftArmContour);

  let leftArm = {};
  let rightArm = {};
  let leftArmTip = leftArmDefect.start.point.x <= leftArmDefect.end.point.x ? leftArmDefect.start : leftArmDefect.end;
  let rightArmTip = rightArmDefect.start.point.x >= rightArmDefect.end.point.x ? rightArmDefect.start : rightArmDefect.end;
  cv.circle(dst, rightArmTip.point, 10, new cv.Scalar(0, 200, 150), -1);
  findSeparatePoints(maxAreaContour, leftArmTip, 1, 0, -leftArmDefect.far.point.x, dst, leftArm);
  findSeparatePoints(maxAreaContour, rightArmTip, 1, 0, -rightArmDefect.far.point.x, dst, rightArm);

  let separatedContours = new cv.MatVector();
  separatedContours.push_back(leftFoot.contour);
  separatedContours.push_back(rightFoot.contour);
  // separatedContours.push_back(leftArm.contour);
  separatedContours.push_back(leftArmContour);
  separatedContours.push_back(rightArm.contour);
  cv.drawContours(dst, separatedContours, -1, new cv.Scalar(200, 255, 255), 1, cv.LINE_8);
  cv.imshow('output14', dst);


  hull.delete;
  defectMat.delete;

  segmentSrc.delete;
  src.delete;
}

// 最外部の輪郭線を取得する
const getOutlineContours = (src) => {
  let contoursColor = new cv.Scalar(255, 0, 0);

  // グレースケールに変換
  const imgGray = new cv.Mat();
  cv.cvtColor(src, imgGray, cv.COLOR_RGBA2GRAY);
  cv.imshow('output1', imgGray);

  // 白い部分を膨張させる
  const imgDilated = new cv.Mat();
  const kernel = cv.getStructuringElement(cv.MORPH_RECT,new cv.Size(7,7));
  cv.dilate(imgGray, imgDilated, kernel, new cv.Point(-1, -1), 1);
  cv.imshow('output2', imgDilated);
  imgGray.delete;

  // 差を取って輪郭線を強調
  const imgDiff = new cv.Mat();
  cv.absdiff(imgDilated, imgGray, imgDiff);
  cv.imshow('output3', imgDiff);
  imgDilated.delete;

  // 2値化
  const imgBin = new cv.Mat();
  cv.threshold(imgDiff, imgBin, 10, 255, cv.THRESH_BINARY);
  cv.imshow('output4', imgBin);
  imgDiff.delete;

  // クロージング処理で弱い輪郭線を補強
  const imgClosed = new cv.Mat();
  let MClose = cv.Mat.ones(5, 5, cv.CV_8U);
  cv.morphologyEx(imgBin, imgClosed, cv.MORPH_CLOSE, MClose);
  cv.imshow('output5', imgClosed);
  imgBin.delete;

  // // オープニング処理で小さいゴミを消去
  // const imgOpened = new cv.Mat();
  // let anchor = new cv.Point(-1, -1);
  // let MOpen = cv.Mat.ones(3, 3, cv.CV_8U);
  // cv.morphologyEx(imgClosed, imgOpened, cv.MORPH_OPEN, MOpen, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  // cv.imshow('output6', imgOpened);
  // anchor.delete;
  // MOpen.delete;

  // 中央値フィルタでゴミ取り
  // const imgFiltered = new cv.Mat();
  // cv.medianBlur(imgOpened, imgFiltered, 5);
  // cv.imshow('output7', imgFiltered);
  // imgOpened.delete;
  
  // 輪郭線を取得
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(imgClosed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);  // 最外部の輪郭のみ読み取る（cv.RETR_EXTERNAL）
  const imgContours = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.drawContours(imgContours, contours, -1, contoursColor, 1, cv.LINE_8);
  cv.imshow('output8', imgContours);
  // imgFiltered.delete;
  imgClosed.delete;

  // 最外部（第4要素（親のID）が-1）の輪郭線を取得
  let outlineContours = new cv.MatVector();
  for (let i = 0; i < contours.size();  ++i){
    if(hierarchy.intPtr(0, i)[3] == -1) {
      outlineContours.push_back(contours.get(i));
    }
  }

  contours.delete;
  hierarchy.delete;

  return outlineContours;
}

// 画像の分割
// 最外輪郭線を塗りつぶした8bit画像を元に、大きな形のまとまりを探し、segmentオブジェクトにそれぞれのcontourと、そのmaskを登録して返す
const findSegment = (src, segments) => {
  // 外周からの距離を取得する
  let distanceTransform = new cv.Mat();
  cv.distanceTransform(src, distanceTransform, cv.DIST_L2, 5);

  // 最大値を取得
  let maxDistance = new cv.Mat();
  cv.reduce(distanceTransform, maxDistance, 0, cv.REDUCE_MAX); // 行列から各列の最大値を取得し1行に
  cv.reduce(maxDistance, maxDistance, 1, cv.REDUCE_MAX); // さらにその1行から最大値を取得し1行1列に

  // 閾値処理のために8bitシングルチャンネルに変換
  distanceTransform.convertTo(distanceTransform, cv.CV_8U);

  // もっとも大きな形のまとまりを探す
  let segment = {};
  greatestSegment(src, distanceTransform, maxDistance.data32F[0], segment);

  // 結果をsegmentsに追加
  segments.push(segment);

  // 元の画像から輪郭を切り抜く
  // ビット演算ANDで、元の輪郭内(=1)かつ、マスクの輪郭外(=1)の部分のみ残す
  cv.bitwise_and(src, segment.mask, src);

  // 切り取った後の画像に残った部分がないかを調べるため
  // 輪郭を取得し、輪郭があった場合は再起する
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);  // 最外部の輪郭のみ読み取る（cv.RETR_EXTERNAL）

  if(contours.size() > 0){
    findSegment(src, segments)
  }

  maxDistance.delete;
  distanceTransform.delete;
  contours.delete;
}

// cv.distanceTransformを元にもっとも大きいまとまりを探し、contourとその形のmaskをsegmentオブジェクトに登録して返す
const greatestSegment = (src, distanceTransform, maxDistance, segment, epsilon_ratio = 0.02, high = 1, low = 0) => {
  const accuracy = 0.01; // 2分探査の精度、小さい値ほど厳密な探査になる
  let mid = (high + low) / 2;
  let minArea = src.cols * src.rows / 100000;

  console.log("minArea", minArea);
  console.log("high,low", high, low, "high - low", high - low, "accuracy", accuracy);
  // 閾値で輪郭を縮める
  let threshold = new cv.Mat();
  cv.threshold(distanceTransform, threshold, maxDistance * mid, 255, cv.THRESH_BINARY);

  // 輪郭を取得
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(threshold, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);  // 最外部の輪郭のみ読み取る（cv.RETR_EXTERNAL）
  
  cv.imshow('output10', src);
  cv.imshow('output11', threshold);

  // 輪郭が消えてしまった場合
  if(contours.size() == 0){
    console.log("contours.size() = 0");
    console.log("輪郭線を大きく（閾値を小さく、 high = mid）し、再起");
    // 輪郭線を大きく（閾値を小さく、 high = mid）し、再起する
    greatestSegment(src, distanceTransform, maxDistance, segment, epsilon_ratio, mid, low);
    return;
  }

  // もっとも面積が大きい輪郭を探す
  let maxAreaObject = {}; // 最大の面積とその輪郭を収納するためのオブジェクト
  getMaxArea(contours, maxAreaObject);
  let maxArea = maxAreaObject.area;
  let maxAreaContour = maxAreaObject.contour;

  // 単純な形にする
  let approx = new cv.Mat();
  const epsilon = epsilon_ratio * cv.arcLength(maxAreaContour, true);
  cv.approxPolyDP(maxAreaContour, approx, epsilon, true);

  // 単純化した輪郭の頂点数が2の場合
  if(approx.rows <= 2){
    console.log("is Line");
    // 頂点数が2で、さらに単純化の余地がある場合
    if(epsilon_ratio > 0.001){
      // 単純化をどれだけ許容するかの係数（epsilon_ratio）を小さくし（単純化の度合いを弱めて）再起する
      console.log("単純化をどれだけ許容するかの係数（epsilon_ratio）を小さくし（単純化の度合いを弱めて）再起");
      greatestSegment(src, distanceTransform, maxDistance, segment, epsilon_ratio / 2, high, low);
    }
    // 頂点数が2だが、さらに単純化の余地がない場合、探査を終了する
    else{
      console.log("epsilon_ratio < 0.001");
      dilateContour(src, approx, maxDistance * mid, segment);
    }
  }
  // 輪郭の最大面積が十分に小さい場合、探査を終了する（面積を限界まで小さくしているのに cv.isContourConvex = false を返す場合があるため）
  else if(maxArea <= minArea){
    console.log("maxArea <= minArea");
    dilateContour(src, approx, maxDistance * mid, segment);
  }
  // 凸包かどうか判定する
  // 凸包の場合
  else if(cv.isContourConvex(approx)){
    console.log("is convex");
      // 十分に2分探査されている場合、探査を終了し、輪郭線を返す
      if(high - low < accuracy){
        console.log("high - low < 0.01");
        dilateContour(src, approx, maxDistance * mid, segment);
      }
      // 探査が十分でない場合
      else{
        console.log("輪郭線を大きく（閾値を小さく、 high = mid）し、再起");
        // 輪郭線を大きく（閾値を小さく、 high = mid）し、再起する
        greatestSegment(src, distanceTransform, maxDistance, segment, epsilon_ratio, mid, low);
      }
  }
  // 凸包でない場合
  else{
    console.log("is not convex");
    // 十分に2分探査されている場合、探査を終了し、輪郭線を返す
    if(high - low < accuracy){
      console.log("high - low < 0.01");
      dilateContour(src, approx, maxDistance * mid, segment);
    }
    // 探査が十分でない場合
    else{
      console.log("輪郭線を小さく（閾値を大きく, low = mid）し、再起");
      // 輪郭線を小さく（閾値を大きく, low = mid）し、再起する
      greatestSegment(src, distanceTransform, maxDistance, segment, epsilon_ratio, high, mid);
    }
  }

  contours.delete;
  hierarchy.delete;
  maxAreaContour.delete;
  threshold.delete;
}

// 形のまとまりのcontourと、最初の輪郭線との距離の差(distance)をもとに、拡張したcontourとその形のmaskをsegmentオブジェクトに登録して返す
const dilateContour = (src, contour, distance, segment) => {
  // 全体=0, 輪郭=255 のマスクを作成する
  let mask = new cv.Mat(src.rows, src.cols, cv.CV_8U, new cv.Scalar(0));
  let contours = new cv.MatVector();
  contours.push_back(contour);
  cv.drawContours(mask, contours, -1, new cv.Scalar(255), -1, cv.LINE_8);

  // 白い部分を膨張させる
  let margin = ((src.rows >= src.cols)? src.rows : src.cols) / 100;  // 膨張させる際の余白
  cv.dilate(mask, mask, cv.Mat.ones(3, 3, cv.CV_8U), new cv.Point(-1, -1), Math.round(distance) + margin);

  // 輪郭を再取得する
  let hierarchy = new cv.Mat();
  cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);  // 最外部の輪郭のみ読み取る（cv.RETR_EXTERNAL）

  // マスクの白黒を反転させる
  cv.bitwise_not(mask, mask);

  // segmentに登録する
  segment.contour = contours.get(0);
  segment.mask = mask;

  // mask.delete;
  contours.delete;
  hierarchy.delete;
}

const getMaxArea = (contours, maxAreaObject) => {
  let contourAreas = [];
  for(let i = 0; i < contours.size(); ++i) {
    contourAreas.push(cv.contourArea(contours.get(i)));
  }
  maxAreaObject.area = Math.max.apply(null, contourAreas);
  maxAreaObject.contour = contours.get(contourAreas.indexOf(maxAreaObject.area));

  console.log("areas", contourAreas);
}

  // 直線方程式で輪郭線を分割する
const findSeparatePoints = (contour, tip, a, b, c, img, dstObject) => {
  // tip は分割の際に探査の基準とする点（手足の先端など）
  // a, b, c は ax + by + c = 0 の直線方程式の係数
  console.log("contour.rows", contour.rows);
  console.log("contour.cols", contour.cols);

  // 分割する点を算出する
  let edges = [];

  // 末端の点からContourの順に時計回り、反時計回りに2回探査する
  for (let j = -1; j < 2; j += 2) {
    let tipSign;
    let separatePoint;
    let oneBeforeId;
    for (let i = 0; i < contour.rows; ++i) {
      let sign;
      let id = (contour.rows + tip.id + j * i) % (contour.rows); // jで時計回り、反時計回りを指定する
      let x = contour.data32S[id * 2];
      let y = contour.data32S[id * 2 + 1];

      // 分割のための直線方程式と各点の差を算出し、符号をチェックする
      if(b == 0){
        // 垂直線で左右に分ける場合(b == 0 , 直線方程式が x = -c/a の場合)
        sign = Math.sign(x + c / a);
        // sign = Math.sign(x + (b * y + c) / a); こちらでもいいが b == 0 の場合のみなので、b * y を省略
      }else{
        // 垂直以外で上下に分ける場合（b != 0 , 直線方程式が y = -(ax+c)/b の場合）
        sign = Math.sign(y + (a * x + c) / b);
      }

      if(i == 0){
        // スタート地点（tip）の符号を保存する
        tipSign = sign;
        console.log("id", id);
        console.log("tipSign", tipSign);
      }else if(sign == 0){
        // 符号が0になった場合（たまたま、輪郭の点が分割のための直線の上にある）
        separatePoint = new cv.Point(x, y);
        cv.circle(img, separatePoint, 5, new cv.Scalar(255, 0, 255), -1);  
        console.log("sign == 0", tipSign);
        console.log("separatePoint", separatePoint.x, separatePoint.y)
        break;
      }else if(tipSign != sign){
        // スタート地点の符号と異なる符号になった場合（輪郭線が直線をはじめてまたいだ）
        // その前後の2点の間に、新しい分割用の点（2点を結ぶ直線と、分割のための直線の交点）を作成する
        console.log("id", id);
        console.log("tipSign != sign x, y:", x, y);
        // 初めてまたいだ点の一つ前の点を算出する
        let oneBeforePoint = new cv.Point(contour.data32S[oneBeforeId * 2], contour.data32S[oneBeforeId * 2 + 1]); // 一つ前の点
        if(x == oneBeforePoint.x){
          // 2点を結ぶ直線が垂直になる場合
          console.log("2点を結ぶ直線が垂直になる場合");
          separatePoint = new cv.Point(x, - a / b * x - c / b);
        }else{
          // 2点を結ぶ直線が垂直にならない場合
          // 初めてまたいだ点(x, y)と、その一つ前の点(x2, y2)を結ぶ直線方程式(y = a2x + b2)の係数を算出する
          let x2 = oneBeforePoint.x;
          let y2 = oneBeforePoint.y;
          let a2 = (y2 - y)/(x2 - x);
          let b2 = (y * x2 - y2 * x) / (x2 - x);

          if(b == 0){
            // 分割のための直線が垂直の場合
            let x3 = -c/a; // 垂直の直線方程式 ax = -c の変形
            separatePoint = new cv.Point(x3, a2 * x3 + b2); // y = a2 * x + b2 に代入
            console.log("b == 0");
            console.log("separatePoint", separatePoint.x, separatePoint.y)
          }else{
            // ax + by + c = 0 の方程式を y = a1x + b1 の形に置き換える
            let a1 = - a / b;
            let b1 = - c / b;
            console.log("a1", a1, "b1", b1, "a2", a2, "b2", b2);
            // 2点を結ぶ直線と分割のための直線の交点を計算する
            separatePoint = new cv.Point((b2 - b1)/(a1 - a2), (a1 * b2 - b1 * a2)/(a1 - a2));
          }
        }

        console.log("separatePoint", separatePoint.x, separatePoint.y)

        cv.circle(img, new cv.Point(x ,y), 1, new cv.Scalar(0, 255, 0), -1);
        cv.circle(img, oneBeforePoint, 1, new cv.Scalar(0, 255, 255), -1);
        if(j == -1){
          cv.circle(img, separatePoint, 5, new cv.Scalar(255, 255, 0), -1);
        }else{
          cv.circle(img, separatePoint, 5, new cv.Scalar(0, 255, 255), -1);
        }
        break;
      }
      oneBeforeId = id;
      console.log("sign", sign);
      cv.circle(img, new cv.Point(x ,y), 2, new cv.Scalar(200, 0, 155), -1);
      console.log("x, y:", x, y);
    }
    let edge = {};
    edge.separatePoint = separatePoint;
    edge.oneBeforeId = oneBeforeId;
    edges.push(edge);
  }
  cv.imshow('output13', img);

  let separatedContour = new cv.Mat();
  separateContour(contour, edges, separatedContour);
  
  // tipPoint rootPoint separatePointと切り取ったContourをまとめたオブジェクトを作成する

  dstObject.edge = edges;
  dstObject.contour = separatedContour;

  separatedContour.delete;
}

// 輪郭線を与えられた2点（edges）をもとに切り取る
const separateContour = (contour, edges, dstContour) => {
  // edges = [
  //           {
  //             separatePoint : cv.Point,
  //             oneBeforeId : int
  //           },
  //           {
  //             separatePoint : cv.Point,
  //             oneBeforeId : int
  //           }
  //          ]

  console.log("contour.channels()", contour.channels());
  let separateContour = new cv.Mat();
  if(edges[0].oneBeforeId > edges[1].oneBeforeId){
    mergeContours(contour.rowRange(edges[0].oneBeforeId, contour.rows), contour.rowRange(0, edges[1].oneBeforeId + 1), separateContour);
  }else{
    separateContour = contour.rowRange(edges[0].oneBeforeId, edges[1].oneBeforeId + 1);
  }
  let separatePoint1 = new cv.Mat();
  let separatePoint2 = new cv.Mat();
  mergeXY([edges[0].separatePoint.x], [edges[0].separatePoint.y], separatePoint1);
  mergeXY([edges[1].separatePoint.x], [edges[1].separatePoint.y], separatePoint2);
  mergeContours(separatePoint1 ,separateContour, dstContour);
  mergeContours(dstContour, separatePoint2, dstContour);

  separateContour.delete;
  separatePoint1.delete;
  separatePoint2.delete;
  contour.delete;
}

// contour1の後にcontour2をつなげる
const mergeContours = (contour1, contour2, dstContour) => {
  // contourを x, y それぞれ1チャンネルの Mat に分離する
  let separatedContour1 = new cv.MatVector();
  cv.split(contour1, separatedContour1);
  let separatedContour2 = new cv.MatVector();
  cv.split(contour2, separatedContour2);
  // Mat から Array に変換し、contour1, 2 をつなげる（x, y それぞれ別に処理を行う）
  let separatedContour12 = new cv.MatVector();
  let x = Array.from(separatedContour1.get(0).data32S).concat(Array.from(separatedContour2.get(0).data32S));
  let y = Array.from(separatedContour1.get(1).data32S).concat(Array.from(separatedContour2.get(1).data32S));
  // Array から Mat に戻し、x, yを一つの Mat（2チャンネル）に合成する
  mergeXY(x, y, dstContour);

  contour1.delete;
  contour2.delete;
  separatedContour1.delete;
  separatedContour2.delete;
  separatedContour12.delete;
}

// x, y座標の配列を2チャンネルを持つ一つの Mat に合成する
const mergeXY = (xArray, yArray, dstContour) => {
  let xy = new cv.MatVector();
  let separatePoint = new cv.Mat();
  let x = new cv.matFromArray(xArray.length, 1, cv.CV_32S, xArray);
  let y = new cv.matFromArray(yArray.length, 1, cv.CV_32S, yArray);
  xy.push_back(x);
  xy.push_back(y);
  cv.merge(xy, dstContour);

  x.delete;
  y.delete;
  xy.delete;
  separatePoint.delete;
}

window.addEventListener('load', inputMesh);