$(function() {
	Body.init();
	SettingPane.init();

	Database.loadData(function() {
		SettingPane.updateData();
		RightColumn.update();
		Body.hideLoader();
	});
});