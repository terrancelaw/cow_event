const DataProcessingGrouper = {
	generate: function() {
		const self = this;

		self.gatherDataForEachCountry();
		self.gatherDataForEachGroup();
		self.removeGroupWithNoData();
	},
	gatherDataForEachCountry: function() {
		var countryData = Database.rawData.entityData.country;
		var filteredData = DataProcessor.filteredData;
		var filteredDataByCountry = {};
		var IDFilterObject = DataProcessingFilter.createIDFilterObject();

		// init
		for (var i = 0; i < countryData.length; i++) {
			var row = countryData[i];
			var ID = row.ID;
			var countryShown = (IDFilterObject === null)
						    || (ID in IDFilterObject.categories);

			if (!countryShown) continue;
			filteredDataByCountry[ID] = {};
			filteredDataByCountry[ID].data = row;

			for (var dataType in filteredData) {
				filteredDataByCountry[ID][dataType] = {};
				for (var dataName in filteredData[dataType])
					filteredDataByCountry[ID][dataType][dataName] = [];
			}
		}

		// sort time series data into groups
		for (var timeSeriesName in filteredData.timeSeriesData)
			for (var i = 0; i < filteredData.timeSeriesData[timeSeriesName].length; i++) {
				var row = filteredData.timeSeriesData[timeSeriesName][i];
				var ID = row.ID;
				var dataType = 'timeSeriesData';
				var dataName = timeSeriesName;
				filteredDataByCountry[ID][dataType][dataName].push(row);
			}

		// sort event data into groups
		for (var eventName in filteredData.eventData)
			for (var i = 0; i < filteredData.eventData[eventName].length; i++) {
				var row = filteredData.eventData[eventName][i];
				var ID = row.ID;
				var dataType = 'eventData';
				var dataName = eventName;
				filteredDataByCountry[ID][dataType][dataName].push(row);
			}

		DataProcessor.filteredDataByGroup = filteredDataByCountry;
	},
	gatherDataForEachGroup: function() {
		const self = this;
		var filteredData = DataProcessor.filteredData;
		var filteredDataByCountry = DataProcessor.filteredDataByGroup;
		var groupFilterList = self.createGroupFilterList();
		var noGroupFilters = jQuery.isEmptyObject(groupFilterList);
		var filteredDataByCountryByGroup = {};
		var filteredDataByGroup = {};

		// handle no group filter case
		if (noGroupFilters) {
			for (var ID in filteredDataByCountry) {
				var row = filteredDataByCountry[ID].data;
				var countryName = row.name;
				filteredDataByGroup[countryName] = {};
				filteredDataByGroup[countryName].timeSeriesData = filteredDataByCountry[ID].timeSeriesData;
				filteredDataByGroup[countryName].eventData = filteredDataByCountry[ID].eventData;
			}
			DataProcessor.filteredDataByGroup = filteredDataByGroup;
			return;
		}

		// init filteredDataByCountryByGroup
		for (var groupName in groupFilterList)
			filteredDataByCountryByGroup[groupName] = [];

		// create filteredDataByCountryByGroup
		for (var ID in filteredDataByCountry) {
			var countryFilteredData = filteredDataByCountry[ID];
			var row = filteredDataByCountry[ID].data;

			for (var groupName in groupFilterList) {
				var filter = groupFilterList[groupName];
				var satisfyFilter = true;

				for (var j = 0; j < filter.length; j++) {
					var criteria = filter[j];
					var attributeName = criteria.attributeName;
					var attributeType = criteria.attributeType;
					var rowValue = row[attributeName];
					var rowValueIsMissing = rowValue === null;

					if (rowValueIsMissing) {
						satisfyFilter = false; break;
					}
					if (attributeType == 'categorical') {
						if (rowValue != criteria.category) {
							satisfyFilter = false; break;
						}
					}
					else if (attributeType == 'numerical' || attributeType == 'nominal') {
						if (('<=' in criteria && rowValue > criteria['<=']) ||
							('>=' in criteria && rowValue < criteria['>='])) {
							satisfyFilter = false; break;
						}
					}
				}
				if (satisfyFilter) {
					filteredDataByCountryByGroup[groupName].push(countryFilteredData);
					break; // the groups are disjoint, break once found
				}
			}
		}

		// init filteredDataByGroup
		for (var groupName in filteredDataByCountryByGroup)
			if (filteredDataByCountryByGroup[groupName].length != 0) { // not empty group (any country belong to the group?)
				filteredDataByGroup[groupName] = {};
				for (var dataType in filteredData) {
					filteredDataByGroup[groupName][dataType] = {};
					for (var dataName in filteredData[dataType])
						filteredDataByGroup[groupName][dataType][dataName] = [];
				}
			}

		// create filteredDataByGroup
		for (var groupName in filteredDataByGroup)
			for (var dataType in filteredDataByGroup[groupName])
				for (var dataName in filteredDataByGroup[groupName][dataType]) {
					var countryList = filteredDataByCountryByGroup[groupName];

					for (var i = 0; i < countryList.length; i++) {
						var countryDataList = countryList[i][dataType][dataName];

						for (var j = 0; j < countryDataList.length; j++)
							filteredDataByGroup[groupName][dataType][dataName].push(countryDataList[j]);
					}
				}

		DataProcessor.filteredDataByGroup = filteredDataByGroup;
	},
	removeGroupWithNoData: function() {
		var removeTimelineWithNoData = State.removeTimelineWithNoData;
		var filteredDataByGroup = DataProcessor.filteredDataByGroup;

		if (removeTimelineWithNoData)
			for (var groupName in filteredDataByGroup) {
				var currentGroupHasNoData = true;

				for (var dataType in filteredDataByGroup[groupName])
					for (var dataName in filteredDataByGroup[groupName][dataType])
						if (filteredDataByGroup[groupName][dataType][dataName].length > 0) {
							currentGroupHasNoData = false; break;
						}

				if (currentGroupHasNoData)
					delete filteredDataByGroup[groupName];
			}
	},

	// create filters

	createGroupFilterList: function() {
		const self = this;
		var groupAttributeList = State.group;
		var groupFilterListArray = [ [] ];
		var groupFilterListObject = {};

		// create groupFilterListArray
		for (var i = 0; i < groupAttributeList.length; i++) {
			var groupAttributeData = groupAttributeList[i].data;
			var attributeName = groupAttributeData.attributeName;
			var attributeType = groupAttributeData.attributeType;
			var newGroupFilterListArray = [];

			if (attributeType == 'categorical') {
				for (var j = 0; j < groupAttributeData.categories.length; j++) {
					var category = groupAttributeData.categories[j];
					var newCriteria = { attributeName: attributeName, attributeType: attributeType, category: category };

					for (var k = 0; k < groupFilterListArray.length; k++) {
						var oldFilter = groupFilterListArray[k];
						var newFilter = self.createShallowCopyForList(oldFilter, newCriteria);
						newGroupFilterListArray.push(newFilter);
					}
				}
			}
			else if (attributeType == 'numerical' || attributeType == 'nominal') {
				var min = groupAttributeData.range[0];
				var max = groupAttributeData.range[1];
				var mid = (min + max) / 2;
				var lessThanCriteria = { attributeName: attributeName, attributeType: attributeType, '<=': mid };
				var greaterThanCriteria = { attributeName: attributeName, attributeType: attributeType, '>=': mid };

				for (var k = 0; k < groupFilterListArray.length; k++) {
					var oldFilter = groupFilterListArray[k];
					var lessThanFilter = self.createShallowCopyForList(oldFilter, lessThanCriteria);
					var greaterThanFilter = self.createShallowCopyForList(oldFilter, greaterThanCriteria);
					newGroupFilterListArray.push(lessThanFilter);
					newGroupFilterListArray.push(greaterThanFilter);
				}
			}

			groupFilterListArray = newGroupFilterListArray;
		}

		// create groupFilterListObject
		for (var i = 0; i < groupFilterListArray.length; i++) {
			var currentFilter = groupFilterListArray[i];
			var groupName = self.generateGroupName(currentFilter);
			if (currentFilter.length == 0) continue;
			else groupFilterListObject[groupName] = currentFilter;
		}

		return groupFilterListObject;	
	},

	// helpers

	createShallowCopyForList: function(list, newItem) {
		var newList = [];

		for (var i = 0; i < list.length; i++)
			newList.push(list[i]);

		newList.push(newItem);
		return newList;
	},
	generateGroupName: function(filter) {
		var groupName = '';

		for (var i = 0; i < filter.length; i++) {
			var attributeType = filter[i].attributeType;

			if (attributeType == 'categorical') {
				var attributeName = filter[i].attributeName;
				var category = filter[i].category;
				groupName += attributeName + ' = ' + category;
			}
			else if (attributeType == 'numerical' || attributeType == 'nominal') {
				var attributeName = filter[i].attributeName;
				if ('<=' in filter[i]) groupName += attributeName + ' ≤ ' + filter[i]['<='];
				if ('>=' in filter[i]) groupName += attributeName + ' ≥ ' + filter[i]['>='];
			}
			if (i != filter.length - 1)
				groupName += ', ';
		}

		return groupName;
	}
}