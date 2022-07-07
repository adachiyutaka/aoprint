import earcut from 'earcut';
import _ from 'lodash';

let dst;

const bone = (base64url) => {
  const img = new Image();
  img.src = base64url;

  // 最外輪郭を取得
  let src = cv.imread(img);
  let outlineContours = getOutlineContours(src);

  // テスト表示
  dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // テスト表示
  
  // 大まかな形状をセグメント分けにより取得する
  // 輪郭線でぬりつぶした画像を作成
  let segmentSrc = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.drawContours(segmentSrc, outlineContours, -1, new cv.Scalar(255, 255, 255), -1, cv.LINE_8);

  // 輪郭線取得のための2値化
  cv.cvtColor(segmentSrc, segmentSrc, cv.COLOR_RGBA2GRAY);
  cv.threshold(segmentSrc, segmentSrc, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

  // セグメントに分ける
  let segments = [];
  findSegment(segmentSrc, segments);
  let seedContours = new cv.MatVector();
  segments.forEach((segment) => {
    seedContours.push_back(segment.contour);
  });
  // cv.drawContours(segmentSrc, seedContours, -1, new cv.Scalar(255, 255, 0), 1, cv.LINE_8);
  // cv.imshow('output11', segmentSrc);


  // 体のパーツを判定する
  // 最大の面積を持つ輪郭線を取得
  let maxArea = {};
  getMaxArea(outlineContours, maxArea);
  let outlineContour = maxArea.contour;

  // 凸性欠陥の検出
  let hull = new cv.Mat();
  let defectMat = new cv.Mat();
  cv.convexHull(outlineContour, hull, false, false);
  cv.convexityDefects(outlineContour, hull, defectMat);

  // 凸性欠陥の結果をxy座標に置き換え
  let defects = [];
  if(defectMat){
    for (let i = 0; i < defectMat.rows; ++i) {
      let start = new cv.Point(outlineContour.data32S[defectMat.data32S[i * 4] * 2],
                               outlineContour.data32S[defectMat.data32S[i * 4] * 2 + 1]);
      let end = new cv.Point(outlineContour.data32S[defectMat.data32S[i * 4 + 1] * 2],
                             outlineContour.data32S[defectMat.data32S[i * 4 + 1] * 2 + 1]);
      let center = new cv.Point(start.x + end.x / 2,
                                start.y + end.y / 2);
      let far = new cv.Point(outlineContour.data32S[defectMat.data32S[i * 4 + 2] * 2],
                             outlineContour.data32S[defectMat.data32S[i * 4 + 2] * 2 + 1]);
      
      let defect = {depth: defectMat.data32S[i * 4 + 3],
                start: start,
                end: end,
                center: center,
                far: far};
      
      defects.push(defect);

      // テスト表示
      // cv.line(dst, defect.start, defect.end, new cv.Scalar(255, 255, 255), 2, cv.LINE_AA, 0);
      // cv.circle(dst, defect.far, 3, new cv.Scalar(255, 0, 0), -1);
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
      if(cv.pointPolygonTest(segment.contour, defect.far, false) >= 0){
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
  // let bodyPoint1 = new cv.Point(bodyRect.x, bodyRect.y);
  // let bodyPoint2 = new cv.Point(bodyRect.x + bodyRect.width, bodyRect.y + bodyRect.height);
  // cv.rectangle(dst, bodyPoint1, bodyPoint2, new cv.Scalar(230, 230, 200), 2, cv.LINE_AA, 0);

  let point1 = new cv.Point(boundingRect.x, boundingRect.y);
  let point2 = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
  cv.rectangle(dst, point1, point2, new cv.Scalar(100, 100, 255), 2, cv.LINE_AA, 0);

  // 輪郭線を Mat から Array に変換して体のパーツを切り取る
  // 体のパーツを切り取った残りの輪郭線を body とし、続けて次のパーツを切り取る（手足と頭のない輪郭線が残る）
  let outlineArray = [];
  for(let i = 0; i < outlineContour.rows; i++ ){
    outlineArray.push(new cv.Point(outlineContour.data32S[i * 2], outlineContour.data32S[i * 2 + 1]));
  }
  let body = {};
  
  // 股下の点と左右の足の先端の点を判定し、股下の点を基準に水平線で切り取る

  // 股下の点を探す
  const lowestCenter = defects.sort((a, b) => b.center.y - a.center.y)[0].center.y; // 凸性欠陥のcenterのy座標を基準にして降順ソートし、もっとも低い位置のcenterを求める
  const legPosition = lowestCenter - boundingRect.height / 10; // もっとも低い位置のcenterから、全長の1/10以内の低さにあるもの
  const hipPosition = bodyRect.y + bodyRect.height - bodyRect.height / 2;    // 胴体の半分より下にfarの点があるもの（胴体の下側についている）
  const lowerDefects = defects.filter(defect => defect.center.y >= legPosition && defect.far.y >= hipPosition);

  // もっとも depth が大きい defect を股下とする
  lowerDefects.sort((a, b) => b.depth - a.depth);
  const legDefect = lowerDefects[0];

  // 股下の点（legDefect.far）を通る水平線で左右の足を切り取る
  let leftLeg = {};
  separateByLine(outlineArray, outlineArray, 0, 1, -legDefect.far.y, leftLeg, body, legDefect.start);

  let leftUpperLeg = {};
  let leftLowerLeg = {};
  const leftLegTip = findFarthest(leftLeg.array, leftLeg.separatePoints.center);
  separateByRatio(outlineArray, leftLeg.array, leftLeg.separatePoints, leftLegTip, 4/10, leftLowerLeg, leftUpperLeg);

  let leftFoot = {};
  separateByRatio(outlineArray, leftLowerLeg.array, leftLowerLeg.separatePoints, leftLegTip, 4/6, leftFoot, leftLowerLeg);

  let rightLeg = {};
  separateByLine(outlineArray, body.array, 0, 1, -legDefect.far.y, rightLeg, body, legDefect.end);

  let rightUpperLeg = {};
  let rightLowerLeg = {};
  const rightLegTip = findFarthest(rightLeg.array, rightLeg.separatePoints.center);
  separateByRatio(outlineArray, rightLeg.array, rightLeg.separatePoints, rightLegTip, 4/10, rightLowerLeg, rightUpperLeg);

  let rightFoot = {};
  separateByRatio(outlineArray, rightLowerLeg.array, rightLowerLeg.separatePoints, rightLegTip, 4/6, rightFoot, rightLowerLeg);

  // 足がない場合

  // 腕を判定する
  // 腕の輪郭線を切り取る
  let leftArm = {};
  separateLeftArm(body.array, defects, boundingRect, bodyRect, leftArm, body);

  let leftUpperArm = {};
  let leftLowerArm = {};
  const leftArmTip = findFarthest(leftArm.array, leftArm.separatePoints.center);
  separateByRatio(outlineArray, leftArm.array, leftArm.separatePoints, leftArmTip, 4/10, leftLowerArm, leftUpperArm);

  let leftHand = {};
  separateByRatio(outlineArray, leftLowerArm.array, leftLowerArm.separatePoints, leftArmTip, 4/6, leftHand, leftLowerArm);

  let rightArm = {};
  separateRightArm(body.array, defects, boundingRect, bodyRect, rightArm, body);

  let rightUpperArm = {};
  let rightLowerArm = {};
  const rightArmTip = findFarthest(rightArm.array, rightArm.separatePoints.center);
  separateByRatio(outlineArray, rightArm.array, rightArm.separatePoints, rightArmTip, 4/10, rightLowerArm, rightUpperArm);

  let rightHand = {};
  separateByRatio(outlineArray, rightLowerArm.array, rightLowerArm.separatePoints, rightArmTip, 4/6, rightHand, rightLowerArm);

  // 頭の位置を指定する
  let headSeparatePoints = [rightArm.separatePoints.end, leftArm.separatePoints.start];

  // 頭を切り取る
  let neckAndHead = {};
  separateByPoint(body.array, headSeparatePoints, neckAndHead, body);
  let neck = {};
  let head = {};
  const headTip = findFarthest(neckAndHead.array, neckAndHead.separatePoints.center);  

  separateByRatio(outlineArray, neckAndHead.array, neckAndHead.separatePoints, headTip, 1/10, head, neck, true);

  // 胴体を切り取る
  let chest = {};
  let hips = {};
  separateByRatio(outlineArray, body.array, neckAndHead.separatePoints, legDefect.far, 8/10, hips, chest);

  console.log("chest.rootPoints", chest.rootPoints)
  console.log("hips.rootPoints", hips.rootPoints)
  
  let boneNamedPoints = [
    {name: "hips", points: hips},
    {name: "chest", points: chest},
    {name: "upperArm.L", points: leftUpperArm},
    {name: "lowerArm.L", points: leftLowerArm},
    {name: "hand.L", points: leftHand},
    {name: "upperArm.R", points: rightUpperArm},
    {name: "lowerArm.R", points: rightLowerArm},
    {name: "hand.R", points: rightHand},
    {name: "neck", points: neck},
    {name: "head", points: head},
    {name: "upperLeg.L", points: leftUpperLeg},
    {name: "lowerLeg.L", points: leftLowerLeg},
    {name: "foot.L", points: leftFoot},
    {name: "upperLeg.R", points: rightUpperLeg},
    {name: "lowerLeg.R", points: rightLowerLeg},
    {name: "foot.R", points: rightFoot},
  ]

  let boneId = [
    "hips", 
    "spine", 
    "chest", 
    "chest.Upper", 
    "collarbone.L", 
    "upperArm.L", 
    "lowerArm.L", 
    "hand.L", 
    "indexProximal.L", 
    "indexIntermediate.L", 
    "indexDistal.L", 
    "indexDistal.L_end", 
    "middleProximal.L", 
    "middleIntermediate.L", 
    "middleDistal.L", 
    "middleDistal.L_end", 
    "thumbProximal.L", 
    "thumbIntermediate.L", 
    "thumbDistal.L", 
    "thumbDistal.L_end", 
    "collarbone.R", 
    "upperArm.R", 
    "lowerArm.R", 
    "hand.R", 
    "indexProximal.R", 
    "indexIntermediate.R", 
    "indexDistal.R", 
    "indexDistal.R_end", 
    "middleProximal.R", 
    "middleIntermediate.R", 
    "middleDistal.R", 
    "middleDistal.R_end", 
    "thumbProximal.R", 
    "thumbIntermediate.R", 
    "thumbDistal.R", 
    "thumbDistal.R_end", 
    "neck", 
    "head", 
    "eye.L", 
    "eye.L_end", 
    "eye.R", 
    "eye.R_end", 
    "jaw", 
    "jaw_end", 
    "upperLeg.L", 
    "lowerLeg.L", 
    "foot.L", 
    "toe.L", 
    "toe.L_end", 
    "upperLeg.R", 
    "lowerLeg.R", 
    "foot.R", 
    "toe.R", 
    "toe.R_end"]
  
  let boneHierachy = [
    "hips", [
      "chest", [
        "neck", [
          "head"
        ]
      ], [
        "upperArm.L", [
          "lowerArm.L", [
            "hand.L"
          ]
        ]
      ], [
        "upperArm.R", [
          "lowerArm.R", [
            "hand.R"
          ]
        ]
      ]
    ], [
      "upperLeg.L", [
        "lowerLeg.L", [
          "foot.L"
        ]
      ]
    ], [
      "upperLeg.R", [
        "lowerLeg.R", [
          "foot.R"
        ]
      ]
    ]
  ]

  // パーツの輪郭ごとに三角分割して一つの配列にまとめる
  // 各頂点と関連するパーツ名の配列を作成する

  // 三角形をまとめた配列の初期化
  let triangles = [];
  // 各頂点と関連するパーツ名の配列の初期化
  let boneNamesOnVertices = new Array(outlineArray.length).fill().map(i => []);
  let boneIdOnVertices = new Array(outlineArray.length).fill().map(i => []);
  let boneWeightOnVertices = new Array(outlineArray.length).fill().map(i => []);

  // パーツの輪郭ごとに処理する
  boneNamedPoints.forEach(boneNamedPoint => {
    let contourArray = boneNamedPoint.points.array;
    // 三角分割する
    let partTriangles = triangulation(contourArray);
    // 三角分割で得られた配列は、パーツごとの輪郭戦のidで指定されているため、全体の輪郭戦のidに指定し直す
    partTriangles = partTriangles.map(pointId => findArrayIndex(outlineArray, contourArray[pointId]));
    // 指定し直した配列を追加する
    triangles.push(...partTriangles);
    // パーツの各点のidと同じidに関連するパーツ名の配列を作成する
    partTriangles.forEach(pointId => {
      boneNamesOnVertices[pointId] = _.union(boneNamesOnVertices[pointId], [boneNamedPoint.name]);
    });
  });

  boneWeight(outlineArray, boneHierachy, boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices);

  console.log("boneId", boneId);
  console.log("boneIdOnVertices", boneIdOnVertices);
  console.log("boneWeightOnVertices", boneWeightOnVertices);
  
  boneNamesOnVertices.forEach((boneNamesOnVertex, index) => {
    if(boneNamesOnVertex.length == 0){
      cv.circle(dst, outlineArray[index], 3, new cv.Scalar(255, 0, 0), -1);
    }
  });
  cv.imshow('output14', dst);

  console.log("boneNamesOnVertices", boneNamesOnVertices);
  console.log("boneNamedPoints", boneNamedPoints);
  console.log("outlineArray", outlineArray);

  let leftLegContour = new cv.Mat();
  let rightLegContour = new cv.Mat();
  let leftUpperLegContour = new cv.Mat();
  let leftLowerLegContour = new cv.Mat();
  let leftFootContour = new cv.Mat();
  let rightUpperLegContour = new cv.Mat();
  let rightLowerLegContour = new cv.Mat();
  let rightFootContour = new cv.Mat();
  let leftArmContour = new cv.Mat();
  let leftUpperArmContour = new cv.Mat();
  let leftLowerArmContour = new cv.Mat();
  let leftHandContour = new cv.Mat();
  let rightArmContour = new cv.Mat();
  let rightUpperArmContour = new cv.Mat();
  let rightLowerArmContour = new cv.Mat();
  let rightHandContour = new cv.Mat();
  let headContour = new cv.Mat();
  let neckContour = new cv.Mat();
  let bodyContour = new cv.Mat();
  let chestContour = new cv.Mat();
  let hipsContour = new cv.Mat();

  contourFromArray(leftLeg.array, leftLegContour);
  contourFromArray(leftUpperLeg.array, leftUpperLegContour);
  contourFromArray(leftLowerLeg.array, leftLowerLegContour);
  contourFromArray(leftFoot.array, leftFootContour);
  contourFromArray(rightLeg.array, rightLegContour);
  contourFromArray(rightUpperLeg.array, rightUpperLegContour);
  contourFromArray(rightLowerLeg.array, rightLowerLegContour);
  contourFromArray(rightFoot.array, rightFootContour);
  contourFromArray(leftArm.array, leftArmContour);
  contourFromArray(leftUpperArm.array, leftUpperArmContour);
  contourFromArray(leftLowerArm.array, leftLowerArmContour);
  contourFromArray(leftHand.array, leftHandContour);
  contourFromArray(rightArm.array, rightArmContour);
  contourFromArray(rightUpperArm.array, rightUpperArmContour);
  contourFromArray(rightLowerArm.array, rightLowerArmContour);
  contourFromArray(rightHand.array, rightHandContour);
  contourFromArray(neck.array, neckContour);
  contourFromArray(head.array, headContour);
  contourFromArray(body.array, bodyContour);
  contourFromArray(chest.array, chestContour);
  contourFromArray(hips.array, hipsContour);

  let separatedContours = new cv.MatVector();
  // separatedContours.push_back(leftLegContour);
  // separatedContours.push_back(rightLegContour);
  // separatedContours.push_back(leftArmContour);
  // separatedContours.push_back(rightArmContour);
  // separatedContours.push_back(bodyContour);
  // separatedContours.push_back(leftUpperLegContour);
  separatedContours.push_back(leftLowerLegContour);
  // separatedContours.push_back(leftFootContour);
  // separatedContours.push_back(rightUpperLegContour);
  separatedContours.push_back(rightLowerLegContour);
  // separatedContours.push_back(rightFootContour);
  // separatedContours.push_back(leftUpperArmContour);
  separatedContours.push_back(leftLowerArmContour);
  // separatedContours.push_back(leftHandContour);
  // separatedContours.push_back(rightUpperArmContour);
  separatedContours.push_back(rightLowerArmContour);
  // separatedContours.push_back(rightHandContour);
  // separatedContours.push_back(headContour);
  separatedContours.push_back(neckContour);
  separatedContours.push_back(chestContour);
  separatedContours.push_back(hipsContour);

  cv.drawContours(dst, separatedContours, -1, new cv.Scalar(200, 255, 255), 1, cv.LINE_8);
  cv.imshow('output15', dst);

  boneWeightOnVertices.forEach((boneWeights, index) => {
    cv.circle(dst, outlineArray[index], 3, new cv.Scalar(255 * boneWeights[0], 255 - (255 * boneWeights[0]), 0), -1);
  });
  cv.imshow('output16', dst);

  outlineContour.delete;
  hull.delete;
  defectMat.delete;

  separatedContours.delete;
  leftLegContour.delete;
  leftLowerLegContour.delete;
  leftUpperLegContour.delete;
  leftFootContour.delete;
  rightLegContour.delete;
  rightLowerLegContour.delete;
  rightUpperLegContour.delete;
  rightFootContour.delete;
  leftArmContour.delete;
  leftLowerArmContour.delete;
  leftUpperArmContour.delete;
  leftHandContour.delete;
  rightArmContour.delete;
  rightLowerArmContour.delete;
  rightUpperArmContour.delete;
  rightHandContour.delete;
  headContour.delete;
  neckContour.delete;
  bodyContour.delete;
  chestContour.delete;
  hipsContour.delete;

  segmentSrc.delete;
  src.delete;

  return {vertices: outlineArray, triangles: triangles, boneIdOnVertices: boneIdOnVertices, boneWeightOnVertices: boneWeightOnVertices};
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

// 複数の輪郭線（MatVector）から最も面積の大きな輪郭線（Mat）を探す
const getMaxArea = (contours, maxAreaObject) => {
  let contourAreas = [];
  for(let i = 0; i < contours.size(); ++i) {
    contourAreas.push(cv.contourArea(contours.get(i)));
  }
  maxAreaObject.area = Math.max.apply(null, contourAreas);
  maxAreaObject.contour = contours.get(contourAreas.indexOf(maxAreaObject.area));
}

// 直線方程式で輪郭線を分割する
const separateByLine = (outlineArray, originalContourArray, a, b, c, tipPortion, anotherPortion, tip, root = null) => {
  // tip は手足の先端など分割の際に探査の基準とする位置（cv.Point）
  // a, b, c は ax + by + c = 0 の直線方程式の係数

  // 分割する点を算出する
  let separatePoints = [];

  // spliceで挿入するため、元の配列が変更されないようにコピーする
  let contourArray = originalContourArray.slice();

  // 輪郭線のidとcontourArrayのidがずれる場合があるため、contourArrayでのidに変換する
  let tipId = findArrayIndex(contourArray, tip);
  let rootId;
  if(root){
    rootId = findArrayIndex(contourArray, root);
  }else{
    rootId = findArrayIndex(contourArray, findFarthest(contourArray, tip));
  }
  let tipSign;
  let separatePoint;
  let id;
  let onePreviousId;

  // 輪郭線の各点について探査し、最初の点(tip)と線分の位置関係（符号）が反転した点から交点を計算する
  for (let i = 0; i < contourArray.length + 1; ++i) {
    let sign;
    // tipの点から輪郭線の順に探査する
    // 途中でidがマイナスになる場合に対応するため、配列の長さ + id とする
    id = (tipId + i) % contourArray.length;
    let point = contourArray[id];
    let x = point.x;
    let y = point.y;
    let x2;
    let y2;

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
      onePreviousId = id;
      continue;
    }

    if(tipSign == sign){
      onePreviousId = id;
      continue;
    }else if(sign == 0){
      // 符号が0になった場合（たまたま、輪郭の点が分割のための直線の上にある）
      separatePoint = point;
      // break;
    }else if(tipSign != sign){
      // スタート地点の符号と異なる符号になった場合（輪郭線が直線をはじめてまたいだ）
      // その前後の2点の間に、新しい分割用の点（2点を結ぶ直線と、分割のための直線の交点）を作成する
      // 初めてまたいだ点の一つ前の点を算出する
      let onePreviousPoint = contourArray[onePreviousId]; // 一つ前の点
      // let onePreviousPoint = new cv.Point(contour.data32S[onePreviousId * 2], contour.data32S[onePreviousId * 2 + 1]); // 一つ前の点
      if(x == onePreviousPoint.x){
        // 2点を結ぶ直線が垂直になる場合
        separatePoint = new cv.Point(x, - a / b * x - c / b);
      }else{
        // 2点を結ぶ直線が垂直にならない場合
        // 初めてまたいだ点(x, y)と、その一つ前の点(x2, y2)を結ぶ直線方程式(y = a2x + b2)の係数を算出する
        x2 = onePreviousPoint.x;
        y2 = onePreviousPoint.y;
        let a2 = (y2 - y)/(x2 - x);
        let b2 = (y * x2 - y2 * x) / (x2 - x);

        if(b == 0){
          // 分割のための直線が垂直の場合
          let x3 = -c/a; // 垂直の直線方程式 ax = -c の変形
          separatePoint = new cv.Point(x3, a2 * x3 + b2); // y = a2 * x + b2 に代入
        }else{
          // ax + by + c = 0 の方程式を y = a1x + b1 の形に置き換える
          let a1 = - a / b;
          let b1 = - c / b;
          // 2点を結ぶ直線と分割のための直線の交点を計算する
          separatePoint = new cv.Point((b2 - b1)/(a1 - a2), (a1 * b2 - b1 * a2)/(a1 - a2));
        }
      }
    }
    separatePoints.push({point: separatePoint, id: id, sign: sign});
    tipSign *= -1;
  }

  // 直線をまたいだ点が2つ以上あった場合、2つにしぼる
  if(separatePoints.length > 2){
    separatePoints.sort((a ,b) => a.id - b.id);
    let minId = separatePoints[0].id;
    separatePoints.sort((a ,b) => b.id - a.id);
    let maxId = separatePoints[0].id;

    const bothSidePoints = (separatePoints, minId, maxId, checkId) => {
      let bothSideId = [];
      if(checkId < minId || maxId < checkId){
        bothSideId = [minId, maxId]
      }else{
        separatePoints.sort((a, b) => (a.id - checkId) - (b.id - checkId));
        let nextId = separatePoints.filter(point => point.id - checkId > 0)[0].id;
        let previousId = separatePoints.filter(point => point.id - checkId < 0).pop().id;
        bothSideId = [nextId, previousId];
      }
      return [separatePoints.find(separatePoint => separatePoint.id == bothSideId[0]), separatePoints.find(separatePoint => separatePoint.id == bothSideId[1])];
    }

    let tipBothSidePoints = bothSidePoints(separatePoints, minId, maxId, tipId);
    let rootBothSidePoints = bothSidePoints(separatePoints, minId, maxId, rootId);;

    separatePoints = distance(tipBothSidePoints[0].point, tipBothSidePoints[1].point) <= distance(rootBothSidePoints[0].point, rootBothSidePoints[1].point)? tipBothSidePoints : rootBothSidePoints  
  }

  // 線分と輪郭線の交点を輪郭線の配列に追加する
  separatePoints.forEach(separatePoint => {
    if(separatePoint.sign != 0){
      // 小数点以下を四捨五入する
      separatePoint.point.x = Math.round(separatePoint.point.x);
      separatePoint.point.y = Math.round(separatePoint.point.y);
      console.log("round separatePoint", separatePoint);
      // 前後の点と被らなかった場合、新たに追加する
      if(findArrayIndex(contourArray, separatePoint.point) == -1){
        // 全体の輪郭と、分割するパーツの輪郭にそれぞれ追加する
        outlineArray.splice(findArrayIndex(outlineArray, contourArray[separatePoint.id]), 0, separatePoint.point);
        contourArray.splice(findArrayIndex(contourArray, contourArray[separatePoint.id]), 0, separatePoint.point);
      }
    }
  });

  // idを昇順に追っていくと separatePoints[0].id, tipId, separatePoints[1].id の順になるよう変更する
  separatePoints.sort((a, b) => a.id - b.id);
  if(tipId < separatePoints[0].id || separatePoints[1].id < tipId){
    separatePoints.sort((a, b) => b.id - a.id);
  }

  separatePoints = separatePoints.map(separatePoint => separatePoint.point);

  // 指定した点で輪郭を切り取る
  separateByPoint(contourArray, separatePoints, tipPortion, anotherPortion);
}

// 与えられた2つの端（separatePoints）をもとに輪郭線を切り取る
const separateByPoint = (contourArray, separatePoints, tipPortion, anotherPortion) => {
  let start = separatePoints[0];
  let end = separatePoints[1];
  let startId = findArrayIndex(contourArray, start);
  let endId = findArrayIndex(contourArray, end);
  let tipPortionArray;
  let anotherPortionArray;

  // 始点と終点が id:0 をまたいでいるか判定
  if(startId > endId){
    // 始点から終点までが id:0 をまたいでいる場合
    // 末端側の配列は、始点からidの最後、id:0 から終点、の二つの輪郭線を合成して作成
    tipPortionArray = contourArray.slice(startId).concat(contourArray.slice(0, endId + 1));

    // 根本側の配列は、終点から始点で切り取る
    anotherPortionArray = contourArray.slice(endId, startId + 1);
  }else{
    // 始点から終点までが id:0 をまたいでいない場合
    // 末端側の配列は、始点から終点の輪郭線を切り取る
    tipPortionArray = contourArray.slice(startId, endId + 1).concat();

    // 根本側の配列は、始点からidの最後、id:0 から終点、の二つの輪郭線を合成して作成
    anotherPortionArray = contourArray.slice(endId).concat(contourArray.slice(0, startId + 1));
  }

  console.log("tipPortionArray", tipPortionArray);
  console.log("anotherPortionArray", anotherPortionArray);

  const points = {start: start, end: end, center: new cv.Point((start.x + end.x) / 2, (start.y + end.y) / 2)};
  tipPortion.array = tipPortionArray;
  tipPortion.separatePoints = points;
  anotherPortion.array = anotherPortionArray;
  anotherPortion.separatePoints = points;
}

const separateLeftArm = (contourArray, defects, boundingRect, bodyRect, tipPortion, anotherPortion) => {
  separateArm(contourArray, defects, boundingRect, bodyRect, tipPortion, anotherPortion, true);
}

const separateRightArm = (contourArray, defects, boundingRect, bodyRect, tipPortion, anotherPortion) => {
  separateArm(contourArray, defects, boundingRect, bodyRect, tipPortion, anotherPortion, false);
}

// 腕の defect 候補の中からもっとも depth の大きい2点で輪郭線を切り取る
const separateArm = (contourArray, defects, boundingRect, bodyRect, tipPortion, anotherPortion, left = true) => {

  let armDefects;
  let start = 0;
  let end = 1;

  // 付け根（defect.far）がbodyの範囲内にあるもの
  const armHeightMax = bodyRect.y + bodyRect.height; // 体の底辺より上
  const armHeightMin = bodyRect.y; // 体の天辺より下

  if(left){
    // 左側（左腕）を切り取る場合
    // bodyと同じ高さで左側にあるものを探す
    const leftArmX = bodyRect.x + bodyRect.width / 2; // 体の半分より左側
    armDefects = defects.filter(defect => defect.far.x <= leftArmX && defect.far.y >= armHeightMin && defect.far.y <= armHeightMax);

    // star, endのどちらかが小さい方を小さい順にソートする（左側にある順に）
    armDefects.sort((a, b) => Math.min(a.start.x, a.end.x) - Math.min(b.start.x, b.end.x));

    // 一定以上左端にあるもののみ選ぶ
    let leftArmPosition = Math.min(armDefects[0].start.x, armDefects[0].end.x) + boundingRect.width / 10;
    armDefects = armDefects.filter(defects => Math.min(defects.start.x, defects.end.x) <= leftArmPosition);
  } else {
    // 右側（右腕）を切り取る場合
    // bodyと同じ高さで右側にあるものを探す
    const rightArmX = bodyRect.x + bodyRect.width - bodyRect.width / 2; // 体の半分より右側
    armDefects = defects.filter(defect => defect.far.x >= rightArmX && defect.far.y >= armHeightMin && defect.far.y <= armHeightMax);

    // star, endのどちらかが大きい方を大きい順にソートする（右側にある順に）
    armDefects.sort((a, b) => Math.max(b.start.x, b.end.x) - Math.max(a.start.x, a.end.x));

    // 一定以上右端にあるもののみ選ぶ
    let rightArmPosition =  Math.max(armDefects[0].start.x, armDefects[0].end.x) - boundingRect.width / 10;
    armDefects = armDefects.filter(defect => Math.max(defect.start.x, defect.end.x) >= rightArmPosition);

    // 切り取る始点と終点の符号を逆転する
    start = 1;
    end = 0;
  }
  
  // depthが大きい順にソートする
  armDefects.sort((a, b) => b.depth - a.depth);

  // depth が1番目と2番目の far を腕の付け根とする
  let separatePoints = [];

  // far の地点が上にある方を edges の1番目（切り取りの始点）、下にある方を2番目（切り取りの終点）とする
  // 右手側の場合、startとend、ひとつ前の id の符号を逆転させている
  if(armDefects[0].far.y <= armDefects[1].far.y){
    separatePoints[start] = armDefects[0].far;
    separatePoints[end] = armDefects[1].far;
  }else{
    separatePoints[end] = armDefects[0].far;
    separatePoints[start] = armDefects[1].far;
  }
  // 指定した点で腕を切り取る
  separateByPoint(contourArray, separatePoints, tipPortion, anotherPortion);
}

// 手足の根元と先端を指定し、割合で切り取る
const separateByRatio = (outlineArray, contourArray, rootPoints, tip, ratio, tipPortion, anotherPortion, parallel = false) => {
  // ratioは先端側と根本側の比率（0.7の場合、根本側が7割）
  // parallel = true にした場合、rootPointsによる線分と並行な線で切り取る

  // 付け根と先端を結ぶ線分上にある、指定された比率の地点を通り、線分と直行する直線方程式の係数(ay + bx + c = 0)を算出
  let a;
  let b;
  let c;
  let x = rootPoints.center.x;
  let y = rootPoints.center.y;
  let x1 = tip.x;
  let y1 = tip.y;

  if(parallel){
    // 切り取る線分が並行とする場合
    if(rootPoints.start.y == rootPoints.end.y){
        // rootの線分が水平になる場合
        a = 1;
        b = 0;
        c = (y1 - y) * ratio + y;
    }else{
      let slope = (rootPoints.start.y - rootPoints.end.y)/(rootPoints.start.x - rootPoints.end.x);

      // 付け根と先端を結ぶ線分上にある、指定された比率の地点を算出（ratio = 0.5であれば中点）
      let ratioPoint = new cv.Point((x1 - x) * ratio + x, (y1 - y) * ratio + y); 
  
      // ratioPointを通り、並行な傾きを持つ直線方程式(ax + by + c = 0)の係数を算出する
      a = - slope;
      b = 1;
      c = - ratioPoint.y + slope * ratioPoint.x;
    }
  }else{
    // 切り取る線分の傾きを算出する場合
    if(x == x1){
      // 2点を結ぶ直線が垂直になる場合
      a = 1;
      b = 0;
      c = (y1 - y) * ratio + y;
    }else{
      // 2点を結ぶ直線が垂直にならない場合
      // 根元の点(x, y)と、先端の点(x1, y1)を結ぶ直線方程式(y = ax + b)の傾きを算出する
      let slope = (y1 - y)/(x1 - x);
  
      // 直行する直線の傾きを求める
      slope = - 1 / slope;
  
      // 付け根と先端を結ぶ線分上にある、指定された比率の地点を算出（ratio = 0.5であれば中点）
      let ratioPoint = new cv.Point((x1 - x) * ratio + x, (y1 - y) * ratio + y); 
  
      // ratioPointを通り、直行する傾きを持つ直線方程式(ax + by + c = 0)の係数を算出する
      a = - slope;
      b = 1;
      c = - ratioPoint.y + slope * ratioPoint.x;
    }
  }

  // 算出した直線で切り取る
  separateByLine(outlineArray, contourArray, a, b, c, tipPortion, anotherPortion, tip, rootPoints.start);
  anotherPortion.rootPoints = rootPoints;
}

// Point配列の中から指定した点と同じ値のindexを返す
const findArrayIndex = (array, point) => {
  return array.findIndex(p => p.x == point.x && p.y == point.y);
}

// 2点の距離を算出する
const distance = (point1, point2) => {
  return Math.sqrt( Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

// Point配列の中から指定した点との距離が最も遠い点を探す
const findFarthest = (array, rootPoint) => {
  return array.slice().sort((a, b) => distance(b, rootPoint) - distance(a, rootPoint))[0];
}

// Pointの配列からMatの輪郭線を作成する
const contourFromArray = (array, dstContour) => {
  let xArray = [];
  let yArray = [];
  array.forEach(point => {
    xArray.push(point.x);
    yArray.push(point.y);
  });
  
  let xy = new cv.MatVector();
  let x = new cv.matFromArray(xArray.length, 1, cv.CV_32S, xArray);
  let y = new cv.matFromArray(yArray.length, 1, cv.CV_32S, yArray);
  xy.push_back(x);
  xy.push_back(y);
  cv.merge(xy, dstContour);

  xy.delete;
  x.delete;
  y.delete;
}

const triangulation = (arrayContour) => {
  // cv.Pointの配列を[point1.x, point1.y, point2.x, point2.y, ...]のようにフラットに変換する
  let arrayContourFlat = arrayContour.flatMap(point => [point.x, point.y])
  let triangles = earcut(arrayContourFlat);

  // 作成した三角形の表示
  let triangle_i;
  let triangleContour = new cv.Mat();
  for(triangle_i = triangles.length; triangle_i; ) {
    let triangle = [];
    --triangle_i; triangle.push(arrayContour[triangles[triangle_i]]);
    --triangle_i; triangle.push(arrayContour[triangles[triangle_i]]);
    --triangle_i; triangle.push(arrayContour[triangles[triangle_i]]);
    contourFromArray(triangle, triangleContour);
    cv.fillConvexPoly(dst, triangleContour, new cv.Scalar((255 + 255 * (triangle_i * 30 / triangles.length)) % 255, (155 + 255 * (triangle_i * 40 / triangles.length)) % 255, (0 + 255 * (triangle_i * 100 / triangles.length)) % 255));
  }

  return triangles;
}

const boneWeight = (outlineArray, boneHierachy, boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices) => {
  let arrayCount = 0;
  boneHierachy.forEach(bones => {
    if(Array.isArray(bones)){
      arrayCount ++;
    }
  });
  console.log("arrayCount", arrayCount);
  
  let parentBoneName = boneHierachy[0];
  let points = boneNamedPoints.find(boneNamedPoint => boneNamedPoint.name == parentBoneName).points;
  console.log("parentBoneName", parentBoneName);
  console.log("points", points);


  if(arrayCount == 1){
    console.log("arrayCount == 1");
    let childBoneName = boneHierachy[1][0];
    let rootPoint = points.rootPoints.center;
    let separatePoint = points.separatePoints.center;
    let slope = (separatePoint.y - rootPoint.y) / (separatePoint.x - rootPoint.x);
    let orthogonalSlope = - 1 / slope;
    // y - separatePoint.y = slope * (x - separatePoint.x)
    // y = slope * x - slope * separatePoint.x + separatePoint.y

    // y - point.y = orthogonalSlope * (x - point.x)
    // y = orthogonalSlope * x - orthogonalSlope * point.x + point.y

    // y=ax+b と y=cx+d の交点は (d-b/a-c, ad-bc/a-c)
    console.log("slope", slope);

    points.array.forEach(point => {
      let id = findArrayIndex(outlineArray, point);
      let a = slope;
      let b = - slope * separatePoint.x + separatePoint.y;
      let c = orthogonalSlope;
      let d = - orthogonalSlope * point.x + point.y;
      let intersection = {};
      intersection.x = (d - b) / (a - c);
      intersection.y = (a * d - b * c) / (a - c);
      console.log("intersection", intersection, "separatePoint", separatePoint, "rootPoint", rootPoint);

      let boneLength = distance(rootPoint, separatePoint);
      let intersectionLength = distance(rootPoint, intersection);
      let parentWeight = Math.min(intersectionLength / boneLength, 1);
      let childWeight = 1 - parentWeight;
      if(boneIdOnVertices[id].length == 0){
        boneIdOnVertices[id].push(boneId.findIndex(name => name == parentBoneName), boneId.findIndex(name => name == childBoneName));
      }
      if(boneWeightOnVertices[id].length == 0){
        boneWeightOnVertices[id].push(parentWeight, childWeight);      
      }
    });
    boneWeight(outlineArray, boneHierachy[1], boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices);
  }else{
    console.log("arrayCount != 1");
    points.array.forEach(point => {
      let id = findArrayIndex(outlineArray, point);
      if(boneIdOnVertices[id].length == 0){
        boneIdOnVertices[id].push(boneId.findIndex(name => name == parentBoneName));
      }
      if(boneWeightOnVertices[id].length == 0){
        boneWeightOnVertices[id].push(1);      
      }
    });
    if(arrayCount != 0){
      console.log("arrayCount != 0");
      boneHierachy.shift();
      boneHierachy.forEach(bones => {
        boneWeight(outlineArray, bones, boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices);
      });
    }
  }
}

export default bone;