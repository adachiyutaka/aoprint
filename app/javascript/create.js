const create = () => {
  const form = document.getElementById('game_form');
  form.addEventListener('submit', (e) => {
    // デフォルト動作のデータ送信をキャンセル
    e.preventDefault;
    // 選択されたimg要素を取得
    var slectedStage = document.getElementsByClassName('split-img stage selected')[0];
    var slectedPlayer = document.getElementsByClassName('split-img player selected')[0];
    var slectedObject = document.getElementsByClassName('split-img object selected')[0];
    // 選択されたimg要素をinput要素として挿入
    const renderDom = document.getElementById('game_form');
    const stageImg = `<input value=${slectedStage.src} type='hidden' name='stage_img'>`;
    const playerImg = `<input value=${slectedPlayer.src} type='hidden' name='player_img'>`;
    const objectImg = `<input value=${slectedObject.src} type='hidden' name='object_img'>`;
    renderDom.insertAdjacentHTML("beforeend", stageImg);
    renderDom.insertAdjacentHTML("beforeend", playerImg);
    renderDom.insertAdjacentHTML("beforeend", objectImg);
    // デフォルトのinputタグからname属性を削除
    document.getElementById('stage_input').removeAttribute('name');
    document.getElementById('player_input').removeAttribute('name');
    document.getElementById('object_input').removeAttribute('name');
    // データを送信
    document.getElementById('game_form').submit();
  });
}

window.addEventListener('load', create)