require 'base64'
require 'json'
require 'google/cloud/vision'

class GamesController < ApplicationController

  def index
    @games = Game.all.order(created_at: 'DESC')
    @gameForm = GameForm.new
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

    # Objectをhash化
    objects = []
    game.game_objects.each do |obj|
      object = {symbol: obj.symbol, image: imageToBase64(obj.image)}
      object[:object] = true if obj.object == true
      object[:player] = true if obj.player == true
      objects << object
    end

    # Position, ObjectPositionをhash化
    positions = []
    game.stages.first.positions.each do |pos|
      position = {symbole: pos.object_position.game_object.symbol, h: pos.height, w: pos.width, x: pos.x, y: pos.y}
      positions << position
    end

    hash = { objects: objects, positions: positions}

    puts hash

    render json: hash
  end

  def game_params
    params.require(:game_form).permit(:name, :text, :objects).merge(user_id: current_user.id)
  end

  def url_params
    params.permit(:url)
  end

  def imageToBase64(image)
    return Base64.encode64(image.download)
  end
end