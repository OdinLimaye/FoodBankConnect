import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const RequestsOverTimeLine = () => {
  const ref = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://api.projectpencilatx.me/requests")
      .then((r) => r.json())
      .then((requests) => {
        const grouped = d3.rollup(
          requests,
          (v) => v.length,
          (d) => d.created_at?.slice(0, 10)
        );

        const formatted = Array.from(grouped, ([date, count]) => ({
          date,
          count
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        setData(formatted);
      });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const width = 600;
    const height = 300;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .range([height, 0]);

    const line = d3
      .line()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.count));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#03A9F4")
      .attr("stroke-width", 3)
      .attr("d", line);

  }, [data]);

  return (
    <div>
      <h2>Requests Submitted Over Time</h2>
      <svg ref={ref}></svg>
    </div>
  );
};

export default RequestsOverTimeLine;
