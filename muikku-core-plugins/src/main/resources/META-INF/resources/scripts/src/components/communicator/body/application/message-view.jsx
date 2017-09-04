import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import equals from 'deep-equal';

import actions from '~/actions/main-function/communicator/communicator-messages';

class MessageView extends React.Component {
  constructor(props){
    super(props);
    
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.loadMessage = this.loadMessage.bind(this);
    
    this.initialXPos = null;
    this.initialYPos = null;
    this.closeInterval = null;
    
    this.state = {
      drag: 0
    }
  }
  loadMessage(messageId){
    if (history.replaceState){
      history.replaceState('', '', location.hash.split("/")[0] + "/" + messageId);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      location.hash = location.hash.split("/")[0] + "/" + messageId;
    }
  }
  componentWillReceiveProps(nextProps){
    if (!equals(nextProps.communicatorMessagesCurrent, this.props.communicatorMessagesCurrent)){
      this.setState({
        drag: 0
      });
    }
  }
  onTouchStart(e){
    this.initialXPos = e.touches[0].pageX;
    this.initialYPos = e.touches[0].pageY;
    clearInterval(this.closeInterval);
  }
  onTouchMove(e){
    let diff = this.initialXPos - e.touches[0].pageX;
    if (!this.props.communicatorMessagesCurrent.newerThreadId && diff > 0){
      diff = 0;
    } else if (!this.props.communicatorMessagesCurrent.olderThreadId && diff < 0){
      diff = 0;
    } else if (this.refs.centerContainer.offsetWidth < Math.abs(diff)){
      diff = Math.sign(diff)*this.refs.centerContainer.offsetWidth;
    }
    this.setState({
      drag: -diff
    });
  }
  onTouchEnd(e){
    let allDrag = Math.abs(this.state.drag);
    let totalDrag = this.refs.centerContainer.offsetWidth;
    let sign = Math.sign(this.state.drag);
    
    let closeToNext = allDrag >= totalDrag/3;
    this.closeInterval = setInterval(()=>{
      let absoluteDrag = Math.abs(this.state.drag);
      if (absoluteDrag === (closeToNext ? totalDrag : 0)){
        clearTimeout(this.closeInterval);
        if (closeToNext){
          let nextLoadMessage = sign === -1 ? this.props.communicatorMessagesCurrent.newerThreadId : this.props.communicatorMessagesCurrent.olderThreadId;
          this.loadMessage(nextLoadMessage);
        }
        return;
      }
      let newValue = closeToNext ? (absoluteDrag + (absoluteDrag/10)) : (absoluteDrag - (allDrag/10));
      if (!closeToNext && newValue < 0){
        newValue = 0;
      } else if (closeToNext && newValue > totalDrag){
        newValue = totalDrag;
      }
      this.setState({
        drag: sign*newValue
      });
    }, 10);
  }
  render(){
    if (this.props.communicatorMessagesCurrent === null){
      return null;
    }
    return <div className="communicator container communicator-container-message-view" onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove} onTouchEnd={this.onTouchEnd}>
      <div className="communicator container communicator-container-message" style={{right: "100%", transform: `translateX(${this.state.drag}px)`}}></div>
      <div ref="centerContainer" className="communicator container communicator-container-message communicator-container-message-center" style={{transform: `translateX(${this.state.drag}px)`}}>
        {this.props.communicatorMessagesCurrent.messages.map((message)=>{
          return <div key={message.id}><h4>{message.caption}</h4><p dangerouslySetInnerHTML={{__html: message.content}}></p></div>
        })}
      </div>
      <div className="communicator container communicator-container-message" style={{left: "100%", transform: `translateX(${this.state.drag}px)`}}></div>
    </div>
  }
}

function mapStateToProps(state){
  return {
    communicatorMessagesCurrent: state.communicatorMessages.current,
    i18n: state.i18n
  }
};

const mapDispatchToProps = (dispatch)=>{
  return bindActionCreators(actions, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageView);