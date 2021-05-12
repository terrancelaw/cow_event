$(function() {
	Body.init();
	SettingPane.init();

	Database.loadData(function() {
		Body.hideLoader();
	});
});