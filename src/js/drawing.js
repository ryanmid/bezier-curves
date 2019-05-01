/**
 * Clear and fill a canvas with the specified color
 * @param ctx - The drawing context
 * @param width - The width of the canvas
 * @param height - The height of the canvas
 * @param color - The color with which to paint over the canvas
 */
function clearCanvas(ctx, width, height, color) {
    ctx.fillStyle = color;
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);
}

/**
 * Draw a line from (startX,startY) to (endX,endY)
 * @param ctx - The drawing context
 * @param startX - The x-coordinate of the starting point
 * @param startY - The y-coordinate of the starting point
 * @param endX - The x-coordinate of the ending point
 * @param endY - The y-coordinate of the ending point
 * @param width - The width of the line to draw
 * @param style - The color to draw the line
 */
function drawLine(ctx, startX, startY, endX, endY, width, style) {
    ctx.lineWidth = width;
    ctx.strokeStyle = style;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();
}

/**
 * Draw a circle at (xPos,yPos)
 * @param ctx - The drawing context
 * @param xPos - The x-coordinate of the center of the circle
 * @param yPos - The y-coordinate of the center of the circle
 * @param radius - The radius of the circle to draw
 * @param borderWidth - The line width of the border to draw
 * @param borderStyle - The color of the border to draw
 * @param fillStyle - The color with which to fill the circle
 */
function drawCircle(ctx, xPos, yPos, radius, borderWidth, borderStyle, fillStyle) {
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderStyle;
    ctx.fillStyle = fillStyle;

    ctx.beginPath();
    ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

/**
 * Draw a rectangle centered at (centerX,centerY)
 * @param ctx - The drawing context
 * @param centerX - The x-coordinate of the center of the rectangle
 * @param centerY - The y-coordinate of the center of the rectangle
 * @param width - The width of the rectangle to draw
 * @param height - The height of the rectangle to draw
 * @param borderWidth - The line width of the border to draw
 * @param borderStyle - The color of the border to draw
 * @param fillStyle - The color with which to fill the rectangle
 */
function drawRectangle(ctx, centerX, centerY, width, height, borderWidth, borderStyle, fillStyle) {
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderStyle;
    ctx.fillStyle = fillStyle;

    ctx.beginPath();
    ctx.rect(centerX - width/2, centerY - height/2, width, height);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}