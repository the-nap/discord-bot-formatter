"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBattleMap = renderBattleMap;
var topojson_client_1 = require("topojson-client");
var d3_geo_1 = require("d3-geo");
var node_fs_1 = require("node:fs");
var promises_1 = require("node:fs/promises");
var CACHE_PATH = new URL("./cache/map-geo.json", import.meta.url);
var WIDTH = 500;
var HEIGHT = 300;
// Base map scale at prep time
var BASE_ZOOM_MULTIPLIER = 1;
// Per-render focus zoom
var FOCUS_ZOOM = 10;
// Process-lifetime cache
var preparedMapCache = null;
function getMapData() {
    return __awaiter(this, void 0, void 0, function () {
        var cached, res, map, topology, objectName, geo;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!(0, node_fs_1.existsSync)(CACHE_PATH)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, promises_1.readFile)(CACHE_PATH, "utf8")];
                case 1:
                    cached = _g.sent();
                    return [2 /*return*/, JSON.parse(cached)];
                case 2: return [4 /*yield*/, fetch("https://api6.warera.io/trpc/map.getMapData")];
                case 3:
                    res = _g.sent();
                    if (!res.ok) {
                        throw new Error("Failed to fetch map data: ".concat(res.status, " ").concat(res.statusText));
                    }
                    return [4 /*yield*/, res.json()];
                case 4:
                    map = _g.sent();
                    topology = (_e = (_c = (_b = (_a = map === null || map === void 0 ? void 0 : map.result) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.map) !== null && _c !== void 0 ? _c : (_d = map === null || map === void 0 ? void 0 : map.result) === null || _d === void 0 ? void 0 : _d.data) !== null && _e !== void 0 ? _e : map === null || map === void 0 ? void 0 : map.map;
                    if (!topology)
                        throw new Error("Map topology not found");
                    objectName = ((_f = topology.objects) === null || _f === void 0 ? void 0 : _f.regions)
                        ? "regions"
                        : Object.keys(topology.objects || {})[0];
                    if (!objectName)
                        throw new Error("No topology objects found");
                    geo = (0, topojson_client_1.feature)(topology, topology.objects[objectName]);
                    // Cache GeoJSON to skip TopoJSON conversion next runs
                    return [4 /*yield*/, (0, promises_1.writeFile)(CACHE_PATH, JSON.stringify(geo), "utf8")];
                case 5:
                    // Cache GeoJSON to skip TopoJSON conversion next runs
                    _g.sent();
                    return [2 /*return*/, geo];
            }
        });
    });
}
function pointInBbox(_a, _b) {
    var x = _a[0], y = _a[1];
    var _c = _b[0], minX = _c[0], minY = _c[1], _d = _b[1], maxX = _d[0], maxY = _d[1];
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
}
function isValidPoint(point) {
    return (Array.isArray(point) &&
        point.length === 2 &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1]));
}
function findContainingRegionIndex(regions, point) {
    if (!isValidPoint(point))
        return -1;
    for (var _i = 0, regions_1 = regions; _i < regions_1.length; _i++) {
        var _a = regions_1[_i], i = _a.i, feature_1 = _a.feature, bbox = _a.bbox;
        if (!pointInBbox(point, bbox))
            continue;
        if ((0, d3_geo_1.geoContains)(feature_1, point))
            return i;
    }
    return -1;
}
function pointToSegmentDistanceSq(point, a, b) {
    var px = point[0];
    var py = point[1];
    var ax = a[0];
    var ay = a[1];
    var bx = b[0];
    var by = b[1];
    var abx = bx - ax;
    var aby = by - ay;
    var apx = px - ax;
    var apy = py - ay;
    var abLenSq = abx * abx + aby * aby;
    // Degenerate segment
    if (abLenSq === 0) {
        var dx_1 = px - ax;
        var dy_1 = py - ay;
        return dx_1 * dx_1 + dy_1 * dy_1;
    }
    // Project AP onto AB, clamp to segment [0,1]
    var t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));
    var cx = ax + t * abx;
    var cy = ay + t * aby;
    var dx = px - cx;
    var dy = py - cy;
    return dx * dx + dy * dy;
}
function ringDistanceSq(point, ring) {
    if (!Array.isArray(ring) || ring.length < 2)
        return Number.POSITIVE_INFINITY;
    var minDistance = Number.POSITIVE_INFINITY;
    for (var idx = 0; idx < ring.length - 1; idx++) {
        var a = ring[idx];
        var b = ring[idx + 1];
        if (!isValidPoint(a) || !isValidPoint(b))
            continue;
        var d = pointToSegmentDistanceSq(point, a, b);
        if (d < minDistance)
            minDistance = d;
    }
    return minDistance;
}
function polygonDistanceSq(point, polygonCoords) {
    if (!Array.isArray(polygonCoords))
        return Number.POSITIVE_INFINITY;
    var minDistance = Number.POSITIVE_INFINITY;
    for (var _i = 0, polygonCoords_1 = polygonCoords; _i < polygonCoords_1.length; _i++) {
        var ring = polygonCoords_1[_i];
        var d = ringDistanceSq(point, ring);
        if (d < minDistance)
            minDistance = d;
    }
    return minDistance;
}
function featureBorderDistanceSq(feature, point) {
    var _a, _b;
    var type = (_a = feature === null || feature === void 0 ? void 0 : feature.geometry) === null || _a === void 0 ? void 0 : _a.type;
    var coords = (_b = feature === null || feature === void 0 ? void 0 : feature.geometry) === null || _b === void 0 ? void 0 : _b.coordinates;
    if (type === 'Polygon') {
        return polygonDistanceSq(point, coords);
    }
    if (type === 'MultiPolygon' && Array.isArray(coords)) {
        var minDistance = Number.POSITIVE_INFINITY;
        for (var _i = 0, coords_1 = coords; _i < coords_1.length; _i++) {
            var polygonCoords = coords_1[_i];
            var d = polygonDistanceSq(point, polygonCoords);
            if (d < minDistance)
                minDistance = d;
        }
        return minDistance;
    }
    return Number.POSITIVE_INFINITY;
}
function findNearestRegionIndex(regions, point) {
    if (!isValidPoint(point))
        return -1;
    var nearestIndex = -1;
    var nearestDistance = Number.POSITIVE_INFINITY;
    for (var _i = 0, regions_2 = regions; _i < regions_2.length; _i++) {
        var _a = regions_2[_i], i = _a.i, feature_2 = _a.feature, bbox = _a.bbox;
        // Optional quick reject: if bbox is invalid, just skip this optimization
        if (bbox && !pointInBbox(point, bbox)) {
            // don't continue here; nearest-border should still consider non-overlapping bboxes
            // because point is outside all regions by design in fallback case.
        }
        var distance = featureBorderDistanceSq(feature_2, point);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
        }
    }
    return nearestIndex;
}
function resolveRegionIndex(regions, point) {
    var containingIndex = findContainingRegionIndex(regions, point);
    if (containingIndex !== -1)
        return containingIndex;
    return findNearestRegionIndex(regions, point);
}
function prepareMap() {
    return __awaiter(this, void 0, void 0, function () {
        var geo, features, projection, fittedScale, path, regions, openSvg, closeSvg;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (preparedMapCache)
                        return [2 /*return*/, preparedMapCache];
                    return [4 /*yield*/, getMapData()];
                case 1:
                    geo = _b.sent();
                    features = (_a = geo.features) !== null && _a !== void 0 ? _a : [];
                    projection = (0, d3_geo_1.geoMercator)().fitSize([WIDTH, HEIGHT], geo);
                    fittedScale = projection.scale();
                    projection
                        .scale(fittedScale * BASE_ZOOM_MULTIPLIER)
                        .translate([WIDTH / 2, HEIGHT / 2]);
                    path = (0, d3_geo_1.geoPath)(projection);
                    regions = features.map(function (featureItem, i) {
                        var d = path(featureItem) || "";
                        // lon/lat bbox (used for fast prefilter before geoContains)
                        var bbox = (0, d3_geo_1.geoPath)().bounds(featureItem);
                        // centroid in lon/lat, then projected to screen coordinates
                        var centroidLonLat = (0, d3_geo_1.geoCentroid)(featureItem);
                        var centroidXY = projection(centroidLonLat) || [WIDTH / 2, HEIGHT / 2];
                        return {
                            i: i,
                            feature: featureItem,
                            d: d,
                            bbox: bbox,
                            centroidLonLat: centroidLonLat,
                            centroidXY: centroidXY,
                        };
                    });
                    openSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"".concat(WIDTH, "\" height=\"").concat(HEIGHT, "\" viewBox=\"0 0 ").concat(WIDTH, " ").concat(HEIGHT, "\">\n  <rect width=\"100%\" height=\"100%\" fill=\"#0f172a\" />");
                    closeSvg = "</svg>";
                    preparedMapCache = {
                        projection: projection,
                        regions: regions,
                        openSvg: openSvg,
                        closeSvg: closeSvg,
                    };
                    return [2 /*return*/, preparedMapCache];
            }
        });
    });
}
var State = /** @class */ (function () {
    function State(position) {
        this.midPoint = position;
    }
    State.prototype.getMidPoint = function () {
        return this.midPoint;
    };
    return State;
}());
var Single = /** @class */ (function (_super) {
    __extends(Single, _super);
    function Single(positions) {
        return _super.call(this, positions[0]) || this;
    }
    Single.prototype.findHighlighted = function (regions) {
        return [resolveRegionIndex(regions, this.midPoint)];
    };
    Single.prototype.paint = function (regions, highlightedIndex) {
        var paths = regions
            .map(function (_a) {
            var i = _a.i, d = _a.d;
            if (!d)
                return "";
            var fill = i === highlightedIndex[0] ? "#ef4444" : "#1e293b";
            return "<path d=\"".concat(d, "\" fill=\"").concat(fill, "\" />");
        })
            .join("");
        return paths;
    };
    return Single;
}(State));
var Double = /** @class */ (function (_super) {
    __extends(Double, _super);
    function Double(positions) {
        var _this = this;
        var _a = positions[0], lonDef = _a[0], latDef = _a[1];
        var _b = positions[1], lonAtt = _b[0], latAtt = _b[1];
        var position = [(lonDef + lonAtt) / 2, (latDef + latAtt) / 2];
        _this = _super.call(this, position) || this;
        _this.defenderPoint = positions[0];
        _this.attackerPoint = positions[1];
        return _this;
    }
    Double.prototype.findHighlighted = function (regions) {
        return [
            resolveRegionIndex(regions, this.defenderPoint),
            resolveRegionIndex(regions, this.attackerPoint),
        ];
    };
    Double.prototype.paint = function (regions, highlightedIndex) {
        var paths = regions
            .map(function (_a) {
            var i = _a.i, d = _a.d;
            if (!d)
                return "";
            var fill = i === highlightedIndex[0] ? "#ef4444" :
                i === highlightedIndex[1] ? "#22c55e" :
                    "#1e293b";
            return "<path d=\"".concat(d, "\" fill=\"").concat(fill, "\" />");
        })
            .join("");
        return paths;
    };
    return Double;
}(State));
function renderBattleMap(positions) {
    return __awaiter(this, void 0, void 0, function () {
        var state, _a, projection, regions, openSvg, closeSvg, battlePoint, highlightedIndex, targetXY, highlightedTargets, _b, x, y, tx, ty, transform, strokeWidth, paths, svg;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (positions.length > 1) {
                        state = new Double(positions);
                    }
                    else {
                        state = new Single(positions);
                    }
                    return [4 /*yield*/, prepareMap()];
                case 1:
                    _a = _c.sent(), projection = _a.projection, regions = _a.regions, openSvg = _a.openSvg, closeSvg = _a.closeSvg;
                    battlePoint = state.getMidPoint();
                    highlightedIndex = state.findHighlighted(regions);
                    targetXY = projection(battlePoint) || [WIDTH / 2, HEIGHT / 2];
                    highlightedTargets = highlightedIndex
                        .map(function (i) { var _a; return (_a = regions[i]) === null || _a === void 0 ? void 0 : _a.centroidXY; })
                        .filter(function (point) { return point && Number.isFinite(point[0]) && Number.isFinite(point[1]); });
                    if (highlightedTargets.length > 0) {
                        _b = highlightedTargets.reduce(function (_a, _b) {
                            var sumX = _a[0], sumY = _a[1];
                            var px = _b[0], py = _b[1];
                            return [sumX + px, sumY + py];
                        }, [0, 0]), x = _b[0], y = _b[1];
                        targetXY = [x / highlightedTargets.length, y / highlightedTargets.length];
                    }
                    tx = targetXY[0], ty = targetXY[1];
                    transform = "translate(".concat(WIDTH / 2, " ").concat(HEIGHT / 2, ") scale(").concat(FOCUS_ZOOM, ") translate(").concat(-tx, " ").concat(-ty, ")");
                    strokeWidth = (0.6 / FOCUS_ZOOM).toFixed(4);
                    paths = state.paint(regions, highlightedIndex);
                    svg = "".concat(openSvg, "\n  <g transform=\"").concat(transform, "\" stroke=\"#94a3b8\" stroke-width=\"").concat(strokeWidth, "\">\n    ").concat(paths, "\n  </g>\n").concat(closeSvg);
                    return [2 /*return*/, svg];
            }
        });
    });
}
