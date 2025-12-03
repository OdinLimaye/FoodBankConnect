import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const ProgramPieChart = () => {
  const ref = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://api.foodbankconnect.me/v1/programs")
      .then((res) => res.json())
      .then((json) => {
        const typeCounts = d3.rollup(
          json,
          (v) => v.length,
          (d) => d.type || "Other"
        );

        const formatted = Array.from(typeCounts, ([name, value]) => ({
          name,
          value
        }));

        setData(formatted);
      });
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg
      .selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.name));

  }, [data]);

  return (
    <div>
      <h2>Program Types Breakdown</h2>
      <svg ref={ref}></svg>
    </div>
  );
};

export default ProgramPieChart;