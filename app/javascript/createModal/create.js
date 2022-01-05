import CreateController from './createController';

const create = () => {
  const gameForm = document.getElementById('game_form');
  gameForm.addEventListener('click', (e) => {
    // デフォルト動作のデータ送信をキャンセル
    e.preventDefault();

    // // 選択されたimg要素を取得
    // let objectData = [];
    
    // // TODO: 1object対多positionに対応する必要あり
    // Array.from(document.getElementsByClassName('object-card')).forEach((card) => {
    //   let symbolContainer = card.children[0];
    //   let positionContainer = card.children[1];
    //   let objectContainer = card.children[2];
    //   let scriptContainer = card.children[3];

    //   // 入力されたsymbolの値を取得
    //   let symbolInput = Array.from(symbolContainer.children).find((o) => o.id == 'symbol_input').value;

    //   // position表示画像と値を取得
    //   let positionBase64 = getImage(positionContainer).src;
    //   let positions = Array.from(positionContainer.children).find((o) => o.id == 'vertices').dataset;

    //   // objectの画像を取得
    //   let objectBase64 = getImage(objectContainer).src;

    //   // scriptの値を取得
    //   let script = Array.from(scriptContainer.children).find((o) => o.id == 'roll_select').value;

    //   // JSONとして配列に加える
    //   const gameObject = {symbol: symbolInput, position: {x: positions.x, y: positions.y, width: positions.width, height: positions.height, image: positionBase64}, object: objectBase64, script: script};
    //   objectData.push(gameObject);
    // });
    console.log("CreateController.gameObjects: ", CreateController.gameObjects);
    console.log("JSON.stringify(): ", JSON.stringify(CreateController.gameObjects));
    
    // const gameInput = `<input value=${JSON.stringify(objectData)} type='hidden' name='game_form[objects]'>`;
    // const canvasInput = `<input value=${JSON.stringify({width: canvas.width, height: canvas.height})} type='hidden' name='game_form[canvas]'>`;
    // gameForm.insertAdjacentHTML("beforeend", gameInput + canvasInput);

    // デフォルトのinputタグからname属性を削除
    document.getElementById('game_form_stage_input').removeAttribute('name');

    // データを送信
    // gameForm.submit();
  });
}

const getImage = (container) => {
  return Array.from(container.children).find((o) => o.classList.contains('split-img'))
}

window.addEventListener('load', create);