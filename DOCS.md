# Plaython Reference
Plaython is a tiny graphics abstraction. It allows you to draw on a 480x270 screen using Python code.

## Drawing Stuff ##
```python
set_col(red, green, blue)
```
Sets the current colour for drawing. Each argument is provided on a scale from `0` to `255`.

```python
draw_rect(x, y, width, height)
```
Draws a rectangle with the top-left corner at (`x`, `y`) and with dimensions `width`x`height`.

```python
draw_pixel(x, y)
```
Draws a single pixel at the point (`x`, `y`).

```python
draw_text(x, y, font_size, text)
```
Draws the string `text` at (`x`, `y`) with font size `font_size`.

```python
draw_line(x1, y1, x2, y2, thickness)
```
Draws a line from (`x1`, `y1`) to (`x2`, `y2`) with thickness `thickness`.

```python
draw_circle(x, y, radius)
```
Draws a circle centered at (`x`, `y`) with radius `radius`.

## Erasing Stuff ##
```python
erase(x, y, width, height)
```
Erases a rectangle with the top-left corner at (`x`, `y`) and dimensions `width`x`height`. Sort of like the opposite of `draw_rect`.

```python
clear()
```
Clears the screen, if you need to do that for some reason.

## Copying and Pasting Stuff ##
```python
copy_rect(x, y, width, height)
```
Extracts a rectangle from the image with top-left corner at (`x`, `y`) and dimensions `width`x`height`, then returns an integer that refers to that extracted rectangle for use later.

```python
paste_rect(x, y, to_paste)
```
Pastes a rectangle copied earlier and referred to by `to_paste` with top-left corner at (`x`, `y`).

```python
paste_rect(x, y, width, height, to_paste)
```
Pastes a rectangle copied earlier, but stretches the pasted image to fit a rectangle defined by `x`, `y`, `width`, and `height`.

## Other Stuff ##
```python
gl_raw(script)
```
Directly executes a JS script in the context of the CanvasRenderingContext2D used by the output screen.