import _ from 'lodash'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import classnames from 'classnames'
import styles from './styles.css'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'

import PlaceholderImage from '../../../SharedStyles/placeholder.jpg'
import Button from '../../../Components/Button'
import Tag from '../../../Components/Tag'
import RichEditor from '../../../Components/RichEditor'

class Discussion extends Component {
  render () {
    const {
      id,
      userAvatar,
      userName,
      userGitHandler,
      discTitle,
      discDate,
      discContent,
      tags,
      favoriteCount,
      favoriteAction,
      userFavorited,
      toggleingFavorite,
      allowDelete,
      deletingDiscussion,
      deleteAction,
    } = this.props

    let dateDisplay = moment(discDate)
    dateDisplay = dateDisplay.from(moment())

    let favCount = ''
    if (toggleingFavorite) favCount = 'Toggling Favorite...'
    else if (userFavorited) favCount = `Favorited (${favoriteCount})`
    else if (favoriteCount === 0) favCount = 'Make favorite'
    else if (favoriteCount === 1) favCount = '1 favorite'
    else favCount = `${favoriteCount} favorites`

    const finalAvatarUrl = userAvatar ? <img className='Discussion_avatar' src={userAvatar} alt={`${name} avatar`} /> : <AccountIcon className='Discussion_avatar' />

    return (
      <div className='Discussion_container'>

        <div className='Discussion_infoContainer'>
          { finalAvatarUrl }
          <div className='Discussion_columnOnSmallBP'>
            <div className='Discussion_userInfo'>
              <Link to={`/community/user/${userGitHandler}`} className='Discussion_name'>{userName || userGitHandler}</Link>
            </div>
            <div className='Discussion_dateInfo'>{dateDisplay}</div>
          </div>
        </div>

        <div className='Discussion_discTitle'>{discTitle}</div>
        <div className='Discussion_discContent'>
          <RichEditor
            readOnly
            value={discContent}
          />
        </div>

        <div className='Discussion_discFooter'>
          <div className='Discussion_tags'>
            { tags.map(tag => <Tag name={tag} key={_.uniqueId('tag_')} />)}
          </div>
          <Button noUppercase className='Discussion_favoriteButton' onClick={() => { !toggleingFavorite && favoriteAction(id) }}>
            <i className={classnames(`fa fa-${userFavorited ? 'heart' : 'heart-o'}`)} />
            <span>{favCount}</span>
          </Button>

          { allowDelete && <Button noUppercase className='Discussion_deleteButton' onClick={() => { deleteAction() }}>
            <i className={classnames('fa fa-trash', 'trashIcon')} />
            <span>Delete</span>
          </Button> }
        </div>

        { deletingDiscussion && <div className='Discussion_deletingDiscussion'>
          Deleting Discussion...
        </div> }
      </div>
    )
  }
}

Discussion.defaultProps = {
  id: 0,
  userName: 'n/a',
  userGitHandler: 'github',
  discTitle: 'Default Discussion Title',
  discDate: 'a day ago',
  discContent: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  tags: [ 'react', 'redux', 'webkit' ],
  favoriteCount: 1,
  favoriteAction: () => { },
  userFavorited: false,
  toggleingFavorite: false,
  allowDelete: false,
  deletingDiscussion: false,
  deleteAction: () => { },
}

Discussion.propTypes = {
  id: React.PropTypes.any,
  userAvatar: React.PropTypes.string,
  userName: React.PropTypes.string,
  userGitHandler: React.PropTypes.string,
  discTitle: React.PropTypes.string,
  discDate: React.PropTypes.any,
  discContent: React.PropTypes.any,
  tags: React.PropTypes.array,
  favoriteCount: React.PropTypes.number,
  favoriteAction: React.PropTypes.func,
  userFavorited: React.PropTypes.bool,
  toggleingFavorite: React.PropTypes.bool,
  allowDelete: React.PropTypes.bool,
  deletingDiscussion: React.PropTypes.bool,
  deleteAction: React.PropTypes.func,
}

export default Discussion