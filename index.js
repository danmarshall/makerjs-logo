var makerjs = require('makerjs');

var point = makerjs.point;
var path = makerjs.path;
var paths = makerjs.paths;
var Line = paths.Line;
var Parallel = paths.Parallel;
var model = makerjs.model;

function logo(or, ir, ear, outline, mHeight, serifHeight, speed, drop, columnWidth, spacing, step) {

    if (arguments.length == 0) {
        var v = makerjs.kit.getParameterValues(logo);
        or = v.shift();
        ir = v.shift();
        ear = v.shift();
        outline = v.shift();
        mHeight = v.shift();
        serifHeight = v.shift();
        speed = v.shift();
        drop = v.shift();
        columnWidth = v.shift();
        spacing = v.shift();
        step = v.shift();
    }

    function M() {
        this.models = {
            base: {
                paths: {}
            },
            legs: {
                models: {}
            }
        };
    }

    var m_letter = new M();
    var m_outline = new M();
    
    var legModels = m_letter.models.legs.models;
    var outlineModels = m_outline.models.legs.models;

    var far = 100;

    function addLeg(id, leftRef, leftSpace, topRef, topSpace, topPoint, trimToLeftRef, earDistance) {
        var leg = {
            paths: {}
        };

        leg.paths.top = new Parallel(topRef, topSpace, topPoint);
        leg.paths.left = new Parallel(leftRef, leftSpace, [far, 0]);
        leg.paths.serif = new Parallel(leg.paths.top, serifHeight, [0, 0]);
        leg.paths.right = new Parallel(leg.paths.left, columnWidth, [far, 0]);
        leg.paths.ear = new Parallel(leg.paths.left, earDistance, [0, 0]);

        legModels[id] = leg;

        var outleg = {
            paths: {}
        };

        outleg.paths.top = new Parallel(leg.paths.top, outline, [0, far]);
        outleg.paths.left = new Parallel(leg.paths.left, outline, [-far, 0]);
        outleg.paths.serif = new Parallel(leg.paths.serif, outline, [0, 0]);
        outleg.paths.right = new Parallel(leg.paths.right, outline, [far, 0]);
        outleg.paths.ear = new Parallel(leg.paths.ear, outline, [-far, 0]);

        outlineModels[id] = outleg;
    }

    function trimLeg(id) {

        function trimLegPart(leg, innerRadius, outerRadius) {
            trimLines(leg.paths.top, leg.paths.right);
            trimLines(leg.paths.serif, leg.paths.left);
            leg.paths.innerFillet = path.fillet(leg.paths.left, leg.paths.serif, innerRadius);
            leg.paths.outerFillet = path.fillet(leg.paths.top, leg.paths.right, outerRadius);
            trimLines(leg.paths.top, leg.paths.ear, true);
            trimLines(leg.paths.serif, leg.paths.ear, true, true);
        }

        trimLegPart(legModels[id], ir, or);
        trimLegPart(outlineModels[id], ir - outline, or + outline);
    }

    function combineM(m) {
        var legs = m.models.legs;
        model.combine(legs.models['1'], legs.models['2'], false, true, false, true);
        model.combine(legs.models['2'], legs.models['3'], false, true, false, true);
        model.combine(m.models.base, legs, true, false, false, true);
    }

    m_outline.models.base.paths.bottom = new Line([0, 0], [far, 0]);
    m_letter.models.base.paths.bottom = new Parallel(m_outline.models.base.paths.bottom, outline, [0, far]);

    var rotatedLeft = path.rotate(new Line([0, 0], [0, far]), -speed, [0, 0]);
    var rotatedBottom = path.rotate(new Line([-far, outline], [far, outline]), drop, [0, outline]);

    addLeg('1', rotatedLeft, outline, rotatedBottom, mHeight, [0, far], false, ear + ir);
    addLeg('2', legModels['1'].paths.right, spacing, legModels['1'].paths.top, step, [0, 0], true, spacing + columnWidth / 2);
    addLeg('3', legModels['2'].paths.right, spacing, legModels['2'].paths.top, step, [0, 0], true, spacing + columnWidth / 2);

    trimLeg('1', false);
    trimLeg('2', true);
    trimLeg('3', true);

    combineM(m_letter);
    combineM(m_outline);

    this.models = {
        letter: m_letter,
        outline: m_outline
    };

}

function trimLines(line1, line2, useLine1Origin, useLine2Origin) {
    var int = path.slopeIntersectionPoint(line1, line2);
    if (int) {
        line1[useLine1Origin ? 'origin' : 'end'] = int;
        line2[useLine2Origin ? 'origin' : 'end'] = int;
    }
}

logo.metaParameters = [
    { title: "outer radius", type: "range", min: 0, max: 1.7, step: .1, value: 1.06 },
    { title: "inner radius", type: "range", min: 0, max: .9, step: .1, value: .3 },
    { title: "ear", type: "range", min: 0, max: 2, step: .1, value: 1.1 },
    { title: "outline", type: "range", min: 0.2, max: 2, step: .1, value: 1.06 },
    { title: "m height", type: "range", min: 7, max: 20, step: .1, value: 8.3 },
    { title: "serif height", type: "range", min: .1, max: 1.9, step: .1, value: .65 },
    { title: "speed", type: "range", min: 0, max: 45, step: 1, value: 19.01 },
    { title: "drop", type: "range", min: 0, max: 30, step: 1, value: 1 },
    { title: "column width", type: "range", min: .4, max: 5, step: .1, value: 2.59 },
    { title: "spacing", type: "range", min: 1.3, max: 5, step: .1, value: 1.25 },
    { title: "step", type: "range", min: 0, max: 4, step: .1, value: 2.385 },
];

module.exports = logo;
