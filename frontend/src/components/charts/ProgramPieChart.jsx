import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ProgramPieChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const frequencies = ['weekly', 'monthly', 'yearly'];

  useEffect(() => {
    const fetchData = async () => {
      const BASE_URL = 'https://dp3d297dp9.execute-api.us-east-2.amazonaws.com/v1/programs';
      const MAX_ITEMS = 100;

      try {
        const params = new URLSearchParams({
          size: MAX_ITEMS
        });
        
        const fullURL = `${BASE_URL}?${params.toString()}`;
        const response = await fetch(fullURL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        const frequencyCounts = {
          weekly: 0,
          monthly: 0,
          yearly: 0
        };
        
        if (result.items && Array.isArray(result.items)) {
          result.items.forEach(item => {
            if (item.frequency && frequencyCounts.hasOwnProperty(item.frequency.toLowerCase())) {
              frequencyCounts[item.frequency.toLowerCase()]++;
            }
          });
        }

        const chartData = Object.entries(frequencyCounts)
          .map(([frequency, count]) => ({ frequency, count }))
          .filter(d => d.count > 0);  

        setData(chartData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 40;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.frequency))
      .range(['#FF6384', '#36A2EB', '#FFCE56']);

    const total = d3.sum(data, d => d.count);

    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const labelArc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    const arcs = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.frequency))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .each(function(d) {
        const percentage = ((d.data.count / total) * 100).toFixed(1);
        const text = d3.select(this);
        
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', '-0.6em')
          .text(d.data.frequency.charAt(0).toUpperCase() + d.data.frequency.slice(1));
        
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', '1.2em')
          .text(d.data.count);
        
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', '1.2em')
          .style('font-size', '12px')
          .text(`(${percentage}%)`);
      });

    svg.append('text')
      .attr('y', -height / 2 + 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .text('Programs by Frequency');

  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading program data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <svg ref={svgRef}></svg>
      <div className="mt-4 text-sm text-gray-600">
        Total programs: {d3.sum(data, d => d.count)}
      </div>
    </div>
  );
};

export default ProgramPieChart;