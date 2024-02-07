import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  TextField,
} from '@mui/material';
import { useState } from 'react';

type proxyDialogT = {
  openState: boolean;
  handleClose: (e: any) => void;
};

export default function ProxyDialog({ openState, handleClose }: proxyDialogT) {
  const [text, setText] = useState('');
  const [isloding, setLoading] = useState(false);
  return (
    <Dialog maxWidth="xs" fullWidth open={openState} onClose={handleClose}>
      <DialogTitle>Add Proxy List</DialogTitle>
      <DialogContent>
        <span>ex :socks5://123:123:123.123:532</span>
        <br />
        <span>socks5://uname:pass@45.155.68.129:8133</span>
        <br />

        <TextField
          disabled={isloding}
          sx={{ marginY: 2 }}
          id="outlined-multiline-static"
          fullWidth
          variant="filled"
          multiline
          rows={10}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
        <Box sx={{ m: 1, position: 'relative' }}>
          <Button
            variant="contained"
            disabled={isloding}
            onClick={async () => {
              setLoading(true);
              const list = await window.IPCMainHandler.addProxy(text);

              setLoading(false);
              setText(list.map((e) => e.full).join('\n'));
            }}
          >
            {isloding ? 'Testing Proxy Servers' : 'Load Ip List'}
          </Button>
          {isloding && (
            <CircularProgress
              size={24}
              sx={{
                color: 'green',
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
