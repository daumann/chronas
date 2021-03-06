import React from 'react'
import { GridList as MuiGridList, GridTile } from 'material-ui/GridList'
import { EditButton, NumberField, TextField } from 'admin-on-rest'

const styles = {
  root: {
    margin: '-2px',
  },
  gridList: {
    width: '100%',
    margin: 0,
  },
}

const GridList = ({ ids, isLoading, data, currentSort, basePath, rowStyle }) => {
  return (<div style={styles.root}>
    <MuiGridList cellHeight={180} cols={4} style={styles.gridList}>
      {ids.map((id) => (
        <GridTile
          key={id}
          title={data[id].name}
          actionIcon={<EditButton basePath={basePath} record={data[id]} label='' />}
          titleBackground='linear-gradient(to top, rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0) 100%)'
        >{ids.length} {JSON.stringify(data[id].createdAt)}
          <TextField source='username' />
        </GridTile>
      ))}
    </MuiGridList>
  </div>)
}

export default GridList
