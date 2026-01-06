import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QuakePoint } from '../types';
import { getShindoLabel, getShindoColor } from '../constants';

interface IntensityChartProps {
  points: QuakePoint[];
}

export const IntensityChart: React.FC<IntensityChartProps> = ({ points }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!points || points.length === 0 || !svgRef.current) return;

    // Aggregate data: Count areas per intensity scale
    const scaleCounts = d3.rollup(
      points,
      (v) => v.length,
      (d) => d.scale
    );

    // Convert Map to Array and sort by scale descending (strongest on top/left)
    const data = Array.from(scaleCounts, ([scale, count]) => ({ scale, count }))
      .sort((a, b) => b.scale - a.scale);

    const width = 300;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Axis: Scale Labels (categorical)
    const x = d3.scaleBand()
      .domain(data.map(d => getShindoLabel(d.scale)))
      .range([0, innerWidth])
      .padding(0.2);

    // Y Axis: Count of areas
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Draw Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(getShindoLabel(d.scale))!)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.count))
      // Use the actual scale value for color mapping, converting class to hex if needed or just use fill
      // Since Tailwind classes are strings, we need a helper or just mapping. 
      // For simplicity in D3, let's map scale manually to hex colors matching our tailwind theme approximately.
      .attr('fill', d => {
         const s = d.scale;
         if (s >= 70) return '#7e22ce'; // purple-700
         if (s >= 60) return '#b91c1c'; // red-700
         if (s >= 55) return '#dc2626'; // red-600
         if (s >= 50) return '#ea580c'; // orange-600
         if (s >= 45) return '#f97316'; // orange-500
         if (s >= 40) return '#eab308'; // yellow-500
         if (s >= 30) return '#22c55e'; // green-500
         if (s >= 20) return '#3b82f6'; // blue-500
         return '#06b6d4'; // cyan-500
      })
      .attr('rx', 4);

    // Draw X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#94a3b8') // slate-400
      .style('font-size', '12px');

    // Draw Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .style('font-size', '10px');
      
    // Axis styles
    g.selectAll('.domain, .tick line').attr('stroke', '#475569'); // slate-600
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1')
      .style('font-size', '12px')
      .text('震度別 地域数分布');

  }, [points]);

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 300 180" className="overflow-visible" />
  );
};