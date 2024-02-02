/* eslint-disable camelcase */
/* eslint-disable react/no-danger */
import { useState } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Card, CardContent, IconButton } from '@mui/material';

function Logger_View({ logger_Data }: { logger_Data: string }) {
  const [expand, setExpand] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div>
        <Card
          component="span"
          sx={{
            p: 2,
            border: '1px solid black',
            mt: 2,
            position: 'relative',

            display: 'block',
            minHeight: expand ? '500px' : '300px',
            maxHeight: 200,
            overflowY: 'auto',
          }}
          style={{
            fontSize: 13,
            textAlign: 'left',
            backgroundColor: '#1f2937',
          }}
        >
          <IconButton
            onClick={() => {
              setExpand(!expand);
            }}
          >
            {expand ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
          </IconButton>
          <CardContent
            className="console-content"
            sx={{
              lineHeight: 1.5,
              fontSize: 12,
              fontFamily: 'Courier New, monospace',
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: logger_Data === '' ? 'no log here' : logger_Data,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Logger_View;
