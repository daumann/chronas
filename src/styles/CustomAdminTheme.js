import {
  cyan500,
  cyan700,
  darkBlack,
  fullBlack,
  grey100,
  grey300,
  grey400,
  grey500,
  pinkA200,
  white,
} from 'material-ui/styles/colors'
import { fade } from 'material-ui/utils/colorManipulator'
import spacing from 'material-ui/styles/spacing'

const customTheme = {
  spacing: spacing,
  fontFamily: 'inherit',
  drawer: {
    width: 50
  },
  palette: {
    primary1Color: cyan500,
    primary2Color: cyan700,
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
  tabs: {
    backgroundColor: 'white',
    selectedTextColor: '#00bcd4',
    textColor: '#757575',
  },
  inkBar: {
    backgroundColor: '#00bcd4',
  },
  baseTheme: {
    palette: {
      primary1Color: '#00bcd4',
      accent1Color: '#ff4081'
    }
  }
}

export default customTheme
