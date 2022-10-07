import earcut from 'earcut';

const makeTriangles = (outlineArray, boneNamedPoints, triangles) => {
  // パーツの輪郭ごとに三角分割する
  boneNamedPoints.forEach(boneNamedPoint => {
    let contourArray = boneNamedPoint.points.array;
    
    if(contourArray){
    // 三角分割する
    let partTriangles = triangulation(contourArray);
    // 三角分割で得られた配列は、パーツごとの輪郭戦のidで指定されているため、全体の輪郭戦のidに指定し直す
    partTriangles = partTriangles.map(pointId => findArrayIndex(outlineArray, contourArray[pointId]));
    // 指定し直した配列を追加する
    triangles.push(...partTriangles);
    // パーツの各点のidと同じidに関連するパーツ名の配列を作成する
    // partTriangles.forEach(pointId => {
    //   boneNamesOnVertices[pointId] = _.union(boneNamesOnVertices[pointId], [boneNamedPoint.name]);
    // });
    }
  });
}

const triangulation = (arrayContour) => {
  // cv.Pointの配列を[point1.x, point1.y, point2.x, point2.y, ...]のようにフラットに変換する
  let arrayContourFlat = arrayContour.flatMap(point => [point.x, point.y])
  let triangles = earcut(arrayContourFlat);

  // 作成した三角形の表示
  // let triangle_i;
  // let triangleContour = new cv.Mat();
  // for(triangle_i = triangles.length; triangle_i; ) {
  //   let triangle = [];
  //   --triangle_i; triangle.push(arrayContour[triangles[triangle_i]]);
  //   --triangle_i; triangle.push(arrayContour[triangles[triangle_i]]);
  //   --triangle_i; triangle.push(arrayContour[triangles[triangle_i]]);
  //   contourFromArray(triangle, triangleContour);
  //   cv.fillConvexPoly(dst, triangleContour, new cv.Scalar((255 + 255 * (triangle_i * 30 / triangles.length)) % 255, (155 + 255 * (triangle_i * 40 / triangles.length)) % 255, (0 + 255 * (triangle_i * 100 / triangles.length)) % 255));
  // }

  return triangles;
}

// Pointの配列からMatの輪郭線を作成する
const contourFromArray = (array, dstContour) => {
  let xArray = [];
  let yArray = [];
  array.forEach(point => {
    xArray.push(point.x);
    yArray.push(point.y);
  });
  
  let xy = new cv.MatVector();
  let x = new cv.matFromArray(xArray.length, 1, cv.CV_32S, xArray);
  let y = new cv.matFromArray(yArray.length, 1, cv.CV_32S, yArray);
  xy.push_back(x);
  xy.push_back(y);
  cv.merge(xy, dstContour);

  xy.delete;
  x.delete;
  y.delete;
}

// Point配列の中から指定した点と同じ値のindexを返す
const findArrayIndex = (array, point) => {
  return array.findIndex(p => p.x == point.x && p.y == point.y);
}

export default makeTriangles;