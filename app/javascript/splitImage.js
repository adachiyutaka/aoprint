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
    stageLabel.classList.add('hidden');
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
    playerLabel.classList.add('hidden');
    splitImage(file, 'player')
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
  let id = 0;
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const img = new Image();
  img.src = window.URL.createObjectURL(file);

  img.onload = () => {
    // 画像ファイルと同じ大きさのcanvasに画像を貼り、png画像のbase64データに加工
    var dx = 0;
    var dy = 0;
    var dw = img.naturalWidth;
    var dh = img.naturalHeight;
    canvas.setAttribute('width', dw);
    canvas.setAttribute('height', dh);
    context.drawImage(img, dx, dy, dw, dh);
    var imgURL = canvas.toDataURL('image/png');
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
    else if (type == 'player' || type == 'object') {
      XHR.open("POST", `http://127.0.0.1:5000/object`, true);
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
      const stageImageList = document.getElementById(`stageImageList`);
      const objectImageList = document.getElementById(`objectImageList`);
      const playerImageList = document.getElementById(`playerImageList`);
      // const enemyImageList = document.getElementById(`enemyImagList`);

      // 各データに対応するimgタグを生成する
      jsons.forEach( (json) => {
        const type = json['type']
        let imgCard = `
          <div class='img-card' id='imgCard${id}'>
            <input type="radio" name="type" value="stage"> ステージ
            <input type="radio" name="type" value="position"> 位置
          </div>
        `
        let img = document.createElement("img");
        img.src = `data:image/png;base64,${json['image']}`;
        img.classList.add('split-img');
        img.classList.add(type);
        switch (type){
          case 'stage':
            stageImageList.appendChild(img);
            stageImageList.insertAdjacentHTML("beforeend", imgCard);
            break;
          case 'object':
            objectImageList.appendChild(img);
            objectImageList.insertAdjacentHTML("beforeend", imgCard);
            break;
          case 'player':
            playerImageList.appendChild(img);
            break;
        }
        img.addEventListener('click', (e) => {
          // 該当するtypeの"selected"クラスを全てはずし、選択されたimgタグに"selected"classを付ける
          console.log("add listener")
          if (type == 'stage') {
            console.log("type stage")
            // makeRadioButton(img);
            makeRadioButton(img);
          } else {
            console.log("type else")
            makeCheckBox(img);
          }
        });
        id += 1
        console.log(`type: ${json['type']}, vertices: {x: ${json['vertices']['x']}, y: ${json['vertices']['y']}, w: ${json['vertices']['w']}, h: ${json['vertices']['h']}}`);
      });
      addSelect(document.getElementsByClassName(`split-img ${type}`)[0]);

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

const makeRadioButton = (img) => {
  resetSelect(img);
  addSelect(img);
}

const makeCheckBox = (img) => {
  if (img.classList.contains('selected') == true) {
    removeSelect(img);
  } else {
    addSelect(img);
  }
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