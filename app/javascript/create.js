const create = () => {
  const form = document.getElementById('game_form');
  form.addEventListener('submit', (e) => {
    // デフォルト動作のデータ送信をキャンセル
    e.preventDefault;

    // 選択されたimg要素を取得
    let objectData = [];

    Array.from(document.getElementsByClassName('object-card')).forEach((card) => {
      let symbolContainer = card.children[0];
      let positionContainer = card.children[1];
      let objectContainer = card.children[2];
      let scriptContainer = card.children[3];

      // 入力されたsymbolの値を取得
      let symbolInput = Array.from(symbolContainer.children).find((o) => o.id == 'symbolInput').value;

      // position表示画像と値を取得
      let positionBase64 = getImage(positionContainer).src;
      let positions = Array.from(positionContainer.children).find((o) => o.id == 'vertices').dataset;

      // objectの画像を取得
      let objectBase64 = getImage(objectContainer).src;

      // scriptの値を取得
      let script = Array.from(scriptContainer.children).find((o) => o.id == 'scriptSelect').value;

      // JSONとして配列に加える
      const gameObject = {symbol: symbolInput, position: {image: positionBase64, h: positions.h, w: positions.w, x: positions.x, y: positions.y}, object: objectBase64, script: script};
      objectData.push(gameObject);
    });
    
    const renderDom = document.getElementById('game_form');
    const gameInput = `<input value=${JSON.stringify(objectData)} type='hidden' name='game_form[objects]'>`;
    // const gameInput = `<input value=${[JSON.stringify({test1: "1"}), JSON.stringify({test2: "2"})]} type='hidden' name='game_form[objects]'>`;
    console.log([JSON.stringify({test1: "1"}), JSON.stringify({test2: "2"})]);
    renderDom.insertAdjacentHTML("beforeend", gameInput);
    // デフォルトのinputタグからname属性を削除
    document.getElementById('game_form_stage_input').removeAttribute('name');
    document.getElementById('game_form_player_input').removeAttribute('name');
    document.getElementById('game_form_object_input').removeAttribute('name');
    // データを送信
    // document.getElementById('game_form').submit();
  });
}

const getImage = (container) => {
  return Array.from(container.children).find((o) => o.classList.contains('split-img'))
}

window.addEventListener('load', create);