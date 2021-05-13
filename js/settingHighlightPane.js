const SettingHighlightPane = {
	highlightList: {},

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
		$('#setting-pane > .settings').addClass('highlight');

		self.highlightList = {};
		self.showSearchBox(selectedEvents);
		self.addEventHighlightsToList(selectedEvents);
		self.drawHighlights(selectedEvents);
		self.initClickListHighlightHeaderBehaviour();
		self.initClickRangeHighlightHeaderBehaviour();
		self.initHoverTitleBehaviour();
		self.initHoverHighlightHeaderBehaviour();
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
	addEventHighlightsToList: function(selectedEvents) {
		const self = this;
		var highlightList = self.highlightList;

		for (var i = 0; i < selectedEvents.length; i++) {
			var eventData = selectedEvents[i].data;
			var eventName = eventData.eventName;
			var eventAttributeList = eventData.eventAttributeList;

			highlightList[eventName] = [];

			for (var j = 0; j < eventAttributeList.length; j++) {
				var eventAttributeData = eventAttributeList[j];
				var eventAttributeName = eventAttributeData.eventAttributeName;
				var eventAttributeType = eventAttributeData.eventAttributeType;
				var eventAttributeAttributeList = eventAttributeData.eventAttributeAttributeList;
				var highlightObject = null;
				var previousHighlightObjectList = State.getPreviousHighlightObjectList({
					databaseQueryType: 'event',
					databaseQueryName: eventName,
					eventAttributeName: eventAttributeName,
					eventAttributeType: eventAttributeType,
					displayName: eventAttributeName // to differentiate from event attribute attribute
				});

				// handle event attribute
				if (previousHighlightObjectList.length == 0) { // not previously stored
					highlightObject = {};
					highlightObject.databaseQueryType = 'event';
					highlightObject.databaseQueryName = eventName;
					highlightObject.eventAttributeName = eventAttributeName;
					highlightObject.eventAttributeType = eventAttributeType;
					highlightObject.displayName = eventAttributeName;
					highlightObject.isChanged = false; // filtered?
					self.addDataToHighlightObject(highlightObject, eventAttributeType, eventAttributeData);
					highlightList[eventName].push(highlightObject);
				}
				else if (previousHighlightObjectList.length > 0) {
					highlightObject = previousHighlightObjectList[0]; // only one match
					highlightList[eventName].push(highlightObject);
				}

				// handle event attribute attribute
				for (var k = 0; k < eventAttributeAttributeList.length; k++) {
					var eventAttributeAttributeData = eventAttributeAttributeList[k];
					var eventAttributeAttributeName = eventAttributeAttributeData.attributeName;
					var eventAttributeAttributeType = eventAttributeAttributeData.attributeType;
					var eventAttributEntityKey = eventAttributeData.entityKey;
					var shortEventAttributeName = eventAttributeName.length > 10 ? eventAttributeName.substring(0, 10) + '...' : eventAttributeName;
					var highlightObject = null;
					var previousHighlightObjectList = State.getPreviousHighlightObjectList({
						databaseQueryType: 'event',
						databaseQueryName: eventName,
						eventAttributeName: eventAttributeName,
						eventAttributeType: eventAttributeType,
						eventAttributeAttributeName: eventAttributeAttributeName,
						eventAttributeAttributeType: eventAttributeAttributeType
					});

					if (previousHighlightObjectList.length == 0) { // not previously stored
						highlightObject = {};
						highlightObject.databaseQueryType = 'event';
						highlightObject.databaseQueryName = eventName;
						highlightObject.eventAttributeName = eventAttributeName;
						highlightObject.eventAttributeType = eventAttributeType;
						highlightObject.eventAttributeAttributeName = eventAttributeAttributeName;
						highlightObject.eventAttributeAttributeType = eventAttributeAttributeType;
						highlightObject.entityKey = eventAttributEntityKey;
						highlightObject.displayName = shortEventAttributeName + ' : ' + eventAttributeAttributeName;
						highlightObject.isChanged = false; // filtered?
						self.addDataToHighlightObject(highlightObject, eventAttributeAttributeType, eventAttributeAttributeData);
						highlightList[eventName].push(highlightObject);
					}
					else if (previousHighlightObjectList.length > 0) {
						highlightObject = previousHighlightObjectList[0]; // only one match
						highlightList[eventName].push(highlightObject);
					}
				}
			}
		}
	},
	drawHighlights: function(selectedEvents) {
		const self = this;
		var highlightList = self.highlightList;
		var hasSelectedEvents = selectedEvents.length > 0;

		if (!hasSelectedEvents) // highlightList is empty
			$('#setting-pane > .settings')
				.append('<div class="no-event-text">No Events Selected</div>');

		for (var highlightItem in highlightList) {
			var title = 'Highlight ' + highlightItem;

			$('#setting-pane > .settings')
				.append('<div class="title">' + title + '</div>');

			for (var i = 0; i < highlightList[highlightItem].length; i++) {
				var highlightObject = highlightList[highlightItem][i];
				var attributeName = highlightObject.displayName;
				var isChanged = highlightObject.isChanged;
				var attributeType = null;
				var highlightCapsuleHTML = null;
				var addedHighlightCapsuleEl = null;

				if ('eventAttributeAttributeType' in highlightObject) attributeType = highlightObject.eventAttributeAttributeType;
				else if ('eventAttributeType' in highlightObject) attributeType = highlightObject.eventAttributeType;
				else if ('attributeType' in highlightObject) attributeType = highlightObject.attributeType;

				highlightCapsuleHTML = self.generateHighlightCapsuleHTML(attributeName, attributeType, isChanged);
				$('#setting-pane > .settings').append(highlightCapsuleHTML);
				addedHighlightCapsuleEl = $('#setting-pane > .settings > .highlight-capsule').last()[0];
				d3.select(addedHighlightCapsuleEl).datum(highlightObject);
			}
		}
	},
	initClickListHighlightHeaderBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.highlight > .highlight-capsule.list > .header')
			.on('click', onClickHighlightPaneListHighlightHeader);

		function onClickHighlightPaneListHighlightHeader() {
			var highlightCapsuleEl = this.parentNode;
			var needToExpand = !$(highlightCapsuleEl).hasClass('expanded');
			var highlightContentEl = $(highlightCapsuleEl).find('.content')[0];
			var highlightObject = d3.select(highlightCapsuleEl).datum();
			var clickedSelectAllButton = $(event.target).hasClass('select-all-button');
			var clickedSelectNoneButton = $(event.target).hasClass('select-none-button');

			// expand
			if (needToExpand && !clickedSelectAllButton && !clickedSelectNoneButton) {
				$(highlightCapsuleEl).addClass('expanded');
				$(highlightContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-down');
				$(this).find('.expand-button').addClass('fa-caret-square-up');
				for (var i = 0; i < highlightObject.categories.length; i++) {
					var categoryName = highlightObject.categories[i];
					var categoryIsChecked = highlightObject.selectedCategories.indexOf(categoryName) != -1;
					var categoryHTML = self.generateCategoryHTML(categoryName, categoryIsChecked);
					var addedCategoryEl = null;
					$(highlightContentEl).append(categoryHTML);
					addedCategoryEl = $(highlightContentEl).find('.category').last()[0];
					d3.select(addedCategoryEl).datum(categoryName);
				}
				self.initClickListHighlightCategoryBehaviour(highlightContentEl);
				self.initHoverListHighlightCategoryBehaviour(highlightContentEl);
			}

			// collapse
			else if (!needToExpand && !clickedSelectAllButton && !clickedSelectNoneButton) {
				$(highlightCapsuleEl).removeClass('expanded');
				$(highlightContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-up');
				$(this).find('.expand-button').addClass('fa-caret-square-down');
			}

			// select all
			else if (clickedSelectAllButton) {
				ListHighlight.clickSelectAll(highlightCapsuleEl); // update states
				RightColumn.update();
			}

			// select none
			else if (clickedSelectNoneButton) {
				ListHighlight.clickSelectNone(highlightCapsuleEl); // update states
				RightColumn.update();
			}
		}
	},
	initClickRangeHighlightHeaderBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.highlight > .highlight-capsule.range > .header')
			.on('click', onClickHighlightPaneRangeHighlight);

		function onClickHighlightPaneRangeHighlight() {
			var highlightCapsuleEl = this.parentNode;
			var needToExpand = !$(highlightCapsuleEl).hasClass('expanded');
			var highlightContentEl = $(highlightCapsuleEl).find('.content')[0];
			var highlightObject = d3.select(highlightCapsuleEl).datum();
			var clickedSelectAllButton = $(event.target).hasClass('select-all-button');
			var clickedSelectNoneButton = $(event.target).hasClass('select-none-button');

			// expand
			if (needToExpand && !clickedSelectAllButton && !clickedSelectNoneButton) {
				var sliderHTML = self.generateSliderHTML();
				var sliderObject = new HighlightSlider(highlightContentEl);

				var sliderMin = highlightObject.range[0];
				var sliderMax = highlightObject.range[1];
				var sliderHandleMin = highlightObject.selectedRange[0];
				var sliderHandleMax = highlightObject.selectedRange[1];
				let realMaxNumberOfDecimal = Math.max(self.countDecimals(sliderMin), self.countDecimals(sliderMax));
				let maxNumberOfDecimal = (realMaxNumberOfDecimal > 2) ? 2 : realMaxNumberOfDecimal;
				let step = 1 / Math.pow(10, maxNumberOfDecimal);

				$(highlightCapsuleEl).addClass('expanded');
				$(highlightContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-down');
				$(this).find('.expand-button').addClass('fa-caret-square-up');
				$(highlightContentEl).append(sliderHTML);

				sliderObject.init();
				sliderObject.initHandleValues();
				sliderObject.initDragBehaviour();
				sliderObject.updateMinMax(sliderMin, sliderMax);
				sliderObject.updateValues([ sliderHandleMin, sliderHandleMax ]);
				sliderObject.updateStep(step);
				sliderObject.updateHandles();
				sliderObject.updateMinMaxText();
			}

			// collapse
			else if (!needToExpand && !clickedSelectAllButton && !clickedSelectNoneButton) {
				$(highlightCapsuleEl).removeClass('expanded');
				$(highlightContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-up');
				$(this).find('.expand-button').addClass('fa-caret-square-down');
			}
		}
	},
	initHoverTitleBehaviour: function() {
		$('#setting-pane > .settings.highlight > .title')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverTitle)
			.on('mouseout', onMouseoutTitle);

		function onMouseoverTitle() {
			var name = $(this).text();
			SettingPaneAttributeTooltip.show(name, this);
		}

		function onMouseoutTitle() {
			SettingPaneAttributeTooltip.hide();
		}
	},
	initHoverHighlightHeaderBehaviour: function() {
		$('#setting-pane > .settings.highlight > .highlight-capsule > .header')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverHighlightHeader)
			.on('mouseout', onMouseoutHighlightHeader);

		function onMouseoverHighlightHeader(event) {
			var data = d3.select(this.parentNode).datum();
			var name = null;
			var hoveredSelectNoneButton = $(event.target).hasClass('select-none-button');
			var hoveredSelectAllButton = $(event.target).hasClass('select-all-button');

			if (data.databaseQueryType == 'entity') name = data.attributeName;
			else if ('eventAttributeAttributeName' in data) name = data.eventAttributeName + ' : ' + data.eventAttributeAttributeName;
			else name = data.eventAttributeName;

			if (!hoveredSelectNoneButton && !hoveredSelectAllButton) {
				$(this).addClass('hover');
				SettingPaneAttributeTooltip.show(name, this);
			}
			else if (hoveredSelectNoneButton) {
				var offset = $(this).offset();
				var width = $(this).width();

				$(this).removeClass('hover');
				SettingPaneAttributeTooltip.simplyShow(
					left = offset.left + width + 8 + 5,
					top = offset.top + 8,
					text = 'Click to gray out all categories below'
				);
			}
			else if (hoveredSelectAllButton) {
				var offset = $(this).offset();
				var width = $(this).width();

				$(this).removeClass('hover');
				SettingPaneAttributeTooltip.simplyShow(
					left = offset.left + width + 8 + 5,
					top = offset.top + 8,
					text = 'Click to highlight all categories below'
				);
			}
		}

		function onMouseoutHighlightHeader() {
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
				var visualizeState = State.visualize;
				var selectedEvents = visualizeState.filter(function(d) {
					return (d.type == 'pointEvent' || d.type == 'intervalEvent');
				});
		
				SettingPane.empty();
				self.highlightList = {};
				self.addEventHighlightsToList(selectedEvents);
				self.drawHighlights(selectedEvents);
				self.initClickListHighlightHeaderBehaviour();
				self.initClickRangeHighlightHeaderBehaviour();
				self.initHoverTitleBehaviour();
				self.initHoverHighlightHeaderBehaviour();
			}

			else if (searchQueryInLowerCase != '') {
				self.expandListHighlights(searchQueryInLowerCase);
				self.markVariables(searchQueryInLowerCase);
				self.filterHighlights(searchQueryInLowerCase);
				self.filterTitles();
			}
		}
	},

	// initSearchBoxBehaviour

	expandListHighlights: function(searchQueryInLowerCase) {
		const self = this;

		$('#setting-pane > .settings.highlight > .highlight-capsule.list').each(function() {
			var highlightCapsuleEl = this;
			var highlightContentEl = $(highlightCapsuleEl).find('.content')[0];
			var highlightObject = d3.select(highlightCapsuleEl).datum();
			var allCategoryList = highlightObject.categories;
			var selectedCategoryList = highlightObject.selectedCategories;
			var matchedCategoryList = [];

			// get matchedCategoryList
			for (var i = 0; i < allCategoryList.length; i++) {
				var categoryName = allCategoryList[i];
				var categoryNameInLowerCase = categoryName.toLowerCase();
				var categoryNameMatchedQuery = categoryNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;
				if (categoryNameMatchedQuery) matchedCategoryList.push(categoryName);
			}

			// expand if matchedCategoryList is not empty
			if (matchedCategoryList.length > 0) {
				$(highlightCapsuleEl).addClass('expanded');
				$(highlightContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-down');
				$(this).find('.expand-button').addClass('fa-caret-square-up');
			}

			// collapse if matchedCategoryList is empty
			else if (matchedCategoryList.length == 0) {
				$(highlightCapsuleEl).removeClass('expanded');
				$(highlightContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-up');
				$(this).find('.expand-button').addClass('fa-caret-square-down');
			}

			// draw matchedCategoryList
			for (var i = 0; i < matchedCategoryList.length; i++) {
				var categoryName = matchedCategoryList[i];
				var categoryIsChecked = selectedCategoryList.indexOf(categoryName) != -1;
				var categoryHTML = self.generateCategoryHTML(categoryName, categoryIsChecked);
				var addedCategoryEl = null;
				$(highlightContentEl).append(categoryHTML);
				addedCategoryEl = $(highlightContentEl).find('.category').last()[0];
				d3.select(addedCategoryEl).datum(categoryName);
			}
			self.initClickListHighlightCategoryBehaviour(highlightContentEl);
			self.initHoverListHighlightCategoryBehaviour(highlightContentEl);
		});
	},
	markVariables: function(searchQueryInLowerCase) {
		var markInstance = new Mark(document.querySelectorAll('#setting-pane > .settings.highlight'));

		markInstance.unmark({
	  		done: function(){
	    		markInstance.mark(searchQueryInLowerCase, {
    				'separateWordSearch': false,
    				'diacritics': false
	    		});
	    	}
	  	});
	},
	filterHighlights: function(searchQueryInLowerCase) {
		$('#setting-pane > .settings.highlight > .highlight-capsule').each(function() {
			var highlightCapsuleEl = this;
			var highlightObject = d3.select(highlightCapsuleEl).datum();
			var attributeName = highlightObject.displayName;
			var attributeNameInLowerCase = attributeName.toLowerCase();
			var attributeNameMatchedQuery = attributeNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;
			var categoriesMatchedQuery = $(highlightCapsuleEl).hasClass('expanded');

			if (attributeNameMatchedQuery || categoriesMatchedQuery)
				$(highlightCapsuleEl).css('display', '');
			else if (!attributeNameMatchedQuery && !categoriesMatchedQuery)
				$(highlightCapsuleEl).css('display', 'none');
		});
	},
	filterTitles: function() {
		$('#setting-pane > .settings.highlight > .title').each(function() {
			var currentTitleEl = this;
			var currentEl = $(this).next()[0];
			var currentTitleHasContent = false;
			var isCurrentHighlightCapsule = $(currentEl).hasClass('highlight-capsule');

			while (isCurrentHighlightCapsule) {
				if ($(currentEl).is(':visible')) {
					currentTitleHasContent = true; break;
				}
				currentEl = $(currentEl).next()[0];
				isCurrentHighlightCapsule = $(currentEl).hasClass('highlight-capsule');
			}

			if (currentTitleHasContent) $(currentTitleEl).css('display', '');
			else if (!currentTitleHasContent) $(currentTitleEl).css('display', 'none');
		});
	},

	// helpers

	addDataToHighlightObject: function(highlightObject, attributeType, data) {
		const self = this;

		if (attributeType == 'categorical') {
			highlightObject.categories = self.shallowCopyList(data.categories);
			highlightObject.selectedCategories = self.shallowCopyList(data.categories);
		}
		else if (attributeType == 'nominal') {
			highlightObject.range = d3.extent(data.levels);
			highlightObject.selectedRange = d3.extent(data.levels);
		}
		else if (attributeType == 'numerical') {
			highlightObject.range = self.shallowCopyList(data.range);
			highlightObject.selectedRange = self.shallowCopyList(data.range);
		}
	},
	shallowCopyList: function(list) {
		var newList = [];

		for (var i = 0; i < list.length; i++)
			newList.push(list[i]);

		return newList;
	},
	generateHighlightCapsuleHTML: function(attributeName, attributeType, isChanged) {
		var typeClass = attributeType == 'categorical' ? 'fa-font' 
					  : (attributeType == 'temporal' ? 'fa-chart-line' : 'fa-hashtag');
		var highlightClass = attributeType == 'categorical' ? 'list' : 'range';
		var isChangedClass = isChanged ? ' changed' : '';

		return '<div class="highlight-capsule ' + highlightClass + isChangedClass +  '">' +
					'<div class="header">' +
						'<span class="fa fa-highlighter highlight-icon"></span>' +
						'<span class="fa ' + typeClass + ' type"></span>' +
						'<span class="name">' + attributeName + '</span>' +
						'<span class="far fa-square select-none-button"></span>' +
						'<span class="far fa-check-square select-all-button"></span>' +
						'<span class="far fa-caret-square-down expand-button"></span>' +
					'</div>' +
					'<div class="content"></div>' +
				'</div>';
	},
	generateCategoryHTML: function(categoryName, categoryIsChecked) {
		return '<div class="category">' +
					'<span class="round-check-box">' +
				    	'<input type="checkbox"' + (categoryIsChecked ? ' checked' : '') + '/>' +
				    	'<label></label>' +
				  	'</span>' +
					'<span class="name">' + categoryName + '</span>' +
				'</div>';
	},
	generateSliderHTML: function() {
		return '<span class="min-text">min</span>' +
			   '<input type="text"/>' +
			   '<span class="max-text">max</span>';
	},
	countDecimals: function(value) {
	    if (Math.floor(value) !== value)
	        return value.toString().split(".")[1].length || 0;
	    return 0;
	},
	initClickListHighlightCategoryBehaviour: function(highlightContentEl) {
		$(highlightContentEl).find('.category')
			.on('click', onClickListHighlightCategory);

		function onClickListHighlightCategory() {
			var highlightCapsuleEl = highlightContentEl.parentNode;
			ListHighlight.clickCategory(highlightCapsuleEl, this); // update states
			RightColumn.update();
		}
	},
	initHoverListHighlightCategoryBehaviour: function(highlightContentEl) {
		$(highlightContentEl).find('.category')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverListHighlightCategory)
			.on('mouseout', onMouseoutListHighlightCategory);

		function onMouseoverListHighlightCategory() {
			var name = d3.select(this).datum();
			SettingPaneAttributeTooltip.show(name, this);
		}

		function onMouseoutListHighlightCategory() {
			SettingPaneAttributeTooltip.hide();
		}
	}
}