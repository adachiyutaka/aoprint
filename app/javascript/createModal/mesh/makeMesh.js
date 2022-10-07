import earcut from 'earcut';
import _ from 'lodash';
import e from 'turbolinks';
import getOutlineContours from "./getOutlineContours.js";
import findSegment from "./findSegment.js";
import separateBody from "./separateBody.js";
import makeTriangles from "./makeTriangles.js";
import makeArmature from "./makeArmature.js";
import boneWeight from "./boneWeight.js";

let dst;

const makeMesh = (base64url) => {
  const img = new Image();
  img.src = base64url;

  // 最外輪郭を取得
  let src = cv.imread(img);
  let outlineContours = getOutlineContours(src);

  // テスト表示
  dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // テスト表示
  
  // 大まかな形状をセグメント分けにより取得する
  // 輪郭線でぬりつぶした画像を作成
  let segmentSrc = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.drawContours(segmentSrc, outlineContours, -1, new cv.Scalar(255, 255, 255), -1, cv.LINE_8);

  // 輪郭線取得のための2値化
  cv.cvtColor(segmentSrc, segmentSrc, cv.COLOR_RGBA2GRAY);
  cv.threshold(segmentSrc, segmentSrc, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

  // セグメントに分ける
  let segments = [];
  findSegment(segmentSrc, segments);
  let seedContours = new cv.MatVector();
  segments.forEach((segment) => {
    seedContours.push_back(segment.contour);
  });

  // 体のパーツを判定する
  // 最大の面積を持つ輪郭線を取得
  let maxArea = {};
  getMaxArea(outlineContours, maxArea);
  let outlineContour = maxArea.contour;
  
  // 扱いやすさのため、以降は輪郭線を Mat から Array に変換する
  let outlineArray = [];
  for(let i = 0; i < outlineContour.rows; i++ ){
    outlineArray.push(new cv.Point(outlineContour.data32S[i * 2], outlineContour.data32S[i * 2 + 1]));
  }

  // 輪郭線をボーン名に応じた箇所で切り分ける
  // ボーン名と切り分けた輪郭線が対応したオブジェクトを格納する配列の初期化
  let boneNamedPoints = [];
  separateBody(outlineContour, segments, outlineArray, boneNamedPoints);

  let boneId = [
    "hips", 
    "spine", 
    "chest", 
    "chest.Upper", 
    "collarbone.L", 
    "upperArm.L", 
    "lowerArm.L", 
    "hand.L",
    "hand.L_end",
    "indexProximal.L", 
    "indexIntermediate.L", 
    "indexDistal.L", 
    "indexDistal.L_end", 
    "middleProximal.L", 
    "middleIntermediate.L", 
    "middleDistal.L", 
    "middleDistal.L_end", 
    "thumbProximal.L", 
    "thumbIntermediate.L", 
    "thumbDistal.L", 
    "thumbDistal.L_end", 
    "collarbone.R", 
    "upperArm.R", 
    "lowerArm.R", 
    "hand.R", 
    "hand.R_end",
    "indexProximal.R", 
    "indexIntermediate.R", 
    "indexDistal.R", 
    "indexDistal.R_end", 
    "middleProximal.R", 
    "middleIntermediate.R", 
    "middleDistal.R", 
    "middleDistal.R_end", 
    "thumbProximal.R", 
    "thumbIntermediate.R", 
    "thumbDistal.R", 
    "thumbDistal.R_end", 
    "neck", 
    "head", 
    "head_end", 
    "eye.L", 
    "eye.L_end", 
    "eye.R", 
    "eye.R_end", 
    "jaw", 
    "jaw_end", 
    "upperLeg.L", 
    "lowerLeg.L", 
    "foot.L", 
    "foot.L_end", 
    "toe.L", 
    "toe.L_end", 
    "upperLeg.R", 
    "lowerLeg.R", 
    "foot.R", 
    "foot.R_end", 
    "toe.R", 
    "toe.R_end"]
  
  let boneHierarchy = [
    "hips", [
      "chest", [
        "neck", [
          "head"
        ]
      ], [
        "collarbone.L", [
          "upperArm.L", [
            "lowerArm.L", [
              "hand.L"
            ]
          ]
        ]
      ], [
        "collarbone.R", [
          "upperArm.R", [
            "lowerArm.R", [
              "hand.R"
            ]
          ]
        ]
      ]
    ], [
      "upperLeg.L", [
        "lowerLeg.L", [
          "foot.L"
        ]
      ]
    ], [
      "upperLeg.R", [
        "lowerLeg.R", [
          "foot.R"
        ]
      ]
    ]
  ]

  // パーツの輪郭ごとに三角分割して一つの配列にまとめる
  // 三角形をまとめた配列の初期化
  let triangles = [];
  makeTriangles(outlineArray, boneNamedPoints, triangles);

  // アーマチュアを作成する
  // アーマチュアを格納する配列の初期化
  let armature = new Array(boneId.length);
  makeArmature(boneNamedPoints, boneHierarchy, boneId, armature);

  // 輪郭の頂点にボーンウェイトを行う
  // 各頂点と関連するパーツ名の配列の初期化
  let boneIdOnVertices = new Array(outlineArray.length).fill().map(i => []);
  let boneWeightOnVertices = new Array(outlineArray.length).fill().map(i => []);
  boneWeight(outlineArray, boneHierarchy, boneNamedPoints, boneId, boneIdOnVertices, boneWeightOnVertices);

  console.log("armature", armature);
  console.log("boneId", boneId);
  console.log("boneIdOnVertices", boneIdOnVertices);
  console.log("boneWeightOnVertices", boneWeightOnVertices);
  
  // boneNamesOnVertices.forEach((boneNamesOnVertex, index) => {
  //   if(boneNamesOnVertex.length == 0){
  //     cv.circle(dst, outlineArray[index], 3, new cv.Scalar(255, 0, 0), -1);
  //   }
  // });
  // cv.imshow('output14', dst);

  // console.log("boneNamesOnVertices", boneNamesOnVertices);
  // console.log("boneNamedPoints", boneNamedPoints);
  // console.log("outlineArray", outlineArray);

  // let leftLegContour = new cv.Mat();
  // let rightLegContour = new cv.Mat();
  // let leftUpperLegContour = new cv.Mat();
  // let leftLowerLegContour = new cv.Mat();
  // let leftFootContour = new cv.Mat();
  // let rightUpperLegContour = new cv.Mat();
  // let rightLowerLegContour = new cv.Mat();
  // let rightFootContour = new cv.Mat();
  // let leftArmContour = new cv.Mat();
  // let leftUpperArmContour = new cv.Mat();
  // let leftLowerArmContour = new cv.Mat();
  // let leftHandContour = new cv.Mat();
  // let rightArmContour = new cv.Mat();
  // let rightUpperArmContour = new cv.Mat();
  // let rightLowerArmContour = new cv.Mat();
  // let rightHandContour = new cv.Mat();
  // let headContour = new cv.Mat();
  // let neckContour = new cv.Mat();
  // let bodyContour = new cv.Mat();
  // let chestContour = new cv.Mat();
  // let hipsContour = new cv.Mat();

  // contourFromArray(leftLeg.array, leftLegContour);
  // contourFromArray(leftUpperLeg.array, leftUpperLegContour);
  // contourFromArray(leftLowerLeg.array, leftLowerLegContour);
  // contourFromArray(leftFoot.array, leftFootContour);
  // contourFromArray(rightLeg.array, rightLegContour);
  // contourFromArray(rightUpperLeg.array, rightUpperLegContour);
  // contourFromArray(rightLowerLeg.array, rightLowerLegContour);
  // contourFromArray(rightFoot.array, rightFootContour);
  // contourFromArray(leftArm.array, leftArmContour);
  // contourFromArray(leftUpperArm.array, leftUpperArmContour);
  // contourFromArray(leftLowerArm.array, leftLowerArmContour);
  // contourFromArray(leftHand.array, leftHandContour);
  // contourFromArray(rightArm.array, rightArmContour);
  // contourFromArray(rightUpperArm.array, rightUpperArmContour);
  // contourFromArray(rightLowerArm.array, rightLowerArmContour);
  // contourFromArray(rightHand.array, rightHandContour);
  // contourFromArray(neck.array, neckContour);
  // contourFromArray(head.array, headContour);
  // contourFromArray(body.array, bodyContour);
  // contourFromArray(chest.array, chestContour);
  // contourFromArray(hips.array, hipsContour);

  // let separatedContours = new cv.MatVector();
  // // separatedContours.push_back(leftLegContour);
  // // separatedContours.push_back(rightLegContour);
  // // separatedContours.push_back(leftArmContour);
  // // separatedContours.push_back(rightArmContour);
  // separatedContours.push_back(bodyContour);
  // // separatedContours.push_back(leftUpperLegContour);
  // // separatedContours.push_back(leftLowerLegContour);
  // // separatedContours.push_back(leftFootContour);
  // // separatedContours.push_back(rightUpperLegContour);
  // // separatedContours.push_back(rightLowerLegContour);
  // // separatedContours.push_back(rightFootContour);
  // // separatedContours.push_back(leftUpperArmContour);
  // // separatedContours.push_back(leftLowerArmContour);
  // // separatedContours.push_back(leftHandContour);
  // // separatedContours.push_back(rightUpperArmContour);
  // // separatedContours.push_back(rightLowerArmContour);
  // // separatedContours.push_back(rightHandContour);
  // // separatedContours.push_back(headContour);
  // // separatedContours.push_back(neckContour);
  // // separatedContours.push_back(chestContour);
  // separatedContours.push_back(hipsContour);

  // cv.drawContours(dst, separatedContours, -1, new cv.Scalar(200, 255, 255), 1, cv.LINE_8);
  // cv.imshow('output15', dst);

  // armature.forEach(boneRoot => {
  //   cv.circle(dst, boneRoot, 3, new cv.Scalar(255, 0, 255), -1);
  // });
  // cv.imshow('output16', dst);

  // let outputId = 16;
  // boneId.forEach((markedBoneName, boneName_i) => {
  //   let nameExist = false;
  //   let clone = dst.clone();
  //   boneWeightOnVertices.forEach((boneWeights, index) => {
  //     let boneNames = boneIdOnVertices[index].map(id => boneId[id]);
  //     // let markedBoneName = "upperLeg.L";
  //     let markedBoneId;
  //     if(boneNames.includes(markedBoneName)){
  //       nameExist = true;
  //       markedBoneId = boneNames.indexOf(markedBoneName);
  //       cv.circle(clone, outlineArray[index], 3, new cv.Scalar(255 * boneWeights[markedBoneId], 255 * boneWeights[markedBoneId], 0), -1);
  //     }
  //   });
  //   if(nameExist){
  //     outputId += 1;
  //     let outputIdStr = 'output' + outputId;
  //     let boneNameP = document.createElement('p');
  //     boneNameP.textContent = markedBoneName;
  //     document.getElementById(outputIdStr).before(boneNameP);
  //     cv.imshow(outputIdStr, clone);
  //   }
  // });

  outlineContour.delete;

  // separatedContours.delete;
  // leftLegContour.delete;
  // leftLowerLegContour.delete;
  // leftUpperLegContour.delete;
  // leftFootContour.delete;
  // rightLegContour.delete;
  // rightLowerLegContour.delete;
  // rightUpperLegContour.delete;
  // rightFootContour.delete;
  // leftArmContour.delete;
  // leftLowerArmContour.delete;
  // leftUpperArmContour.delete;
  // leftHandContour.delete;
  // rightArmContour.delete;
  // rightLowerArmContour.delete;
  // rightUpperArmContour.delete;
  // rightHandContour.delete;
  // headContour.delete;
  // neckContour.delete;
  // bodyContour.delete;
  // chestContour.delete;
  // hipsContour.delete;

  segmentSrc.delete;
  src.delete;

  return {vertices: outlineArray, triangles: triangles, armature: armature, boneIdOnVertices: boneIdOnVertices, boneWeightOnVertices: boneWeightOnVertices};
}

// 複数の輪郭線（MatVector）から最も面積の大きな輪郭線（Mat）を探す
const getMaxArea = (contours, maxAreaObject) => {
  let contourAreas = [];
  for(let i = 0; i < contours.size(); ++i) {
    contourAreas.push(cv.contourArea(contours.get(i)));
  }
  maxAreaObject.area = Math.max.apply(null, contourAreas);
  maxAreaObject.contour = contours.get(contourAreas.indexOf(maxAreaObject.area));
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

export default makeMesh;