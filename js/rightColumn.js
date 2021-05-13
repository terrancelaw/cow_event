const RightColumn = {
	update: function() {
		var isCountEventPaneExpanded = $('#count-event-pane').hasClass('expanded');
		var selectedNewEventAttr = State.selectedNewEventAttr;
		var needToForceOpenContentEventPane = !isCountEventPaneExpanded && selectedNewEventAttr;

		if (needToForceOpenContentEventPane) {
			State.selectedNewEventAttr = false;
			VisualizationPane.initColorScale();
			setTimeout(function() {
				DataProcessor.update();
			}, 0);
		}
		else if (isCountEventPaneExpanded) {
			State.selectedNewEventAttr = false;
			VisualizationPane.initColorScale();
			setTimeout(function() {
				DataProcessor.update();
			}, 0);
		}
		else if (!isCountEventPaneExpanded) {
			State.selectedNewEventAttr = false;
			VisualizationPane.initColorScale();
			setTimeout(function() {
				DataProcessor.update();
			}, 0);
		}
	}
}