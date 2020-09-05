const splitImage = () => {

  // リスナーをセットするプレイヤーフォーム要素を取得
  const imageForm = document.getElementById('player_input');
  imageForm.addEventListener('change', (e) => {
    // ユーザーがセットしたファイルから画像ファイルを読み取り
    const file = e.target.files[0];

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
      XHR.open("POST", 'http://127.0.0.1:5000/test', true);
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
        const imageContainer = document.getElementById('imageContainer');
        // 各データに対応するimgタグを生成する
        jsons.forEach( (json) => {
          var img = document.createElement("img");
          img.src = `data:image/png;base64,${json['result']}`;
          img.classList.add('split-player');
          imageContainer.appendChild(img);
        });

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
  });
};

window.addEventListener('load', splitImage);