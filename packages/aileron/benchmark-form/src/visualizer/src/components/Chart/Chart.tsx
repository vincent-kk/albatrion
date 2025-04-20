import { useEffect, useMemo, useRef } from 'react';

import * as d3 from 'd3';

import styles from './Chart.module.css';

interface DataPoint {
  name: string;
  value: number;
}

interface ChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  title: string;
  yAxisLabel: string;
  showGenieForm?: boolean;
  showBar?: boolean;
  showLine?: boolean;
  showTrendline?: boolean;
}

export function Chart({
  data: inputData,
  width = 800,
  height = 400,
  title,
  yAxisLabel,
  showGenieForm = true,
  showBar = true,
  showLine = false,
  showTrendline = false,
}: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => {
    if (showGenieForm) return inputData;
    return inputData.filter((d) => !d.name.includes('@react-genie-form'));
  }, [inputData, showGenieForm]);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // SVG 초기화
    d3.select(svgRef.current).selectAll('*').remove();

    // 마진 설정
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // SVG 생성
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // 차트 영역 생성
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 스케일 설정
    const x = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([innerHeight, 0]);

    // X축 생성
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Y축 생성
    g.append('g').call(d3.axisLeft(y));

    // Y축 레이블
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .text(yAxisLabel);

    // 제목
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(title);

    // 툴팁 생성
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // 막대 그래프
    if (showBar) {
      g.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', (d) => x(d.name) || 0)
        .attr('y', (d) => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', (d) => innerHeight - y(d.value))
        .attr('fill', '#4299e1')
        .on('mouseover', (event, d) => {
          tooltip
            .style('opacity', 1)
            .html(`${d.name}<br/>${d.value.toFixed(2)}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    }

    // 라인 그래프
    if (showLine) {
      const line = d3
        .line<DataPoint>()
        .x((d) => (x(d.name) || 0) + x.bandwidth() / 2)
        .y((d) => y(d.value));

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#48bb78')
        .attr('stroke-width', 2)
        .attr('d', line);

      // 데이터 포인트
      g.selectAll('.dot')
        .data(data)
        .join('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => (x(d.name) || 0) + x.bandwidth() / 2)
        .attr('cy', (d) => y(d.value))
        .attr('r', 4)
        .attr('fill', '#48bb78')
        .on('mouseover', (event, d) => {
          tooltip
            .style('opacity', 1)
            .html(`${d.name}<br/>${d.value.toFixed(2)}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    }

    // 추세선
    if (showTrendline && data.length > 1) {
      const xPoints = data.map((_, i) => i);
      const yPoints = data.map((d) => d.value);

      // 선형 회귀 계산
      const xMean = xPoints.reduce((a, b) => a + b, 0) / xPoints.length;
      const yMean = yPoints.reduce((a, b) => a + b, 0) / yPoints.length;

      const slope =
        xPoints.reduce(
          (sum, x, i) => sum + (x - xMean) * (yPoints[i] - yMean),
          0,
        ) / xPoints.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);

      const intercept = yMean - slope * xMean;

      // 추세선 데이터 생성
      const trendData = [
        { x: 0, y: intercept },
        { x: data.length - 1, y: slope * (data.length - 1) + intercept },
      ];

      // 추세선 그리기
      const trendline = d3
        .line<{ x: number; y: number }>()
        .x((d) => (x(data[d.x].name) || 0) + x.bandwidth() / 2)
        .y((d) => y(d.y));

      g.append('path')
        .datum(trendData)
        .attr('fill', 'none')
        .attr('stroke', '#f56565')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('d', trendline);
    }

    return () => {
      tooltip.remove();
    };
  }, [
    data,
    width,
    height,
    title,
    yAxisLabel,
    showBar,
    showLine,
    showTrendline,
  ]);

  return (
    <div className={styles.chartContainer}>
      <svg ref={svgRef} />
    </div>
  );
}
