const VisualizationPaneLineChart = {
	init: function() {
		var svg = d3.select('#vis-pane > svg > g');

		svg.selectAll('.group').each(function(d) {
			var lineChartList = d.lineChartData;

			var lineChartUpdate = d3.select(this).selectAll('.line-chart')
				.data(lineChartList, function(d) { return d.name });

			var lineChartEnter = lineChartUpdate.enter()
				.append('g')
				.attr('class', 'line-chart')
				.attr('transform', function(d) {
					return 'translate(' + [ 0, d.translateY ] + ')';
				})
				.each(function(d) {
					d3.select(this).append('rect').attr('class', 'background');
					d3.select(this).append('text').attr('class', 'title');

					var lineGroup = d3.select(this).append('g').attr('class', 'line-group');
					lineGroup.append('path').attr('class', 'line');
					lineGroup.append('circle').attr('class', 'min-point');
					lineGroup.append('circle').attr('class', 'max-point');
					lineGroup.append('text').attr('class', 'min-text');
					lineGroup.append('text').attr('class', 'max-text');

					d3.select(this).append('g').attr('class', 'axis-group');
				});

			lineChartEnter.merge(lineChartUpdate)
				.transition()
				.attr('transform', function(d) {
					return 'translate(' + [ 0, d.translateY ] + ')';
				});

			var lineChartExit = lineChartUpdate.exit()
				.remove();
		});
	},
	updateTitle: function() {
		var svg = d3.select('#vis-pane > svg > g');
		var lineChartTopPadding = VisualizationPane.lineChartTopPadding;
		var backgroundPadding = VisualizationPane.chartBackgroundPadding;

		svg.selectAll('.group > .line-chart').each(function(d) {
			var lineChartTitle = d.name;

			var title = d3.select(this).select('.title')
				.attr('x', -backgroundPadding.left + 5)
				.attr('y', -lineChartTopPadding - backgroundPadding.top - 5)
				.text(lineChartTitle);
		});
	},
	updateBackground: function() {
		var yearWidth = VisualizationPane.yearWidth;
		var lineChartTopPadding = VisualizationPane.lineChartTopPadding;
		var backgroundPadding = VisualizationPane.chartBackgroundPadding;
		var svg = d3.select('#vis-pane > svg > g');

		svg.selectAll('.group').each(function(d) {
			var lineChartMinYear = d.timelineMinYear;
			var lineChartMaxYear = d.timelineMaxYear;
			var needToDrawLineChart = lineChartMinYear != Infinity && lineChartMaxYear != -Infinity;

			d3.selectAll('.line-chart').each(function(d) {
				var lineChartWidth = (lineChartMaxYear - lineChartMinYear) * yearWidth;
				var lineChartHeight = d.height;

				if (needToDrawLineChart)
					d3.select(this).select('.background')
						.attr('x', -backgroundPadding.left)
						.attr('y', -lineChartTopPadding - backgroundPadding.top)
						.attr('rx', 2).attr('ry', 2)
						.attr('width', lineChartWidth + backgroundPadding.left + backgroundPadding.right)
						.attr('height', lineChartHeight + backgroundPadding.top + backgroundPadding.bottom);
				if (!needToDrawLineChart)
					d3.select(this).select('.background')
						.attr('width', 0)
						.attr('height', 0);
			});
		});
	},
	updateAxis: function() {
		const self = this;
		var lineChartTopPadding = VisualizationPane.lineChartTopPadding;
		var lineChartHeight = VisualizationPane.lineChartHeight;
		var yearWidth = VisualizationPane.yearWidth;
		var yearStep = VisualizationPane.yearStep;
		var svg = d3.select('#vis-pane > svg > g');

  		svg.selectAll('.group').each(function(d) {
  			var lineChartMinYear = d.timelineMinYear;
			var lineChartMaxYear = d.timelineMaxYear;
			var yearList = (lineChartMinYear == Infinity || lineChartMaxYear == -Infinity)
					 	 ? [] : self.range(lineChartMinYear, lineChartMaxYear, yearStep);
			var axisGroup = d3.select(this).selectAll('.line-chart').selectAll('.axis-group')

			var yearUpdate = axisGroup.selectAll('.year')
				.data(yearList);

			var yearEnter = yearUpdate.enter()
				.append('text')
				.attr('class', 'year')
				.style('text-anchor', 'middle')
				.style('alignment-baseline', 'middle');

			yearUpdate.merge(yearEnter)
				.attr('x', function(d) { return (d - lineChartMinYear) * yearWidth })
				.attr('y', -lineChartTopPadding + 1)
				.text(function(d) { return d });

			var yearExit = yearUpdate.exit()
				.remove();
  		});
	},
	updateLines: function() {
		var svg = d3.select('#vis-pane > svg > g');

		svg.selectAll('.group > .line-chart').each(function(d) {
			var lineData = d.lineData;

			d3.select(this).select('.line-group > .line')
				.transition()
				.attr('d', lineData);
		});
	},
	updateMinMaxPoints: function() {
		var svg = d3.select('#vis-pane > svg > g');
		var lineChartHeight = VisualizationPane.lineChartHeight;
		var yearWidth = VisualizationPane.yearWidth;
		var timeSeriesMinYear = DataProcessingPlotter.allTimelineMinYear;

		svg.selectAll('.group > .line-chart').each(function(d) {
			var minPoint = d.minPoint;
			var maxPoint = d.maxPoint;
			var haveMinMax = minPoint !== null && maxPoint !== null;

			if (haveMinMax)	{
				d3.select(this).select('.min-point')
					.attr('cx', minPoint.x)
					.attr('cy', minPoint.y)
					.attr('r', 4);
				d3.select(this).select('.min-text')
					.style('text-anchor', 'middle')
					.attr('x', minPoint.x)
					.attr('y',  minPoint.y + 12)
					.text('min=' + (Math.round((minPoint.value + Number.EPSILON) * 1000) / 1000));
				d3.select(this).select('.max-point')
					.attr('cx', maxPoint.x)
					.attr('cy', maxPoint.y)
					.attr('r', 4);
				d3.select(this).select('.max-text')
					.style('text-anchor', 'middle')
					.attr('x', maxPoint.x)
					.attr('y', maxPoint.y - 5)
					.text('max=' + (Math.round((maxPoint.value + Number.EPSILON) * 1000) / 1000));
			}
			if (!haveMinMax) {
				d3.select(this).select('.min-point').attr('r', 0);
				d3.select(this).select('.min-text').text('');
				d3.select(this).select('.max-point').attr('r', 0);
				d3.select(this).select('.max-text').text('');
			}
		});
	},

	// helpers

	range: function(start, stop, step) {
		var list = [];

		for (var i = start; i <= stop; i++) {
			var isStartOrEnd = (i == start || i == stop);
			var isMultiple = (i % step == 0);
			var isFarFromStartOrEnd = Math.abs(i - start) > 3 && Math.abs(i - stop) > 3; // hack

			if (isStartOrEnd || (isMultiple && isFarFromStartOrEnd))
				list.push(i);
		}

		return list;
	}
}