const RangeFilter = {
	changeSlider: function(filterCapsuleEl, slider) {
		var minValue = slider.bootstrapSlider('getAttribute', 'min');
		var maxValue = slider.bootstrapSlider('getAttribute', 'max');
		var minHandleValue = slider.bootstrapSlider('getValue')[0];
		var maxHandleValue = slider.bootstrapSlider('getValue')[1];
		var filterObject = d3.select(filterCapsuleEl).datum();
		var isFiltered = minHandleValue != minValue || maxHandleValue != maxValue;

		if (isFiltered) {
			$(filterCapsuleEl).addClass('filtered');
			filterObject.filteredRange = [ minHandleValue, maxHandleValue ];
			filterObject.isFiltered = true;
			State.addFilterState(filterObject);
		}

		else if (!isFiltered) {
			$(filterCapsuleEl).removeClass('filtered');
			filterObject.filteredRange = [ minHandleValue, maxHandleValue ];
			filterObject.isFiltered = false;
			State.removeFilterState(filterObject);
		}
	}
}