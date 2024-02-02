/* eslint-disable global-require */
/* eslint-disable camelcase */

import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { ChangeEvent } from 'react';
import CustomRadio from './ImageRadio';
import { Proprietate } from './types.d';

type props = {
  proprietate: {
    name: string;
    icon: any;
    value: Proprietate;
  }[];
  handler: (event: ChangeEvent<HTMLInputElement>) => void;
  value: Proprietate;
};

export default function Catagories({ proprietate, handler, value }: props) {
  return (
    <FormControl sx={{ marginTop: 5, width: '100%' }}>
      <FormLabel
        id="proprietate"
        sx={{ marginBottom: 2, fontSize: 18, textDecoration: 'solid' }}
      >
        Proprietate
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="proprietate"
        value={value}
        onChange={handler}
      >
        {proprietate.map((e) => (
          <FormControlLabel
            key={e.name}
            labelPlacement="bottom"
            value={e.value}
            control={<CustomRadio icon={<img src={e.icon} alt={e.name} />} />}
            label={e.name}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
