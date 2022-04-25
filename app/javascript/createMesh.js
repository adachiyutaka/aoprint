const e = require("turbolinks");

const inputMesh = () => { 
  const months = ['Jan', 'March', 'April', 'June'];
  months.splice(1, 0, 'Feb');
  // inserts at index 1
  console.log("months", months);
  let test = null;
  months.splice(1, 0, null);
  console.log("null", months);


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
  let outlineContour = maxArea.contour;
  let outlineArray = [];
  for(i = 0; i < outlineContour.rows; i++ ){
    outlineArray.push(new cv.Point(outlineContour.data32S[i * 2], outlineContour.data32S[i * 2 + 1]));
  }
  let hull = new cv.Mat();
  let defectMat = new cv.Mat();
  cv.convexHull(outlineContour, hull, false, false);
  cv.convexityDefects(outlineContour, hull, defectMat);
  defects = [];
  console.log("defectMat.rows", defectMat.rows);
  // 凸性欠陥の結果をxy座標に置き換え
  if(defectMat){
    for (let i = 0; i < defectMat.rows; ++i) {
      let start = {point: new cv.Point(outlineContour.data32S[defectMat.data32S[i * 4] * 2],
                                       outlineContour.data32S[defectMat.data32S[i * 4] * 2 + 1]),
                   id: defectMat.data32S[i * 4]};
      let end = {point: new cv.Point(outlineContour.data32S[defectMat.data32S[i * 4 + 1] * 2],
                                     outlineContour.data32S[defectMat.data32S[i * 4 + 1] * 2 + 1]),
                 id: defectMat.data32S[i * 4 + 1]};
      let center = {point: new cv.Point(start.point.x + end.point.x / 2,
                                        start.point.y + end.point.y / 2)};
      let far = {point: new cv.Point(outlineContour.data32S[defectMat.data32S[i * 4 + 2] * 2],
                                     outlineContour.data32S[defectMat.data32S[i * 4 + 2] * 2 + 1]),
                id: defectMat.data32S[i * 4 + 2]};

      defect = {depth: defectMat.data32S[i * 4 + 3],
                start: start,
                end: end,
                center: center,
                far: far};
      
      defects.push(defect);

      // テスト表示
      cv.line(dst, defect.start.point, defect.end.point, new cv.Scalar(255, 255, 255), 2, cv.LINE_AA, 0);
      cv.circle(dst, defect.far.point, 3, new cv.Scalar(255, 0, 0), -1);
      // テスト表示
    }
  }

  // 図形全体の大きさを知るため、外接矩形を取得
  let boundingRect = cv.boundingRect(outlineContour);

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
  let bodySegment = segments[0];
  let bodyRect = cv.boundingRect(bodySegment.contour);
  console.log("body depth", bodySegment.defectDepthSum)
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

  // もっとも depth が大きい defect を股下とする
  lowerDefects.sort((a, b) => b.depth - a.depth);
  let footDefect = lowerDefects[0];

  // 股下の点（footDefect.far）を通る水平線で左右の足を切り取る
  let body = {};
  let leftFoot = {};
  let rightFoot = {};
  let separatePoints = [];
  separateByLine(outlineArray, footDefect.start, 0, 1, -footDefect.far.point.y, dst, leftFoot, body, separatePoints);
  separateByLine(outlineArray, footDefect.end, 0, 1, -footDefect.far.point.y, dst, rightFoot, body, separatePoints);

  // 足がない場合

  // 腕を判定する
  // bodyの左右にある defect を探す
  const leftArmX = bodyRect.x + bodyRect.width / 2;
  const rightArmX = bodyRect.x + bodyRect.width - bodyRect.width / 2;
  const armHeightMax = bodyRect.y + bodyRect.height;
  const armHeightMin = bodyRect.y;
  let leftDefects = defects.filter(defect => defect.far.point.x <= leftArmX && defect.far.point.y >= armHeightMin && defect.far.point.y <= armHeightMax);
  let rightDefects = defects.filter(defect => defect.far.point.x >= rightArmX && defect.far.point.y >= armHeightMin && defect.far.point.y <= armHeightMax);

  // 腕の輪郭線を切り取る
  let leftArm = {};
  let rightArm = {};
  let leftArmContour = new cv.Mat();
  let rightArmContour = new cv.Mat();
  separateArm(outlineContour, leftDefects, leftArm, boundingRect);
  separateArm(outlineContour, rightDefects, rightArm, boundingRect, false);

  console.log("dstContour.rows", leftArm.contour.rows);
  for (let i = 0; i < leftArm.contour.rows; ++i) {
    console.log("dstContour", leftArm.contour.data32S[i*2], leftArm.contour.data32S[i*2 + 1]);
  }

  // 頭の輪郭線を切り取る
  let head = {};
  let headContour = new cv.Mat();
  head.edge = [];
  head.edge[0] = {};
  head.edge[1] = {};

  // 頭の視点は右手の終点、頭の終点は左手の始点にする
  // 始点、終点を中心に、逆側にひとつずらした点をひとつ前の点とするため、idを二つずらす
  head.edge[0].separatePoint = rightArm.edge[1].separatePoint;
  head.edge[0].oneBeforeId = rightArm.edge[1].oneBeforeId + 2;
  head.edge[1].separatePoint = leftArm.edge[0].separatePoint;
  head.edge[1].oneBeforeId = leftArm.edge[0].oneBeforeId - 2;
  separateByEdge(outlineContour, head.edge, headContour);
  head.contour = headContour;

  // 体の輪郭線を切り取る
  
  // contourを x, y それぞれ1チャンネルの Mat に分離する
  let splitContour = new cv.MatVector();
  cv.split(outlineContour, splitContour);
  let bodyContourId = [];
  for (i = 0; i < outlineContour.rows; i++ ){
    bodyContourId.push(i);
  }
  outlineContour.data32S[bodyContourId.indexOf(leftFoot.edge[0].oneBeforeId) * 2];
  outlineContour.data32S[bodyContourId.indexOf(leftFoot.edge[0].oneBeforeId) * 2 + 1];
 
  leftFoot.edge[1].oneBeforeId

  splitContour.delete;

  let separatedContours = new cv.MatVector();
  separatedContours.push_back(leftFoot.contour);
  separatedContours.push_back(rightFoot.contour);
  separatedContours.push_back(leftArm.contour);
  separatedContours.push_back(rightArm.contour);
  separatedContours.push_back(head.contour);

  cv.drawContours(dst, separatedContours, -1, new cv.Scalar(200, 255, 255), 1, cv.LINE_8);
  cv.imshow('output15', dst);

  outlineContour.delete;
  hull.delete;
  defectMat.delete;
  leftArmContour.delete;
  rightArmContour.delete;
  headContour.delete;
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
const separateByLine = (contourArray, tip, a, b, c, img, tipPortionArray, anotherPortionArray, separatePoints) => {
  // tip は分割の際に探査の基準とする点（手足の先端など）
  // a, b, c は ax + by + c = 0 の直線方程式の係数

  // 分割する点を算出する
  let edges = [];

  // 輪郭線のidとcontourArrayのidがずれる場合があるため、contourArrayでのidに変換する
  let tipId = contourArray.indexOf(tip.point);

  // 末端の点からContourの順に時計回り、反時計回りに2回探査する
  for (let j = -1; j < 2; j += 2) {
    let tipSign;
    let separatePoint;
    let oneBeforeId;
    let insertNewPoint;
    let edge;

    for (let i = 0; i < contourArray.length; ++i) {
      let sign;
      // let id = (contour.rows + tip.id + j * i) % (contour.rows); // jで時計回り、反時計回りを指定する
      // let x = contour.data32S[id * 2];
      // let y = contour.data32S[id * 2 + 1];
      let id = (contourArray.length + tipId + j * i) % (contourArray.length); // jで時計回り、反時計回りを指定する
      let point = contourArray[id];
      let x = contourArray[id].x;
      let y = contourArray[id].y;

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
        insertNewPoint = false;
        separatePoint = point;
        cv.circle(img, separatePoint, 5, new cv.Scalar(255, 0, 255), -1);  
        console.log("sign == 0", tipSign);
        console.log("separatePoint", separatePoint.x, separatePoint.y)
        break;
      }else if(tipSign != sign){
        // スタート地点の符号と異なる符号になった場合（輪郭線が直線をはじめてまたいだ）
        // その前後の2点の間に、新しい分割用の点（2点を結ぶ直線と、分割のための直線の交点）を作成する
        console.log("id", id);
        console.log("tipSign != sign x, y:", x, y);
        insertNewPoint = true;
        // 初めてまたいだ点の一つ前の点を算出する
        let oneBeforePoint = contourArray[oneBeforeId]; // 一つ前の点
        // let oneBeforePoint = new cv.Point(contour.data32S[oneBeforeId * 2], contour.data32S[oneBeforeId * 2 + 1]); // 一つ前の点
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
    edge = {separatePoint: separatePoint, oneBeforeId: oneBeforeId, insertNewPoint: insertNewPoint};
    edges.push(edge);
  }
  cv.imshow('output13', img);

  separateByEdge(contourArray, edges, tipPortionArray, anotherPortionArray);
  separatePoints = [edges[0].separatePoint, edges[1].separatePoint];
}

// 与えられた2つの端（edges）をもとに輪郭線を切り取る
const separateByEdge = (contourArray, edges, tipPortionArray, anotherPortionArray) => {
  // edges = [
  //           {
  //             separatePoint : cv.Point,
  //             oneBeforeId : int
  //             insertNewPoint : bool
  //           },
  //           {
  //             separatePoint : cv.Point,
  //             oneBeforeId : int
  //             insertNewPoint : bool
  //           }
  //          ]

  let start = edges[0];
  let end = edges[1];
  let startId = (startId - 1) % contourArray.length;
  let endId = (endId + 1) % contourArray.length;

  if(start.insertNewPoint){
    contourArray.splice(startId, 0, start.separatePoint);
    endId ++;
  }

  if(end.insertNewPoint){
    contourArray.splice(endId, 0, end.separatePoint);
  }

  // 始点と終点が id:0 をまたいでいるか判定
  if(startId > endId){
    // 始点から終点までが id:0 をまたいでいる場合
    // 末端側の配列は、始点からidの最後、id:0 から終点、の二つの輪郭線を合成して作成
    tipPortionArray = contourArray.slice(startId).concat(contourArray.slice(0, endId + 1));
    // 逆側の配列は、終点から視点で切り取る
    anotherPortionArray = contourArray.slice(endId, startId + 1);
    // mergeContours(contour.rowRange(startId, contour.rows), contour.rowRange(0, endId + 1), separateContour);
  }else{
    // 始点から終点までが id:0 をまたいでいない場合
    // 末端側の配列は、始点から終点の輪郭線を切り取る
    tipPortionArray = contourArray.slice(startId, endId + 1);
    // 逆側の配列は、始点からidの最後、id:0 から終点、の二つの輪郭線を合成して作成
    anotherPortionArray = contourArray.slice(endId).concat(contourArray.slice(0, startId + 1));
    // separateContour = contour.rowRange(startId, endId + 1);
  }

  // tipPortion = {edge: edges, array: tipArray};
  // anotherPortion = {edge: edges, array: anotherArray};
  // // oneBeforeIdの2点で輪郭線を切り取る
  // let separateContour = new cv.Mat();
  // separateByPoint(contour, edges[0].oneBeforeId, edges[1].oneBeforeId, separateContour);

  // // separatePointをContourの形のMat型にする
  // let separatePoint1 = new cv.Mat();
  // let separatePoint2 = new cv.Mat();
  // mergeXY([edges[0].separatePoint.x], [edges[0].separatePoint.y], separatePoint1);
  // mergeXY([edges[1].separatePoint.x], [edges[1].separatePoint.y], separatePoint2);

  // // 切り取った輪郭線の前後にseparatePoint1と2を連結する
  // mergeContours(separatePoint1 ,separateContour, dstContour);
  // mergeContours(dstContour, separatePoint2, dstContour);

  // separateContour.delete;
  // separatePoint1.delete;
  // separatePoint2.delete;
  // contour.delete;
}

// // 与えられた2つの端（edges）をもとに輪郭線を切り取る
// const separateByEdge = (contour, edges, dstContour) => {
//   // edges = [
//   //           {
//   //             separatePoint : cv.Point,
//   //             oneBeforeId : int
//   //           },
//   //           {
//   //             separatePoint : cv.Point,
//   //             oneBeforeId : int
//   //           }
//   //          ]

//   // oneBeforeIdの2点で輪郭線を切り取る
//   let separateContour = new cv.Mat();
//   separateByPoint(contour, edges[0].oneBeforeId, edges[1].oneBeforeId, separateContour);

//   // separatePointをContourの形のMat型にする
//   let separatePoint1 = new cv.Mat();
//   let separatePoint2 = new cv.Mat();
//   mergeXY([edges[0].separatePoint.x], [edges[0].separatePoint.y], separatePoint1);
//   mergeXY([edges[1].separatePoint.x], [edges[1].separatePoint.y], separatePoint2);

//   // 切り取った輪郭線の前後にseparatePoint1と2を連結する
//   mergeContours(separatePoint1 ,separateContour, dstContour);
//   mergeContours(dstContour, separatePoint2, dstContour);

//   separateContour.delete;
//   separatePoint1.delete;
//   separatePoint2.delete;
//   contour.delete;
// }

// 与えられた2つの点をもとに輪郭線を切り取る
const separateByPoint = (contour, startId, endId, dstContour) => {

  let separateContour = new cv.Mat();

  // 始点と終点が id:0 をまたいでいるか判定
  if(startId > endId){
    // 始点からidの最後、id:0 から終点、の二つの輪郭線を合成する
    mergeContours(contour.rowRange(startId, contour.rows), contour.rowRange(0, endId + 1), separateContour);
  }else{
    // 始点から終点の輪郭線を切り取る
    separateContour = contour.rowRange(startId, endId + 1);
  }

  // clone()だとうまくコピーできない
  separateContour.copyTo(dstContour);

  separateContour.delete;
  contour.delete;
}

// contour1の後にcontour2をつなげる
const mergeContours = (contour1, contour2, dstContour) => {
  // contourを x, y それぞれ1チャンネルの Mat に分離する
  let splitContour1 = new cv.MatVector();
  cv.split(contour1, splitContour1);
  let splitContour2 = new cv.MatVector();
  cv.split(contour2, splitContour2);
  // Mat から Array に変換し、contour1, 2 をつなげる（x, y それぞれ別に処理を行う）
  let x = Array.from(splitContour1.get(0).data32S).concat(Array.from(splitContour2.get(0).data32S));
  let y = Array.from(splitContour1.get(1).data32S).concat(Array.from(splitContour2.get(1).data32S));
  // Array から Mat に戻し、x, yを一つの Mat（2チャンネル）に合成する
  mergeXY(x, y, dstContour);

  contour1.delete;
  contour2.delete;
  splitContour1.delete;
  splitContour2.delete;
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

// 腕の defect 候補の中からもっとも depth の大きい2点で輪郭線を切り取る
const separateArm = (contour, defects, endPiece, boundingRect, left = true) => {

  let start = 0;
  let end = 1;
  let oneBefore = 1;

  if(left){
    // star, endのどちらかが小さい方を小さい順にソートする（左側にある順に）
    defects.sort((a, b) => Math.min(a.start.point.x, a.end.point.x) - Math.min(b.start.point.x, b.end.point.x));
    // 一定以上左端にあるもののみ選ぶ
    let leftArmPosition =  Math.min(defects[0].start.point.x, defects[0].end.point.x) + boundingRect.width / 10;
    defects = defects.filter(defects => Math.min(defects.start.point.x, defects.end.point.x) <= leftArmPosition);
  } else {
    // star, endのどちらかが大きい方を大きい順にソートする（右側にある順に）
    defects.sort((a, b) => Math.max(b.start.point.x, b.end.point.x) - Math.max(a.start.point.x, a.end.point.x));
    // 一定以上右端にあるもののみ選ぶ
    let rightArmPosition =  Math.max(defects[0].start.point.x, defects[0].end.point.x) - boundingRect.width / 10;
    defects = defects.filter(defects => Math.max(defects.start.point.x, defects.end.point.x) >= rightArmPosition);
    // 右側（右腕）を切り取る場合
    // 切り取る始点と終点
    // ひとつ前の id の符号を逆転する
    start = 1;
    end = 0;
    oneBefore = -1;
  }
  
  // depthが大きい順にソートする
  defects.sort((a, b) => b.depth - a.depth);

  // depth が1番目と2番目の far を腕の付け根とする
  let edges = [];
  edges[0] = {};
  edges[1] = {};

  // far の地点が上にある方を edges の1番目（切り取りの始点）、下にある方を2番目（切り取りの終点）とする
  // 右手側の場合、startとend、ひとつ前の id の符号を逆転させている
  if(defects[0].far.point.y <= defects[1].far.point.y){
    edges[start].separatePoint = defects[0].far.point;
    edges[end].separatePoint = defects[1].far.point;
    edges[start].oneBeforeId = defects[0].far.id + oneBefore;
    edges[end].oneBeforeId = defects[1].far.id - oneBefore;
  }else{
    edges[end].separatePoint = defects[0].far.point;
    edges[start].separatePoint = defects[1].far.point;
    edges[end].oneBeforeId = defects[0].far.id - oneBefore;
    edges[start].oneBeforeId = defects[1].far.id + oneBefore;
  }

  console.log("left", left);
  console.log("edges", edges);
  console.log("edges[0].oneBeforeId pos", contour.data32S[edges[0].oneBeforeId * 2], contour.data32S[edges[0].oneBeforeId * 2 + 1]);
  console.log("edges[1].oneBeforeId pos", contour.data32S[edges[1].oneBeforeId * 2], contour.data32S[edges[1].oneBeforeId * 2 + 1]);

  let armContour = new cv.Mat();
  separateByEdge(contour, edges, armContour);
  endPiece.edge = edges;
  endPiece.contour = armContour;

  armContour.delete;
}

window.addEventListener('load', inputMesh);