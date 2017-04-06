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


// TODO: refactor this beast
const makeDiffString = function(a, b) {

    let m = new Array(a.length);
    for (var i = 0; i < m.length; i++) {
        m[i] = new Array(b.length);
    }

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
            } else {
                m[x][y] = 0;
            }
        }
    }

    var aIndex = 0;
    var bIndex = 0;
    let diffChunks = [];

    var subtractionChunk = '';
    var additionChunk = '';

    while (aIndex < a.length && bIndex < b.length) {

        var matchIndex = -1, k = bIndex;
        while (k < b.length && matchIndex === -1) {
            if (m[aIndex][k] > 1) {
                matchIndex = k;
            }
            k++;
        }

        if (matchIndex === -1) {
            subtractionChunk += a[aIndex];
            aIndex += 1;
        } else {
            if (matchIndex > bIndex) {
                additionChunk = b.substr(bIndex, matchIndex - bIndex);
            }
            // XXX: should this be inside the above if-statement?
            bIndex = matchIndex;

            if (!!subtractionChunk) {
                diffChunks.push(makeSubChunk(subtractionChunk));
                subtractionChunk = '';
            }
            if (!!additionChunk) {
                diffChunks.push(makeAddChunk(additionChunk));
                additionChunk = '';
            }

            var chunkLength = m[aIndex][bIndex];
            diffChunks.push(makeSharedChunk(a.substr(aIndex, chunkLength)));

            aIndex += chunkLength;
            bIndex += chunkLength;
        }
    }

    if (!!subtractionChunk) {
        diffChunks.push(makeSubChunk(subtractionChunk));
    } else if (aIndex < a.length) {
        diffChunks.push(makeSubChunk(a.substr(aIndex)));
    }

    if (bIndex < b.length) {
        diffChunks.push(makeAddChunk(b.substr(bIndex)));
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
        let diffChunks = makeDiffString(this.state.sourceText, this.state.correctedText);
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
