var baseServices = angular.module("baseServices", []);

baseServices.factory("serverService", ["$http", "$rootScope",
    function($http, $rootScope) {
        var formEncode = function(data)
        {
            /**
            * The workhorse; converts an object to x-www-form-urlencoded serialization.
            * @param {Object} obj
            * @return {String}
            */ 
            var param = function(obj)
            {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;

                for(name in obj) {
                    value = obj[name];

                    if(value instanceof Array) {
                        for(i=0; i<value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if(value instanceof Object) {
                        for(subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if(value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        };

    
        return {
            makeGetRequest: function(url, params) {
                var request = $http.get(url, {"params": params,
                                              "transformRequest": formEncode,
                                              "headers": { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}});
                return request;
            },
            
            makePostRequest: function(url, params) {
                var request = $http.post(url, params, {"transformRequest": formEncode,
                                                             "headers": { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}});
                return request;
            }
        };
    }
]);
