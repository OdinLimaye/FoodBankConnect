import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const SuppliesPieChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allSupplies = [];
        let page = 1;
        const PAGE_SIZE = 24;
        let hasMore = true;
        const CORS_PROXY = 'https://corsproxy.io/?';
        const BASE_URL = 'https://api.projectpencilatx.me/supplies';
        const USED_URL = CORS_PROXY + encodeURIComponent(BASE_URL);   
        while (hasMore) {
          const offset = PAGE_SIZE * (page - 1);
          const url = `${USED_URL}?limit=${PAGE_SIZE}&offset=${offset}`;
          
          const myHeaders = new Headers();
          myHeaders.append("Accept", "application/json");
          
          const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
          };
          
          const response = await fetch(url, requestOptions);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const raw = await response.text();
          const result = JSON.parse(raw);
                    
          if (result.items && result.items.length > 0) {
            allSupplies = allSupplies.concat(result.items);
            page++;
            
            if (allSupplies.length >= result.total) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }
        const typeCounts = {};
        allSupplies.forEach(item => {
          if (item.broadname) {
            const type = item.broadname.trim();
            if (typeCounts[type]) {
              typeCounts[type]++;
            } else {
              typeCounts[type] = 1;
            }
          }
        });

        const chartData = Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count); 

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

    const width = 700;
    const height = 700;
    const radius = Math.min(width, height) / 2 - 60;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.type))
      .range(d3.schemeSet3);

    const total = d3.sum(data, d => d.count);

    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const labelArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '14px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)');

    const arcs = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.type))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);

        const percentage = ((d.data.count / total) * 100).toFixed(1);
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.data.type}</strong><br/>
            Count: ${d.data.count}<br/>
            Percentage: ${percentage}%
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        tooltip.style('opacity', 0);
      });

    arcs.append('text')
      .attr('transform', d => {
        const percentage = (d.data.count / total) * 100;
        if (percentage < 3) return 'translate(0,0)';
        return `translate(${labelArc.centroid(d)})`;
      })
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .each(function(d) {
        const percentage = ((d.data.count / total) * 100).toFixed(1);
        if (percentage < 3) return;
        
        const text = d3.select(this);
        
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', '-0.6em')
          .text(d.data.type.length > 15 ? d.data.type.substring(0, 15) + '...' : d.data.type);
        
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', '1.2em')
          .text(d.data.count);
        
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', '1.2em')
          .style('font-size', '11px')
          .text(`(${percentage}%)`);
      });

    svg.append('text')
      .attr('y', -height / 2 + 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .text('Supply Types Distribution');

    return () => {
      tooltip.remove();
    };

  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading supply data...</div>
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
    </div>
  );
};

export default SuppliesPieChart;