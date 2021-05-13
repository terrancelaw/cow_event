const VisualizationPaneScrollbar = {
	init: function() {
		var dragBehaviour = d3.drag()
			.on('start', onDragScrollbar)
			.on('drag', onDragScrollbar);

		d3.select('#vis-pane > .scrollbar')
			.on('.drag', null)
			.call(dragBehaviour);

		function onDragScrollbar(event) {
			var trackHeight = $('#vis-pane > .scrollbar').height();
			var thumbheight = $('#vis-pane > .scrollbar > .thumb').height();
			var distanceFromTrackTop = event.y;

			var scale = VisualizationPaneSVG.scale;
			var visPaneHeight = trackHeight;
			var scaledSVGHeight = $('#vis-pane > svg').height() * scale;
			var distanceFromSVGTop = scaledSVGHeight * (distanceFromTrackTop / trackHeight);
			var posY = -(distanceFromSVGTop - visPaneHeight / 2)

			VisualizationPaneSVG.setPosY(posY);
			VisualizationPaneSVG.transform();
		}
	},
	update: function() {
		var scale = VisualizationPaneSVG.scale;
		var posY = VisualizationPaneSVG.posY;
		var visPaneHeight = $('#vis-pane').height();
		var scaledSVGHeight = $('#vis-pane > svg').height() * scale;

		var trackHeight = visPaneHeight;
		var thumbHeight = visPaneHeight * (visPaneHeight / scaledSVGHeight);
		var thumbTop = visPaneHeight * (-posY / scaledSVGHeight);

		if (visPaneHeight >= scaledSVGHeight) // no overflown
			$('#vis-pane > .scrollbar')
				.css('display', 'none');
		if (visPaneHeight < scaledSVGHeight) // overflown
			$('#vis-pane > .scrollbar')
				.css('display', '');
		$('#vis-pane > .scrollbar > .thumb')
			.css('height', thumbHeight)
			.css('top', thumbTop);
	}
}