/* eslint-disable no-console */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { ChangeEvent, SyntheticEvent, useRef, useState } from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import Catagories from './Catagories';
import {
  LocationType,
  Proprietate,
  Tranzactie,
  filterDataType,
} from './types.d';
import ProxyDialog from '../proxyView';
// sd

const proprietate = [
  {
    name: 'apartment',
    icon: require('assets/icons/ic_filter_apartment_default.png'),
    value: Proprietate.apartment,
  },
  {
    name: 'commercial',
    icon: require('assets/icons/ic_filter_commercial_default.png'),
    value: Proprietate.commercial,
  },
  {
    name: 'Case/Vile',
    icon: require('assets/icons/ic_filter_house_default.png'),
    value: Proprietate.house_vile,
  },
  {
    name: 'terrain',
    icon: require('assets/icons/ic_filter_terrain_default.png'),
    value: Proprietate.terrain,
  },
];
// headers

// Intial sugessts
const intialsuggests: LocationType[] = [
  {
    nume: 'DN 2 (zon&#259; &icirc;n Bucuresti)',
    id: 1004255,
    tip: 4,
    id_zona: 1397,
    id_localitate: 13822,
    nume_judet: 'Bucuresti Ilfov',
    id_judet: 10,
    nume_localitate: 'Bucuresti',
  },
];
const intial: filterDataType = {
  localitate: intialsuggests[0],
  zone: 'all',
  proprietate: Proprietate.apartment,
  tranzactie: Tranzactie.Devânzare,
};
const getAllOverCountryOption: LocationType = {
  id: '',
  nume: 'Get All Over Country',
  nume_localitate: 'Get All Over Country',
  id_localitate: '',
  id_judet: '',
  nume_judet: '',
  tip: 0,
  id_zona: '',
};

export default function Filter() {
  const previousController = useRef();
  const [filter, setFilter] = useState<filterDataType>(intial);
  const [checked, setChecked] = useState(false);
  const [suggests, setSuggests] = useState([
    getAllOverCountryOption,
    ...intialsuggests,
  ]);
  const [fpath, SetPath] = useState('');

  const handler = (
    event: ChangeEvent<HTMLInputElement> | SelectChangeEvent<string | null>,
  ) => {
    console.log(event.target.name);
    setFilter({ ...filter, [event.target.name]: event.target.value });
  };
  const handler1 = (value: LocationType) => {
    setFilter({ ...filter, localitate: value });
  };
  const [loading, setLoading] = useState(true);
  const autoCompletehandler = (
    event: SyntheticEvent<Element, Event>,
    value: string,
    reason: any,
  ) => {
    setLoading(true);
    window.IPCMainHandler.getSuggestLocations(value)
      .then((d: LocationType[]) => {
        setSuggests([
          getAllOverCountryOption,
          ...d.filter((e) => e.id_localitate),
        ]);
        setLoading(false);
      })
      .catch((e: Error) => {
        console.error(e);
      });
  };
  const decodeHtmlEntities = (input: string) => {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.documentElement.textContent || '';
  };

  const defaultProps = {
    options: suggests,
    isOptionEqualToValue: (option: LocationType, selectedValue: LocationType) =>
      option.nume === selectedValue.nume,
    getOptionLabel: (option: LocationType) =>
      option.nume
        ? decodeHtmlEntities(option.nume)
        : decodeHtmlEntities(option.nume_localitate),
    getOptionKey: (option: LocationType) => option.id,
  };

  const [openState, setOpen] = useState(false);

  return (
    <Paper>
      <ProxyDialog
        openState={openState}
        handleClose={(e: any) => {
          setOpen(false);
        }}
      />
      <Card sx={{ minWidth: '200px', height: '96vh' }}>
        <CardHeader title="Filter" subheader={new Date().toUTCString()} />
        <CardContent>
          <div>
            <Autocomplete
              {...defaultProps}
              disablePortal
              id="auto_complete"
              sx={{ width: 300 }}
              onChange={(event, newValue) => {
                if (newValue) handler1(newValue);
              }}
              onInputChange={autoCompletehandler}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="localitate"
                  value={filter.localitate}
                  id="standard-basic"
                  label="Introdu localitate, zone, ansambluri"
                  variant="standard"
                  fullWidth
                />
              )}
            />

            <FormControl sx={{ minWidth: 300, marginTop: 2 }}>
              <Select
                disabled
                value={filter.zone}
                onChange={handler}
                name="zone"
                autoWidth
                variant="standard"
                displayEmpty
                label="Introdu localitate, zone, ansambluri"
              >
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
            {/* Transactio */}

            <FormControl sx={{ minWidth: 300, marginTop: 2 }}>
              <Select
                value={filter.tranzactie as unknown as string}
                onChange={handler}
                name="tranzactie"
                fullWidth
                variant="standard"
                label="Introdu localitate, zone, ansambluri"
              >
                <MenuItem selected value={Tranzactie.Devânzare}>
                  Devânzare
                </MenuItem>
                <MenuItem value={Tranzactie.Deînchiriat}>Deînchiriat</MenuItem>
              </Select>
            </FormControl>
            {/* getFileInput */}
            <TextField
              disabled
              value={fpath}
              id="outlined-start-adornment"
              sx={{ mt: 2, minWidth: 300 }}
              variant="filled"
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    onClick={async () => {
                      const e = await window.IPCMainHandler.openPathDialog();
                      SetPath(e[0]);
                    }}
                    sx={{ color: 'green', cursor: 'pointer' }}
                    position="end"
                  >
                    <FolderIcon />
                  </InputAdornment>
                ),
              }}
            />
            {/* Catagories */}
            <Catagories
              proprietate={proprietate}
              handler={handler}
              value={filter.proprietate}
            />
          </div>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(true);
            }}
          >
            AddProxy
          </Button>
          <Button
            size="medium"
            onClick={() => {
              window.IPCMainHandler.getDataStatus(filter);
            }}
            variant="outlined"
          >
            getStatus
          </Button>
          <Button
            variant="contained"
            size="medium"
            onClick={async () => {
              // console.log('startwith', filter);
              if (fpath !== '') {
                window.IPCMainHandler.startAll(filter, fpath);
              } else {
                const e = await window.IPCMainHandler.openPathDialog();
                SetPath(e[0]);
              }
            }}
          >
            Start
          </Button>
        </CardActions>
      </Card>
    </Paper>
  );
}
