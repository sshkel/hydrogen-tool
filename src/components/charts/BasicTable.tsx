import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

interface Props {
  title?: string;
  data: { [key: string]: number[] };
}

export default function BasicTable(props: Props) {
  if (props.data == null) {
    return <div></div>;
  }
  const keys = Object.keys(props.data);
  const years = Array.from(Array(props.data[keys[0]].length).keys());
  const dataToVis: { [key: string]: number[] } = {
    ...props.data,
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {Object.keys(dataToVis).map((key: string) => (
              <TableCell>{key}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {years.map((year) => (
            <TableRow
              key={year}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {Object.keys(dataToVis).map((k: string) => (
                <TableCell align="right">
                  {dataToVis[k][year].toLocaleString("en-US")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
