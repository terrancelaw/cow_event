const VisualizationPaneTimeline = {
	init: function() {
		var svg = d3.select('#vis-pane > svg > g');

		svg.selectAll('.group').each(function(d) {
			var timelineList = d.timelineData;
			
			var timelineUpdate = d3.select(this).selectAll('.timeline')
				.data(timelineList, function(d) { return d.name });

			var timelineEnter = timelineUpdate.enter()
				.append('g')
				.attr('class', 'timeline')
				.attr('transform', function(d) {
					return 'translate(' + [ 0, d.translateY ] + ')';
				})
				.each(function(d) {
					d3.select(this).append('rect').attr('class', 'background');
					d3.select(this).append('text').attr('class', 'title');
					d3.select(this).append('g').attr('class', 'axis-group');
					d3.select(this).append('g').attr('class', 'event-group');
				});

			timelineEnter.merge(timelineUpdate)
				.transition()
				.attr('transform', function(d) {
					return 'translate(' + [ 0, d.translateY ] + ')';
				});

			var timelineExit = timelineUpdate.exit()
				.remove();
		});
	},
	updateTitle: function() {
		var svg = d3.select('#vis-pane > svg > g');
		var backgroundPadding = VisualizationPane.chartBackgroundPadding;

		svg.selectAll('.group > .timeline').each(function(d) {
			var timelinesTitle = d.name;
			var translateY = -(0 - d.pointEventMinY);

			var title = d3.select(this).select('.title')
				.attr('x', -backgroundPadding.left + 5)
				.attr('y', translateY - backgroundPadding.top - 5)
				.text(timelinesTitle);
		});
	},
	updateBackground: function() {
		var yearWidth = VisualizationPane.yearWidth;
		var backgroundPadding = VisualizationPane.chartBackgroundPadding;
		var svg = d3.select('#vis-pane > svg > g');

		svg.selectAll('.group').each(function(d) {
			var timelineMinYear = d.timelineMinYear;
			var timelineMaxYear = d.timelineMaxYear;
			var needToDrawTimeline = timelineMinYear != Infinity && timelineMaxYear != -Infinity;

			d3.selectAll('.timeline').each(function(d) {
				var translateY = -(0 - d.pointEventMinY);
				var timelineWidth = (timelineMaxYear - timelineMinYear) * yearWidth;
				var timelineHeight = d.height;

				if (needToDrawTimeline)
					d3.select(this).select('.background')
						.attr('x', -backgroundPadding.left)
						.attr('y', translateY - backgroundPadding.top)
						.attr('rx', 2).attr('ry', 2)
						.attr('width', timelineWidth + backgroundPadding.left + backgroundPadding.right)
						.attr('height', timelineHeight + backgroundPadding.top + backgroundPadding.bottom);
				if (!needToDrawTimeline)
					d3.select(this).select('.background')
						.attr('width', 0)
						.attr('height', 0);
			});
		});
	},
	updateAxis: function() {
		const self = this;
		var yearWidth = VisualizationPane.yearWidth;
		var yearStep = VisualizationPane.yearStep;
		var svg = d3.select('#vis-pane > svg > g');

  		svg.selectAll('.group').each(function(d) {
  			var timelineMinYear = d.timelineMinYear;
			var timelineMaxYear = d.timelineMaxYear;
			var yearList = (timelineMinYear == Infinity || timelineMaxYear == -Infinity)
					 	 ? [] : self.range(timelineMinYear, timelineMaxYear, yearStep);
			var axisGroup = d3.select(this).selectAll('.timeline').selectAll('.axis-group')

			var yearUpdate = axisGroup.selectAll('.year')
				.data(yearList);

			var yearEnter = yearUpdate.enter()
				.append('text')
				.attr('class', 'year')
				.attr('y', 1)
				.style('text-anchor', 'middle')
				.style('alignment-baseline', 'middle');

			yearUpdate.merge(yearEnter)
				.attr('x', function(d, i) { return (d - timelineMinYear) * yearWidth })
				.text(function(d) { return d });

			var yearExit = yearUpdate.exit()
				.remove();
  		});
	},
	updateEvents: function() {
		var svg = d3.select('#vis-pane > svg > g');
		var eventRadius = VisualizationPane.eventRadius;

		svg.selectAll('.group > .timeline').each(function(d) {
			var eventList = d.pointEventData.concat(d.intervalEventData);
			var eventGroup = d3.select(this).select('.event-group');

			var eventUpdate = eventGroup.selectAll('.event')
				.data(eventList, function(d) { return d.ID });

			var eventEnter = eventUpdate.enter()
				.append('rect')
				.attr('class', 'event')
				.attr('rx', eventRadius)
				.attr('ry', eventRadius)
				.attr('x', function(d) { 
					var isPointEvent = d.startYear == d.endYear;
					var isIntervalEventWithoutEnd = d.notHaveEnd;
					if (isPointEvent || isIntervalEventWithoutEnd)
						return d.x - d.width / 2;
					else return d.x;
				})
				.attr('y', function(d) { return d.y - d.height / 2 })
				.attr('width', function(d) { return d.width })
				.attr('height', function(d) { return d.height })
				.style('fill', '#f5f5f5')
				.style('stroke', '#f5f5f5')
				.style('stroke-width', 2);

			eventUpdate.merge(eventEnter)
				.style('stroke', function(d) {
					if (d.notHaveEnd) return d.color;
					else return 'none';
				})
				.transition()
				.style('fill', function(d) {
					if (d.notHaveEnd) return 'white';
					else if (!d.isHighlighted) return 'gray';
					else return d.color;
				})
				.style('opacity', function(d) {
					if (!d.isHighlighted) return 0.2;
					else return null;
				})
				.attr('x', function(d) { 
					var isPointEvent = d.startYear == d.endYear;
					var isIntervalEventWithoutEnd = d.notHaveEnd;
					if (isPointEvent || isIntervalEventWithoutEnd)
						return d.x - d.width / 2;
					else return d.x;
				})
				.attr('y', function(d) { return d.y - d.height / 2 })
				.attr('width', function(d) { return d.width })
				.attr('height', function(d) { return d.height });

			var eventExit = eventUpdate.exit()
				.remove();
		});
	},
	initHoverEventBehaviour: function() {
		var svg = d3.select('#vis-pane > svg > g');

		svg.selectAll('.group > .timeline > .event-group > .event')
			.on('mouseenter', onMouseEnterEvent)
			.on('mouseleave', onMouseLeaveEvent);

		function onMouseEnterEvent(event, d) {
			var eventData = d.data;
			var left = event.pageX - 8;
			var top = event.pageY - 8;

			VisualizationPaneEventTooltip
				.show(left, top, eventData);
		}

		function onMouseLeaveEvent(event, d) {
			VisualizationPaneEventTooltip
				.hide();
		}
	},
	initClickBehaviour: function() {
		var svg = d3.select('#vis-pane > svg > g');

		svg.selectAll('.group > .timeline')
			.on('click', onClickTimeline);
	
		function onClickTimeline() {
			var isTimelineSelected = d3.select(this).classed('selected');
			var isCountEventPaneExpanded = $('#count-event-pane').hasClass('expanded');
			var groupData = d3.select(this.parentNode).datum();
			var timelineData = d3.select(this).datum();
			var selectedGroupNameInLowerCase = groupData.name.toLowerCase();
			var selectedTimelineNameInLowerCase = timelineData.name.toLowerCase();

			// deselect timeline
			if (isTimelineSelected) {
				d3.select(this).classed('selected', false);
				CountEventPane.showAllGroups();
			}

			// select timeline when count event pane opened
			else if (!isTimelineSelected && isCountEventPaneExpanded) {
				svg.selectAll('.group > .timeline').classed('selected', false);
				d3.select(this).classed('selected', true);
				CountEventPane.filterGroups(
					selectedGroupNameInLowerCase,
					selectedTimelineNameInLowerCase
				);
			}

			// select timeline when count event pane closed: force open
			else if (!isTimelineSelected && !isCountEventPaneExpanded) {
				svg.selectAll('.group > .timeline').classed('selected', false);
				d3.select(this).classed('selected', true);
				CountEventPane.ExpandCollapseButton.toCollapse();
				VisualizationPane.collapse();
				CountEventPane.empty();
				CountEventPane.expand();
				CountEventPane.showLoader();
				setTimeout(function() {
					CountEventPane.update();
					CountEventPane.filterGroups(
						selectedGroupNameInLowerCase,
						selectedTimelineNameInLowerCase
					);
					CountEventPane.hideLoader();
				}, 0);
			}
		}
	},

	// helpers

	range: function(start, stop, step) {
		var list = [];

		for (var i = start; i <= stop; i++) {
			var isStartOrEnd = (i == start || i == stop);
			var isMultiple = (i % step == 0);
			var isFarFromStartOrEnd = Math.abs(i - start) > 3 && Math.abs(i - stop) > 3; // hack

			if (isStartOrEnd || (isMultiple && isFarFromStartOrEnd))
				list.push(i);
		}

		return list;
	}
}