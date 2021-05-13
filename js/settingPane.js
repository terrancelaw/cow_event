const SettingPane = {
	init: function() {
		const self = this;

		self.initClickTabBehaviour();
		self.initHoverTabBehaviour();
	},
	updateData: function() {
		$('#setting-pane > .tab > .button').removeClass('selected');
		$('#setting-pane > .tab > .visualize.button').addClass('selected');
		SettingPane.empty();
		SettingVisualizePane.show();
	},
	initClickTabBehaviour: function() {
		$('#setting-pane > .tab > .button')
			.on('click', onClickSettingPaneTab);

		function onClickSettingPaneTab() {
			var selectedVisualize = $(this).hasClass('visualize');
			var selectedGroup = $(this).hasClass('group');
			var selectedFilter = $(this).hasClass('filter');
			var selectedEncode = $(this).hasClass('encode');
			var selectedHighlight = $(this).hasClass('highlight');
			var selectedOther = $(this).hasClass('other');

			$('#setting-pane > .tab > .button').removeClass('selected');
			$(this).addClass('selected');
			SettingPane.empty();

			if (selectedVisualize) SettingVisualizePane.show();
			if (selectedGroup) SettingGroupPane.show();
			if (selectedFilter) SettingFilterPane.show();
			if (selectedEncode) SettingEncodePane.show();
			if (selectedHighlight) SettingHighlightPane.show();
			if (selectedOther) SettingOtherPane.show();
		}
	},
	initHoverTabBehaviour: function() {
		const self = this;

		$('#setting-pane > .tab > .button')
			.on('mouseenter', onMouseenterSettingPaneTab)
			.on('mouseleave', onMouseleaveSettingPaneTab);

		function onMouseenterSettingPaneTab() {
			var offset = $(this).offset();
			var height = $(this).height();
			var tooltipText = $(this).attr('tooltip');
			
			$('#tooltip')
				.removeClass()
				.removeAttr('style')
				.empty()
				.addClass('tab')
				.css('left', offset.left)
				.css('top', offset.top + height)
				.html(tooltipText);
		}

		function onMouseleaveSettingPaneTab() {
			$('#tooltip')
				.removeClass()
				.removeAttr('style')
				.empty();
		}
	},
	empty: function() {
		$('#setting-pane > .search-box > input').val('');
		$('#setting-pane > .settings').empty();
	}
}