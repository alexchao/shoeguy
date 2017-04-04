class TextInput extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.inputEl.focus();
    }

    render() {
        return (
            <form>
                <input
                 ref={(inputEl) => { this.inputEl = inputEl; }}
                 />
            </form>
        );
    }

}


class TextCorrectionWidget extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {
        return (<div><TextInput /></div>);
    }

}


ReactDOM.render(<TextCorrectionWidget />, document.getElementById('shoeguy-container'));
