/*
 * @Author: vavid
 * @Date:   2016-06-30 15:13:37
 * @Last Modified by:   yuqy
 * @Last Modified time: 2016-08-15 17:14:19
 */
 /*
react page组件，
1.配合router使用时，点击分页直接Url跳转，会在url上体现分页，例如：/p1  /p2 ... showHref需设置为true
2.非router使用（只修改UI，回调）showHref需设置为false
 */
'use strict';
import './page.css';
import PageChild from './react_page_child';

export default class Page extends React.Component {
    
    constructor(props){
        super(props);
        this.state = this.workData(props.param);
    }

    onChildChanged(this_page){
        this.setState({
            currentPage: this_page
        })
        this.props.callback(this_page);
    }

    workData(param){
        let totalPages = Math.ceil(param.totalNums / param.pageSize);
        let list = [];
        //判断是否显示页码
        for (var i = 0; i < totalPages; i++) {
            list.push({
                isShow: Math.abs(i + 1 - param.currentPage) < param.delta
            });
        }
        param = _.extend(param, {
            list: list,
            totalPages: totalPages
        })
        return param;
    }

    componentWillReceiveProps(nextProps){
        let {currentPage,href,showHref,totalNums} = nextProps.param;
        let {totalPages,list} = this.workData(nextProps.param);
        this.setState({
            currentPage: currentPage,
            href: href,
            totalNums: totalNums,
            totalPages: totalPages,
            list: list
        })
    }

    beginning_render(){
        let {currentPage, href, showHref, delta} = this.state, self = this;
        let beginning_dom1, beginning_dom2;
        if (currentPage == 1) {
            beginning_dom1 = <i className="act" key={currentPage+'-0'}>1</i>;
        } else if (currentPage > 1) {
            let this_page = currentPage - 1;
            beginning_dom1 = [
                <PageChild
                    param={ {
                        href:`${href}/${this_page}`,
                        showHref: showHref,
                        text:'<',page:this_page }}
                        callbackPage={(p)=>{self.onChildChanged(p)}} key="_dom11"/>,
                <PageChild 
                    param={ {
                        href:`${href}/1`,
                        showHref: showHref,
                        text:'1',page:'1'}}
                        callbackPage={(p)=>{self.onChildChanged(p)}}
                        key="_dom12"/>
            ]
        }
        if (currentPage - delta == 2) {
            beginning_dom2 =
                <PageChild param={ {
                    href:`${href}/2`,
                    showHref: showHref,
                    text:'2',page:'2'}} 
                    callbackPage={(p)=>{self.onChildChanged(p)}}
                    key="_dom2"/>;
        } else if (currentPage - delta > 2) {
            beginning_dom2 = <i className="out" key="_dom22">...</i>
        }
        return [beginning_dom1, beginning_dom2];
    }

    ending_render(){
        let {currentPage,totalPages,delta,href,showHref} = this.state, self =this;
        let ending_dom1, ending_dom2, ending_dom3;
        if (totalPages - currentPage - 1 == delta) {
            let this_param = totalPages - currentPage;
            ending_dom1 = <PageChild param={ {
                            href: `${href}/${this_param}`,
                            showHref: showHref,
                            text: this_param,
                            page: this_param}} 
                            callbackPage={(p)=>{self.onChildChanged(p)}} key="_dom31"/>;

        } else if (totalPages - currentPage - 1 > delta) {
            ending_dom1 = <i className="out" key="_dom32">...</i>
        }
        if (totalPages > 1) {
            if (totalPages == currentPage) {
                ending_dom2 = <i className="act" key="_dom33">{totalPages}</i>
            } else {
                ending_dom2 = <PageChild param={ {
                            href: `${href}/${totalPages}`,
                            showHref: showHref,
                            text: totalPages,
                            page: totalPages
                        }} callbackPage={(p)=>{self.onChildChanged(p)}} key="_dom34"/>
            }
        }
        if (currentPage != totalPages) {
            let this_page = currentPage + 1;
            ending_dom3 = <PageChild param={ {
                            href: `${href}/${this_page}`,
                            showHref: showHref,
                            text: `>`,
                            page: this_page
                        }} callbackPage={(p)=>{self.onChildChanged(p)}} key="_dom35"/>
        }
        return [ending_dom1, ending_dom2, ending_dom3];
    }

    listRender(item, index){
        let {currentPage,totalPages,href,showHref} = this.state, self = this;
        let list_dom1;

        if (index >= 1 && index < totalPages - 1) {
            if (item.isShow) {
                let this_page = index + 1;
                if (currentPage == this_page) {
                    list_dom1 = <i className="act" key={`${currentPage}_${index}`}>{this_page}</i>
                } else {
                    list_dom1 = <PageChild param={{
                            href: `${href}/${this_page}`,
                            showHref: showHref,
                            text: this_page,
                            page: this_page
                        }} callbackPage={(p)=>{self.onChildChanged(p)}} key={index}/>
                }
            }
        }
        return list_dom1;
    }

    render(){
        let list = this.state.list;
        return (<div className="mod-page">
                {
                    this.beginning_render()
                }
                {
                    list.map((item, index) =>
                        this.listRender(item, index)
                    )
                }
                {
                    this.ending_render()
                }
            </div>
        )
    }
}
