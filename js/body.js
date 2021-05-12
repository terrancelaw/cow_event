const Body = {
	init: function() {
		const self = this;

		self.disableBackButton();
		self.initClickBehaviour();
	},
	disableBackButton: function() {
		if (history.pushState != undefined)
			history.pushState(null, null, location.href);

		history.back();
		history.forward();
		window.onpopstate = function () { history.go(1) };
	},
	initClickBehaviour: function() {
		const self = this;

		$('body').on('click', function(event) {
			for (let currentEventID in ClickEventListener.clickEvents) {
				let currentTargetSelectors = ClickEventListener.clickEvents[currentEventID].targetSelectorArray;
				let currentNotApplicableElSelectors = ClickEventListener.clickEvents[currentEventID].notApplicableElSelectorArray;
				let isClickedElOneOfTargets = clickedElInSelectorArray(event.target, currentTargetSelectors);
				let isClickedElOneOfNotApplicableEl = clickedElInSelectorArray(event.target, currentNotApplicableElSelectors);

				if (!isClickedElOneOfNotApplicableEl && isClickedElOneOfTargets)
					ClickEventListener.clickEvents[currentEventID].onClick(event);
				else if (!isClickedElOneOfNotApplicableEl && !isClickedElOneOfTargets)
					ClickEventListener.clickEvents[currentEventID].onNotClick(event);
			}
		});

		function clickedElInSelectorArray(clickedEl, selectorArray) {
			for (let i = 0; i < selectorArray.length; i++) {
				let currentSelector = selectorArray[i];
				let isClickedElInSelectorArray = $(clickedEl).closest(currentSelector).length > 0;

				if (isClickedElInSelectorArray)
					return true;
			}

			return false;
		}
	},

	// loader

	showLoader: function() {
		$('body  > .loader').css('display', 'block');
	},
	hideLoader: function() {
		$('body > .loader').css('display', 'none');
	}
}