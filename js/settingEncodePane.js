const SettingEncodePane = {
	show: function() {
		const self = this;
		var visualizeState = State.visualize;
		var selectedEvents = visualizeState.filter(function(d) {
			return (d.type == 'pointEvent' || d.type == 'intervalEvent');
		});

		$('#setting-pane > .settings').removeClass('visualize');
		$('#setting-pane > .settings').removeClass('group');
		$('#setting-pane > .settings').removeClass('filter');
		$('#setting-pane > .settings').removeClass('encode');
		$('#setting-pane > .settings').removeClass('highlight');
		$('#setting-pane > .settings').removeClass('other');
		$('#setting-pane > .settings').addClass('encode');

		self.showSearchBox(selectedEvents);
		self.drawEventAttributes(selectedEvents);
		self.initClickEventAttributeBahaviour();
		self.initHoverEncodePaneEntryBehaviour();
		self.initSearchBoxBehaviour();
		$('#setting-pane > .settings').scrollTop(0);
	},
	showSearchBox: function(selectedEvents) {
		var hasSelectedEvents = selectedEvents.length > 0;

		if (hasSelectedEvents)
			$('#setting-pane > .search-box')
				.css('display', '');

		else if (!hasSelectedEvents)
			$('#setting-pane > .search-box')
				.css('display', 'none');
	},
	drawEventAttributes: function(selectedEvents) {
		const self = this;
		var hasSelectedEvents = selectedEvents.length > 0;

		if (!hasSelectedEvents)
			$('#setting-pane > .settings')
				.append('<div class="no-event-text">No Events Selected</div>');

		for (var i = 0; i < selectedEvents.length; i++) {
			var eventData = selectedEvents[i].data;
			var eventName = eventData.eventName;
			var eventAttributeList = eventData.eventAttributeList.filter(function(d) {
				return d.eventAttributeType == 'numerical' || d.eventAttributeType == 'nominal';
			});

			if (eventAttributeList.length > 0)
				$('#setting-pane > .settings')
					.append('<div class="title">' + eventName + '</div>');

			for (var j = 0; j < eventAttributeList.length; j++) {
				var eventAttributeData = eventAttributeList[j];
				var eventName = eventAttributeData.parentEventData.eventName;
				var eventAttributeName = eventAttributeData.eventAttributeName;
				var eventAttributeHTML = self.generateEventAttributeHTML(eventAttributeName);
				var addedEventAttributeEl = null;
				var previouslySelected = State.getPreviousEncodeObjectList({
					eventName: eventName,
					eventAttributeName: eventAttributeName
				}).length > 0;

				if (previouslySelected) {
					$('#setting-pane > .settings').append(eventAttributeHTML);
					addedEventAttributeEl = $('#setting-pane > .settings > .event-attribute').last()[0];
					d3.select(addedEventAttributeEl).datum(eventAttributeData);
					$(addedEventAttributeEl).addClass('selected');
				}
				else if (!previouslySelected) {
					$('#setting-pane > .settings').append(eventAttributeHTML);
					addedEventAttributeEl = $('#setting-pane > .settings > .event-attribute').last()[0];
					d3.select(addedEventAttributeEl).datum(eventAttributeData);
				}
			}
		}
	},
	initClickEventAttributeBahaviour: function() {
		const self = this;
		var eventHeight = VisualizationPane.eventHeight;
		var eventMaxHeight = VisualizationPane.eventMaxHeight;

		$('#setting-pane > .settings.encode > .event-attribute')
			.on('click', onClickEncodePaneEventAttributeBehaviour);

		function onClickEncodePaneEventAttributeBehaviour() {
			var isSelected = $(this).hasClass('selected');

			var eventAttributeData = d3.select(this).datum();
			var eventName = eventAttributeData.parentEventData.eventName;
			var eventAttributeName = eventAttributeData.eventAttributeName;
			var eventAttributeType = eventAttributeData.eventAttributeType;
			var encodeObject = {};
			var maxValue = eventAttributeType == 'numerical'
						 ? eventAttributeData.range[1]
						 : d3.max(eventAttributeData.levels);

			// create encode object
			encodeObject.eventName = eventName;
			encodeObject.eventAttributeName = eventAttributeName;
			encodeObject.heightScale = d3.scaleLinear()
				.domain([ 0, maxValue ])
				.range([ eventHeight, eventMaxHeight ]);

			// remove eventAttribute
			if (isSelected) {
				$(this).removeClass('selected');
				State.removeEncodeState(encodeObject);
				RightColumn.update();
			}

			// add eventAttribute
			else if (!isSelected) {
				self.removeEventAttrSelections(eventName);
				State.removeEventEncodings(eventName);
				$(this).addClass('selected');
				State.addEncodeState(encodeObject);
				RightColumn.update();
			}
		}
	},
	initHoverEncodePaneEntryBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.encode > .title')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverEncodePaneEntry)
			.on('mouseout', onMouseoutEncodePaneEntry);
		$('#setting-pane > .settings.encode > .event-attribute')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverEncodePaneEntry)
			.on('mouseout', onMouseoutEncodePaneEntry);

		function onMouseoverEncodePaneEntry() {
			var name = $(this).text();
			$(this).addClass('hover');
			SettingPaneAttributeTooltip.show(name, this);
		}

		function onMouseoutEncodePaneEntry() {
			$(this).removeClass('hover');
			SettingPaneAttributeTooltip.hide();
		}
	},
	initSearchBoxBehaviour: function() {
		const self = this;

		$('#setting-pane > .search-box > input')
			.unbind('input')
			.on('input', onInputSearchQuery);

		function onInputSearchQuery() {
			var searchQueryInLowerCase = $(this).val().toLowerCase();

			if (searchQueryInLowerCase == '') {
				self.markVariables(searchQueryInLowerCase)
				$('#setting-pane > .settings > .title').css('display', '');
				$('#setting-pane > .settings > .event-attribute').css('display', '');
			}
			else if (searchQueryInLowerCase != '') {
				self.markVariables(searchQueryInLowerCase)
				self.filterEventAttributes(searchQueryInLowerCase);
				self.filterTitles();
			}
		}
	},

	// initSearchBoxBehaviour

	markVariables: function(searchQueryInLowerCase) {
		var markInstance = new Mark(document.querySelectorAll('#setting-pane > .settings.encode'));

		markInstance.unmark({
	  		done: function(){
	    		markInstance.mark(searchQueryInLowerCase, {
    				'separateWordSearch': false,
    				'diacritics': false
	    		});
	    	}
	  	});
	},
	filterEventAttributes: function(searchQueryInLowerCase) {
		$('#setting-pane > .settings.encode > .event-attribute').each(function() {
			var eventAttributeData = d3.select(this).datum();
			var eventAttributeName = eventAttributeData.eventAttributeName;
			var eventAttributeNameInLowerCase = eventAttributeName.toLowerCase();
			var foundSearchQuery = eventAttributeNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;

			if (foundSearchQuery) $(this).css('display', '')
			else if (!foundSearchQuery) $(this).css('display', 'none');
		});
	},
	filterTitles: function() {
		$('#setting-pane > .settings.encode > .title').each(function() {
			var currentTitleEl = this;
			var currentEl = $(this).next()[0];
			var currentTitleHasContent = false;
			var isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');

			while (isCurrentEventAttribute) {
				if ($(currentEl).is(':visible')) {
					currentTitleHasContent = true; break;
				}
				currentEl = $(currentEl).next()[0];
				isCurrentEventAttribute = $(currentEl).hasClass('event-attribute');
			}

			if (currentTitleHasContent) $(currentTitleEl).css('display', '');
			else if (!currentTitleHasContent) $(currentTitleEl).css('display', 'none');
		});
	},

	// helpers

	generateEventAttributeHTML: function(attributeName) {
		return '<div class="event-attribute">' +
					'<span class="fa fa-hashtag type"></span>' +
					'<span class="name">' + attributeName + '</span>' +
			   '</div>';
	},
	removeEventAttrSelections: function(eventName) {
		$('#setting-pane > .settings.encode > .event-attribute').each(function() {
			var eventAttributeData = d3.select(this).datum();
			var currentEventName = eventAttributeData.parentEventData.eventName;
			if (currentEventName == eventName) $(this).removeClass('selected');
		});
	}
}