const RangeHighlight = {
	changeSlider: function(highlightCapsuleEl, slider) {
		var minValue = slider.bootstrapSlider('getAttribute', 'min');
		var maxValue = slider.bootstrapSlider('getAttribute', 'max');
		var minHandleValue = slider.bootstrapSlider('getValue')[0];
		var maxHandleValue = slider.bootstrapSlider('getValue')[1];
		var highlightObject = d3.select(highlightCapsuleEl).datum();
		var isChanged = minHandleValue != minValue || maxHandleValue != maxValue;

		if (isChanged) {
			$(highlightCapsuleEl).addClass('changed');
			highlightObject.selectedRange = [ minHandleValue, maxHandleValue ];
			highlightObject.isChanged = true;
			State.addHighlightState(highlightObject);
		}

		else if (!isChanged) {
			$(highlightCapsuleEl).removeClass('changed');
			highlightObject.selectedRange = [ minHandleValue, maxHandleValue ];
			highlightObject.isChanged = false;
			State.addHighlightState(highlightObject);
		}
	}
}