import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

import { BLUE } from "../colors";
import { StyledCard } from "./Styles";

interface Props {
  title?: string;
  data: { [key: string]: number };
}

function generateId(i: number, suffix: string) {
  return `summary-of-results-${i}-${suffix}`;
}

export function SummaryOfResultsPane(summaryTable: { [key: string]: number }) {
  return (
    <StyledCard>
      <CardHeader
        id="summary-of-results"
        title="Summary of Results"
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          paddingTop: 0,
        }}
      >
        <SummaryOfResultsTable title="Summary of Results" data={summaryTable} />
      </CardContent>
    </StyledCard>
  );
}

export function SummaryOfResultsTable(props: Props) {
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
                  {`${props.data[k].toLocaleString("en-US")}${rowNameToLabel(
                    k
                  )}`}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// TODO Make results return units as part of summaryTableData.
function rowNameToLabel(name: string) {
  if (name.includes("Capacity Factor")) {
    return "%";
  } else if (name.includes("Time")) {
    return "% of hrs/yr";
  } else if (name.includes("Energy")) {
    return " MWh/yr";
  } else if (name.includes("Output")) {
    return " TPA";
  } else if (name.startsWith("LC")) {
    return " $/kg";
  }
}
