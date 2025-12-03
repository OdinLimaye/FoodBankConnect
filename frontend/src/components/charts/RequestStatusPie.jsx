import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const RequestStatusPie = () => {
  const ref = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://api.projectpencilatx.me/requests")
      .then((r) => r.json())
      .then((requests) => {
        const counts = d3.rollup(
          requests,
          (v) => v.length,
          (d) => d.status || "Unknown"
        );

        const formatted = Array.from(counts, ([name, value]) => ({
          name,
          value
        }));

        setData(formatted);
      });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeSet2);

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
      <h2>Request Status Breakdown</h2>
      <svg ref={ref}></svg>
    </div>
  );
};

export default RequestStatusPie;
