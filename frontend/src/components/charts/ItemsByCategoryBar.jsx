import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const ItemsByCategoryBar = () => {
  const ref = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("https://api.projectpencilatx.me/items").then((r) => r.json()),
      fetch("https://api.projectpencilatx.me/categories").then((r) => r.json())
    ])
      .then(([itemsResponse, categoriesResponse]) => {
        // Extract the items arrays from the responses
        const items = itemsResponse.items || itemsResponse.data || itemsResponse;
        const categories = categoriesResponse.items || categoriesResponse.data || categoriesResponse;

        // Ensure we have arrays
        if (!Array.isArray(items)) {
          console.error("Items is not an array:", typeof items);
          return;
        }
        if (!Array.isArray(categories)) {
          console.error("Categories is not an array:", typeof categories);
          return;
        }

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
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };

    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .range([height - margin.bottom, margin.top]);

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.count))
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

    // Add x-axis labels for category names
    svg
      .selectAll(".x-label")
      .data(data)
      .join("text")
      .attr("class", "x-label")
      .text((d) => d.name)
      .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("y", height - margin.bottom + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .each(function(d) {
        // Truncate long names
        const text = d3.select(this);
        if (d.name.length > 10) {
          text.text(d.name.substring(0, 10) + "...");
        }
      });
  }, [data]);

  return (
    <div>
      <h2>Items Per Category</h2>
      <svg ref={ref}></svg>
    </div>
  );
};

export default ItemsByCategoryBar;