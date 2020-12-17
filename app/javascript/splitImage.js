// import ReadText from "./readText.js"

const sendImage = () => {

  // リスナーをセットするステージフォーム要素を取得
  const stageForm = document.getElementById('stage_input');
  const stageLabel = document.getElementById('stage_label');
  const stageClickOrDD = document.getElementById('click_or_dd');
  const stagePleaseDrop = document.getElementById('please_drop');
  const playerForm = document.getElementById('player_input');
  const playerLabel = document.getElementById('player_label');
  const objectForm = document.getElementById('object_input');
  const objectLabel = document.getElementById('object_label');

  console.log(stageClickOrDD);
  console.log(stagePleaseDrop);

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
  let stageId = 0;
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
    var data = {};
    data.image = png;
    var json = JSON.stringify(data);
    XHR.send(json);

    // レスポンスを受け取った時の処理を記述する
    XHR.onload = () => {
      // 受け取ったデータをJSON形式にパースする
      const jsons = JSON.parse(XHR.response);
      // 画像を格納するdivタグ要素を取得
      const objectList = document.getElementById(`objectList`);
      const imageList = document.getElementById(`imageList`);
      // const enemyImageList = document.getElementById(`enemyImagList`);

      // 各データに対応するimgタグを生成する
      jsons.forEach( (json) => {
        let type = json['type'];

        let img = document.createElement('img');
        img.src = `data:image/png;base64,${json['image']}`;
        img.classList.add('split-img');
        
        if (type == 'stage') {
          objectList.insertAdjacentHTML("beforeend", makeStageCard(stageId, json));
          const card = document.getElementById(`${stageId}`);
          let symbolContainer = card.children[0];
          let positionContainer = card.children[1];
          let objectContainer = card.children[2];
          positionContainer.insertBefore(img.cloneNode(), positionContainer.children[0]);
          objectContainer.insertBefore(img.cloneNode(), objectContainer.children[0]);

          let symbolDeleteBtn = Array.from(symbolContainer.children).find((o) => o.classList.contains('delete-btn'));
          let objectDeleteBtn = Array.from(objectContainer.children).find((o) => o.classList.contains('delete-btn'));
          let objectNewBtn = Array.from(objectContainer.children).find((o) => o.classList.contains('new-btn'));
          let objectImg = Array.from(objectContainer.children).find((o) => o.classList.contains('split-img'));

          objectNewBtn.addEventListener('click', (e) => {
            console.log(dialogImageList);
            dialogImageList = [];
            console.log(dialogImageList);
            Array.from(objectList.children).forEach((card) => {
              dialogImageList.push(Array.from(card.children[2].children).find((o) => o.classList.contains('split-img')).cloneNode());
            });
            Array.from(imageList.children).forEach((img) => {
              dialogImageList.push(img.cloneNode());
            });
            console.log(dialogImageList);
            dialogImageList.forEach((img) => {
              img.addEventListener('click', (e) => {
                objectContainer.insertBefore(e.target.cloneNode(), objectContainer.children[0]);
                imageDialog.classList.add('hidden');
                Array.from(imageDialog.children).forEach((o) => {
                  o.remove()
                });
              });
              imageDialog.appendChild(img);
            });
            imageDialog.classList.remove('hidden');
          });
          objectDeleteBtn.addEventListener('click', (e) => {
            objectImg.remove();
            objectDeleteBtn.remove();
          });
          stageId += 1
        } else if (type == 'character') {
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
  let card = `
  <div class='object-card' id='${id}' ${verticesDataTag(json)}>
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
        <option value="no_selection">未選択</option>
        <option value="player">プレイヤー</option>
        <option value="enemy">敵</option>
      </select>
      <div class='object new-btn'>+</div>
    </div>
  </div>
  `
  return card
}
const verticesDataTag = (json) => {
  let dataset = [];
  vertices = json['vertices']
  for (key in vertices) {
    dataset.push(`data-${key}=${vertices[key]} `)
  }
  return dataset
}

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