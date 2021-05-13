const SettingFilterPane = {
	filterList: {},

	show: function() {
		const self = this;
		$('#setting-pane > .settings').removeClass('visualize');
		$('#setting-pane > .settings').removeClass('group');
		$('#setting-pane > .settings').removeClass('filter');
		$('#setting-pane > .settings').removeClass('encode');
		$('#setting-pane > .settings').removeClass('highlight');
		$('#setting-pane > .settings').removeClass('other');
		$('#setting-pane > .settings').addClass('filter');
		self.filterList = {};
		self.showSearchBox();
		self.addCountryFiltersToList();
		self.addEventFiltersToList();
		self.drawFilters();
		self.initClickListFilterHeaderBehaviour();
		self.initClickRangeFilterHeaderBehaviour();
		self.initHoverTitleBehaviour();
		self.initHoverFilterHeaderBehaviour();
		self.initSearchBoxBehaviour();
		$('#setting-pane > .settings').scrollTop(0);
	},
	showSearchBox: function() {
		$('#setting-pane > .search-box')
			.css('display', '');
	},
	addCountryFiltersToList: function() {
		const self = this;
		var countryAttributeList = Database.entityList.country;
		var filterList = self.filterList;

		filterList.country = [];

		for (var i = 0; i < countryAttributeList.length; i++) {
			var attributeData = countryAttributeList[i];
			var attributeName = attributeData.attributeName;
			var attributeType = attributeData.attributeType;
			var filterObject = null;
			var previousFilterObjectList = State.getPreviousFilterObjectList({
				databaseQueryType: 'entity',
				databaseQueryName: 'country',
				attributeName: attributeName,
				attributeType: attributeType
			});

			if (previousFilterObjectList.length == 0) { // not previously stored
				filterObject = {};
				filterObject.databaseQueryType = 'entity';
				filterObject.databaseQueryName = 'country';
				filterObject.attributeName = attributeName;
				filterObject.attributeType = attributeType;
				filterObject.displayName = attributeName;
				filterObject.isFiltered = false;
				self.addDataToFilterObject(filterObject, attributeType, attributeData);
				filterList.country.push(filterObject);
			}
			else if (previousFilterObjectList.length > 0) {
				filterObject = previousFilterObjectList[0]; // only one match
				filterList.country.push(filterObject);
			}
		}
	},
	addEventFiltersToList: function() {
		const self = this;
		var filterList = self.filterList;
		var visualizeState = State.visualize;
		var selectedEvents = visualizeState.filter(function(d) {
			return (d.type == 'pointEvent' || d.type == 'intervalEvent');
		});

		for (var i = 0; i < selectedEvents.length; i++) {
			var eventData = selectedEvents[i].data;
			var eventName = eventData.eventName;
			var eventAttributeList = eventData.eventAttributeList;

			filterList[eventName] = [];

			for (var j = 0; j < eventAttributeList.length; j++) {
				var eventAttributeData = eventAttributeList[j];
				var eventAttributeName = eventAttributeData.eventAttributeName;
				var eventAttributeType = eventAttributeData.eventAttributeType;
				var eventAttributeAttributeList = eventAttributeData.eventAttributeAttributeList;
				var filterObject = null;
				var previousFilterObjectList = State.getPreviousFilterObjectList({
					databaseQueryType: 'event',
					databaseQueryName: eventName,
					eventAttributeName: eventAttributeName,
					eventAttributeType: eventAttributeType,
					displayName: eventAttributeName // to differentiate from event attribute attribute
				});

				// handle event attribute
				if (previousFilterObjectList.length == 0) { // not previously stored
					filterObject = {};
					filterObject.databaseQueryType = 'event';
					filterObject.databaseQueryName = eventName;
					filterObject.eventAttributeName = eventAttributeName;
					filterObject.eventAttributeType = eventAttributeType;
					filterObject.displayName = eventAttributeName;
					filterObject.isFiltered = false;
					self.addDataToFilterObject(filterObject, eventAttributeType, eventAttributeData);
					filterList[eventName].push(filterObject);
				}
				else if (previousFilterObjectList.length > 0) {
					filterObject = previousFilterObjectList[0]; // only one match
					filterList[eventName].push(filterObject);
				}

				// handle event attribute attribute
				for (var k = 0; k < eventAttributeAttributeList.length; k++) {
					var eventAttributeAttributeData = eventAttributeAttributeList[k];
					var eventAttributeAttributeName = eventAttributeAttributeData.attributeName;
					var eventAttributeAttributeType = eventAttributeAttributeData.attributeType;
					var eventAttributEntityKey = eventAttributeData.entityKey;
					var shortEventAttributeName = eventAttributeName.length > 10 ? eventAttributeName.substring(0, 10) + '...' : eventAttributeName;
					var filterObject = null;
					var previousFilterObjectList = State.getPreviousFilterObjectList({
						databaseQueryType: 'event',
						databaseQueryName: eventName,
						eventAttributeName: eventAttributeName,
						eventAttributeType: eventAttributeType,
						eventAttributeAttributeName: eventAttributeAttributeName,
						eventAttributeAttributeType: eventAttributeAttributeType
					});

					if (previousFilterObjectList.length == 0) { // not previously stored
						filterObject = {};
						filterObject.databaseQueryType = 'event';
						filterObject.databaseQueryName = eventName;
						filterObject.eventAttributeName = eventAttributeName;
						filterObject.eventAttributeType = eventAttributeType;
						filterObject.eventAttributeAttributeName = eventAttributeAttributeName;
						filterObject.eventAttributeAttributeType = eventAttributeAttributeType;
						filterObject.entityKey = eventAttributEntityKey;
						filterObject.displayName = shortEventAttributeName + ' : ' + eventAttributeAttributeName;
						filterObject.isFiltered = false;
						self.addDataToFilterObject(filterObject, eventAttributeAttributeType, eventAttributeAttributeData);
						filterList[eventName].push(filterObject);
					}
					else if (previousFilterObjectList.length > 0) {
						filterObject = previousFilterObjectList[0]; // only one match
						filterList[eventName].push(filterObject);
					}
				}
			}
		}
	},
	drawFilters: function() {
		const self = this;
		var filterList = self.filterList;

		for (var filterItem in filterList) {
			var title = 'Filter ' + filterItem;

			$('#setting-pane > .settings')
				.append('<div class="title">' + title + '</div>'); // add name span for showing tooltip

			for (var i = 0; i < filterList[filterItem].length; i++) {
				var filterObject = filterList[filterItem][i];
				var attributeName = filterObject.displayName;
				var isFiltered = filterObject.isFiltered;
				var attributeType = null;
				var filterCapsuleHTML = null;
				var addedFilterCapsuleEl = null;

				if ('eventAttributeAttributeType' in filterObject) attributeType = filterObject.eventAttributeAttributeType;
				else if ('eventAttributeType' in filterObject) attributeType = filterObject.eventAttributeType;
				else if ('attributeType' in filterObject) attributeType = filterObject.attributeType;
				filterCapsuleHTML = self.generateFilterCapsuleHTML(attributeName, attributeType, isFiltered);
				$('#setting-pane > .settings').append(filterCapsuleHTML);
				addedFilterCapsuleEl = $('#setting-pane > .settings > .filter-capsule').last()[0];
				d3.select(addedFilterCapsuleEl).datum(filterObject);
			}
		}
	},
	initClickListFilterHeaderBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.filter > .filter-capsule.list > .header')
			.on('click', onClickFilterPaneListFilterHeader);

		function onClickFilterPaneListFilterHeader(event) {
			var filterCapsuleEl = this.parentNode;
			var needToExpand = !$(filterCapsuleEl).hasClass('expanded');
			var filterContentEl = $(filterCapsuleEl).find('.content')[0];
			var filterObject = d3.select(filterCapsuleEl).datum();
			var clickedSelectAllButton = $(event.target).hasClass('select-all-button');
			var clickedSelectNoneButton = $(event.target).hasClass('select-none-button');

			// expand
			if (needToExpand && !clickedSelectAllButton && !clickedSelectNoneButton) {
				$(filterCapsuleEl).addClass('expanded');
				$(filterContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-down');
				$(this).find('.expand-button').addClass('fa-caret-square-up');
				for (var i = 0; i < filterObject.categories.length; i++) {
					var categoryName = filterObject.categories[i];
					var categoryIsChecked = filterObject.filteredCategories.indexOf(categoryName) != -1;
					var categoryHTML = self.generateCategoryHTML(categoryName, categoryIsChecked);
					var addedCategoryEl = null;
					$(filterContentEl).append(categoryHTML);
					addedCategoryEl = $(filterContentEl).find('.category').last()[0];
					d3.select(addedCategoryEl).datum(categoryName);
				}
				self.initClickListFilterCategoryBehaviour(filterContentEl);
				self.initHoverListFilterCategoryBehaviour(filterContentEl);
			}

			// collapse
			else if (!needToExpand && !clickedSelectAllButton && !clickedSelectNoneButton) {
				$(filterCapsuleEl).removeClass('expanded');
				$(filterContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-up');
				$(this).find('.expand-button').addClass('fa-caret-square-down');
			}

			// select all
			else if (clickedSelectAllButton) {
				ListFilter.clickSelectAll(filterCapsuleEl); // update states
				RightColumn.update();
			}

			// select none
			else if (clickedSelectNoneButton) {
				ListFilter.clickSelectNone(filterCapsuleEl); // update states
				RightColumn.update();
			}
		}
	},
	initClickRangeFilterHeaderBehaviour: function() {
		const self = this;

		$('#setting-pane > .settings.filter > .filter-capsule.range > .header')
			.on('click', onClickFilterPaneRangeFilter);

		function onClickFilterPaneRangeFilter() {
			var filterCapsuleEl = this.parentNode;
			var needToExpand = !$(filterCapsuleEl).hasClass('expanded');
			var filterContentEl = $(filterCapsuleEl).find('.content')[0];
			var filterObject = d3.select(filterCapsuleEl).datum();
			var clickedSelectAllButton = $(event.target).hasClass('select-all-button');
			var clickedSelectNoneButton = $(event.target).hasClass('select-none-button');

			// expand
			if (needToExpand && !clickedSelectAllButton && !clickedSelectNoneButton) {
				var sliderHTML = self.generateSliderHTML();
				var sliderObject = new FilterSlider(filterContentEl);

				var filterMin = filterObject.range[0];
				var filterMax = filterObject.range[1];
				var filterHandleMin = filterObject.filteredRange[0];
				var filterHandleMax = filterObject.filteredRange[1];
				let realMaxNumberOfDecimal = Math.max(self.countDecimals(filterMin), self.countDecimals(filterMax));
				let maxNumberOfDecimal = (realMaxNumberOfDecimal > 2) ? 2 : realMaxNumberOfDecimal;
				let step = 1 / Math.pow(10, maxNumberOfDecimal);

				$(filterCapsuleEl).addClass('expanded');
				$(filterContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-down');
				$(this).find('.expand-button').addClass('fa-caret-square-up');
				$(filterContentEl).append(sliderHTML);

				sliderObject.init();
				sliderObject.initHandleValues();
				sliderObject.initDragBehaviour();
				sliderObject.updateMinMax(filterMin, filterMax);
				sliderObject.updateValues([ filterHandleMin, filterHandleMax ]);
				sliderObject.updateStep(step);
				sliderObject.updateHandles();
				sliderObject.updateMinMaxText();
			}

			// collapse
			else if (!needToExpand && !clickedSelectAllButton && !clickedSelectNoneButton) {
				$(filterCapsuleEl).removeClass('expanded');
				$(filterContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-up');
				$(this).find('.expand-button').addClass('fa-caret-square-down');
			}
		}
	},
	initHoverTitleBehaviour: function() {
		$('#setting-pane > .settings.filter > .title')
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
	initHoverFilterHeaderBehaviour: function() {
		$('#setting-pane > .settings.filter > .filter-capsule > .header')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverFilterHeader)
			.on('mouseout', onMouseoutFilterHeader);

		function onMouseoverFilterHeader(event) {
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
					text = 'Click to deselect all categories below'
				);
			}
			else if (hoveredSelectAllButton) {
				var offset = $(this).offset();
				var width = $(this).width();

				$(this).removeClass('hover');
				SettingPaneAttributeTooltip.simplyShow(
					left = offset.left + width + 8 + 5,
					top = offset.top + 8,
					text = 'Click to select all categories below'
				);
			}
		}

		function onMouseoutFilterHeader() {
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
				SettingPane.empty();
				self.filterList = {};
				self.addCountryFiltersToList();
				self.addEventFiltersToList();
				self.drawFilters();
				self.initClickListFilterHeaderBehaviour();
				self.initClickRangeFilterHeaderBehaviour();
				self.initHoverTitleBehaviour();
				self.initHoverFilterHeaderBehaviour();
			}

			else if (searchQueryInLowerCase != '') {
				self.expandListFilters(searchQueryInLowerCase);
				self.markVariables(searchQueryInLowerCase);
				self.filterFilters(searchQueryInLowerCase);
				self.filterTitles();
			}
		}
	},

	// initSearchBoxBehaviour

	expandListFilters: function(searchQueryInLowerCase) {
		const self = this;

		$('#setting-pane > .settings.filter > .filter-capsule.list').each(function() {
			var filterCapsuleEl = this;
			var filterContentEl = $(filterCapsuleEl).find('.content')[0];
			var filterObject = d3.select(filterCapsuleEl).datum();
			var allCategoryList = filterObject.categories;
			var filteredCategoryList = filterObject.filteredCategories;
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
				$(filterCapsuleEl).addClass('expanded');
				$(filterContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-down');
				$(this).find('.expand-button').addClass('fa-caret-square-up');
			}

			// collapse if matchedCategoryList is empty
			else if (matchedCategoryList.length == 0) {
				$(filterCapsuleEl).removeClass('expanded');
				$(filterContentEl).empty();
				$(this).find('.expand-button').removeClass('fa-caret-square-up');
				$(this).find('.expand-button').addClass('fa-caret-square-down');
			}

			// draw matchedCategoryList
			for (var i = 0; i < matchedCategoryList.length; i++) {
				var categoryName = matchedCategoryList[i];
				var categoryIsChecked = filteredCategoryList.indexOf(categoryName) != -1;
				var categoryHTML = self.generateCategoryHTML(categoryName, categoryIsChecked);
				var addedCategoryEl = null;
				$(filterContentEl).append(categoryHTML);
				addedCategoryEl = $(filterContentEl).find('.category').last()[0];
				d3.select(addedCategoryEl).datum(categoryName);
			}
			self.initClickListFilterCategoryBehaviour(filterContentEl);
			self.initHoverListFilterCategoryBehaviour(filterContentEl);
		});
	},
	markVariables: function(searchQueryInLowerCase) {
		var markInstance = new Mark(document.querySelectorAll('#setting-pane > .settings.filter'));

		markInstance.unmark({
	  		done: function(){
	    		markInstance.mark(searchQueryInLowerCase, {
    				'separateWordSearch': false,
    				'diacritics': false
	    		});
	    	}
	  	});
	},
	filterFilters: function(searchQueryInLowerCase) {
		$('#setting-pane > .settings.filter > .filter-capsule').each(function() {
			var filterCapsuleEl = this;
			var filterObject = d3.select(filterCapsuleEl).datum();
			var attributeName = filterObject.displayName;
			var attributeNameInLowerCase = attributeName.toLowerCase();
			var attributeNameMatchedQuery = attributeNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;
			var categoriesMatchedQuery = $(filterCapsuleEl).hasClass('expanded');

			if (attributeNameMatchedQuery || categoriesMatchedQuery)
				$(filterCapsuleEl).css('display', '');
			else if (!attributeNameMatchedQuery && !categoriesMatchedQuery)
				$(filterCapsuleEl).css('display', 'none');
		});
	},
	filterTitles: function() {
		$('#setting-pane > .settings.filter > .title').each(function() {
			var currentTitleEl = this;
			var currentEl = $(this).next()[0];
			var currentTitleHasContent = false;
			var isCurrentFilterCapsule = $(currentEl).hasClass('filter-capsule');

			while (isCurrentFilterCapsule) {
				if ($(currentEl).is(':visible')) {
					currentTitleHasContent = true; break;
				}
				currentEl = $(currentEl).next()[0];
				isCurrentFilterCapsule = $(currentEl).hasClass('filter-capsule');
			}

			if (currentTitleHasContent) $(currentTitleEl).css('display', '');
			else if (!currentTitleHasContent) $(currentTitleEl).css('display', 'none');
		});
	},

	// helpers
	addDataToFilterObject: function(filterObject, attributeType, data) {
		const self = this;

		if (attributeType == 'categorical') {
			filterObject.categories = self.shallowCopyList(data.categories);
			filterObject.filteredCategories = self.shallowCopyList(data.categories);
		}
		else if (attributeType == 'nominal') {
			filterObject.range = d3.extent(data.levels);
			filterObject.filteredRange = d3.extent(data.levels);
		}
		else if (attributeType == 'numerical') {
			filterObject.range = self.shallowCopyList(data.range);
			filterObject.filteredRange = self.shallowCopyList(data.range);
		}
	},
	shallowCopyList: function(list) {
		var newList = [];

		for (var i = 0; i < list.length; i++)
			newList.push(list[i]);

		return newList;
	},
	initClickListFilterCategoryBehaviour: function(filterContentEl) {
		$(filterContentEl).find('.category')
			.on('click', onClickListFilterCategory);

		function onClickListFilterCategory() {
			var filterCapsuleEl = filterContentEl.parentNode;
			ListFilter.clickCategory(filterCapsuleEl, this); // update states
			RightColumn.update();
		}
	},
	initHoverListFilterCategoryBehaviour: function(filterContentEl) {
		$(filterContentEl).find('.category')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverListFilterCategory)
			.on('mouseout', onMouseoutListFilterCategory);

		function onMouseoverListFilterCategory() {
			var name = d3.select(this).datum();
			SettingPaneAttributeTooltip.show(name, this);
		}

		function onMouseoutListFilterCategory() {
			SettingPaneAttributeTooltip.hide();
		}
	},
	generateFilterCapsuleHTML: function(attributeName, attributeType, isFiltered) {
		var typeClass = attributeType == 'categorical' ? 'fa-font' 
					  : (attributeType == 'temporal' ? 'fa-chart-line' : 'fa-hashtag');
		var filterClass = attributeType == 'categorical' ? 'list' : 'range';
		var isFilteredClass = isFiltered ? ' filtered' : '';

		return '<div class="filter-capsule ' + filterClass + isFilteredClass +  '">' +
					'<div class="header">' +
						'<span class="fa fa-filter filter-icon"></span>' +
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
	}
}