const DataProcessingLineChartPlotter = {
	generate: function() {
		const self = this;

		self.initLineChartData();
		self.generateLineChartData();
		self.generateLineChartTranslateY();
	},
	initLineChartData: function() {
		var plotData = DataProcessor.plotData;
		var lineChartHeight = VisualizationPane.lineChartHeight;
		var lineChartTopPadding = VisualizationPane.lineChartTopPadding;
		var timeSeriesList = State.visualize.filter(function(d) {
			return d.type == 'timeSeries';
		}).map(function(d) { return d.data.timeSeriesName });

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var groupName = groupData.name;
			var lineChartData = groupData.lineChartData;

			for (var j = 0; j < timeSeriesList.length; j++) {
				var lineChartObject = {};
				lineChartObject.name = timeSeriesList[j];
				lineChartObject.height = lineChartHeight + lineChartTopPadding;
				lineChartObject.translateY = null;
				lineChartObject.lineData = null;
				lineChartObject.minPoint = null;
				lineChartObject.maxPoint = null;
				lineChartData.push(lineChartObject);
			}
		}
	},
	generateLineChartData: function() {
		const self = this;
		var normalizeTimeSeries = State.normalizeTimeSeries;
		var timeSeriesNameToObject = Database.getTimeSeriesNameToObject();
		var filteredDataByGroup = DataProcessor.filteredDataByGroup;
		var plotData = DataProcessor.plotData;
		var yearWidth = VisualizationPane.yearWidth;
		var lineChartHeight = VisualizationPane.lineChartHeight;
		var timeSeriesMinYear = DataProcessingPlotter.allTimelineMinYear;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var groupName = groupData.name;
			var lineChartList = groupData.lineChartData;

			for (var j = 0; j < lineChartList.length; j++) {
				var lineChartObject = lineChartList[j];
				var timeSeriesName = lineChartObject.name;
				var timeSeriesData = filteredDataByGroup[groupName].timeSeriesData[timeSeriesName];
				var averagedTimeSeriesData = self.averageTimeSeriesForEachYear(timeSeriesData, timeSeriesName);

				// nothing to draw
				if (averagedTimeSeriesData.length == 0) {
					lineChartObject.lineData = [];
					lineChartObject.minPoint = null;
					lineChartObject.maxPoint = null;
				}

				// something to draw and normalize
				else if (averagedTimeSeriesData.length > 0 && normalizeTimeSeries) {
					var minPoint = self.getMinPoint(averagedTimeSeriesData);
					var maxPoint = self.getMaxPoint(averagedTimeSeriesData);
					var yScale = d3.scaleLinear()
						.domain([ minPoint.value, maxPoint.value ])
						.range([ lineChartHeight, 0 ]);
					var lineGenerator = d3.line()
						.x(function(d) { return (d.year - timeSeriesMinYear) * yearWidth })
						.y(function(d) {  return yScale(d.value) });
					var lineData = lineGenerator(averagedTimeSeriesData);

					// add data to min and max
					minPoint.x = (minPoint.year - timeSeriesMinYear) * yearWidth;
					minPoint.y = yScale(minPoint.value);
					maxPoint.x = (maxPoint.year - timeSeriesMinYear) * yearWidth;
					maxPoint.y = yScale(maxPoint.value);

					// store
					lineChartObject.lineData = lineData;
					lineChartObject.minPoint = minPoint;
					lineChartObject.maxPoint = maxPoint;
				}

				// something to draw and not normalize
				else if (averagedTimeSeriesData.length > 0 && !normalizeTimeSeries) {
					var minPoint = self.getMinPoint(averagedTimeSeriesData);
					var maxPoint = self.getMaxPoint(averagedTimeSeriesData);
					var globalMinValue = timeSeriesNameToObject[timeSeriesName].valueRange[0];
					var globalMaxValue = timeSeriesNameToObject[timeSeriesName].valueRange[1];
					var yScale = d3.scaleLinear()
						.domain([ globalMinValue, globalMaxValue ])
						.range([ lineChartHeight, 0 ]);
					var lineGenerator = d3.line()
						.x(function(d) { return (d.year - timeSeriesMinYear) * yearWidth })
						.y(function(d) {  return yScale(d.value) });
					var lineData = lineGenerator(averagedTimeSeriesData);

					// add data to min and max
					minPoint.x = (minPoint.year - timeSeriesMinYear) * yearWidth;
					minPoint.y = yScale(minPoint.value);
					maxPoint.x = (maxPoint.year - timeSeriesMinYear) * yearWidth;
					maxPoint.y = yScale(maxPoint.value);

					// store
					lineChartObject.lineData = lineData;
					lineChartObject.minPoint = minPoint;
					lineChartObject.maxPoint = maxPoint;
				}
			}
		}
	},
	generateLineChartTranslateY: function() {
		var plotData = DataProcessor.plotData;
		var lineChartHeight = VisualizationPane.lineChartHeight;
		var lineChartTopPadding = VisualizationPane.lineChartTopPadding;
		var timelineYMargin = VisualizationPane.timelineYMargin;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var lineChartList = groupData.lineChartData;
			var currTranslateY = 0;

			for (var j = 0; j < lineChartList.length; j++) {
				var lineChartObject = lineChartList[j];
				currTranslateY += lineChartTopPadding;
				lineChartObject.translateY = currTranslateY;
				currTranslateY += lineChartHeight + timelineYMargin;
			}
		}
	},

	// helpers

	averageTimeSeriesForEachYear: function(timeSeriesData, timeSeriesName) {
		var timeSeriesByYear = {};
		var averagedTimeSeriesData = [];

		// init timeSeriesByYear
		for (var i = 0; i < timeSeriesData.length; i++) {
			var timeSeriesRow = timeSeriesData[i];
			var year = timeSeriesRow.year;
			timeSeriesByYear[year] = [];
		}

		// push to timeSeriesByYear
		for (var i = 0; i < timeSeriesData.length; i++) {
			var timeSeriesRow = timeSeriesData[i];
			var year = timeSeriesRow.year;
			var value = timeSeriesRow[timeSeriesName];
			var isValueMissing = value === null;

			if (!isValueMissing)
				timeSeriesByYear[year].push(value)
		}

		// generate averagedTimeSeriesData
		for (var year in timeSeriesByYear) {
			var hasValueForCurrentYear = timeSeriesByYear[year].length > 0;
			var average = d3.mean(timeSeriesByYear[year]);

			if (hasValueForCurrentYear)
				averagedTimeSeriesData.push({ year: +year, value: average });
		}

		// sort by year
		return averagedTimeSeriesData.sort(function(a, b) {
			return a.year - b.year;
		});
	},
	getMinPoint: function(timeSeriesData) {
		var minPoint = null;
		var minValue = Infinity;

		for (var i = 0; i < timeSeriesData.length; i++)
			if (timeSeriesData[i].value < minValue) {
				minPoint = timeSeriesData[i];
				minValue = timeSeriesData[i].value;
			}

		return minPoint;
	},
	getMaxPoint: function(timeSeriesData) {
		var maxPoint = null;
		var maxValue = -Infinity;

		for (var i = 0; i < timeSeriesData.length; i++)
			if (timeSeriesData[i].value > maxValue) {
				maxPoint = timeSeriesData[i];
				maxValue = timeSeriesData[i].value;
			}

		return maxPoint;
	}
}