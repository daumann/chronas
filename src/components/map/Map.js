import React, {Component} from 'react'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import LayersIcon from 'material-ui/svg-icons/maps/layers'
import { Link } from 'react-router-dom'
import pure from 'recompose/pure'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { translate, defaultTheme } from 'admin-on-rest'
import { activeYear, provinceCollection, provArea, adjacent, relPlus, rulPlus } from './data/datadef'
import { setRightDrawerVisibility as setRightDrawerVisibilityAction } from '../content/actionReducers'
import { setItemId as setItemIdAction } from './actionReducers'
import { chronasMainColor } from '../../styles/chronasColors'
import { tooltip } from '../../styles/chronasStyleComponents'
import {render} from 'react-dom'
import {fromJS} from 'immutable'
import MapGL, {Marker, Popup} from 'react-map-gl'
import {json as requestJson} from 'd3-request'
import properties from '../../properties'
import {defaultMapStyle, provincesLayer, markerLayer, clusterLayer, markerCountLayer, provincesHighlightedLayer, highlightLayerIndex, basemapLayerIndex} from './mapStyles/map-style.js'
import utils from './utils'
import fakeRestServer from '../../dummyRest/restServer'

import _ from 'lodash'

import Timeline from './timeline/MapTimeline'

import BasicInfo from './markers/basic-info'
import BasicPin from './markers/basic-pin'

const provinceThreshold = 4

class Map extends Component {

  state = {
    mapStyle: defaultMapStyle,
    year: 'Tue May 10 1086 16:17:44 GMT+1000 (AEST)',
    data: null,
    viewport: {
      latitude: 30.88,
      longitude: 0,
      zoom: 2,
      minZoom: 2,
      bearing: 0,
      pitch: 0,
      width: 500,
      height: 500
    },
    hoverInfo: null,
    popupInfo: null
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
    this.restoreFetch = fakeRestServer();


    window.addEventListener('load', function() {

      fetch('http://fakeapi/provinces')
        .then(res => res.text())
        .then(res => this._loadGeoJson('provinces', JSON.parse(res)))
        .then( () => {
          var activeTextFeat = 'country'
          var activeAreaFeat = 'country'

          var countryIsSetup = false
          var culIsSetup = false
          var relIsSetup = false
          var relGenIsSetup = false

          var rulStops = [],
            relStops = []

          /*
           map.addSource('realm-lines', {
           'type': 'geojson',
           'data': provinceCollection
           });
           */

          var rulKeys = Object.keys(rulPlus)
          for (var i=0; i < rulKeys.length; i++) {
            rulStops.push([rulKeys[i], rulPlus[rulKeys[i]][1]])
          }

          var relKeys = Object.keys(relPlus)
          for (var i=0; i < relKeys.length; i++) {
            relStops.push([relKeys[i], relPlus[relKeys[i]][1]])
          }

          var layers = []; //bucket to hold our data layers.  We'll fill this in next.

          /*
           layers.push({
           "id": "realm-lines",
           "type": "line",
           "source": "realm-lines",
           "paint": {
           'line-color': {
           'property': 'n',
           'type': 'categorical',
           'stops': rulStops,
           'default': "rgba(1,1,1,0.3)"
           },
           'line-width': 6,
           'line-opacity': .6,
           'line-blur': 6,
           // 'fill-outline-color': 'rgba(0,0,0,.2)'
           }
           })
           */

          layers.push({
            id: 'religion',
            type: 'fill',
            source: 'provinces',
            'minzoom': properties.provinceThreshold,
            paint: {
              'fill-color': {
                'property': 'e',
                'type': 'categorical',
                'stops': relStops,
                'default': "rgba(1,1,1,0.3)"
              },
              'fill-opacity': 0.6,
              'fill-outline-color': 'rgba(0,0,0,.2)'
            }
          })
/*
          layers.push({
            id: 'ruler',
            type: 'fill',
            'maxzoom': properties.provinceThreshold,
            source: 'provinces',
            "layout": {
              "visibility": "visible"
            },
            paint: {
              'fill-color': {
                'property': 'r',
                'type': 'categorical',
                'stops': rulStops,
                'default': "rgba(1,1,1,0.3)"
              },
              'fill-opacity': 0.6,
              'fill-outline-color': 'rgba(0,0,0,.2)'
            }
          })
*/

          layers.push({
            id: 'ruler-hover',
            type: 'fill',
            source: 'provinces',
            paint: {
              'fill-color': {
                'property': 'r',
                'type': 'categorical',
                'stops': rulStops,
                'default': "rgba(1,1,1,0.3)"
              },
              'fill-opacity': 0.9,
              'fill-outline-color': 'rgba(0,0,0,.2)'
            },
            "filter": ["==", "r", ""]
          })

          // layers.push({
          //   "id": "area-labels",
          //   "type": "symbol",
          //   "source": "area-labels",
          //   "layout": {
          //     "symbol-spacing": 100,
          //     "icon-allow-overlap": false,
          //     "text-field": "{n}",
          //     "text-font": ["Cinzel Regular"],
          //     "text-size": //20//20,//{"type": "identity", "property": "d" }
          //       {
          //         "type": "exponential",
          //         "stops": [
          //           // zoom is 0 and "rating" is 0 -> circle radius will be 0px
          //           [{zoom: 0, value: 100}, 0],
          //
          //           // zoom is 0 and "rating" is 5 -> circle radius will be 5px
          //           [{zoom: 0, value: 800}, 2],
          //
          //           // zoom is 20 and "rating" is 0 -> circle radius will be 0px
          //           [{zoom: 20, value: 100}, 50],
          //
          //           // zoom is 20 and "rating" is 5 -> circle radius will be 20px
          //           [{zoom: 20, value: 800}, 250]
          //
          //         ], "property": "d"
          //         // type": "identity", "property": "d" }
          //       },
          //     "text-transform": "uppercase",
          //     // "text-max-width": +"{d}",
          //     "text-rotate": {"type": "identity", "property": "ro" }
          //   },
          //   "paint": {
          //     "text-color": "#333",
          //     "text-halo-width": 1,
          //     "text-halo-blur": 1,
          //     "text-halo-color": "#FFFBE5"
          //   }
          // })

          layers.push({
            "id": "area-outlines",
            "type": "line",
            "source": "area-outlines",
            "paint": {
              'line-color': {
                'property': 'n',
                'type': 'categorical',
                'stops': rulStops,
                'default': "rgba(1,1,1,0.5)"
              },
              'line-width': 4,
              'line-opacity': .6,
              'line-blur': 2,
              // 'fill-outline-color': 'rgba(0,0,0,.2)'
            }
          })

          layers.push({
            "id": "area-labels",
            "type": "symbol",
            "source": "area-outlines",
            "layout": {
              "symbol-spacing": 1000,
              "icon-allow-overlap": false,
              "text-field": "{nameLabel}",
              "text-font": ["Cinzel Regular"],
              "text-transform": "uppercase",
              "text-size": //20//20,//{"type": "identity", "property": "d" }
                {
                  "type": "exponential",
                  "stops": [
                    // zoom is 0 and "rating" is 0 -> circle radius will be 0px
                    [{zoom: 0, value: 100}, 0],

                    // zoom is 0 and "rating" is 5 -> circle radius will be 5px
                    [{zoom: 0, value: 800}, 2],

                    // zoom is 20 and "rating" is 0 -> circle radius will be 0px
                    [{zoom: 20, value: 100}, 50],

                    // zoom is 20 and "rating" is 5 -> circle radius will be 20px
                    [{zoom: 20, value: 800}, 250]

                  ], "property": "d"
                  // type": "identity", "property": "d" }
                },
            },
            "paint": {
              "text-color": "#333",
              "text-halo-width": 1,
              "text-halo-blur": 1,
              "text-halo-color": "#FFFBE5"
            }
          })
          const prevMapStyle = this.state.mapStyle

          let mapStyle = prevMapStyle
            // .update('layers', list => list.concat(layers))
          .set('layers', prevMapStyle.get('layers').concat(fromJS(layers)))

/*
          let mapStyle = prevMapStyle
            .updateIn(['sources', sourceId, 'data', 'features'], list => list.map(function(feature) {
              feature.properties.r = (activeYear[feature.properties.name] || [])[0]
              feature.properties.e = (activeYear[feature.properties.name] || [])[2]
              return feature
            }))
          */

          this.setState({mapStyle});



          // Update data source

          var delay=100, setTimeoutConst, isActive = false;

          /*
           map.on("mousemove", "ruler", function(e) {
           if (!isActive) {
           isActive = true;
           map.setFilter("ruler-hover", ["==", "r", (activeYear[e.features[0].properties.name] || [])[0]]);
           setTimeout(function(){
           isActive = false;
           }, delay);
           }
           });
           */
          /*
           // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
           map.on("mouseleave", "ruler", function() {
           map.setFilter("ruler-hover", ["==", "r", ""]);
           });
           */

          this._simulateYearChange()
          this._simulateDimChange("country")


          // .then(res => this._loadGeoJson(
          //   'markers',
          //   fromJS({
          //     cluster: true,
          //     clusterMaxZoom: 14, // Max zoom to cluster points on
          //     clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50),
          //     type: 'geojson',
          //     data: JSON.parse(res)
          //   })
          // ));
        })

    }.bind(this))

  }

  _simulateDimChange = (newArea) => {
    console.debug("changing dim " + newArea)
    // if (map.getLayoutProperty('ruler', 'visibility') !== 'none'){
    //   activeTextFeat = 'country'
    //   map.setLayoutProperty('religion', 'visibility', 'visible');
    //   map.setLayoutProperty('ruler', 'visibility', 'none');
    // } else {
    //   activeTextFeat = 'religion'
      const plCol = utils.addTextFeat(newArea)

      const prevMapStyle = this.state.mapStyle
      let mapStyle = prevMapStyle
        .setIn(['sources', 'area-labels', 'data'], fromJS(plCol[0]))
        .setIn(['sources', 'area-outlines', 'data'], fromJS(plCol[2]))
      console.debug("plCol",plCol)
      this.setState({mapStyle});
    // }
    //   map.setLayoutProperty('ruler', 'visibility', 'visible');
    //   map.setLayoutProperty('religion', 'visibility', 'none');
    // }
  }

  _simulateYearChange = () => {
    const sourceId = "provinces"
    const prevMapStyle = this.state.mapStyle
    let geojson = prevMapStyle
      .getIn(['sources', sourceId, 'data']).toJS()

    console.debug("simuldadassateYdasearChange", geojson)

    let mapStyle = prevMapStyle
      .updateIn(['sources', sourceId, 'data', 'features'], list => list.map(function(feature) {
        feature.properties.r = (activeYear[feature.properties.name] || [])[0]
        feature.properties.e = (activeYear[feature.properties.name] || [])[2]
        return feature
      }))

    this.setState({mapStyle});
  }

  componentWillReceiveProps(nextProps) {

    const {basemap, selectedArea, selectedMarkers} = this.props;

    console.debug("### MAP componentWillReceiveProps", this.props,nextProps)

    /** Acting on store changes **/

    // Basemap changed?

    if (basemap != nextProps.basemap) {
      console.debug("###### Basemap changed")
      const newMapStyle = this.state.mapStyle.setIn(['layers', basemapLayerIndex, 'source'], nextProps.basemap)
      this.setState({
        mapStyle: newMapStyle,
      });
    }

    // Area changed?
    if (selectedArea != nextProps.selectedArea) {
      console.debug("###### Area changed" + nextProps.selectedArea)
      this._simulateDimChange(nextProps.selectedArea)

    }

    // Markers changed?
    if (!_.isEqual(selectedMarkers.sort(), nextProps.selectedMarkers.sort())) {
      const removedMarkers = _.difference(selectedMarkers, nextProps.selectedMarkers);
      const addedMarkers = _.difference(nextProps.selectedMarkers, selectedMarkers);
      console.debug("###### Markers changed")

      //iterate to remove
      for (const removedMarker of removedMarkers) {
        console.log("removing Marker", removedMarker);
        this._removeGeoJson('markers', removedMarker)
      }

      //iterate to add
      for (const addedMarker of addedMarkers) {
        console.log("addedMarker",addedMarker);
        fetch('http://fakeapi/markers_' + addedMarker)
          .then(res => res.text())
          .then(res => this._loadGeoJson('markers', JSON.parse(res)));
      }
    }

    // if drawer changed
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || (window.innerWidth - 56),
        height: (this.props.height || window.innerHeight)
      }
    });
  };

  _loadGeoJson = (sourceId, sourceData) => {
    // utils.updatePercentiles(data, f => f.properties.income[this.state.year]);
    const prevMapStyle = this.state.mapStyle
    let mapStyle = prevMapStyle
      .setIn(['sources', sourceId, 'data', 'features'], sourceData.features)
    this.setState({mapStyle});
  };

  _removeGeoJson = (sourceId, entityId) => {
    const prevMapStyle = this.state.mapStyle
    let geojson = prevMapStyle
      .getIn(['sources', sourceId, 'data']).toJS()

    console.debug(geojson)

    // let mapStyle = prevMapStyle
    //   .setIn(['sources', sourceId, 'data'],
    //     fromJS({
    //       "type": "FeatureCollection",
    //       "features": geojson.features.filter(function(obj) {
    //       return (-1 === obj.properties._storage_options.iconUrl.indexOf("/static/i/b"))
    //       }) }
    //     ))

    let mapStyle = prevMapStyle
      .updateIn(['sources', sourceId, 'data', 'features'], list => list.filter(function(obj) {
        return (-1 === obj.properties._storage_options.iconUrl.indexOf("/static/i/b"))
      }))

    this.setState({mapStyle});
  };

  _loadMarkerData = data => {
    data.features.map((markerData, iter) => (
      this._renderBasicMarker(markerData, iter)
    ))
  };

  _renderBasicMarker = (markerData, index) => {
    return (
      <Marker key={`marker-${index}`}
              longitude={markerData.geometry.coordinates[0]}
              latitude={markerData.geometry.coordinates[1]}>
        <BasicPin size={20} onClick={() => this.setState({popupInfo: markerData.properties})} />
      </Marker>
    );
  }

  _onViewportChange = viewport => this.setState({viewport});

  _updateSettings = (name, value) => {
    if (name === 'year') {
      this.setState({year: value});

      const {data, mapStyle} = this.state;
      if (data) {
        // utils.updatePercentiles(data, f => f.properties.income[value]);
        const newMapStyle = mapStyle.setIn(['sources', 'incomeByState', 'data'], fromJS(data));
        this.setState({mapStyle: newMapStyle});
      }
    }
  };

  _onHover = event => {
    let countyName = '';
    let hoverInfo = null;

    const county = event.features && event.features.find(f => f.layer.id === 'provinces');
    if (county) {
      hoverInfo = {
        lngLat: event.lngLat,
        county: county.properties
      };
      countyName = county.properties.name;
    }

    this.setState({
      hoverInfo
    });

  };

  _onClick = event => {
    let itemName = '';
    let itemId = '';

    const item = event.features && event.features.find(f => f.layer.id === 'provinces');
    if (item) {
      itemName = item.properties.name;
      itemId = item.properties.wikiUrl;
    }

    console.debug(event)

    if (itemName !== '') {
      this.map.getMap().flyTo({
        center: [
          event.lngLat[0],
          event.lngLat[1]
        ]
      })
    }

    this.props.setRightDrawerVisibility(itemName !== '')
    this.props.setItemId(itemId)
  };

  _renderPopup() {
    const {hoverInfo, popupInfo} = this.state;
    if (hoverInfo) {
      return (
        <Popup longitude={hoverInfo.lngLat[0]} latitude={hoverInfo.lngLat[1]} closeButton={false}>
          <div className="county-info">{JSON.stringify(hoverInfo)}</div>
        </Popup>
      );
    }
    if (popupInfo) {
      return (
        <Popup tipSize={5}
               anchor="top"
               longitude={popupInfo.longitude}
               latitude={popupInfo.latitude}
               onClose={() => this.setState({popupInfo: null})} >
          <BasicInfo info={popupInfo} />
        </Popup>
      );
    }
    return null;
  }

  _renderTooltip() {
    const {hoveredFeature, year, x, y} = this.state;

    return hoveredFeature && (
        <div className="tooltip" style={{left: x, top: y}}>
          <div>State: {hoveredFeature.properties.name}</div>
          <div>Median Household Income: {hoveredFeature.properties.value}</div>
          <div>Percentile: {hoveredFeature.properties.percentile / 8 * 100}</div>
        </div>
      );
  }

  render() {
    const {viewport, mapStyle} = this.state;

    let leftOffset = (this.props.menuDrawerOpen) ? 156 : 56
    if (this.props.rightDrawerOpen) leftOffset -= 228

    return (
      <div style={{
        left: leftOffset,
        position: 'absolute',
        top: 0,
        width: 'calc(100% - 56px)',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1), right 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <MapGL
          ref={(map) => { this.map = map; }}
          {...viewport}
          mapStyle={mapStyle}
          onViewportChange={this._onViewportChange}
          onHover={this._onHover}
          onClick={this._onClick}
        >

          {this._renderPopup()}
        </MapGL>
        <Timeline/>
      </div>
    );
  }

}

Map.propTypes = {
  hasDashboard: PropTypes.bool,
  logout: PropTypes.element,
  onMenuTap: PropTypes.func,
  // resources: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired,
};

Map.defaultProps = {
  onMenuTap: () => null,
};

const enhance = compose(
  connect(state => ({
    theme: state.theme,
    locale: state.locale,
    basemap: state.basemap,
    selectedArea: state.selectedArea,
    selectedMarkers: state.selectedMarkers,
    selectedItem: state.selectedItem,
    menuDrawerOpen: state.menuDrawerOpen,
    rightDrawerOpen: state.rightDrawerOpen,
  }), {
    setRightDrawerVisibility: setRightDrawerVisibilityAction,
    setItemId: setItemIdAction
  }),
  pure,
  translate,
);

export default enhance(Map);
