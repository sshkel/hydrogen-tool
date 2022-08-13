import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

import { BLUE } from "../input/colors";

interface Props {
  title?: string;
  data: { [key: string]: number };
}
export default function BasicTable(props: Props) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="summary-of-results">
        <TableBody>
          {Object.keys(props.data).map((k: string) => (
            <TableRow key={k}>
              <TableCell>
                <Typography fontWeight="bold" color={BLUE}>
                  {k}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight="bold">
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
