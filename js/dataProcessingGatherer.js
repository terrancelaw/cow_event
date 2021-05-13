const DataProcessingGatherer = {
	generate: function() {
		var rawTimeSeriesData = Database.rawData.timeSeriesData;
		var rawEventData = Database.rawData.eventData;
		var visualizeState = State.visualize;
		var filteredData = { timeSeriesData: {}, eventData: {} };

		for (var i = 0; i < visualizeState.length; i++) {
			var stateData = visualizeState[i].data;
			var stateType = visualizeState[i].type;

			if (stateType == 'timeSeries') {
				var timeSeriesName = stateData.timeSeriesName;
				filteredData.timeSeriesData[timeSeriesName] = rawTimeSeriesData[timeSeriesName];
			}
			else if (stateType == 'pointEvent' || stateType == 'intervalEvent') {
				var eventName = stateData.eventName;
				filteredData.eventData[eventName] = rawEventData[eventName];
			}
			else if (stateType == 'eventAttribute') {
				var eventAttributeData = stateData;
				var eventName = eventAttributeData.parentEventData.eventName;
				filteredData.eventData[eventName] = rawEventData[eventName];
			}
			else if (stateType == 'eventAttributeAttribute') {
				var eventAttributeData = stateData.parentEventAttributeData;
				var eventName = eventAttributeData.parentEventData.eventName;
				filteredData.eventData[eventName] = rawEventData[eventName];
			}
		}

		DataProcessor.filteredData = filteredData;
	}
}