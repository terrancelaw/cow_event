const CountEventPaneHeader = {
	update: function() {
		const self = this;
		var	eventName = DataProcessingEventCounter.eventName;
		var eventAttributeName = DataProcessingEventCounter.eventAttributeName;
		var eventAttributeAttributeName = DataProcessingEventCounter.eventAttributeAttributeName;
		var headerHTML = self.generateHeaderHTML(eventName, eventAttributeName, eventAttributeAttributeName);

		$('#count-event-pane > .header')
			.css('display', '')
			.append(headerHTML);
	},
	showNone: function() {
		$('#count-event-pane > .header')
			.css('display', 'none');
	},

	// helpers

	generateHeaderHTML: function(eventName, eventAttributeName, eventAttributeAttributeName) {
		const self = this;
		var countingEventAttribute = eventAttributeAttributeName === null;
		var countingEventAttrAttr = eventAttributeAttributeName !== null;

		var eventHTML = self.generateHeaderEventHTML(eventName);
		var eventAttributeHTML = '<span>' + eventAttributeName + '</span>';
		var eventAttrAttrHTML = eventAttributeAttributeName !== null ? '<span>' + eventAttributeAttributeName + '</span>' : null;

		if (countingEventAttribute)
			return 'COUNTING ' + eventAttributeHTML + ' IN THE EVENT ' + eventHTML;
		else if (countingEventAttrAttr)
			return 'COUNTING ' + eventAttrAttrHTML + ' OF ' + eventAttributeHTML + ' IN THE EVENT ' + eventHTML;
	},
	generateHeaderEventHTML: function(eventName) {
		var stageDataList = Database.eventNameToStageAttrData[eventName];
		var eventNameHTML = '';

		// point event
		if (stageDataList.length == 0) {
			var eventColor = VisualizationPane.getColor(eventName);
			eventNameHTML = '<span style="color:' + eventColor + '">' + eventName + '</span>';
		}

		// interval event
		else if (stageDataList.length > 0) {
			var brokenEventNameLength = Math.ceil(eventName.length / stageDataList.length);
			var brokenEventNameList = eventName.match(new RegExp('.{1,' + brokenEventNameLength + '}', 'g'));

			for (var i = 0; i < stageDataList.length; i++) {
				var stageData = stageDataList[i];
				var stageName = stageData.eventName;
				var stageColor = VisualizationPane.getColor(stageName);
				var brokenEventName = brokenEventNameList[i];
				eventNameHTML += '<span style="color:' + stageColor + '">' + brokenEventName + '</span>';
			}
		}

		return eventNameHTML;
	}
}