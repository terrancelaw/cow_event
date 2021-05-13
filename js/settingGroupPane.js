const SettingGroupPane = {
	show: function() {
		const self = this;
		var countryAttributeList = Database.entityList.country;
		$('#setting-pane > .settings').removeClass('visualize');
		$('#setting-pane > .settings').removeClass('group');
		$('#setting-pane > .settings').removeClass('filter');
		$('#setting-pane > .settings').removeClass('encode');
		$('#setting-pane > .settings').removeClass('highlight');
		$('#setting-pane > .settings').removeClass('other');
		$('#setting-pane > .settings').addClass('group');
		self.showSearchBox();
		self.drawAttributes(countryAttributeList);
		self.initClickAttributeBehaviour();
		self.initHoverAttributeBehavior();
		self.initSearchBoxBehaviour();
		$('#setting-pane > .settings').scrollTop(0);
	},
	showSearchBox: function() {
		$('#setting-pane > .search-box')
			.css('display', '');
	},
	drawAttributes: function(countryAttributeList) {
		const self = this;

		if (countryAttributeList.length > 0)
			$('#setting-pane > .settings')
				.append('<div class="title">Country Attributes</div>');

		for (var i = 0; i < countryAttributeList.length; i++) {
			var attributeData = countryAttributeList[i];
			var attributeName = attributeData.attributeName;
			var attributeType = attributeData.attributeType;
			var typeClass = attributeType == 'categorical' ? 'fa-font' : 'fa-hashtag';
			var attributeHTML = self.generateAttributeHTML(attributeName, typeClass);
			var previouslySelected = State.searchGroupState(attributeData) !== null;
			var addedAttributeEl = null;

			if (!previouslySelected) {
				$('#setting-pane > .settings').append(attributeHTML);
				addedAttributeEl = $('#setting-pane > .settings > .attribute').last()[0];
				d3.select(addedAttributeEl).datum(attributeData);
			}
			else if (previouslySelected) {
				$('#setting-pane > .settings').append(attributeHTML);
				addedAttributeEl = $('#setting-pane > .settings > .attribute').last()[0];
				d3.select(addedAttributeEl).datum(attributeData);
				$(addedAttributeEl).addClass('selected');
			}
		}
	},
	initClickAttributeBehaviour: function() {
		$('#setting-pane > .settings.group > .attribute')
			.on('click', onClickGroupPaneAttributeBehaviour);

		function onClickGroupPaneAttributeBehaviour() {
			var isSelected = $(this).hasClass('selected');
			var attributeData = d3.select(this).datum();

			// remove attribute
			if (isSelected) {
				$(this).removeClass('selected');
				State.removeGroupState(attributeData);
				RightColumn.update();
			}

			// add attribute
			else if (!isSelected) {
				$(this).addClass('selected');
				State.addGroupState('countryAttribute', attributeData);
				RightColumn.update();
			}
		}
	},
	initHoverAttributeBehavior: function() {
		$('#setting-pane > .settings.group > .attribute')
			.unbind('mouseover').unbind('mouseout')
			.on('mouseover', onMouseoverGroupPaneAttributeBehaviour)
			.on('mouseout', onMouseoutGroupPaneAttributeBehaviour);

		function onMouseoverGroupPaneAttributeBehaviour() {
			var data = d3.select(this).datum();
			var name = data.attributeName;

			$(this).addClass('hover');
			SettingPaneAttributeTooltip.show(name, this);
		}

		function onMouseoutGroupPaneAttributeBehaviour() {
			$(this).removeClass('hover');
			SettingPaneAttributeTooltip.hide();
		}
	},
	initSearchBoxBehaviour: function() {
		const self = this;

		$('#setting-pane > .search-box > input')
			.unbind('input')
			.on('input', onInputSearchQuery);

		function onInputSearchQuery() {
			var searchQueryInLowerCase = $(this).val().toLowerCase();

			if (searchQueryInLowerCase == '') {
				var countryAttributeList = Database.entityList.country;
				SettingPane.empty();
				self.drawAttributes(countryAttributeList);
				self.initClickAttributeBehaviour();
				self.initHoverAttributeBehavior();
			}

			else if (searchQueryInLowerCase != '') {
				self.markVariables(searchQueryInLowerCase);
				self.filterGroups(searchQueryInLowerCase);
				self.filterTitle();
			}
		}
	},

	// initSearchBoxBehaviour

	markVariables: function(searchQueryInLowerCase) {
		var markInstance = new Mark(document.querySelectorAll('#setting-pane > .settings.group'));

		markInstance.unmark({
	  		done: function(){
	    		markInstance.mark(searchQueryInLowerCase, {
    				'separateWordSearch': false,
    				'diacritics': false
	    		});
	    	}
	  	});
	},
	filterGroups: function(searchQueryInLowerCase) {
		$('#setting-pane > .settings.group > .attribute').each(function() {
			var attributeData = d3.select(this).datum();
			var attributeName = attributeData.attributeName;
			var attributeNameInLowerCase = attributeName.toLowerCase();
			var foundSearchQuery = attributeNameInLowerCase.indexOf(searchQueryInLowerCase) != -1;
			if (foundSearchQuery) $(this).css('display', '')
			else if (!foundSearchQuery) $(this).css('display', 'none');
		});
	},
	filterTitle: function() {
		var attributeTitleEl = $('#setting-pane > .settings.group > .title')[0];
		var attributeHasContent = false;
		var currentEl = $(attributeTitleEl).next()[0];
		var isCurrentAttribute = $(currentEl).hasClass('attribute');

		while (isCurrentAttribute) {
			if ($(currentEl).is(':visible')) {
				attributeHasContent = true; break;
			}
			currentEl = $(currentEl).next()[0];
			isCurrentAttribute = $(currentEl).hasClass('attribute');
		}

		if (attributeHasContent) $(attributeTitleEl).css('display', '');
		else if (!attributeHasContent) $(attributeTitleEl).css('display', 'none');
	},

	// helpers

	generateAttributeHTML: function(attributeName, typeClass) {
		return '<div class="attribute">' +
					'<span class="fa ' + typeClass + ' type"></span>' +
					'<span class="name">' + attributeName + '</span>' +
				'</div>';
	}
}