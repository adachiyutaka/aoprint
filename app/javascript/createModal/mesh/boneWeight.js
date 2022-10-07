// ボーンのウェイトを計算する
const boneWeight = (outlineArray, boneHierarchy, boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices, parentBoneName = "hips") => {

  // 最上位のボーンの次の階層にいくつボーンがあるか調べる
  // (upperArm.L > lowerArm.L なら 1, hip > spine, upperLeg.L, upperLeg.R なら 3）
  let childBoneCount = 0;
  boneHierarchy.forEach(bones => {
    // 配列かどうかを調べる
    if(Array.isArray(bones)){
      childBoneCount ++;
    }
  });

  // ボーン名とパーツの輪郭線の情報を取得
  let boneName = boneHierarchy[0];
  let bonePoints = boneNamedPoints.find(boneNamedPoint => boneNamedPoint.name == boneName);

  // boneNamedPointsにボーン名が登録されていない場合、ウェイトを設定せずに子ボーンについて再起的にウェイトを設定する
  if(!bonePoints){
    for(let i = 1; i < boneHierarchy.length; ++i){
      boneWeight(outlineArray, boneHierarchy[i], boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices, boneName);
    }
  }
  // 子ボーン（次の階層のボーン）の数が2以上の場合、ウェイト(1)を設定し、それぞれの子ボーンについても再起的にウェイトを設定する
  else if(childBoneCount >= 2){
    // ボーンの輪郭線の各点にボーンidとウェイト(1)を設定する
    bonePoints.points.array.forEach(point => {
      // 各点のverticesにおけるid
      let id = findArrayIndex(outlineArray, point);

      // ボーンidを登録する
      boneIdOnVertices[id].push(boneId.findIndex(name => name == boneName));

      // 各点に関連する現在のウェイトの数
      let weightCount = boneWeightOnVertices[id].length;
      // すでにウェイトが登録されている場合、ウェイトを計算して登録する
      // 新たに登録するウェイトは、1 / 現在のウェイト数 + 1 とする
      // すでに登録されているウェイトを再計算した合計
      let weightSum = 0;
      console.log("childBoneCount >= 2, boneName: ", boneName, "weightCount: ", weightCount);
      console.log("old weight", boneWeightOnVertices[id]);
      boneWeightOnVertices[id].forEach((weight, weight_i) => {
        // すでに登録されているウェイトは、現在のウェイト数 / 現在のウェイト数 + 1 倍に圧縮する
        // 小数点第一位で四捨五入する
        weight = Math.round((weight/(weightCount + 1)) * 10) / 10;
        boneWeightOnVertices[id][weight_i] = weight;
        weightSum += weight;
      })
      // すでに登録されているウェイトが一つもない場合、新たなウェイトは１になる
      boneWeightOnVertices[id].push(1 - weightSum);
      console.log("new weight", boneWeightOnVertices[id]);
    });
    
    for(let i = 1; i < boneHierarchy.length; ++i){
      boneWeight(outlineArray, boneHierarchy[i], boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices, boneName);
    }
  }
  // 子ボーン（次の階層のボーン）の数が1か0の場合
  else if(childBoneCount <= 1){
    console.log("childBoneCount <= 1");

    // ボーンの根本と先端の位置を取得
    let rootPoint = bonePoints.points.rootPoints.center;
    let tipPoint;
    // 子ボーンが孫ボーンを持つ場合
    if(childBoneCount == 1){
      tipPoint = bonePoints.points.separatePoints.center;
    }
    // 子ボーンが孫ボーンを持たない場合
    else{
      tipPoint = bonePoints.points.tipPoint;
    }
    // let separatePoint = points.separatePoints.center;

    // ボーンの傾きと直行する傾きを算出
    let slope = (tipPoint.y - rootPoint.y) / (tipPoint.x - rootPoint.x);
    let orthogonalSlope = - 1 / slope;
    // y - tipPoint.y = slope * (x - tipPoint.x)
    // y = slope * x - slope * tipPoint.x + tipPoint.y

    // y - point.y = orthogonalSlope * (x - point.x)
    // y = orthogonalSlope * x - orthogonalSlope * point.x + point.y

    // y=ax+b と y=cx+d の交点は (d-b/a-c, ad-bc/a-c)
    console.log("slope", slope);

    // 輪郭線の各点と根本、先端との位置関係を計算し、ウェイトづけする
    bonePoints.points.array.forEach(point => {
      // ボーンの根本と先端を結ぶ線分と、それに直行する輪郭線の一つの点を通る線分の交点を求める
      // y = ax + b, y = cx + d の2直線の交点は、x = (d - b) / (a - c), y =  (a * d - b * c) / (a - c)
      let a = slope;
      let b = - slope * tipPoint.x + tipPoint.y;
      let c = orthogonalSlope;
      let d = - orthogonalSlope * point.x + point.y;
      let intersection = {};
      intersection.x = (d - b) / (a - c);
      intersection.y = (a * d - b * c) / (a - c);
      console.log("intersection", intersection, "tipPoint", tipPoint, "rootPoint", rootPoint);

      // ボーンの線分と、親ボーンの根本〜交点までの線分の長さを求める
      let boneLength = distance(rootPoint, tipPoint);
      let intersectionLength = distance(rootPoint, intersection);
      // 2つの長さの割合をそれぞれ親ボーン、子ボーンのウェイトとする
      let weightRatio = Math.round(Math.min(intersectionLength / boneLength, 1) * 10) / 10;
      let parentWeight = Math.round(Math.max(0.5 - weightRatio, 0) * 10) / 10;
      let weight;

      // ボーンidリストでのindexを取得する
      let parendId = boneId.findIndex(name => name == parentBoneName);
      let id = boneId.findIndex(name => name == boneName);

      // 輪郭全体におけるid（verticesのid）を取得する
      let verticesId = findArrayIndex(outlineArray, point);

      // 子ボーンがさらに子ボーン（孫ボーン）を持つ場合、子ボーンを含むウェイトを設定し、再起する
      if(childBoneCount == 1){
        // 子ボーンの名前を取得
        let childBone = boneHierarchy[1];
        let childBoneName = childBone[0];
        // 子ボーンのウェイトと、ボーンのウェイトを計算する
        let childWeight = Math.round(Math.max(weightRatio - 0.5, 0) * 10) / 10;
        weight = 1 - (parentWeight + childWeight);
        let childId = boneId.findIndex(name => name == childBoneName);
        console.log("boneIdOnVertices[verticesId]", boneIdOnVertices[verticesId]);

        // 各点における関連ボーンのidのリスト（boneIdOnVertices）に該当するボーン、子ボーンのidを追加する
        boneIdOnVertices[verticesId] = [parendId, id, childId];
        console.log("boneIdOnVertices[verticesId]", boneIdOnVertices[verticesId]);

        // 各点における関連ボーンのウェイトのリスト（boneWeightOnVertices）に該当するボーン、子ボーンのウェイトを追加する
        boneWeightOnVertices[verticesId] = [parentWeight, weight, childWeight];

        // 子ボーンについても再起的にウェイトを設定する
        boneWeight(outlineArray, childBone, boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices, boneName);

      // 子ボーンがさらに子ボーン（孫ボーン）を持たない場合、子ボーンを含まないウェイトを設定し、再起しない
      }else{
        // ボーンのウェイトを計算する
        weight = 1 - parentWeight;

        // 各点における関連ボーンのidのリスト（boneIdOnVertices）に該当するボーンのidを追加する
        boneIdOnVertices[verticesId] = [parendId, id];
        // 各点における関連ボーンのウェイトのリスト（boneWeightOnVertices）に該当するボーンのウェイトを追加する
        boneWeightOnVertices[verticesId] = [parentWeight, weight];
      }
    });
  }
}

// Point配列の中から指定した点と同じ値のindexを返す
const findArrayIndex = (array, point) => {
  return array.findIndex(p => p.x == point.x && p.y == point.y);
}

// 2点の距離を算出する
const distance = (point1, point2) => {
  return Math.sqrt( Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

export default boneWeight;