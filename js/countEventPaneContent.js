const CountEventPaneContent = {
	updateGroups: function() {
		var eventCountData = DataProcessor.eventCountData;

		var groupUpdate = d3.select('#count-event-pane > .content').selectAll('div.group')
			.data(eventCountData);

		var groupEnter = groupUpdate.enter()
			.append('div')
			.attr('class', 'group')
			.each(function(d) { // append all data
				var countData = d.countData;

				var timelineEventCountUpdate = d3.select(this).selectAll('.timeline-event-count')
					.data(countData);
				var timelineEventCountEnter = timelineEventCountUpdate.enter()
					.append('div')
					.attr('class', 'timeline-event-count');
				var timelineEventCountExit = timelineEventCountUpdate.exit()
					.remove();
			});

		var groupExit = groupUpdate.exit()
			.remove();
	},
	updateGroupName: function() {
		const self = this;

		$('#count-event-pane > .content > .group').each(function() {
			var data = d3.select(this).datum();
			var groupName = data.name;
			var groupNameHTML = self.generateGroupNameHTML(groupName);
			$(this).prepend(groupNameHTML);
		});
	},
	updateTimelineName: function() {
		const self = this;

		$('#count-event-pane > .content > .group > .timeline-event-count').each(function() {
			var data = d3.select(this).datum();
			var timelineName = data.timelineName;
			var timelineNameHTML = null;

			if (timelineName != 'events') {
				timelineNameHTML = self.generateTimelineNameHTML(timelineName);
				$(this).append(timelineNameHTML);
			}
		});
	},
	updateBarChart: function() {
		const self = this;

		$('#count-event-pane > .content > .group > .timeline-event-count').each(function() {
			var data = d3.select(this).datum();
			var countList = data.countList;
			var barChartHTML = self.generateBarChartHTML(countList);
			$(this).append(barChartHTML);
		});
	},
	updateDescription: function() {
		const self = this;

		$('#count-event-pane > .content > .group > .timeline-event-count').each(function() {
			var data = d3.select(this).datum();
			var countList = data.countList;
			var descriptionHTML = self.generateDescriptionHTML(countList);
			$(this).append(descriptionHTML);
		});
	},
	showNone: function() {
		$('#count-event-pane > .content')
			.append('<div class="no-event-attribute-text">No Event Attribute Selected</div>');
	},

	// helpers

	generateGroupNameHTML: function(groupName) {
		return '<div class="group-name">' + groupName + '</div>';
	},
	generateTimelineNameHTML: function(timelineName) {
		return '<div class="timeline-name">' + timelineName + '</div>';
	},
	generateBarChartHTML: function(countList) {
		var maxCount = CountEventPane.maxCount;
		var eventName = DataProcessingEventCounter.eventName;
		var barChartHTML = '<div class="bar-chart">';
		var barCount = 0;

		for (var i = 0; i < countList.length; i++)
			if (countList[i].count > 0) {
				var countData = countList[i];
				var value = countData.value;
				var count = countData.count;
				var countString = countData.countString;
				var length = 100 / maxCount * count;

				barCount++;
				barChartHTML += '<div class="label">' + value + '</div>' +
								'<div class="bar-container">' +
									'<div class="bar" style="width:' + length + '%"></div>' +
									'<div class="count" style="left:' + length + '%">' + countString + '</div>' +
								'</div>';
			}

		if (barCount == 0)
			return '<div class="bar-chart no-event">' + 
						'NO EVENT NAMED "' + eventName + '"' +
				   '</div>';

		barChartHTML += '</div>'
		return barChartHTML;
	},
	generateDescriptionHTML: function(countList) {
		var showChartDescription = State.showChartDescription;
		var itemCount = 0;
		var descriptionHTML = showChartDescription 
							? '<div class="description">'
							: '<div class="description" style="display:none">';

		var eventAttributeName = DataProcessingEventCounter.eventAttributeName;
		var eventAttributeAttributeName = DataProcessingEventCounter.eventAttributeAttributeName;
		var attributeName = eventAttributeAttributeName ? eventAttributeAttributeName : eventAttributeName;

		for (var i = 0; i < countList.length && itemCount < 5; i++)
			if (countList[i].count > 0) {
				var countData = countList[i];
				var binMin = countData.binMin;
				var binMax = countData.binMax;
				var value = countData.value;
				var count = countData.count;
				var countString = countData.countString;
				var beString = count > 1 ? 'are' : 'is';
				var haveString = count > 1 ? 'have' : 'has';
				var attributeNameString = itemCount == 0 ? (' for ' + attributeName) : '';

				if (binMin) descriptionHTML += 
					'<div>• ' + countString + ' ' + beString + ' between ' + binMin + ' and ' + binMax + attributeNameString + '</div>';
				else if (!binMin) descriptionHTML += 
					'<div>• ' + countString + ' ' + haveString + ' a value equals ' + value + attributeNameString + '</div>';

				itemCount++;
			}

		descriptionHTML += '</div>'
		return descriptionHTML;
	}
}