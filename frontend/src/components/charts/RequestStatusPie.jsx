import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const RequestStatusPie = () => {
  const ref = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://api.projectpencilatx.me/requests")
      .then((r) => r.json())
      .then((requestsResponse) => {
        // Extract the items array from the response
        const requests = requestsResponse.items || requestsResponse.data || requestsResponse;

        // Ensure we have an array
        if (!Array.isArray(requests)) {
          console.error("Expected array but got:", typeof requests);
          return;
        }

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
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  useEffect(() => {
    if (!data.length) return;

    // Clear previous content
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 20;

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeSet2);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const labelArc = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    // Draw pie slices
    g.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.name))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Add value labels on slices
    g.selectAll("text.value")
      .data(pie(data))
      .join("text")
      .attr("class", "value")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text((d) => d.data.value);

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 140}, 20)`);

    legend
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => color(d.name));

    legend
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("x", 20)
      .attr("y", (d, i) => i * 25 + 12)
      .attr("font-size", "12px")
      .attr("fill", "white")
      .text((d) => `${d.name} (${d.value})`);
  }, [data]);

  return (
    <div>
      <h2>Request Status Breakdown</h2>
      <svg ref={ref}></svg>
    </div>
  );
};

export default RequestStatusPie;