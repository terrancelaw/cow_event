const DataProcessingEventCounter = {
	eventName: null,
	eventAttributeName: null,
	eventAttributeAttributeName: null,

	eventData: null,
	eventAttributeData: null,
	eventAttributeAttributeData: null,

	generate: function() {
		const self = this;
		var countingEventAttrList = State.visualize.filter(function(d) {
			return d.type == 'eventAttribute' || d.type == 'eventAttributeAttribute';
		});

		if (countingEventAttrList.length == 0) {
			self.eventName = null;
			self.eventAttributeName = null;
			self.eventAttributeAttributeName = null;
			self.eventData = null;
			self.eventAttributeData = null;
			self.eventAttributeAttributeData = null;
			DataProcessor.eventCountData = [];
		}
		else if (countingEventAttrList.length > 0) {
			self.getCountingEventAttr();
			self.initEventCountData();
			self.initCountForEachTimeline();
			self.generateValueList();
			self.generateCountList();
		}
	},
	getCountingEventAttr: function() {
		const self = this;
		var eventName = null;
		var eventAttributeName = null;
		var eventAttributeAttributeName = null;
		var eventData = null;
		var eventAttributeData = null;
		var eventAttributeAttributeData = null;
		var countingEventAttr = State.visualize.filter(function(d) {
			return d.type == 'eventAttribute' || d.type == 'eventAttributeAttribute';
		})[0];

		if (countingEventAttr.type == 'eventAttribute') {
			eventName = countingEventAttr.data.parentEventData.eventName;
			eventAttributeName = countingEventAttr.data.eventAttributeName;
			eventData = countingEventAttr.data.parentEventData;
			eventAttributeData = countingEventAttr.data;
		}
		else if (countingEventAttr.type == 'eventAttributeAttribute') {
			eventName = countingEventAttr.data.parentEventAttributeData.parentEventData.eventName;
			eventAttributeName = countingEventAttr.data.parentEventAttributeData.eventAttributeName;
			eventAttributeAttributeName = countingEventAttr.data.attributeName;
			eventData = countingEventAttr.data.parentEventAttributeData.parentEventData;
			eventAttributeData = countingEventAttr.data.parentEventAttributeData;
			eventAttributeAttributeData = countingEventAttr.data;
		}

		self.eventName = eventName;
		self.eventAttributeName = eventAttributeName;
		self.eventAttributeAttributeName = eventAttributeAttributeName;
		self.eventData = eventData;
		self.eventAttributeData = eventAttributeData;
		self.eventAttributeAttributeData = eventAttributeAttributeData;
	},
	initEventCountData: function() {
		var plotData = DataProcessor.plotData;
		var eventCountData = [];

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var groupName = groupData.name;
			var eventCountGroup = {};

			eventCountGroup.name = groupName;
			eventCountGroup.countData = []; // count for each timeline
			eventCountData.push(eventCountGroup)
		}

		DataProcessor.eventCountData = eventCountData;
	},
	initCountForEachTimeline: function() {
		var plotData = DataProcessor.plotData;
		var eventCountData = DataProcessor.eventCountData;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineList = groupData.timelineData;
			var eventCountGroup = eventCountData[i];

			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				var countObject = {
					timelineName: timelineObject.name,
					valueList: [],
					countList: []
				}; // correspond to a timeline

				eventCountGroup.countData.push(countObject);
			}
		}
	},
	generateValueList: function() {
		const self = this;
		var plotData = DataProcessor.plotData;
		var eventCountData = DataProcessor.eventCountData;

		var eventName = self.eventName;
		var eventAttributeName = self.eventAttributeName;
		var eventAttributeAttributeName = self.eventAttributeAttributeName;
		var eventData = self.eventData;
		var eventAttributeData = self.eventAttributeData;
		var eventAttributeAttributeData = self.eventAttributeAttributeData;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineList = groupData.timelineData;
			var eventCountGroup = eventCountData[i]; // .countData correspond to timelineList

			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				var countObject = eventCountGroup.countData[j];

				var timelinePointEventList = timelineObject.originalPointEvents;
				var timelineIntervalEventList = timelineObject.originalIntervalEvents;

				var valueList = null;
				var isEventAttribute = eventAttributeAttributeName === null;
				var isEventAttributeAttribute = eventAttributeAttributeName !== null;
				var eventList = (eventData.eventType == 'interval') 
							  ? timelineIntervalEventList.filter(function(d) { return d.eventName == eventName })
							  : timelinePointEventList.filter(function(d) { return d.eventName == eventName });

				if (isEventAttribute)
					valueList = self.gatherEventAttributes(eventList, eventAttributeData);
				else if (isEventAttributeAttribute)
					valueList = self.gatherEventAttributeAttributes(eventList, eventAttributeAttributeData);

				countObject.valueList = valueList;
			}
		}
	},
	generateCountList: function() {
		const self = this;
		var plotData = DataProcessor.plotData;
		var eventCountData = DataProcessor.eventCountData;

		var eventName = self.eventName;
		var eventAttributeName = self.eventAttributeName;
		var eventAttributeAttributeName = self.eventAttributeAttributeName;
		var eventData = self.eventData;
		var eventAttributeData = self.eventAttributeData;
		var eventAttributeAttributeData = self.eventAttributeAttributeData;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineList = groupData.timelineData;
			var eventCountGroup = eventCountData[i]; // .countData correspond to timelineList

			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				var countObject = eventCountGroup.countData[j];

				var countList = null;
				var valueList = countObject.valueList;
				var isEventAttribute = eventAttributeAttributeName === null;
				var isEventAttributeAttribute = eventAttributeAttributeName !== null;

				if (isEventAttribute)
					countList = self.generateCountForEventAttribute(valueList, eventAttributeData);
				else if (isEventAttributeAttribute)
					countList = self.generateCountForEventAttributeAttribute(valueList, eventAttributeAttributeData);

				countObject.countList = countList;
			}
		}
	},

	// helpers

	gatherEventAttributes: function(eventList, eventAttributeData) {
		var valueList = [];
		var eventAttributeName = eventAttributeData.eventAttributeName;

		for (var i = 0; i < eventList.length; i++) {
			var value = eventList[i][eventAttributeName];
			var valueIsMissing = value === null;
			if (!valueIsMissing) valueList.push(value);
		}

		return valueList;
	},
	gatherEventAttributeAttributes: function(eventList, eventAttributeAttributeData) {
		var eventAttributeData = eventAttributeAttributeData.parentEventAttributeData;
		var eventAttributeName = eventAttributeData.eventAttributeName;
		var evenAttributeEntityKey = eventAttributeData.entityKey;
		var eventAttributeAttributeName = eventAttributeAttributeData.attributeName;

		var entityData = Database.rawData.entityData[evenAttributeEntityKey];
		var uniqueCategories = {};
		var valueList = [];

		// gather uniqueCategories
		for (var i = 0; i < eventList.length; i++) {
			var category = eventList[i][eventAttributeName]; // assume categorical data?
			var categoryIsMissing = category === null;
			if (!categoryIsMissing) uniqueCategories[category] = null;
		}

		// gather valueList
		for (var i = 0; i < entityData.length; i++)
			if (entityData[i].name in uniqueCategories) {
				var value = entityData[i][eventAttributeAttributeName];
				var valueIsMissing = value === null;
				if (!valueIsMissing) valueList.push(value);
			}

		return valueList;
	},
	generateCountForEventAttribute: function(valueList, eventAttributeData) {
		var numberOfBins = CountEventPane.numberOfBins;
		var valueToCountInfo = {};
		var countList = []; // list of valueToCountInfo
		var attributeType = eventAttributeData.eventAttributeType;

		// gather valueToCountInfo
		if (attributeType == 'categorical') {
			var categories = eventAttributeData.categories;

			for (var i = 0; i < categories.length; i++)
				valueToCountInfo[categories[i]] = { value: categories[i], count: 0, countString: '' };
			for (var i = 0; i < valueList.length; i++)
				valueToCountInfo[valueList[i]].count++;
			for (var key in valueToCountInfo)
				valueToCountInfo[key].countString = valueToCountInfo[key].count > 1
												  ? valueToCountInfo[key].count + ' events'
												  : valueToCountInfo[key].count + ' event';
		}
		else if (attributeType == 'nominal') {
			var levels = eventAttributeData.levels;

			for (var i = 0; i < levels.length; i++)
				valueToCountInfo[levels[i]] =  { value: String(levels[i]), count: 0, countString: '' };
			for (var i = 0; i < valueList.length; i++)
				valueToCountInfo[valueList[i]].count++;
			for (var key in valueToCountInfo)
				valueToCountInfo[key].countString = valueToCountInfo[key].count > 1
												  ? valueToCountInfo[key].count + ' events'
												  : valueToCountInfo[key].count + ' event';
		}
		else if (attributeType == 'numerical') {
			var min = eventAttributeData.range[0];
			var max = eventAttributeData.range[1];
			var binSize = (max - min) / numberOfBins;

			for (var i = 0; i < numberOfBins; i++) {
				var binMin = min + binSize * i;
				var binMax = binMin + binSize;
				binMin = Math.round((binMin + Number.EPSILON) * 100) / 100;
				binMax = Math.round((binMax + Number.EPSILON) * 100) / 100;
				valueToCountInfo[i] = { 
					value: '≥' + binMin + ', <' + binMax,
					binMin: binMin, binMax: binMax,
					count: 0, binIndex: i, countString: '' 
				};
				if (i == numberOfBins - 1) valueToCountInfo[i].value = '≥' + binMin + ', ≤' + binMax;
			}
			for (var i = 0; i < valueList.length; i++) {
				var value = valueList[i];
				var binIndex = Math.floor((value - min) / binSize);
				if (value == max) binIndex = numberOfBins - 1;
				valueToCountInfo[binIndex].count++;
			}
			for (var key in valueToCountInfo)
				valueToCountInfo[key].countString = valueToCountInfo[key].count > 1
												  ? valueToCountInfo[key].count + ' events'
												  : valueToCountInfo[key].count + ' event';
		}

		// gather and sort countList
		for (var key in valueToCountInfo) countList.push(valueToCountInfo[key]);
		countList.sort(function(a, b) { return b.count - a.count });

		return countList;
	},
	generateCountForEventAttributeAttribute: function(valueList, eventAttributeAttributeData) {
		var numberOfBins = CountEventPane.numberOfBins;
		var valueToCountInfo = {};
		var countList = []; // list of valueToCountInfo
		var attributeType = eventAttributeAttributeData.attributeType;

		var eventAttributeData = eventAttributeAttributeData.parentEventAttributeData;
		var evenAttributeEntityKey = eventAttributeData.entityKey;
		var singularEntityName = evenAttributeEntityKey;
		var pluralEntityName = pluralize.plural(evenAttributeEntityKey);

		// gather valueToCountInfo
		if (attributeType == 'categorical') {
			var categories = eventAttributeAttributeData.categories;

			for (var i = 0; i < categories.length; i++)
				valueToCountInfo[categories[i]] = { value: categories[i], count: 0, countString: '' };
			for (var i = 0; i < valueList.length; i++)
				valueToCountInfo[valueList[i]].count++;
			for (var key in valueToCountInfo)
				valueToCountInfo[key].countString = valueToCountInfo[key].count > 1
												  ? valueToCountInfo[key].count + ' ' + pluralEntityName
												  : valueToCountInfo[key].count + ' ' + singularEntityName;
		}
		else if (attributeType == 'nominal') {
			var levels = eventAttributeAttributeData.levels;

			for (var i = 0; i < levels.length; i++)
				valueToCountInfo[levels[i]] =  { value: String(levels[i]), count: 0, countString: '' };
			for (var i = 0; i < valueList.length; i++)
				valueToCountInfo[valueList[i]].count++;
			for (var key in valueToCountInfo)
				valueToCountInfo[key].countString = valueToCountInfo[key].count > 1
												  ? valueToCountInfo[key].count + ' ' + pluralEntityName
												  : valueToCountInfo[key].count + ' ' + singularEntityName;
		}
		else if (attributeType == 'numerical') {
			var min = eventAttributeAttributeData.range[0];
			var max = eventAttributeAttributeData.range[1];
			var binSize = (max - min) / numberOfBins;

			for (var i = 0; i < numberOfBins; i++) {
				var binMin = min + binSize * i;
				var binMax = binMin + binSize;
				binMin = Math.round((binMin + Number.EPSILON) * 100) / 100;
				binMax = Math.round((binMax + Number.EPSILON) * 100) / 100;
				valueToCountInfo[i] = { value: '≥' + binMin + ', <' + binMax, count: 0, binIndex: i, countString: '' };
				if (i == numberOfBins - 1) valueToCountInfo[i].value = '≥' + binMin + ', ≤' + binMax;
			}
			for (var i = 0; i < valueList.length; i++) {
				var value = valueList[i];
				var binIndex = Math.floor((value - min) / binSize);
				if (value == max) binIndex = numberOfBins - 1;
				valueToCountInfo[binIndex].count++;
			}
			for (var key in valueToCountInfo)
				valueToCountInfo[key].countString = valueToCountInfo[key].count > 1
												  ? valueToCountInfo[key].count + ' ' + pluralEntityName
												  : valueToCountInfo[key].count + ' ' + singularEntityName;
		}

		// gather and sort countList
		for (var key in valueToCountInfo) countList.push(valueToCountInfo[key]);
		countList.sort(function(a, b) { return b.count - a.count });

		return countList;
	}
}