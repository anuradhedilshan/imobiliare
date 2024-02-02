/* eslint-disable default-case */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-pascal-case */
import {
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import Logger_View from '../Logger_view';

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}
function formatDate(date: Date) {
  return `${[
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-')} ${[
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
    padTo2Digits(date.getSeconds()),
  ].join(':')}`;
}
function parseLog(
  type: 'error' | 'warn' | 'details',
  message: string | number,
) {
  return `   <span class='${type} log'><span align="left" style="color:grey">${formatDate(
    new Date(),
  )} : </span> ${message}</span> <br />`;
}

const intialStatus = {
  titlu: 'N/A',
  total: 'N/A',
  categorie: 'N/A',
  tranzactie: 'N/A',
};
export default function Dataview() {
  console.log('dataview Resnderd');

  const [logger, setLogger] = useState('');
  const [status, setStatus] = useState(intialStatus);
  const [progress, setProgress] = useState(0);

  window.IPCMainHandler.onEvent = (
    Type: 'progress' | 'count' | 'complete' | 'error' | 'details' | 'warn',
    message: number | boolean | string | null,
  ) => {
    switch (Type) {
      case 'count':
        break;
      case 'progress':
        console.log('Progress++++++++++++++++++++++++', message);
        setProgress(message as number);
        break;
      case 'complete':
        break;
      case 'error':
      case 'warn':
      case 'details':
        setLogger(logger + parseLog(Type, message as string));
        break;
    }
  };
  window.IPCMainHandler.onStatus = (arg: any) => {
    setStatus(arg);
  };
  return (
    <Paper>
      <Card sx={{ maxWidth: '490px', minWidth: '460px', height: '96vh' }}>
        <CardHeader title="DataView" subheader="StatusView" />
        <CardContent sx={{ position: 'relative' }}>
          <div>
            <Typography gutterBottom variant="subtitle1" component="div">
              <b>Titlu</b> - {status.titlu}
            </Typography>
            <Typography gutterBottom variant="subtitle1" component="div">
              <b>Total</b> - {status.total}
            </Typography>
            <Typography gutterBottom variant="subtitle1" component="div">
              <b>categorie</b> - {status.categorie}
              <b style={{ marginLeft: 10 }}>tranzactie</b> - {status.tranzactie}
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            sx={{ height: 20 }}
            value={progress}
          />
          <Logger_View logger_Data={logger} />
        </CardContent>
      </Card>
    </Paper>
  );
}
