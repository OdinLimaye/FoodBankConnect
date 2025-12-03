import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const FoodbanksBarChart = () => {
  const ref = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://api.foodbankconnect.me/v1/foodbanks")
      .then((res) => res.json())
      .then((json) => {
        const counts = d3.rollup(
          json,
          (v) => v.length,
          (d) => d.state || "Unknown"
        );

        const formatted = Array.from(counts, ([state, count]) => ({
          state,
          count
        }));

        setData(formatted);
      });
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 700;
    const height = 400;

    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.state))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .range([height, 0]);

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.state))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", "#4FC3F7");

    // axis text
    svg
      .selectAll("text.label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.state) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.count) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d) => d.count);

  }, [data]);

  return (
    <div>
      <h2>Food Banks Per State</h2>
      <svg ref={ref}></svg>
    </div>
  );
};

export default FoodbanksBarChart;