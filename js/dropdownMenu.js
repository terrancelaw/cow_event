function DropdownMenu(dropdownEl, dropdownName, dropdownList, onClickListItem, isDisabled, defaultSelection = null) {
	const self = this;

	self.dropdownEl = dropdownEl;
	self.dropdownName = dropdownName;
	self.dropdownList = dropdownList;
	self.onClickListItem = onClickListItem;
	self.isDisabled = isDisabled;
	self.defaultSelection = defaultSelection;

	if (isDisabled) {
		self.initName();
		self.addDropdownObjectToEl();
		self.addDisabledClass();
	}
	else if (!isDisabled) {
		self.initName();
		self.addDropdownObjectToEl();
		self.addDisabledClass();
		self.initDefaultSelection();
		self.initClickButtonBehaviour();
	}
}

DropdownMenu.prototype.initName = initDropdownMenuName;
DropdownMenu.prototype.addDropdownObjectToEl = addDropdownObjectToEl;
DropdownMenu.prototype.addDisabledClass = addDisabledClassForDropdownMenu;
DropdownMenu.prototype.initDefaultSelection = initDropdownDefaultSelection;
DropdownMenu.prototype.initClickButtonBehaviour = initClickDropdownButtonBehaviour;

DropdownMenu.prototype.appendContainerToDropdownMenu = appendContainerToDropdownMenu;
DropdownMenu.prototype.appendListItemsToDropdownMenu = appendListItemsToDropdownMenu;
DropdownMenu.prototype.initSearchBoxBehaviour = initDropdownSearchBoxBehaviour;
DropdownMenu.prototype.initClickListItemBehaviour = initClickDropdownListItemBehaviour;
DropdownMenu.prototype.showDropdownMenu = showDropdownMenu;

DropdownMenu.prototype.closeDropdownMenu = closeDropdownMenu;
DropdownMenu.prototype.updateDropdownMenu = updateDropdownMenu;

function initDropdownMenuName() {
	const self = this;
	var dropdownEl = self.dropdownEl;
	var dropdownName = self.dropdownName;

	$(dropdownEl).find('.name')
		.html(dropdownName);
}

function addDropdownObjectToEl() {
	const self = this;
	var dropdownEl = self.dropdownEl;

	d3.select(dropdownEl).datum(self);
}

function addDisabledClassForDropdownMenu() {
	const self = this;
	var dropdownEl = self.dropdownEl;
	var isDisabled = self.isDisabled;

	if (isDisabled)
		$(dropdownEl).addClass('disabled');
	else if (!isDisabled)
		$(dropdownEl).removeClass('disabled');
}

function initDropdownDefaultSelection() {
	const self = this;
	var dropdownList = self.dropdownList;
	var defaultSelection = self.defaultSelection;
	var dropdownEl = self.dropdownEl;
	var defaultSelectionExist = false;

	// check if defaultSelectionExist
	for (var i = 0; i < dropdownList.length; i++)
		if (dropdownList[i] == defaultSelection) 
			{ defaultSelectionExist = true; break; }

	// if defaultSelectionExist
	if (defaultSelectionExist) {
		$(dropdownEl).find('.open-menu-button > .button-text')
			.html(defaultSelection);
	}

	// if not defaultSelectionExist
	else if (!defaultSelectionExist) {
		self.defaultSelection = null;
		$(dropdownEl).find('.open-menu-button > .button-text')
			.html('');
	}
}

function initClickDropdownButtonBehaviour() {
	const self = this;
	var dropdownEl = self.dropdownEl;

	$(dropdownEl)
		.unbind('click')
		.on('click', clickDropdownButton);

	function clickDropdownButton() {
		$('#dropdown-menu')
			.removeClass()
			.removeAttr('style')
			.empty();

		self.appendContainerToDropdownMenu();
		self.appendListItemsToDropdownMenu();
		self.initSearchBoxBehaviour();
		self.initClickListItemBehaviour();
		self.showDropdownMenu();
	}
}

function appendContainerToDropdownMenu() {
	var searchBoxHTML = '<div class="search-box">' +
							'<input type="text">' +
							'<span class="fa fa-search"></span>' +
						'</div>';
	var containerHTML = '<div class="container"></div>';

	$('#dropdown-menu')
		.append(searchBoxHTML)
		.append(containerHTML);
}

function appendListItemsToDropdownMenu() {
	const self = this;
	var dropdownList = self.dropdownList;

	for (var i = 0; i < dropdownList.length; i++) {
		var listItem = dropdownList[i];
		var listItemHTML = '<div class="item">' + listItem + '</div>';
		var addedListItemEl = null;

		$('#dropdown-menu').find('.container').append(listItemHTML);
		addedListItemEl = $('#dropdown-menu > .container > .item').last()[0];
		d3.select(addedListItemEl).datum(listItem);
	}
}

function initDropdownSearchBoxBehaviour() {
	const self = this;

	$('#dropdown-menu > .search-box > input')
		.unbind('input')
		.on('input', onInputSearchQuery);

	function onInputSearchQuery() {
		var searchQueryInLowerCase = $(this).val().toLowerCase();

		if (searchQueryInLowerCase == '') {
			showAllListItems();
			markMatchedString(searchQueryInLowerCase);
		}
		else if (searchQueryInLowerCase != '') {
			showMatchedListItems(searchQueryInLowerCase);
			markMatchedString(searchQueryInLowerCase);
		}
	}

	function showAllListItems() {
		$('#dropdown-menu > .container > .item').each(function() {
			$(this).css('display', '');
		});
	}

	function showMatchedListItems(searchQueryInLowerCase) {
		$('#dropdown-menu > .container > .item').each(function() {
			var data = d3.select(this).datum();
			var listItemInLowerCase = data.toLowerCase();
			var queryFoundInListItem = listItemInLowerCase.indexOf(searchQueryInLowerCase) != -1;
			if (queryFoundInListItem) $(this).css('display', '');
			else if (!queryFoundInListItem) $(this).css('display', 'none');
		});
	}

	function markMatchedString(searchQueryInLowerCase) {
		var markInstance = new Mark(document.querySelectorAll('#dropdown-menu > .container'));

		markInstance.unmark({
	  		done: function(){
	    		markInstance.mark(searchQueryInLowerCase, {
    				'separateWordSearch': false,
    				'diacritics': false
	    		});
	    	}
	  	});
	}
}

function initClickDropdownListItemBehaviour() {
	const self = this;

	$('#dropdown-menu > .container > .item')
		.unbind('click')
		.on('click', onClickDropdownMenuItem);

	function onClickDropdownMenuItem() {
		var data = d3.select(this).datum();

		self.closeDropdownMenu();
		self.updateDropdownMenu(data);
		self.onClickListItem(data);
	}
}

function showDropdownMenu() {
	const self = this;
	var dropdownEl = self.dropdownEl;
	var dropdownList = self.dropdownList;
	var dropdownButtonEl = $(dropdownEl).find('.open-menu-button');
	var dropdownNameEl = $(dropdownEl).find('.name')[0];
	var dropdownNameHeight = $(dropdownNameEl).outerHeight();
	var dropdownButtonOffset = $(dropdownButtonEl).offset();
	var dropdownButtonHeight = $(dropdownButtonEl).outerHeight();
	var dropdownButtonWidth = $(dropdownButtonEl).outerWidth();
	var dropdownButtonTop = dropdownButtonOffset.top - 8 - 8 + dropdownNameHeight + 6;
	var dropdownButtonLeft = dropdownButtonOffset.left - 8;
	var windowHeight = $(window).height();
	var dropdownMenuHeight = 0; // estimate
	var isYOverflown = null;

	dropdownMenuHeight = dropdownList.length * 33 + 41
	if (dropdownMenuHeight > 180) dropdownMenuHeight = 180;
	isYOverflown = dropdownButtonTop + dropdownButtonHeight + dropdownMenuHeight > windowHeight;

	if (!isYOverflown)
		$('#dropdown-menu')
			.addClass('dropdown-menu-items')
			.addClass('top-arrow')
			.addClass('show')
			.css('width', dropdownButtonWidth)
			.css('top', dropdownButtonTop + dropdownButtonHeight + 8)
			.css('left', dropdownButtonLeft + dropdownButtonWidth / 2);

	else if (isYOverflown)
		$('#dropdown-menu')
			.addClass('dropdown-menu-items')
			.addClass('bottom-arrow')
			.addClass('show')
			.css('width', dropdownButtonWidth)
			.css('top', dropdownButtonTop - dropdownButtonHeight - 3)
			.css('left', dropdownButtonLeft + dropdownButtonWidth / 2);

	// add class to dropdown for changing visual
	$(dropdownEl).addClass('opened');
}

function closeDropdownMenu() {
	const self = this;
	var dropdownEl = self.dropdownEl;

	$('#dropdown-menu')
		.removeClass()
		.removeAttr('style')
		.empty();

	// remove class from dropdown for changing visual
	$(dropdownEl).removeClass('opened');
}

function updateDropdownMenu(data) {
	const self = this;
	var dropdownEl = self.dropdownEl;

	$(dropdownEl).find('.open-menu-button > .button-text')
		.html(data);
}
