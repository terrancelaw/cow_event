function HighlightSlider(highlightContentEl) {
	const self = this;

	self.highlightContentEl = highlightContentEl;
	self.slider = null;
}

HighlightSlider.prototype.init = initHighlightSlider;
HighlightSlider.prototype.initHandleValues = initHighlightSliderHandleValues;
HighlightSlider.prototype.initDragBehaviour = initDragHighlightSliderBehaviour;
HighlightSlider.prototype.updateMinMax = updateHighlightSliderMinMax;
HighlightSlider.prototype.updateValues = updateHighlightSliderValues;
HighlightSlider.prototype.updateStep = updateHighlightSliderStep;
HighlightSlider.prototype.updateHandles = updateHighlightSliderHandles;
HighlightSlider.prototype.updateMinMaxText = updateHighlightSliderMinMaxText;

function initHighlightSlider() {
	const self = this;
	var highlightContentEl = self.highlightContentEl;

	self.slider = $(highlightContentEl).find('input')
		.bootstrapSlider({
			tooltip: 'hide',
			min: 0, max: 10,
			value: [ 0, 10 ]
		});
}

function initHighlightSliderHandleValues() {
	const self = this;
	var highlightContentEl = self.highlightContentEl;
	var slider = self.slider;
	var minHandleLeft = $(highlightContentEl).find('.slider .min-slider-handle').position().left;
	var minHandleValue = slider.bootstrapSlider('getValue')[0];
	var maxHandleLeft = $(highlightContentEl).find('.slider .max-slider-handle').position().left;
	var maxHandleValue = slider.bootstrapSlider('getValue')[1];

	// add the lines and the values
	$(highlightContentEl).find('.slider')
		.prepend('<div class="min-handle-line"></div>');
	$(highlightContentEl).find('.slider')
		.prepend('<div class="max-handle-line"></div>');
	$(highlightContentEl).find('.slider')
		.prepend('<span class="min-handle-text"></span>');
	$(highlightContentEl).find('.slider')
		.prepend('<span class="max-handle-text"></span>');

	// init the lines and the values
	$(highlightContentEl).find('.min-handle-line')
		.css('left', minHandleLeft);
	$(highlightContentEl).find('.max-handle-line')
		.css('left', maxHandleLeft);
	$(highlightContentEl).find('.min-handle-text')
		.css('left', minHandleLeft)
		.html(minHandleValue);
	$(highlightContentEl).find('.max-handle-text')
		.css('left', maxHandleLeft)
		.html(maxHandleValue);
}

function initDragHighlightSliderBehaviour() {
	const self = this;
	var slider = self.slider;
	var changeSliderTimer = null;
	var highlightCapsuleEl = self.highlightContentEl.parentNode;

	slider.bootstrapSlider('on', 'change', function() {
		self.updateHandles();
		RangeHighlight.changeSlider(highlightCapsuleEl, slider); // update states

		// update vis after sliding is done
		clearTimeout(changeSliderTimer);
		changeSliderTimer = setTimeout(onSlidingEnd, 200);		
	});

	function onSlidingEnd() {
		RightColumn.update();
	}
}

function updateHighlightSliderMinMax(min, max) {
	const self = this;
	var slider = self.slider;

	slider.bootstrapSlider('setAttribute', 'min', min);
	slider.bootstrapSlider('setAttribute', 'max', max);
}

function updateHighlightSliderValues(range) {
	const self = this;
	var slider = self.slider;

	slider.bootstrapSlider('setValue', range);
}

function updateHighlightSliderStep(step) {
	const self = this;
	var slider = self.slider;

	slider.bootstrapSlider('setAttribute', 'step', step);
}

function updateHighlightSliderHandles() {
	const self = this;
	var highlightContentEl = self.highlightContentEl;
	var slider = self.slider;
	var minHandleLeft = $(highlightContentEl).find('.slider .min-slider-handle').position().left;
	var minHandleValue = slider.bootstrapSlider('getValue')[0];
	var maxHandleLeft = $(highlightContentEl).find('.slider .max-slider-handle').position().left
	var maxHandleValue = slider.bootstrapSlider('getValue')[1];

	$(highlightContentEl).find('.min-handle-line')
		.css('left', minHandleLeft);
	$(highlightContentEl).find('.max-handle-line')
		.css('left', maxHandleLeft);
	$(highlightContentEl).find('.min-handle-text')
		.css('left', minHandleLeft)
		.html(minHandleValue);
	$(highlightContentEl).find('.max-handle-text')
		.css('left', maxHandleLeft)
		.html(maxHandleValue);
}

function updateHighlightSliderMinMaxText() {
	const self = this;
	var highlightContentEl = self.highlightContentEl;
	var slider = self.slider;
	var minValue = slider.bootstrapSlider('getAttribute', 'min');
	var maxValue = slider.bootstrapSlider('getAttribute', 'max');

	$(highlightContentEl).find('.min-text').html(minValue);
	$(highlightContentEl).find('.max-text').html(maxValue);
}