'use strict';

export default class FilterCustom extends React.Component {
    static defaultProps = {
        minAlias: 'ea',
        maxAlias: 'sa',
        alias: 'ip',
        handleSetFilter: null,
        allfilter: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            customBtnShow: false,
            ...this.props2State(props)
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.props2State(nextProps));
    }

    props2State(props){
        return {
            minval: props.allfilter[props.minAlias] || '',
            maxval: props.allfilter[props.maxAlias] || '',
            minAlias: props.minAlias,
            maxAlias: props.maxAlias,
            alias: props.alias,
            maxLength: props.alias == 'ip' ? 5 : 4
        }
    }

    onSaChange(evt) {
        const value = evt.target.value;
        this.setState({
            minval: value
        });
    }

    onEaChange(evt) {
        const value = evt.target.value;
        this.setState({
            maxval: value
        });
    }

    onSaEaBlur(type, alias) {
        let value = this.state[type];
        let data = {};

        if (!global.isNum(value) || (value != 0 && parseInt(value) == 0)) {
            data[alias] = '';
        }

        let minval = parseInt(this.state.minval) || 0;
        let maxval = parseInt(this.state.maxval) || 0;

        if (maxval && minval && minval > maxval) {
            if(alias == this.state.maxAlias){
                data['minval'] = '';
            }else{
                data['maxval'] = ''
            }
        }

        if(maxval || minval){
            data['customBtnShow'] = true;
        }else{
            data['customBtnShow'] = false;
        }

        if(maxval < 0 || minval < 0){
            data['customBtnShow'] = false;
        }

        this.setState(data);
    }

    showCustomBtn() {
        this.setState({
            customBtnShow: true
        })
    }

    customBtnClick(){
        let data = {};

        data[this.state.minAlias] = this.state.minval;
        data[this.state.maxAlias] = this.state.maxval;
        data['alias'] = this.state.minAlias;

        this.props.handleSetFilter(data);

        // $.jps.trigger('filter-data-result', $.extend({}, data, { alias: (name == 'sp' || name == 'ep') ? 'sp' : 'sa' }));

        // self.setFilter(data);
    }

    render() {
        let {minAlias,maxAlias,minval,maxval,alias,maxLength} = this.state;

        let title = minAlias == 'sa' ? '面积' : '售价';
        let unit = minAlias == 'sa' ? ' m²' : ' 万';

        return (
            <div className={'filter-custom p-r clearfix ft-' + alias}  data-alias={alias}>
                <ul>
                    <li className="filter-more-label">{title + ': '}</li>
                    <li className="filter-more-item-wrap">
                        <input type="text" maxLength={maxLength} name={minAlias} className="custom-input"
                        value={minval}
                        onChange={this.onSaChange.bind(this)}
                        onBlur={ (e) => this.onSaEaBlur('minval', minAlias)}
                        onClick={this.showCustomBtn.bind(this)}
                        onFocus={this.showCustomBtn.bind(this)}>
                        </input><span className='input-delimiter'></span>
                        <input type="text" maxLength={maxLength} name={maxAlias} className="custom-input"
                        value={maxval}
                        onChange={this.onEaChange.bind(this)}
                        onBlur={(e) => this.onSaEaBlur('maxval', maxAlias)}
                        onClick={this.showCustomBtn.bind(this)}
                        onFocus={this.showCustomBtn.bind(this)}>
                        </input><span>{unit}</span>
                        <button className={'custom-btn ' + (this.state.customBtnShow  ? '' : 'hide')}
                        onClick={this.customBtnClick.bind(this)}
                        type="button">确定</button>
                    </li>
                </ul>
            </div>
        )
    }
}