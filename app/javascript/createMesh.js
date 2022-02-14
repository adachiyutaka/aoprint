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
  for (let i = 1; i < 20; i++) {
    const output = document.createElement('canvas');
    output.id = "output" + i;
    output.setAttribute('width', img.naturalWidth);
    output.setAttribute('height', img.naturalHeight);
    document.getElementById('div1').appendChild(output);
  };

  let contoursColor = new cv.Scalar(255, 0, 0);

  let src = cv.imread(img);
  // cv.imshow(output, src);
  
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

  // オープニング処理で小さいゴミを消去
  const imgOpened = new cv.Mat();
  let anchor = new cv.Point(-1, -1);
  let MOpen = cv.Mat.ones(3, 3, cv.CV_8U);
  cv.morphologyEx(imgClosed, imgOpened, cv.MORPH_OPEN, MOpen, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  cv.imshow('output6', imgOpened);
  imgClosed.delete;
  anchor.delete;
  MOpen.delete;

  // 中央値フィルタでゴミ取り
  const imgFiltered = new cv.Mat();
  cv.medianBlur(imgOpened, imgFiltered, 5);
  cv.imshow('output7', imgFiltered);
  imgOpened.delete;
  
  // 輪郭線を取得
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(imgFiltered, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  console.log("src.cols, src.rows:", src.cols, src.rows);
  const imgContours = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.drawContours(imgContours, contours, -1, contoursColor, 1, cv.LINE_8);
  cv.imshow('output8', imgContours);
  imgFiltered.delete;

  // 最外部（第4要素（親のID）が-1）の輪郭線を取得
  let outlineContours = new cv.MatVector();
  for (let i = 0; i < contours.size();  ++i){
    if(hierarchy.intPtr(0, i)[3] == -1) {
      outlineContours.push_back(contours.get(i));
    }
  }

  // let convexContours = checkConvex(src, outlineContours);

  let dstContours = {};
  searchTop(src, outlineContours.get(0), dstContours);


  // const imgContConvex = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // cv.drawContours(imgContConvex, convexContours, -1, contoursColor, 1, cv.LINE_8);
  // cv.imshow('output9', imgContConvex);

  // let shrinkContours = approxContour(shrinkContour(src, outlineContours, 20));

  // const imgContShrink = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // cv.drawContours(imgContShrink, shrinkContours, -1, contoursColor, 1, cv.LINE_8);
  // cv.imshow('output9', imgContShrink);



  // // 大きな輪郭のみ取得し小さいゴミの輪郭を削除
  // let contLarge = new cv.MatVector();
  // for (let i = 0; i < contours.size(); ++i){
  //   const min = 500;
  //   let contour = contours.get(i); 
  //   if (cv.contourArea(contour) >= min){
  //     contLarge.push_back(contour);
  //   }
  // }
  // // contours.delete;
  // hierarchy.delete;

  // const imgContLarge = new cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);
  // cv.drawContours(imgContLarge, contLarge, -1 , contoursColor, 1, cv.LINE_8);
  // cv.imshow('output', imgContLarge);

  // // 輪郭を太く描画し切り取り時の余白を作る
  // const imgContBold = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // cv.drawContours(imgContBold, contLarge, -1, new cv.Scalar(255, 255, 255), 20, cv.LINE_8);
  // cv.imshow('output9', imgContBold);


  // // 輪郭線取得のための2値化
  // const imgContBoldGray = new cv.Mat();
  // cv.cvtColor(imgContBold, imgContBoldGray, cv.COLOR_RGBA2GRAY);
  // imgContBold.delete;

  // const imgContBoldBin = new cv.Mat();
  // cv.threshold(imgContBoldGray, imgContBoldBin, 10, 255, cv.THRESH_BINARY);
  // cv.imshow('output10', imgContBoldBin);
  // imgContBoldGray.delete;

  // // 余白のある輪郭線を再取得
  // let contMargin = new cv.MatVector();
  // let hierarchyMargin = new cv.Mat();
  // cv.findContours(imgContBoldBin, contMargin, hierarchyMargin, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
  // const imgContMargin = new cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);
  // cv.drawContours(imgContMargin, contMargin, -1, contoursColor, 1, cv.LINE_8);
  // cv.imshow('output11', imgContMargin);

  // 大きな輪郭のみ取得し小さいゴミの輪郭を削除
  // let contMarginLarge = new cv.MatVector();
  // for (let i = 0; i < contMargin.size(); ++i){
  //   const min = 5000;
  //   let contour = contMargin.get(i); 
  //   if (cv.contourArea(contour) >= min){
  //     contMarginLarge.push_back(contour);
  //   }
  // }
  // console.log("contMargin.shape", contMargin.shape);
  // imgContBoldBin.delete;

  // // 頂点数を減らした輪郭を取得
  // let contApprox = new cv.MatVector();
  // for(let i = 0; i < contMargin.size(); ++i) {
  //   let contour = contMargin.get(i);
  //   let approx = new cv.Mat();
  //   const epsilon = 0.01 * cv.arcLength(contour, true);
  //   cv.approxPolyDP(contour, approx, epsilon, true);
  //   contApprox.push_back(approx);
  // }
  // const imgContApprox = new cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);
  // cv.drawContours(imgContApprox, contApprox, -1, contoursColor, 1, cv.LINE_8);    
  // cv.imshow('output12', imgContApprox);

  // contLarge.delete;
  // contMargin.delete;
  // hierarchyMargin.delete;

  // // 凸性欠陥の検出
  // let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // let hull = new cv.Mat();
  // let defect = new cv.Mat();
  // let cnt = contApprox.get(0);
  // let lineColor = new cv.Scalar(255, 0, 0);
  // let circleColor = new cv.Scalar(255, 255, 255);
  // cv.convexHull(cnt, hull, false, false);
  // cv.convexityDefects(cnt, hull, defect);
  // console.log("defect.data32S")
  // for (let i = 0; i < defect.data32S.length; ++i) {
  //   console.log(i, ": ", defect.data32S[i]);
  // }

  // console.log("cnt.data32S")
  // for (let i = 0; i < cnt.data32S.length; ++i) {
  //   console.log(i, ": ", cnt.data32S[i]);
  // }

  // for (let i = 0; i < defect.rows; ++i) {
  //     console.log("defect:", defect.data32S[i]);
  //     // 凸状欠陥の結果は（start_index, end_index, farthest_pt_index, fixpt_depth, ...）の形で格納される
  //     // 輪郭線は（index 0のx, index 0のy, index 1のx, ... ）の形で格納される
  //     let start = new cv.Point(cnt.data32S[defect.data32S[i * 4] * 2],
  //                             cnt.data32S[defect.data32S[i * 4] * 2 + 1]);
  //     let end = new cv.Point(cnt.data32S[defect.data32S[i * 4 + 1] * 2],
  //                           cnt.data32S[defect.data32S[i * 4 + 1] * 2 + 1]);
  //     let far = new cv.Point(cnt.data32S[defect.data32S[i * 4 + 2] * 2],
  //                           cnt.data32S[defect.data32S[i * 4 + 2] * 2 + 1]);
  //     cv.line(dst, start, end, lineColor, 2, cv.LINE_AA, 0);
  //     cv.circle(dst, far, 3, circleColor, -1);
  // }
  // cv.imshow('output13', dst);
  // hull.delete(); defect.delete();


  src.delete;
}

const shrinkContour = (src, contour, shrinkage) => {

  let shrinkContours = new cv.MatVector();

  // 輪郭線を一つずつ扱う
  let contours = new cv.MatVector();
  contours.push_back(contour);

  // 輪郭を太く描画し切り取り時の余白を作る
  const imgContBold = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.drawContours(imgContBold, contours, -1, new cv.Scalar(255, 255, 255), shrinkage, cv.LINE_8);
  
  // 輪郭線取得のための2値化
  const imgContBoldGray = new cv.Mat();
  cv.cvtColor(imgContBold, imgContBoldGray, cv.COLOR_RGBA2GRAY);
  imgContBold.delete;

  const imgContBoldBin = new cv.Mat();
  cv.threshold(imgContBoldGray, imgContBoldBin, 10, 255, cv.THRESH_BINARY);
  imgContBoldGray.delete;

  // 余白のある輪郭線を再取得
  let marginContours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(imgContBoldBin, marginContours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

  // 輪郭線が見つかった場合
  if (marginContours.size() > 0) {
    // 元の輪郭線よりも小さい輪郭線のみ取得する
    for(let i = 0; i < marginContours.size(); ++i) {
      if(cv.contourArea(marginContours.get(i)) <= cv.contourArea(contour)){
        // 元の輪郭線よりも小さいか判定し、shrinkContoursに追加する
        shrinkContours.push_back(marginContours.get(i));
      }
    }
  }
  
  contour.delete;
  contours.delete;
  marginContours.delete;
  hierarchy.delete;
  
  // 縮んだ輪郭を返却
  return shrinkContours;
}

const approxContour = (contours, epsilon_ratio = 0.01) => {
  let approxContours = new cv.MatVector();

  // 輪郭線を単純な形にする
  // epsilon_ratioが大きいほど、単純な形状になる
  for(let i = 0; i < contours.size(); ++i) {
    let contour = contours.get(i);
    let approx = new cv.Mat();
    const epsilon = epsilon_ratio * cv.arcLength(contour, true);
    cv.approxPolyDP(contour, approx, epsilon, true);
    approxContours.push_back(approx);

    approx.delete;
  }

  contours.delete;

  return approxContours;
}

const checkConvex = (src, contours) => {
  convexContours = new cv.MatVector();
  let high = src.rows >= src.cols? src.rows : src.cols;
  let low = 0;
  let mid = 0;
  let i = 0;

  while(high - low >= 1) {
    i++;
    let mid = (low + high) / 2;
    console.log(i, "high:", high, ", low:", low, ", mid:", mid);

    // 輪郭線を縮める
    let shrinkContours = approxContour(shrinkContour(src, contours, mid))

    // 縮めた輪郭線が消えてしまった場合、縮める量を減らす
    if (shrinkContours.size() == 0){
      console.log(i, "No contour, mid:", mid)
      high = mid;
      continue;
    }

    // 縮めた輪郭線それぞれについて凸包か判定
    for(let i = 0; i < contours.size(); ++i) {

      if(cv.isContourConvex(shrinkContours.get(i))) {
        console.log(i, "isConvex, mid:", mid)
        // ..
        convexContours.push_back(shrinkContours.get(i));
        high = mid;
      }
      else {
        console.log(i, "isNotConvex, mid:", mid)
        low = mid;
      }
    }
  }
  return approxContour(shrinkContour(src, contours, mid));
}

// const searchConvex = (contours, dstContours, high, low, oldContour, shrink = true) => {
//   threshold = 1;  // 2分探査の閾値、値が小さいほど厳密な探査になる
//   i++;
//   let mid = (low + high) / 2;
//   console.log(i, "high:", high, ", low:", low, ", mid:", mid);

//   // 輪郭線を拡縮する（関数名はshrinkだが、一段階前と比べてshrinkageが小さい=広げている場合もある）
//   let scalingContours = approxContour(shrinkContour(src, contours, mid));

//   // 輪郭線が消えてしまった場合、縮める量を減らす
//   if (scalingContours.size() == 0){
//     console.log(i, "No contour, mid:", mid)
//     high = mid;
//     continue;
//   }

//   // 拡縮した輪郭線それぞれについて判定
//   for(let i = 0; i < scalingContours.size(); ++i) {
//     let scalingContour = scalingContours.get(i);

//     // 一段階前より縮めている場合
//     if(shrink){
  
//       // 一つ前の輪郭線が縮めた輪郭線を含んでいるか判定（探索している輪郭線が消えたかどうか）
//       let point = new cv.Point(scalingContour.data32S[0], scalingContour.data32S[1]);
//       // 一つ前の輪郭線が縮めた輪郭線を含んでいる（）
//       if(shrink == true && cv.pointPolygonTest(oldContour, point, false)){
        
//       }
//       // for (let scalingContour_i = 0; scalingContour_i < (oldContour.data32S.length / 2) - 1; ++scalingContour_i) {
//       //   // oldContourの各点
//       //   let point = new cv.Point(oldContour.data32S[scalingContour_i], oldContour.data32S[scalingContour_i + 1]);
//       //   // 一つ前の輪郭線が縮めた輪郭線を含んでいる（）
//       //   if(shrink == true && cv.pointPolygonTest(oldContour, point, false)){
//       //     high = mid;

//       //   }
//       // }
//       point.delete;
//     }

//     // 一段階前より拡げている場合
//     if(!shrink){
//       let point = new cv.Point(oldContour.data32S[0], oldContour.data32S[1]);
  
//       // 拡縮した輪郭線が一つ前の輪郭線を含んでいるか判定
//       if(shrink == true && cv.pointPolygonTest(scalingContour, point, false)){
//         high = mid;
//       }
//       point.delete;
//     }

//     // 凸包かどうか判定
//     if(cv.isContourConvex(contour)) {
//       // 凸包の場合
//       console.log(i, "isConvex, mid:", mid)

//       // 十分に2分探査ができている場合
//       if(high - low >= threshold){
//         // 2分探査を終了し、輪郭線と縮めた値を登録する
//         dstContours.push({"contour": contour, "shrinkage": mid});
//         break;
//       }

//       // 十分に2分探査ができていない場合、縮む値を小さくして（このcontourよりも広げて）探査を続ける
//       searchConvex()
//       high = mid;
//     }
//     else {
//       // 凸包でない場合
//       console.log(i, "isNotConvex, mid:", mid)
//       low = mid;
//     }
//   }
// }


const searchTop = (src, contour, dstContours, high = (src.rows >= src.cols)? src.rows : src.cols, low = 0, textIndex = 0, targetContour = contour) => {
  threshold = 10;  // 2分探査の閾値、値が小さいほど厳密な探査になる
  textIndex++;
  let mid = (low + high) / 2;
  console.log(textIndex, "high:", high, ", low:", low, ", mid:", mid);

  // 輪郭線を拡縮する（関数名はshrinkだが、一段階前と比べてshrinkageが小さい=広げている場合もある）
  let scalingContours = approxContour(shrinkContour(src, contour, mid));

  // 輪郭線が全て消えてしまった場合、縮める量を減らす
  if (scalingContours.size() == 0){
    console.log(textIndex, "No contour")
    // 縮める量を減らし(high = mid)、targetContourはそのままで再起する
    searchTop(src, contour, dstContours, mid, low, textIndex, targetContour);
    return;
  }

  // targetContour内に含まれるscalingContourのリスト
  let nextContours = new cv.MatVector();

  // 拡縮した輪郭線それぞれについて判定
  for(let i = 0; i < scalingContours.size(); ++i) {
    // 一つ前の輪郭線が次の輪郭線（scalingContour）を含んでいるか判定
    // (含んでいる場合は全ての点を含んでいるため1点だけ判定する）
    let scalingContour = scalingContours.get(i);
    let point = new cv.Point(scalingContour.data32S[0], scalingContour.data32S[1]);
    if(cv.pointPolygonTest(oldContour, point, false)){
      // 一つ前の輪郭線が縮めた輪郭線を含んでいる場合、nextContoursに追加する
      nextContours.push_back(scalingContour);
      // 縮める量を増やす(low = mid)
    }
    point.delete;
  }

  // 一つ前の輪郭線の中に次の輪郭線（scalingContour）が一つも見つからない場合
  if(nextContours.size() == 0){
    console.log(textIndex, "found, but no target contour")
    // 縮める量を減らし(high = mid)、targetContourはそのままで再起する
    searchTop(src, contour, dstContours, mid, low, textIndex, targetContour);
    return;
  }

  // 一つ前の輪郭線の中に次の輪郭線（scalingContour）が見つかった場合
  for(let i = 0; i < nextContours.size(); ++i) {
    let nextContour = nextContours.get(i);
    console.log(textIndex, i, "found")
    // 凸包、または、面積が十分に小さい場合
    if(cv.isContourConvex(nextContour) || cv.contourArea(nextContour) <= threshold){
      // dstContoursに追加して処理を終える
      dstContours.push({"contour": nextContour, "shrinkage": mid});
      return;
    }

    // 凸包でなく、面積が大きい場合
    // 縮める量を増やし(low = mid)、targetContourを縮めて再起する
    searchTop(src, contour, dstContours, high, mid, textIndex, nextContour);
  }
}


// const checkNum = (max, num) => {
//   let low = 0;
//   let high = max;
//   let i = 0;
//   while(high - low >= 1) {
//     i++;
//     let mid = (low + high) / 2;
//     console.log(i, "high:", high, ", low:", low, ", mid:", mid);
//     if (mid == num){
//       console.log(i, "mid = num, mid:", mid)
//       return mid;
//     }
//     else if (mid > num){
//       console.log(i, "mid > num, mid:", mid)
//       high = mid;
//     }
//     else {
//       console.log(i, "mid < num, mid:", mid)
//       low = mid;
//     }
//   }
// }

// const displayImage = (img) => {
//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext('2d');
//   let dx = 0;
//   let dy = 0;
//   let dw = img.naturalWidth;
//   let dh = img.naturalHeight;
//   canvas.setAttribute('width', dw);
//   canvas.setAttribute('height', dh);
//   context.drawImage(img, dx, dy, dw, dh);
//   document.getElementById('div1').appendChild(canvas);
// }

window.addEventListener('load', inputMesh);