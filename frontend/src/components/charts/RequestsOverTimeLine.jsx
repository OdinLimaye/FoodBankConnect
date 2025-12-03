// import * as d3 from "d3";
// import { useEffect, useRef, useState } from "react";

// const RequestsOverTimeLine = () => {
//   const ref = useRef();
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     fetch("https://api.projectpencilatx.me/requests")
//       .then((r) => r.json())
// <<<<<<< HEAD
//       .then((requestsResponse) => {
//         // Extract the items array from the response
//         const requests = requestsResponse.items || requestsResponse.data || requestsResponse;

//         // Ensure we have an array
//         if (!Array.isArray(requests)) {
//           console.error("Expected array but got:", typeof requests);
//           return;
//         }

// =======
//       .then((requests) => {
// >>>>>>> 29e8971eb043dc10e57221c99f38ead7dc257493
//         const grouped = d3.rollup(
//           requests,
//           (v) => v.length,
//           (d) => d.created_at?.slice(0, 10)
//         );

//         const formatted = Array.from(grouped, ([date, count]) => ({
//           date,
//           count
// <<<<<<< HEAD
//         }))
//           .filter((d) => d.date) // Remove entries with undefined dates
//           .sort((a, b) => new Date(a.date) - new Date(b.date));

//         setData(formatted);
//       })
//       .catch((err) => console.error("Fetch error:", err));
// =======
//         })).sort((a, b) => new Date(a.date) - new Date(b.date));

//         setData(formatted);
//       });
// >>>>>>> 29e8971eb043dc10e57221c99f38ead7dc257493
//   }, []);

//   useEffect(() => {
//     if (!data.length) return;

// <<<<<<< HEAD
//     const width = 700;
//     const height = 400;
//     const margin = { top: 20, right: 30, bottom: 50, left: 50 };
// =======
//     const width = 600;
//     const height = 300;
// >>>>>>> 29e8971eb043dc10e57221c99f38ead7dc257493

//     const svg = d3.select(ref.current);
//     svg.selectAll("*").remove();

//     svg.attr("width", width).attr("height", height);

// <<<<<<< HEAD
//     const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

//     const x = d3
//       .scaleTime()
//       .domain(d3.extent(data, (d) => new Date(d.date)))
//       .range([0, width - margin.left - margin.right]);
// =======
//     const x = d3
//       .scaleTime()
//       .domain(d3.extent(data, (d) => new Date(d.date)))
//       .range([0, width]);
// >>>>>>> 29e8971eb043dc10e57221c99f38ead7dc257493

//     const y = d3
//       .scaleLinear()
//       .domain([0, d3.max(data, (d) => d.count)])
// <<<<<<< HEAD
//       .nice()
//       .range([height - margin.top - margin.bottom, 0]);
// =======
//       .range([height, 0]);
// >>>>>>> 29e8971eb043dc10e57221c99f38ead7dc257493

//     const line = d3
//       .line()
//       .x((d) => x(new Date(d.date)))
// <<<<<<< HEAD
//       .y((d) => y(d.count))
//       .curve(d3.curveMonotoneX);

//     // Draw the line
//     g.append("path")
// =======
//       .y((d) => y(d.count));

//     svg
//       .append("path")
// >>>>>>> 29e8971eb043dc10e57221c99f38ead7dc257493
//       .datum(data)
//       .attr("fill", "none")
//       .attr("stroke", "#03A9F4")
//       .attr("stroke-width", 3)
//       .attr("d", line);

// <<<<<<< HEAD
//     // Add dots at each data point
//     g.selectAll("circle")
//       .data(data)
//       .join("circle")
//       .attr("cx", (d) => x(new Date(d.date)))
//       .attr("cy", (d) => y(d.count))
//       .attr("r", 4)
//       .attr("fill", "#03A9F4")
//       .attr("stroke", "white")
//       .attr("stroke-width", 2);

//     // Add x-axis
//     g.append("g")
//       .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
//       .call(d3.axisBottom(x).ticks(5))
//       .attr("color", "white");

//     // Add y-axis
//     g.append("g")
//       .call(d3.axisLeft(y).ticks(5))
//       .attr("color", "white");

//     // Add x-axis label
//     svg
//       .append("text")
//       .attr("x", width / 2)
//       .attr("y", height - 5)
//       .attr("text-anchor", "middle")
//       .attr("fill", "white")
//       .attr("font-size", "12px")
//       .text("Date");

//     // Add y-axis label
//     svg
//       .append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("x", -height / 2)
//       .attr("y", 15)
//       .attr("text-anchor", "middle")
//       .attr("fill", "white")
//       .attr("font-size", "12px")
//       .text("Number of Requests");
// =======
// >>>>>>> 29e8971eb043dc10e57221c99f38ead7dc257493
//   }, [data]);

//   return (
//     <div>
//       <h2>Requests Submitted Over Time</h2>
//       <svg ref={ref}></svg>
//     </div>
//   );
// };

// <<<<<<< HEAD
// export default RequestsOverTimeLine;
// =======
// export default RequestsOverTimeLine;
// >>>>>>> 29e8971eb043dc10e57221c99f38ead7dc257493
