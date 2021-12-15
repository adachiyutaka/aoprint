import CreateController from './createController.js';

const objectMove = (element) => {
  let oldPosX = 0;
  let oldPosY = 0;

  //マウスが要素内で押されたとき、又はタッチされたとき発火
  element.addEventListener("mousedown", mouseDown);
  element.addEventListener("touchstart", mouseDown);

  // preview画面のイベント（preview内imageの選択キャンセル）を発火させないために
  // stopPropagationを設定
  element.addEventListener("click", (e) => {e.stopPropagation()});

  function mouseDown(e) {
    console.log("mouseDown");

    let element = CreateController.selectedElement;

    // 手前に表示されるようz-indexを変更するため、クラス名に drag を追加
    element.classList.add("drag");

    //タッチイベントとマウスのイベントの差異を吸収
    let event;
    if(e.type === "mousedown") {
        event = e;
    } else {
        event = e.changedTouches[0];
    }

    // 重なった他の要素を動かさないように指定
    event.stopPropagation();

    // mouse downイベントの場所を初期位置として代入
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
    // oldPos: mouse downイベント または 一つ前の mouse moveイベント発火時のマウスの位置
    let posX = event.pageX;
    let posY = event.pageY;
    CreateController.updateObjectMove(posX - oldPosX, posY - oldPosY);

    // 現在のマウスの位置を oldPos に設定する
    oldPosX = posX;
    oldPosY = posY;
  }

  function mouseUp(e){
    console.log("mouseUp");

    //同様にマウスとタッチの差異を吸収
    let event;
    if(e.type === "mouseup" || e.type === "mouseleave") {
        event = e;
    } else {
        event = e.changedTouches[0];
    }

    // 重なった他の要素を動かさないように指定
    event.stopPropagation();

    // handツールで移動し終わった値を設定する
    CreateController.finishObjectMove();

    // handツールの位置情報を初期化する
    oldPosX = null;
    oldPosY = null;

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

export default objectMove;