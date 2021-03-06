import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import Moment from 'moment';
import styles from './styles.css';
import { properties } from '../../../../../../../properties'
import Tag from '../../../Components/Tag';


class DiscussionBox extends Component {
  render() {
    const {
      voteCount,
      userName,
      userGitHandler,
      discussionTitle,
      time,
      opinionCount,
      tags,
      customTheme,
      link,
      userProfile,
    } = this.props;

    const postTime = Moment(time);
    const timeDisplay = postTime.from(Moment());

    const isQuestion = link.indexOf('/' + properties.QAID + '/') > -1

    return (
      <div className='DiscussionBox_container'>
        <div className={classnames('DiscussionBox_title', userProfile && 'DiscussionBox_titleBottomMargin')}><Link to={link}>{discussionTitle}</Link></div>

        <div className='DiscussionBox_boxFooter'>
          { <div className='DiscussionBox_tagsArea'>
            { tags.map((tag) => <Tag customTheme={customTheme} key={tag} name={tag} />) }
          </div> }
          { !userProfile && <div className='DiscussionBox_posterInfo'>
            by <Link to={`/community/user/${userGitHandler}`} className='DiscussionBox_name'>{userName}</Link>
          </div> }
          <div className='DiscussionBox_postInfo'>
            <span className='DiscussionBox_info'>{timeDisplay}</span>
            <span className='DiscussionBox_info'>{voteCount && voteCount.length || '0'} {isQuestion ? 'point(s)' : 'upvote(s)'}</span>
            <span className='DiscussionBox_info'>{opinionCount} {isQuestion ? 'answers' : 'opinions'}</span>
          </div>
        </div>
      </div>
    );
  }
}

DiscussionBox.defaultProps = {
  discussionId: 1,
  voteCount: 20,
  userName: 'Hello World',
  userGitHandler: 'github',
  discussionTitle: 'This is a default post title',
  time: Moment(),
  opinionCount: 12,
  tags: ['react', 'redux', 'nodejs'],
  link: '',
  userProfile: false,
};

export default DiscussionBox;
