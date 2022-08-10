import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

interface Props {
  title?: string;
  data: { [key: string]: number };
}
export default function BasicTable(props: Props) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableBody>
          {Object.keys(props.data).map((k: string) => (
            <TableRow key={k}>
              <TableCell>{k}</TableCell>
              <TableCell>{props.data[k].toLocaleString("en-US")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
