import CreateController from './createController.js';
import GameObject from './gameObject.js';
import objectMove from './objectMove.js';

const sendImage = () => {
  // リスナーをセットするステージフォーム要素を取得
  const stageForm = document.getElementById('game_form_stage_input');

  const previewContainer = document.getElementById('preview_container');

  previewContainer.addEventListener('click', () => {
    removeSelected();

    // CreateControllerのSelectedGameObjectを更新する
    CreateController.selectedGameObject = null;

    CreateController.updatePreview();
    CreateController.updateInfoInput();
  });

  // ステージフォームの処理
  stageForm.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    const file = e.target.files[0];
    splitImage(file, 'stage')
  });
};

const splitImage = (file, type) => {
  const previewContainer = document.getElementById('preview_container');

  // pngに変換するためにcanvasを準備
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const imageDialog = document.getElementById('imageDialog');
  let dialogImageList = [];
  const img = new Image();
  img.src = window.URL.createObjectURL(file);

  img.onload = () => {
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

    // openCVテスト
    // const output = document.getElementById('output');
    // output.setAttribute('width', img.naturalWidth);
    // output.setAttribute('height', img.naturalHeight);
    const kernel = cv.getStructuringElement(cv.MORPH_RECT,new cv.Size(5,5));
    // 輪郭線の色指定（赤）
    let contoursColor = new cv.Scalar(255, 0, 0);

    let src = cv.imread(img);
    // cv.imshow('output', src);

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

    let images = new Array();
    let outerMask = cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);
    let imgStageOuter = cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC4);
    // let dst = cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC3);

    let color = new cv.Scalar(255, 255, 255);

    for(let i = 0; i < contApprox.size(); ++i) {
      // 最外部（第4要素（親のID）が-1）の階層を指定
      if(hierarchyMargin.intPtr(0, i)[3] == -1) {
        // 最外部より一つ内側の階層（第3要素（子のID））を指定し、白で塗りつぶし
        let firstChildIndex = hierarchyMargin.intPtr(0, i)[2];
        cv.drawContours(outerMask, contApprox, firstChildIndex, color, cv.FILLED);
        // 輪郭の内側を透明化し、配列に加える
        let m = clipInside(src, outerMask)
        images.push(m);

        // オブジェクトを切り出す処理
        // 最外部より二つ内側の階層（第4引数（親要素）が firstChildIndex）の階層を指定
        for(let j = 0; j < contApprox.size(); ++j) {
          if(hierarchyMargin.intPtr(0, j)[3] == firstChildIndex) {
            // 最外部より二つ内側の階層（第3要素（子のID））を指定し、白で塗りつぶし
            let mask = cv.Mat.ones(src.rows, src.cols,cv.CV_8UC3);
            cv.drawContours(mask, contApprox, j, color, cv.FILLED);
            // 輪郭の外側を透明化し、切り抜き、配列に加える
            // images.push(clipOutside(src, mask));
            let a = clipOutside(src, mask)
            images.push(a);
          }
        }
      }
    }


    images.forEach(function(item, i, array) {
      console.log(item, i);
    })

    // 受け取ったデータをJSON形式にパースする
    // const json = JSON.parse(XHR.response);
    // const images = json['images'];
    
    // 元画像をpreview画面サイズに合わせるための比 （preview画面サイズ / 元画像サイズ）
    // 一回の画像読み取りで複数のimg要素を得た場合も全てこの比でサイズを調整する
    const xRatio = previewContainer.clientWidth / src.rows;
    const yRatio = previewContainer.clientHeight / src.cols;
    
    // 各データに対応するimg要素とGameObjectを生成する
    images.forEach( (image) => {
      // img要素を生成し、分割した画像を設定
      let img = document.createElement('img');
      cv.imshow(canvas, image['image']);
      let imgBase64 = canvas.toDataURL();
      img.src = imgBase64;
      
      // img.src = `data:image/png;base64,${image['image']}`;
      let previewImg = img.cloneNode();
      img.classList.add('split-img');

      // GameObjectを生成し、画像、サイズ、位置データを設定、CreateControllerのGameObjectsに格納
      let gameObject = new GameObject();
      gameObject.image = imgBase64;
      let vertices = image['vertices'];
      gameObject.setPosition(vertices['x'], vertices['y'], vertices['width'], vertices['height'], xRatio, yRatio);
      CreateController.addGameObject(gameObject);

      // 生成したimg要素のサイズ、位置、idを設定
      previewImg.style.position = "absolute";
      previewImg.classList.add('preview-image');
      previewImg.classList.add('drag-and-drop');
      previewImg.dataset.gameObjectId = CreateController.gameObjects.length - 1;

      // preview内のgameObjectにリスナーを設定
      previewImg.addEventListener('mousedown', (e) => {
        e.stopPropagation;
        selectPreviewImage(e.currentTarget);
      });

      selectPreviewImage(previewImg)

      // preview内のGameObjectにD&Dを設定
      objectMove(previewImg);

      
      // preview画面内にimg要素を配置
      previewContainer.appendChild(previewImg);

      // preview画面を更新する
      CreateController.updatePreview();
    });
  };
};

// preview内のGameObjectをクリックした際の処理
const selectPreviewImage = (element) => {
  // 選択したimg要素の輪郭を表示するために、指定した要素にのみ"selected"クラスをつける
  addSelected(element);

  // CreateControllerのSelectedGameObjectを更新する
  CreateController.updateSelectedGameObject(element);

  // preview画面を更新する
  CreateController.updatePreview();
  CreateController.updateInfoInput();
}

// 選択したimg要素の輪郭を表示するための'selected'クラス操作
const addSelected = (element) => {
  // 全ての要素の"selected"クラスを外す
  removeSelected();

  // 選択された要素に"selected"クラスを付ける
  element.classList.add('selected');
}

const removeSelected = () => {
  // 全ての要素の"selected"クラスを外す
  let previewImages = Array.from(document.querySelectorAll('.preview-image'));
  previewImages.forEach( (image) => {
    image.classList.remove('selected');
  });
}

function clipOutside(src, mask, inside = true){
  let dst = cv.Mat.zeros(src.rows, src.cols,cv.CV_8UC4);
  // マスク範囲に従って画像を透明にする
  for (var i = 0; i < src.rows; i++) {
      for (var j = 0; j < src.cols; j++) {
          // insideがfalseの場合はクリッピングする部分を反転させる
          let clippingArea = mask.ucharPtr(i, j)[0] == 255
          if (!inside) clippingArea =! clippingArea;

          // クリッピングする部分は元画像の情報をそのままコピーする
          if (clippingArea) {
            dst.ucharPtr(i, j)[0] = src.ucharPtr(i, j)[0];
            dst.ucharPtr(i, j)[1] = src.ucharPtr(i, j)[1];
            dst.ucharPtr(i, j)[2] = src.ucharPtr(i, j)[2];
            dst.ucharPtr(i, j)[3] = src.ucharPtr(i, j)[3];
          }
          else {
          // クリッピングする部分以外は透明にする
            dst.ucharPtr(i, j)[3] = 0;
          }
      }
  }
  // 不要な部分をトリミングする
  let rect;
  if (inside)
  {
    cv.cvtColor(mask, mask, cv.COLOR_RGBA2GRAY);
    rect = cv.boundingRect(mask);
    dst = dst.roi(rect);
  }
  else {
    rect = new cv.Rect(0, 0, src.cols, src.rows);
  }
  return {'image': dst, 'vertices': {'x': rect.x, 'y': rect.y, 'width': rect.width, 'height': rect.height}};
}

const clipInside = (src, mask) => {
  return clipOutside(src, mask, false);
}

const sendAPI = (base64string) => {
  let body = {
    requests: [
      {image: {content: base64string}, features: [{type: 'DOCUMENT_TEXT_DETECTION'}], "imageContext": {"languageHints": ["jp-t-i0-handwrit"]}}
    ]
  };
  const api_key = `AIzaSyBjOlfBh0BJUTVG9dDoySZABiEjT6GJb74`;
  const url = `https://vision.googleapis.com/v1/images:annotate`;
  const XHR = new XMLHttpRequest();
  XHR.open('POST', `${url}?key=${api_key}`, true);
  XHR.setRequestHeader('Content-Type', 'application/json');
  const p = new Promise((resolve, reject) => {
    XHR.onreadystatechange = () => {
      if (XHR.readyState != XMLHttpRequest.DONE) return;
      if (XHR.status >= 400) return reject({message: `Failed with ${XHR.status}:${XHR.statusText}`});
      resolve(JSON.parse(XHR.responseText));
    };
  })
  XHR.send(JSON.stringify(body));
  return p;
}

window.addEventListener('load', sendImage);