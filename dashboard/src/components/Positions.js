import React from "react";
import { positions } from "../data/data";

// 1. Imports for a 'linear' scale Line chart
import {
  Chart as ChartJS,
  LinearScale, // Using LinearScale for both X and Y
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

// 2. Register the components (this stays outside)
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);

// 3. Your component
const Positions = () => {
  //
  // MOVED HOOKS INSIDE THE COMPONENT
  //

  // 4. Data generation logic (now inside the component)
  const { data, data2 } = React.useMemo(() => {
    const data = [];
    const data2 = [];
    let prev = 100;
    let prev2 = 80;
    for (let i = 0; i < 1000; i++) {
      prev += 5 - Math.random() * 10;
      data.push({ x: i, y: prev });
      prev2 += 5 - Math.random() * 10;
      data2.push({ x: i, y: prev2 });
    }
    return { data, data2 };
  }, []); // Empty array means this runs only once

  // 5. Animation config (now inside the component)
  const lineChartAnimation = React.useMemo(() => {
    const totalDuration = 10000;
    const delayBetweenPoints = totalDuration / data.length;

    const previousY = (ctx) =>
      ctx.index === 0
        ? ctx.chart.scales.y.getPixelForValue(100)
        : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(
            ["y"],
            true
          ).y;

    return {
      x: {
        type: "number",
        easing: "linear",
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay(ctx) {
          if (ctx.type !== "data" || ctx.xStarted) {
            return 0;
          }
          ctx.xStarted = true;
          return ctx.index * delayBetweenPoints;
        },
      },
      y: {
        type: "number",
        easing: "linear",
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx) {
          if (ctx.type !== "data" || ctx.yStarted) {
            return 0;
          }
          ctx.yStarted = true;
          return ctx.index * delayBetweenPoints;
        },
      },
    };
  }, [data.length]); // Re-calculates if data.length ever changes

  // 6. Chart Data prop (now inside the component)
  const lineChartData = {
    datasets: [
      {
        borderColor: "rgb(255, 99, 132)", // Red
        borderWidth: 1,
        radius: 0,
        data: data,
      },
      {
        borderColor: "rgb(54, 162, 235)", // Blue
        borderWidth: 1,
        radius: 0,
        data: data2,
      },
    ],
  };

  // 7. Chart Options prop (now inside the component)
  const lineChartOptions = {
    animation: lineChartAnimation, // Use the memoized animation config
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: false,
    },
    scales: {
      x: {
        type: "linear",
      },
    },
  };

  //
  // The component's JSX return
  //
  return (
    <>
      {/* ================================================= */}
      {/* YOUR ORIGINAL TABLE CODE                       */}
      {/* ================================================= */}
      <h3 className="title">Positions ({positions.length})</h3>
      <div className="order-table">
        <table>
          <tbody>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg.</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg.</th>
            </tr>
            {positions.map((stock, index) => {
              const curValue = stock.price * stock.qty;
              const isProfit = curValue - stock.avg * stock.qty >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";
              return (
                <tr key={index}>
                  <td>{stock.product}</td>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{stock.price.toFixed(2)}</td>
                  <td className={profClass}>
                    {(curValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={dayClass}>{stock.day}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================================================= */}
      {/* THE PROGRESSIVE LINE CHART YOU REQUESTED         */}
      {/* ================================================= */}
      <div
        className="chart-container"
        style={{ maxWidth: "800px", margin: "40px auto" }}
      >
        <Line options={lineChartOptions} data={lineChartData} />
      </div>
    </>
  );
};

export default Positions;
