import GameObject from './game.js';

// ゲーム作成画面の編集内容を一時保存するオブジェクト
window.gameObjects = [];
window.gameImages = [];

const sendImage = () => {
  // リスナーをセットするステージフォーム要素を取得
  const stageForm = document.getElementById('game_form_stage_input');
  const stageLabel = document.getElementById('stage_label');
  const stageClickOrDD = document.getElementById('click_or_dd');
  const stagePleaseDrop = document.getElementById('please_drop');
  const playerForm = document.getElementById('game_form_player_input');
  const playerLabel = document.getElementById('player_label');
  const objectForm = document.getElementById('game_form_object_input');
  const objectLabel = document.getElementById('object_label');

  // ステージフォームの処理
  stageForm.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    const file = e.target.files[0];
    splitImage(file, 'stage')
  });

  // ドロップ可能エリアに入った時
  stageLabel.addEventListener('dragenter', () => {
    stageLabel.style.backgroundColor = "#418dca"
    console.log(stageClickOrDD.classList)
    stageClickOrDD.classList.add('hidden');
    stagePleaseDrop.classList.remove('hidden');
  });

  // ドロップ可能エリアを出た時
  stageLabel.addEventListener('dragleave', () => {
    stageLabel.style.backgroundColor = "#1074c5"
    stageClickOrDD.classList.remove('hidden');
    stagePleaseDrop.classList.add('hidden');
    
  });

  stageLabel.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  // ファイルをドロップした時
  stageLabel.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      stagePleaseDrop.innerText = file.name;
      stageLabel.classList.add('hidden');
      splitImage(file, 'stage')
  });

  // プレイヤーフォームの処理
  playerForm.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    const file = e.target.files[0];
    splitImage(file, 'character')
  });

  // オブジェクトフォームの処理
  objectForm.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    const file = e.target.files[0];
    objectLabel.classList.add('hidden');
    splitImage(file, 'object')
  });
};

const splitImage = (file, type) => {
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
    const kernel = cv.getStructuringElement(cv.MORPH_RECT,new cv.Size(5,5));

    let src = cv.imread(img);
    cv.imshow('output', src);

    // グレースケールに変換
    const imgGray = new cv.Mat();
    cv.cvtColor(src, imgGray, cv.COLOR_RGBA2GRAY);
    cv.imshow('output', imgGray);

    // 白い部分を膨張させる
    const imgDilated = new cv.Mat();
    cv.dilate(imgGray, imgDilated, kernel, new cv.Point(-1, 1), 1);
    cv.imshow('output', imgDilated);

    // 差を取って輪郭線を強調
    const imgDiff = new cv.Mat();
    cv.absdiff(imgDilated, imgGray, imgDiff);
    cv.imshow('output', imgDiff);

    // 2値化
    const imgBin = new cv.Mat();
    cv.threshold(imgDiff, imgBin, 10, 255, cv.THRESH_BINARY);
    cv.imshow('output', imgBin);

    // クロージング処理で弱い輪郭線を補強
    const imgClosed = new cv.Mat();
    let M = cv.Mat.ones(5, 5, cv.CV_8U);
    cv.morphologyEx(imgBin, imgClosed, cv.MORPH_CLOSE, M);
    cv.imshow('output', imgClosed);

    // オープニング処理で弱い輪郭線を補強
    const imgOpened = new cv.Mat();
    let anchor = new cv.Point(-1, -1);
    cv.morphologyEx(imgClosed, imgOpened, cv.MORPH_OPEN, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow('output', imgOpened);

    // 中央値フィルタでゴミ取り
    const imgFiltered = new cv.Mat();
    cv.medianBlur(imgOpened, imgFiltered, 9);
    cv.imshow('output', imgFiltered);

    // 輪郭線を取得
    const imgContours = new cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC3);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(imgFiltered, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let contoursColor = new cv.Scalar(255, 0, 0);
    cv.drawContours(imgContours, contours, -1, contoursColor, 1, cv.LINE_8);
    cv.imshow('output', imgContours);

    // 大きな輪郭のみ取得
    const imgContLarge = new cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC3);
    for (let i = 0; i < contours.size(); ++i){
      const min = 1000000;
      let contour = contours.get(i); 
      if (cv.contourArea(contour) >= min)
      {
        console.log(cv.contourArea(contour));
        cv.drawContours(imgContLarge, contours, i, contoursColor, 1, cv.LINE_8, hierarchy, 100);
      }
    }
    // cv.drawContours(imgContours, contLarge, -1, contLarge, 1, cv.LINE_8);

    
    // openCVテスト
    
    // 画像のテキストを読み取り
    // const readText = new ReadText();
    // readText.readText(imgURL);
    // console.log("読み取り開始");
    
    // Promise.resolve(png)
    // .then(sendAPI)
    // .then(res => {
    //   console.log('SUCCESS!', res);
    //   document.querySelector('pre').innerHTML = JSON.stringify(res, null, 2);
    // })
    // .catch(err => {
    //   console.log('FAILED:(', err);
    //   document.querySelector('pre').innerHTML = JSON.stringify(err, null, 2);
    // });

    // ↓rubyと通信する場合の記述

    // const token = document.getElementsByName('csrf-token')[0].content;
    // const XHR = new XMLHttpRequest();
    // // openでリクエストを初期化する
    // XHR.open("POST", `/games/read_text`, true);
    // // レスポンスのタイプを指定する

    // XHR.responseType = "json";
    // XHR.setRequestHeader('Content-Type', 'application/json');
    // XHR.setRequestHeader("X-CSRF-Token", token);  // リクエストヘッダーを追加（セキュリティトークンの追加）

    // // sendでリクエストを送信する
    // game data = {};
    // data.url = imgURL;
    // var json = JSON.stringify(data);
    // XHR.send(json);
    // // XHR.send();

    // XHR.onload = () => {
    //   const item = XHR.response;
    //   console.log(item);
    // }

    // ↑rubyと通信する場合の記述

    // Ajaxに必要なオブジェクトを生成し画像データを送信
    const XHR = new XMLHttpRequest();
    if (type == 'stage') {
      XHR.open("POST", `http://127.0.0.1:5000/stage`, true);
    }
    else if (type == 'character') {
      XHR.open("POST", `http://127.0.0.1:5000/character`, true);
    }
    XHR.setRequestHeader('Content-Type', 'application/json');
    let data = {};
    data.image = png;
    let json = JSON.stringify(data);
    XHR.send(json);

    // レスポンスを受け取った時の処理
    XHR.onload = () => {
      const previewContainer = document.getElementById('preview_container');
      const previewWidth = previewContainer.clientWidth;
      const previewHeight = previewContainer.clientHeight;

      // info欄のエレメントを取得
      const infoX = document.getElementById('x');
      const infoY = document.getElementById('y');
      const infoWidth = document.getElementById('width');
      const infoHeight = document.getElementById('height');
      const infoScript = document.getElementById('role_select');
      // info欄のエレメントが変更された際に、GUIを更新するリスナーを設定
      infoX.addEventListener('input', (e) => {imageMover(e, window.gameObjects)});
      infoY.addEventListener('input', (e) => {imageMover(e, window.gameObjects)});
      infoWidth.addEventListener('input', (e) => {imageMover(e, window.gameObjects)});
      infoHeight.addEventListener('input', (e) => {imageMover(e, window.gameObjects)});
      infoHeight.addEventListener('input', (e) => {imageMover(e, window.gameObjects)});
      infoScript.addEventListener('change', (e) => {imageMover(e, window.gameObjects)});
      // ステージ画像から生成したオブジェクトを表示するレイアウトのid
      let index = 0;

      // 受け取ったデータをJSON形式にパースする
      const json = JSON.parse(XHR.response);
      const images = json['images'];
      
      // 元画像をpreview画面サイズに合わせるための比 （プレビューサイズ / 元画像サイズ）
      const xRatio = previewWidth / json['width'];
      const yRatio = previewHeight / json['height'];

      console.log(`xRatio: ${xRatio} / yRatio: ${yRatio}`);

      // 画像を格納するdivタグ要素を取得
      const objectList = document.getElementById(`objectList`);
      const imageList = document.getElementById(`imageList`);

      // 各データに対応するimgタグを生成する
      images.forEach( (image) => {
        // 分割した画像をimg要素に設定
        let img = document.createElement('img');
        img.src = `data:image/png;base64,${image['image']}`;
        let previewImg = img.cloneNode();
        img.classList.add('split-img');

        let gameObject = new GameObject();
        // let position = new Position();
        gameObject.image = `data:image/png;base64,${image['image']}`;
        let vertices = image['vertices'];
        gameObject.setPosition(vertices['x'], vertices['y'], vertices['width'], vertices['height'], xRatio, yRatio);
        window.gameObjects.push(gameObject);

        // 切り取った画像のサイズと位置を設定
        previewImg.style.position = "absolute";
        previewImg.classList.add('preview-image');
        previewImg.classList.add('drag-and-drop');
        previewImg.dataset.gameObjectId = index;
        let position = gameObject.position;
        previewImg.style.left = position.modifyScale('x').toString() + "px";
        previewImg.style.top = position.modifyScale('y').toString() + "px";
        previewImg.style.width = position.modifyScale('width').toString() + "px";
        previewImg.style.height = position.modifyScale('height').toString() + "px";
        previewImg.dataset.gameObjectId = index;

        // preview内のgameObjectにリスナーを設定
        previewImg.addEventListener('mousedown', selectGameObject);

        // info欄の表示切り替えとgameObjectの枠線表示
        function selectGameObject(e){
          makeRadioButton(e.currentTarget);
          let gameObject = window.gameObjects[previewImg.dataset.gameObjectId];
          let roleIndex = {object: 0, player: 1, enemy: 2, item: 3, goal: 3};
          
          document.getElementById('info_image').src = gameObject.image;
          document.getElementById('x').value = gameObject.position.x;
          document.getElementById('y').value = gameObject.position.y;
          document.getElementById('width').value = gameObject.position.width;
          document.getElementById('height').value = gameObject.position.height;
          document.getElementById('role_select').selectedIndex = roleIndex[gameObject.script];     
          console.log(gameObject);   
        }

        // 配置
        previewContainer.appendChild(previewImg);

        // 画像がステージかキャラクターかで条件分岐
        let type = image['type'];
        if (type == 'stage') {
          // ステージ画像の場合

          // 分割した画像ごとにステージカードのリストを生成し、objectListに挿入
          objectList.insertAdjacentHTML("beforeend", makeStageCard(index, json));
          const card = document.getElementById(`${index}`);

          // カード内のシンボル、位置、オブジェクトを配置するコンテナ要素を取得
          let symbolContainer = card.children[0];
          let positionContainer = card.children[1];
          let objectContainer = card.children[2];

          // 位置、オブジェクトのコンテナに画像を配置する
          positionContainer.insertBefore(img.cloneNode(), positionContainer.children[0]);
          objectContainer.insertBefore(img.cloneNode(), objectContainer.children[0]);

          // オブジェクト画像、オブジェクトの削除・追加ボタンの要素を取得
          let symbolDeleteBtn = Array.from(symbolContainer.children).find((o) => o.classList.contains('delete-btn'));
          let objectDeleteBtn = Array.from(objectContainer.children).find((o) => o.classList.contains('delete-btn'));
          let objectNewBtn = Array.from(objectContainer.children).find((o) => o.classList.contains('new-btn'));
          let objectImg = Array.from(objectContainer.children).find((o) => o.classList.contains('split-img'));

          // オブジェクト追加ボタンに押下時の処理
          objectNewBtn.addEventListener('click', (e) => {
            // dialogImageListを空にする
            dialogImageList = [];

            // 各ステージカードのオブジェクト画像と、キャラクター画像をdialogImageListに格納
            Array.from(objectList.children).forEach((card) => {
              dialogImageList.push(Array.from(card.children[2].children).find((o) => o.classList.contains('split-img')).cloneNode());
            });
            Array.from(imageList.children).forEach((img) => {
              dialogImageList.push(img.cloneNode());
            });

            // オブジェクト追加ダイアログにdialogImageListの各画像を配置
            dialogImageList.forEach((img) => {
              imageDialog.appendChild(img);

              // dialogImageList内の各画像にボタン押下時の処理
              img.addEventListener('click', (e) => {
                // オブジェクトを新規作成するオブジェクトコンテナにクリックした画像を追加
                objectContainer.insertBefore(e.target.cloneNode(), objectContainer.children[0]);
                // オブジェクト追加ダイアログを非表示に
                imageDialog.classList.add('hidden');
                // オブジェクト追加ダイアログに追加した画像を全て削除
                Array.from(imageDialog.children).forEach((o) => {
                  o.remove()
                });
              });
            });

            // オブジェクト追加ダイアログを表示
            imageDialog.classList.remove('hidden');
          });

          // オブジェクト削除ボタン押下時の処理
          objectDeleteBtn.addEventListener('click', (e) => {
            // オブジェクト画像と削除ボタンを消す
            objectImg.remove();
            objectDeleteBtn.remove();
          });

          // ステージカードのid
          index += 1

        } else if (type == 'character') {
          // キャラクター画像の場合

          // キャラクター画像のリストに各画像を配置する
          imageList.appendChild(img);
        }
      });

      // D&Dの設定
      let elements = document.getElementsByClassName("drag-and-drop");

      //要素内のクリックされた位置を取得するグローバル（のような）変数
      let x;
      let y;
  
      //マウスが要素内で押されたとき、又はタッチされたとき発火
      for(let i = 0; i < elements.length; i++) {
          elements[i].addEventListener("mousedown", mdown, false);
          elements[i].addEventListener("touchstart", mdown, false);
      }

      //マウスが押された際の関数
      function mdown(e) {
        //クラス名に .drag を追加
        this.classList.add("drag");
        let event;
        
        // console.log(`mdown target: ${e.currentTarget.dataset.gameObjectId}`);

        //タッチデイベントとマウスのイベントの差異を吸収
        if(e.type === "mousedown") {
            event = e;
        } else {
            event = e.changedTouches[0];
        }

        // 重なった他の要素を動かさないように指定
        e.stopPropagation();
        
        //要素内の相対座標を取得
        x = event.pageX - this.offsetLeft;
        y = event.pageY - this.offsetTop;

        //ムーブイベントにコールバック
        document.body.addEventListener("mousemove", mmove, false);
        document.body.addEventListener("touchmove", mmove, false);

        //マウスボタンが離されたとき、またはカーソルが外れたとき発火
        this.addEventListener("mouseup", mup, false);
        document.body.addEventListener("mouseleave", mup, false);
        this.addEventListener("touchend", mup, false);
        document.body.addEventListener("touchleave", mup, false);
      }

      //マウスカーソルが動いたときに発火
      function mmove(e) {

        //ドラッグしている要素を取得
        let drag = document.querySelector(".drag");
        let event;

        //同様にマウスとタッチの差異を吸収
        if(e.type === "mousemove") {
            event = e;
        } else {
            event = e.changedTouches[0];
        }

        //フリックしたときに画面を動かさないようにデフォルト動作を抑制
        e.preventDefault();

        let previewX = e.pageX - x;
        let previewY = e.pageY - y;
        let originalX = Math.round(previewX / xRatio);
        let originalY = Math.round(previewY / yRatio);
        //マウスが動いた場所に要素を動かす
        drag.style.left = previewX + "px";
        drag.style.top = previewY + "px";

        // info欄の値を更新する
        infoX.value = originalX;
        infoY.value = originalY;
        // gameObjectの値を更新する
        let gameObject = window.gameObjects[drag.dataset.gameObjectId];
        gameObject.position.x = originalX;
        gameObject.position.y = originalY;
      }

      //マウスボタンが上がったら発火
      function mup(e) {
        let drag = document.querySelector(".drag");

        //ムーブベントハンドラの消去
        document.body.removeEventListener("mousemove", mmove, false);
        document.body.removeEventListener("touchmove", mmove, false);
        if (drag) {
          drag.removeEventListener("mouseup", mup, false);
          drag.removeEventListener("touchend", mup, false);
          //クラス名 .drag も消す
          drag.classList.remove("drag");
        }
      }
      // D&Dの設定


      if (XHR.status != 200) {
        // レスポンスの HTTP ステータスを解析し、該当するエラーメッセージをアラートで表示するようにしている
        alert(`Error ${XHR.status}: ${XHR.statusText}`);
      } else {
        return null;
      }
    };
    // リクエストが送信できなかった時
    XHR.onerror = () => {
      alert('Request failed');
    };
  };
};

const makeStageCard = (id, json) =>{
  // stage画像を分割したオブジェクトを表示するレイアウト
  // idと画像の配置、サイズの情報をHTML属性に持たせる
  let card = `
  <div class='object-card' id='${id}'>
    <div class='symbol container'>
      <input type='text' class='symbol-input' id='symbolInput'>
    </div>
    <div class='position container'>



    <div class='delete-btn' id='deleteButton'>削除</div>
      <div class='position-indicator'></div>
    </div>
    <div class='object container'>
      <div class='delete-btn' id='deleteButton'>削除</div>
      <div class='object new-btn'>+</div>
    </div>
    <div class='script container'>
      <select class='script-select' id='scriptSelect' name="example">
        <option value="object">未選択</option>
        <option value="player">プレイヤー</option>
        <option value="enemy">敵</option>
        <option value="item">アイテム</option>
        <option value="goal">ゴール</option>
      </select>
      <div class='object new-btn'>+</div>
    </div>
  </div>
  `
  return card
}

// <div id='vertices' ${verticesDataTag(json)}></div>


// const verticesDataTag = (json) => {
//   let dataset = '';
//   let vertices = json['vertices'];
//   for (key in vertices) {
//     dataset += (`data-${key}=${vertices[key]} `);
//   }
//   return dataset;
// }

const makeRadioButton = (element) => {
  // 同じクラス名を持つ全ての要素の"selected"クラスを外し、選択されたimg要素に"selected"classを付ける
  resetSelect(element);
  addSelect(element);
}

const addCheckBox = (element) => {
  element.addEventListener('click', (e) => {
    if (element.classList.contains('selected') == true) {
      removeSelect(element);
    } else {
      addSelect(element);
    }
  });
}

const addSelect = (element) => {
  element.classList.add('selected');
}

const removeSelect = (element) => {
  element.classList.remove('selected');
}

const resetSelect = (element) => {
  const className = element.classList[0];
  let Images = Array.from(document.querySelectorAll('.selected'));
  Images.forEach( (image) => {
    image.classList.remove('selected');
  });
}

// info欄が更新された際にGUI内の該当するオブジェクトの描画位置を更新する
const imageMover = (e, gameObjects) => {
  let image = document.querySelector('.selected');
  let gameObject = gameObjects[image.dataset.gameObjectId];
  let position = gameObject.position;
  let value = e.currentTarget.value;
  
  switch(e.currentTarget.id){
    case 'x':
      gameObject.position.x = value;
      image.style.left = position.modifyScale('x').toString() + 'px';
      break
    case 'y':
      gameObject.position.y = value;
      image.style.top = position.modifyScale('y').toString() + 'px';
      break
    case 'width':
      gameObject.position.width = value;
      image.style.width = position.modifyScale('width').toString() + 'px';
      break
    case 'height':
      gameObject.position.height = value;
      image.style.height = position.modifyScale('height').toString() + 'px';
      break
    case 'role_select':
      gameObject.script = value;
      break
  }
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