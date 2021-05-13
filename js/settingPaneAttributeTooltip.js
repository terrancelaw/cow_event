const SettingPaneAttributeTooltip = {
	show: function(name, hoveredEl) {
		const self = this;
		var nameEl = $(hoveredEl).find('.name').length == 0 
				   ? hoveredEl : $(hoveredEl).find('.name')[0];
		var width = $(hoveredEl).width();
		var offset = $(hoveredEl).offset();
		var text = $(nameEl).text();
		var isContentOverflown = self.isOverflown(nameEl)
		var contentDiffFromOriginal = name != text;
		var isCategory = $(hoveredEl).hasClass('category');

		if (isContentOverflown || contentDiffFromOriginal)
			$('#tooltip')
				.removeClass()
				.removeAttr('style')
				.empty()
				.addClass('attribute')
				.css('left', offset.left + width + 8 + 5)
				.css('top', offset.top + 8)
				.html(name);

		if (isCategory && (isContentOverflown || contentDiffFromOriginal))
			$('#tooltip')
				.css('top', offset.top + 4)

		if (!isContentOverflown && !contentDiffFromOriginal)
			$('#tooltip')
				.removeClass()
				.removeAttr('style')
				.empty();
	},
	simplyShow: function(left, top, text) {
		$('#tooltip')
			.removeClass()
			.removeAttr('style')
			.empty()
			.addClass('attribute')
			.css('left', left)
			.css('top', top)
			.html(text);
	},
	updateText: function(text) {
		$('#tooltip')
			.html(text);
	},
	hide: function() {
		$('#tooltip')
			.removeClass()
			.removeAttr('style')
			.empty();
	},

	// helpers

	isOverflown: function(nameEl) {
		return nameEl.scrollWidth >  $(nameEl).innerWidth();
	}
}