const VisualizationPaneSVG = {
	posX: 0,
	posY: 0,
	scale: 1,

	startX: null,
	startY: null,
	startScale: null,

	minScale: 0.1,
	maxScale: 2,

	update: function() {
		const self = this;
		var posX = self.posX;
		var posY = self.posY;

		self.setPosX(posX); // bound posX
		self.setPosY(posY); // bound posY
		self.setOriginalTransform();
		self.initWindowResizeBehaviour();
		self.initScrollBehaviour();
		self.initPinchBehaviour();
		self.initPanBehaviour();
	},
	setOriginalTransform: function() {
		const self = this;

		self.transform();
	},
	initWindowResizeBehaviour: function() {
		const self = this;

		$(window)
			.unbind('resize')
			.on('resize', onResizeWindow);

		function onResizeWindow() {
			var posX = self.posX;
			var posY = self.posY;

			self.setPosX(posX); // bound posX
			self.setPosY(posY); // bound posY
			self.transform();
		}
	},
	initScrollBehaviour: function() {
		const self = this;

		$('#vis-pane')
			.unbind('wheel')
			.on('wheel', onScrollVisPane);

		function onScrollVisPane(event) {
			var isPinch = event.ctrlKey;
			var isScroll = !event.ctrlKey;
			var oldPosX = self.posX;
			var oldPosY = self.posY
			var oldScale = self.scale;
			var minScale = self.minScale;
			var maxScale = self.maxScale;

			if (isPinch) {
				var offset = $(this).offset();
				var mouseX = event.originalEvent.pageX - offset.left;
				var mouseY = event.originalEvent.pageY - offset.top;
				var oldCentreTranslateX = self.getCentreTranslateX(oldScale);
				var oldCentreTranslateY = self.getCentreTranslateY(oldScale);
				var targetX = (mouseX - oldPosX - oldCentreTranslateX) / oldScale;
	    		var targetY = (mouseY - oldPosY - oldCentreTranslateY) / oldScale;
	    		var newScale = (oldScale - event.originalEvent.deltaY * 0.01 < minScale) ? minScale : 
	    				   	   (oldScale - event.originalEvent.deltaY * 0.01 > maxScale ? maxScale : 
	    				   		oldScale - event.originalEvent.deltaY * 0.01);
	    		var newCentreTranslateX = self.getCentreTranslateX(newScale);
	    		var newCentreTranslateY = self.getCentreTranslateY(newScale);
	    		var newPosX = mouseX - (targetX * newScale + newCentreTranslateX);
	    		var newPosY = mouseY - (targetY * newScale + newCentreTranslateY);

				event.preventDefault();
				self.setScale(newScale);
				self.setPosX(newPosX);
				self.setPosY(newPosY);
				self.transform();
			}
			if (isScroll) {
				var newPosX = oldPosX - event.originalEvent.deltaX * 1.5;
				var newPosY = oldPosY - event.originalEvent.deltaY * 1.5;

				event.preventDefault();
				self.setPosX(newPosX);
				self.setPosY(newPosY);
				self.transform();
			}
		}
	},
	initPinchBehaviour: function() {
		const self = this;

		$('#vis-pane')
			.unbind('gesturestart')
			.unbind('gesturechange')
			.unbind('gestureend')
			.on('gesturestart', onStartPinchVisPane)
			.on('gesturechange', onPinchVisPane)
			.on('gestureend', onEndPinchVisPane);

		function onStartPinchVisPane(event) {
			var scale = self.scale;

			event.preventDefault();
			self.setStartScale(scale);
		}

		function onPinchVisPane(event) {
			var startScale = self.startScale;
			var oldPosX = self.posX;
			var oldPosY = self.posY
			var oldScale = self.scale;
			var minScale = self.minScale;
			var maxScale = self.maxScale;

			var offset = $(this).offset();
			var mouseX = event.originalEvent.pageX - offset.left;
			var mouseY = event.originalEvent.pageY - offset.top;
			var oldCentreTranslateX = self.getCentreTranslateX(oldScale);
			var oldCentreTranslateY = self.getCentreTranslateY(oldScale);
			var targetX = (mouseX - oldPosX - oldCentreTranslateX) / oldScale;
	    	var targetY = (mouseY - oldPosY - oldCentreTranslateY) / oldScale;
	    	var newScale = (event.originalEvent.scale * startScale < minScale) ? minScale : 
	    				   (event.originalEvent.scale * startScale > maxScale ? maxScale : 
	    				   	event.originalEvent.scale * startScale);
	    	var newCentreTranslateX = self.getCentreTranslateX(newScale);
	    	var newCentreTranslateY = self.getCentreTranslateY(newScale);
	    	var newPosX = mouseX - (targetX * newScale + newCentreTranslateX);
	    	var newPosY = mouseY - (targetY * newScale + newCentreTranslateY);

			event.preventDefault();
			self.setScale(newScale);
			self.setPosX(newPosX);
			self.setPosY(newPosY);
			self.transform();
		}

		function onEndPinchVisPane(event) {
			event.preventDefault();
		}
	},
	initPanBehaviour: function() {
		const self = this;

		var dragBehaviour = d3.drag()
			.on('start', onStartDragVisPane)
			.on('drag', onDragVisPane);

		d3.select('#vis-pane')
			.on('.drag', null)
			.call(dragBehaviour);

		function onStartDragVisPane(event) {
			var posX = self.posX;
			var posY = self.posY;
			var draggedOnScrollbar = $(event.sourceEvent.target)
				.closest('.scrollbar').length > 0;

			if (draggedOnScrollbar) return;
			self.setStartX(event.sourceEvent.pageX - posX);
			self.setStartY(event.sourceEvent.pageY - posY);
		}

		function onDragVisPane(event) {
			var startX = self.startX;
			var startY = self.startY
			var draggedOnScrollbar = $(event.sourceEvent.target)
				.closest('.scrollbar').length > 0;

			if (draggedOnScrollbar) return;
			self.setPosX(event.sourceEvent.pageX - startX);
			self.setPosY(event.sourceEvent.pageY - startY);
			self.transform();
		}
	},

	// setters

	setPosX: function(newPosX) {
		const self = this;
		var scale = self.scale;
		var scaledSVGWidth = $('#vis-pane svg').width() * scale;
		var visPaneWidth = $('#vis-pane').width();
		var xLowerBound = null, xUpperBound = null;

		if (scaledSVGWidth < visPaneWidth) {
			xLowerBound = 0;
			xUpperBound = 0;
		}
		if (scaledSVGWidth >= visPaneWidth) {
			xLowerBound = -(scaledSVGWidth - visPaneWidth);
			xUpperBound = 0;
		}

		if (newPosX < xLowerBound) newPosX = xLowerBound;
		if (newPosX > xUpperBound) newPosX = xUpperBound;

		self.posX = newPosX;
	},
	setPosY: function(newPosY) {
		const self = this;
		var scale = self.scale;
		var scaledSVGHeight = $('#vis-pane > svg').height() * scale;
		var visPaneHeight = $('#vis-pane').height();
		var yLowerBound = null, yUpperBound = null;
		var legendHeight = $('#vis-pane > .legend').is(":visible")
						 ? $('#vis-pane > .legend').outerHeight() : 0;

		if (scaledSVGHeight < visPaneHeight) {
			yLowerBound = 0;
			yUpperBound = 0;
		}
		if (scaledSVGHeight >= visPaneHeight) {
			yLowerBound = -(scaledSVGHeight - visPaneHeight) - legendHeight;
			yUpperBound = 0;
		}

		if (newPosY < yLowerBound) newPosY = yLowerBound;
		if (newPosY > yUpperBound) newPosY = yUpperBound;

		self.posY = newPosY;
	},
	setScale: function(newScale) {
		const self = this;
		var minScale = self.minScale;
		var maxScale = self.maxScale;

		if (newScale < minScale) newScale = minScale;
		if (newScale > maxScale) newScale = maxScale;
		self.scale = newScale;
	},
	setStartX: function(newStartX) {
		const self = this;

		self.startX = newStartX;
	},
	setStartY: function(newStartY) {
		const self = this;

		self.startY = newStartY;
	},
	setStartScale: function(newStartScale) {
		const self = this;

		self.startScale = newStartScale;
	},

	// transform

	transform: function() {
		const self = this;
		var posX = self.posX;
		var posY = self.posY;
		var scale = self.scale;

		var scaledSVGWidth = $('#vis-pane svg').width() * scale;
		var scaledSVGHeight = $('#vis-pane svg').height() * scale;
		var visPaneWidth = $('#vis-pane').width();
		var visPaneHeight = $('#vis-pane').height();

		var centreTranslateX = visPaneWidth / 2 - scaledSVGWidth / 2;
		var centreTranslateY = visPaneHeight / 2 - scaledSVGHeight / 2;
		var transformString = '';

		if (scaledSVGWidth >= visPaneWidth) centreTranslateX = 0;
		if (scaledSVGHeight >= visPaneHeight) centreTranslateY = 0;

		transformString = 'translate(' + posX + 'px,' + posY + 'px) ' +
						  'translate(' + centreTranslateX + 'px,' + centreTranslateY + 'px) ' +
						  'scale(' + scale + ')';

		$('#vis-pane > svg').css('transform', transformString);
		VisualizationPaneScrollbar.update();
	},

	// helpers

	getCentreTranslateX: function(scale) {
		var scaledSVGWidth = $('#vis-pane svg').width() * scale;
		var visPaneWidth = $('#vis-pane').width();
		var centreTranslateX = visPaneWidth / 2 - scaledSVGWidth / 2;
		if (scaledSVGWidth >= visPaneWidth) centreTranslateX = 0;
		return centreTranslateX;
	},
	getCentreTranslateY: function(scale) {
		var scaledSVGHeight = $('#vis-pane svg').height() * scale;
		var visPaneHeight = $('#vis-pane').height();
		var centreTranslateY = visPaneHeight / 2 - scaledSVGHeight / 2;
		if (scaledSVGHeight >= visPaneHeight) centreTranslateY = 0;
		return centreTranslateY;
	}
}