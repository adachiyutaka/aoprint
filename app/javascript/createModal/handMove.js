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

    //クラス名に .drag を追加
    this.classList.add("drag");

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

    //要素内の相対座標を取得(ページ内の絶対位置 - クリックした要素の親との相対位置)
    // x = event.pageX - this.offsetLeft;
    // y = event.pageY - this.offsetTop;
    
    // ドラッグ中の要素の動きを設定
    document.body.addEventListener("mousemove", mouseMove, false);
    document.body.addEventListener("touchmove", mouseMove, false);

    // マウスボタンが離されたとき、またはカーソルが外れたときの設定
    document.body.addEventListener("mouseup", mouseUp, false);
    document.body.addEventListener("touchend", mouseUp, false);
    this.addEventListener("mouseleave", mouseUp, false);
    this.addEventListener("touchleave", mouseUp, false);
  } 

  // マウスの動きに合わせてドラッグした要素を移動させる
  function mouseMove(e){
    console.log("mouseMove");

    //ドラッグしている要素を取得
    let drag = document.querySelector(".drag");
    let id = drag.dataset.gameObjectId;

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

    // ドラッグで移動した値をCreateControllerから設定する
    let movePosX = event.pageX - oldPosX;
    let movePosY = event.pageY - oldPosY;
    oldPosX = event.pageX;
    oldPosY = event.pageY;
    console.log("id", id, "downPosX:", oldPosX, "event.pageX:", event.pageX, "movePosX:", movePosX);
    CreateController.setHandMove(movePosX, movePosY);
  }

  function mouseUp(e){
    console.log("mouseUp");

    //ドラッグしている要素を取得
    let drag = document.querySelector(".drag");

    // handツールで移動し終わった値を設定する
    // CreateController.setViewPosition(movePosX, movePosY);

    // handツールの位置情報を初期化する
    oldPosX = null;
    oldPosY = null;
    movePosX = null;
    movePosY = null;

    //ムーブベントハンドラの消去
    document.body.removeEventListener("mousemove", mouseMove, false);
    document.body.removeEventListener("touchmove", mouseMove, false);
    document.body.removeEventListener("mouseup", mouseUp, false);
    document.body.removeEventListener("touchend", mouseUp, false);
    this.removeEventListener("mouseleave", mouseUp, false);
    this.removeEventListener("touchleave", mouseUp, false);

    if (drag) {
      drag.classList.remove("drag");
    }
    
    // mdownで設定したリスナーを解除する
    // this.removeEventListener("mousemove", mouseMove, false);
    // this.removeEventListener("touchmove", mouseMove, false);
    // this.removeEventListener("mouseup", mouseUp, false);
    // this.removeEventListener("mouseleave", mouseUp, false);
    // this.removeEventListener("touchend", mouseUp, false);
    // this.removeEventListener("touchleave", mouseUp, false);
  }
}

export default handMove;