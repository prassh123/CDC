/**
 * Util service to do some specialized tasks
 */

cdcApp.service('UtilService', function ($http) {

  var hostname='http://localhost:9090';

  function collectQueryParams(filters, thisFilter) {
    var queryParams = {};
    queryParams[thisFilter.filterType] = thisFilter.selectedFilter;

    _.filter(filters, function(obj) {
      queryParams[obj.filterType] = obj.selectedOption;
    });
    return queryParams;
  }

  function getChartConfig(obj) {
    if (_.isEmpty(obj)) {
      return;
    }

    return {
      options: {
        chart: {
          type: obj.chartType,
          width: '900',
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

  var ajaxCall = function(path, data, callback) {
    var queryParams = $.param(data);
    console.log('query params ', queryParams);
    //console.log('hostname ', cdcApp.cdcConfig.HOSTNAME);
    $http.get(hostname + path + '?' + queryParams)
      .success(function(data) {
      //console.log('angular ', data);
      callback.call(this, data);
    });
  };

  return {
    collectQueryParams: collectQueryParams,
    getChartConfig: getChartConfig,
    ajaxCall: ajaxCall
  };
});