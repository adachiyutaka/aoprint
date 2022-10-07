// 輪郭線を大きな塊で分割
// 最外輪郭線を塗りつぶした8bit画像を元に、大きな形のまとまりを探し、segmentオブジェクトにそれぞれのcontourと、そのmaskを登録して返す
const findSegment = (src, segments) => {
  // 外周からの距離を取得する
  let distanceTransform = new cv.Mat();
  cv.distanceTransform(src, distanceTransform, cv.DIST_L2, 5);

  // 最大値（最も外周から遠い点の距離）を取得
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
// 輪郭を縮め、最も大きな輪郭を判別する
const greatestSegment = (src, distanceTransform, maxDistance, segment, epsilon_ratio = 0.02, high = 1, low = 0) => {
  const accuracy = 0.01; // 2分探査の精度、小さい値ほど厳密な探査になる
  let mid = (high + low) / 2;
  let minArea = src.cols * src.rows / 100000;

  console.log("minArea", minArea);
  console.log("high,low", high, low, "high - low", high - low, "accuracy", accuracy);
  // 輪郭を縮める
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

  // 手足などの突起を胴体を切り離すため、凸包かどうかを判定する
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
  // 全体=0, 輪郭=255（塗りつぶし） のマスクを作成する
  let mask = new cv.Mat(src.rows, src.cols, cv.CV_8U, new cv.Scalar(0));
  let contours = new cv.MatVector();
  contours.push_back(contour);
  cv.drawContours(mask, contours, -1, new cv.Scalar(255), -1, cv.LINE_8);

  // 単純化した輪郭線を膨張させる
  let margin = ((src.rows >= src.cols)? src.rows : src.cols) / 100;  // 膨張させる際の余白
  cv.dilate(mask, mask, cv.Mat.ones(3, 3, cv.CV_8U), new cv.Point(-1, -1), Math.round(distance) + margin);

  // 輪郭を再取得する
  let hierarchy = new cv.Mat();
  cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);  // 最外部の輪郭のみ読み取る（cv.RETR_EXTERNAL）

  // マスクの白黒を反転させる
  cv.bitwise_not(mask, mask);

  // segmentに輪郭線とマスク用画像を登録する
  segment.contour = contours.get(0);
  segment.mask = mask;

  // mask.delete;
  contours.delete;
  hierarchy.delete;
}

// 複数の輪郭線（MatVector）から最も面積の大きな輪郭線（Mat）を探し、輪郭線とその面積を返す
const getMaxArea = (contours, maxAreaObject) => {
  let contourAreas = [];
  for(let i = 0; i < contours.size(); ++i) {
    contourAreas.push(cv.contourArea(contours.get(i)));
  }
  maxAreaObject.area = Math.max.apply(null, contourAreas);
  maxAreaObject.contour = contours.get(contourAreas.indexOf(maxAreaObject.area));
}

export default findSegment;