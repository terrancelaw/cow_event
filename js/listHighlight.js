const ListHighlight = {
	clickSelectAll: function(highlightCapsuleEl) { // handle searching that leads to fewer categories
		const self = this;
		var highlightContentEl = $(highlightCapsuleEl).find('.content')[0];
		var highlightObject = d3.select(highlightCapsuleEl).datum();
		var allCategoryList = highlightObject.categories;
		var selectedCategoryList = highlightObject.selectedCategories;

		// check all, get new selected list, determine if is changed
		$(highlightContentEl).find('.category > .round-check-box > input').prop('checked', true);
		$(highlightContentEl).find('.category').each(function() {
			var categoryName = d3.select(this).datum();
			var categoryIsChecked = $(this).find('.round-check-box > input').prop('checked');
			if (categoryIsChecked) {
				var categoryFoundInSelectedList = selectedCategoryList.indexOf(categoryName) != -1;
				if (!categoryFoundInSelectedList) selectedCategoryList.push(categoryName);
			}
		});
		highlightObject.selectedCategories = self.copySelectedCategoriesInOrder(
			allCategoryList, selectedCategoryList
		); // ensure order always the same
		isChanged = self.checkIfIsChanged(highlightObject);

		if (isChanged) {
			$(highlightCapsuleEl).addClass('changed');
			highlightObject.isChanged = true;
			State.addHighlightState(highlightObject);
		}

		else if (!isChanged) {
			$(highlightCapsuleEl).removeClass('changed');
			highlightObject.isChanged = false;
			State.removeHighlightState(highlightObject);
		}
	},
	clickSelectNone: function(highlightCapsuleEl) {  // handle searching that leads to fewer categories
		const self = this;
		var highlightContentEl = $(highlightCapsuleEl).find('.content')[0];
		var highlightObject = d3.select(highlightCapsuleEl).datum();
		var allCategoryList = highlightObject.categories;
		var selectedCategoryList = highlightObject.selectedCategories;

		// uncheck all, get new selected list, determine if is selected
		$(highlightContentEl).find('.category > .round-check-box > input').prop('checked', false);
		$(highlightContentEl).find('.category').each(function() {
			var categoryName = d3.select(this).datum();
			var categoryIsChecked = $(this).find('.round-check-box > input').prop('checked');
			if (!categoryIsChecked) {
				var index = selectedCategoryList.indexOf(categoryName);;
				var categoryFoundInSelectedList = index != -1;
				if (categoryFoundInSelectedList) selectedCategoryList.splice(index, 1);
			}
		});
		isChanged = self.checkIfIsChanged(highlightObject);

		if (isChanged) {
			$(highlightCapsuleEl).addClass('changed');
			highlightObject.isChanged = true;
			State.addHighlightState(highlightObject);
		}

		else if (!isChanged) {
			$(highlightCapsuleEl).removeClass('changed');
			highlightObject.isChanged = false;
			State.removeHighlightState(highlightObject);
		}
	},
	clickCategory: function(highlightCapsuleEl, categoryEl) {
		const self = this;
		var needToSelect = !$(categoryEl).find('.round-check-box > input').prop('checked');
		var categoryName = d3.select(categoryEl).datum();
		var highlightObject = d3.select(highlightCapsuleEl).datum();
		var allCategoryList = highlightObject.categories;
		var selectedCategoryList = highlightObject.selectedCategories;
		var isChanged = null;

		if (needToSelect) {
			$(categoryEl).find('.round-check-box > input').prop('checked', true);
			selectedCategoryList.push(categoryName);
			highlightObject.selectedCategories = self.copySelectedCategoriesInOrder(
				allCategoryList, selectedCategoryList
			); // ensure order always the same
			isChanged = self.checkIfIsChanged(highlightObject);
		}

		else if (!needToSelect) {
			var index = selectedCategoryList.indexOf(categoryName);
			$(categoryEl).find('.round-check-box > input').prop('checked', false);
			highlightObject.selectedCategories.splice(index, 1);
			isChanged = self.checkIfIsChanged(highlightObject);
		}

		if (isChanged) {
			$(highlightCapsuleEl).addClass('changed');
			highlightObject.isChanged = true;
			State.addHighlightState(highlightObject);
		}

		else if (!isChanged) {
			$(highlightCapsuleEl).removeClass('changed');
			highlightObject.isChanged = false;
			State.removeHighlightState(highlightObject);
		}
	},

	// helpers

	copySelectedCategoriesInOrder: function(allCategoryList, selectedCategoryList) {
		const self = this;
		var newSelectedCategoryList = [];

		for (var i = 0; i < allCategoryList.length; i++) {
			var categoryName = allCategoryList[i];
			var categoryNameFound = selectedCategoryList.indexOf(categoryName) != -1;
			if (categoryNameFound) newSelectedCategoryList.push(categoryName);
		}

		return newSelectedCategoryList;
	},
	checkIfIsChanged: function(highlightObject) {
		var allCategoryList = highlightObject.categories;
		var selectedCategoryList = highlightObject.selectedCategories;
		var selectedCategoryListHasAllCategories = true;

		for (var i = 0; i < allCategoryList.length; i++) {
			var categoryName = allCategoryList[i];
			var categoryNameFound = selectedCategoryList.indexOf(categoryName) != -1;
			if (!categoryNameFound) { selectedCategoryListHasAllCategories = false; break; }
		}

		return !selectedCategoryListHasAllCategories;
	}
}