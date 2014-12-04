var cdcApp = angular.module('cdcApp', ['highcharts-ng'])
  .constant('cdcConfig', {
    'HOSTNAME': 'http://localhost:9090/'
  });

cdcApp.controller('CDCController', ['$scope', 'UtilService',
  function($scope, UtilService) {

  $scope.filters = [
    {
      filterType: 'year',
      label: 'Year',
      type: 'select',
      options: '',
      selectedOption: '2011',
      multiple: false,
      getData: function(filterObj) {
        console.log(filterObj);

        UtilService.ajaxCall('/api/years', '', function(data) {
            filterObj.options = data;
        });
      }
    },
    {
      filterType: 'state',
      label: 'State',
      type: 'select',
      options: '',
      selectedOption: 'ALL',
      multiple: false,
      getData: function(filterObj) {
        console.log(filterObj);

        UtilService.ajaxCall('/api/states', '', function(data) {
          filterObj.options = data;
        });
      }
    },
    {
      filterType: 'gender',
      label: 'Gender',
      type: 'select',
      options: '',
      selectedOption: 'M',
      multiple: false,
      getData: function(filterObj) {
        console.log(filterObj);
        UtilService.ajaxCall('/api/gender', '', function(data) {
          filterObj.options = data;
        });
      }
    },
    {
      filterType: 'race',
      label: 'Race',
      type: 'select',
      options: '',
      selectedOption: 'black',
      multiple: true,

      getData: function(filterObj) {
        console.log(filterObj);
        UtilService.ajaxCall('/api/races', '', function(data) {
          filterObj.options = data;
        });
      }
    },
    {
      filterType: 'site',
      type: 'select',
      label: 'Cancer Site',
      options: '',
      multiple: false,
      selectedOption: '',
      getData: function(filterObj) {
        console.log(filterObj);
        UtilService.ajaxCall('/api/sites', '', function(data) {
          filterObj.options = data;
        });
      }
    },
    {
      filterType: 'rate_lt',
      label: 'Rate <',
      options: '',
      selectedOption: '',
      type: 'text',
      maxlength: '3',
      getData: function(filterObj) {
        console.log(filterObj);
      }
    },
    {
      filterType: 'rate_gt',
      label: 'Rate >',
      options: '',
      selectedOption: '',
      type: 'text',
      maxlength: '3',
      getData: function(filterObj) {
        console.log(filterObj);
      }
    }
];

  $scope.charts = [
    {
      type: 'column',
      width: 900,
      height: 470
    },
    {
      type: 'pie',
      width: 900,
      height: 470
    },
    {
      type: 'line',
      width: 900,
      height: 470
    }
  ];

  /**
   * Start of Scope methods
   */

  $scope.redrawChart = function(chart) {
    $scope.chartData.chartType = chart.type;
  };

  /** Watch for changes in chartData and draw the graph */
  $scope.$watch('chartData', function() {
    $scope.highchartsNG = UtilService.getChartConfig($scope.chartData);
  }, true);


  $scope.getResults = function(filter) {
    filter.selectedOption = filter.selectedFilter;
    var queryParams = UtilService.collectQueryParams($scope.filters, filter);

    UtilService.ajaxCall('/api/stats',
      queryParams, function(data) {
        //console.log('in callback ', data);

        var seriesData = [];
        var categoriesArray = [];

        var races = _.find($scope.filters, {filterType: 'race'}).selectedOption;
        if (typeof races == 'object') {
          _.forEach(races, function(race) {
            var seriesObj = {};
            seriesObj.name = race.toLowerCase();
            seriesObj.data = [];
            seriesData.push(seriesObj);
          });
        } else {
          var seriesObj = {};
          seriesObj.name = races.toLowerCase();
          seriesObj.data = [];
          seriesData.push(seriesObj);
        }

        //console.log('seriesData ', seriesData);
        //console.log('data ', data);

        _.forEach(data, function(race) {
          _.forEach(race, function(value)  {
            console.log('race ', value);
            var found = _.find(seriesData, {name: value.race});
            if (typeof found != 'undefined') {
              found.data.push(value.rate);
            }

            if (_.isEmpty(categoriesArray[value.site])) {
              categoriesArray[value.site] = value.site;
            }
          });
        });

        //console.log('categories data ', categoriesArray);
        $scope.chartData = {
          chartType: ($scope.chartData &&
                        $scope.chartData.chartType)|| 'column',

          categories: _.keys(categoriesArray),
          seriesData: seriesData
        };
      });
  };

  $scope.invokeFn = function(filter) {
    //console.log('filter', filter);
    (filter.getData).call(this, filter);
  };

}]);