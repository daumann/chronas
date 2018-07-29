/**
 * Created by aumann on 06.07.17.
 */
import React from 'react';
;
import withWidth from 'material-ui/utils/withWidth';

export const Responsive = ({ small, medium, large, width, ...rest }) => {
  let component;
  switch (width) {
    case 1:
      component = small ? small : (medium ? medium : large);
      break;
    case 2:
      component = medium ? medium : (large ? large : small);
      break;
    case 3:
      component = large ? large : (medium ? medium : small);
      break;
    default:
      throw new Error(`Unknown width ${width}`);
  }
  return React.cloneElement(component, rest);
};


export default withWidth()(Responsive);
