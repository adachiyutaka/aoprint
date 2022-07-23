const splitImageCV = (img, splitInside = false) => {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  
  for (let i = 1; i < 100; i++) {
    const output = document.createElement('canvas');
    output.id = "output" + i;
    output.setAttribute('width', img.naturalWidth);
    output.setAttribute('height', img.naturalHeight);
    document.getElementById('textContainer').appendChild(output);
    // document.getElementById('div1').appendChild(output);
  };

  // 画像ファイルと同じ大きさのcanvasに画像を貼り、png画像のbase64データに加工
  let dx = 0;
  let dy = 0;
  let dw = img.naturalWidth;
  let dh = img.naturalHeight;
  canvas.setAttribute('width', dw);
  canvas.setAttribute('height', dh);
  context.drawImage(img, dx, dy, dw, dh);
  let imgURL = canvas.toDataURL('image/png');
  const png = imgURL.match(/,(.*)$/)[0].slice(1);
  let images = [];

  // openCVテスト
  const output = document.getElementById('output');
  output.setAttribute('width', img.naturalWidth);
  output.setAttribute('height', img.naturalHeight);
  const kernel = cv.getStructuringElement(cv.MORPH_RECT,new cv.Size(5,5));

  // 輪郭線の色指定（赤）
  let contoursColor = new cv.Scalar(255, 0, 0);

  let src = cv.imread(img);
  // cv.imshow(output, src);
  // let src = cv.imread('imageCanvasInput');
  // let logo = cv.imread('logoCanvasInput');
  // let dst = new cv.Mat();
  // let roi = new cv.Mat();
  // let mask = new cv.Mat();
  // let maskInv = new cv.Mat();
  // let imgBg = new cv.Mat();
  // let imgFg = new cv.Mat();
  // let sum = new cv.Mat();
  // let rect = new cv.Rect(0, 0, logo.cols, logo.rows);
  
  // // I want to put logo on top-left corner, So I create a ROI
  // roi = src.roi(rect);
  
  // // Create a mask of logo and create its inverse mask also
  // cv.cvtColor(logo, mask, cv.COLOR_RGBA2GRAY, 0);
  // cv.threshold(mask, mask, 100, 255, cv.THRESH_BINARY);
  // cv.bitwise_not(mask, maskInv);
  
  // // Black-out the area of logo in ROI
  // cv.bitwise_and(roi, roi, imgBg, maskInv);
  
  // // Take only region of logo from logo image
  // cv.bitwise_and(logo, logo, imgFg, mask);
  
  // let mask = new cv.Mat(src.rows, src.cols, cv.CV_8U, new cv.Scalar(255));
  // cv.imshow(output1, src);
  // // cv.drawContours(mask, contApprox, i, new cv.Scalar(255), -1, cv.LINE_8);
  // cv.imshow(output2, mask);
  // cv.bitwise_and(src, src, src, mask);

  // let dst = new cv.Mat();
  // cv.bitwise_and(src, src, dst, mask);

  // グレースケールに変換
  const imgGray = new cv.Mat();
  cv.cvtColor(src, imgGray, cv.COLOR_RGBA2GRAY);
  // cv.imshow('output', imgGray);

  // 白い部分を膨張させる
  const imgDilated = new cv.Mat();
  cv.dilate(imgGray, imgDilated, kernel, new cv.Point(-1, 1), 1);
  // cv.imshow('output', imgDilated);

  // 差を取って輪郭線を強調
  const imgDiff = new cv.Mat();
  cv.absdiff(imgDilated, imgGray, imgDiff);
  // cv.imshow('output', imgDiff);

  // 2値化
  const imgBin = new cv.Mat();
  cv.threshold(imgDiff, imgBin, 10, 255, cv.THRESH_BINARY);
  // cv.imshow('output', imgBin);

  // クロージング処理で弱い輪郭線を補強
  const imgClosed = new cv.Mat();
  let MClose = cv.Mat.ones(5, 5, cv.CV_8U);
  cv.morphologyEx(imgBin, imgClosed, cv.MORPH_CLOSE, MClose);
  // cv.imshow('output', imgClosed);

  // オープニング処理で小さいゴミを消去
  const imgOpened = new cv.Mat();
  let anchor = new cv.Point(-1, -1);
  let MOpen = cv.Mat.ones(3, 3, cv.CV_8U);
  cv.morphologyEx(imgClosed, imgOpened, cv.MORPH_OPEN, MOpen, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  // cv.imshow('output', imgOpened);

  // 中央値フィルタでゴミ取り
  const imgFiltered = new cv.Mat();
  cv.medianBlur(imgOpened, imgFiltered, 5);
  // cv.imshow('output', imgFiltered);

  // 輪郭線を取得
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(imgFiltered, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  console.log("src.cols, src.rows:", src.cols, src.rows);
  // const imgContours = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // cv.drawContours(imgContours, contours, -1, contoursColor, 1, cv.LINE_8);
  // cv.imshow('output', imgContours);

  // 大きな輪郭のみ取得し小さいゴミの輪郭を削除
  let contLarge = new cv.MatVector();
  for (let i = 0; i < contours.size(); ++i){
    const min = 5000;
    let contour = contours.get(i); 
    if (cv.contourArea(contour) >= min){
      contLarge.push_back(contour);
    }
  }
  // const imgContLarge = new cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);
  // cv.drawContours(imgContLarge, contLarge, -1 , contoursColor, 1, cv.LINE_8);
  // cv.imshow('output', imgContLarge);

  // 輪郭を太く描画し切り取り時の余白を作る
  const imgContBold = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.drawContours(imgContBold, contLarge, -1, new cv.Scalar(255, 255, 255), 20, cv.LINE_8);
  // cv.imshow('output', imgContBold);

  // 輪郭線取得のための2値化
  const imgContBoldGray = new cv.Mat();
  cv.cvtColor(imgContBold, imgContBoldGray, cv.COLOR_RGBA2GRAY);
  const imgContBoldBin = new cv.Mat();
  cv.threshold(imgContBoldGray, imgContBoldBin, 10, 255, cv.THRESH_BINARY);
  // cv.imshow('output', imgContBoldBin);

  // 余白のある輪郭線を再取得
  let contMargin = new cv.MatVector();
  let hierarchyMargin = new cv.Mat();
  cv.findContours(imgContBoldBin, contMargin, hierarchyMargin, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
  // const imgContMargin = new cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);
  // cv.drawContours(imgContMargin, contMargin, -1, contoursColor, 1, cv.LINE_8);
  // cv.imshow('output', imgContMargin);

  // 大きな輪郭のみ取得し小さいゴミの輪郭を削除
  // let contMarginLarge = new cv.MatVector();
  // for (let i = 0; i < contMargin.size(); ++i){
  //   const min = 5000;
  //   let contour = contMargin.get(i); 
  //   if (cv.contourArea(contour) >= min){
  //     contMarginLarge.push_back(contour);
  //   }
  // }

  // 頂点数を減らした輪郭を取得
  let contApprox = new cv.MatVector();
  for(let i = 0; i < contMargin.size(); ++i) {
    let contour = contMargin.get(i);
    let approx = new cv.Mat();
    const epsilon = 0.001 * cv.arcLength(contour, true)
    cv.approxPolyDP(contour, approx, epsilon, true)
    contApprox.push_back(approx);
  }
  // const imgContApprox = new cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);
  // cv.drawContours(imgContApprox, contApprox, -1, contoursColor, 1, cv.LINE_8);    
  // cv.imshow('output', imgContApprox);

  // ステージの内側をくり抜く処理

  // オブジェクトのヒエラルキーを表示
  for(let i = 0; i < contApprox.size(); ++i) {
    console.log("0, ", i, ": ", hierarchyMargin.intPtr(0, i));      
  }
  // オブジェクトのヒエラルキーを表示
  let maskColor255 = new cv.Scalar(255, 255, 255, 255);
  let maskColor0 = new cv.Scalar(0, 0, 0, 0);

  let outerMask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);

  let imgStageOuter = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
  // let dst = cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);



  // 輪郭線に沿って画像を切り取る
  // hierarchyの内容: [Next, Previous, First_Child, Parent]
  if(splitInside){
    console.log("splitInside");
    // 複数の画像を一気に切り抜く場合
    for(let i = 0; i < contApprox.size(); ++i) {
      // 最外部の画像の内側を切り抜く
      // 最外部（第4要素（親のID）が-1）の階層を指定
      if(hierarchyMargin.intPtr(0, i)[3] == -1) {
        // 最外部より一つ内側の階層（第3要素（子のID））を指定し、白で塗りつぶし
        let firstChildIndex = hierarchyMargin.intPtr(0, i)[2];
        let outerMask = new cv.Mat(src.rows, src.cols, cv.CV_8UC4, maskColor0);
        cv.drawContours(outerMask, contApprox, firstChildIndex, maskColor255, cv.FILLED);
        // 輪郭の内側を透明化し、配列に加える
        images.push(removeInside(src, outerMask));
        outerMask.delete;
  
        // 最外部よりも一つ下の画層の外側を切り抜く
        // 最外部より二つ内側の階層（第4引数（親要素）が firstChildIndex）の階層を指定
        for(let j = 0; j < contApprox.size(); ++j) {
          if(hierarchyMargin.intPtr(0, j)[3] == firstChildIndex) {
            // 最外部より二つ内側の階層（第3要素（子のID））を指定し、白で塗りつぶし
            let innerMask = new cv.Mat(src.rows, src.cols, cv.CV_8UC4, maskColor0);
            cv.drawContours(innerMask, contApprox, j, maskColor255, cv.FILLED);
            // 輪郭の外側を透明化し、切り抜き、配列に加える
            images.push(removeOutside(src, innerMask));
            innerMask.delete;
          }
        }
      }
    }
  }else{
    console.log("splitOutside");
    // 最外部の輪郭線のみ切り抜く場合
    for(let i = 0; i < contApprox.size(); ++i) {
      // 最外部の画像の内側を切り抜く
      // 最外部（第4要素（親のID）が-1）の階層を指定
      if(hierarchyMargin.intPtr(0, i)[3] == -1) {
        // 最外部（第4要素（親のID）が-1）の階層を指定し、白(255)で塗りつぶす
        // マスクも元の画像と同じく透明色を含めた4チャンネル（BGRA）で作成すると、ビット演算時に0の箇所が透明になる
        let mask = new cv.Mat(src.rows, src.cols, cv.CV_8UC4, maskColor0);
        cv.drawContours(mask, contApprox, i, maskColor255, -1, cv.LINE_8);

        // マスク以外を透明にし、配列に加える
        images.push(removeOutside(src, mask));
        mask.delete;
      }
    }
  }

  return images;
};

// マスクの白い部分を残して切り取る
const removeOutside = (src, mask, inside = false) => {

  // マスクされた内側を切り抜く場合は、マスクを反転させる
  if(inside) {
    cv.bitwise_not(mask, mask);
  }

  // 元の画像から輪郭を切り抜く
  // ビット演算ANDでマスクされた部分(=255)のみ残す
  cv.bitwise_and(src, mask, src);

  // 不要な部分をトリミングする
  cv.cvtColor(mask, mask, cv.COLOR_RGBA2GRAY);
  let rect = cv.boundingRect(mask);
  src = src.roi(rect);

  return {'image': src, 'vertices': {'x': rect.x, 'y': rect.y, 'width': rect.width, 'height': rect.height}};
}

const removeInside = (src, mask) => {
  return removeOutside(src, mask, true);
}

export default splitImageCV;