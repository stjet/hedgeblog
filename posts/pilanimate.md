PilAnimate is a python library that renders video frame by frame, using PIL.

Documentations are up to date for version 0.4.1. A lot of the library is just a wrapper for PIL, so if you are having trouble it could be useful to reference those if you encounter any issues.

## Why use PilAnimate?

I mostly made PilAnimate for my personal use, and I'm sure there's probably better ones out there, but I made PilAnimate to be fairly simple and easily extendable. It renders frame by frame, meaning that even the most complex tasks can be completed on old computers, albeit slowly.

## Install

```
pip install pilanimate
```

## Animation

**Class**

Creates layers

Parameters:

- layer_num: number of layers
- size (optional=(1600,900)): size in pixels [width,height]
- fps (optional=25): frames per second
- mode (optional="RGBA"): Type and depth of a pixel in the image. See PIL docs.
- color (optional=0): background color to use for the image

Returns: itself

Properties: layers, fps, mode, size

### export

**Function**

Turns frames into video.

Parameters:

- filename (optional="hey"): The name of the output file

Returns: Nothing, creates filename+".avi" video

## Layer

**Class**

Creates layer. A layer is essentially an array of images. When the video is exporting, the layers will be pasted on each other to create an array of frames (layer 0 is at the bottom).

> Warning: Do not create this class yourself, making the Animation class will do it for you.

Parameters:

- size: size in pixels [width,height]
- fps: frames per second
- mode (optional="RGBA"): Type and depth of a pixel in the image
- color (optional=0): background color to use for the image

Returns: itself

Properties: size, img, layer, fps, frames, mode

### createPoint

**Function**

Creates a point at coords

Parameters:

- coords: Coordinates of the point [x,y]
- fill (optional=None): Color of pixel

Returns: nothing

### createLine

**Function**

Creates line, where each array [x,y] inside coords is a point, connected in order.

Parameters:

- coords: Coordinates of line [[x,y],[x,y],[x,y]...]
- fill (optional=None): Color of line
- width (optional=0): Width of line
- joint (optional=None): if 'curve', joint type between the points is curved

Returns: nothing

### createArc

**Function**

Creates arc with starting and ending angles inside the bounding box.

Parameters:

- boundingBox: array consisting of upper left and lower right corners [[x,y],[x,y]]
- startAngle: angle in degreees
- endAngle: angle in degrees
- fill (optional=None): color of arc
- width (optional=0): width of arc line

Returns: nothing

### createEllipse

**Function**

Creates ellipse inside bounding box

Parameters:

- boundingBox: array consisting of upper left and lower right corners [[x,y],[x,y]]
- fill (optional=None): color of ellipse inside
- outline (optional=None): outline color
- width (optional=0): pixel width of outline

Returns: nothing

### createPolygon

**Function**

Creates polygon

Parameters:

- coords: List of points of the polygon outline [[x,y],[x,y],[x,y]...]
- fill (optional=None): color of polygon inside
- outline (optional=None): outline color

Returns: nothing

### createRectangle

**Function**

Creates rectangle

Parameters:

- boundingBox: array consisting of upper left and lower right corners [[x,y],[x,y]]
- fill (optional=None): color of rectangle inside
- outline (optional=None): outline color
- width (optional=1): width of outline

Returns: nothing

### createRoundedRectangle

**Function**

Creates a rounded rectangle

Parameters:

- boundingBox: array consisting of upper left and lower right corners [[x,y],[x,y]]
- radius (optional=0): radius of the rounded corners of the rectangle
- fill (optional=None): color of rectangle inside
- outline (optional=None): outline color
- width (optional=0): width of outline

Returns: nothing

### fillAll

**Function**

Fills entire layer with color

Parameters:

- fill (optional=None): fill of frame
- outline (optional=None): outline color of frame
- width (optional=0): outline line width

Returns: nothing

### createText

**Function**

Creates text at coords to layer. Has a kinds of parameters that can be fiddled with, making it a really powerful function.

Parameters:

- anchorCoords: Anchor coordinates of the text
- text: The text to be added
- fill (optional=None): Fill color of text
- font (optional=None): A Pil ImageFont
- anchor (optional=None): Relative location of anchor to the text.
- spacing (optional=4): Number of pixels between the lines of text
- align (optional='left'): Alignment of lines (center, left, or right)
- direction (optional=None): Direction of text. See PIL docs for more information.
- features (optional=None): OpenType font features. See PIL docs for more information.
- language (optional=None): Language of text. See PIL docs for more information.
- stroke_width (optional=0): Width of stroke
- stroke_fill (optional=None): Fill color of the stroke
- embedded_color (optional=False): True/False to specify if font embedded color glyphs should be used or not

Returns: nothing

### addImage

**Function**

Adds image to layer

Parameters:

- imageToAdd: PIL Image
- coords (optional=None): Coords to put image. Array that is upper left and lower right corner. ((x,y), (x,y))

Returns: nothing

### addGif

**Function**

Adds a gif to the layer (this function also creates frames for you, for the number of frames long the gif is * times_to_repeat frames)

Parameters:

- gif_location: location of the gif in the file system
- times_to_repeat: times to repeat the gif
- coords (optional=None): Coords to put image. Array that is upper left and lower right corner. ((x,y), (x,y))

Returns: nothing, but appends frames

### rotate

**Function**

Rotates layer

Parameters:

- angle: degrees
- center (optional=None): Center of rotation,
- outsideFillColor (optional=None):
- copy (optional=None): a PIL Image. Probably want this to be a copy of the current layer.

Returns: nothing

### translate

**Function**

Move layer

Parameters:

- x: amount of pixels to move horizontally
- y: amount of pixels to move vertically
- img: copy of current layer

Returns: nothing

### changeOpacity

**Function**

Changes opacity (transparency) of the layer, of every non transparent pixel.

Parameters:

- value: new opacity from 0 to 100, where 0 is invisible and 100 is opaque (fully non transparent)

Returns: nothing

### changeEntireOpacity

**Function**

Changes opacity of entire layer, including transparent pixels, so only use this for layers with no transparent parts

Parameters:

- value: new opacity from 0 to 100, where 0 is invisible and 100 is opaque (fully non transparent)

Returns: nothing

### fadeIn

**Function**

Slowly fades in a layer, going from transparent to fully opaque.

Parameters:

- frames: number of frames it should take to become fully opaque

Returns: nothing, but appends frames

### fadeOut

**Function**

Slowly fades out a layer, going from fully opaque to fully transparent.

Parameters:

- frames: number of frames it should take to become fully transparent

Returns: nothing, but appends frames

### transform

**Function**

Transforms layer. This function is very complicated so and frankly I have no clue what most of thse are, so please refer to PIL Docs for more detail.

Parameters:

- size: output size
- method: transformation method, so please refer to PIL Docs
- data (optional=None): According to PIL docs, 'extra data to the transformation method.'
- resample (optional=0): Resampling filter, please refer to PIL Docs
- fill (optional=1): Please refer to PIL Docs
- fillcolor (optional=None): Fill color for area outside transformed image

Returns: nothing

### blur

**Function**

Blurs layer

Parameters: none

Returns: nothing

### clear

**Function**

Clears area of layer, turning it transparent

Parameters:

- coords: Array that is upper left and lower right corner of the area that should be cleared. ((x,y), (x,y))

### clearAll

**Function**

Clears entire layer, turning it transparent

Parameters: none

Returns: nothing

### saveFrame

**Function**

Adds the layer in its current state to the frames array

Parameters: none

Returns: nothing, but appends a frame

### doNothing

**Function**

Adds frames without changing the layer

Parameters:

- frames: number of frames to append

Returns: nothing

### save

**Function**

Save current layer as a file

Parameters:

- filename: file name of current layer

Returns: nothing

### rise

**Function**

Make layer slowly rise

Parameters:

- frames: number of frames the rising should last
- total_rise_amount: amount of pixels it should move up by

Returns: nothing, but appends frames

### descend

**Function**

Make layer slowly descend

Parameters:

- frames: number of frames the descending should last
- total_descend_amount: amount of pixels it should down up by

Returns: nothing, but appends frames

### slide

**Function**

Makes the layer slide to the side

Parameters:

- frames: number of frames the sliding should last
- total_slide_amount: amount of pixels it should go to the side

Returns: nothing, but appends frames

### spin

**Function**

Makes the layer spin

Parameters:

- frames: number of frames the spinning should last
- degrees: amount of degrees to spin
- center: center where the rest of the image should spin around (x,y) coordinates

Returns: nothing, but appends frames

## Example

Here's a basic example that creates a sun rising from the sea:

```
from PilAnimate import Animation, ImageColor, Image
animation = Animation(3)
animation.layers[0].fillAll(fill="SkyBlue")
#sun layer
animation.layers[1].createEllipse(((700,650),(900,850)), fill="yellow")
#ocean layer
animation.layers[2].createRectangle(((0, 500),(1600,900)), fill="Blue", width=0)
animation.layers[0].doNothing(100)
animation.layers[2].doNothing(100)
animation.layers[1].rise(100, -501)
animation.export()
```

## Extend

Example of an extension I made that makes backgrounds:

```
from PilAnimate import Layer
import math
class Background():
  #remember to add params
  def __init__(self, layer, background_image):
    self.background_image = background_image
    self.layer = layer
    self.layer.addImage(self.background_image.copy().crop((0,0,self.layer.size[0],self.layer.size[1])), coords=(0, 0, self.layer.size[0], self.layer.size[1]))
  def pan_down(self, frames, all_the_way=True):
    #speed is pixels per frame
    #(background_image height-layer height)/speed
    #
    amount = (self.background_image.size[1]-self.layer.size[1])/frames
    amount = math.floor(amount)
    for i in range(frames-1):
      self.layer.addImage(self.background_image.copy().crop((0, i*amount, self.background_image.size[0], i*amount+self.layer.size[1])), coords=(0, 0, self.layer.size[0], self.layer.size[1]))
      self.layer.saveFrame()
    if all_the_way:
      self.layer.addImage(self.background_image.copy().crop((0, (self.background_image.size[1]-self.layer.size[1]), self.background_image.size[0], (self.background_image.size[1]-self.layer.size[1])+self.layer.size[1])), coords=(0, 0, self.layer.size[0], self.layer.size[1]))
      self.layer.saveFrame()
```

