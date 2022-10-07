// アーマチュアを作成する
const makeArmature = (boneNamedPoints, boneHierarchy, boneId, armature) => {
  let boneName = boneHierarchy[0];
  let bone = boneNamedPoints.find(bone => bone.name == boneName);
  let rootPoint;
  console.log("boneName", boneName);
  // boneNamedPointsにボーン名がある場合
  if(bone){
    rootPoint = bone.points.rootPoints.center;
  }
  // boneNamedPointsにボーン名がない場合（collarboneなど）
  else{
    // ボーン名にcollarboneが含まれる場合、neckと同じ座標を挿入する
    if(boneName.match(/collarbone/)){
      rootPoint = boneNamedPoints.find(bone => bone.name == "neck").points.rootPoints.center;
    }
  }
  let id = boneId.findIndex(name => name == boneName);
  armature[id] = rootPoint;

  // 次の階層がある場合
  if(boneHierarchy.length > 1){
    // 第0要素（ボーン名）を飛ばして、残りについて再起する
    for(let i = 1; i < boneHierarchy.length; ++i){
      makeArmature(boneNamedPoints, boneHierarchy[i], boneId, armature);
    }
  }
  // 次の階層がない場合
  else{
    // _endをつけた先端のボーン名に先端の座標を追加する
    armature[boneId.findIndex(name => name == (boneName + "_end"))] = bone.points.tipPoint;
  }
}

export default makeArmature;