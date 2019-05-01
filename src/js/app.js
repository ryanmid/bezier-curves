// Requires bezier.js and drawing.js

function App() {
}

App.prototype.constants = {
    colors: {
        CURVE: 'rgba(200, 20, 0, 1.0)',
        CURVE_POINTS: 'rgba(200, 0, 20, 0.3)',
        CURVE_POINTS_CURRENT: 'rgba(200, 0, 20, 1.0)',
        CURVE_POINTS_CURRENT_OUTLINE: 'rgba(0, 0, 0, 1.0)',
        PRIMARY_CONTROL_LINE: 'rgba(0, 0, 0, 1.0)',
        PRIMARY_CONTROL_POINTS: 'rgba(0, 0, 0, 1.0)',
        PRIMARY_CONTROL_POINTS_OUTLINE: 'rgba(0, 0, 0, 1.0)',
        SECONDARY_CONTROL_LINES: 'rgba(0, 200, 20, 1.0)',
        BACKGROUND_COLOR: 'rgba(250, 250, 250, 1.0)'
    },
    CONTROL_POINT_WIDTH_HEIGHT: 10,
    CURVE_POINT_RADIUS: 5,
    RANDOM_POINT_PADDING: 20,
    RANDOM_POINT_SPACING: 50,
    LINE_WIDTH: 3
};

/**
 * Sets the starting values for the app, both environmental references and starting curve data
 * @param window - the browser window object
 */
App.prototype.init = function(window) {
    // Capture the window and canvas elements
    this.window = window;
    this.canvas = document.getElementById('curves');
    this.ctx = this.canvas.getContext('2d');

    // Gather initial values from DOM controls
    this.gatherUserInput();

    // Generate the initial control points
    this.generateControlPoints();

    // Add event listener for handling mouse movement
    this.canvas.addEventListener('mousemove', function(evt) {
        this.mousePosition = this.getMousePos(this.canvas, evt);

        // Handle dragging-and-dropping the control points
        if (this.dragging === true) {
            this.hoveringPoint.x = this.mousePosition.x;
            this.hoveringPoint.y = this.mousePosition.y;
            this.update();
        }

        // Otherwise listen for hovering over the primary control points
        else {
            this.hovering = false;
            for (var point in this.curves[0].controlPoints) {
                if (this.checkPointHover(this.curves[0].controlPoints[point], this.constants.CONTROL_POINT_WIDTH_HEIGHT)) {
                    this.hovering = true;
                    this.hoveringPoint = this.curves[0].controlPoints[point];
                }
            }
            if (this.hovering === true) {
                document.body.style.cursor = 'pointer';
            }
            else {
                document.body.style.cursor = 'auto';
                this.hovering = false;
                this.hoveringPoint = null;
            }
        }
    }.bind(this), false);

    // Add event listener for clicking the mouse down
    this.canvas.addEventListener('mousedown', function(evt) {
        if (this.hovering === true) {
            this.dragging = true;
            document.body.classList.add('unselectable');
        }
    }.bind(this));

    // Add event listener for unclicking the mouse
    this.canvas.addEventListener('mouseup', function(evt) {
        this.dragging = false;
        document.body.classList.remove('unselectable')
    }.bind(this));

    // Add event listener to handle any of the control values changing
    var app = this;
    document.getElementById('stepControl').addEventListener('input', function(evt) {
        app.gatherUserInput();
        app.update();
    }.bind(this));

    // Add a mouse-click listener to the group of curve order radio buttons
    var orderOptions = document.getElementsByName('order-group');
    for (var optionIndex = 0; optionIndex < orderOptions.length; optionIndex++) {
        var option = orderOptions[optionIndex];
        option.addEventListener('click', function(evt) {
            app.gatherUserInput();
            app.generateControlPoints();
            app.update();
        });
    }

    // Add an input listener to the custom curve order value input control
    document.getElementById('custom-order').addEventListener('input', function(evt) {
        app.gatherUserInput();
        app.generateControlPoints();
        app.update();
    });

    // Add an input listener to the slider control
    document.getElementById('tSlider').addEventListener('input', function(evt) {
        app.gatherUserInput();
        app.update();
    });
};

/**
 * Recalculates the curve values and updates the slider based on the other UI values
 */
App.prototype.update = function() {
    this.curves = this.buildCurves();
    document.getElementById('tValue').innerHTML = 't = ' + this.tValue;
    document.getElementById('tSlider').setAttribute('max', this.numSteps);
    this.draw();
};

/**
 * Renders the curve and all curve-related graphical elements in the app
 */
App.prototype.draw = function() {

    // Clear the render area
    clearCanvas(this.ctx, this.canvas.width, this.canvas.height, this.constants.colors.BACKGROUND_COLOR);

    // Draw the curve and all of the control points
    var prevPoint = null;
    for (var step = 0, t = 0, point = null; step < this.numSteps; step++, t = step / (this.numSteps - 1)) {

        // If the current step matches the current slider value
        if (step === parseInt(this.tSliderValue)) {

            // Draw all of the control points for the control curve at the current point
            var subCurve = this.curves[step];
            while (subCurve.controlPoints != null) {
                this.drawControlPoints(
                    subCurve.controlPoints,
                    this.constants.colors.SECONDARY_CONTROL_LINES,
                    false
                );
                subCurve = subCurve.curve;
            }
        }

        // Find the point for the current t
        var curve = this.curves[step];
        for (var curveNum = 0; curveNum < this.orderSelection - 1; ++curveNum) {
            curve = curve.curve;
        }

        // Draw the curve segments
        prevPoint = point;
        point = curve.point;
        if (step > 0) {
            drawLine(this.ctx, prevPoint.x, prevPoint.y, point.x, point.y, this.constants.LINE_WIDTH, this.constants.colors.CURVE);
        }

        // Draw the curve points
        if (step === parseInt(this.tSliderValue)) {
            drawCircle(
                this.ctx,
                point.x,
                point.y,
                this.constants.CURVE_POINT_RADIUS,
                this.constants.LINE_WIDTH,
                this.constants.colors.CURVE_POINTS_CURRENT,
                this.constants.colors.CURVE_POINTS_CURRENT
            );
        }
        else {
            drawCircle(
                this.ctx,
                point.x,
                point.y,
                this.constants.CURVE_POINT_RADIUS,
                this.constants.LINE_WIDTH,
                this.constants.colors.CURVE_POINTS,
                this.constants.colors.CURVE_POINTS
            )
        }
    }

    // Draw the primary curve control points with connecting lines
    this.drawControlPoints(this.curves[0].controlPoints, this.constants.colors.PRIMARY_CONTROL_LINE, true);
};

/**
 * Renders a set of control points connected by a line that runs from each control point to the next control point
 * @param controlPoints - The control points to render
 * @param color - The color of the control points
 * @param primaryPoints - True if the given set of control points are the primary control points for the curve
 */
App.prototype.drawControlPoints = function(controlPoints, color, primaryPoints)
{
    // Iterate through every control point in the given set
    for (var ctrlPoint = 0; ctrlPoint < controlPoints.length; ctrlPoint++) {
        var pt = controlPoints[ctrlPoint];

        // Draw a line segment from the previous point to the current point
        if (ctrlPoint > 0) {
            var prevPt = controlPoints[ctrlPoint-1];
            drawLine(this.ctx, pt.x, pt.y, prevPt.x, prevPt.y, this.constants.LINE_WIDTH, color);
        }

        // Draw a circle representing the current control point
        var fillColor = primaryPoints ? this.constants.colors.PRIMARY_CONTROL_POINTS : this.constants.colors.BACKGROUND_COLOR;
        drawRectangle(
            this.ctx,
            pt.x,
            pt.y,
            this.constants.CONTROL_POINT_WIDTH_HEIGHT,
            this.constants.CONTROL_POINT_WIDTH_HEIGHT,
            this.constants.LINE_WIDTH,
            this.constants.colors.PRIMARY_CONTROL_POINTS_OUTLINE,
            fillColor
        );
    }
};

/**
 * Refreshes the stored user-inputted values to match what is currently in the UI
 */
App.prototype.gatherUserInput = function() {
    // Step control component
    this.numSteps = parseInt(document.getElementById('stepControl').value);

    // Order radio button group
    this.orderSelection = document.querySelector('input[name="order-group"]:checked').value;
    if (this.orderSelection === 'custom')
        this.orderSelection = parseInt(document.getElementById('custom-order').value) + 1;
    else
        this.orderSelection = parseInt(this.orderSelection);

    // Custom-order slider value
    this.tSliderValue = document.getElementById('tSlider').value;
    this.tValue = (this.tSliderValue / this.numSteps);
};

/**
 * Generate the primary control points for the curve based on the currently stored user-inputted values.
 */
App.prototype.generateControlPoints = function() {
    var spacePerPoint = (this.canvas.width / this.orderSelection);
    this.controlPoints = [];
    for (var i = 0; i < this.orderSelection; i++) {
        this.controlPoints.push(
            new Point(
                i * spacePerPoint + (spacePerPoint / 2),
                this.randomInt(this.constants.RANDOM_POINT_PADDING, this.canvas.height - this.constants.RANDOM_POINT_PADDING)
            )
        );
    }
};

/**
 * Method called to recalculate the curve data from the currently stored user-inputted values. This should be called
 * every time any curve-related value is changed
 * @returns {Array}
 */
App.prototype.buildCurves = function() {
    var controlPoints = this.controlPoints;
    var curves = [];

    // Generate the set of curves for each order
    for (var step = 0, t = 0; step < this.numSteps; step++, t = step/(this.numSteps - 1)) {
        curves.push(
            new Curve(controlPoints, t)
        );
    }
    return curves;
};

/**
 * Utility method that returns a random int between min (inclusive) and max (exclusive)
 * @param min - The inclusive lower bound for the random int range
 * @param max - The exclusive upper bound for the random int range
 * @returns {number}
 */
App.prototype.randomInt = function(min, max) {
    return Math.floor(Math.random()*(max-min) + min);
};

/**
 * Return the current mouse position as a Point object
 * @param canvas - The HTML5 canvas element
 * @param evt - The 'mousemove' event
 * @returns {{x: number, y: number}}
 */
App.prototype.getMousePos = function(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor(evt.clientX - rect.left),
        y: Math.floor(evt.clientY - rect.top)
    };
};

/**
 * Check if the current mouse position collides with the given point (with padding)
 * @param point - The point to check the mouse position against
 * @param padding - The padding to use when checking for collision
 * @returns {boolean}
 */
App.prototype.checkPointHover = function(point, padding) {
    if (!point)
        return false;

    return point.x >= this.mousePosition.x - padding && point.x <= this.mousePosition.x + padding &&
        point.y >= this.mousePosition.y - padding && point.y <= this.mousePosition.y + padding;
};

/**
 * Executes the application by initializing all of the app values and event listeners and performing the
 * initial 'update'. Subsequent updates will be performed in response to user-driven events
 * @param window - The browser window object
 */
App.prototype.run = function(window) {
    this.init(window);
    this.update();
};