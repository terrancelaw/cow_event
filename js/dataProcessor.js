const DataProcessor = {
	filteredData: {}, // { timeSeriesData, eventData }
	filteredDataByGroup: {},
	plotData: [], // [ { groupName, lineChartData, timelineData } ]
	eventCountData: [],

	update: function() {
		DataProcessingGatherer.generate();
		DataProcessingFilter.generate();
		DataProcessingGrouper.generate();
		DataProcessingPlotter.generate();
		DataProcessingEventCounter.generate();
	}
}