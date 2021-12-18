class GameObject {
  constructor() {
    this.symbol = '';
    this.position = null;
    this.image = "";
    this.object = "";
    this.script = "";
  }

  setPosition(x, y, width, height, xRatio, yRatio) {
    this.position = new Position(x, y, width, height, xRatio, yRatio);
  }
}

class Position {
  constructor(x, y, width, height, xRatio, yRatio) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.xRatio = xRatio;
    this.yRatio = yRatio;
  }

  // previewSize(memberName){
  //   let result;
  //   switch(memberName){
  //     case 'x':
  //       result = this.x * this.xRatio;
  //       break
  //     case 'y':
  //       result = this.y * this.yRatio;
  //       break
  //     case 'width':
  //       result = this.width * this.xRatio;
  //       break
  //     case 'height':
  //       result = this.height * this.yRatio;
  //       break
  //   }
  //   return result;
  // }
}


export default GameObject;