const CountEventPane = {
	numberOfBins: 5,
	maxCount: null,

	init: function() {
		CountEventPane.ExpandCollapseButton.initClick();
		CountEventPane.ExpandCollapseButton.initHover();
		CountEventPane.ShowHideTextButton.initClick();
		CountEventPane.ShowHideTextButton.initHover();
		CountEventPane.SearchBox.initInput();
	},
	update: function() {
		var	eventName = DataProcessingEventCounter.eventName;
		var eventAttributeName = DataProcessingEventCounter.eventAttributeName;
		var eventAttributeAttributeName = DataProcessingEventCounter.eventAttributeAttributeName;
		var hasContentToShow = eventName !== null || 
							   eventAttributeName !== null || 
							   eventAttributeAttributeName !== null;

		if (hasContentToShow) {
			CountEventPane.empty();
			CountEventPane.getMaxCount();
			CountEventPaneHeader.update();
			CountEventPane.SearchBox.show();
			CountEventPaneContent.updateGroups();
			CountEventPaneContent.updateGroupName();
			CountEventPaneContent.updateTimelineName();
			CountEventPaneContent.updateBarChart();
			CountEventPaneContent.updateDescription();
		}
		else if (!hasContentToShow) {
			CountEventPane.empty();
			CountEventPaneHeader.showNone();
			CountEventPane.SearchBox.hide();
			CountEventPaneContent.showNone();
		}
	},
	getMaxCount: function() {
		const self = this;
		var maxCount = -Infinity;
		var eventCountData = DataProcessor.eventCountData;

		for (var i = 0; i < eventCountData.length; i++) {
			var groupData = eventCountData[i];
			var barChartList = groupData.countData;

			for (var j = 0; j < barChartList.length; j++) {
				var barList = barChartList[j].countList;

				for (var k = 0; k < barList.length; k++) {
					var barData = barList[k];
					var count = barData.count;

					if (count > maxCount)
						maxCount = count;
				}
			}
		}

		self.maxCount = maxCount;
	},
	expand: function() {
		$('#count-event-pane')
			.removeClass('collapsed')
			.addClass('expanded');
	},
	collapse: function() {
		$('#count-event-pane')
			.removeClass('expanded')
			.addClass('collapsed');
	},
	empty: function() {
		$('#count-event-pane > .header').empty();
		$('#count-event-pane > .content').empty();
	},

	// search

	markGroupNames: function(groupNameQueryInLowerCase) {
		var markInstance = new Mark(document.querySelectorAll('#count-event-pane > .content > .group > .group-name'));

		markInstance.unmark({
	  		done: function(){
	    		markInstance.mark(groupNameQueryInLowerCase, {
    				'separateWordSearch': false,
    				'diacritics': false
	    		});
	    	}
	  	});
	},
	filterGroups: function(groupNameQueryInLowerCase, timelineNameQueryInLowerCase = null) {
		$('#count-event-pane > .content > .group').each(function() {
			var groupData = d3.select(this).datum();
			var groupName = groupData.name;
			var groupNameInLowerCase = groupName.toLowerCase();
			var foundGroupName = groupNameInLowerCase.indexOf(groupNameQueryInLowerCase) != -1;
			
			if (foundGroupName) {
				$(this).css('display', '');

				if (timelineNameQueryInLowerCase)
					$(this).find('.timeline-event-count').each(function() {
						var countData = d3.select(this).datum();
						var timelineName = countData.timelineName;
						var timelineNameInLowerCase = timelineName.toLowerCase();
						var foundTimelineName = timelineNameInLowerCase.indexOf(timelineNameQueryInLowerCase) != -1;
						if (foundTimelineName) $(this).css('display', '');
						else if (!foundTimelineName) $(this).css('display', 'none');
					});
				else if (!timelineNameQueryInLowerCase)
					$(this).find('.timeline-event-count').css('display', '');
			}
			else if (!foundGroupName)
				$(this).css('display', 'none');
		});
	},
	showAllGroups: function() {
		$('#count-event-pane > .content > .group')
			.css('display', '');
		$('#count-event-pane > .content > .group > .timeline-event-count')
			.css('display', '');
	},

	// buttons

	ExpandCollapseButton: {
		toCollapse: function() {
			$('#count-event-pane > .buttons > .expand-and-collapse.button > .fa')
				.removeClass('fa-angle-double-left')
				.addClass('fa-angle-double-right');
			$('#count-event-pane > .buttons > .expand-and-collapse.button')
				.attr('tooltip', 'Collapse count event pane');
		},
		toExpand: function() {
			$('#count-event-pane > .buttons > .expand-and-collapse.button > .fa')
				.removeClass('fa-angle-double-right')
				.addClass('fa-angle-double-left');
			$('#count-event-pane > .buttons > .expand-and-collapse.button')
				.attr('tooltip', 'Expand count event pane');
		},
		initClick: function() {
			$('#count-event-pane > .buttons > .expand-and-collapse.button')
				.on('click', onClickExpandAndCollapseButton);

			function onClickExpandAndCollapseButton() {
				var isCollapsed = $(this).find('.fa').hasClass('fa-angle-double-left');

				// expand
				if (isCollapsed) {
					$('#tooltip').html('Collapse count event pane');
					CountEventPane.ExpandCollapseButton.toCollapse();
					VisualizationPane.collapse();
					CountEventPane.empty();
					CountEventPane.expand();
					CountEventPane.showLoader();
					setTimeout(function() {
						VisualizationPaneSVG.update();
						CountEventPane.update();
						CountEventPane.hideLoader();
					}, 0);
				}

				// collapse
				else if (!isCollapsed) {
					$('#tooltip').html('Expand count event pane');
					CountEventPane.ExpandCollapseButton.toExpand();
					VisualizationPane.expand();
					CountEventPane.empty();
					CountEventPane.collapse();
					VisualizationPaneSVG.update();
				}
			}
		},
		initHover: function() {
			$('#count-event-pane > .buttons > .expand-and-collapse.button')
				.on('mouseenter', onMouseenterButton)
				.on('mouseleave', onMouseleaveButton);

			function onMouseenterButton() {
				var offset = $(this).offset();
				var height = $(this).height();
				var width = $(this).width();
				var tooltipText = $(this).attr('tooltip');
				
				$('#tooltip')
					.removeClass()
					.removeAttr('style')
					.empty()
					.addClass('event-count-button')
					.css('left', offset.left - 8 + width - 8)
					.css('top', offset.top + height)
					.css('transform', 'translateX(-100%)')
					.html(tooltipText);
			}

			function onMouseleaveButton() {
				$('#tooltip')
					.removeClass()
					.removeAttr('style')
					.empty();
			}
		}
	},
	ShowHideTextButton: {
		toShow: function() {
			$('#count-event-pane > .buttons > .show-and-hide-text.button > .fa')
				.removeClass('fa-minus-circle')
				.addClass('fa-plus-circle');
			$('#count-event-pane > .buttons > .show-and-hide-text.button')
				.attr('tooltip', 'Show chart descriptions');
		},
		toHide: function() {
			$('#count-event-pane > .buttons > .show-and-hide-text.button > .fa')
				.removeClass('fa-plus-circle')
				.addClass('fa-minus-circle');
			$('#count-event-pane > .buttons > .show-and-hide-text.button')
				.attr('tooltip', 'Hide chart descriptions');
		},
		initClick: function() {
			$('#count-event-pane > .buttons > .show-and-hide-text.button')
				.on('click', onClickShowAndHideTextButton);

			function onClickShowAndHideTextButton() {
				var isShown = $(this).find('.fa').hasClass('fa-minus-circle');

				// hide
				if (isShown) {
					$('#tooltip').html('Show chart descriptions');
					CountEventPane.ShowHideTextButton.toShow();
					State.showChartDescription = false;
					$('#count-event-pane .group .description')
						.css('display', 'none');
				}

				// show
				else if (!isShown) {
					$('#tooltip').html('Hide chart descriptions');
					CountEventPane.ShowHideTextButton.toHide();
					State.showChartDescription = true;
					$('#count-event-pane .group .description')
						.css('display', '');
				}
			}
		},
		initHover: function() {
			$('#count-event-pane > .buttons > .show-and-hide-text.button')
				.on('mouseenter', onMouseenterButton)
				.on('mouseleave', onMouseleaveButton);

			function onMouseenterButton() {
				var offset = $(this).offset();
				var height = $(this).height();
				var width = $(this).width();
				var tooltipText = $(this).attr('tooltip');
				
				$('#tooltip')
					.removeClass()
					.removeAttr('style')
					.empty()
					.addClass('event-count-button')
					.css('left', offset.left - 8 + width - 8)
					.css('top', offset.top + height)
					.css('transform', 'translateX(-100%)')
					.html(tooltipText);
			}

			function onMouseleaveButton() {
				$('#tooltip')
					.removeClass()
					.removeAttr('style')
					.empty();
			}
		}
	},

	// search box

	SearchBox: {
		hide: function() {
			$('#count-event-pane  > .search-box')
				.css('display', 'none');
		},
		show: function() {
			var headerOffset = $('#count-event-pane  > .header').offset();
			var headerHeight = $('#count-event-pane  > .header').outerHeight();
			var headerTop = headerOffset.top - 8;

			$('#count-event-pane  > .search-box')
				.css('display', '')
				.css('top', headerTop + headerHeight + 27);
		},
		initInput: function() {
			$('#count-event-pane > .search-box > input')
				.on('input', onInputSearchQuery);

			function onInputSearchQuery() {
				var groupNameQueryInLowerCase = $(this).val().toLowerCase();

				if (groupNameQueryInLowerCase == '') {
					CountEventPane.markGroupNames(groupNameQueryInLowerCase);
					CountEventPane.showAllGroups();
				}
				else if (groupNameQueryInLowerCase != '') {
					CountEventPane.markGroupNames(groupNameQueryInLowerCase);
					CountEventPane.filterGroups(groupNameQueryInLowerCase);
				}
			}
		}
	},

	// loader

	showLoader: function() {
		$('#count-event-pane  > .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#count-event-pane > .loader')
			.css('display', '');
	}
}