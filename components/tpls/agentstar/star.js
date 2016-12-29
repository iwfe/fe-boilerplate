import classNames from 'classnames';

export default class AgentStar extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  
  render() {
    const self = this;
    
    let lightNum = Math.round(this.props.score);
    
    return (
      <span>
        {
          _.range(5).map((i)=> {
            let starClass = classNames({
              iconfont: true,
              'if-star': true,
              'light-star': lightNum >= i + 1
            });
            return (<i className={starClass}></i>)
          })
        }
      </span>
    )
  }
}