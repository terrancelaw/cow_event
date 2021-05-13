const DataProcessingPlotter = {
	allTimelineMinYear: null,
	allTimelineMaxYear: null,

	generate: function() {
		const self = this;

		self.initPlotData();
		DataProcessingLineChartPlotter.generate();
		DataProcessingTimelinePlotter.generate();
		self.generateGroupHeight();
		self.generateGroupTranslateY();
	},
	initPlotData: function() {
		const self = this;

		self.getTimelineStartAndEnd();
		self.createPlotDataForEachGroup();
	},
	generateGroupHeight: function() {
		var plotData = DataProcessor.plotData;
		var groupMinHeight = VisualizationPane.groupMinHeight;
		var timelineYMargin = VisualizationPane.timelineYMargin;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var currGroupHeight = 0;
			var chartCount = 0;
			var lineChartList = groupData.lineChartData;
			var timelineList = groupData.timelineData;

			for (var j = 0; j < lineChartList.length; j++) {
				var lineChartObject = lineChartList[j];
				currGroupHeight += lineChartObject.height;
				chartCount++;
			}
			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				currGroupHeight += timelineObject.height;
				chartCount++;
			}
			if (chartCount > 1) // at least 2 groups
				currGroupHeight += (chartCount - 1) * timelineYMargin;
			if (currGroupHeight < groupMinHeight)
				currGroupHeight = groupMinHeight;

			groupData.height = currGroupHeight;
		}
	},
	generateGroupTranslateY: function() {
		var plotData = DataProcessor.plotData;
		var currGroupTranslateY = 0;
		var groupYMargin = VisualizationPane.groupYMargin;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			groupData.translateY = currGroupTranslateY;
			currGroupTranslateY += groupData.height + groupYMargin;
		}
	},

	// initPlotData

	getTimelineStartAndEnd: function() {
		const self = this;
		var eventNameToStageAttrData = Database.eventNameToStageAttrData;
		var filteredDataByGroup = DataProcessor.filteredDataByGroup;
		var allTimelineMinYear = Infinity;
		var allTimelineMaxYear = -Infinity;

		for (var groupName in filteredDataByGroup) {
			var timeSeriesData = filteredDataByGroup[groupName].timeSeriesData;
			var eventData = filteredDataByGroup[groupName].eventData;

			// time series
			for (var timeSeriesName in timeSeriesData)
				for (var i = 0; i < timeSeriesData[timeSeriesName].length; i++) {
					var timeSeriesRow = timeSeriesData[timeSeriesName][i];
					var year = timeSeriesRow.year;
					var isYearMissing = year === null;
					if (!isYearMissing && year < allTimelineMinYear) allTimelineMinYear = year;
					if (!isYearMissing && year > allTimelineMaxYear) allTimelineMaxYear = year;
				}

			for (var eventName in eventData) {
				var stageDataList = eventNameToStageAttrData[eventName];
				var hasStageList = stageDataList.length > 0;

				// point event
				if (!hasStageList)
					for (var i = 0; i < eventData[eventName].length; i++) {
						var eventRow = eventData[eventName][i];
						var startYear = eventRow.startYear;
						var endYear = eventRow.endYear;
						var isStartMissing = startYear === null;
						var isEndMissing = endYear === null;
						if (!isStartMissing && startYear < allTimelineMinYear) allTimelineMinYear = startYear;
						if (!isStartMissing && startYear > allTimelineMaxYear) allTimelineMaxYear = startYear;
						if (!isEndMissing && endYear < allTimelineMinYear) allTimelineMinYear = endYear;
						if (!isEndMissing && endYear > allTimelineMaxYear) allTimelineMaxYear = endYear;
					}

				// interval event
				else if (hasStageList)
					for (var i = 0; i < eventData[eventName].length; i++)
						for (var j = 0; j < eventData[eventName][i].stageList.length; j++) {
							var stageRow = eventData[eventName][i].stageList[j];
							var startYear = stageRow.startYear;
							var endYear = stageRow.endYear;
							var isStartMissing = startYear === null;
							var isEndMissing = endYear === null;
							if (!isStartMissing && startYear < allTimelineMinYear) allTimelineMinYear = startYear;
							if (!isStartMissing && startYear > allTimelineMaxYear) allTimelineMaxYear = startYear;
							if (!isEndMissing && endYear < allTimelineMinYear) allTimelineMinYear = endYear;
							if (!isEndMissing && endYear > allTimelineMaxYear) allTimelineMaxYear = endYear;
						}
			}
		}

		self.allTimelineMinYear = allTimelineMinYear;
		self.allTimelineMaxYear = allTimelineMaxYear;
	},
	createPlotDataForEachGroup: function() {
		const self = this;
		var allTimelineMinYear = self.allTimelineMinYear;
		var allTimelineMaxYear = self.allTimelineMaxYear;
		var filteredDataByGroup = DataProcessor.filteredDataByGroup;
		var plotData = [];
		var groupNameList = Object.keys(filteredDataByGroup);
		
		for (var i = 0; i < groupNameList.length; i++) {
			var groupName = groupNameList[i];
			var groupData = {};

			groupData.name = groupName;
			groupData.height = null;
			groupData.translateY = null;

			groupData.timelineData = [];
			groupData.lineChartData = [];

			groupData.timelineMinYear = allTimelineMinYear;
			groupData.timelineMaxYear = allTimelineMaxYear;

			plotData.push(groupData);
		}

		DataProcessor.plotData = plotData;
	}
}