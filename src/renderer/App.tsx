/* eslint-disable react/prefer-stateless-function */
import { Grid } from '@mui/material';
import './App.css';
import React from 'react';
import Filter from './filter';
import Dataview from './dataView';

export default class App extends React.Component {
  render(): React.ReactNode {
    console.log('Entirre APp renderd');

    return (
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding={1}
        overflow="auto"
      >
        <Grid item xs={5}>
          <Filter />
        </Grid>
        <Grid item xs={7}>
          <Dataview />
        </Grid>
      </Grid>
    );
  }
}
