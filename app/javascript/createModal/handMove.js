import CreateController from './createController';

// preview画面にマウスが乗っている間、かつ、spaceキー押下中にドラッグすることで画面を移動させる
// 画面移動機能を使っている間は、spaceキーによるスクロールは抑制される
const handMove = () => {
  
  let oldPosX = null;
  let oldPosY = null;

  let handIcon = document.getElementById('hand_icon');
  let preview = document.getElementById('preview_container');
  
  // preview画面上にマウスが乗っているかどうかの判定
  preview.addEventListener('mouseover', mouseOver);
  preview.addEventListener('mouseout', mouseOut);
  preview.addEventListener('mouseleave', mouseOut);

  // preview画面上にマウスが乗っている場合、spaceキー押下を読み取るリスナーを設定する
  // マウスがpreview画面から離れる際に、このリスナーは削除する
  function mouseOver() {
    document.body.addEventListener('keydown', spaceDown);
    document.body.addEventListener('keyup', spaceUp);
  }

  function mouseOut() {
    document.body.removeEventListener('keydown', spaceDown);
    document.body.removeEventListener('keyup', spaceUp);
  }

  // spaceキー押下中にマウスをドラッグした移動量を
  function spaceDown(e) {
    // spaceキーによるスクロールを防ぐ
    e.preventDefault();

    if(e.code == 'Space'){
      handIcon = document.getElementById('hand_icon');
      handIcon.style.visibility = 'visible';

      // preview要素に handクラスが設定されていない場合
      // ※keydownイベントはキー押下の間に何度も繰り返し呼び出されるため、リスナーが重複しないように handクラスをフラグ替わりに使う
      if(!preview.classList.contains('hand')){
      console.log("space Down");

      // preview画面に mouse down のリスナーを設定する
      preview.addEventListener("mousedown", mouseDown);
      preview.addEventListener("touchstart", mouseDown);

      // preview要素に handクラスを設定
      // カーソルをhand move中の表示に変更する
      preview.classList.add('hand');
      }
    }
  }

  function spaceUp(e) {
    if(e.code == 'Space'){
      console.log("space Up");

      handIcon = document.getElementById('hand_icon');
      handIcon.style.visibility = 'hidden';

      // preview画面に mouse down のリスナーを削除する
      preview.removeEventListener("mousedown", mouseDown);
      preview.removeEventListener("touchstart", mouseDown);

      // カーソルをhand move中から元に戻す
      preview.classList.remove('hand');
    }
  }

  function mouseDown(e) {
    console.log("hand mouseDown");

    //タッチイベントとマウスのイベントの差異を吸収
    let event;
    if(e.type === "mousedown") {
        event = e;
    } else {
        event = e.changedTouches[0];
    }

    // mouse downイベントの場所を初期位置として代入
    oldPosX = event.pageX;
    oldPosY = event.pageY;
    
    // ドラッグ中の要素の動きを設定
    document.body.addEventListener("mousemove", mouseMove);
    document.body.addEventListener("touchmove", mouseMove);

    // マウスボタンが離されたとき、またはカーソルが外れたときの設定
    document.body.addEventListener("mouseup", mouseUp);
    document.body.addEventListener("touchend", mouseUp);
    preview.addEventListener("mouseleave", mouseUp);
    preview.addEventListener("touchleave", mouseUp);
  }

  // マウスの動きに合わせてドラッグした要素を移動させる
  function mouseMove(e) {
    console.log("hand mouseMove");

    //同様にマウスとタッチの差異を吸収
    let event;
    if(e.type === "mousemove") {
        event = e;
    } else {
        event = e.changedTouches[0];
    }

    // フリックしたときに画面を動かさないようにデフォルト動作を抑制
    event.preventDefault();

    // マウスの位置の差をCreateControllerから設定する
    // pos : 現在のマウスの位置
    // oldPos: mouse downイベント または 一つ前の mouse moveイベント発火時のマウスの位置
    let posX = event.pageX;
    let posY = event.pageY;
    CreateController.updateHandMove(posX - oldPosX, posY - oldPosY);

    // 現在のマウスの位置を oldPos に設定する
    oldPosX = posX;
    oldPosY = posY;
  }

  function mouseUp(e) {
    console.log("hand mouseUp");

    // handツールで移動し終わった値を設定する
    CreateController.finishHandMove();

    // handツールの位置情報を初期化する
    oldPosX = null;
    oldPosY = null;

    //ムーブベントハンドラの消去
    document.body.removeEventListener("mousemove", mouseMove);
    document.body.removeEventListener("touchmove", mouseMove);
    document.body.removeEventListener("mouseup", mouseUp);
    document.body.removeEventListener("touchend", mouseUp);
    preview.removeEventListener("mouseleave", mouseUp);
    preview.removeEventListener("touchleave", mouseUp);
  }
};

window.addEventListener('load', handMove);