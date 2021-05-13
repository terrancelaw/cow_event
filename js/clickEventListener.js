const ClickEventListener = {
	clickEvents: {
		clickDropdown: {
			targetSelectorArray: [ '.dropdown', '#dropdown-menu' ],
			notApplicableElSelectorArray: [],
			onClick: function() {},
			onNotClick: function() {
				$('.dropdown').each(function() {
					var dropdownEl = this;
					var dropdownObject = d3.select(this).datum();
					dropdownObject.closeDropdownMenu();
				});

				// the dropdowns may be removed due to the click
				// e.g., click from other pane to visualize pane
				$('#dropdown-menu')
					.removeClass()
					.removeAttr('style')
					.empty();
			}
		},
		clickTimeline: {
			targetSelectorArray: [ '#vis-pane > svg > g > .group > .timeline' ],
			notApplicableElSelectorArray: [],
			onClick: function() {},
			onNotClick: function() {
				d3.selectAll('#vis-pane > svg > g > .group > .timeline.selected')
					.classed('selected', false);
				CountEventPane.showAllGroups();
			}
		}
	}
};