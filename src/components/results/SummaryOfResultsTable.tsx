import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

import { BLUE } from "../colors";

interface Props {
  title?: string;
  data: { [key: string]: number };
}

function generateId(i: number, suffix: string) {
  return `summary-of-results-${i}-${suffix}`;
}

export default function SummaryOfResultsTable(props: Props) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="summary-of-results" size="small">
        <TableBody>
          {Object.keys(props.data).map((k: string, i: number) => (
            <TableRow key={k}>
              <TableCell>
                <Typography
                  id={generateId(i, "key")}
                  fontWeight="bold"
                  color={BLUE}
                >
                  {k}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography id={generateId(i, "value")} fontWeight="bold">
                  {props.data[k].toLocaleString("en-US")}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
