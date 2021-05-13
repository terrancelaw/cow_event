const VisualizationPaneControls = {
	scaleDelta: 1.4,

	init: function() {
		const self = this;

		self.initClickZoomInButtonBehaviour();
		self.initClickZoomOutButtonBehaviour();
		self.initHoverZoomButtonsBehaviour();
	},
	initClickZoomInButtonBehaviour: function() {
		const self = this;

		$('#vis-pane > .controls > .fa-search-plus')
			.on('click', onClickZoomInButton);

		function onClickZoomInButton() {
			var oldPosX = VisualizationPaneSVG.posX;
			var oldPosY = VisualizationPaneSVG.posY
			var oldScale = VisualizationPaneSVG.scale;
			var minScale = VisualizationPaneSVG.minScale;
			var maxScale = VisualizationPaneSVG.maxScale;
			var scaleDelta = self.scaleDelta;

			var centreX = $('#vis-pane').width() / 2;
			var centreY = $('#vis-pane').height() / 2;
			var oldCentreTranslateX = VisualizationPaneSVG.getCentreTranslateX(oldScale);
			var oldCentreTranslateY = VisualizationPaneSVG.getCentreTranslateY(oldScale);
			var targetX = (centreX - oldPosX - oldCentreTranslateX) / oldScale;
	    	var targetY = (centreY - oldPosY - oldCentreTranslateY) / oldScale;
	    	var newScale = (oldScale * scaleDelta < minScale) ? minScale : 
	    				   (oldScale * scaleDelta > maxScale ? maxScale : 
	    				  	oldScale * scaleDelta);
	    	var newCentreTranslateX = VisualizationPaneSVG.getCentreTranslateX(newScale);
	    	var newCentreTranslateY = VisualizationPaneSVG.getCentreTranslateY(newScale);
	    	var newPosX = centreX - (targetX * newScale + newCentreTranslateX);
	    	var newPosY = centreY - (targetY * newScale + newCentreTranslateY);

	    	VisualizationPaneSVG.setScale(newScale);
			VisualizationPaneSVG.setPosX(newPosX);
			VisualizationPaneSVG.setPosY(newPosY);
			VisualizationPaneSVG.transform();
		}
	},
	initClickZoomOutButtonBehaviour: function() {
		const self = this;
		
		$('#vis-pane > .controls > .fa-search-minus')
			.on('click', onClickZoomOutButton);

		function onClickZoomOutButton() {
			var oldPosX = VisualizationPaneSVG.posX;
			var oldPosY = VisualizationPaneSVG.posY
			var oldScale = VisualizationPaneSVG.scale;
			var minScale = VisualizationPaneSVG.minScale;
			var maxScale = VisualizationPaneSVG.maxScale;
			var scaleDelta = self.scaleDelta;

			var centreX = $('#vis-pane').width() / 2;
			var centreY = $('#vis-pane').height() / 2;
			var oldCentreTranslateX = VisualizationPaneSVG.getCentreTranslateX(oldScale);
			var oldCentreTranslateY = VisualizationPaneSVG.getCentreTranslateY(oldScale);
			var targetX = (centreX - oldPosX - oldCentreTranslateX) / oldScale;
	    	var targetY = (centreY - oldPosY - oldCentreTranslateY) / oldScale;
	    	var newScale = (oldScale / scaleDelta < minScale) ? minScale : 
	    				   (oldScale / scaleDelta > maxScale ? maxScale : 
	    				  	oldScale / scaleDelta);
	    	var newCentreTranslateX = VisualizationPaneSVG.getCentreTranslateX(newScale);
	    	var newCentreTranslateY = VisualizationPaneSVG.getCentreTranslateY(newScale);
	    	var newPosX = centreX - (targetX * newScale + newCentreTranslateX);
	    	var newPosY = centreY - (targetY * newScale + newCentreTranslateY);

	    	VisualizationPaneSVG.setScale(newScale);
			VisualizationPaneSVG.setPosX(newPosX);
			VisualizationPaneSVG.setPosY(newPosY);
			VisualizationPaneSVG.transform();
		}
	},
	initHoverZoomButtonsBehaviour: function() {
		$('#vis-pane > .controls > .fa')
			.on('mouseenter', onMouseenterZoomButton)
			.on('mouseleave', onMouseleaveZoomButton);

		function onMouseenterZoomButton() {
			var offset = $(this).offset();
			var height = $(this).height();
			var tooltipText = $(this).attr('tooltip');
			
			$('#tooltip')
				.removeClass()
				.removeAttr('style')
				.empty()
				.addClass('zoom')
				.css('left', offset.left)
				.css('top', offset.top + height)
				.html(tooltipText);
		}

		function onMouseleaveZoomButton() {
			$('#tooltip')
				.removeClass()
				.removeAttr('style')
				.empty();
		}
	}
}