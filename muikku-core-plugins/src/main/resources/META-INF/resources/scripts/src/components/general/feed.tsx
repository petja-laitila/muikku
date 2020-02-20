import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {i18nType} from '~/reducers/base/i18n';
import {StateType} from '~/reducers';

import '~/sass/elements/rich-text.scss';
import '~/sass/elements/feed.scss';

interface FeedProps {
  entries: Array<{
    publicationDate: string,
    description: string,
    link: string,
    title: string,
    image: string,
  }>,
  feedReadTarget: string,
  i18n: i18nType
}

interface FeedState {

}

class Feed extends React.Component<FeedProps, FeedState> {
  render(){
    return <ul className="feed">
      {this.props.entries.map((entry, index)=>{
        return <li className="feed__item" key={entry.link}>
          {entry.image ? <div className="feed__item-image"><img src={entry.image}/></div> :
            this.props.feedReadTarget === "nettilukio" ? <div className="feed__item-image feed__item-image--empty"><img src="/gfx/kuva_nettilukio.png"/></div> :
              <div className="feed__item-image feed__item-image--empty"><img src="/gfx/kuva_nettiperuskoulu.png"/></div>
          }
          <div className="feed__item-description">
            <a href={entry.link} target="_blank">{entry.title}</a>
            <div dangerouslySetInnerHTML={{__html: entry.description}}/>
            <div className="feed__item-date">{this.props.i18n.time.format(entry.publicationDate)}</div>
          </div>
        </li>
      })}
    </ul>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Feed);