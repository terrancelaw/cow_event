const DataProcessingTimelinePlotter = {
	eventHighlightList: {},

	generate: function() {
		const self = this;

		self.initEventHighlightList();
		self.initTimelineData();
		self.initPointEventData();
		self.initIntervalEventData();
		self.generatePointEventYPos();
		self.generateIntervalEventYPos();
		self.generateTimelineHeight();
		self.generateTimelineTranslateY();
	},
	initEventHighlightList: function() {
		const self = this;
		var eventData = DataProcessor.filteredData.eventData;
		var highlightList = State.highlight;
		var eventHighlightList = {};

		for (var eventName in eventData) {
			var currentEventHighlightList = highlightList.filter(function(d) {
				return d.databaseQueryName == eventName;
			});

			eventHighlightList[eventName] = [];

			for (var i = 0; i < currentEventHighlightList.length; i++) {
				var oldHighlightObject = currentEventHighlightList[i];
				var newHighlightObject = {};
				var highlightBasedOnEventAttr = !('eventAttributeAttributeName' in oldHighlightObject);
				var highlightBasedOnEventAttrAttr = 'eventAttributeAttributeName' in oldHighlightObject;

				if (highlightBasedOnEventAttr) 
					newHighlightObject = self.createEventAttrHighlightObject(oldHighlightObject);
				if (highlightBasedOnEventAttrAttr)
					newHighlightObject = self.createEventAttrAttrHighlightObject(oldHighlightObject);
				
				eventHighlightList[eventName].push(newHighlightObject);
			}
		}

		self.eventHighlightList = eventHighlightList;
	},
	initTimelineData: function() {
		const self = this;
		var filteredDataByGroup = DataProcessor.filteredDataByGroup;
		var plotData = DataProcessor.plotData;
		var intervalEventList = State.visualize.filter(function(d) {
			return d.type == 'intervalEvent';
		}).map(function(d) { return d.data.eventName }); // not showing eventAttr / eventAttrAttr
		var pointEventList = State.visualize.filter(function(d) {
			return d.type == 'pointEvent';
		}).map(function(d) { return d.data.eventName });

		// no events to visualize
		if (intervalEventList.length == 0 && pointEventList.length == 0)
			return;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var groupName = groupData.name;
			var timelineList = groupData.timelineData;
			var eventData = filteredDataByGroup[groupName].eventData;
			var timelineObject = {};

			timelineObject.name = 'events';
			timelineObject.height = null;
			timelineObject.translateY = null;
			timelineObject.pointEventMinY = Infinity;
			timelineObject.pointEventMaxY = -Infinity;
			timelineObject.intervalEventMinY = Infinity;
			timelineObject.intervalEventMaxY = -Infinity;

			timelineObject.pointEventData = [];
			timelineObject.intervalEventData = [];
			timelineObject.originalPointEvents = [];
			timelineObject.originalIntervalEvents = [];

			for (var j = 0; j < intervalEventList.length; j++) {
				var eventName = intervalEventList[j];
				var eventList = eventData[eventName];
				for (var k = 0; k < eventList.length; k++) {
					var row = eventList[k];
					timelineObject.originalIntervalEvents.push(row);
				}
			}

			for (var j = 0; j < pointEventList.length; j++) {
				var eventName = pointEventList[j];
				var eventList = eventData[eventName];
				for (var k = 0; k < eventList.length; k++) {
					var row = eventList[k];
					timelineObject.originalPointEvents.push(row);
				}
			}

			timelineList.push(timelineObject);
		}

		// sort timeline objects for consistency
		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineList = groupData.timelineData;

			timelineList.sort(function(a, b) {
				if (a.name < b.name) return -1;
				else return 1;
			});
		}
	},
	initPointEventData: function() {
		const self = this;
		var plotData = DataProcessor.plotData;
		var yearWidth = VisualizationPane.yearWidth;
		var eventHeight = VisualizationPane.eventHeight;
		var encodeStateByEventName = State.getEncodeStateByEventName();

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineMinYear = groupData.timelineMinYear;
			var timelineList = groupData.timelineData;

			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				var pointEventsList = timelineObject.originalPointEvents;

				for (var k = 0; k < pointEventsList.length; k++) {
					var eventRow = pointEventsList[k];
					var startYear = eventRow.startYear;
					var endYear = eventRow.endYear;
					var eventName = eventRow.eventName;
					var eventID = eventRow.eventID;
					var eventObject = {};

					eventObject.ID = eventID;
					eventObject.width = eventHeight;
					eventObject.height = eventHeight;
					eventObject.x = (startYear - timelineMinYear) * yearWidth;
					eventObject.y = null;
					eventObject.startYear = startYear;
					eventObject.endYear = endYear;
					eventObject.color = VisualizationPane.getColor(eventName);
					eventObject.notHaveEnd = false;
					eventObject.isHighlighted = self.checkIfIsHighlighted(eventRow);
					eventObject.data = eventRow;
					timelineObject.pointEventData.push(eventObject);

					// set height
					if (eventName in encodeStateByEventName) {
						var encodedEventAttrName = encodeStateByEventName[eventName].eventAttributeName;
						var currentEventAttrValue = eventRow[encodedEventAttrName];
						var currentEventHeight = encodeStateByEventName[eventName].heightScale(currentEventAttrValue);
						eventObject.height = currentEventHeight;
					}
				}
			}
		}
	},
	initIntervalEventData: function() {
		const self = this;
		var plotData = DataProcessor.plotData;
		var yearWidth = VisualizationPane.yearWidth;
		var eventHeight = VisualizationPane.eventHeight;
		var encodeStateByEventName = State.getEncodeStateByEventName();

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineMinYear = groupData.timelineMinYear;
			var timelineList = groupData.timelineData;

			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				var intervalEventsList = timelineObject.originalIntervalEvents;

				for (var k = 0; k < intervalEventsList.length; k++) {
					var eventRow = intervalEventsList[k];
					var eventName = eventRow.eventName;
					var eventID = eventRow.eventID;
					var stageList = eventRow.stageList;
					var currEventheight = eventHeight;
					var isHighlighted = self.checkIfIsHighlighted(eventRow);

					// set currEventheight
					if (eventName in encodeStateByEventName) {
						var encodedEventAttrName = encodeStateByEventName[eventName].eventAttributeName;
						var currentEventAttrValue = eventRow[encodedEventAttrName];
						var currentEventHeight = encodeStateByEventName[eventName].heightScale(currentEventAttrValue);
						currEventheight = currentEventHeight;
					}

					// create event object for each stage
					for (var l = 0; l < stageList.length; l++) {
						var stageRow = stageList[l];
						var stageName = stageRow.eventName;
						var stageID = stageRow.eventID;
						var startYear = stageRow.startYear;
						var endYear = stageRow.endYear;
						var currEventWidth = null;
						var eventObject = {};

						// set currEventWidth
						if (startYear === endYear) currEventWidth = eventHeight;
						else if (startYear !== endYear && endYear === null) currEventWidth = eventHeight;
						else if (startYear !== endYear && endYear !== null) currEventWidth = (endYear - startYear) * yearWidth;

						// same for all stages
						eventObject.height = currEventheight;
						eventObject.isHighlighted = isHighlighted;
						eventObject.parentEventID = eventID;

						// different for individual stages
						eventObject.ID = stageID;
						eventObject.width = currEventWidth;
						eventObject.x = (startYear - timelineMinYear) * yearWidth;
						eventObject.y = null;
						eventObject.startYear = startYear;
						eventObject.endYear = endYear;
						eventObject.color = VisualizationPane.getColor(stageName);
						eventObject.notHaveEnd = (endYear === null);
						eventObject.data = stageRow;

						// push
						timelineObject.intervalEventData.push(eventObject);
					}
				}
			}
		}
	},
	generatePointEventYPos: function() {
		const self = this;
		var plotData = DataProcessor.plotData;
		var pointIntervalGap = VisualizationPane.pointIntervalGap;
		var eventMargin = VisualizationPane.eventMargin;
		var needToDrawEvents = plotData.length > 0 
							&& plotData[0].timelineMinYear != Infinity
							&& plotData[0].timelineMaxYear != -Infinity; // should not be inf for defining collisionMap
	
		if (!needToDrawEvents)
			return;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineMinYear = groupData.timelineMinYear;
			var timelineMaxYear = groupData.timelineMaxYear;
			var timelineList = groupData.timelineData;

			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				var pointEventList = timelineObject.pointEventData;
				var pointEventListByYear = {};

				// init pointEventListByYear
				for (var k = 0; k < pointEventList.length; k++)
					pointEventListByYear[pointEventList[k].startYear] = [];

				// generate pointEventListByYear
				for (var k = 0; k < pointEventList.length; k++)
					pointEventListByYear[pointEventList[k].startYear].push(pointEventList[k]);

				// find y position
				for (var year in pointEventListByYear) {
					var currTranslateY = - pointIntervalGap / 2;
					var firstEventObject = pointEventListByYear[year][0];
					var lastEventIndex = pointEventListByYear[year].length - 1;
					var lastEventObject = pointEventListByYear[year][lastEventIndex];

					for (var k = 0; k < pointEventListByYear[year].length; k++) {
						var eventObject = pointEventListByYear[year][k];
						currTranslateY = currTranslateY - eventMargin - eventObject.height / 2;
						eventObject.y = currTranslateY;
						currTranslateY = currTranslateY - eventObject.height / 2;
					}
					if (lastEventObject.y - lastEventObject.height / 2 < timelineObject.pointEventMinY)
						timelineObject.pointEventMinY = lastEventObject.y - lastEventObject.height / 2;
					if (firstEventObject.y + firstEventObject.height / 2 > timelineObject.pointEventMaxY)
						timelineObject.pointEventMaxY = firstEventObject.y + firstEventObject.height / 2;
				}
			}
		}
	},
	generateIntervalEventYPos: function() {
		const self = this;
		var plotData = DataProcessor.plotData;
		var pointIntervalGap = VisualizationPane.pointIntervalGap;
		var eventMargin = VisualizationPane.eventMargin;
		var needToDrawEvents = plotData.length > 0 
							&& plotData[0].timelineMinYear != Infinity
							&& plotData[0].timelineMaxYear != -Infinity; // should not be inf for defining collisionMap

		if (!needToDrawEvents)
			return;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineMinYear = groupData.timelineMinYear;
			var timelineMaxYear = groupData.timelineMaxYear;
			var timelineList = groupData.timelineData;

			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				var intervalEventList = timelineObject.intervalEventData;
				var parentEventIDToYPos = {};

				if (intervalEventList.length > 0) {
					var currTranslateY = pointIntervalGap / 2;
					var firstEventObject = null;

					intervalEventList.sort(function(a, b) { return a.startYear - b.startYear }); // sort to make lines go from left to right
					firstEventObject = intervalEventList[0];

					for (var k = 0; k < intervalEventList.length; k++) {
						var eventObject = intervalEventList[k];
						var parentEventID = eventObject.parentEventID;
						var eventYPos = parentEventIDToYPos[parentEventID];

						if (eventYPos)
							eventObject.y = eventYPos;

						else if (!eventYPos) {
							currTranslateY = currTranslateY + eventMargin + eventObject.height / 2;
							eventObject.y = currTranslateY;
							currTranslateY = currTranslateY + eventObject.height / 2;
							parentEventIDToYPos[parentEventID] = eventObject.y;
						}
					}
					if (firstEventObject.y - firstEventObject.height / 2 < timelineObject.intervalEventMinY)
						timelineObject.intervalEventMinY = firstEventObject.y - firstEventObject.height / 2;
					if (currTranslateY > timelineObject.intervalEventMaxY)
						timelineObject.intervalEventMaxY = currTranslateY;
				}
			}
		}
	},
	generateTimelineHeight: function() {
		const self = this;
		var plotData = DataProcessor.plotData;
		var timelineMinHeight = VisualizationPane.timelineMinHeight;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var timelineList = groupData.timelineData;

			for (var j = 0; j < timelineList.length; j++) {
				var timelineObject = timelineList[j];
				var actualHeight = null;

				if (timelineObject.pointEventMinY == Infinity) timelineObject.pointEventMinY = 0;
				if (timelineObject.pointEventMaxY == -Infinity) timelineObject.pointEventMaxY = 0;
				if (timelineObject.intervalEventMinY == Infinity) timelineObject.intervalEventMinY = 0;
				if (timelineObject.intervalEventMaxY == -Infinity) timelineObject.intervalEventMaxY = 0;

				actualHeight = timelineObject.intervalEventMaxY - timelineObject.pointEventMinY;

				if (actualHeight < timelineMinHeight) { // fill up the empty space
					var emptySpace = timelineMinHeight - actualHeight;
					var noPointEvents = timelineObject.pointEventMaxY == 0 && timelineObject.pointEventMinY == 0;
					var noIntervalEvents = timelineObject.intervalEventMaxY == 0 && timelineObject.intervalEventMinY == 0;

					if (noPointEvents) {
						timelineObject.height = timelineMinHeight;
						timelineObject.intervalEventMaxY = timelineMinHeight - (0 - timelineObject.pointEventMinY);
					}
					else if (noIntervalEvents) {
						timelineObject.height = timelineMinHeight;
						timelineObject.pointEventMinY = 0 - (timelineMinHeight - (timelineObject.intervalEventMaxY - 0));
					}
					else {
						timelineObject.height = timelineMinHeight;
						timelineObject.pointEventMinY -= emptySpace / 2;;
						timelineObject.intervalEventMaxY += emptySpace / 2;
					}
				}
				if (actualHeight >= timelineMinHeight)
					timelineObject.height = actualHeight;
			}
		}
	},
	generateTimelineTranslateY: function() {
		const self = this;
		var plotData = DataProcessor.plotData;
		var timelineYMargin = VisualizationPane.timelineYMargin;
		var lineChartTopPadding = VisualizationPane.lineChartTopPadding;

		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var lineChartList = groupData.lineChartData;
			var timelineList = groupData.timelineData;
			var currTranslateY = 0;

			if (lineChartList.length > 0)
				currTranslateY = lineChartList[lineChartList.length - 1].translateY - lineChartTopPadding
							   + lineChartList[lineChartList.length - 1].height + timelineYMargin;

			for (var j = 0; j < timelineList.length; j++) {
				var prevTimelineObject = (j == 0) ? null : timelineList[j - 1];
				var currTimelineObject = timelineList[j];
				if (j == 0)	currTranslateY += 0 - currTimelineObject.pointEventMinY;
				else currTranslateY += (prevTimelineObject.intervalEventMaxY - 0) 
								     + timelineYMargin + (0 - currTimelineObject.pointEventMinY);
				currTimelineObject.translateY = currTranslateY;
			}
		}
	},

	// helpers

	createEventAttrHighlightObject: function(oldHighlightObject) {
		const self = this;
		var newHighlightObject = {};
		var highlightAttributeName = oldHighlightObject.eventAttributeName;
		var highlightAttributeType = oldHighlightObject.eventAttributeType;

		if (highlightAttributeType == 'categorical') {
			var selectedCategories = oldHighlightObject.selectedCategories;
			newHighlightObject.attributeName = highlightAttributeName;
			newHighlightObject.attributeType = highlightAttributeType;
			newHighlightObject.categories = self.createObjectFromList(selectedCategories);
		}
		else if (highlightAttributeType == 'numerical' || highlightAttributeType == 'nominal') {
			var selectedRange = oldHighlightObject.selectedRange;
			newHighlightObject.attributeName = highlightAttributeName;
			newHighlightObject.attributeType = highlightAttributeType;
			newHighlightObject.range = selectedRange;
		}

		return newHighlightObject;
	},
	createEventAttrAttrHighlightObject: function(oldHighlightObject) {
		const self = this;
		var newHighlightObject = {};
		var highlightAttributeName = oldHighlightObject.eventAttributeName;
		var highlightAttributeType = oldHighlightObject.eventAttributeType;
		var highlightAttrAttrName = oldHighlightObject.eventAttributeAttributeName;
		var highlightAttrAttrType = oldHighlightObject.eventAttributeAttributeType;
		var highlightEntityKey = oldHighlightObject.entityKey;
		var entityData = Database.rawData.entityData[highlightEntityKey];

		if (highlightAttrAttrType == 'categorical') {
			var selectedCategories = oldHighlightObject.selectedCategories;
			var nameListObject = {};

			for (var i = 0; i < entityData.length; i++) {
				var row = entityData[i];
				var value = row[highlightAttrAttrName];
				var valueInList = selectedCategories.indexOf(value) != -1;
				if (valueInList) nameListObject[row.name] = null;
			}

			newHighlightObject.attributeName = highlightAttributeName;
			newHighlightObject.attributeType = highlightAttributeType;
			newHighlightObject.categories = nameListObject;
		}
		else if (highlightAttrAttrType == 'numerical' || highlightAttrAttrType == 'nominal') {
			var selectedRange = oldHighlightObject.selectedRange;
			var nameListObject = {};

			for (var i = 0; i < entityData.length; i++) {
				var row = entityData[i];
				var value = row[highlightAttrAttrName];
				var valueInRange = value >= selectedRange[0] && value <= selectedRange[1];
				if (valueInRange) nameListObject[row.name] = null;
			}

			newHighlightObject.attributeName = highlightAttributeName;
			newHighlightObject.attributeType = highlightAttributeType;
			newHighlightObject.categories = nameListObject;
		}
	},
	createObjectFromList: function(list) {
		var newObject = {};

		for (var i = 0; i < list.length; i++)
			newObject[list[i]] = null;

		return newObject;
	},
	checkIfIsHighlighted: function(eventRow) {
		const self = this;
		var eventName = eventRow.eventName;
		var currentEventHighlightList = self.eventHighlightList[eventName];
		var satisfyAllHighlights = true;

		for (var i = 0; i < currentEventHighlightList.length; i++) {
			var currentHighlight = currentEventHighlightList[i];
			var highlightAttributeName = currentHighlight.attributeName;
			var highlightAttributeType = currentHighlight.attributeType;
			var rowValue = eventRow[highlightAttributeName];
			var rowValueIsMissing = rowValue === null;

			if (rowValueIsMissing) {
				satisfyAllHighlights = false; break;
			}
			if (highlightAttributeType == 'categorical') {
				var selectedCategories = currentHighlight.categories;
				var valueInList = rowValue in selectedCategories;
				if (!valueInList) { satisfyAllHighlights = false; break; }
			}
			else if (highlightAttributeType == 'numerical' || highlightAttributeType == 'nominal') {
				var selectedRange = currentHighlight.range;
				var valueInRange = rowValue >= selectedRange[0] && rowValue <= selectedRange[1];
				if (!valueInRange) { satisfyAllHighlights = false; break; }
			}
		}

		return satisfyAllHighlights;
	}
}