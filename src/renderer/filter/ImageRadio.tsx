/* eslint-disable camelcase */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Radio, RadioProps, makeStyles, styled } from '@mui/material';
import ic_filter_apartment_ from 'assets/icons/ic_filter_apartment_default.png';
import com from 'assets/icons/ic_filter_commercial_default.png';

export default function CustomRadio(props: RadioProps) {
  return <Radio {...props} />;
}
