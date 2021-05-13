const Configuration = {

	// files

	entityFileList: [
		'countries.csv'
	],
	timeSeriesFileList: [
		'total_population.csv',
		'military_expenditures.csv',
		'military_personnel.csv'
	],
	eventFileList: [
		'wars_interval_events.csv',
		'wars_point_events.csv',
		'defense_agreements_interval_events.csv',
		'defense_agreements_point_events.csv'
	],

	// event file data

	eventFileData: {
		'wars_interval_events.csv': {
			stageDataList: [{ 
				startYear: 'startYear', 
				endYear: 'endYear', 
				eventName: 'war ongoing'
			}]
		},
		'defense_agreements_interval_events.csv': {
			stageDataList: [{ 
				startYear: 'signYear', 
				endYear: 'endYearEstimated', 
				eventName: 'defense cooperation agreement'
			}]
		},
		'wars_point_events.csv': {
			stageDataList: []
		},
		'defense_agreements_point_events.csv': {
			stageDataList: []
		}
	},

	// hidden time series and events

	hiddenTimeSeries: [],
	hiddenPointEvents: [],
	hiddenIntervalEvents: []
};