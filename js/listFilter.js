const ListFilter = {
	clickSelectAll: function(filterCapsuleEl) { // handle searching that leads to fewer categories
		const self = this;
		var filterContentEl = $(filterCapsuleEl).find('.content')[0];
		var filterObject = d3.select(filterCapsuleEl).datum();
		var allCategoryList = filterObject.categories;
		var filteredCategoryList = filterObject.filteredCategories;

		// check all, get new filtered list, determine is filtered
		$(filterContentEl).find('.category > .round-check-box > input').prop('checked', true);
		$(filterContentEl).find('.category').each(function() {
			var categoryName = d3.select(this).datum();
			var categoryIsChecked = $(this).find('.round-check-box > input').prop('checked');
			if (categoryIsChecked) {
				var categoryFoundInFilteredList = filteredCategoryList.indexOf(categoryName) != -1;
				if (!categoryFoundInFilteredList) filteredCategoryList.push(categoryName);
			}
		});
		filterObject.filteredCategories = self.copyFilteredCategoriesInOrder(
			allCategoryList, filteredCategoryList
		); // ensure order always the same
		isFiltered = self.checkIfIsFiltered(filterObject);

		if (isFiltered) {
			$(filterCapsuleEl).addClass('filtered');
			filterObject.isFiltered = true;
			State.addFilterState(filterObject);
		}

		else if (!isFiltered) {
			$(filterCapsuleEl).removeClass('filtered');
			filterObject.isFiltered = false;
			State.removeFilterState(filterObject);
		}
	},
	clickSelectNone: function(filterCapsuleEl) { // handle searching that leads to fewer categories
		const self = this;
		var filterContentEl = $(filterCapsuleEl).find('.content')[0];
		var filterObject = d3.select(filterCapsuleEl).datum();
		var allCategoryList = filterObject.categories;
		var filteredCategoryList = filterObject.filteredCategories;

		// uncheck all, get new filtered list, determine is filtered
		$(filterContentEl).find('.category > .round-check-box > input').prop('checked', false);
		$(filterContentEl).find('.category').each(function() {
			var categoryName = d3.select(this).datum();
			var categoryIsChecked = $(this).find('.round-check-box > input').prop('checked');
			if (!categoryIsChecked) {
				var index = filteredCategoryList.indexOf(categoryName);;
				var categoryFoundInFilteredList = index != -1;
				if (categoryFoundInFilteredList) filteredCategoryList.splice(index, 1);
			}
		});
		isFiltered = self.checkIfIsFiltered(filterObject);

		if (isFiltered) {
			$(filterCapsuleEl).addClass('filtered');
			filterObject.isFiltered = true;
			State.addFilterState(filterObject);
		}

		else if (!isFiltered) {
			$(filterCapsuleEl).removeClass('filtered');
			filterObject.isFiltered = false;
			State.removeFilterState(filterObject);
		}
	},
	clickCategory: function(filterCapsuleEl, categoryEl) {
		const self = this;
		var needToSelect = !$(categoryEl).find('.round-check-box > input').prop('checked');
		var categoryName = d3.select(categoryEl).datum();
		var filterObject = d3.select(filterCapsuleEl).datum();
		var allCategoryList = filterObject.categories;
		var filteredCategoryList = filterObject.filteredCategories;
		var isFiltered = null;

		if (needToSelect) {
			$(categoryEl).find('.round-check-box > input').prop('checked', true);
			filteredCategoryList.push(categoryName);
			filterObject.filteredCategories = self.copyFilteredCategoriesInOrder(
				allCategoryList, filteredCategoryList
			); // ensure order always the same
			isFiltered = self.checkIfIsFiltered(filterObject);
		}

		else if (!needToSelect) {
			var index = filteredCategoryList.indexOf(categoryName);
			$(categoryEl).find('.round-check-box > input').prop('checked', false);
			filterObject.filteredCategories.splice(index, 1);
			isFiltered = self.checkIfIsFiltered(filterObject);
		}

		if (isFiltered) {
			$(filterCapsuleEl).addClass('filtered');
			filterObject.isFiltered = true;
			State.addFilterState(filterObject);
		}

		else if (!isFiltered) {
			$(filterCapsuleEl).removeClass('filtered');
			filterObject.isFiltered = false;
			State.removeFilterState(filterObject);
		}
	},

	// helpers

	copyFilteredCategoriesInOrder: function(allCategoryList, filteredCategoryList) {
		const self = this;
		var newFilteredCategoryList = [];

		for (var i = 0; i < allCategoryList.length; i++) {
			var categoryName = allCategoryList[i];
			var categoryNameFound = filteredCategoryList.indexOf(categoryName) != -1;
			if (categoryNameFound) newFilteredCategoryList.push(categoryName);
		}

		return newFilteredCategoryList;
	},
	checkIfIsFiltered: function(filterObject) {
		var allCategoryList = filterObject.categories;
		var filteredCategoryList = filterObject.filteredCategories;
		var filteredCategoryListHasAllCategories = true;

		for (var i = 0; i < allCategoryList.length; i++) {
			var categoryName = allCategoryList[i];
			var categoryNameFound = filteredCategoryList.indexOf(categoryName) != -1;
			if (!categoryNameFound) { filteredCategoryListHasAllCategories = false; break; }
		}

		return !filteredCategoryListHasAllCategories;
	}
}