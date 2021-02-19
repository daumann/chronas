import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Card, CardActions, CardMedia, CardTitle, CardText } from 'material-ui/Card'
import { GridList, GridTile } from 'material-ui/GridList'
import ReactHtmlParser from 'react-html-parser'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import RadioOnIcon from 'material-ui/svg-icons/toggle/radio-button-checked'
import RadioOffIcon from 'material-ui/svg-icons/toggle/radio-button-unchecked'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import {
  setMarkerLimit,
  setMarker,
  setEpic } from '../layers/actionReducers'
import { Restricted, translate } from 'admin-on-rest'
import {markerIdNameArray, properties, themes} from '../../../properties'

import { changeLocale as changeLocaleAction } from '../configuration/actionReducers'
import utilsQuery from "../../map/utils/query";

const detectFeatures = require("detect-features")
// const sss = require("detect-features/build/detect-features.min")
// import { ss } from "detect-features"

const styles = {
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: '300px',
    backgroundColor: 'transparent'
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  },
  radio: {
    position: 'absolute',
    right: '1em',
    top: '1em',
    width: '24px',
    minWidth: '23px'
  }
}

function syntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2)
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'syntaxHighlight_number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'syntaxHighlight_key';
      } else {
        cls = 'syntaxHighlight_string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'syntaxHighlight_boolean';
    } else if (/null/.test(match)) {
      cls = 'syntaxHighlight_null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

class PerformanceSelector extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isMobileOrTablet: 0,
      isMobile: false,
      hiddenElement: true,
      selectedIndex: -1,
      suggestedIndex: 4,
      specs: {},
      openSpecs: false,
    }
  }

  componentDidMount = () => {
    const features = detectFeatures.register({
      log: true,
      // element: document.getElementsByClassName("body")[0],
    })

    const stateToUpdate = { specs: features, hiddenElement: false }

    try {
      const { isMobile, isTablet, isDesktop } = features.browserFeatures.browserType
      const { screenSize, workerPoolSize } = features.hardwareFeatures
      const maxRenderBufferSize = ((((features || {}).browserFeatures || {}).webGL2Features || {}).general || {}).maxRenderBufferSize || 0
      const screenSizeNumber = screenSize.split(",")
      const finalScreenSize = +screenSizeNumber[0] * +screenSizeNumber[1]

      if (isMobile || isTablet) {
        // warning here
        stateToUpdate.isMobile = isMobile
        stateToUpdate.isMobileOrTablet = (isMobile) ? 1 : 2
      } else if (isDesktop && maxRenderBufferSize) {
        if (finalScreenSize > 1043624 && maxRenderBufferSize > 5000 && workerPoolSize >= 4) {
          if (finalScreenSize > 1296000 && maxRenderBufferSize > 10000) {
            stateToUpdate.selectedIndex = 2
          } else stateToUpdate.selectedIndex = 1
        }
        else stateToUpdate.selectedIndex = 0
      }

      stateToUpdate.suggestedIndex = stateToUpdate.selectedIndex
      this.setState(stateToUpdate)
    }
    catch(error) {
      console.error(error);
      this.setState(stateToUpdate)
    }
  }

  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }

  handleClose = () => {
    this.props.history.push('/')
  }

  render () {
    const { theme, locale, changeLocale, setFullscreen, translate, history } = this.props
    const { isMobile, isMobileOrTablet, selectedIndex, suggestedIndex, specs, openSpecs } = this.state

    const selectedTitle = translate(isNaN(suggestedIndex) ? 'benchmarkPage.tier5Header' : 'benchmarkPage.tier' + (suggestedIndex + 1) + 'Header')

    return (
      <Dialog bodyStyle={{ backgroundImage: themes[theme].gradientColors[0] }} open
        contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
              contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0, margin: isMobile ? '0 0 0 82px' : '0 auto' }}
              onRequestClose={this.handleClose}>
        <Dialog
          title={translate('benchmarkPage.specsTitle')}
          actions={[
            <FlatButton
              label={translate('aor.action.cancel')}
              primary={true}
              onClick={() => this.setState({ openSpecs: false })}
            />]}
          bodyStyle={{ overflow: 'auto' }}
          modal={false}
          open={openSpecs}
          onRequestClose={() => this.setState({ openSpecs: false })}
        >
          { <div style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: syntaxHighlight(specs) }} /> }
        </Dialog>
        {isMobile ? <Card style={{ ...styles.card, minWidth: ''}}><p style={{ color: 'red' }}>Sorry, no mobile version yet.</p> <p>Check back on your desktop!</p></Card> : <Card style={styles.card}>
          <div>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle style={{ ...styles.label, color: themes[theme].foreColors[0], minWidth: 400 }}
                  text={translate('benchmarkPage.title')} />
              </ToolbarGroup>
              <ToolbarGroup>
                <SelectField
                  autoWidth={true}
                  underlineStyle={{ width: 'calc(100% - 46px)' }}
                  value={locale}
                  onChange={(event, index, value) => {
                    localStorage.setItem('chs_locale', value)
                    utilsQuery.updateQueryStringParameter('locale', value)
                    changeLocale(value)
                  }}
                  style={{ ...styles.label, color: themes[theme].foreColors[0] }}
                  floatingLabelStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
                  inputStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
                  textareaStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
                  hintStyle={{ ...styles.label, color: themes[theme].foreColors[0] }}
                >
                  {properties.languageOptions.map((el) => {
                    return <MenuItem key={el.id} value={el.id} primaryText={el.name} />
                  })}
                </SelectField>
                <IconButton
                  tooltipPosition='bottom-left'
                  tooltip={translate("aor.action.close")} touch key={'close'} containerElement={<Link to='/' />}>
                  <CloseIcon hoverColor={themes[theme].highlightColors[0]} />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <GridList
            cols={2.2}
            cellHeight={436}
            padding={16}
            style={{
              paddingTop: '1em',
              display: 'flex',
              flexWrap: 'nowrap',
              overflowX: 'auto',
            }}
          >
            <GridTile
              actionPosition="left"
              titlePosition="top"
              style={{ overflow: "visible" }}
              titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
            >

              <FlatButton
                className={(selectedIndex === 0) ? '' : ' cardPerformance'}
                onClick={() => { this.setState({ selectedIndex: 0 }) }}
                style={{ overflow: 'visible', height: '' }}
                icon={<Card style={{ height: '421px' }}>
                  <CardMedia>
                      <img src={"images/pp1.jpg"} style={{ filter: (selectedIndex !== 0) ? 'grayscale(100%)' : 'inherit' }} alt="" />
                      {(selectedIndex !== 0)
                        ? <RadioOffIcon color={themes[theme].backColors[0]} style={styles.radio} hoverColor={themes[theme].highlightColors[0]} />
                        : <RadioOnIcon color={themes[theme].backColors[0]} style={styles.radio} hoverColor={themes[theme].highlightColors[0]} />}
                  </CardMedia>
                  <CardTitle style={{ textAlign: 'left' }} title={translate('benchmarkPage.tier1Header')} subtitle={translate('benchmarkPage.tier1Description')} subtitleStyle={{ lineHeight: '16px' }} />
                </Card>}
              />
            </GridTile>
            <GridTile
              actionPosition="left"
              titlePosition="top"
              style={{ overflow: "visible" }}
              titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
            >
              <FlatButton
                className={(selectedIndex === 1) ? '' : ' cardPerformance'}
                onClick={() => { this.setState({ selectedIndex: 1 }) }}
                style={{ overflow: 'visible', height: '' }}
                icon={<Card style={{ height: '421px' }}>
                <CardMedia>
                  <img src={"images/pp2.jpg"} style={{ filter: (selectedIndex !== 1) ? 'grayscale(100%)' : 'inherit' }} alt="" />
                  {(selectedIndex !== 1) ? <RadioOffIcon color={themes[theme].backColors[0]} style={styles.radio} hoverColor={themes[theme].highlightColors[0]} /> : <RadioOnIcon color={themes[theme].backColors[0]} style={styles.radio} hoverColor={themes[theme].highlightColors[0]} />}
                </CardMedia>
                <CardTitle style={{ textAlign: 'left' }} title={translate('benchmarkPage.tier2Header')} subtitle={translate('benchmarkPage.tier2Description')} subtitleStyle={{ lineHeight: '16px' }} />
              </Card>}
              />
            </GridTile>
            <GridTile
              actionPosition="left"
              titlePosition="top"
              style={{ overflow: "visible" }}
              titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
            >
              <FlatButton
                className={(selectedIndex === 2) ? '' : ' cardPerformance'}
                onClick={() => { this.setState({ selectedIndex: 2 }) }}
                style={{ overflow: 'visible', height: '' }}
                icon={<Card style={{ height: '421px' }}>
                <CardMedia>
                  <img src={"images/pp3.jpg"} alt="" style={{ filter: (selectedIndex !== 2) ? 'grayscale(100%)' : 'inherit' }} />
                  {(selectedIndex !== 2) ? <RadioOffIcon style={styles.radio} color={themes[theme].backColors[0]} hoverColor={themes[theme].highlightColors[0]} /> : <RadioOnIcon color={themes[theme].backColors[0]} style={styles.radio} hoverColor={themes[theme].highlightColors[0]} />}
                </CardMedia>
                <CardTitle style={{ textAlign: 'left' }} title={translate('benchmarkPage.tier3Header')} subtitle={translate('benchmarkPage.tier3Description')} subtitleStyle={{ lineHeight: '16px' }} />
              </Card>}
              />
            </GridTile>
          </GridList>
          <p>{ReactHtmlParser(translate('benchmarkPage.suggestion1', { dontTranslate: selectedTitle} ))} <a className='customLink' style={{ color: themes[theme].highlightColors[0] }} onClick={() => { this.setState({ openSpecs: true }) }}>{translate('benchmarkPage.suggestion2')}</a>.
          </p>
          { (isMobileOrTablet === 1 || isMobileOrTablet === 2) && <p style={{ color: 'red' }}>{translate("benchmarkPage.warning" + isMobileOrTablet)}</p> }
          <Divider />
          <div style={{ paddingTop: 6, fontSize: 'small'}}>{translate("benchmarkPage.hint")}</div>
          <CardActions style={{ textAlign: 'right' }}>
            <div><RaisedButton label={translate('benchmarkPage.continue')} onClick={() => {
              const { selectedIndex } = this.state
              const { setEpic, setMarker, setMarkerLimit } = this.props
              let selectedMarker = selectedIndex === 0 ? [] : markerIdNameArray.map(el => el[0])
              let selectedEpics = selectedIndex === 2 ? ['ei', 'es', 'ew'] : []
              let selectedLimit = selectedIndex === 2 ? 5500 : 2000
              setMarker(selectedMarker)
              setEpic(selectedEpics)
              if (selectedLimit !== 2000) setMarkerLimit(selectedLimit)

              localStorage.setItem('chs_performance', true)
              localStorage.setItem('chs_performance_set', selectedIndex)
              utilsQuery.updateQueryStringParameter('markers', selectedMarker)
              utilsQuery.updateQueryStringParameter('epics', selectedEpics)
              utilsQuery.updateQueryStringParameter('limit', selectedLimit)
              history.push('/info')

            }} /></div>
          </CardActions>
        </Card>}
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
  theme: state.theme,
  locale: state.locale,
})

export default connect(mapStateToProps, {
  changeLocale: changeLocaleAction,
  setMarkerLimit,
  setMarker,
  setEpic
})(translate(PerformanceSelector))
