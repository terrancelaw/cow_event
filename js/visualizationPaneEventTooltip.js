const VisualizationPaneEventTooltip = {
	show: function(left, top, eventRow) {
		const self = this;

		$('#tooltip')
			.removeClass()
			.removeAttr('style')
			.empty();

		self.initTooltip(left, top);
		self.drawContent(eventRow);
		self.adjustPosition(left, top);
	},
	hide: function() {
		$('#tooltip')
			.removeClass()
			.removeAttr('style')
			.empty();
	},

	// show

	initTooltip: function(left, top) {
		const self = this;

		$('#tooltip')
			.addClass('event')
			.css('left', left + 8)
			.css('top', top + 8);
	},
	drawContent: function(eventRow) {
		const self = this;
		var eventColor = VisualizationPane.getColor(eventRow.eventName);

		self.appendAttributeName('eventName');
		self.appendAttributeValue(eventRow.eventName)
			.css('grid-column', '2/5')
				.find('.cell > span')
				.css('color', eventColor)
				.css('font-weight', 'bold')
				.css('border', hexToRGB(eventColor, 0.5) + ' 1px solid')
				.css('background', hexToRGB(eventColor, 0.02));
		self.appendAttributeName('startYear');
		self.appendAttributeValue(eventRow.startYear);
		self.appendAttributeName('endYear');
		self.appendAttributeValue(eventRow.endYear);

		for (var attributeName in eventRow) {
			var attributeValue = eventRow[attributeName];
			var isShown = attributeName != 'ID' && attributeName != 'eventID' &&
						  attributeName != 'eventName' && attributeName != 'startYear' && attributeName != 'endYear';

			if (isShown) {
				self.appendAttributeName(attributeName);
				self.appendAttributeValue(attributeValue);
			}
		}

		function hexToRGB(hex, alpha) {
		    var r = parseInt(hex.slice(1, 3), 16),
		        g = parseInt(hex.slice(3, 5), 16),
		        b = parseInt(hex.slice(5, 7), 16);
		    if (alpha) return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
		    else return "rgb(" + r + ", " + g + ", " + b + ")";
		}
	},
	adjustPosition: function(left, top) {
		const self = this;
		var tooltipWidth = $('#tooltip').outerWidth();
		var tooltipHeight = $('#tooltip').outerHeight();
		var windowWidth = $(window).outerWidth();
		var windowHeight = $(window).outerHeight();

		if (left + 8 + tooltipWidth > windowWidth)
			$('#tooltip').css('left', left - tooltipWidth - 8);
		if (top + 8 + tooltipHeight > windowHeight)
			$('#tooltip').css('top', top - tooltipHeight - 8);
	},

	// helpers

	appendAttributeName: function(attributeName) {
		var $attributeName = $('<div class="attribute-name">' + attributeName + ':</div>')
			.appendTo('#tooltip.event');

		return $attributeName;
	},
	appendAttributeValue: function(attributeValue) {
		var $attributeValue = $(
			'<div class="attribute-value">' + 
				'<div class="cell"><span>' + (attributeValue === null ? 'null' : attributeValue) + '</span></div>' +
		  	'</div>'
		).appendTo('#tooltip.event');

		return $attributeValue;
	}
}