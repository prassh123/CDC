var cdcApp = angular.module('cdcApp', ['highcharts-ng']);

cdcApp.controller('CDCController', ['$scope', '$http', function($scope, $http) {

  var hostname='http://localhost:9090';
  $scope.filters = [
    {
      filterType: 'year',
      label: 'Year',
      options: '',
      selectedOption: '2011',
      getData: function(filterObj) {
        console.log(filterObj);
        $http.get(hostname + '/api/years').success(function(data) {
          filterObj.options = data;
        });
      }
    },
    {
      filterType: 'state',
      label: 'State',
      options: '',
      selectedOption: 'ALL',
      getData: function(filterObj) {
        console.log(filterObj);
        $http.get(hostname + '/api/states').success(function(data) {
          filterObj.options = data;
        });
      }
    },
    {
      filterType: 'gender',
      label: 'Gender',
      options: '',
      selectedOption: 'M',

      getData: function(filterObj) {
      console.log(filterObj);
        $http.get(hostname + '/api/gender').success(function(data) {
          filterObj.options = data;
        });
      }
    },
    {
      filterType: 'race',
      label: 'Race',
      options: '',
      selectedOption: 'black',
      multiple: true,

      getData: function(filterObj) {
        console.log(filterObj);
        $http.get(hostname + '/api/races').success(function(data) {
          filterObj.options = data;
        });
      }
    },
    {
      filterType: 'site',
      label: 'Cancer Site',
      options: '',
      selectedOption: '',
      getData: function(filterObj) {
        console.log(filterObj);
        $http.get(hostname + '/api/sites').success(function(data) {
          filterObj.options = data;
        });
      }
    }
];

  $scope.charts = [
    {
      type: 'column',
      width: 800,
      height: 400
    },
    {
      type: 'pie',
      width: 800,
      height: 400
    },
    {
      type: 'line',
      width: 800,
      height: 400
    }
  ];

  function collectQueryParams(thisFilter) {
    var queryParams = {};
    queryParams[thisFilter.filterType] = thisFilter.selectedFilter;

    _.filter($scope.filters, function(obj) {
      queryParams[obj.filterType] = obj.selectedOption;
    });

    return queryParams;
  }

  function drawChart(obj) {
    obj = obj || $scope.chartData;
    if (_.isEmpty(obj)) {
      return;
    }

    $scope.highchartsNG = {
      options: {
        chart: {
          type: obj.chartType,
          width: '800',
          height: '400'
        }
      },
      title: {
        text: 'Top 10 Cancer Sites'
      },
      xAxis: {
        categories: obj.categories
      },
      yAxis: {
        title: {
          text: 'Rates per 10000'
        }
      },
      series: obj.seriesData,
      loading: false
    };
  }


  /**
   * Start of Scope methods
   */

  $scope.redrawChart = function(chart) {
    $scope.chartData.chartType = chart.type;
  };

  /** Watch for changes in chartData and draw the graph */
  $scope.$watch('chartData', function() {
    drawChart();
  }, true);

  $scope.getResults = function(filter) {
    filter.selectedOption = filter.selectedFilter;
    console.log('getting results for selected ', filter);
    var queryParams = collectQueryParams(filter);

    $scope.ajaxCall('/api/stats',
      queryParams, function(data) {
        //console.log('in callback ', data);

        var seriesData = [];
        var categoriesArray = [];


        var races = _.find($scope.filters, {filterType: 'race'}).selectedOption;
        if (typeof races == 'object') {
          _.forEach(_.find($scope.filters,
            {filterType: 'race'}).selectedOption, function(race) {
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

        console.log('seriesData ', seriesData);

        console.log('data ', data);

        _.forEach(data, function(race) {

          _.forEach(race, function(value)  {
            console.log('race ', value);
            var found = _.find(seriesData, {name: value.race});
            console.log('found ', found);
            if (typeof found != 'undefined') {
              found.data.push(value.rate);
            }

            if (_.isEmpty(categoriesArray[value.site])) {
              categoriesArray[value.site] = value.site;
            }
          });
        });

        console.log('categories data ', categoriesArray);
        $scope.chartData =   {
          chartType: 'column',
          categories: _.keys(categoriesArray),
          seriesData: seriesData
        };
      });
  };

  $scope.invokeFn = function(filter) {
    console.log('filter', filter);
    (filter.getData).call(this, filter);
  };


  $scope.ajaxCall = function(path, data, callback) {
    var queryParams = $.param(data);
    console.log('query params ', queryParams);
    $http.get(hostname + path + '?' + queryParams).success(function(data) {
      //console.log('angular ', data);
      callback.call(this, data);
    });
  };


}]);