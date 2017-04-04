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


class TextCorrectionWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sourceText: '',
            correctedText: '',
            diffText: ''
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
        let newText = this.state.sourceText + ' => ' + this.state.correctedText;
        this.setState({ diffText: newText });
    }

    render() {
        return (
            <div>
                <div><TextInput handleChange={this.handleSourceChange.bind(this)} /></div>
                <div><TextInput handleChange={this.handleCorrectedChange.bind(this)} /></div>
                <p><strong>Corrected</strong>: { this.state.diffText }</p>
            </div>
        );
    }

}


ReactDOM.render(<TextCorrectionWidget />, document.getElementById('shoeguy-container'));
