const Database = {

	rawData: {
		entityData: {},
		timeSeriesData: {},
		eventData: {}
	},

	entityList: {}, 
	timeSeriesList: [],
	eventList: [],

	fileNameToEventNames: {}, // { reactor_interval_events.csv ... }
	eventNameToStageAttrData: {}, // { stageDataList }
	eventNameToStageAttrName: {}, // { planningStartYear ... }

	loadData: function(callback) {
		const self = this;

		var entityFilePromiseList = self.createPromiseList(
			'data/entities/',
			Configuration.entityFileList
		);
		var timeSeriesFilePromiseList = self.createPromiseList(
			'data/time_series/',
			Configuration.timeSeriesFileList
		);
		var eventFilePromiseList = self.createPromiseList(
			'data/events/',
			Configuration.eventFileList
		);

		Promise.all(entityFilePromiseList).then(function(entityDataList) {
			self.loadEntityData(entityDataList);
			Promise.all(timeSeriesFilePromiseList).then(function(timeSeriesDataList) {
				self.loadTimeSeriesData(timeSeriesDataList);
				Promise.all(eventFilePromiseList).then(function(eventDataList) {
					self.loadEventData(eventDataList);

					// after data loading is done
					self.processEntityData();
					self.processTimeSeriesData();
					self.processEventData();
					callback();
				});
			});
		});
	},

	// loadEntityData

	loadEntityData: function(dataList) {
		const self = this;
		var entityFileList = Configuration.entityFileList;
		var entityData = {};

		for (var i = 0; i < dataList.length; i++) {
			var fileName = entityFileList[i];
			var key = fileName.replace('.csv', '');
			var data = dataList[i];

			key = pluralize.singular(key);
			entityData[key] = data;
		}

		self.rawData.entityData = entityData;
	},

	// loadTimeSeriesData

	loadTimeSeriesData: function(dataList) {
		const self = this;
		var timeSeriesData = {};

		for (var i = 0; i < dataList.length; i++)
			for (var j = 2; j < dataList[i].columns.length; j++) {
				var key = dataList[i].columns[j];
				var data = dataList[i];
				timeSeriesData[key] = data;
			}

		self.rawData.timeSeriesData = timeSeriesData;
	},

	// loadEventData

	loadEventData: function(dataList) {
		const self = this;

		self.generateFileNameToEventNames(dataList);
		self.generateEventNameToStageAttrName();
		self.generateEventNameToStageAttrData();
		self.generateRawEventData(dataList);
	},
	generateFileNameToEventNames: function(dataList) {
		const self = this;
		var eventFileList = Configuration.eventFileList;
		var fileNameToEventNames = {};

		for (var i = 0; i < dataList.length; i++) {
			var fileName = eventFileList[i];
			var data = dataList[i];
			fileNameToEventNames[fileName] = {};

			for (var j = 0; j < data.length; j++) {
				var eventRow = data[j];
				var eventName = eventRow.eventName;
				fileNameToEventNames[fileName][eventName] = null;
			}
		}

		self.fileNameToEventNames = fileNameToEventNames;
	},
	generateEventNameToStageAttrName: function() {
		const self = this;
		var fileNameToEventNames = self.fileNameToEventNames;
		var eventFileData = Configuration.eventFileData;
		var eventNameToStageAttrName = {};

		for (var fileName in eventFileData) {
			var stageDataList = eventFileData[fileName].stageDataList;

			for (var eventName in fileNameToEventNames[fileName]) {
				eventNameToStageAttrName[eventName] = {};

				for (var i = 0; i < stageDataList.length; i++) {
					var startYearAttr = stageDataList[i].startYear;
					var endYearAttr = stageDataList[i].endYear;
					eventNameToStageAttrName[eventName][startYearAttr] = null;
					eventNameToStageAttrName[eventName][endYearAttr] = null;
				}
			}
		}

		self.eventNameToStageAttrName = eventNameToStageAttrName;
	},
	generateEventNameToStageAttrData: function() {
		const self = this;
		var fileNameToEventNames = self.fileNameToEventNames;
		var eventFileData = Configuration.eventFileData;
		var eventNameToStageAttrData = {};

		for (var fileName in eventFileData) {
			var stageDataList = eventFileData[fileName].stageDataList;

			for (var eventName in fileNameToEventNames[fileName])
				eventNameToStageAttrData[eventName] = stageDataList;
		}

		self.eventNameToStageAttrData = eventNameToStageAttrData;
	},
	generateRawEventData: function(dataList) {
		const self = this;
		var fileNameToEventNames = self.fileNameToEventNames;
		var eventData = {};

		for (var fileName in fileNameToEventNames)
			for (var eventName in fileNameToEventNames[fileName])
				eventData[eventName] = [];

		for (var i = 0; i < dataList.length; i++)
			for (var j = 0; j < dataList[i].length; j++) {
				var eventRow = dataList[i][j];
				var eventName = eventRow.eventName;
				eventData[eventName].push(eventRow);
			}

		self.rawData.eventData = eventData;
	},

	// processEntityData

	processEntityData: function() {
		const self = this;

		self.generateAttributeListForEachEntity();
		self.gatherMetadataForEachAttribute();
		self.preprecessEntityData();
	},
	generateAttributeListForEachEntity: function() {
		const self = this;
		var entityData = self.rawData.entityData;
		var entityList = {};

		for (var entityName in entityData) {
			entityList[entityName] = [];

			for (var i = 0; i < entityData[entityName].columns.length; i++) {
				var attributeName = entityData[entityName].columns[i];
				var attributeObject = { attributeName: attributeName };

				if (attributeName !== 'ID') // skipping ID
					entityList[entityName].push(attributeObject);
			}
		}

		self.entityList = entityList;
	},
	gatherMetadataForEachAttribute: function() {
		const self = this;
		var entityData = self.rawData.entityData;
		var entityList = self.entityList;

		for (var entityName in entityList)
			for (var i = 0; i < entityList[entityName].length; i++) {
				var attributeObject = entityList[entityName][i];
				var attributeName = attributeObject.attributeName;
				var data = entityData[entityName];

				var uniqueValueList = self.getUniqueValueList(data, attributeName);
				var allValuesAreNumbers = self.checkIfAllValuesAreNumbers(uniqueValueList); // convert to numbers if needed
				var numberOfUniqueValues = uniqueValueList.length;

				// save metadata for numerical
				if (numberOfUniqueValues > 10 && allValuesAreNumbers) {
					attributeObject.attributeType = 'numerical';
					attributeObject.range = d3.extent(uniqueValueList);
				}

				// save metadata for nominal
				else if (numberOfUniqueValues <= 10 && allValuesAreNumbers) {
					attributeObject.attributeType = 'nominal';
					attributeObject.levels = uniqueValueList;
				}

				// save metadata for categorical
				else if (!allValuesAreNumbers) {
					attributeObject.attributeType = 'categorical';
					attributeObject.categories = uniqueValueList;
				}
			}
	},
	preprecessEntityData: function() { // handle null and convert to numbers
		const self = this;
		var entityData = self.rawData.entityData;
		var entityList = self.entityList;

		for (var entityName in entityList)
			for (var i = 0; i < entityList[entityName].length; i++) {
				var attributeObject = entityList[entityName][i];
				var attributeName = attributeObject.attributeName;
				var attributeType = attributeObject.attributeType;
				var data = entityData[entityName];

				if (attributeType == 'categorical')
					for (var j = 0; j < data.length; j++) {
						var currentRow = data[j];
						var currentValue = currentRow[attributeName];
						var currentValueIsMissing = currentValue === '';
						if (currentValueIsMissing) currentRow[attributeName] = null;
					}
				else if (attributeType == 'numerical' || attributeType == 'nominal')
					for (var j = 0; j < data.length; j++) {
						var currentRow = data[j];
						var currentValue = currentRow[attributeName];
						var currentValueIsMissing = currentValue === '';
						if (currentValueIsMissing) currentRow[attributeName] = null;
						else currentRow[attributeName] = +currentRow[attributeName];
					}
			}
	},

	// processTimeSeriesData

	processTimeSeriesData: function() {
		const self = this;

		self.generateTimeSeriesList();
		self.preprocessTimeSeriesData();
		self.gatherMetadataForEachTimeSeries();
	},
	generateTimeSeriesList: function() {
		const self = this;
		var timeSeriesData = self.rawData.timeSeriesData;
		var timeSeriesList = [];

		for (timeSeriesName in timeSeriesData) {
			var timeSeriesObject = { timeSeriesName: timeSeriesName };
			timeSeriesList.push(timeSeriesObject);
		}

		self.timeSeriesList = timeSeriesList;
	},
	preprocessTimeSeriesData: function() {
		const self = this;
		var timeSeriesData = self.rawData.timeSeriesData;
		var timeSeriesList = self.timeSeriesList;

		for (var i = 0; i < timeSeriesList.length; i++) {
			var timeSeriesObject = timeSeriesList[i];
			var timeSeriesName = timeSeriesObject.timeSeriesName;
			var data = timeSeriesData[timeSeriesName];

			for (var j = 0; j < data.length; j++) {
				var currentRow = data[j];
				var currentValue = currentRow[timeSeriesName];
				var currentValueIsMissing = currentValue === '';
				currentRow.year = +currentRow.year;
				if (currentValueIsMissing) currentRow[timeSeriesName] = null;
				else currentRow[timeSeriesName] = +currentRow[timeSeriesName];
			}
		}
	},
	gatherMetadataForEachTimeSeries: function() {
		const self = this;
		var timeSeriesData = self.rawData.timeSeriesData;
		var timeSeriesList = self.timeSeriesList;

		for (var i = 0; i < timeSeriesList.length; i++) {
			var timeSeriesObject = timeSeriesList[i];
			var timeSeriesName = timeSeriesObject.timeSeriesName;
			var data = timeSeriesData[timeSeriesName];
			var yearRange = d3.extent(data, function(d) { return d.year });
			var valueRange = d3.extent(data, function(d) { return d[timeSeriesName] });
			timeSeriesObject.yearRange = yearRange;
			timeSeriesObject.valueRange = valueRange;
		}
	},

	// processEventData

	processEventData: function() {
		const self = this;

		self.generateEventList();
		self.gatherEventAttribute();
		self.gatherEventAttributeMetadata();
		self.gatherEventAttributeAttribute();
		self.preprocessEventID();
		self.preprocessStartAndEndYear();
		self.preprocessOtherAttr();
		self.preprocessStageAttr();
	},
	generateEventList: function() {
		const self = this;
		var eventData = self.rawData.eventData;
		var eventList = [];
		var eventNameToStageAttrData = self.eventNameToStageAttrData;

		for (var eventName in eventData) {
			var stageAttrData = eventNameToStageAttrData[eventName];
			var isIntervalEvent = stageAttrData.length > 0;
			var eventType = isIntervalEvent ? 'interval' : 'point';
			var eventObject = { eventName: eventName, eventType: eventType };
			eventList.push(eventObject);
		}

		self.eventList = eventList;
	},
	gatherEventAttribute: function() {
		const self = this;
		var eventData = self.rawData.eventData;
		var eventList = self.eventList;
		var eventNameToStageAttrName = self.eventNameToStageAttrName;

		for (var i = 0; i < eventList.length; i++) {
			var eventObject = eventList[i];
			var eventName = eventObject.eventName;
			var data = eventData[eventName];
			var stageAttrNameList = eventNameToStageAttrName[eventName];
			var eventAttributeList = Object.keys(data[0]);

			eventObject.eventAttributeList = [];

			for (var j = 0; j < eventAttributeList.length; j++)
				if (eventAttributeList[j] != 'ID' && 
					eventAttributeList[j] != 'startYear' &&
					eventAttributeList[j] != 'endYear' &&
					eventAttributeList[j] != 'eventName' &&
					!(eventAttributeList[j] in stageAttrNameList)) {
					var eventAttributeName = eventAttributeList[j];
					var eventAttributeObject = { eventAttributeName: eventAttributeName };
					eventObject.eventAttributeList.push(eventAttributeObject);
				}
		}
	},
	gatherEventAttributeMetadata: function() {
		const self = this;
		var eventData = self.rawData.eventData;
		var eventList = self.eventList;

		for (var i = 0; i < eventList.length; i++) {
			var eventObject = eventList[i];
			var eventName = eventObject.eventName;
			var eventAttributeList = eventObject.eventAttributeList;
			var data = eventData[eventName];

			for (var j = 0; j < eventAttributeList.length; j++) {
				var eventAttributeObject = eventAttributeList[j];
				var eventAttributeName = eventAttributeObject.eventAttributeName;

				var uniqueValueList = self.getUniqueValueList(data, eventAttributeName);
				var allValuesAreNumbers = self.checkIfAllValuesAreNumbers(uniqueValueList); // convert to numbers if needed
				var numberOfUniqueValues = uniqueValueList.length;

				// save metadata for numerical
				if (numberOfUniqueValues > 5 && allValuesAreNumbers) {
					eventAttributeObject.eventAttributeType = 'numerical';
					eventAttributeObject.range = d3.extent(uniqueValueList);
					eventAttributeObject.parentEventData = eventObject;
				}

				// save metadata for nominal
				if (numberOfUniqueValues <= 5 && allValuesAreNumbers) {
					eventAttributeObject.eventAttributeType = 'nominal';
					eventAttributeObject.levels = uniqueValueList;
					eventAttributeObject.parentEventData = eventObject;
				}

				// save metadata for categorical
				if (!allValuesAreNumbers) {
					eventAttributeObject.eventAttributeType = 'categorical';
					eventAttributeObject.categories = uniqueValueList;
					eventAttributeObject.parentEventData = eventObject;
				}
			}
		}
	},
	gatherEventAttributeAttribute: function() {
		const self = this;
		var eventData = self.rawData.eventData;
		var eventList = self.eventList;
		var entityList = self.entityList;

		for (var i = 0; i < eventList.length; i++) {
			var eventObject = eventList[i];
			var eventAttributeList = eventObject.eventAttributeList;

			for (var j = 0; j < eventAttributeList.length; j++) {
				var eventAttributeObject = eventAttributeList[j];
				var eventAttributeName = eventAttributeObject.eventAttributeName;
				var matchedEntityKey = self.matchAttributeNameWithEntityKey(eventAttributeName, entityList);

				eventAttributeObject.eventAttributeAttributeList = [];

				if (matchedEntityKey !== null) {
					var eventAttrUniqueValueList = ('categories' in eventAttributeObject) ? eventAttributeObject.categories : null;
					var entityUniqueValueList = self.searchObjectList(entityList[matchedEntityKey], 'attributeName', 'name').categories;
					var allValuesAreEntityCategories = eventAttrUniqueValueList === null ? false : true;
					var entityAttributeList = self.entityList[matchedEntityKey];
					var shallowCopiedEntityAttrList = null;

					for (var k = 0; k < eventAttrUniqueValueList.length; k++)
						if (entityUniqueValueList.indexOf(eventAttrUniqueValueList[k]) == -1) {
							allValuesAreEntityCategories = false; break;
						}

					if (allValuesAreEntityCategories) {
						shallowCopiedEntityAttrList = self.shallowCopyObjectList(entityAttributeList, { parentEventAttributeData: eventAttributeObject });
						self.searchObjectList(shallowCopiedEntityAttrList, 'attributeName', 'name').categories = self.shallowCopyList(eventAttrUniqueValueList); // remove redundant names
						eventAttributeObject.eventAttributeAttributeList = shallowCopiedEntityAttrList;
						eventAttributeObject.entityKey = matchedEntityKey;
					}
				}
			}
		}
	},
	preprocessEventID: function() {
		const self = this;
		var eventData = self.rawData.eventData;
		var eventList = self.eventList;
		var currentEventID = 0;

		for (var i = 0; i < eventList.length; i++) {
			var eventObject = eventList[i];
			var eventName = eventObject.eventName;
			var data = eventData[eventName];

			for (var j = 0; j < data.length; j++) { // add eventID for object constancy
				var eventRow = data[j];
				eventRow.eventID = currentEventID;
				currentEventID++;
			}
		}
	},
	preprocessStartAndEndYear: function() {
		const self = this;
		var eventData = self.rawData.eventData;
		var eventList = self.eventList;
		var eventNameToStageAttrName = self.eventNameToStageAttrName;

		for (var i = 0; i < eventList.length; i++) {
			var eventObject = eventList[i];
			var eventName = eventObject.eventName;
			var eventType = eventObject.eventType;
			var data = eventData[eventName];

			if (eventType == 'point')
				for (var j = 0; j < data.length; j++) {
					var eventRow = data[j];
					var startYearIsMissing = eventRow.startYear == '';
					var endYearIsMissing = eventRow.endYear == '';
					if (startYearIsMissing) eventRow.startYear = null
					else eventRow.startYear = +eventRow.startYear;
					if (endYearIsMissing) eventRow.endYear = null;
					else eventRow.endYear = +eventRow.endYear;
				}

			else if (eventType == 'interval')
				for (var stageAttrName in eventNameToStageAttrName[eventName])
					for (var j = 0; j < data.length; j++) {
						var eventRow = data[j];
						var currentValue = eventRow[stageAttrName];
						var currentValueIsMissing = currentValue === '';
						if (currentValueIsMissing) eventRow[stageAttrName] = null;
						else eventRow[stageAttrName] = +eventRow[stageAttrName];
					}
		}
	},
	preprocessOtherAttr: function() {
		const self = this;
		var eventData = self.rawData.eventData;
		var eventList = self.eventList;

		for (var i = 0; i < eventList.length; i++) {
			var eventObject = eventList[i];
			var eventName = eventObject.eventName;
			var eventAttributeList = eventObject.eventAttributeList;
			var data = eventData[eventName];

			for (var j = 0; j < eventAttributeList.length; j++) {
				var eventAttributeObject = eventAttributeList[j];
				var eventAttributeName = eventAttributeObject.eventAttributeName;
				var eventAttributeType = eventAttributeObject.eventAttributeType;

				if (eventAttributeType == 'categorical')
					for (var k = 0; k < data.length; k++) {
						var eventRow = data[k];
						var currentValue = eventRow[eventAttributeName];
						var currentValueIsMissing = currentValue === '';
						if (currentValueIsMissing) eventRow[eventAttributeName] = null;
					}
				if (eventAttributeType == 'numerical' || eventAttributeType == 'nominal')
					for (var k = 0; k < data.length; k++) {
						var eventRow = data[k];
						var currentValue = eventRow[eventAttributeName];
						var currentValueIsMissing = currentValue === '';
						if (currentValueIsMissing) eventRow[eventAttributeName] = null;
						else eventRow[eventAttributeName] = +eventRow[eventAttributeName];
					}
			}
		}
	},
	preprocessStageAttr: function() {
		const self = this;
		var eventData = self.rawData.eventData;
		var eventList = self.eventList;
		var eventNameToStageAttrData = self.eventNameToStageAttrData;

		for (var i = 0; i < eventList.length; i++) {
			var eventObject = eventList[i];
			var eventName = eventObject.eventName;
			var eventType = eventObject.eventType;
			var eventAttributeList = eventObject.eventAttributeList;
			var stageAttrData = eventNameToStageAttrData[eventName];
			var data = eventData[eventName];

			// only add stageList for interval
			if (eventType == 'point')
				continue;

			// init stageList
			for (var j = 0; j < data.length; j++) {
				var eventRow = data[j];
				eventRow.stageList = [];
			}

			// add stage to stageList
			for (var j = 0; j < stageAttrData.length; j++) {
				var stageData = stageAttrData[j];
				var startYearAttr = stageData.startYear;
				var endYearAttr = stageData.endYear;
				var eventName = stageData.eventName;

				for (var k = 0; k < data.length; k++) {
					var eventRow = data[k];
					var startYear = eventRow[startYearAttr];
					var endYear = eventRow[endYearAttr];

					// some attr cannot directly using eventAttributeList
					// create stageRow only if the stage exists (has start and end)
					if (startYear !== null || endYear !== null) {
						var stageRow = {
							ID: eventRow.ID,
							eventID: eventRow.eventID + '-' + j,
							startYear: startYear,
							endYear: endYear,
							eventName: eventName
						};
						for (var l = 0; l < eventAttributeList.length; l++) {
							var eventAttributeObject = eventAttributeList[l];
							var eventAttributeName = eventAttributeObject.eventAttributeName;
							stageRow[eventAttributeName] = eventRow[eventAttributeName]
						}
						eventRow.stageList.push(stageRow);
					}
				}
			}
		}
	},

	// helpers

	createPromiseList: function(parentDirectoryPath, fileList) {
		var promiseList = [];

		for (var i = 0; i < fileList.length; i++) {
			var promise = d3.csv(parentDirectoryPath + fileList[i]);
			promiseList.push(promise)
		}

		return promiseList;
	},
	getUniqueValueList: function(data, attributeName) {
		var uniqueValues = {};
		var uniqueValueList = [];

		// collect unique values (including missing)
		for (var i = 0; i < data.length; i++) { 
			var value = data[i][attributeName];
			uniqueValues[value] = null;
		}

		// get uniqueValueList
		delete uniqueValues[''];
		uniqueValueList = Object.keys(uniqueValues);
		return uniqueValueList;
	},
	checkIfAllValuesAreNumbers: function(valueList) {
		var allValuesAreNumbers = true;

		for (var i = 0; i < valueList.length; i++) {
			var currentValue = valueList[i];
			var currentValueIsNumber = !isNaN(currentValue);
			if (!currentValueIsNumber) {
				allValuesAreNumbers = false;
				break;
			}
		}

		if (allValuesAreNumbers)
			for (var i = 0; i < valueList.length; i++)
				valueList[i] = +valueList[i];

		return allValuesAreNumbers;
	},
	matchAttributeNameWithEntityKey: function(attributeName, entityList) {
		for (var entityKey in entityList) {
			var entityKeyLowerCase = entityKey.toLowerCase();
			var entityKeySingular = pluralize.singular(entityKeyLowerCase);
			var entityKeyPlural = pluralize.plural(entityKeyLowerCase);
			var attributeNameLowerCase = attributeName.toLowerCase();
			if (attributeNameLowerCase.indexOf(entityKeySingular) != -1 ||
				attributeNameLowerCase.indexOf(entityKeyPlural) != -1)
				return entityKey;
		}

		return null;
	},
	searchObjectList: function(objectList, key, value) {
		for (var i = 0; i < objectList.length; i++)
			if (objectList[i][key] === value)
				return objectList[i];

		return null;
	},
	shallowCopyObjectList: function(objectList, extraData) {
		var copiedObjectList = [];

		for (var i = 0; i < objectList.length; i++) {
			var oldObject = objectList[i];
			var newObject = {};

			for (var key in oldObject) newObject[key] = oldObject[key];
			for (var key in extraData) newObject[key] = extraData[key];
			copiedObjectList.push(newObject)
		}

		return copiedObjectList;
	},
	shallowCopyList: function(list) {
		var newList = [];

		for (var i = 0; i < list.length; i++)
			newList.push(list[i]);

		return newList;
	},
	getTimeSeriesNameToObject: function() {
		const self = this;
		var timeSeriesList = self.timeSeriesList;
		var timeSeriesNameToObject = {};

		for (var i = 0; i < timeSeriesList.length; i++) {
			var timeSeriesObject = timeSeriesList[i];
			var timeSeriesName = timeSeriesObject.timeSeriesName;
			timeSeriesNameToObject[timeSeriesName] = timeSeriesObject;
		}

		return timeSeriesNameToObject;
	}
};