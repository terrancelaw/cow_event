const SettingOtherPane = {
	show: function() {
		const self = this;
		$('#setting-pane > .settings').removeClass('visualize');
		$('#setting-pane > .settings').removeClass('group');
		$('#setting-pane > .settings').removeClass('filter');
		$('#setting-pane > .settings').removeClass('encode');
		$('#setting-pane > .settings').removeClass('highlight');
		$('#setting-pane > .settings').removeClass('other');
		$('#setting-pane > .settings').addClass('other');
		self.hideSearchBox();
		self.drawRemoveTimelineWithNoDataDropdown();
		self.drawNormalizeTimeSeriesDropdown();
		$('#setting-pane > .settings').scrollTop(0);
	},
	hideSearchBox: function() {
		$('#setting-pane > .search-box')
			.css('display', 'none');
	},
	drawRemoveTimelineWithNoDataDropdown: function() {
		const self = this;
		var removeTimelineWithNoData = State.removeTimelineWithNoData;
		var dropdownHTML = self.generateDropdownHTML('remove-timeline');
		var dropdownEl = null;

		$('#setting-pane > .settings.other').append(dropdownHTML);
		dropdownEl = $('#setting-pane > .settings.other > .dropdown').last()[0];

		var dropdown = new DropdownMenu(
			dropdownEl = dropdownEl,
			dropdownName = 'Remove timeline with no data',
			dropdownList = [ 'true', 'false' ],
			onClickListItem = onClickListItem,
			isDisabled = false,
			defaultSelection = removeTimelineWithNoData.toString()
		);

		function onClickListItem(data) {
			var oldValue = State.removeTimelineWithNoData;
			var newValue = (data == 'true');

			if (oldValue == newValue) return;
			State.removeTimelineWithNoData = newValue;
			RightColumn.update();
		}
	},
	drawNormalizeTimeSeriesDropdown: function() {
		const self = this;
		var normalizeTimeSeries = State.normalizeTimeSeries;
		var dropdownHTML = self.generateDropdownHTML('normalize-time-series');
		var dropdownEl = null;

		$('#setting-pane > .settings.other').append(dropdownHTML);
		dropdownEl = $('#setting-pane > .settings.other > .dropdown').last()[0];

		var dropdown = new DropdownMenu(
			dropdownEl = dropdownEl,
			dropdownName = 'Normalize time series',
			dropdownList = [ 'true', 'false' ],
			onClickListItem = onClickListItem,
			isDisabled = false,
			defaultSelection = normalizeTimeSeries.toString()
		);

		function onClickListItem(data) {
			var oldValue = State.normalizeTimeSeries;
			var newValue = (data == 'true');
			
			if (oldValue == newValue) return;
			State.normalizeTimeSeries = newValue;
			RightColumn.update();
		}
	},

	// helper

	generateDropdownHTML: function(className) {
		return '<div class="dropdown ' + className + '">' +
					'<div class="name"></div>' +
					'<div class="open-menu-button">' +
						'<span class="button-text"></span>' +
						'<span class="fa fa-caret-down"></span>' +
					'</div>' +
			   '</div>';
	}
}