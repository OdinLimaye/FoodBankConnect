import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const SchoolsMap = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const povertyColors = {
    'Nearly all students from low‑income households': '#000000',
    'More than three‑quarters of students from low‑income households': '#8B0000',
    'More than half of students from low‑income households': '#FF0000',
    'Half of students from low-income households': '#FFA500',
    'More than a third of students from low-income households': '#FFFF00'
  };

  const gradeShapes = {
    'PreK-2': 'circle',
    'Grades 3-5': 'triangle',
    'Grades 6-8': 'square',
    'Grades 9-12': 'pentagon'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const BASE_URL = 'https://api.projectpencilatx.me/schools'; 
        let allSchools = [];
        let page = 1;
        const PAGE_SIZE = 24;
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
            allSchools = allSchools.concat(result.items);
            page++;
            
            if (allSchools.length >= result.total) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
          
          if (page > 50) {
            hasMore = false;
          }
        }
        
        const [districtsRes, facilitiesRes] = await Promise.all([
          fetch("/Current_Districts_2025.geojson"),
          fetch("/Facilities_2022_23.geojson"),
        ]);

        let districts = null;
        let facilities = null;

        if (districtsRes.ok) {
          districts = await districtsRes.json();
        }

        if (facilitiesRes.ok) {
          facilities = await facilitiesRes.json();
        }

        setMapData({ districts, facilities });
        setData(allSchools);
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

    const width = 1200;
    const height = 800;
    const margin = { top: 60, right: 250, bottom: 60, left: 60 };

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f8f9fa');

    const projection = d3.geoMercator()
      .center([-97.7431, 30.2672])
      .scale(100000)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    const mainG = svg.append('g');

    if (mapData?.districts) {
      mainG.selectAll('.district')
        .data(mapData.districts.features)
        .enter()
        .append('path')
        .attr('class', 'district')
        .attr('d', pathGenerator)
        .attr('fill', '#e8f4f8')
        .attr('stroke', '#999')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.6);

      mainG.selectAll('.district-label')
        .data(mapData.districts.features)
        .enter()
        .append('text')
        .attr('class', 'district-label')
        .attr('transform', d => {
          const centroid = pathGenerator.centroid(d);
          return `translate(${centroid[0]},${centroid[1]})`;
        })
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#333')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('paint-order', 'stroke')
        .text(d => d.properties?.ISD || d.properties?.NAME || '');
    }

    if (mapData?.facilities) {
      const facilityPoints = mapData.facilities.features
        .filter(f => f.geometry?.type === 'Point' && 
                    (f.properties?.CLASS === 'ELEM' || 
                     f.properties?.CLASS === 'MID' || 
                     f.properties?.CLASS === 'HIGH'))
        .map(f => ({
          coordinates: f.geometry.coordinates,
          name: f.properties?.NAME,
          class: f.properties?.CLASS
        }));

      facilityPoints.forEach(facility => {
        const [lon, lat] = facility.coordinates;
        const [x, y] = projection([lon, lat]);
        
        mainG.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 2)
          .attr('fill', '#ff725c')
          .attr('opacity', 0.5)
          .attr('stroke', 'none');
      });
    }

    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '2px solid #333')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '12px')
      .style('max-width', '300px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)')
      .style('z-index', 1000);

    data.forEach(school => {
      const lon = parseFloat(school.longitude);
      const lat = parseFloat(school.latitude);
      
      if (isNaN(lon) || isNaN(lat)) return;
      
      const [x, y] = projection([lon, lat]);
      const color = povertyColors[school.povertylevel] || '#999999';
      const shape = gradeShapes[school.gradelevel] || 'circle';

      let shapeElement;

      if (shape === 'circle') {
        shapeElement = mainG.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 5);
      } else if (shape === 'triangle') {
        const size = 7;
        const points = [
          [x, y - size],
          [x - size * 0.866, y + size / 2],
          [x + size * 0.866, y + size / 2]
        ];
        shapeElement = mainG.append('polygon')
          .attr('points', points.map(p => p.join(',')).join(' '));
      } else if (shape === 'square') {
        const size = 6;
        shapeElement = mainG.append('rect')
          .attr('x', x - size / 2)
          .attr('y', y - size / 2)
          .attr('width', size)
          .attr('height', size);
      } else if (shape === 'pentagon') {
        const size = 6;
        const points = [];
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          points.push([
            x + size * Math.cos(angle),
            y + size * Math.sin(angle)
          ]);
        }
        shapeElement = mainG.append('polygon')
          .attr('points', points.map(p => p.join(',')).join(' '));
      }

      shapeElement
        .attr('fill', color)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .attr('opacity', 0.85)
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', 2.5);

          tooltip
            .style('opacity', 1)
            .html(`
              <strong>${school.name}</strong><br/>
              Grade Level: ${school.gradelevel}<br/>
              Poverty Level: ${school.povertylevel}
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 15) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.85)
            .attr('stroke-width', 1);

          tooltip.style('opacity', 0);
        });
    });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')

    const shapeLegend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 20}, 80)`);

    shapeLegend.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Grade Level');

    const shapes = [
      { label: 'PreK-2', shape: 'circle', y: 20 },
      { label: 'Grades 3-5', shape: 'triangle', y: 50 },
      { label: 'Grades 6-8', shape: 'square', y: 80 },
      { label: 'Grades 9-12', shape: 'pentagon', y: 110 }
    ];

    shapes.forEach(item => {
      if (item.shape === 'circle') {
        shapeLegend.append('circle')
          .attr('cx', 10)
          .attr('cy', item.y)
          .attr('r', 8)
          .attr('fill', '#666')
          .attr('stroke', '#333')
          .attr('stroke-width', 1.5);
      } else if (item.shape === 'triangle') {
        const size = 12;
        const points = [
          [10, item.y - size],
          [10 - size * 0.866, item.y + size / 2],
          [10 + size * 0.866, item.y + size / 2]
        ];
        shapeLegend.append('polygon')
          .attr('points', points.map(p => p.join(',')).join(' '))
          .attr('fill', '#666')
          .attr('stroke', '#333')
          .attr('stroke-width', 1.5);
      } else if (item.shape === 'square') {
        shapeLegend.append('rect')
          .attr('x', 5)
          .attr('y', item.y - 5)
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', '#666')
          .attr('stroke', '#333')
          .attr('stroke-width', 1.5);
      } else if (item.shape === 'pentagon') {
        const size = 10;
        const points = [];
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          points.push([
            10 + size * Math.cos(angle),
            item.y + size * Math.sin(angle)
          ]);
        }
        shapeLegend.append('polygon')
          .attr('points', points.map(p => p.join(',')).join(' '))
          .attr('fill', '#666')
          .attr('stroke', '#333')
          .attr('stroke-width', 1.5);
      }

      shapeLegend.append('text')
        .attr('x', 25)
        .attr('y', item.y + 4)
        .style('font-size', '12px')
        .text(item.label);
    });

    const colorLegend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 20}, 250)`);

    colorLegend.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Poverty Level');

    const colors = [
      { label: 'Nearly all', color: '#000000', y: 20 },
      { label: '>75%', color: '#8B0000', y: 45 },
      { label: '>50%', color: '#FF0000', y: 70 },
      { label: '50%', color: '#FFA500', y: 95 },
      { label: '>1/3', color: '#FFFF00', y: 120 }
    ];

    colors.forEach(item => {
      colorLegend.append('rect')
        .attr('x', 0)
        .attr('y', item.y - 8)
        .attr('width', 16)
        .attr('height', 16)
        .attr('fill', item.color)
        .attr('stroke', '#333')
        .attr('stroke-width', 1);

      colorLegend.append('text')
        .attr('x', 25)
        .attr('y', item.y + 4)
        .style('font-size', '12px')
        .text(item.label);
    });

    if (mapData?.facilities) {
      const facilityLegend = svg.append('g')
        .attr('transform', `translate(${width - margin.right + 20}, 420)`);

      facilityLegend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Other Schools');

      facilityLegend.append('circle')
        .attr('cx', 8)
        .attr('cy', 20)
        .attr('r', 4)
        .attr('fill', '#ff725c')
        .attr('opacity', 0.5);

      facilityLegend.append('text')
        .attr('x', 25)
        .attr('y', 24)
        .style('font-size', '12px')
        .text('Austin ISD');
    }

    return () => {
      tooltip.remove();
    };

  }, [data, mapData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading schools data and maps...</div>
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
	  <h3>Austin Schools by Grade Level and Poverty</h3>
      <svg ref={svgRef}></svg>
      <div className="mt-4 text-sm text-gray-600">
        {!mapData?.districts && (
          <div className="text-orange-600 mt-2">
            Note: District boundaries not loaded. Place GeoJSON files in public folder.
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolsMap;