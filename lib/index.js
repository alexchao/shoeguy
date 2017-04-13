'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextInput = function (_React$Component) {
    _inherits(TextInput, _React$Component);

    function TextInput(props) {
        _classCallCheck(this, TextInput);

        return _possibleConstructorReturn(this, (TextInput.__proto__ || Object.getPrototypeOf(TextInput)).call(this, props));
    }

    _createClass(TextInput, [{
        key: 'handleChange',
        value: function handleChange(e) {
            this.props.handleChange(e.target.value);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(
                'form',
                null,
                React.createElement('input', {
                    onChange: function onChange(e) {
                        _this2.handleChange(e);
                    }
                })
            );
        }
    }]);

    return TextInput;
}(React.Component);

var TextDisplay = function (_React$Component2) {
    _inherits(TextDisplay, _React$Component2);

    function TextDisplay(props) {
        _classCallCheck(this, TextDisplay);

        return _possibleConstructorReturn(this, (TextDisplay.__proto__ || Object.getPrototypeOf(TextDisplay)).call(this, props));
    }

    _createClass(TextDisplay, [{
        key: 'render',
        value: function render() {
            var textElements = this.props.diffChunks.map(function (c) {
                var className = 'chunk-' + c.type;
                return React.createElement(
                    'span',
                    { className: className },
                    c.value
                );
            });
            return React.createElement(
                'div',
                { className: 'text-display' },
                textElements
            );
        }
    }]);

    return TextDisplay;
}(React.Component);

var TextCorrectionWidget = function (_React$Component3) {
    _inherits(TextCorrectionWidget, _React$Component3);

    function TextCorrectionWidget(props) {
        _classCallCheck(this, TextCorrectionWidget);

        var _this4 = _possibleConstructorReturn(this, (TextCorrectionWidget.__proto__ || Object.getPrototypeOf(TextCorrectionWidget)).call(this, props));

        _this4.state = {
            sourceText: '',
            correctedText: '',
            diffChunks: []
        };
        return _this4;
    }

    _createClass(TextCorrectionWidget, [{
        key: 'handleSourceChange',
        value: function handleSourceChange(v) {
            this.handleChange({ sourceText: v });
        }
    }, {
        key: 'handleCorrectedChange',
        value: function handleCorrectedChange(v) {
            this.handleChange({ correctedText: v });
        }
    }, {
        key: 'handleChange',
        value: function handleChange(changeMap) {
            if (typeof this.timeoutId !== 'undefined') {
                window.clearTimeout(this.timeoutId);
            }
            this.setState(changeMap);
            this.timeoutId = window.setTimeout(this.updateDiffText.bind(this), 1000);
        }
    }, {
        key: 'updateDiffText',
        value: function updateDiffText() {
            var diffChunks = ShoeGuy.diff(this.state.sourceText, this.state.correctedText);
            this.setState({ diffChunks: diffChunks });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'text-input' },
                    React.createElement(
                        'p',
                        null,
                        'Source'
                    ),
                    React.createElement(TextInput, { handleChange: this.handleSourceChange.bind(this) })
                ),
                React.createElement(
                    'div',
                    { className: 'text-input' },
                    React.createElement(
                        'p',
                        null,
                        'Corrected'
                    ),
                    React.createElement(TextInput, { handleChange: this.handleCorrectedChange.bind(this) })
                ),
                React.createElement(TextDisplay, { diffChunks: this.state.diffChunks })
            );
        }
    }]);

    return TextCorrectionWidget;
}(React.Component);

ReactDOM.render(React.createElement(TextCorrectionWidget, null), document.getElementById('shoeguy-container'));
'use strict';

var ShoeGuy = function () {

    var makeSubChunk = function makeSubChunk(s) {
        return { type: 'subtraction', value: s };
    };

    var makeAddChunk = function makeAddChunk(s) {
        return { type: 'addition', value: s };
    };

    var makeSharedChunk = function makeSharedChunk(s) {
        return { type: 'shared', value: s };
    };

    var computeOverlaps = function computeOverlaps(a, b) {
        var m = new Array(a.length);
        for (var i = 0; i < m.length; i++) {
            m[i] = new Array(b.length);
        }

        var overlapBlocks = [];

        // fill matrix
        // 1 if characters match, 0 if not
        for (var x = a.length - 1; x >= 0; x--) {
            for (var y = b.length - 1; y >= 0; y--) {
                if (a[x] === b[y]) {
                    if (x < a.length - 1 && y < b.length - 1 && m[x + 1][y + 1] > 0) {
                        m[x][y] = m[x + 1][y + 1] + 1;
                    } else {
                        m[x][y] = 1;
                    }

                    // check if this is the tip of an overlapping block
                    if (x === 0 || y === 0 || a[x - 1] !== b[y - 1]) {
                        overlapBlocks.push({
                            id: makeOverlapId(x, y),
                            aIndex: x,
                            bIndex: y,
                            length: m[x][y]
                        });
                    }
                } else {
                    m[x][y] = 0;
                }
            }
        }

        // remove overlaps that are just 1-character long. these usually
        // don't represent intentional preservations of the original string,
        // unless the strings are very short.
        return overlapBlocks.filter(function (o) {
            return o.length > 1;
        });
    };

    var makeOverlapId = function makeOverlapId(x, y) {
        return x + '-' + y;
    };

    var overlapsHaveConflict = function overlapsHaveConflict(a, b) {
        if (a.aIndex >= b.aIndex && a.bIndex <= b.bIndex) {
            return true;
        }

        if (a.aIndex <= b.aIndex && a.bIndex >= b.bIndex) {
            return true;
        }

        return false;
    };

    var reduceOverlaps = function reduceOverlaps(overlaps) {
        var idToOverlap = {};
        overlaps.forEach(function (o) {
            idToOverlap[o.id] = o;
        });

        var worstId = computeWorstOverlapId(overlaps);
        var newOverlaps = overlaps;
        while (!!worstId) {
            delete idToOverlap[worstId];
            newOverlaps = Object.keys(idToOverlap).map(function (id) {
                return idToOverlap[id];
            });
            worstId = computeWorstOverlapId(newOverlaps);
        }

        return newOverlaps;
    };

    var computeWorstOverlapId = function computeWorstOverlapId(overlaps) {
        var scores = {};
        overlaps.forEach(function (o) {
            scores[o.id] = 0;
        });
        var queue = overlaps.slice();
        var o = void 0;
        var max = -1;
        var maxId = void 0;
        while (queue.length > 0) {
            o = queue.shift();
            queue.forEach(function (p) {
                if (overlapsHaveConflict(o, p)) {
                    scores[o.id] += p.length;
                    scores[p.id] += o.length;
                    [o.id, p.id].forEach(function (q) {
                        if (scores[q] > max) {
                            max = scores[q];
                            maxId = q;
                        }
                    });
                }
            });
        }
        return maxId;
    };

    var makeDiffString = function makeDiffString(a, b) {

        var overlaps = computeOverlaps(a, b);
        var bestOverlaps = reduceOverlaps(overlaps);

        // assign overlaps to columns
        var overlapsByColumn = new Array(a.length);
        var overlapsByRow = new Array(b.length);
        bestOverlaps.forEach(function (o) {
            if (overlapsByColumn[o.aIndex]) {
                throw 'Column already has an assigned overlap';
            }
            overlapsByColumn[o.aIndex] = o;

            if (overlapsByRow[o.bIndex]) {
                throw 'Row already has an assigned overlap';
            }
            overlapsByRow[o.bIndex] = o;
        });

        var aCursor = 0;
        var bCursor = 0;
        var diffChunks = [];

        while (aCursor < a.length && bCursor < b.length) {
            var oIndex = aCursor;
            while (oIndex < a.length && !overlapsByColumn[oIndex]) {
                oIndex++;
            }

            if (oIndex !== aCursor) {
                // add subtraction chunk and advance
                diffChunks.push(makeSubChunk(a.substr(aCursor, oIndex - aCursor)));
                aCursor = oIndex;
            } else {
                var overlap = overlapsByColumn[oIndex];

                if (overlap.bIndex !== bCursor) {
                    diffChunks.push(makeAddChunk(b.substr(bCursor, overlap.bIndex - bCursor)));
                    bCursor = overlap.bIndex;
                }

                // walk an overlap block until exhausted or another overlap is
                // encountered. start one character in, since the first character
                // should never have another overlap in the same row or column.
                // skip new overlaps if they aren't longer than the current one.
                var oLength = overlap.length - 1;
                var x = overlap.aIndex + 1;
                var y = overlap.bIndex + 1;
                var foundNewOverlap = false;
                while (oLength > 0 && !foundNewOverlap) {
                    var cOverlap = overlapsByColumn[x];
                    if (cOverlap && cOverlap.length > oLength && cOverlap.bIndex > y) {
                        foundNewOverlap = true;
                    }

                    var rOverlap = overlapsByRow[y];
                    if (rOverlap && rOverlap.length > oLength && rOverlap.aIndex > x) {
                        foundNewOverlap = true;
                    }

                    if (!foundNewOverlap) {
                        oLength--;
                        x++;
                        y++;
                    }
                }
                var chunkLength = x - aCursor;
                diffChunks.push(makeSharedChunk(a.substr(aCursor, chunkLength)));
                aCursor += chunkLength;
                bCursor += chunkLength;
            }
        }

        if (aCursor < a.length) {
            diffChunks.push(makeSubChunk(a.substr(aCursor)));
        }

        if (bCursor < b.length) {
            diffChunks.push(makeAddChunk(b.substr(bCursor)));
        }

        return diffChunks;
    };

    return {
        diff: makeDiffString
    };
}();
