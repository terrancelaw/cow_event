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