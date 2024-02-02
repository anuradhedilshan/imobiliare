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
        spacing={0.7}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding={2}
      >
        <Grid xs={5}>
          <Filter />
        </Grid>
        <Grid xs="auto">
          <Dataview />
        </Grid>
      </Grid>
    );
  }
}
