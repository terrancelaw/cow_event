const DataProcessingFilter = {
	generate: function() {
		const self = this;

		self.filterTimeSeriesData();
		self.filterEventData();
	},
	filterTimeSeriesData: function() {
		const self = this;
		var timeSeriesData = DataProcessor.filteredData.timeSeriesData;
		var timeSeriesFilterList = self.createTimeSeriesFilterList();

		if (timeSeriesFilterList.length == 0)
			return;

		for (var timeSeriesName in timeSeriesData) {
			var originalData = timeSeriesData[timeSeriesName];
			var filteredData = [];

			for (var i = 0; i < originalData.length; i++) {
				var row = originalData[i];
				var satisfyAllFilters = true;

				for (var j = 0; j < timeSeriesFilterList.length; j++) {
					var currentFilter = timeSeriesFilterList[j];
					var filterAttributeName = currentFilter.attributeName; // must be ID
					var filterCategories = currentFilter.categories;
					var rowValue = row[filterAttributeName];
					if (!(rowValue in filterCategories)) { satisfyAllFilters = false; break; }
				}

				if (satisfyAllFilters)
					filteredData.push(row);
			}

			timeSeriesData[timeSeriesName] = filteredData;
		}
	},
	filterEventData: function() {
		const self = this;
		var eventData = DataProcessor.filteredData.eventData;
		var eventFilterList = self.createEventFilterList();

		for (var eventName in eventData) {
			var currentEventFilterList = eventFilterList[eventName];
			var originalData = eventData[eventName];
			var filteredData = [];

			if (currentEventFilterList.length == 0)
				continue;

			for (var i = 0; i < originalData.length; i++) {
				var row = originalData[i];
				var satisfyAllFilters = true;

				for (var j = 0; j < currentEventFilterList.length; j++) {
					var currentFilter = currentEventFilterList[j];
					var filterAttributeName = currentFilter.attributeName;
					var filterAttributeType = currentFilter.attributeType;
					var rowValue = row[filterAttributeName];
					var rowValueIsMissing = rowValue === null;

					if (rowValueIsMissing) {
						satisfyAllFilters = false; break;
					}
					if (filterAttributeType == 'categorical') {
						var filteredCategories = currentFilter.categories;
						var valueInList = rowValue in filteredCategories;
						if (!valueInList) { satisfyAllFilters = false; break; }
					}
					else if (filterAttributeType == 'numerical' || filterAttributeType == 'nominal') {
						var filteredRange = currentFilter.range;
						var valueInRange = rowValue >= filteredRange[0] && rowValue <= filteredRange[1];
						if (!valueInRange) { satisfyAllFilters = false; break; }
					}
				}

				if (satisfyAllFilters)
					filteredData.push(row);
			}

			eventData[eventName] = filteredData;
		}
	},

	// create filters

	createIDFilterObject: function() {
		var countryData = Database.rawData.entityData.country;
		var IDFilterObject = {
			attributeName: 'ID',
			attributeType: 'categorical',
			categories: {}
		};
		var countryFilterList = State.filter.filter(function(d) {
			return d.databaseQueryName == 'country';
		});

		if (countryFilterList.length == 0)
			return null;

		for (var i = 0; i < countryData.length; i++) {
			var countryRow = countryData[i];
			var countryID = countryRow.ID;
			var satisfyAllFilters = true;

			for (var j = 0; j < countryFilterList.length; j++) {
				var currentFilter = countryFilterList[j];
				var filterAttributeName = currentFilter.attributeName;
				var filterAttributeType = currentFilter.attributeType;
				var countryAttributeValue = countryRow[filterAttributeName];
				var valueIsMissing = countryAttributeValue === null;

				if (valueIsMissing) {
					satisfyAllFilters = false; break;
				}
				if (filterAttributeType == 'categorical') {
					var filteredCategories = currentFilter.filteredCategories;
					var valueInList = filteredCategories.indexOf(countryAttributeValue) != -1;
					if (!valueInList) { satisfyAllFilters = false; break; }
				}
				else if (filterAttributeType == 'numerical' || filterAttributeType == 'nominal') {
					var filteredRange = currentFilter.filteredRange;
					var valueInRange = countryAttributeValue >= filteredRange[0] && countryAttributeValue <= filteredRange[1];
					if (!valueInRange) { satisfyAllFilters = false; break; }
				}
			}

			if (satisfyAllFilters)
				IDFilterObject.categories[countryID] = null;
		}

		return IDFilterObject;
	},
	createTimeSeriesFilterList: function() {
		const self = this;
		var IDFilterObject = self.createIDFilterObject();

		if (IDFilterObject === null) return [];
		else if (IDFilterObject !== null) return [ IDFilterObject ];
	},
	createEventFilterList: function() {
		const self = this;
		var eventData = DataProcessor.filteredData.eventData;
		var filterList = State.filter;
		var IDFilterObject = self.createIDFilterObject();
		var eventFilterList = {};

		for (var eventName in eventData) {
			var currentEventFilterList = filterList.filter(function(d) {
				return d.databaseQueryName == eventName;
			});

			eventFilterList[eventName] = [];
			if (IDFilterObject !== null) 
				eventFilterList[eventName].push(IDFilterObject);

			for (var i = 0; i < currentEventFilterList.length; i++) {
				var oldFilterObject = currentEventFilterList[i];
				var newFilterObject = {};
				var filterEventAttribute = !('eventAttributeAttributeName' in oldFilterObject);
				var filterEventAttributeAttribute = 'eventAttributeAttributeName' in oldFilterObject;

				if (filterEventAttribute) 
					newFilterObject = self.createEventAttributeFilterObject(oldFilterObject);
				else if (filterEventAttributeAttribute)
					newFilterObject = self.createEventAttrAttrFilterObject(oldFilterObject);
				
				eventFilterList[eventName].push(newFilterObject);
			}
		}

		return eventFilterList;
	},
	createEventAttributeFilterObject: function(oldFilterObject) {
		const self = this;
		var newFilterObject = {};
		var filterAttributeName = oldFilterObject.eventAttributeName;
		var filterAttributeType = oldFilterObject.eventAttributeType;

		if (filterAttributeType == 'categorical') {
			var filteredCategories = oldFilterObject.filteredCategories;
			newFilterObject.attributeName = filterAttributeName;
			newFilterObject.attributeType = filterAttributeType;
			newFilterObject.categories = self.createObjectFromList(filteredCategories);
		}
		else if (filterAttributeType == 'numerical' || filterAttributeType == 'nominal') {
			var filteredRange = oldFilterObject.filteredRange;
			newFilterObject.attributeName = filterAttributeName;
			newFilterObject.attributeType = filterAttributeType;
			newFilterObject.range = filteredRange;
		}

		return newFilterObject;
	},
	createEventAttrAttrFilterObject: function(oldFilterObject) {
		const self = this;
		var newFilterObject = {};
		var filterAttributeName = oldFilterObject.eventAttributeName;
		var filterAttributeType = oldFilterObject.eventAttributeType;
		var filterAttrAttrName = oldFilterObject.eventAttributeAttributeName;
		var filterAttrAttrType = oldFilterObject.eventAttributeAttributeType;
		var filterEntityKey = oldFilterObject.entityKey;
		var entityData = Database.rawData.entityData[filterEntityKey];

		if (filterAttrAttrType == 'categorical') {
			var filteredCategories = oldFilterObject.filteredCategories;
			var nameListObject = {};

			for (var i = 0; i < entityData.length; i++) {
				var row = entityData[i];
				var value = row[filterAttrAttrName];
				var valueInList = filteredCategories.indexOf(value) != -1;
				if (valueInList) nameListObject[row.name] = null;
			}

			newFilterObject.attributeName = filterAttributeName;
			newFilterObject.attributeType = filterAttributeType;
			newFilterObject.categories = nameListObject;
		}
		else if (filterAttrAttrType == 'numerical' || filterAttrAttrType == 'nominal') {
			var filteredRange = oldFilterObject.filteredRange;
			var nameListObject = {};

			for (var i = 0; i < entityData.length; i++) {
				var row = entityData[i];
				var value = row[filterAttrAttrName];
				var valueInRange = value >= filteredRange[0] && value <= filteredRange[1];
				if (valueInRange) nameListObject[row.name] = null;
			}

			newFilterObject.attributeName = filterAttributeName;
			newFilterObject.attributeType = filterAttributeType;
			newFilterObject.categories = nameListObject;
		}

		return newFilterObject;
	},

	// helpers

	createObjectFromList: function(list) {
		var newObject = {};

		for (var i = 0; i < list.length; i++)
			newObject[list[i]] = null;

		return newObject;
	}
}