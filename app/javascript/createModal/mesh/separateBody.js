const separateBody = (outlineContour, segments, outlineArray, boneNamedPoints) => {
  // 全体の輪郭に対して凸性欠陥の検出をする
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
    }
  }

  // 図形全体の大きさを知るため、外接矩形を取得
  let boundingRect = cv.boundingRect(outlineContour);

  // 体のパーツを切り取っていく（足、腕、頭、胴体の順）
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
  // もっともdefectDepthの合計値が大きいsegmentを胴体とする
  segments.sort((a, b) => b.defectDepthSum - a.defectDepthSum);
  let bodySegment = segments[0];
  // 胴体の位置を手足の位置の判定に使うため、外接矩形を取得する
  let bodyRect = cv.boundingRect(bodySegment.contour);

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
  const leftLegTip = findFarthest(leftLeg.array, leftLeg.rootPoints.center);
  separateByRatio(outlineArray, leftLeg.array, leftLeg.rootPoints, leftLegTip, 4/10, leftLowerLeg, leftUpperLeg);

  let leftFoot = {};
  separateByRatio(outlineArray, leftLowerLeg.array, leftLowerLeg.rootPoints, leftLegTip, 4/6, leftFoot, leftLowerLeg);

  let rightLeg = {};
  separateByLine(outlineArray, body.array, 0, 1, -legDefect.far.y, rightLeg, body, legDefect.end);

  let rightUpperLeg = {};
  let rightLowerLeg = {};
  const rightLegTip = findFarthest(rightLeg.array, rightLeg.rootPoints.center);
  separateByRatio(outlineArray, rightLeg.array, rightLeg.rootPoints, rightLegTip, 4/10, rightLowerLeg, rightUpperLeg);

  let rightFoot = {};
  separateByRatio(outlineArray, rightLowerLeg.array, rightLowerLeg.rootPoints, rightLegTip, 4/6, rightFoot, rightLowerLeg);

  // 足がない場合

  // 腕を判定する
  // 腕の輪郭線を切り取る
  let leftArm = {};
  separateLeftArm(body.array, defects, boundingRect, bodyRect, leftArm, body);

  let leftUpperArm = {};
  let leftLowerArm = {};
  const leftArmTip = findFarthest(leftArm.array, leftArm.rootPoints.center);
  separateByRatio(outlineArray, leftArm.array, leftArm.rootPoints, leftArmTip, 4/10, leftLowerArm, leftUpperArm);

  let leftHand = {};
  separateByRatio(outlineArray, leftLowerArm.array, leftLowerArm.rootPoints, leftArmTip, 4/6, leftHand, leftLowerArm);

  let rightArm = {};
  separateRightArm(body.array, defects, boundingRect, bodyRect, rightArm, body);

  let rightUpperArm = {};
  let rightLowerArm = {};
  const rightArmTip = findFarthest(rightArm.array, rightArm.rootPoints.center);
  separateByRatio(outlineArray, rightArm.array, rightArm.rootPoints, rightArmTip, 4/10, rightLowerArm, rightUpperArm);

  let rightHand = {};
  separateByRatio(outlineArray, rightLowerArm.array, rightLowerArm.rootPoints, rightArmTip, 4/6, rightHand, rightLowerArm);

  // 頭の位置を指定する
  let headSeparatePoints = [rightArm.rootPoints.end, leftArm.rootPoints.start];

  // 頭を切り取る
  let neckAndHead = {};
  separateByPoint(body.array, headSeparatePoints, neckAndHead, body);
  let neck = {};
  let head = {};
  const headTip = findFarthest(neckAndHead.array, neckAndHead.rootPoints.center);
  separateByRatio(outlineArray, neckAndHead.array, neckAndHead.rootPoints, headTip, 1/10, head, neck, true);

  console.log("chest and head")
  // 胴体を切り取る
  let chest = {};
  let hips = {};
  // hipsを根本、neckを先端とするため、hipsのrootPointsになるオブジェクトを作成する
  const hipsRootPoints = {start: leftLeg.rootPoints.start, end: rightLeg.rootPoints.end, center: legDefect.far};
  separateByRatio(outlineArray, body.array, hipsRootPoints, neckAndHead.rootPoints.center, 2/10, chest, hips);

  console.log("chest.rootPoints", chest.rootPoints)
  console.log("hips.rootPoints", hips.rootPoints)

  let boneNamedPointsArray = [
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
    {name: "foot.R", points: rightFoot}
  ]

  // オブジェクトを引数にコピーする
  boneNamedPointsArray.forEach(boneNamedPoint => {
    boneNamedPoints.push(boneNamedPoint);
  });

  hull.delete;
  defectMat.delete;
}

// 直線方程式で輪郭線を分割する
const separateByLine = (outlineArray, originalContourArray, a, b, c, tipPortion, rootPortion, tip, root = null) => {
  // tip は手足の先端など分割の際に探査の基準とする位置（cv.Point）
  // a, b, c は ax + by + c = 0 の直線方程式の係数

  // 分割する2点を格納する配列
  let separatePoints = [];

  // spliceで挿入するため、元の配列が変更されないようにパーツの輪郭線の配列コピーする
  let contourArray = originalContourArray.slice();

  // tipとrootのcontourArrayにおけるidを取得する
  // 輪郭線のidとcontourArrayのidがずれる場合があるため、contourArrayでのidに変換する
  let tipId = findArrayIndex(contourArray, tip);
  // tipが輪郭線上に存在しない場合、最も近い点を指定する
  if(tipId == -1){
    tipId = findArrayIndex(contourArray, findNearest(contourArray, tip));
  }
  let rootId;
  // rootが引数で与えられていない場合、tipから最も遠い点を指定する
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
      // スタート地点の符号と同じ符号になった場合
      // まだ交点に達していないので次の点を調べる
      onePreviousId = id;
      continue;
    }else if(sign == 0){
      // 符号が0になった場合（たまたま、輪郭の点が分割のための直線の上にある）
      // 現在の頂点を切り離す際の点とする
      separatePoint = point;
    }else if(tipSign != sign){
      // スタート地点の符号と異なる符号になった場合（輪郭線が直線をはじめてまたいだ）
      // その前後の2点の間に、新しい分割用の点（2点を結ぶ直線と、分割のための直線の交点）を作成する
      // 初めてまたいだ点の一つ前の点を取得する
      let onePreviousPoint = contourArray[onePreviousId]; // 一つ前の点

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
    // 分割する点の配列にid, 符号とともに追加する
    // 交点によって点を求めた場合（tipSign != signの場合）、idは交点の一つ後の点のid
    separatePoints.push({point: separatePoint, id: id, sign: sign});
    // 分割の線をまたいだので、符号を反転させる
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

    // 2点間の距離が小さい方を分割の点とする
    separatePoints = distance(tipBothSidePoints[0].point, tipBothSidePoints[1].point) <= distance(rootBothSidePoints[0].point, rootBothSidePoints[1].point)? tipBothSidePoints : rootBothSidePoints;
  }

  // 線分と輪郭線の交点を輪郭線の配列に追加する
  separatePoints.forEach(separatePoint => {
    if(separatePoint.sign != 0){
      // 小数点以下を四捨五入する
      separatePoint.point.x = Math.round(separatePoint.point.x);
      separatePoint.point.y = Math.round(separatePoint.point.y);
      // 前後の点と被らなかった場合、新たに追加する
      if(findArrayIndex(contourArray, separatePoint.point) == -1){
        // 全体の輪郭と、分割するパーツの輪郭にそれぞれ追加する
        // contourArrayにspliceで頂点を追加すると、2つ目でidがずれてしまうため、元の輪郭（originalContourArray）から頂点を取得し
        // さらにその点から全体の輪郭と、分割するパーツの輪郭における挿入する地点のidを取得する
        let originalPoint = originalContourArray[separatePoint.id];
        outlineArray.splice(findArrayIndex(outlineArray, originalPoint), 0, separatePoint.point);
        contourArray.splice(findArrayIndex(contourArray, originalPoint), 0, separatePoint.point);
      }
    }
  });

  // idを昇順に追っていくと separatePoints[0].id, tipId, separatePoints[1].id の順になるよう変更する
  separatePoints.sort((a, b) => a.id - b.id);
  if(tipId < separatePoints[0].id || separatePoints[1].id < tipId){
    separatePoints.sort((a, b) => b.id - a.id);
  }

  // saparatePointをpointの値のみにする（idとsignのプロパティはもう使わないため）
  separatePoints = separatePoints.map(separatePoint => separatePoint.point);

  // 指定した点で輪郭を切り取る
  separateByPoint(contourArray, separatePoints, tipPortion, rootPortion);
}

// 与えられた2つの端（separatePoints）をもとに輪郭線を切り取る
const separateByPoint = (contourArray, separatePoints, tipPortion, rootPortion) => {
  let start = separatePoints[0];
  let end = separatePoints[1];
  let startId = findArrayIndex(contourArray, start);
  let endId = findArrayIndex(contourArray, end);
  let tipPortionArray;
  let rootPortionArray;

  // 始点と終点が id:0 をまたいでいるか判定
  if(startId > endId){
    // 始点から終点までが id:0 をまたいでいる場合
    // 末端側の配列は、始点からidの最後、id:0 から終点、の二つの輪郭線を合成して作成
    tipPortionArray = contourArray.slice(startId).concat(contourArray.slice(0, endId + 1));

    // 根本側の配列は、終点から始点で切り取る
    rootPortionArray = contourArray.slice(endId, startId + 1);
  }else{
    // 始点から終点までが id:0 をまたいでいない場合
    // 末端側の配列は、始点から終点の輪郭線を切り取る
    tipPortionArray = contourArray.slice(startId, endId + 1).concat();

    // 根本側の配列は、始点からidの最後、id:0 から終点、の二つの輪郭線を合成して作成
    rootPortionArray = contourArray.slice(endId).concat(contourArray.slice(0, startId + 1));
  }

  // 切り取った線分のオブジェクト
  const points = {start: start, end: end, center: new cv.Point(Math.round((start.x + end.x) / 2), Math.round((start.y + end.y) / 2))};

  // 先端と末端のオブジェクトそれぞれに、輪郭線と切り取った線分の値を登録する
  tipPortion.array = tipPortionArray;
  tipPortion.rootPoints = points;
  rootPortion.array = rootPortionArray;
  rootPortion.separatePoints = points;
}

const separateLeftArm = (contourArray, defects, boundingRect, bodyRect, tipPortion, rootPortion) => {
  separateArm(contourArray, defects, boundingRect, bodyRect, tipPortion, rootPortion, true);
}

const separateRightArm = (contourArray, defects, boundingRect, bodyRect, tipPortion, rootPortion) => {
  separateArm(contourArray, defects, boundingRect, bodyRect, tipPortion, rootPortion, false);
}

// 腕の defect 候補の中からもっとも depth の大きい2点で輪郭線を切り取る
const separateArm = (contourArray, defects, boundingRect, bodyRect, tipPortion, rootPortion, left = true) => {

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
  separateByPoint(contourArray, separatePoints, tipPortion, rootPortion);
}

// 手足の根元と先端を指定し、割合で切り取る
const separateByRatio = (outlineArray, contourArray, rootPoints, tip, ratio, tipPortion, rootPortion, parallel = false) => {
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
  separateByLine(outlineArray, contourArray, a, b, c, tipPortion, rootPortion, tip, rootPoints.start);
  rootPortion.rootPoints = rootPoints;
  tipPortion.tipPoint = tip;
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
const findFarthest = (array, point) => {
  return array.slice().sort((a, b) => distance(b, point) - distance(a, point))[0];
}

// Point配列の中から指定した点との距離が最も近い点を探す
const findNearest = (array, point) => {
  return array.slice().sort((a, b) => distance(a, point) - distance(b, point))[0];
}

export default separateBody;