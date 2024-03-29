$(function() {
	Body.init();
	SettingPane.init();
	ReferencePane.init();
	CountEventPane.init();
	VisualizationPane.init();
	VisualizationPaneControls.init();
	VisualizationPaneScrollbar.init();

	Database.loadData(function() {
		SettingPane.updateData();
		RightColumn.update();
		Body.hideLoader();
	});
});