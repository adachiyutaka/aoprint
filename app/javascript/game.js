class GameObject {
  constructor() {
    this.symbol = '';
    this.position = null;
    this.image = "";
    this.object = "";
    this.script = "";
  }

  setPosition(x, y, width, height) {
    this.position = new Position(x, y, width, height);
  }
}

class Position {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}


export default GameObject;