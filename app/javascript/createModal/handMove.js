import CreateController from './createController.js';

const handMove = (element) => {
  let oldPosX = null;
  let oldPosY = null;
  let movePosX = null;
  let movePosY = null;

  //マウスが要素内で押されたとき、又はタッチされたとき発火
  element.addEventListener("mousedown", mouseDown, false);
  element.addEventListener("touchstart", mouseDown, false);

  function mouseDown(e) {
    console.log("mouseDown");

    let element = CreateController.selectedElement;

    // 手前に表示されるようz-indexを変更するため、クラス名に drag を追加
    element.classList.add("drag");

    //タッチデイベントとマウスのイベントの差異を吸収
    let event;
    if(e.type === "mousedown") {
        event = e;
    } else {
        event = e.changedTouches[0];
    }

    // 重なった他の要素を動かさないように指定
    event.stopPropagation();

    oldPosX = event.pageX;
    oldPosY = event.pageY;
    
    // ドラッグ中の要素の動きを設定
    document.body.addEventListener("mousemove", mouseMove, false);
    document.body.addEventListener("touchmove", mouseMove, false);

    // マウスボタンが離されたとき、またはカーソルが外れたときの設定
    document.body.addEventListener("mouseup", mouseUp, false);
    document.body.addEventListener("touchend", mouseUp, false);
    element.addEventListener("mouseleave", mouseUp, false);
    element.addEventListener("touchleave", mouseUp, false);
  } 

  // マウスの動きに合わせてドラッグした要素を移動させる
  function mouseMove(e){
    console.log("mouseMove");

    //同様にマウスとタッチの差異を吸収
    let event;
    if(e.type === "mousemove") {
        event = e;
    } else {
        event = e.changedTouches[0];
    }

    // フリックしたときに画面を動かさないようにデフォルト動作を抑制
    event.preventDefault();
    
    // 重なった他の要素を動かさないように指定
    event.stopPropagation();

    // マウスの位置の差をCreateControllerから設定する
    // pos : 現在のマウスの位置
    // oldPos: 一つ前のmousemoveイベント発火時のマウスの位置
    let posX = event.pageX;
    let posY = event.pageY;
    CreateController.updateHandMove(posX - oldPosX, posY - oldPosY);

    // 現在のマウスの位置を oldPos に設定する
    oldPosX = posX;
    oldPosY = posY;
  }

  function mouseUp(e){
    console.log("mouseUp");

    // handツールで移動し終わった値を設定する
    CreateController.finishHandMove();

    // handツールの位置情報を初期化する
    oldPosX = null;
    oldPosY = null;
    movePosX = null;
    movePosY = null;

    //ムーブベントハンドラの消去
    let element = CreateController.selectedElement;
    document.body.removeEventListener("mousemove", mouseMove, false);
    document.body.removeEventListener("touchmove", mouseMove, false);
    document.body.removeEventListener("mouseup", mouseUp, false);
    document.body.removeEventListener("touchend", mouseUp, false);
    element.removeEventListener("mouseleave", mouseUp, false);
    element.removeEventListener("touchleave", mouseUp, false);

    // クラス名 drag を削除
    element.classList.remove("drag");
  }
}

export default handMove;