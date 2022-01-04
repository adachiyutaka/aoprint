require 'base64'
require 'json'
require 'google/cloud/vision'

class GamesController < ApplicationController

  def index
    groupe_names = [{column: 'upload', index: 'アップロード'},
                    {column: 'character', index: 'キャラクター'},
                    {column: 'stage', index: 'ステージ'},
                    {column: 'gimmick', index: 'ギミック'},
                    {column: 'background',index: '背景'},
                    {column: 'etc', index: 'その他'}]

    @games = Game.all.order(created_at: 'DESC')
    @gameForm = GameForm.new
    @presetImages = []
    groupe_names.each do |groupe_name|
      images = {groupe: groupe_name, game_objects: PresetGameObject.where(groupe: groupe_name[:column])}
      @presetImages.push(images)
    end
  end

  def load_game_object
    groupe_names = [{column: 'upload', index: 'アップロード'},
                    {column: 'character', index: 'キャラクター'},
                    {column: 'stage', index: 'ステージ'},
                    {column: 'gimmick', index: 'ギミック'},
                    {column: 'background',index: '背景'},
                    {column: 'etc', index: 'その他'}]

    data = []

    # 初回読み込み時の処理
    if params[:gameObject][:init]
      groupe_names.each do |name|
        game_objects = []
        PresetGameObject.where(groupe: name[:column]).limit(5).each do |preset_go|
          go = preset_go.game_object
          base64 = imageToBase64(go.image.image)
          type = image_type(base64)
          base64url = "data:image/" + type + ";base64," + base64
          image = {id: go.image.id, base64url: base64url}
          game_objects.push({symbol: go.symbol, position: {x: 0, y: 0, width: go.image.width, height: go.image.height, image: nil}, name: go.name, text: go.text, image: image, script: nil})
        end
        data.push({name: name, gameObjects: game_objects})
      end
    end

    render json: JSON.generate(data)
  end

  def show
    @game = Game.find_by(id: params[:id])
    @games = Game.all
  end

  def create
    @game = GameForm.new(game_params)
    json = @game.objects
    @game.save
  end

  def read_text
    # gcvテスト
    # image = @games.find_by(id: 1).stages[0].image
    image_annotator = Google::Cloud::Vision.image_annotator
    image_path = 'public/images/test.jpg'
    response = image_annotator.text_detection(
      image: {content: params[:url].replace('data:image/png;base64,', '')}
    )
    
    result = []
    response.responses.each do |res|
      res.text_annotations.each do |annotation|
        text = annotation.description
        vertices = Hash.new
        annotation.bounding_poly.vertices.each do |vertex|
          x = vertex.x
          y = vertex.y
          vertex = {x: x, y: y}
          vertices.merge!(vertex)
        end
        annotation = {text: text, vertices: vertices}
        result << annotation
      end
    end
    json = JSON.generate(result)
    render json: json
  end

  def image
    game = Game.find_by(id: params[:id])
    stage = game.stages.first

    # Stageをhash化
    stage_size = {height: stage.height , width: stage.width}

    # Objectをhash化
    objects = []
    game.game_objects.each do |obj|
      object = {symbol: obj.symbol, image: imageToBase64(obj.image)}
      # key名がupperCamelなのは、C#クラスとの互換のため
      object[:isObject] = true if obj.object == true
      object[:isPlayer] = true if obj.player == true
      object[:isEnemy] = true if obj.enemy == true
      object[:isItem] = true if obj.item == true
      object[:isGoal] = true if obj.goal == true
      objects << object
    end

    # Positionをhash化
    positions = []
    stage.positions.each do |pos|
      positions << {symbol: pos.symbol, height: pos.height, width: pos.width, x: pos.x, y: pos.y}
    end

    # Object-Positionをhash化
    # TODO: 1object対多positionに対応する必要あり
    object_positions = []
    game.game_objects.each do |obj|
      objpos = obj.object_position
      # key名がupperCamelなのは、C#クラスとの互換のため
      object_positions << {objectId: objects.index{|obj| obj[:symbol] == objpos.game_object.symbol}, positionId: positions.index{|pos| pos[:symbol] == objpos.position.symbol}}
    end

    # key名がupperCamelなのは、C#クラスとの互換のため
    hash = {stage: stage_size, objects: objects, positions: positions, objectPositions: object_positions}

    render json: hash
  end

  def game_params
    params.require(:game_form).permit(:name, :text, :objects, :canvas).merge(user_id: current_user.id)
  end

  def url_params
    params.permit(:url)
  end

  def imageToBase64(image)
    return Base64.encode64(image.download)
  end

  def image_type(base64)
    binary_data = Base64.decode64(base64)
    case binary_data
    when /GIF8[79]a/n
      return 'gif'
    when /\x89PNG/n
      return 'png'
    when /\xFF\xD8/n
      return 'jpeg'
    else
      raise "不明な形式の画像です。"
    end
  end

end