'use strict';
import FilterCustom from './FilterCustom.js';
import classNames from 'classnames';

class ChildItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    handleClick() {
        this.props.selectClick( '' + this.props.value, this.props.alias, this.props.checked, this.props.style, this.props.txt);

        // $.jps.trigger('filter-data-result', $.extend({}, data, { alias: alias, txt: $.trim($dom.text()) }));
        // self.setFilter(data)
    }

    render() {
        let {value, style, txt, checked} = this.props;

        return (
            <div data-value={value} className={'filter-item ' + (checked ? 'checked ' : '') + (style == 'single' ? 'select-item ' : 'checkbox-item ') + (txt == '学区房' ? 'filter-school ' : '') + (txt == '地铁房' ? 'filter-subway ' : '')}
                onClick={this.handleClick.bind(this)}>
            {
                [(style == "multi" ?
                <i className={'iconfont ' + (checked ? 'if-check-bold' : 'if-box')} key="0"></i> : null)
                ,<span key="1">{txt}</span>]
            }
            </div>
        )
    }
}

export default class FilterItem extends React.Component {
    static defaultProps = {
        filter: '',
        allfilter: '',
        item: [],
        ht: '1',
        handleSetFilter: null
    };

    constructor(props) {
        super(props);

        this.state = {
        }
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    selectClick(val, alias, checked, style, txt){
        let r = this.props.allfilter[alias] ? this.props.allfilter[alias].toString().split(',') : [];

        if(style == 'single'){
            r = val > 0 ? (val + '') : '';
        }else{
            // checked 为true 则删 否增
            if(checked){
                r = r.filter(function(item){
                    return item != val;
                }).join(',');
            } else {
                r = r.concat(val).join(',');
            }
        }

        let data = {
            txt: txt,
            alias: alias
        };
        data[alias] = r;
        this.props.handleSetFilter(data);
    }

    renderMore(item) {
        let self = this;
        let ht = this.props.ht;
        let iaDom = null;
        let filter = this.props.allfilter;

        if( ht == 2 ){
            iaDom = <FilterCustom handleSetFilter={this.props.handleSetFilter}
                                minAlias="sa"
                                maxAlias="ea"
                                alias="ia"
                                allfilter={this.props.allfilter}
                                key="sa"></FilterCustom>
        }
        return (
            <div className={'filter-opts' + (!this.props.isShowAll ? ' hide' : '-list')} key="0">
            {
            [iaDom,
            item.values.map(function(child, index){
                return  <ul className={'p-r clearfix filter-' + child.style + ' ft-' + child.alias}  data-alias={child.alias} key={index}>
                            <li className="filter-more-label">{child.text + ':'}</li>
                            <li className="filter-more-item-wrap">
                            {
                            child.values.map(function(scchild, index){
                                let checked = false;
                                let fs = filter[child.alias];
                                fs = fs ? fs.split(',') : [];
                                fs.filter(function(i){
                                    if( i == scchild.key) checked = true;
                                })
                                return <ChildItem value={scchild.key}
                                                alias={child.alias}
                                                key={index}
                                                style={child.style}
                                                txt={scchild.txt}
                                                checked={checked}
                                                selectClick={self.selectClick.bind(self)}/>
                            })
                            }
                            </li>
                        </ul>
            })]
            }
            </div>)
    }

    render() {
        let self = this;
        let item = this.props.item;

        let filter = this.props.filter;
        if(item.alias == 'more'){
            filter = null;
        }

        let fs;
        fs = filter ? filter.split(',') : [];

        let itemTxt = item.text;
        let itemTxtNum = '';

        if(fs.length > 0 && item.name != 'more'){
            if(item.style == 'single'){
                item.values.map( (value) => {
                    if(value.key == fs[0]){
                        itemTxt = value.txt;
                    }
                });
            }else{
                itemTxtNum = '(' + fs.length + ')'
            }
        }
        return (
            <div className={'filter-select ' + 'filter-' + item.style + ' ft-' + item.alias + ((fs.length > 0) ? ' selected' : '')}  data-alias={item.alias}>
            {[(item.name == 'more') ? this.renderMore(item) :
                <ul className={'filter-opts' + (!this.props.isShowAll ? ' hide' : '-list')} key="0">
                    {
                    item.values.map(function(value, index){
                        let checked = false;

                        fs.filter(function(i){
                            if( i == value.key) checked = true;
                        })

                        // 选择全部
                        if(!fs[0] && value.key == -1 && self.props.filterAllHeightlight) checked = true;

                        return <ChildItem style={item.style}
                                        alias={item.alias}
                                        value={value.key}
                                        txt={value.txt}
                                        key={index}
                                        checked={checked}
                                        selectClick={self.selectClick.bind(self)}/>
                    })
                    }
                </ul>,
                <dl className="filter-dl" key="1">
                    {
                        [<dt data-txt={item.text} key="0" className="filter-dt">{itemTxt}</dt>,
                        ((item.style != 'single' && item.alias != 'more') ?
                        <dd className="filter-num" key="1">{itemTxtNum}</dd>
                        : null),
                        <dd className="filter-icon" key="2"><i className="iconfont if-triangle-down"></i></dd>]
                    }
                </dl>]}
            </div>
        )
    }
}