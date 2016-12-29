import classNames from 'classnames';
import './checkbox.scss'

export default class Checkbox extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let {checked} = this.props;

    let chkClass = classNames({
      'iconfont': true,
      'if-box': !checked,
      'if-check-bold': !!checked
    })
    return (<em className={chkClass}></em>)
  }
}