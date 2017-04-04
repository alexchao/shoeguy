class TextInput extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <form>
                <input
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
