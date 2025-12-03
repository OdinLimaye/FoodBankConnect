import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const SponsorSankey = () => {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const BASE_URL = 'https://api.foodbankconnect.me/v1/sponsors';
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
        
        if (!result.items || !Array.isArray(result.items)) {
          throw new Error('Invalid data format');
        }

        // Categorize sponsors
        const nonProfits = [];
        const privateCorp = [];

        result.items.forEach(item => {
          if (item.affiliation && 
              (item.affiliation.includes('Non Profit') || 
               item.affiliation.includes('Non-Profit') ||
               item.affiliation.includes('Nonprofit') ||
               item.affiliation.includes('nonprofit'))) {
            nonProfits.push(item);
          } else {
            privateCorp.push(item);
          }
        });

        // Debug: log some affiliations to see the format
        console.log('Sample affiliations:', result.items.slice(0, 5).map(i => i.affiliation));
        console.log('Non Profits found:', nonProfits.length);
        console.log('Private Corps found:', privateCorp.length);

        // Count contributions for each category
        const nonProfitContributions = { High: 0, Medium: 0, Low: 0 };
        const privateCorpContributions = { High: 0, Medium: 0, Low: 0 };

        nonProfits.forEach(item => {
          if (item.contribution) {
            const contrib = item.contribution;
            if (nonProfitContributions.hasOwnProperty(contrib)) {
              nonProfitContributions[contrib]++;
            }
          }
        });

        privateCorp.forEach(item => {
          if (item.contribution) {
            const contrib = item.contribution;
            if (privateCorpContributions.hasOwnProperty(contrib)) {
              privateCorpContributions[contrib]++;
            }
          }
        });

        const totalSponsors = result.items.length;

        setData({
          totalSponsors,
          nonProfitsCount: nonProfits.length,
          privateCorpCount: privateCorp.length,
          nonProfitContributions,
          privateCorpContributions
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;

    const width = 1000;
    const height = 600;
    const margin = { top: 40, right: 200, bottom: 40, left: 200 };

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create base nodes
    const baseNodes = [
      { id: 'All Sponsors', x: margin.left, y: height / 2 },
      { id: 'Non Profits', x: width / 2 - 100, y: height / 3 },
      { id: 'Private Corps', x: width / 2 - 100, y: 2 * height / 3 }
    ];

    // Only add contribution level nodes if they have data
    const contributionNodes = [];
    let npY = height / 6;
    let pcY = 2 * height / 3;
    const ySpacing = 80;

    if (data.nonProfitContributions.High > 0) {
      contributionNodes.push({ id: 'NP High', x: width - margin.right, y: npY });
      npY += ySpacing;
    }
    if (data.nonProfitContributions.Medium > 0) {
      contributionNodes.push({ id: 'NP Medium', x: width - margin.right, y: npY });
      npY += ySpacing;
    }
    if (data.nonProfitContributions.Low > 0) {
      contributionNodes.push({ id: 'NP Low', x: width - margin.right, y: npY });
    }

    if (data.privateCorpContributions.High > 0) {
      contributionNodes.push({ id: 'PC High', x: width - margin.right, y: pcY });
      pcY += ySpacing;
    }
    if (data.privateCorpContributions.Medium > 0) {
      contributionNodes.push({ id: 'PC Medium', x: width - margin.right, y: pcY });
      pcY += ySpacing;
    }
    if (data.privateCorpContributions.Low > 0) {
      contributionNodes.push({ id: 'PC Low', x: width - margin.right, y: pcY });
    }

    const nodes = [...baseNodes, ...contributionNodes];

    // Create links with actual data values
    const links = [
      { source: 'All Sponsors', target: 'Non Profits', value: data.nonProfitsCount },
      { source: 'All Sponsors', target: 'Private Corps', value: data.privateCorpCount },
      { source: 'Non Profits', target: 'NP High', value: data.nonProfitContributions.High },
      { source: 'Non Profits', target: 'NP Medium', value: data.nonProfitContributions.Medium },
      { source: 'Non Profits', target: 'NP Low', value: data.nonProfitContributions.Low },
      { source: 'Private Corps', target: 'PC High', value: data.privateCorpContributions.High },
      { source: 'Private Corps', target: 'PC Medium', value: data.privateCorpContributions.Medium },
      { source: 'Private Corps', target: 'PC Low', value: data.privateCorpContributions.Low }
    ].filter(link => link.value > 0); // Only include links with actual data

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(['All Sponsors', 'Non Profits', 'Private Corps'])
      .range(['#4CAF50', '#2196F3', '#FF9800']);

    // Draw links (flows)
    const linkWidth = d3.scaleLinear()
      .domain([0, d3.max(links, d => d.value)])
      .range([2, 80]);

    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      const linkGenerator = d3.linkHorizontal()
        .source(d => [d.source.x, d.source.y])
        .target(d => [d.target.x, d.target.y]);

      svg.append('path')
        .attr('d', linkGenerator({ source: sourceNode, target: targetNode }))
        .attr('fill', 'none')
        .attr('stroke', link.source === 'All Sponsors' 
          ? (link.target === 'Non Profits' ? color('Non Profits') : color('Private Corps'))
          : (link.target.startsWith('NP') ? color('Non Profits') : color('Private Corps')))
        .attr('stroke-width', linkWidth(link.value))
        .attr('opacity', 0.5);
    });

    // Draw nodes
    nodes.forEach(node => {
      const nodeGroup = svg.append('g')
        .attr('transform', `translate(${node.x},${node.y})`);

      // Node rectangle
      nodeGroup.append('rect')
        .attr('x', -60)
        .attr('y', -20)
        .attr('width', 120)
        .attr('height', 40)
        .attr('fill', node.id === 'All Sponsors' ? color('All Sponsors') :
                     node.id.startsWith('NP') || node.id === 'Non Profits' ? color('Non Profits') :
                     color('Private Corps'))
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('rx', 5);

      // Node label
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(node.id.replace('NP ', '').replace('PC ', ''));

      // Add count below node
      let count = 0;
      if (node.id === 'All Sponsors') count = data.totalSponsors;
      else if (node.id === 'Non Profits') count = data.nonProfitsCount;
      else if (node.id === 'Private Corps') count = data.privateCorpCount;
      else if (node.id === 'NP High') count = data.nonProfitContributions.High;
      else if (node.id === 'NP Medium') count = data.nonProfitContributions.Medium;
      else if (node.id === 'NP Low') count = data.nonProfitContributions.Low;
      else if (node.id === 'PC High') count = data.privateCorpContributions.High;
      else if (node.id === 'PC Medium') count = data.privateCorpContributions.Medium;
      else if (node.id === 'PC Low') count = data.privateCorpContributions.Low;

      if (count > 0) {
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '35')
          .style('font-size', '11px')
          .style('fill', '#666')
          .text(`(${count})`);
      }
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .text('Sponsor Distribution by Type and Contribution Level');

  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading sponsor data...</div>
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

export default SponsorSankey;