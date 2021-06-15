import GameObject from './game.js';

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
    // var data = {};
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
      // クラステスト
      let gameObjects = [];
      const previewContainer = document.getElementById('preview_container');
      const previewWidth = previewContainer.clientWidth;
      const previewHeight = previewContainer.clientHeight;
      // クラステスト


      // ステージ画像から生成したオブジェクトを表示するレイアウトのid
      let index = 0;

      // 受け取ったデータをJSON形式にパースする
      const json = JSON.parse(XHR.response);
      const images = json['images'];
      
      // 元画像をpreview画面サイズに合わせるための比 （プレビューサイズ / 元画像サイズ）
      const xRatio = previewWidth /json['width'];
      const yRatio = previewHeight / json['height'];

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


        // クラステスト
        let gameObject = new GameObject();
        // let position = new Position();
        gameObject.image = `data:image/png;base64,${image['image']}`;
        let vertices = image['vertices'];
        gameObject.setPosition(vertices['x'], vertices['y'], vertices['width'], vertices['height']);

        console.log(gameObject);

        // 切り取った画像のサイズと位置を設定
        previewImg.style.position = "absolute";
        previewImg.style.left = (vertices['x'] * xRatio).toString() + "px";
        previewImg.style.top = (vertices['y'] * yRatio).toString() + "px";
        previewImg.style.width = (vertices['width'] * xRatio).toString() + "px";
        previewImg.style.height = (vertices['height'] * yRatio).toString() + "px";
        previewImg.dataset.gameObjectId = index;

        // リスナーを設定

        // 配置
        previewContainer.appendChild(previewImg);
        // クラステスト




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

const makeRadioButton = (img) => {
  // 該当するtypeの"selected"クラスを全てはずし、選択されたimgタグに"selected"classを付ける
  resetSelect(img);
  addSelect(img);
}

const addCheckBox = (img) => {
  img.addEventListener('click', (e) => {
    if (img.classList.contains('selected') == true) {
      removeSelect(img);
    } else {
      addSelect(img);
    }
  });
}

const addSelect = (img) => {
  img.classList.add('selected');
}

const removeSelect = (img) => {
  img.classList.remove('selected');
}

const resetSelect = (img) => {
  const type = img.classList[1];
  let splitImages = Array.from(document.getElementsByClassName(`split-img ${type} selected`));
  splitImages.forEach( (splitImage) => {
    splitImage.classList.remove('selected');
  });
}

const setPosition = (image, vertices) => {
  image.style.position = "absolute";
  image.style.left = (vertices['x'] * xRatio).toString() + "px";
  image.style.top = (vertices['y'] * yRatio).toString() + "px";
  image.style.width = (vertices['width'] * xRatio).toString() + "px";
  image.style.height = (vertices['height'] * yRatio).toString() + "px";
  return image
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