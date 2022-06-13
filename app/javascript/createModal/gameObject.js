class GameObject {
  constructor() {
    this.symbol = '';
    this.position = null;
    this.image = null;
    this.role = 1;
    this.object = '';
    this.script = '';
    this.meshData = null;
  }

  setPosition(x, y, width, height) {
    this.position = new Position(x, y, width, height);
  }

  setImage(id, base64url) {
    this.image = new Image(id, base64url);
  }

  setMesh(vertices, triangles, boneNamesOnVertices) {
    this.meshData = new MeshData(vertices, triangles, boneNamesOnVertices);
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

class Image {
  constructor(id, base64url) {
    this.id = id;
    this.base64url = base64url;
  }
}

class MeshData {
  constructor(vertices, triangles, boneNamesOnVertices) {
    this.vertices = vertices;
    this.triangles = triangles;
    this.boneNamesOnVertices = boneNamesOnVertices;
  }
}

export default GameObject;