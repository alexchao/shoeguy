class TextInput extends React.Component {

    constructor(props) {
        super(props);
    }

    handleChange(e) {
        this.props.handleChange(e.target.value);
    }

    render() {
        return (
            <form>
                <input
                 onChange={(e) => {this.handleChange(e)}}
                 />
            </form>
        );
    }

}


const makeSubChunk = function(s) {
    return { type: 'subtraction', value: s };
};

const makeAddChunk = function(s) {
    return { type: 'addition', value: s };
};

const makeSharedChunk = function(s) {
    return { type: 'shared', value: s };
};


const computeMatrixAndOverlaps = function(a, b) {
    let m = new Array(a.length);
    for (var i = 0; i < m.length; i++) {
        m[i] = new Array(b.length);
    }

    let overlapBlocks = [];

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
                if ((x === 0 || y === 0) || (a[x - 1] !== b[y - 1])) {
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

    return {
        matrix: m,
        overlaps: overlapBlocks
    };
};


const makeOverlapId = function(x, y) {
    return x + '-' + y;
};


const overlapsHaveConflict = function(a, b) {
    if (a.aIndex >= b.aIndex && a.bIndex <= b.bIndex) {
        return true;
    }
    
    if (a.aIndex <= b.aIndex && a.bIndex >= b.bIndex) {
        return true;
    }

    return false;
};


const reduceOverlaps = function(overlaps) {
    const idToOverlap = {};
    overlaps.forEach(function(o) {
        idToOverlap[o.id] = o;
    });

    let worstId = computeWorstOverlapId(overlaps);
    let newOverlaps = overlaps;
    while (!!worstId) {
        delete idToOverlap[worstId];
        newOverlaps = Object.keys(idToOverlap).map(function(id) {
            return idToOverlap[id];
        });
        worstId = computeWorstOverlapId(newOverlaps);
    }

    return newOverlaps;
};


const computeWorstOverlapId = function(overlaps) {
    const scores = {};
    overlaps.forEach(function(o) {
        scores[o.id] = 0;
    });
    const queue = overlaps.slice();
    let o;
    let max = -1;
    let maxId;
    while (queue.length > 0) {
        o = queue.shift();
        queue.forEach(function(p) {
            if (overlapsHaveConflict(o, p)) {
                scores[o.id] += p.length;
                scores[p.id] += o.length;
                [o.id, p.id].forEach(function(q) {
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


const makeDiffString = function(a, b) {

    const results = computeMatrixAndOverlaps(a, b);
    const bestOverlaps = reduceOverlaps(results.overlaps);

    // assign overlaps to columns
    const overlapsByColumn = new Array(a.length);
    const overlapsByRow = new Array(b.length);
    bestOverlaps.forEach(function(o) {
        if (overlapsByColumn[o.aIndex]) {
            throw 'Column already has an assigned overlap';
        }
        overlapsByColumn[o.aIndex] = o;

        if (overlapsByRow[o.bIndex]) {
            throw 'Row already has an assigned overlap';
        }
        overlapsByRow[o.bIndex] = o;
    });

    let aCursor = 0;
    let bCursor = 0;
    const diffChunks = [];

    while (aCursor < a.length && bCursor < b.length) {
        let oIndex = aCursor;
        while (oIndex < a.length && !overlapsByColumn[oIndex]) {
            oIndex++;
        }

        if (oIndex !== aCursor) {
            // add subtraction chunk and advance
            diffChunks.push(
                makeSubChunk(a.substr(aCursor, oIndex - aCursor)));
            aCursor = oIndex;
        } else {
            let overlap = overlapsByColumn[oIndex];

            if (overlap.bIndex !== bCursor) {
                diffChunks.push(
                    makeAddChunk(b.substr(bCursor, overlap.bIndex - bCursor)));
                bCursor = overlap.bIndex;
            }

            // walk an overlap block until exhausted or another overlap is
            // encountered. start one character in, since the first character
            // should never have another overlap in the same row or column
            let oLength = overlap.length - 1;
            let x = overlap.aIndex + 1;
            let y = overlap.bIndex + 1;
            while (oLength > 0 && !overlapsByColumn[x] && !overlapsByRow[y]) {
                oLength--;
                x++;
                y++;
            }
            let chunkLength = x - aCursor;
            diffChunks.push(
                makeSharedChunk(a.substr(aCursor, chunkLength)));
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


class TextDisplay extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let textElements = this.props.diffChunks.map(function(c) {
            let className = 'chunk-' + c.type;
            return (
                <span className={className}>{c.value}</span>
            );
        });
        return (<div className="text-display">{textElements}</div>);
    }

}


class TextCorrectionWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sourceText: '',
            correctedText: '',
            diffChunks: []
        };
    }

    handleSourceChange(v) {
        this.handleChange({ sourceText: v });
    }

    handleCorrectedChange(v) {
        this.handleChange({ correctedText: v });
    }

    handleChange(changeMap) {
        if (typeof this.timeoutId !== 'undefined') {
            window.clearTimeout(this.timeoutId);
        }
        this.setState(changeMap);
        this.timeoutId = window.setTimeout(
            this.updateDiffText.bind(this),
            1000);
    }

    updateDiffText() {
        let diffChunks = makeDiffString(
            this.state.sourceText,
            this.state.correctedText);
        this.setState({ diffChunks: diffChunks });
    }

    render() {
        return (
            <div>
                <div className="text-input">
                    <p>Source</p>
                    <TextInput handleChange={this.handleSourceChange.bind(this)} />
                </div>
                <div className="text-input">
                    <p>Corrected</p>
                    <TextInput handleChange={this.handleCorrectedChange.bind(this)} />
                </div>
                <TextDisplay diffChunks={this.state.diffChunks} />
            </div>
        );
    }

}


ReactDOM.render(<TextCorrectionWidget />, document.getElementById('shoeguy-container'));
