import CreateController from './create-controller';

const handMove = () => {
  let downPosX = null;
  let downPosY = null;
  let movePosX = null;
  let movePosY = null;
  const preview = document.getElementById('preview_container');

  preview.addEventListener('mousedown', mouseDown, false);

  function mouseDown(e) {

    let event;

    console.log("mdown");
    downPosX = e.clientX;
    downPosY = e.clientY;

    //ムーブイベントにコールバック
    this.addEventListener("mousemove", mouseMove, false);
    this.addEventListener("touchmove", mouseMove, false);

    //マウスボタンが離されたとき、またはカーソルが外れたとき発火
    this.addEventListener("mouseup", mouseUp, false);
    this.addEventListener("mouseleave", mouseUp, false);
    this.addEventListener("touchend", mouseUp, false);
    this.addEventListener("touchleave", mouseUp, false);
  } 

  function mouseMove(e){
    //フリックしたときに画面を動かさないようにデフォルト動作を抑制
    e.preventDefault();
    // handツールで移動中の値を設定する
    let movePosX = e.clientX - downPosX;
    let movePosY = e.clientY - downPosY;
    CreateController.setHandMove(movePosX, movePosY);

    console.log(e.currentTarget);
  }

  function mouseUp(e){
    console.log("mouseUp");

    // handツールで移動し終わった値を設定する
    CreateController.setViewPosition(movePosX, movePosY);

    // handツールの位置情報を初期化する
    downPosX = null;
    downPosY = null;
    movePosX = null;
    movePosY = null;

    // mdownで設定したリスナーを解除する
    this.removeEventListener("mousemove", mouseMove, false);
    this.removeEventListener("touchmove", mouseMove, false);
    this.removeEventListener("mouseup", mouseUp, false);
    this.removeEventListener("mouseleave", mouseUp, false);
    this.removeEventListener("touchend", mouseUp, false);
    this.removeEventListener("touchleave", mouseUp, false);
  }
}

window.addEventListener('load', handMove);