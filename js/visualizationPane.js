const VisualizationPane = {
	margin: { top: 40, left: 35, bottom: 30, right: 35 },
	chartBackgroundPadding: { top: 15, left: 20, bottom: 15, right: 20 },

	groupYMargin: 45,
	groupMinHeight: 50,
	nameShift: -50,
	nameMaxWidth: null,

	colorScale: null,
	selectedNameList: [],
	nameListForColor: [],

	timelineYMargin: 20,
	timelineMinHeight: 50,
	lineChartHeight: 50,
	lineChartTopPadding: 25,
	yearWidth: 10,
	yearStep: 10,
	eventHeight: 7,
	eventMargin: 3,
	eventMaxHeight: 50,
	eventRadius: 1.5,
	pointIntervalGap: 15,

	init: function() {
		const self = this;
		var backgroundPadding = self.chartBackgroundPadding;

		// add the timeline padding and update
		self.groupYMargin += backgroundPadding.top + backgroundPadding.bottom;
		self.timelineYMargin += backgroundPadding.top + backgroundPadding.bottom;
	},
	update: function() {
		VisualizationPane.updateGroups();
		VisualizationPane.updateName();
		VisualizationPane.updateSeperator();
		VisualizationPaneLineChart.init();
		VisualizationPaneLineChart.updateTitle();
		VisualizationPaneLineChart.updateBackground();
		VisualizationPaneLineChart.updateAxis();
		VisualizationPaneLineChart.updateLines();
		VisualizationPaneLineChart.updateMinMaxPoints();
		VisualizationPaneTimeline.init();
		VisualizationPaneTimeline.updateTitle();
		VisualizationPaneTimeline.updateBackground();
		VisualizationPaneTimeline.updateAxis();
		VisualizationPaneTimeline.updateEvents();
		VisualizationPaneTimeline.initHoverEventBehaviour();
		VisualizationPaneTimeline.initClickBehaviour();
		VisualizationPane.transformGroup();
		VisualizationPane.adjustSVGDimensions();
		VisualizationPaneLegend.update();
		VisualizationPaneSVG.update(); // set behaviour based on canvas size + legend height
	},
	expand: function() {
		$('#vis-pane')
			.removeClass('collapsed')
			.addClass('expanded');
	},
	collapse: function() {
		$('#vis-pane')
			.removeClass('expanded')
			.addClass('collapsed');
	},

	// group

	updateGroups: function() {
		const self = this;
		var canvas = d3.select('#vis-pane > svg > g');
		var plotData = DataProcessor.plotData;

		var groupUpdate = canvas.selectAll('.group')
			.data(plotData, function(d) { return d.name });

		var groupEnter = groupUpdate.enter(plotData)
			.append('g')
			.attr('class', 'group')
			.attr('transform', function(d) {
				return 'translate(' + [ 0, d.translateY ] + ')';
			})
			.each(function(d) {
				d3.select(this).append('text')
					.attr('class', 'name');
				d3.select(this).append('line')
					.attr('class', 'seperator')
					.style('stroke', 'gray')
					.style('stroke-dasharray', '5,5');
			});

		groupEnter.merge(groupUpdate)
			.transition()
			.attr('transform', function(d) {
				return 'translate(' + [ 0, d.translateY ] + ')';
			});

		var groupExit = groupUpdate.exit()
			.remove();
	},
	updateName: function() {
		const self = this;
		var nameShift = self.nameShift;
		var svg = d3.select('#vis-pane > svg > g');

		var plotData = DataProcessor.plotData;
		var nameMaxWidth = -Infinity;
		var longestName = null;
		var longestNameLength = -Infinity;

		// get nameMaxWidth
		for (var i = 0; i < plotData.length; i++) {
			var groupData = plotData[i];
			var groupName = groupData.name;
			var nameLength = groupName.length;
			if (nameLength > longestNameLength) {
				longestNameLength = nameLength;
				longestName = groupName;
			}
		}
		$('body').append('<div id="hacky-text">' + longestName + '</div>');
		nameMaxWidth = $('#hacky-text')[0].clientWidth;
		$('#hacky-text').remove();

		// draw
		svg.selectAll('.group').each(function(d) {
			d3.select(this).select('.name')
				.attr('x', nameShift - nameMaxWidth)
				.attr('y', 0)
				.text(d.name);
		});

		self.nameMaxWidth = nameMaxWidth;
	},
	updateSeperator: function() {
		const self = this;
		var svg = d3.select('#vis-pane > svg > g');
		var groupYMargin = self.groupYMargin;
		var nameShift = self.nameShift;
		var nameMaxWidth = self.nameMaxWidth;
		var yearWidth = self.yearWidth;

		svg.selectAll('.group').each(function(d) {
			var groupHeight = d.height;
			var timelineMinYear = d.timelineMinYear;
			var timelineMaxYear = d.timelineMaxYear;
			var timelineWidth = (timelineMinYear == Infinity || timelineMaxYear == -Infinity)
							  ? 0 : (timelineMaxYear - timelineMinYear) * yearWidth;
			
			d3.select(this).select('.seperator')
				.attr('x1', nameShift - nameMaxWidth)
				.attr('x2', timelineWidth)
				.attr('y1', groupHeight + groupYMargin / 2)
				.attr('y2', groupHeight + groupYMargin / 2);
		});
	},
	transformGroup: function() {
		const self = this;
		var margin = self.margin;
		var nameShift = self.nameShift;
		var nameMaxWidth = self.nameMaxWidth;
		var translateX = null, translateY = null;

		translateX = nameMaxWidth - nameShift + margin.left;
		translateY = margin.top;
		d3.select('#vis-pane > svg > g')
			.attr('transform', 'translate(' + [ translateX, translateY ] + ')');
	},
	adjustSVGDimensions: function() {
		const self = this;

		var margin = self.margin;
		var nameShift = self.nameShift;
		var nameMaxWidth = self.nameMaxWidth;
		var yearWidth = self.yearWidth;

		var plotData = DataProcessor.plotData;
		var groupWidth = 0, groupHeight = 0;
		var svgWidth = 0, svgHeight = 0;
		var timelineMinYear = null, timelineMaxYear = null, timelineWidth = null;
		var needToDrawGroups = plotData.length > 0;
		var needToDrawTimelines = plotData.length > 0 
							   && plotData[0].timelineMinYear != Infinity
							   && plotData[0].timelineMaxYear != -Infinity;

		if (needToDrawGroups && needToDrawTimelines) {
			timelineMinYear = plotData[0].timelineMinYear;
			timelineMaxYear = plotData[0].timelineMaxYear;
			timelineWidth = (timelineMaxYear - timelineMinYear) * yearWidth;
			groupHeight = plotData[plotData.length - 1].translateY + plotData[plotData.length - 1].height;
			groupWidth = nameMaxWidth - nameShift + timelineWidth;
			svgWidth = groupWidth + margin.left + margin.right;
			svgHeight = groupHeight + margin.top + margin.bottom;
			$('#vis-pane > svg').css('width', svgWidth).css('height', svgHeight);
		}
		else if (needToDrawGroups && !needToDrawTimelines) {
			groupHeight = plotData[plotData.length - 1].translateY + plotData[plotData.length - 1].height;
			groupWidth = nameMaxWidth - nameShift;
			svgWidth = groupWidth + margin.left + margin.right;
			svgHeight = groupHeight + margin.top + margin.bottom;
			$('#vis-pane > svg').css('width', svgWidth).css('height', svgHeight);
		}
		else if (!needToDrawGroups)
			$('#vis-pane > svg').css('width', 0).css('height', 0);
	},

	// color

	initColorScale: function() {
		const self = this;
		
		self.getSelectedNameList();
		self.removeDeselectedEventsFromNameListForColor();
		self.addSelectedEventsIntoNameListForColor();
		self.generateColorScaleFromNameListForColor();
	},
	getSelectedNameList: function() {
		const self = this;
		var dataSource = Database.dataSource;
		var eventNameToStageAttrData = Database.eventNameToStageAttrData;
		var selectedNameList = [];
		var selectedEventNameList = State.visualize
			.filter(function(d) { return d.type == 'pointEvent' || d.type == 'intervalEvent' })
			.map(function(d) { return d.data.eventName });

		for (var i = 0; i < selectedEventNameList.length; i++) {
			var eventName = selectedEventNameList[i];
			var stageDataList = eventNameToStageAttrData[eventName];

			// point event
			if (stageDataList.length == 0)
				selectedNameList.push(eventName);

			// interval event
			else if (stageDataList.length > 0)
				for (var j = 0; j < stageDataList.length; j++) {
					var stageData = stageDataList[j];
					var stageName = stageData[dataSource + 'EventName'];
					selectedNameList.push(stageName);
				}
		}

		self.selectedNameList = selectedNameList;
	},
	removeDeselectedEventsFromNameListForColor: function() {
		const self = this;
		var selectedNameList = self.selectedNameList;
		var nameListForColor = self.nameListForColor;

		for (var i = 0; i < nameListForColor.length; i++) {
			var currentName = nameListForColor[i];
			var currentNameInSelectedNameList = selectedNameList.indexOf(currentName) != -1;
			
			if (!currentNameInSelectedNameList) // deselected
				nameListForColor[i] = '##' + i;
		}
	},
	addSelectedEventsIntoNameListForColor: function() {
		const self = this;
		var selectedNameList = self.selectedNameList;
		var nameListForColor = self.nameListForColor;
		var newNameList = [];

		// init newNameList
		for (var i = 0; i < selectedNameList.length; i++) {
			var currentName = selectedNameList[i];
			var currentNameInNameListForColor = nameListForColor.indexOf(currentName) != -1;
			
			if (!currentNameInNameListForColor) // added
				newNameList.push(currentName);
		}

		// edit nameListForColor
		for (var i = 0; i < newNameList.length; i++) {
			var currentName = newNameList[i];
			var hasAdded = false;

			// try insert in the middle
			for (var j = 0; j < nameListForColor.length; j++)
				if (nameListForColor[j].indexOf('##') == 0) {
					nameListForColor[j] = currentName;
					hasAdded = true; break;
				}

			// cannot insert in the middle
			if (!hasAdded)
				nameListForColor.push(currentName)
		}
	},
	generateColorScaleFromNameListForColor: function() {
		const self = this;
		var nameListForColor = self.nameListForColor;
		var colorRange = [];

		for (var i = 1; i < d3.schemeTableau10.length; i++) // remove blue
			colorRange.push(d3.schemeTableau10[i]);

		self.colorScale = d3.scaleOrdinal()
			.domain(nameListForColor)
			.range(colorRange);
	},
	getColor: function(name) {
		const self = this;
		var colorScale = self.colorScale;

		return colorScale(name);
	},

	// loader

	showLoader: function() {
		$('#vis-pane  > .loader').css('display', 'block');
	},
	hideLoader: function() {
		$('#vis-pane > .loader').css('display', '');
	}
}