import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const ItemsByCategoryBar = () => {
  const ref = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("https://api.projectpencilatx.me/items").then((r) => r.json()),
      fetch("https://api.projectpencilatx.me/categories").then((r) => r.json())
    ]).then(([items, categories]) => {
      const counts = d3.rollup(
        items,
        (v) => v.length,
        (item) => item.category_id
      );

      const formatted = Array.from(counts, ([categoryId, count]) => {
        const catInfo = categories.find((c) => c.id === categoryId);
        return { name: catInfo?.name || "Unknown", count };
      });

      setData(formatted);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 700;
    const height = 400;

    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
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
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", "#9C27B0");

    svg
      .selectAll(".label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .text((d) => d.count)
      .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.count) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white");
  }, [data]);

  return (
    <div>
      <h2>Items Per Category</h2>
      <svg ref={ref}></svg>
    </div>
  );
};

export default ItemsByCategoryBar;
