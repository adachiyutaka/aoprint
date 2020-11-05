require 'base64'
require 'json'
require 'google/cloud/vision'

class GamesController < ApplicationController

  def index
    @games = Game.all.order(created_at: 'DESC')
    @game = Game.new

    #gcvテスト
    image_annotator = Google::Cloud::Vision.image_annotator
    image_path = 'public/images/test.jpg'

    response = image_annotator.text_detection(
      image:       image_path,
    )
    
    result = Array.new
    response.responses.each do |res|
      res.text_annotations.each do |text|
        result << text.bounding_poly.vertices[0].x
        result << text.bounding_poly.vertices[0].y
      end
    end
    @result = result

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

  def image
    stageImg = Game.find_by(id: params[:id]).stages[0].image
    playerImg = Game.find_by(id: params[:id]).game_objects[0].image
    image = { stage: imageToBase64(stageImg), player: imageToBase64(playerImg) }
    render json: image
  end

  def game_params
    params.permit(:stage_img, :player_img, :name, :text).merge(user_id: current_user.id)
  end

  def imageToBase64(image)
    return Base64.encode64(image.download)
  end
end