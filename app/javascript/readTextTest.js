const readImage = () => {
  const readBtn = document.getElementById('read-btn');
  const result = document.getElementById('result');

  readBtn.addEventListener('click', (e) => {
    console.log("ボタン押下");
    const XHR = new XMLHttpRequest();
    // openでリクエストを初期化する
    XHR.open("GET", `/games/read_text`, true);
    // レスポンスのタイプを指定する
    XHR.responseType = "json";
    // sendでリクエストを送信する
    XHR.send();

    XHR.onload = () => {
      const item = XHR.response.text;
      console.log(item);
    }
  });
}

window.addEventListener('load', readImage);