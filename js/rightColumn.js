const RightColumn = {
	update: function() {
		var isCountEventPaneExpanded = $('#count-event-pane').hasClass('expanded');
		var selectedNewEventAttr = State.selectedNewEventAttr;
		var needToForceOpenContentEventPane = !isCountEventPaneExpanded && selectedNewEventAttr;

		if (needToForceOpenContentEventPane) {
			State.selectedNewEventAttr = false;
			CountEventPane.ExpandCollapseButton.toCollapse();
			VisualizationPane.initColorScale();
			VisualizationPane.collapse();
			VisualizationPane.showLoader();
			CountEventPane.empty();
			CountEventPane.expand();
			CountEventPane.showLoader();
			setTimeout(function() {
				DataProcessor.update();
				VisualizationPane.update();
				VisualizationPane.hideLoader();
				CountEventPane.update();
				CountEventPane.hideLoader();
			}, 0);
		}
		else if (isCountEventPaneExpanded) {
			State.selectedNewEventAttr = false;
			VisualizationPane.initColorScale();
			VisualizationPane.showLoader();
			CountEventPane.empty();
			CountEventPane.showLoader();
			setTimeout(function() {
				DataProcessor.update();
				VisualizationPane.update();
				VisualizationPane.hideLoader();
				CountEventPane.update();
				CountEventPane.hideLoader();
			}, 0);
		}
		else if (!isCountEventPaneExpanded) {
			State.selectedNewEventAttr = false;
			VisualizationPane.initColorScale();
			VisualizationPane.showLoader();
			setTimeout(function() {
				DataProcessor.update();
				VisualizationPane.update();
				VisualizationPane.hideLoader();
			}, 0);
		}
	}
}