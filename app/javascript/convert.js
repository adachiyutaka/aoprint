const convertImage = () => {
  // Ajaxに必要なオブジェクトを生成
  const XHR = new XMLHttpRequest();

  // リスナーをセットする価格フォーム要素を取得
  const imageForm = document.getElementById('player_img');
  imageForm.addEventListener('change', (e) => {

    const file = e.target.files[0];
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = window.URL.createObjectURL(file);

    img.onload = () => {
      var dx = 0;
      var dy = 0;
      var dw = img.naturalWidth;
      var dh = img.naturalHeight;
      canvas.setAttribute('width', dw);
      canvas.setAttribute('height', dh);
      context.drawImage(img, dx, dy, dw, dh);
      const png = canvas.toDataURL('image/png').match(/,(.*)$/)[0];

      XHR.open("POST", 'http://127.0.0.1:5000/test', true);
      XHR.setRequestHeader('Content-Type', 'application/json');
      var data = {};
      data.image = png;
      json = JSON.stringify(data);
      XHR.send(json);
  
      // レスポンスを受け取った時の処理を記述する
      XHR.onload = () => {
        // 受け取ったデータをJSON形式にパースする
        const data = JSON.parse(XHR.response);
        // 画像を格納するdivタグ要素を取得
        const imageContainer = document.getElementById('imageContainer');
        // 各データに対応するimgタグを生成する
        data.forEach( (image) => {
          var img = document.createElement("img");
          img.src = `data:image/png;base64,${image['result']}`;
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

window.addEventListener('load', convertImage);