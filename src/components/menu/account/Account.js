import React, { createElement, PureComponent } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import {
  translate,
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  DisabledInput,
  Edit,
  EditButton,
  Filter,
  List,
  LongTextInput,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  Restricted,
  ReferenceInput,
  ReferenceField,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
} from 'admin-on-rest'
import { Card } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import Delete from '../../restricted/shared/crudComponents/Delete'
import Toolbar from 'material-ui/Toolbar'
import FlatButton from 'material-ui/FlatButton'
import { tooltip } from '../../../styles/chronasStyleComponents'
import { chronasMainColor } from '../../../styles/chronasColors'
import {themes} from "../../../properties";

const styles = {
  menuButtons: {
    margin: 12,
    color: '#fff',
  },
  dialogStyle: {
    width: 'calc(100% - 42px)',
    height: '800px',
    maxWidth: 'none',
    maxHeight: 'none',
    left: 42,
    top: 0,
    transform: '',
    transition: 'opacity 1s',
    opacity: 0,
    paddingTop: 0,
    overflow: 'hidden',
  },
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  }
}

const detailStyle = { display: 'inline-block', verticalAlign: 'top', marginRight: '2em', minWidth: '8em' }

class Account extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { hiddenElement: true }
  }

  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }

  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render () {
    const { resources, userDetails, list, create, edit, show, remove, options, onMenuTap, translate, theme } = this.props
    const commonProps = {
      options,
      hasList: false,
      hasEdit: true,
      hasShow: false,
      hasCreate: false,
      hasDelete: true,
      resource: 'users',
    }
    const username = localStorage.getItem('chs_userid')
    const routeProps = {
      'match': {
        'path':'/account',
        'url':'/resources/users/' + window.encodeURIComponent(username),
        'isExact': true,
        'params': {
          'id': username
        }
      },
      'location': {
        'pathname':'/account',
        'search':'',
        'hash':''
      },
      'history': {
        'length': 50,
        'action': 'POP',
        'location': {
          'pathname':'/account',
          'search': '',
          'hash': ''
        }
      }
    }

    const UserEdit = (props) => {
      console.debug(props)
      const t = { ...props, ...routeProps }
      return <Edit style={{ }} title={<span>UserEdit</span>} {...t}>
        <SimpleForm style={{ }}>
          <DisabledInput source='username' />
          <TextInput source='name' />
          <TextInput source='education' />
          <TextInput type='email' label='resources.users.fields.email' source='email' validation={{ email: true }} options={{ fullWidth: true }} style={{ width: 544 }} />
          <DisabledInput source='privilege' label='resources.users.fields.privilege' elStyle={{ width: '5em' }} />
          <DisabledInput source='karma' elStyle={{ width: '5em' }} />
          <TextInput source='website' type='url' />
          <DisabledInput source='loginCount' label='resources.users.fields.loginCount' type='number' />
          <DisabledInput source='createdAt' label='resources.users.fields.createdAt' type='date' />
          <DisabledInput source='lastUpdated' label='resources.users.fields.lastUpdated' type='date' />
          <TextInput source='password' type='password' />
        </SimpleForm>
      </Edit>
    }

    const UserDeleteTitle = <span>{translate('resources.users.page.delete')} "{username}"</span>

    const UserDelete = (props) => {
      const tt = { ...props, ...routeProps }
      return <Delete account history={props.history} title={<UserDeleteTitle />} {...tt} />
    }

    const restrictPage = (component, route, commonProps) => {
      const RestrictedPage = routeProps => (
        <Restricted location={{ pathname: 'account' }} authParams={{ routeProps }} {...routeProps}>
          <Dialog open
            autoDetectWindowHeight={false}
            modal={false}
            autoScrollBodyContent={false}
            bodyStyle={{
              background: themes[theme].backColors[0]
            }}
            actionsContainerStyle={{
              bottom: '4em',
              top: '4em',
              width: 'calc(100% - 64px)',
              overflow: 'auto',
              position: 'fixed !important'
            }}
            contentClassName={(this.state.hiddenElement) ? '' : 'classReveal accountContentStyle'}
            contentStyle={{ ...styles.dialogStyle, background: themes[theme].backColors[0] }}
                  onRequestClose={this.handleClose}>
            <Card style={styles.card}>
              {createElement(component, {
                ...commonProps,
                ...routeProps,
              })}
            </Card>
          </Dialog>
        </Restricted>
      )
      return RestrictedPage
    }

    return (
      <Switch style={{ zIndex: 20000 }}>
        {UserEdit && (
        <Route
          exact
          path={'/account/'}
          render={restrictPage(UserEdit, username, { ...commonProps, ...routeProps })}
                />
              )}
        {UserDelete && (
        <Route
          exact
          path={'/' + window.encodeURIComponent(username) + '/delete'}
          render={restrictPage(UserDelete, 'delete', { ...commonProps, ...routeProps })}
                />
              )}
      </Switch>
    )
  }
}

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    userDetails: state.userDetails
  }), { }),
  pure,
  translate,
)

export default enhance(Account)
