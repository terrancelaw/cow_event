const VisualizationPaneLegend = {
	update: function() {
		const self = this;
		var colorScale = VisualizationPane.colorScale;
		var selectedNameList = self.getSelectedNameList();

		if (selectedNameList.length == 0) {
			$('#vis-pane > .legend').empty();
			$('#vis-pane > .legend').css('display', '');
		}
		else if (selectedNameList.length > 0) {
			$('#vis-pane > .legend').empty();
			$('#vis-pane > .legend').css('display', 'block');
		}

		for (var i = 0; i < selectedNameList.length; i++) {
			var currentName = selectedNameList[i];
			var color = colorScale(currentName);
			var legendItemHTML = self.generateLegendItemHTML(currentName, color);
			$('#vis-pane > .legend').append(legendItemHTML);
		}
	},
	getSelectedNameList: function() {
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
					var stageName = stageData.eventName;
					selectedNameList.push(stageName);
				}
		}

		return selectedNameList;
	},
	generateLegendItemHTML: function(name, color) {
		return '<span class="legend-item">' +
					'<span class="color" style="background:' + color + '"></span>' +
					'<span class="text">' + name + '</span>' +
			   '</span>';
	}
}