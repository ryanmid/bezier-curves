/**
 * Creates a new 2-D Point object
 * @param x - The value of the point in the first dimension
 * @param y - The value of the point in the second dimension
 * @constructor
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * Creates a curve object
 * @param controlPoints - The set of control points for the bezier curve
 * @constructor
 */
function Curve(controlPoints, t) {
    if (controlPoints.length === 1) {
        this.point = controlPoints[0];
        this.controlPoints = null;
        this.curve = null;
    }
    else {
        this.point = null;
        this.controlPoints = controlPoints;
        this.curve = new Curve(bezier(controlPoints, t), t);
    }
}

/**
 * A bezier function that evaluates a set of control points at a value t and returns the resulting point or set of control points
 * @param controlPoints - The control points the evaluate
 * @param t - The value at which to evaluate the control points
 * @returns {Array}
 */
function bezier(controlPoints, t) {
    if (controlPoints.length < 2)
        throw "Too few control points provided";

    var points = [];
    for(var i = 0; i < controlPoints.length-1; i++) {
        points.push(
            new Point(t * (controlPoints[i+1].x - controlPoints[i].x) + controlPoints[i].x, t * (controlPoints[i+1].y - controlPoints[i].y) + controlPoints[i].y)
        );
    }
    return points;
}
