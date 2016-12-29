'use strict';

import FilterData from 'houseJson';
import FilterItem from './FilterItem.js';
import FilterCustom from './FilterCustom.js';
import modFilterKey from './key.js';
import './filter.scss';
const pageConfig = window.pageConfig;

export default class Filter extends React.Component {
    static defaultProps = {
        ht: 1,
        p: 1,
        needRender: true,
        filterAllHeightlight: true,
        onFilterChange: null,
        filter: {},
        isStatic: false
    };

    constructor(props) {
        super(props);

        this.state = {
            source: props.source ? this.getSource(props.source) : this.getDefautlSource(props),
            filter: this.getFilter(props.filter)
        }

        this.getKeyText = this.getKeyText.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            source: nextProps.source ? this.getSource(nextProps.source) : this.getDefautlSource(nextProps),
            filter: this.getFilter(nextProps.filter)
        })
    }

    componentDidMount() {
        let self = this;

        $.jps.on('filter-load-data', function(data) {
            self.setState({
                filter: self.getFilter(data && data.filter)
            });
        });
    }

    getSource(source){
        source = source.filter(function(item){
            if(item && item.alias == 'ia'){
                return false;
            }else{
                return true;
            }
        });

        return source;
    }

    getDefautlSource(props){
        let more,
            source,
            ht = props.ht,
            p = props.p,
            prices = pageConfig[pageConfig.staticTag].prices;

        if (ht == 1) {
            source = FilterData.rent;
            more = source.slice(3);
            source = source.slice(0, 3);
        } else {
            source = FilterData.sell;

            if (prices) {
                let pSource = prices[p];
                if (pSource) source[0].values = pSource;

            }
            more = source.slice(4);
            source = source.slice(0, 2).concat(source.slice(3, 4));
        }

        source.push({
            "name": "more",
            "alias": "more",
            "text": "更多",
            "style": "more",
            "values": more
        });

        return source;
    }

    // 把数组 转为 文本值
    getKeyText(data, _origindata) {
        let newData = {};
        let odata = {};

        let ORIGINDATA = this.state.source;
        if(_origindata){
            ORIGINDATA = _origindata;
        }

        if(data.ea > 0 && data.sa>=0) {
            newData['saea'] = data.sa + '-' + data.ea;
        }

        if(!data.sa && data.ea > 0){
            newData['saea'] = "不限-" + data.ea;
        }

        if(data.sa > 0 && !data.ea){
            newData['saea'] = data.sa + "-不限";
        }

        if(data.ep > 0 && data.sp>=0) {
            newData['ip'] = data.sp + '-' + data.ep + '万';
            delete data.ip;
        }

        if(data.ep > 0 && !data.sp) {
            newData['ip'] = data.ep + '万以下';
            delete data.ip;
        }

        if(!data.ep && data.sp > 0) {
            newData['ip'] = data.sp + '万以上';
            delete data.ip;
        }

        // 转为obj
        ORIGINDATA.map(function(item){
            if(item.alias == 'more'){
                item.values.map(function(item){
                    odata[item.alias] = {};
                    item.values.map(function(i){
                        odata[item.alias][i.key] = i.txt;
                    });
                });
            }else{
                odata[item.alias] = {};
                item.values.map(function(i){
                    odata[item.alias][i.key] = i.txt;
                });
            }
        });

        function isNone(str){
            return (str === '' || str === undefined || str === null)
        }

        function getVal(str, list){
            str = '' + str;
            if(!list) return ;
            let l = str.split(',');
            return l.map(function(item){
                if(list[item])
                    return list[item];
                else
                    return
            }).join(',')
        };

        for(let key in data){
            if(!isNone(data[key])){
                newData[key] = getVal(data[key], odata[key]);
            }
        }

        return newData;
    }
    getFilter(filter) {
        let r = {};
        if(!filter) return {};

        modFilterKey.forEach(function(key){
            if(key in filter){
                r[key] = filter[key] == '-1' ? '' : filter[key];
            }
        });
        return r;
    }

    handleSetFilter(data){
        let filter = this.state.filter;
        let alias = data.alias;
        if(alias == 'sa'){
            filter['sa'] = data.sa;
            filter['ea'] = data.ea;
            data['ia'] = '';
        } else if(alias == 'sp'){
            filter['sp'] = data.sp;
            filter['ep'] = data.ep;
            data['ip'] = '';
        }else{
            let val = data[alias];
            filter[alias] = val;
        }

        // 选中价格清除自定义价格
        if (alias == 'ip') {
            if (filter.sp) filter.sp = '';
            if (filter.ep) filter.ep = '';
        }

        // 选中面积清除自定义面积
        if (alias == 'ia') {
            if (filter.sa) filter.sa = '';
            if (filter.ea) filter.ea = '';
        }

        //自定义面积时清空ia
        if (alias == 'sa' || alias == 'ea') {
            filter['ia'] = '';
        }

        //自定义价格时清空ip
        if (alias == 'sp' || alias == 'ep') {
            filter['ip'] = '';
        }

        this.setState({
            filter: filter
        });

        this.props.onFilterChange && this.props.onFilterChange(filter);
        // 返回改变的data
        $.jps.trigger('filter-data-result', data);
        // 返回改变的data, 外部调 setFilter 时也会触发，filter-data-result 一定会 filter_change
        $.jps.trigger('filter_change', data);
    }

    renderLabel(){
        let labelList = [];
        this.props.source.map(function(item, index){
            labelList.push(
                <li key={index}>{item.text + '：'}</li>
                )
        });
        return <div className="filter-labels">{labelList}</div>
    }

    render() {
        let self = this;
        let ht = this.props.ht;

        return (
            <div className="ui-filter" data-ht={ht}>
                {
                    this.state.source.map(function(item, index){
                        let _filter =(self.state.filter[item.alias] || self.state.filter[item.alias] == 0)  ? self.state.filter[item.alias].toString() : '';
                        return <FilterItem filter={_filter}
                                filterAllHeightlight={self.props.filterAllHeightlight}
                                allfilter={self.state.filter}
                                item={item}
                                key={index}
                                ht={ht}
                                isShowAll={self.props.isShowAll}
                                handleSetFilter={self.handleSetFilter.bind(self)}/>;
                    })
                }
                {
                    this.props.pageType == 'list' ? [
                        <FilterCustom handleSetFilter={self.handleSetFilter.bind(self)}
                                minAlias="sp"
                                maxAlias="ep"
                                alias="ip"
                                allfilter={this.state.filter}
                                key="sp"></FilterCustom>,
                        <FilterCustom handleSetFilter={self.handleSetFilter.bind(self)}
                                minAlias="sa"
                                maxAlias="ea"
                                alias="ia"
                                allfilter={this.state.filter}
                                key="sa"></FilterCustom>
                    ]: null
                }
                {
                    this.props.pageType == 'newhouselist' ?
                        <FilterCustom handleSetFilter={self.handleSetFilter.bind(self)}
                                minAlias="sp"
                                maxAlias="ep"
                                alias="ip"
                                allfilter={this.state.filter}
                                key="sp"></FilterCustom> : null
                }
                {
                    ((this.props.pageType == 'list') || (this.props.pageType == 'newhouselist')) ?
                    this.renderLabel() : null
                }
            </div>
        )
    }
}


$.jps.on('filter-data-result', function(data) {
    let alias = data.alias,
        txt = data.txt;

    // for log
    switch (alias) {
        case 'ia':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 61,
                act_v: txt
            });
            break;
        case 'sa':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 61,
                act_v: data.sa + '-' + data.ea
            });
            break;
        case 'ip':
            $.jps.trigger('log', {
                type: 'filter',
                rental: txt
            });
            break;
        case 'rn':
            $.jps.trigger('log', {
                type: 'filter',
                bedroom: txt
            })
            break;
        case 'fl':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 65,
                act_v: txt
            })
            break;
        case 'dt':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 63,
                act_v: txt
            })
            break;
        case 'ag':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 64,
                act_v: txt
            })
            break;
        case 'fe':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 62,
                act_v: txt
            });
            break;
        case 'wt':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 67,
                act_v: txt
            });
            break;
    }
});
