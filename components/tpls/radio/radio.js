import classNames from 'classnames';
import './radio.scss'

export default class Radio extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let {isChecked} = this.props;

    let chkClass = classNames({
      'iconfont': true,
      'if-uncheck': !isChecked,
      'if-checked': !!isChecked
    })
    return (<em className={chkClass}></em>)
  }
}