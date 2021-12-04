import CreateController from './createController.js';

const handMove = (element) => {
  let oldPosX = null;
  let oldPosY = null;
  let movePosX = null;
  let movePosY = null;

  console.log("hand move set element :", element)
  // const preview = document.getElementById('preview_container');
  // preview.addEventListener('mousedown', mouseDown, false);

  // let elements = document.getElementsByClassName("drag-and-drop");

  //マウスが要素内で押されたとき、又はタッチされたとき発火
  element.addEventListener("mousedown", mouseDown, false);
  element.addEventListener("touchstart", mouseDown, false);
  //マウスが要素内で押されたとき、又はタッチされたとき発火
  // for(let i = 0; i < elements.length; i++) {
  //   elements[i].addEventListener("mousedown", mouseDown, false);
  //   elements[i].addEventListener("touchstart", mouseDown, false);
  // }

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
    
    //ムーブイベントにコールバック
    document.body.addEventListener("mousemove", mouseMove, false);
    document.body.addEventListener("touchmove", mouseMove, false);

    //マウスボタンが離されたとき、またはカーソルが外れたとき発火
    this.addEventListener("mouseup", mouseUp, false);
    document.body.addEventListener("mouseleave", mouseUp, false);
    this.addEventListener("touchend", mouseUp, false);
    document.body.addEventListener("touchleave", mouseUp, false);
  } 

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

    //フリックしたときに画面を動かさないようにデフォルト動作を抑制
    event.preventDefault();
    
    // 重なった他の要素を動かさないように指定
    event.stopPropagation();

    // ドラッグで移動中の値を設定する
    let movePosX = event.pageX - oldPosX;
    let movePosY = event.pageY - oldPosY;
    oldPosX = event.pageX;
    oldPosY = event.pageY;
    console.log("id", id, "downPosX:", oldPosX, "event.pageX:", event.pageX, "movePosX:", movePosX);
    CreateController.setHandMove(movePosX, movePosY, id);

    // // info欄のエレメントを取得
    // const infoX = document.getElementById('x');
    // const infoY = document.getElementById('y');
    
    // let previewX = movePosX + this.offsetLeft;
    // let previewY = movePosY + this.offsetTop;
    // let originalX = previewX / position.xRatio;
    // let originalY = previewY / position.yRatio;

    // //マウスが動いた場所に要素を動かす
    // // drag.style.left = previewX + "px";
    // // drag.style.top = previewY + "px";

    // // info欄の値を更新する
    // infoX.value = originalX;
    // infoY.value = originalY;
  }

  function mouseUp(e){
    console.log("mouseUp");

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
    if (drag) {
      drag.removeEventListener("mouseup", mouseUp, false);
      drag.removeEventListener("touchend", mouseUp, false);
      //クラス名 .drag も消す
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