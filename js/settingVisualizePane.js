const SettingVisualizePane = {
	show: function() {
		const self = this;
		var timeSeriesList = Database.timeSeriesList;
		var pointEventList = Database.eventList.filter(function(a) { return a.eventType == 'point' });
		var intervalEventList = Database.eventList.filter(function(a) { return a.eventType == 'interval' });
		$('#setting-pane > .settings').removeClass('visualize');
		$('#setting-pane > .settings').removeClass('group');
		$('#setting-pane > .settings').removeClass('filter');
		$('#setting-pane > .settings').removeClass('encode');
		$('#setting-pane > .settings').removeClass('highlight');
		$('#setting-pane > .settings').removeClass('other');
		$('#setting-pane > .settings').addClass('visualize');
		self.showSearchBox();
		self.initSearchBoxBehaviour();
		self.drawPointEvents(pointEventList);
		self.drawIntervalEvents(intervalEventList);
		self.drawTimeSeries(timeSeriesList);
		self.drawEventAttributes();
		self.drawEventAttributeAttributes();
		self.initClickTimeSeriesBehaviour();
		self.initClickPointEventBehaviour();
		self.initClickIntervalEventBehaviour();
		self.initClickEventAttributeBehaviour();
		self.initClickEventAttributeAttributeBehaviour();
		self.initClickTitleExpandButtonBehaviour();
		self.initClickEventExpandButtonBehaviour();
		self.initClickEventAttributeExpandButtonBehaviour();
		self.initHoverExpandableTitleBehaviour();
		self.initHoverVisualizePaneEntryBehaviour();
		$('#setting-pane > .settings').scrollTop(0);
	},
	showSearchBox: function() {
		$('#setting-pane > .search-box')
			.css('display', '');
	},
	initSearchBoxBehaviour: function() {
		const self = this;

		$('#setting-pane > .search-box > input')
			.unbind('input')
			.on('input', onInputSearchQuery);

		function onInputSearchQuery() {
			var searchQueryInLowerCase = $(this).val().toLowerCase();

			if (searchQueryInLowerCase == '') {
				var timeSeriesList = Database.timeSeriesList;
				var pointEventList = Database.eventList.filter(function(a) { return a.eventType == 'point' });
				var intervalEventList = Database.eventList.filter(function(a) { return a.eventType == 'interval' });
				SettingPane.empty();
				self.drawTimeSeries(timeSeriesList);
				self.drawPointEvents(pointEventList);
				self.drawIntervalEvents(intervalEventList);
				self.drawEventAttributes();
				self.drawEventAttributeAttributes();
				self.initClickTimeSeriesBehaviour();
				self.initClickPointEventBehaviour();
				self.initClickIntervalEventBehaviour();
				self.initClickEventAttributeBehaviour();
				self.initClickEventAttributeAttributeBehaviour();
				self.initClickTitleExpandButtonBehaviour();
				self.initClickEventExpandButtonBehaviour();
				self.initClickEventAttributeExpandButtonBehaviour();
				self.initHoverExpandableTitleBehaviour();
				self.initHoverVisualizePaneEntryBehaviour();
			}
			else if (searchQueryInLowerCase != '') {
				self.markVariables(searchQueryInLowerCase);
				self.filterTimeSeries(searchQueryInLowerCase);
				self.filterEventAttributeAttributes(searchQueryInLowerCase);
				self.filterEventAttributes(searchQueryInLowerCase);
				self.filterEvents(searchQueryInLowerCase);
				self.filterTitles();
			}
		}
	},
	drawTimeSeries: function(timeSeriesList) {
		var self = this;
		var hiddenTimeSeries = Configuration.hiddenTimeSeries;
		var needExpandButton = false;

		if (timeSeriesList.length > 0)
			$('#setting-pane > .settings')
				.append('<div class="title">Time Series</div>');

		for (var i = 0; i < timeSeriesList.length; i++) {
			var timeSeriesData = timeSeriesList[i];
			var timeSeriesName = timeSeriesData.timeSeriesName;
			var timeSeriesHTML = self.generateTimeSeriesHTML(timeSeriesName);
			var previouslySelected = State.searchVisualizeState(timeSeriesData) !== null;
			var shouldBeHidden = hiddenTimeSeries.indexOf(timeSeriesName) != -1;
			var addedTimeSeriesEl = null;

			if (shouldBeHidden)
				needExpandButton = true;

			if (!previouslySelected && shouldBeHidden) { // should be hidden
				$('#setting-pane > .settings').append(timeSeriesHTML);
				addedTimeSeriesEl = $('#setting-pane > .settings > .time-series').last()[0];
				d3.select(addedTimeSeriesEl).datum(timeSeriesData);
				$(addedTimeSeriesEl).css('display', 'none');
			}
			else if (!previouslySelected && !shouldBeHidden) { // should be shown
				$('#setting-pane > .settings').append(timeSeriesHTML);
				addedTimeSeriesEl = $('#setting-pane > .settings > .time-series').last()[0];
				d3.select(addedTimeSeriesEl).datum(timeSeriesData);
			}
			else if (previouslySelected) {
				$('#setting-pane > .settings').append(timeSeriesHTML);
				addedTimeSeriesEl = $('#setting-pane > .settings > .time-series').last()[0];
				d3.select(addedTimeSeriesEl).datum(timeSeriesData);
				$(addedTimeSeriesEl).addClass('selected');
			}
		}

		if (needExpandButton)
			$('#setting-pane > .settings > .title').last()
				.html('Time Series<span class="fa fa-caret-down"></span>')
				.addClass('expandable');
	},
	drawPointEvents: function(pointEventList) {
		const self = this;
		var hiddenPointEvents = Configuration.hiddenPointEvents;
		var needExpandButton = false;

		if (pointEventList.length > 0)
			$('#setting-pane > .settings')
				.append('<div class="title">Point Events</div>');

		for (var i = 0; i < pointEventList.length; i++) {
			var pointEventData = pointEventList[i];
			var eventName = pointEventData.eventName;
			var hasAttributes = pointEventData.eventAttributeList.length > 0;
			var eventHTML = self.generatePointEventHTML(eventName, hasAttributes);
			var previouslySelected = State.searchVisualizeState(pointEventData) !== null;
			var shouldBeHidden = hiddenPointEvents.indexOf(eventName) != -1;
			var addedPointEventEl = null;

			if (shouldBeHidden)
				needExpandButton = true;

			if (!previouslySelected && shouldBeHidden) { // should be hidden
				$('#setting-pane > .settings').append(eventHTML);
				addedPointEventEl = $('#setting-pane > .settings > .point.event').last()[0];
				d3.select(addedPointEventEl).datum(pointEventData);
				$(addedPointEventEl).css('display', 'none');
			}
			else if (!previouslySelected && !shouldBeHidden) { // should be shown
				$('#setting-pane > .settings').append(eventHTML);
				addedPointEventEl = $('#setting-pane > .settings > .point.event').last()[0];
				d3.select(addedPointEventEl).datum(pointEventData);
			}
			else if (previouslySelected) {
				$('#setting-pane > .settings').append(eventHTML);
				addedPointEventEl = $('#setting-pane > .settings > .point.event').last()[0];
				d3.select(addedPointEventEl).datum(pointEventData);
				$(addedPointEventEl).addClass('selected');
			}
		}

		if (needExpandButton)
			$('#setting-pane > .settings > .title').last()
				.html('Point Events<span class="fa fa-caret-down"></span>')
				.addClass('expandable');
	},
	drawIntervalEvents: function(intervalEventList) {
		const self = this;
		var hiddenIntervalEvents = Configuration.hiddenIntervalEvents;
		var needExpandButton = false;

		if (intervalEventList.length > 0)
			$('#setting-pane > .settings')
				.append('<div class="title">Interval Events</div>');

		for (var i = 0; i < intervalEventList.length; i++) {
			var intervalEventData = intervalEventList[i];
			var eventName = intervalEventData.eventName;
			var hasAttributes = intervalEventData.eventAttributeList.length > 0;
			var eventHTML = self.generateIntervalEventHTML(eventName, hasAttributes);
			var previouslySelected = State.searchVisualizeState(intervalEventData) !== null;
			var shouldBeHidden = hiddenIntervalEvents.indexOf(eventName) != -1;
			var addedIntervalEventEl = null;

			if (shouldBeHidden) needExpandButton = true;

			if (!previouslySelected && shouldBeHidden) { // should be hidden
				$('#setting-pane > .settings').append(eventHTML);
				addedIntervalEventEl = $('#setting-pane > .settings > .interval.event').last()[0];
				d3.select(addedIntervalEventEl).datum(intervalEventData);
				$(addedIntervalEventEl).css('display', 'none');
			}
			else if (!previouslySelected && !shouldBeHidden) { // should be shown
				$('#setting-pane > .settings').append(eventHTML);
				addedIntervalEventEl = $('#setting-pane > .settings > .interval.event').last()[0];
				d3.select(addedIntervalEventEl).datum(intervalEventData);
			}
			else if (previouslySelected) {
				$('#setting-pane > .settings').append(eventHTML);
				addedIntervalEventEl = $('#setting-pane > .settings > .interval.event').last()[0];
				d3.select(addedIntervalEventEl).datum(intervalEventData);
				$(addedIntervalEventEl).addClass('selected');
			}
		}

		if (needExpandButton)
			$('#setting-pane > .settings > .title').last()
				.html('Interval Events<span class="fa fa-caret-down"></span>')
				.addClass('expandable');
	},
	drawEventAttributes: function() {
		const self = this;

		$('#setting-pane > .settings > .event').each(function() {
			var eventData = d3.select(this).datum();
			var eventAttributeList = eventData.eventAttributeList;
			var currentEl = this;
			var nextEl = null;

			for (var i = 0; i < eventAttributeList.length; i++) {
				var eventAttributeData = eventAttributeList[i];
				var attributeName = eventAttributeData.eventAttributeName;
				var attributeType = eventAttributeData.eventAttributeType;
				var eventAttributeAttributeList = eventAttributeData.eventAttributeAttributeList;
				var hasAttributes = eventAttributeAttributeList.length > 0;
				var typeClass = attributeType == 'categorical' ? 'fa-font' : 'fa-hashtag';
				var attributeHTML = self.generateEventAttributeHTML(attributeName, typeClass, hasAttributes);
				var previouslySelected = State.searchVisualizeState(eventAttributeData) !== null;
				var eventAttrAttrPreviouslySelected = checkIfEventAttrAttrPreviouslySelected(eventAttributeAttributeList);

				if (!previouslySelected && !eventAttrAttrPreviouslySelected) {
					$(currentEl).after(attributeHTML);
					currentEl = $(currentEl).next()[0];
					d3.select(currentEl).datum(eventAttributeData);
					$(currentEl).css('display', 'none');
				}
				else if (previouslySelected && eventAttrAttrPreviouslySelected ||
						 previouslySelected && !eventAttrAttrPreviouslySelected) {
					$(currentEl).after(attributeHTML);
					currentEl = $(currentEl).next()[0];
					d3.select(currentEl).datum(eventAttributeData);
					$(currentEl).css('display', '');
					$(currentEl).addClass('selected');
				}
				else if (!previouslySelected && eventAttrAttrPreviouslySelected) {
					$(currentEl).after(attributeHTML);
					currentEl = $(currentEl).next()[0];
					d3.select(currentEl).datum(eventAttributeData);
					$(currentEl).css('display', '');
				}
			}
		});

		function checkIfEventAttrAttrPreviouslySelected(eventAttributeAttributeList) {
			for (var i = 0; i < eventAttributeAttributeList.length; i++) {
				var eventAttributeAttributeData = eventAttributeAttributeList[i];
				var previouslySelected = State.searchVisualizeState(eventAttributeAttributeData) !== null;
				if (previouslySelected) return true;
			}
			return false;
		}
	},
	drawEventAttributeAttributes: function() {
		const self = this;

		$('#setting-pane > .settings > .event-attribute').each(function() {
			var eventAttributeData = d3.select(this).datum();
			var eventAttributeAttributeList = eventAttributeData.eventAttributeAttributeList;
			var currentEl = this;
			var nextEl = null;

			for (var i = 0; i < eventAttributeAttributeList.length; i++) {
				var eventAttributeAttributeData = eventAttributeAttributeList[i];
				var attributeName = eventAttributeAttributeData.attributeName;
				var attributeType = eventAttributeAttributeData.attributeType;
				var typeClass = attributeType == 'categorical' ? 'fa-font' : 'fa-hashtag';
				var attributeHTML = self.generateEventAttrAttrHTML(attributeName, typeClass);
				var previouslySelected = State.searchVisualizeState(eventAttributeAttributeData) !== null;

				if (!previouslySelected) {
					$(currentEl).after(attributeHTML);
					currentEl = $(currentEl).next()[0];
					d3.select(currentEl).datum(eventAttributeAttributeData);
					$(currentEl).css('display', 'none');
				}
				else if (previouslySelected) {
					$(currentEl).after(attributeHTML);
					currentEl = $(currentEl).next()[0];
					d3.select(currentEl).datum(eventAttributeAttributeData);
					$(currentEl).css('display', '');
					$(currentEl).addClass('selected');
				}
			}
		});
	},
	initClickTimeSeriesBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.visualize > .time-series')
			.on('click', onClickVisualizePaneTimeSeries);

		function onClickVisualizePaneTimeSeries() {
			var isSelected = $(this).hasClass('selected');
			var timeSeriesData = d3.select(this).datum();

			// remove time series
			if (isSelected) {
				$(this).removeClass('selected');
				State.removeVisualizeState(timeSeriesData);
				RightColumn.update();
			}

			// add time series
			else if (!isSelected) {
				$(this).addClass('selected');
				State.addVisualizeState('timeSeries', timeSeriesData);
				RightColumn.update();
			}
		}
	},
	initClickPointEventBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.visualize > .point.event')
			.on('click', onClickVisualizePanePointEvent);

		function onClickVisualizePanePointEvent(event) {
			var clickedExpandButton = $(event.target).hasClass('expand-button');
			var isSelected = $(this).hasClass('selected');
			var pointEventData = d3.select(this).datum();
			var eventName = pointEventData.eventName;

			// remove point event
			if (!clickedExpandButton && isSelected) {
				$(this).removeClass('selected');
				State.removeVisualizeState(pointEventData);
				State.removeEventFilters(eventName);
				State.removeEventEncodings(eventName);
				State.removeEventHighlights(eventName);
				self.deselectChildrenAttributes(this); // remove state as well
				RightColumn.update();
			}

			// add point event
			else if (!clickedExpandButton && !isSelected) {
				$(this).addClass('selected');
				State.addVisualizeState('pointEvent', pointEventData);
				RightColumn.update();
			}
		}
	},
	initClickIntervalEventBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.visualize > .interval.event')
			.on('click', onClickVisualizePaneIntervalEvent);

		function onClickVisualizePaneIntervalEvent(event) {
			var clickedExpandButton = $(event.target).hasClass('expand-button');
			var isSelected = $(this).hasClass('selected');
			var intervalEventData = d3.select(this).datum();
			var eventName = intervalEventData.eventName;

			// remove interval event
			if (!clickedExpandButton && isSelected) {
				$(this).removeClass('selected');
				State.removeVisualizeState(intervalEventData);
				State.removeEventFilters(eventName);
				State.removeEventHighlights(eventName);
				State.removeEventEncodings(eventName);
				self.deselectChildrenAttributes(this); // remove state as well
				RightColumn.update();
			}

			// add interval event
			else if (!clickedExpandButton && !isSelected) {
				$(this).addClass('selected');
				State.addVisualizeState('intervalEvent', intervalEventData);
				RightColumn.update();
			}
		}
	},
	initClickEventAttributeBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.visualize > .event-attribute')
			.on('click', onClickVisualizePaneEventAttribute);

		function onClickVisualizePaneEventAttribute() {
			var clickedExpandButton = $(event.target).hasClass('expand-button');
			var isSelected = $(this).hasClass('selected');
			var eventAttributeData = d3.select(this).datum();

			// remove eventAttribute
			if (!clickedExpandButton && isSelected) {
				$(this).removeClass('selected');
				State.removeVisualizeState(eventAttributeData);
				RightColumn.update();
			}

			// add eventAttribute
			else if (!clickedExpandButton && !isSelected) {
				self.deselectAllEventAttributes();
				self.selectParentEvent(this); // add state as well
				$(this).addClass('selected');
				State.addVisualizeState('eventAttribute', eventAttributeData);
				RightColumn.update();
			}
		}
	},
	initClickEventAttributeAttributeBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.visualize > .event-attribute-attribute')
			.on('click', onClickVisualizePaneEventAttrAttr);

		function onClickVisualizePaneEventAttrAttr() {
			var isSelected = $(this).hasClass('selected');
			var eventAttributeAttributeData = d3.select(this).datum();

			// remove eventAttributeAttribute
			if (isSelected) {
				$(this).removeClass('selected');
				State.removeVisualizeState(eventAttributeAttributeData);
				RightColumn.update();
			}

			// add eventAttributeAttribute
			else if (!isSelected) {
				self.deselectAllEventAttributes();
				self.selectParentEvent(this); // add state as well
				$(this).addClass('selected');
				State.addVisualizeState('eventAttributeAttribute', eventAttributeAttributeData);
				RightColumn.update();
			}
		}
	},
	initClickTitleExpandButtonBehaviour: function() {
		const self = this;
		var hiddenTimeSeries = Configuration.hiddenTimeSeries;
		var hiddenPointEvents = Configuration.hiddenPointEvents;
		var hiddenIntervalEvents = Configuration.hiddenIntervalEvents;

		$('#setting-pane > .settings.visualize > .title.expandable')
			.on('click', onClickExpandableTitle);

		function onClickExpandableTitle() {
			var needToExpand = $(this).find('.fa').hasClass('fa-caret-down');
			var itemString = $(this).text().toLowerCase();
			var currentEl = $(this).next()[0];
			var isCurrentTimeSeries = $(currentEl).hasClass('time-series');
			var isCurrentEvent = $(currentEl).hasClass('event');
			var isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
			var isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
			
			if (needToExpand) {
				$(this).find('.fa').removeClass('fa-caret-down');
				$(this).find('.fa').addClass('fa-caret-up');
				SettingPaneAttributeTooltip.updateText('Click to show fewer ' + itemString);

				while (isCurrentTimeSeries || 
					   isCurrentEvent || 
					   isCurrentEventAttribute || 
					   isCurrentEventAttributeAttribute) {
					if (isCurrentTimeSeries)
						$(currentEl).css('display', '');
					else if (isCurrentEvent)
						$(currentEl).css('display', '');

					currentEl = $(currentEl).next()[0];
					isCurrentTimeSeries = $(currentEl).hasClass('time-series');
					isCurrentEvent = $(currentEl).hasClass('event');
					isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
					isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
				}
			}

			else if (!needToExpand) { // collapse
				$(this).find('.fa').removeClass('fa-caret-up');
				$(this).find('.fa').addClass('fa-caret-down');
				SettingPaneAttributeTooltip.updateText('Click to show all ' + itemString);

				while (isCurrentTimeSeries || 
					   isCurrentEvent || 
					   isCurrentEventAttribute || 
					   isCurrentEventAttributeAttribute) {
					if (isCurrentTimeSeries) {
						var timeSeriesData = d3.select(currentEl).datum();
						var previouslySelected = State.searchVisualizeState(timeSeriesData) !== null;
						var timeSeriesName = timeSeriesData.timeSeriesName;
						var shouldBeShown = hiddenTimeSeries.indexOf(timeSeriesName) == -1;

						if (previouslySelected || shouldBeShown)
							$(currentEl).css('display', '');
						else if (!previouslySelected && !shouldBeShown)
							$(currentEl).css('display', 'none');
					}
					else if (isCurrentEvent) {
						var eventData = d3.select(currentEl).datum();
						var eventAttributeList = eventData.eventAttributeList;
						var previouslySelected = State.searchVisualizeState(eventData) !== null;
						var eventChildrenPreviouslySelected = checkIfEventChildrenPreviouslySelected(eventAttributeList);

						var eventName = eventData.eventName;
						var isPointEvent = eventData.eventType == 'point';
						var shouldBeShown = isPointEvent 
										  ? hiddenPointEvents.indexOf(eventName) == -1
										  : hiddenIntervalEvents.indexOf(eventName) == -1;

						$(currentEl).find('.expand-button').removeClass('fa-caret-square-up');
						$(currentEl).find('.expand-button').addClass('fa-caret-square-down');

						if (previouslySelected || eventChildrenPreviouslySelected || shouldBeShown)
							$(currentEl).css('display', '');
						if (!previouslySelected && !eventChildrenPreviouslySelected && !shouldBeShown)
							$(currentEl).css('display', 'none');
					}
					else if (isCurrentEventAttribute) {
						var eventAttributeData = d3.select(currentEl).datum();
						var eventAttributeAttributeList = eventAttributeData.eventAttributeAttributeList;
						var previouslySelected = State.searchVisualizeState(eventAttributeData) !== null;
						var eventAttrAttrPreviouslySelected = checkIfEventAttrAttrPreviouslySelected(eventAttributeAttributeList);

						$(currentEl).find('.expand-button').removeClass('fa-caret-square-up');
						$(currentEl).find('.expand-button').addClass('fa-caret-square-down');

						if (previouslySelected || eventAttrAttrPreviouslySelected)
							$(currentEl).css('display', '');
						if (!previouslySelected && !eventAttrAttrPreviouslySelected)
							$(currentEl).css('display', 'none');
					}
					else if (isCurrentEventAttributeAttribute) {
						var eventAttributeAttributeData = d3.select(currentEl).datum();
						var previouslySelected = State.searchVisualizeState(eventAttributeAttributeData) !== null;

						if (previouslySelected)
							$(currentEl).css('display', '');
						if (!previouslySelected)
							$(currentEl).css('display', 'none');
					}

					currentEl = $(currentEl).next()[0];
					isCurrentTimeSeries = $(currentEl).hasClass('time-series');
					isCurrentEvent = $(currentEl).hasClass('event');
					isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
					isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
				}
			}
		}

		function checkIfEventAttrAttrPreviouslySelected(eventAttributeAttributeList) {
			for (var i = 0; i < eventAttributeAttributeList.length; i++) {
				var eventAttributeAttributeData = eventAttributeAttributeList[i];
				var previouslySelected = State.searchVisualizeState(eventAttributeAttributeData) !== null;
				if (previouslySelected) return true;
			}
			return false;
		}

		function checkIfEventChildrenPreviouslySelected(eventAttributeList) {
			for (var i = 0; i < eventAttributeList.length; i++) {
				var eventAttributeData = eventAttributeList[i];
				var eventAttributeAttributeList = eventAttributeData.eventAttributeAttributeList;
				var previouslySelected = State.searchVisualizeState(eventAttributeData) !== null;
				var eventAttrAttrPreviouslySelected = checkIfEventAttrAttrPreviouslySelected(eventAttributeAttributeList);
				if (previouslySelected || eventAttrAttrPreviouslySelected) return true;
			}
			return false;
		}
	},
	initClickEventExpandButtonBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.visualize > .event > .expand-button')
			.on('click', onClickVisualizePaneEventExpandButton);

		function onClickVisualizePaneEventExpandButton() {
			var needToExpand = $(this).hasClass('fa-caret-square-down');
			var currentEl = $(this.parentNode).next()[0];
			var isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
			var isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');

			if (needToExpand) {
				$(this).removeClass('fa-caret-square-down');
				$(this).addClass('fa-caret-square-up');
				SettingPaneAttributeTooltip.updateText('Click to hide attributes');

				while (isCurrentEventAttribute || isCurrentEventAttributeAttribute) {
					if (isCurrentEventAttribute)
						$(currentEl).css('display', '');

					currentEl = $(currentEl).next()[0];
					isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
					isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
				}
			}
			else if (!needToExpand) { // collapse
				$(this).removeClass('fa-caret-square-up');
				$(this).addClass('fa-caret-square-down');
				SettingPaneAttributeTooltip.updateText('Click to show attributes');

				while (isCurrentEventAttribute || isCurrentEventAttributeAttribute) {
					if (isCurrentEventAttribute) {
						var eventAttributeData = d3.select(currentEl).datum();
						var eventAttributeAttributeList = eventAttributeData.eventAttributeAttributeList;
						var previouslySelected = State.searchVisualizeState(eventAttributeData) !== null;
						var eventAttrAttrPreviouslySelected = checkIfEventAttrAttrPreviouslySelected(eventAttributeAttributeList);

						$(currentEl).find('.expand-button').removeClass('fa-caret-square-up');
						$(currentEl).find('.expand-button').addClass('fa-caret-square-down');

						if (previouslySelected || eventAttrAttrPreviouslySelected)
							$(currentEl).css('display', '');
						else if (!previouslySelected && !eventAttrAttrPreviouslySelected)
							$(currentEl).css('display', 'none');
					}
					else if (isCurrentEventAttributeAttribute) { // not has expand button
						var eventAttributeAttributeData = d3.select(currentEl).datum();
						var previouslySelected = State.searchVisualizeState(eventAttributeAttributeData) !== null;

						if (previouslySelected)
							$(currentEl).css('display', '');
						if (!previouslySelected)
							$(currentEl).css('display', 'none');
					}

					currentEl = $(currentEl).next()[0];
					isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
					isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
				}
			}
		}

		function checkIfEventAttrAttrPreviouslySelected(eventAttributeAttributeList) {
			for (var i = 0; i < eventAttributeAttributeList.length; i++) {
				var eventAttributeAttributeData = eventAttributeAttributeList[i];
				var previouslySelected = State.searchVisualizeState(eventAttributeAttributeData) !== null;
				if (previouslySelected) return true;
			}
			return false;
		}
	},
	initClickEventAttributeExpandButtonBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.visualize > .event-attribute > .expand-button')
			.on('click', onClickVisualizePaneEventAttrExpandBtn);

		function onClickVisualizePaneEventAttrExpandBtn() {
			var needToExpand = $(this).hasClass('fa-caret-square-down');
			var currentEl = $(this.parentNode).next()[0];
			var isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');

			if (needToExpand) {
				$(this).removeClass('fa-caret-square-down');
				$(this).addClass('fa-caret-square-up');
				SettingPaneAttributeTooltip.updateText('Click to hide attributes');

				while (isCurrentEventAttributeAttribute) {
					$(currentEl).css('display', '');
					currentEl = $(currentEl).next()[0];
					isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
				}
			}
			else if (!needToExpand) { // collapse
				$(this).removeClass('fa-caret-square-up');
				$(this).addClass('fa-caret-square-down');
				SettingPaneAttributeTooltip.updateText('Click to show attributes');

				while (isCurrentEventAttributeAttribute) {
					var eventAttributeAttributeData = d3.select(currentEl).datum();
					var previouslySelected = State.searchVisualizeState(eventAttributeAttributeData) !== null;

					if (previouslySelected) 
						$(currentEl).css('display', '');
					if (!previouslySelected) 
						$(currentEl).css('display', 'none');

					currentEl = $(currentEl).next()[0];
					isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
				}
			}
		}
	},
	initHoverExpandableTitleBehaviour: function() {
		$('#setting-pane > .settings.visualize > .title.expandable')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverExpandableTitle)
			.on('mouseout', onMouseoutExpandableTitle);

		function onMouseoverExpandableTitle() {
			var isExpandButton = $(this).find('.fa')
				.hasClass('fa-caret-down');
			var offset = $(this).offset();
			var width = $(this).width();
			var itemString = $(this).text().toLowerCase();

			SettingPaneAttributeTooltip.simplyShow(
				left = offset.left + width + 8,
				top = offset.top,
				text = isExpandButton ? 'Click to show all ' + itemString 
									  : 'Click to show fewer ' + itemString
			);
		}

		function onMouseoutExpandableTitle() {
			SettingPaneAttributeTooltip.hide();
		}
	},
	initHoverVisualizePaneEntryBehaviour: function() {
		$('#setting-pane > .settings.visualize > .time-series')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverVisualizePaneEntry)
			.on('mouseout', onMouseoutVisualizePaneEntry);
		$('#setting-pane > .settings.visualize > .point.event')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverVisualizePaneEntry)
			.on('mouseout', onMouseoutVisualizePaneEntry);
		$('#setting-pane > .settings.visualize > .interval.event')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverVisualizePaneEntry)
			.on('mouseout', onMouseoutVisualizePaneEntry);
		$('#setting-pane > .settings.visualize > .event-attribute')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverVisualizePaneEntry)
			.on('mouseout', onMouseoutVisualizePaneEntry);
		$('#setting-pane > .settings.visualize > .event-attribute-attribute')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverVisualizePaneEntry)
			.on('mouseout', onMouseoutVisualizePaneEntry);

		function onMouseoverVisualizePaneEntry(event) {
			var hoveredExpandButton = $(event.target).hasClass('expand-button');

			if (!hoveredExpandButton) {
				var data = d3.select(this).datum();
				var name = null;
				
				if ('timeSeriesName' in data) name = data.timeSeriesName;
				else if ('eventName' in data) name = data.eventName;
				else if ('eventAttributeName' in data) name = data.eventAttributeName;
				else if ('attributeName' in data) name = data.attributeName;

				$(this).addClass('hover');
				SettingPaneAttributeTooltip.show(name, this);
			}
			else if (hoveredExpandButton) {
				var isExpandButton = $(this).find('.expand-button')
					.hasClass('fa-caret-square-down');
				var offset = $(this).offset();
				var width = $(this).width();

				$(this).removeClass('hover');
				SettingPaneAttributeTooltip.simplyShow(
					left = offset.left + width + 8 + 5,
					top = offset.top + 8,
					text = isExpandButton ? 'Click to show attributes' 
										  : 'Click to hide attributes'
				);
			}
		}

		function onMouseoutVisualizePaneEntry() {
			$(this).removeClass('hover');
			SettingPaneAttributeTooltip.hide();
		}
	},

	// initSearchBoxBehaviour

	markVariables: function(searchQueryInLowerCase) {
		var markInstance = new Mark(document.querySelectorAll('#setting-pane > .settings.visualize'));

		markInstance.unmark({
	  		done: function(){
	    		markInstance.mark(searchQueryInLowerCase, {
    				'separateWordSearch': false,
    				'diacritics': false
	    		});
	    	}
	  	});
	},
	filterTimeSeries: function(searchQueryInLowerCase) {
		$('#setting-pane > .settings.visualize > .time-series').each(function() {
			var timeSeriesData = d3.select(this).datum();
			var timeSeriesName = timeSeriesData.timeSeriesName;
			var timeSeriesNameInLowerCase = timeSeriesName.toLowerCase();
			var foundSearchQuery = timeSeriesNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;
			if (foundSearchQuery) $(this).css('display', '')
			else if (!foundSearchQuery) $(this).css('display', 'none');
		});
	},
	filterEventAttributeAttributes: function(searchQueryInLowerCase) {
		$('#setting-pane > .settings.visualize > .event-attribute-attribute').each(function() {
			var eventAttributeAttributeData = d3.select(this).datum();
			var eventAttributeAttributeName = eventAttributeAttributeData.attributeName;
			var eventAttributeAttributeNameInLowerCase = eventAttributeAttributeName.toLowerCase();
			var foundSearchQuery = eventAttributeAttributeNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;					
			if (foundSearchQuery) $(this).css('display', '')
			else if (!foundSearchQuery) $(this).css('display', 'none');
		});
	},
	filterEventAttributes: function(searchQueryInLowerCase) {
		$('#setting-pane > .settings.visualize > .event-attribute').each(function() {
			var eventAttributeData = d3.select(this).datum();
			var eventAttributeName = eventAttributeData.eventAttributeName;
			var eventAttributeNameInLowerCase = eventAttributeName.toLowerCase();
			var foundSearchQuery = eventAttributeNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;
			var childrenFoundSearchQuery = false;
			var currentEl = $(this).next()[0];
			var isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');

			$(this).find('.expand-button')
				.removeClass('fa-caret-square-up') // resetting when input
				.addClass('fa-caret-square-down'); // users may expand on filtered list

			while (isCurrentEventAttributeAttribute) {
				if ($(currentEl).is(':visible')) {
					childrenFoundSearchQuery = true; break;
				}
				currentEl = $(currentEl).next()[0];
				isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
			}

			if (foundSearchQuery || childrenFoundSearchQuery) $(this).css('display', '')
			else if (!foundSearchQuery && !childrenFoundSearchQuery) $(this).css('display', 'none');
		});
	},
	filterEvents: function(searchQueryInLowerCase) {
		$('#setting-pane > .settings.visualize > .event').each(function() {
			var eventData = d3.select(this).datum();
			var eventName = eventData.eventName;
			var eventNameInLowerCase = eventName.toLowerCase();
			var foundSearchQuery = eventNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;
			var childrenFoundSearchQuery = false;
			var currentEl = $(this).next()[0];
			var isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
			var isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');

			$(this).find('.expand-button')
				.removeClass('fa-caret-square-up') // resetting when input
				.addClass('fa-caret-square-down'); // users may expand on filtered list

			while (isCurrentEventAttribute || isCurrentEventAttributeAttribute) {
				if ($(currentEl).is(':visible')) {
					childrenFoundSearchQuery = true; break;
				}
				currentEl = $(currentEl).next()[0];
				isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
				isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
			}

			if (foundSearchQuery || childrenFoundSearchQuery) $(this).css('display', '')
			else if (!foundSearchQuery && !childrenFoundSearchQuery) $(this).css('display', 'none');
		});
	},
	filterTitles: function() {
		$('#setting-pane > .settings.visualize > .title').each(function() {
			var currentEl = $(this).next()[0];
			var isCurrentTimeSeries = $(currentEl).hasClass('time-series');
			var isCurrentEvent = $(currentEl).hasClass('event');
			var isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
			var isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
			var hasContent = false;

			while (isCurrentTimeSeries || 
				   isCurrentEvent || 
				   isCurrentEventAttribute || 
				   isCurrentEventAttributeAttribute) {
				if ($(currentEl).is(':visible')) {
					hasContent = true; break;
				}

				currentEl = $(currentEl).next()[0];
				isCurrentTimeSeries = $(currentEl).hasClass('time-series');
				isCurrentEvent = $(currentEl).hasClass('event');
				isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
				isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
			}

			if (hasContent) $(this).css('display', '');
			else if (!hasContent) $(this).css('display', 'none');
		});
	},

	// helpers

	generateTimeSeriesHTML: function(timeSeriesName) {
		return '<div class="time-series">' +
					'<span class="fa fa-chart-line type"></span>' +
					'<span class="name">' + timeSeriesName + '</span>' +
				'</div>';
	},
	generatePointEventHTML: function(eventName, hasAttributes) {
		return '<div class="point event">' +
					'<span class="fa fa-ellipsis-h type"></span>' +
					'<span class="name">' + eventName + '</span>' +
					(hasAttributes ? '<span class="far fa-caret-square-down expand-button"></span>' : '') +
				'</div>';
	},
	generateIntervalEventHTML: function(eventName, hasAttributes) {
		return '<div class="interval event">' +
					'<span class="fa fa-arrows-alt-h type"></span>' +
					'<span class="name">' + eventName + '</span>' +
					(hasAttributes ? '<span class="far fa-caret-square-down expand-button"></span>' : '') +
				'</div>';
	},
	generateEventAttributeHTML: function(attributeName, typeClass, hasAttributes) {
		return '<div class="event-attribute">' +
					'<span class="fa ' + typeClass + ' type"></span>' +
					'<span class="name">' + attributeName + '</span>' +
					(hasAttributes ? '<span class="far fa-caret-square-down expand-button"></span>' : '') +
				'</div>';
	},
	generateEventAttrAttrHTML: function(attributeName, typeClass) {
		return '<div class="event-attribute-attribute">' +
					'<span class="fa ' + typeClass + ' type"></span>' +
					'<span class="name">' + attributeName + '</span>' +
				'</div>';
	},
	deselectChildrenAttributes: function(el) {
		var currentEl = $(el).next()[0];
		var isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
		var isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');

		while (isCurrentEventAttribute || isCurrentEventAttributeAttribute) {
			var data = d3.select(currentEl).datum();

			$(currentEl).removeClass('selected');
			State.removeVisualizeState(data);

			currentEl = $(currentEl).next()[0];
			isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
			isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
		}
	},
	deselectAllEventAttributes: function() {
		$('#setting-pane > .settings.visualize > .event-attribute, ' +
		  '#setting-pane > .settings.visualize > .event-attribute-attribute').each(function() {
		  	var currentEl = $(this)[0];
		  	var data = d3.select(currentEl).datum();

		  	$(currentEl).removeClass('selected');
		  	State.removeVisualizeState(data);
		});
	},
	selectParentEvent: function(el) {
		var currentEl = $(el).prev()[0];
		var isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
		var isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');

		while (isCurrentEventAttribute || isCurrentEventAttributeAttribute) {
			currentEl = $(currentEl).prev()[0];
			isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
			isCurrentEventAttributeAttribute = $(currentEl).hasClass('event-attribute-attribute');
		}

		if ($(currentEl).hasClass('event')) {
			var eventData = d3.select(currentEl).datum();
			$(currentEl).addClass('selected');
			State.addVisualizeState(eventData.eventType + 'Event', eventData);
		}
	}
}