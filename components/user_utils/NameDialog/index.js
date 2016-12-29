import style from './index.rcss';
import {Dialog} from '../../../global/dialog/dialog.js';
import user_utils from '../utils.js';
import classNames from 'classnames';

class Window extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            gender: (pageConfig.visitor.user.gender == 2) ? 'feman' : 'man',
            inputFocus: false,
            inputName: '',
            errorText: '',
            ifConfirm: false

        };
    }

    componentWillReceiveProps(nextProps, oldProps){
    }

    componentDidMount(){
    }

    closeWindw(){
        let {_dialog} = this.props;
        // 删除组件和父元素
        let $parent = $(ReactDOM.findDOMNode(this)).parent();
        ReactDOM.unmountComponentAtNode($parent[0]);

        _dialog.close();
        // $parent.remove();
    }

    choiceMan(){
        this.setState({
            gender: 'man'
        })
    }

    choiceFeMan(){
        this.setState({
            gender: 'feman'
        })
    }

    focus(){
        this.setState({
            inputFocus: true,
            errorText: ''
        })
    }

    blur(){
        this.setState({
            inputFocus: false
        })
    }

    inputChange(e){
        let val = e.target.value;

        if(val && (val.length >= 2) && (val.length <= 15)){
            this.setState({
                inputName: val,
                ifConfirm: true
            });
        }else{
            this.setState({
                inputName: val,
                ifConfirm: false
            })
        }

    }

    confirm(){
        let self = this;
        let {inputName, gender, ifConfirm} = this.state;
        let {successCallback} = this.props;

        if(!ifConfirm){
            return;
        }

        inputName = $.trim(inputName);
        if (!inputName) {
            self.setState({
                errorText: '修改名字不能为空'
            })
            return false;
        } else if(inputName.length < 2){
            self.setState({
                errorText: '姓名必须为2~15个字符'
            })
            return false;
        }else if (!global.isName(inputName)) {
            self.setState({
                errorText: '姓名不能包含特殊字符'
            })
            return false;
        }

        let data = {
            gender: (gender == 'man') ? 1 : 2,
            name: inputName
        };

        user_utils.updateUserInfo(data, function(){
            successCallback && successCallback();
            self.closeWindw();
        }, function(){
            // error
            self.closeWindw();
        });
    }

    render(){
        let {gender, inputFocus, inputName, ifConfirm, errorText} = this.state;
        let check_man , check_feman;

        if(gender == 'man'){
            check_man = 'if-checkbox-circle';
            check_feman = 'if-uncheck';
        }else{
            check_feman = 'if-checkbox-circle';
            check_man = 'if-uncheck';
        }

        let inputClass = {};
        inputClass[style.input_wrp] = true;
        inputClass[style.focus] = inputFocus;

        let confirmClass = {};
        confirmClass[style.confirm] = true;
        confirmClass[style.ifConfirm] = ifConfirm;

        return(<div className="userInfoDialog">
                <div className={style.title}>个人信息</div>
                <div className={style.cell} style={{'marginBottom': '24px'}}>
                    <div className={style.label}>性别</div>
                    <div onClick={()=>this.choiceMan()} className={'iconfont ' + check_man}></div>
                    <span className={style.span} style={{'marginRight': '24px'}}>男</span>
                    <div onClick={()=>this.choiceFeMan()} className={'iconfont ' + check_feman}></div>
                    <span className={style.span}>女</span>
                </div>
                <div className={style.cell}>
                    <div className={style.label}>姓名</div>
                    <div className={classNames(inputClass)}>
                        <input type="text" placeholder="请填写您的称呼" className={style.input}
                                value={inputName}
                                maxLength='15'
                                onChange={(e)=>this.inputChange(e)}
                                onFocus={()=>this.focus()}
                                onBlur={()=>this.blur()}/>
                    </div>
                </div>
                <div className={style.error_wrp}>
                {
                    errorText ? <div className={style.error_text}>
                                <span className="iconfont if-alert"></span><span>{errorText}</span>
                        </div> : ''
                }
                </div>
                <div onClick={()=>this.confirm()} className={classNames(confirmClass)}>提交</div>
            </div>);
    }
}

export default {
    show: function(callback){
        let d = new Dialog({
            width: '320px',
            showTitle: true,
            showFooter: false,
            cssClass: null,
            showClose: true,
            message: '',
            isFixed: true,
            modal: true,
            maskClickClose: true,
            closeCallback: function(){

            }
        });

        return ReactDOM.render(<Window successCallback={callback} _dialog={d}/>, d.find('.dialog-content')[0]);


    }
}


