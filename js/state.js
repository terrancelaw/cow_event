const State = {
	visualize: [], // type: timeSeries, pointEvent, intervalEvent, eventAttribute, eventAttributeAttribute
	group: [], // type: countryAttribute
	filter: [], // type: countryAttribute, eventAttribute, eventAttributeAttribute
	encode: [], // heightScale, eventName, eventAttributeName
	highlight: [], // type: eventAttribute, eventAttributeAttribute
	
	// other settings
	removeTimelineWithNoData: true,
	splitTimelineBy: 'no splitting',
	normalizeTimeSeries: false,

	// count event pane
	selectedNewEventAttr: false, // check if need to force open count event pane
	showChartDescription: true,

	clear: function() {
		const self = this;

		self.visualize = [];
		self.group = [];
		self.filter = [];
		self.encode = [];
		self.highlight = [];

		self.removeTimelineWithNoData = true;
		self.splitTimelineBy = 'no splitting';
		self.normalizeTimeSeries = false;

		self.selectedNewEventAttr = false;
	},

	// visualize

	addVisualizeState: function(type, data) {
		const self = this;
		var visualizeState = self.visualize;
		var alreadyAdded = self.searchVisualizeState(data) !== null;

		if (!alreadyAdded) {
			visualizeState.push({ type: type, data: data });
			if (type == 'eventAttribute' || 
				type == 'eventAttributeAttribute') 
				self.selectedNewEventAttr = true; // set to false upon update
		}
			
	},
	removeVisualizeState: function(data) {
		const self = this;
		var visualizeState = self.visualize;
		var index = self.searchVisualizeState(data);

		if (index !== null)
			visualizeState.splice(index, 1);
	},
	searchVisualizeState: function(data) {
		const self = this;
		var visualizeState = self.visualize;
		var index = null;

		for (var i = 0; i < visualizeState.length; i++)
			if (visualizeState[i].data == data) {
				index = i; break;
			}

		return index;
	},

	// group

	addGroupState: function(type, data) {
		const self = this;
		var groupState = self.group;

		groupState.push({
			type: type, data: data
		});
	},
	removeGroupState: function(data) {
		const self = this;
		var groupState = self.group;
		var index = self.searchGroupState(data);

		if (index !== null)
			groupState.splice(index, 1);
	},
	searchGroupState: function(data) {
		const self = this;
		var groupState = self.group;
		var index = null;

		for (var i = 0; i < groupState.length; i++)
			if (groupState[i].data == data) {
				index = i; break;
			}

		return index;
	},

	// filter

	addFilterState: function(state) {
		const self = this;
		var filterState = self.filter;
		var alreadyAdded = self.searchFilterState(state) !== null;

		if (!alreadyAdded)
			filterState.push(state);
	},
	removeFilterState: function(state) {
		const self = this;
		var filterState = self.filter;
		var index = self.searchFilterState(state);

		if (index !== null)
			filterState.splice(index, 1);
	},
	searchFilterState: function(state) {
		const self = this;
		var filterState = self.filter;
		var index = null;

		for (var i = 0; i < filterState.length; i++)
			if (filterState[i] == state) {
				index = i; break;
			}

		return index;
	},
	getPreviousFilterObjectList: function(data) {
		const self = this;
		var filterState = self.filter;
		var filterObjectList = [];

		for (var i = 0; i < filterState.length; i++) {
			var filterObject = filterState[i];
			var isMatched = true;

			for (var key in data) 
				if (!(key in filterObject && data[key] == filterObject[key])) {
					isMatched = false; break;
				}

			if (isMatched)
				filterObjectList.push(filterObject);
		}

		return filterObjectList;
	},
	removeEventFilters: function(eventName) { // when uncheck events
		const self = this;
		var filterObjectList = self.getPreviousFilterObjectList({
			databaseQueryType: 'event',
			databaseQueryName: eventName
		});

		for (var i = 0; i < filterObjectList.length; i++) {
			var filterObject = filterObjectList[i];
			self.removeFilterState(filterObject);
		}
	},

	// encode

	addEncodeState: function(state) {
		const self = this;
		var encodeState = self.encode;
		var alreadyAdded = self.searchEncodeState(state) !== null;

		if (!alreadyAdded)
			encodeState.push(state);
	},
	removeEncodeState: function(state) {
		const self = this;
		var encodeState = self.encode;
		var index = self.searchEncodeState(state);

		if (index !== null)
			encodeState.splice(index, 1);
	},
	searchEncodeState: function(state) {
		const self = this;
		var encodeState = self.encode;
		var index = null;

		for (var i = 0; i < encodeState.length; i++) {
			var encodeObject = encodeState[i];
			var sameEventName = encodeObject.eventName == state.eventName;
			var sameEventAttributeName = encodeObject.eventAttributeName == state.eventAttributeName;
			var sameMaxValue = encodeObject.heightScale.domain()[1] == state.heightScale.domain()[1];
			if (sameEventName && sameEventAttributeName && sameMaxValue) return i;
		}

		return index;
	},
	getPreviousEncodeObjectList: function(data) {
		const self = this;
		var encodeState = self.encode;
		var encodeObjectList = [];

		for (var i = 0; i < encodeState.length; i++) {
			var encodeObject = encodeState[i];
			var isMatched = true;

			for (var key in data) 
				if (!(key in encodeObject && data[key] == encodeObject[key])) {
					isMatched = false; break;
				}

			if (isMatched)
				encodeObjectList.push(encodeObject);
		}

		return encodeObjectList;
	},
	removeEventEncodings: function(eventName) { // when uncheck events
		const self = this;
		var encodeObjectList = self.getPreviousEncodeObjectList({ eventName: eventName });

		for (var i = 0; i < encodeObjectList.length; i++) {
			var encodeObject = encodeObjectList[i];
			self.removeEncodeState(encodeObject);
		}
	},
	getEncodeStateByEventName: function() {
		const self = this;
		var encodeState = self.encode;
		var encodeStateByEventName = {};

		for (var i = 0; i < encodeState.length; i++) {
			var encodeObject = encodeState[i];
			var eventName = encodeObject.eventName;
			encodeStateByEventName[eventName] = encodeObject;
		}

		return encodeStateByEventName;
	},

	// highlight

	addHighlightState: function(state) {
		const self = this;
		var highlightState = self.highlight;
		var alreadyAdded = self.searchHighlightState(state) !== null;

		if (!alreadyAdded)
			highlightState.push(state);
	},
	removeHighlightState: function(state) {
		const self = this;
		var highlightState = self.highlight;
		var index = self.searchHighlightState(state);

		if (index !== null)
			highlightState.splice(index, 1);
	},
	searchHighlightState: function(state) {
		const self = this;
		var highlightState = self.highlight;
		var index = null;

		for (var i = 0; i < highlightState.length; i++)
			if (highlightState[i] == state) {
				index = i; break;
			}

		return index;
	},
	getPreviousHighlightObjectList: function(data) {
		const self = this;
		var highlightState = self.highlight;
		var highlightObjectList = [];

		for (var i = 0; i < highlightState.length; i++) {
			var highlightObject = highlightState[i];
			var isMatched = true;

			for (var key in data) 
				if (!(key in highlightObject && data[key] == highlightObject[key])) {
					isMatched = false; break;
				}

			if (isMatched)
				highlightObjectList.push(highlightObject);
		}

		return highlightObjectList;
	},
	removeEventHighlights: function(eventName) { // when uncheck events
		const self = this;
		var highlightObjectList = self.getPreviousHighlightObjectList({
			databaseQueryType: 'event',
			databaseQueryName: eventName
		});

		for (var i = 0; i < highlightObjectList.length; i++) {
			var highlightObject = highlightObjectList[i];
			self.removeHighlightState(highlightObject);
		}
	}
}