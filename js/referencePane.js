const ReferencePane = {
	init: function() {
		const self = this;

		self.initHoverOpenButtonBehaviour();
		self.initClickOpenButtonBehaviour();
		self.initClickCloseButtonBehaviour();
		self.initClickBackgroundBehaviour();
	},
	initHoverOpenButtonBehaviour: function() {
		$('#vis-pane > .info-button')
			.on('mouseenter', onMouseenterOpenButton)
			.on('mouseleave', onMouseleaveOpenButton);

		function onMouseenterOpenButton() {
			var offset = $(this).offset();
			var height = $(this).height();
			var width = $(this).width();
			var tooltipText = $(this).attr('tooltip');

			$('#tooltip')
				.removeClass()
				.removeAttr('style')
				.empty()
				.addClass('reference')
				.css('left', offset.left - 8 + width - 8)
				.css('top', offset.top + height)
				.css('transform', 'translateX(-100%)')
				.html(tooltipText);
		}

		function onMouseleaveOpenButton() {
			$('#tooltip')
				.removeClass()
				.removeAttr('style')
				.empty();
		}
	},
	initClickOpenButtonBehaviour: function() {
		$('#vis-pane > .info-button')
			.on('click', onClickOpenButton);

		function onClickOpenButton() {
			$('#reference-pane')
				.css('display', 'flex');
		}
	},
	initClickCloseButtonBehaviour: function() {
		$('#reference-pane > .window > .close-button')
			.on('click', onClickCloseButton);

		function onClickCloseButton() {
			$('#reference-pane')
				.css('display', 'none');
		}
	},
	initClickBackgroundBehaviour: function() {
		$('#reference-pane > .background')
			.on('click', onClickBackground);

		function onClickBackground() {
			$('#reference-pane')
				.css('display', 'none');
		}
	}
}