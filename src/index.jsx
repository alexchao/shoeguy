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
        let diffChunks = ShoeGuy.diff(
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
