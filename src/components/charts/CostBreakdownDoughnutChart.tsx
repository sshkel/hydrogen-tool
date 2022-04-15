import 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';

interface Props {
  title: string;
  labels: string[];
  data: number[];
}


// const state = {
//   labels: ['January', 'February', 'March',
//            'April', 'May'],
//   datasets: [
//     {
//       label: 'Rainfall',
//       backgroundColor: [
//         '#B21F00',
//         '#C9DE00',
//         '#2FDE00',
//         '#00A6B4',
//         '#6800B4'
//       ],
//       hoverBackgroundColor: [
//       '#501800',
//       '#4B5000',
//       '#175000',
//       '#003350',
//       '#35014F'
//       ],
//       data: [65, 59, 80, 81, 56]
//     }
//   ]
// }

export default function CostBreakdownDoughnutChart(props: Props) {
  const data = {
    labels: props.labels,
    datasets: [{
      label: 'Cost',
      backgroundColor: [
        '#0D56D9',
        '#5792CF',
        '#22C6F0',
        '#F2E68F',
        '#FF0000',
        '#A21A24'
      ],
      // hoverBackgroundColor: [
      //   '#501800',
      //   '#4B5000',
      //   '#175000',
      //   '#003350',
      //   '#35014F',
      //   '#B21F00',
      // ],
      data: props.data
    }]
  }
  
  console.log(props.title, ' labels ', props.labels, ' props ', props.data);

  return (
    <div style={{height:"60vh",position:"relative", marginBottom:"1%", padding:"1%"}}>
      <Doughnut
          data={data}
          options={{
            plugins: {
              title: {
                display: true,
                text: props.title,
                font: {
                  size: 20
                }
              }
            },
            maintainAspectRatio: false
          }}
        
        />
    </div>
  );
}

