import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const OrgStateChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
		const BASE_URL = 'https://api.projectpencilatx.me/organizations';
        let allOrgs = [];
        let page = 1;
        const PAGE_SIZE = 20;
        let hasMore = true;

        while (hasMore) {
          const offset = PAGE_SIZE * (page - 1);
          const url = `${BASE_URL}?limit=${PAGE_SIZE}&offset=${offset}`;
          
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
            allOrgs = allOrgs.concat(result.items);
            page++;
            
            if (allOrgs.length >= result.total) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
          
          if (page > 100) {
            hasMore = false;
          }
        }
        
        const stateCounts = {};
        allOrgs.forEach(org => {
          const state = org.state || 'Unknown';
          stateCounts[state] = (stateCounts[state] || 0) + 1;
        });

        const stateData = Object.entries(stateCounts)
          .map(([state, count]) => ({ state, count }))
          .sort((a, b) => b.count - a.count);

        setData(stateData);
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

    const width = 1000;
    const height = 600;
    const margin = { top: 60, right: 40, bottom: 80, left: 80 };

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.state))
      .range([0, chartWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([chartHeight, 0])
      .nice();

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(10))
      .selectAll('text')
      .style('font-size', '12px');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('State');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Number of Organizations');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Organizations by State');

    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '2px solid #333')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)')
      .style('z-index', 1000);

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.state))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => chartHeight - yScale(d.count))
      .attr('fill', '#4269d0')
      .attr('stroke', '#2c4a8c')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#5a7fd9');

        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.state}</strong><br/>
            Organizations: ${d.count}
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#4269d0');

        tooltip.style('opacity', 0);
      });

    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.state) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d.count);

    return () => {
      tooltip.remove();
    };

  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading organization data...</div>
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

export default OrgStateChart;