/*
 * @Author: vavid
 * @Date:   2016-06-30 15:13:37
 * @Last Modified by:   yuqy
 * @Last Modified time: 2016-08-15 16:55:39
 */
'use strict';

import React,  { Component } from 'react';

export default class PageChild extends Component {
    
    constructor(props) {
        super(props);
        let {param}=props;
        this.state = {...param};
    }

    handleClick() {
        let {page}=this.state
        this.props.callbackPage(page);
    }

    componentWillReceiveProps(nextProps) {
        let {href,page,text} = nextProps.param;
        this.setState({
            href: href,
            page: page,
            text: text
        })
    }

    render() {
        let {href,showHref,text} = this.state;
        // const obj = {href: showHref ? href: null};
        const obj = showHref ? {href: href} : {};
        if(text === '<'){
            return (
                <i className="page-item stateful iconfont if-triangle-left"
                    onClick={()=>{this.handleClick()}} 
                    {...obj}></i>
            )
        }
        if(text === '>'){
            return (
                <i className="page-item stateful iconfont if-triangle-right"
                    onClick={()=>{this.handleClick()}} 
                    {...obj}></i>
            )
        }
        return (
            <a  className="page-item stateful" 
                onClick={()=>{this.handleClick()}} 
                {...obj}>
                {text}
            </a>
        )
    }
}
