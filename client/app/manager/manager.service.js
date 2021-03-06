
'use strict';

angular.module('faeloApp')
  .factory('ManagerSvc', function($http, $rootScope, socket, $state) {

    var arrReference = null;

    var returnObj =  {

      dishes: [],
      dates: [],
      orders: [],
      lastDay: null,
      selectedArticle: null,

      parseDates: function(arr){
        arrReference = arr;
        for(var i in arr)
          this.parseDate(i);
      },

      parseLastDate: function(){
        this.parseDate(arrReference, arrReference.length - 1);
      },

      parseDate: function(pos){
        var aux = arrReference[pos];

        arrReference[pos] = this.parseDateExternal(aux);
      },

      parseDateExternal: function(article){


        return {
          title:  (article._article ? article._article.title : '¡NO ARTICLE!'),
          start: new Date(article.date),
          allDay: true,
          original: article
        }
      },


      isDayTaken: function(day){
        return _.where(arrReference, {start: day}).length;
      },


      getDaysOfMonth: function(date) {
        var dateCopy = new Date(date.getTime());
        dateCopy.setDate(dateCopy.getDate() - 7);

        var month = date.getMonth();
        var result = [];

        // Get all the other Mondays in the month
        while (date.getMonth() === month) {
          result.push(new Date(date.getTime()));
          date.setDate(date.getDate() + 7);
        }

        while (dateCopy.getMonth() === month) {
          result.push(new Date(dateCopy.getTime()));
          dateCopy.setDate(dateCopy.getDate() - 7);
        }

        return result;
      },

      loadDishes: function(firstTime){
        $http.get('/api/articles/dishes/').success(function(dishes, status, headers) {
          returnObj.dishes = dishes;
          $rootScope.$broadcast('ManagerSvc:dishesLoaded');
          if(firstTime)
            socket.syncUpdates('dish', returnObj.dishes);

        });
      },
      loadDates: function(redirect){
        $http.get('/api/dates/month').success(function(dates){
          returnObj.parseDates(dates);
          returnObj.dates = dates;
          $rootScope.$broadcast('ManagerSvc:datesLoaded');

          if(redirect)
            $state.go($state.current, {}, {reload: true});
        });
      }
    };


    returnObj.loadDishes(true);
    returnObj.loadDates();



    return returnObj;

  });
