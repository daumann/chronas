import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import appLayout from '../../SharedStyles/appLayout.css';
import styles from './styles.css';

// components for Header
import Logo from '../../Components/Header/Logo';
import NavigationBar from '../../Components/Header/NavigationBar';

class Header extends Component {
  renderNavLinks() {
    const { forums } = this.props;

    if (forums) {
      return forums.map((forum) => {
        return {
          id: forum._id,
          name: forum.forum_name,
          link: `/${forum.forum_slug}`,
        };
      });
    }

    return null;
  }

  render() {
    const {
      updateCurrentForum,
      handleClose,
      theme,
      currentForum,
      showHeader,
      history, translate } = this.props
    const {
      authenticated,
      name,
      username,
      avatarUrl
    } = this.props.user;

    return (
      <div className={classnames('appLayout_constraintWidth')}>
        <div className='headerTop'>
          <Logo translate={translate} history={history} theme={theme} handleClose={handleClose} />
        </div>
        { showHeader && <NavigationBar
          currentForum={currentForum}
          history={history}
          theme={theme}
          updateCurrentForum={updateCurrentForum}
          navigationLinks={this.renderNavLinks()}
        /> }
      </div>
    );
  }
}

export default connect(
  (state) => { return {
    user: state.user,
  }; }
)(Header);
