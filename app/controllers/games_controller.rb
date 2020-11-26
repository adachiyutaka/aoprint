require 'base64'
require 'json'
require 'google/cloud/vision'

class GamesController < ApplicationController

  def index
    @games = Game.all.order(created_at: 'DESC')
    @game = Game.new
  end

  def show
    @game = Game.find_by(id: params[:id])
    @games = Game.all
  end

  def create
    @game = GameForm.new(game_params)
    if @game.valid?
      @game.save
      return redirect_to game_path(@game.game)
    else
      render "new"
    end
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
    stageImg = Game.find_by(id: params[:id]).stages[0].image
    playerImg = Game.find_by(id: params[:id]).game_objects.where(player: true)[0].image
    objectImg = Game.find_by(id: params[:id]).game_objects.where(object: true)[0].image
    image = { stage: imageToBase64(stageImg), player: imageToBase64(playerImg), gameObject: imageToBase64(objectImg)}
    render json: image
  end

  def game_params
    params.permit(:stage_img, :player_img, :object_img, :name, :text).merge(user_id: current_user.id)
  end

  def url_params
    params.permit(:url)
  end

  def imageToBase64(image)
    return Base64.encode64(image.download)
  end
end