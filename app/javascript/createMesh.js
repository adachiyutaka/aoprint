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
  if(defectMat){
    for (let i = 0; i < defectMat.rows; ++i) {
      let defect = {};
      defect.start = new cv.Point(maxAreaContour.data32S[defectMat.data32S[i * 4] * 2],
                               maxAreaContour.data32S[defectMat.data32S[i * 4] * 2 + 1]);
      defect.end = new cv.Point(maxAreaContour.data32S[defectMat.data32S[i * 4 + 1] * 2],
                             maxAreaContour.data32S[defectMat.data32S[i * 4 + 1] * 2 + 1]);
      defect.center = new cv.Point(defect.start.x + defect.end.x / 2,
                                defect.start.y + defect.end.y / 2);
      defect.far = new cv.Point(maxAreaContour.data32S[defectMat.data32S[i * 4 + 2] * 2],
                             maxAreaContour.data32S[defectMat.data32S[i * 4 + 2] * 2 + 1]);
      defect.depth = defectMat.data32S[i * 4 + 3];
      defects.push(defect);

      // テスト表示
      cv.line(dst, defect.start, defect.end, new cv.Scalar(255, 255, 255), 2, cv.LINE_AA, 0);
      cv.circle(dst, defect.far, 3, new cv.Scalar(255, 0, 0), -1);
      // テスト表示
    }
  }

  // 図形全体の大きさを知るため、外接矩形を取得
  let boundingRect = cv.boundingRect(maxAreaContour);

  // テスト表示
  let point1 = new cv.Point(boundingRect.x, boundingRect.y);
  let point2 = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
  cv.rectangle(dst, point1, point2, new cv.Scalar(100, 100, 255), 2, cv.LINE_AA, 0);

  // テスト表示

  // 足のもっとも高い位置、最小の長さを決める
  //  位置は足元から全長の1/2が最大、長さは全長の1/10以上
  // const footPosition = boundingRect.y + (boundingRect.height / 2);
  const footLength = boundingRect.height / 10;

  // 凸性欠陥の開始と終了の中間点のy座標を基準にして降順ソート（中間点が低い位置にある（足らしい）凸性欠陥が一番に来る）
  defects.sort((a, b) => b.center.y - a.center.y);
  
  // 足の位置が適当な凸性欠陥を探す（もっとも低い位置のcenterから、全長の1/10以内の低さにあるもの）
  const footPosition = defects[0].center.y - boundingRect.height / 10;
  let lowerDefects = defects.filter(defect => defect.center.y >= footPosition);

  // 


  console.log("lowerDefects", lowerDefects);
  lowerDefects.forEach(defect => {
    console.log("defect.center.y", defect.center.y);
    console.log("defect.depth", defect.depth);
  });
  // let footDefect = defects.find(defect => defect.center.y >= footPosition && defect.depth >= footLength);
  let footDefect = defects.find(defect => defect.depth >= footLength);

  // テスト表示
  cv.line(dst, footDefect.start, footDefect.end, new cv.Scalar(100, 255, 255), 4, cv.LINE_AA, 0);
  cv.circle(dst, footDefect.far, 5, new cv.Scalar(100, 255, 255), -1);
  cv.imshow('output12', dst);
  console.log("found defect", footDefect);
  // テスト表示

  // 足がない場合



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

window.addEventListener('load', inputMesh);