function FilterSlider(filterContentEl) {
	const self = this;

	self.filterContentEl = filterContentEl;
	self.slider = null;
}

FilterSlider.prototype.init = initFilterSlider;
FilterSlider.prototype.initHandleValues = initFilterSliderHandleValues;
FilterSlider.prototype.initDragBehaviour = initDragFilterSliderBehaviour;
FilterSlider.prototype.updateMinMax = updateFilterSliderMinMax;
FilterSlider.prototype.updateValues = updateFilterSliderValues;
FilterSlider.prototype.updateStep = updateFilterSliderStep;
FilterSlider.prototype.updateHandles = updateFilterSliderHandles;
FilterSlider.prototype.updateMinMaxText = updateFilterSliderMinMaxText;

function initFilterSlider() {
	const self = this;
	var filterContentEl = self.filterContentEl;

	self.slider = $(filterContentEl).find('input')
		.bootstrapSlider({
			tooltip: 'hide',
			min: 0, max: 10,
			value: [ 0, 10 ]
		});
}

function initFilterSliderHandleValues() {
	const self = this;
	var filterContentEl = self.filterContentEl;
	var slider = self.slider;
	var minHandleLeft = $(filterContentEl).find('.slider .min-slider-handle').position().left;
	var minHandleValue = slider.bootstrapSlider('getValue')[0];
	var maxHandleLeft = $(filterContentEl).find('.slider .max-slider-handle').position().left;
	var maxHandleValue = slider.bootstrapSlider('getValue')[1];

	// add the lines and the values
	$(filterContentEl).find('.slider')
		.prepend('<div class="min-handle-line"></div>');
	$(filterContentEl).find('.slider')
		.prepend('<div class="max-handle-line"></div>');
	$(filterContentEl).find('.slider')
		.prepend('<span class="min-handle-text"></span>');
	$(filterContentEl).find('.slider')
		.prepend('<span class="max-handle-text"></span>');

	// init the lines and the values
	$(filterContentEl).find('.min-handle-line')
		.css('left', minHandleLeft);
	$(filterContentEl).find('.max-handle-line')
		.css('left', maxHandleLeft);
	$(filterContentEl).find('.min-handle-text')
		.css('left', minHandleLeft)
		.html(minHandleValue);
	$(filterContentEl).find('.max-handle-text')
		.css('left', maxHandleLeft)
		.html(maxHandleValue);
}

function initDragFilterSliderBehaviour() {
	const self = this;
	var slider = self.slider;
	var changeSliderTimer = null;
	var filterCapsuleEl = self.filterContentEl.parentNode;

	slider.bootstrapSlider('on', 'change', function() {
		self.updateHandles();
		RangeFilter.changeSlider(filterCapsuleEl, slider); // update states

		// update vis after sliding is done
		clearTimeout(changeSliderTimer);
		changeSliderTimer = setTimeout(onSlidingEnd, 200);		
	});

	function onSlidingEnd() {
		RightColumn.update();
	}
}

function updateFilterSliderMinMax(min, max) {
	const self = this;
	var slider = self.slider;

	slider.bootstrapSlider('setAttribute', 'min', min);
	slider.bootstrapSlider('setAttribute', 'max', max);
}

function updateFilterSliderValues(range) {
	const self = this;
	var slider = self.slider;

	slider.bootstrapSlider('setValue', range);
}

function updateFilterSliderStep(step) {
	const self = this;
	var slider = self.slider;

	slider.bootstrapSlider('setAttribute', 'step', step);
}

function updateFilterSliderHandles() {
	const self = this;
	var filterContentEl = self.filterContentEl;
	var slider = self.slider;
	var minHandleLeft = $(filterContentEl).find('.slider .min-slider-handle').position().left;
	var minHandleValue = slider.bootstrapSlider('getValue')[0];
	var maxHandleLeft = $(filterContentEl).find('.slider .max-slider-handle').position().left
	var maxHandleValue = slider.bootstrapSlider('getValue')[1];

	$(filterContentEl).find('.min-handle-line')
		.css('left', minHandleLeft);
	$(filterContentEl).find('.max-handle-line')
		.css('left', maxHandleLeft);
	$(filterContentEl).find('.min-handle-text')
		.css('left', minHandleLeft)
		.html(minHandleValue);
	$(filterContentEl).find('.max-handle-text')
		.css('left', maxHandleLeft)
		.html(maxHandleValue);
}

function updateFilterSliderMinMaxText() {
	const self = this;
	var filterContentEl = self.filterContentEl;
	var slider = self.slider;
	var minValue = slider.bootstrapSlider('getAttribute', 'min');
	var maxValue = slider.bootstrapSlider('getAttribute', 'max');

	$(filterContentEl).find('.min-text').html(minValue);
	$(filterContentEl).find('.max-text').html(maxValue);
}