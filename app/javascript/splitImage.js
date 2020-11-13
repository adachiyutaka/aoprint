const sendImage = () => {

  // リスナーをセットするステージフォーム要素を取得
  const stageForm = document.getElementById('stage_input');
  const stageLabel = document.getElementById('stage_label');
  const stageClickOrDD = document.getElementById('click_or_dd');
  const stagePleaseDrop = document.getElementById('please_drop');
  const playerForm = document.getElementById('player_input');
  const playerLabel = document.getElementById('player_label');

  stageForm.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    const file = e.target.files[0];
    stageLabel.classList.add('hidden');
    splitImage(file, 'stage')
  });

  // ドロップ可能エリアに入った時
  stageLabel.addEventListener('dragenter', () => {
    stageLabel.style.backgroundColor = "#418dca"
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

  // プレイヤーフォームにリスナー要素をセット
  playerForm.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    const file = e.target.files[0];
    playerLabel.classList.add('hidden');
    splitImage(file, 'player')
  });
};

const splitImage = (file, type) => {
// pngに変換するためにcanvasを準備
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
    const png = canvas.toDataURL('image/png').match(/,(.*)$/)[0];

    // Ajaxに必要なオブジェクトを生成し画像データを送信
    const XHR = new XMLHttpRequest();
    if (type == 'stage') {
      XHR.open("POST", `http://127.0.0.1:5000/stage`, true);
    }
    else if (type == 'player') {
      XHR.open("POST", `http://127.0.0.1:5000/player`, true);
    }
    XHR.setRequestHeader('Content-Type', 'application/json');
    var data = {};
    data.image = png;
    json = JSON.stringify(data);
    XHR.send(json);

    // レスポンスを受け取った時の処理を記述する
    XHR.onload = () => {
      // 受け取ったデータをJSON形式にパースする
      const jsons = JSON.parse(XHR.response);
      // 画像を格納するdivタグ要素を取得
      const imageContainer = document.getElementById(`${type}ImageContainer`);
      // 各データに対応するimgタグを生成する
      jsons.forEach( (json) => {
        var img = document.createElement("img");
        img.src = `data:image/png;base64,${json['result']}`;
        img.classList.add('split-img');
        img.classList.add(`${type}`);
        imageContainer.appendChild(img);
        img.addEventListener('click', (e) => {
          // 該当するtype(player, stageなど)の"selected"クラスを全てはずし、選択されたimgタグに"selected"classを付ける
          resetSelect(type);
          addSelect(img);
        });
      });
      addSelect(document.getElementsByClassName(`split-img ${type}`)[0]);

      if (XHR.status != 200) {
        // レスポンスの HTTP ステータスを解析し、該当するエラーメッセージをアラートで表示するようにしている
        alert(`Error ${XHR.status}: ${XHR.statusText}`);
      } else {
        return null;
      }
    };
    リクエストが送信できなかった時
    XHR.onerror = () => {
      alert('Request failed');
    };
  };
};

const addSelect = (img) => {
  img.classList.add('selected');
}

const resetSelect = (type) => {
  splitImages = Array.from(document.getElementsByClassName(`split-img ${type} selected`));
  splitImages.forEach( (splitImage) => {
    splitImage.classList.remove('selected');
  });
}

window.addEventListener('load', sendImage);