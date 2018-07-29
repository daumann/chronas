import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import locationReducer from './location'
import { adminReducer } from 'admin-on-rest'
import { modActiveReducer } from '../components/restricted/shared/buttons/actionReducers'
import { loadingReducer, metadataReducer } from '../components/map/data/actionReducers'
import { localeReducer, themeReducer } from '../components/menu/configuration/actionReducers'
import { mapStylesReducer, areaReducer, markerReducer, epicReducer } from '../components/menu/layers/actionReducers'
import { userReducer } from '../components/menu/authentication/actionReducers'
import { rightDrawerReducer } from '../components/content/actionReducers'
import { selectedItemReducer } from '../components/map/actionReducers'
import { yearReducer } from '../components/map/timeline/actionReducers'
import { menuDrawerReducer, menuIdReducer } from '../components/menu/actionReducers'
import { appReducer, boardUserReducer } from '../components/menu/board/ReForum/App/reducers'
import { feedReducer } from '../components/menu/board/ReForum/Views/ForumFeed/reducers'
import { singleDiscussionReducer } from '../components/menu/board/ReForum/Views/SingleDiscussion/reducers'
import { newDiscussionReducer } from '../components/menu/board/ReForum/Views/NewDiscussion/reducers'
import { adminInfoReducer } from '../components/menu/board/ReForum/Views/AdminDashboard/reducers'
import { userProfileReducer } from '../components/menu/board/ReForum/Views/UserProfile/reducers'
import { reducer as formReducer } from 'redux-form'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    admin: adminReducer,
    activeArea: areaReducer(),
    activeMarkers: markerReducer(),
    activeEpics: epicReducer(),
    mapStyles: mapStylesReducer(),
    form: formReducer,
    isLoading: loadingReducer(),
    locale: localeReducer(),
    location: locationReducer,
    metadata: metadataReducer(),
    menuDrawerOpen: menuDrawerReducer(),
    menuItemActive: menuIdReducer(),
    modActive: modActiveReducer(),
    userDetails: userReducer(),
    rightDrawerOpen: rightDrawerReducer(),
    routing: routerReducer,
    selectedItem: selectedItemReducer(),
    selectedYear: yearReducer(),
    theme: themeReducer(),
    // board: {
    user: boardUserReducer,
    app: appReducer,
    feed: feedReducer,
    discussion: singleDiscussionReducer,
    newDiscussion: newDiscussionReducer,
    adminInfo: adminInfoReducer,
    userProfile: userProfileReducer,
    // },
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
