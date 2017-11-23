var feedApp = angular.module("feedApp", [
    "ngRoute",
    "baseServices"
]);

feedApp.config(function($routeProvider, $sceDelegateProvider) {
    $routeProvider
        .when('/feed', {
                templateUrl: 'feed_template.html',
                controller: 'FeedController'
        })
        .when('/item/:itemId', {
                templateUrl: 'item_template.html',
                controller: 'ItemController'
        })
        .otherwise({redirectTo: '/feed'});
        
    $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self'
  ]);
});

/* Custom directive. Declared only in elements, does not initialize
 * a child scope, and uses the template in the given URL.
 */
feedApp.directive("singleItem", function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: './single_item_template.html',
        controller: singleItemController
    };
});

/* Custom directive. Declared only in elements, does not initialize
 * a child scope, and uses the template in the given URL.
 */
feedApp.directive("commentsForm", function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: './comments_form_template.html',
        controller: commentController
    };
})

/* Controller for the custom single-item directive. Specifies
 * a function to retrieve a person's name from their id, and
 * a function for changing the route to /item/:itemId
 */
function singleItemController($scope, $location, serverService) {
    $scope.getPersonName = id => $scope.people.find(person => person.id == id).name
    $scope.seeItem = id => $location.path('/item/' + id);
}

/* Controller for the custom comment-form directive. Does little more
 * than make a post request to add a comment via the handler specified
 * in server.py. Initializes a unique scope domain for the comment box.
 */
function commentController($scope, serverService) {
    $scope.c = {};
    $scope.postComment = (item_id) => {
        serverService.makePostRequest("http://localhost:8080/item/add_comment", {id: item_id, author_id: "author_1", text: $scope.c.text})
            .success((data) => {
                console.log("after post request");
                $scope.item.comments.push({comment: $scope.c.text, author_id: "author_1"});
                $scope.commentForm.$setPristine();
                $scope.c = {};
            })
            .error((err) => {
                console.log(err);
            });
    };
}

/* controller for feed/ route. Makes an ajax call for the entire 
 * data (items and people) and sets scope variables for access by
 * custom directives
 */
feedApp.controller("FeedController",
    ["$scope", "serverService",
    function($scope, serverService) {
        serverService.makeGetRequest("http://localhost:8080/feed", {})
            .success( (data) => {
                $scope.items = data.items;
                $scope.people = data.people;
            })
    }
]);

/* controller for item/:itemId route. Makes an ajax call for a singular
 * item's data (and people data) and sets scope variables. 
 */
feedApp.controller("ItemController",
    ["$scope", "$routeParams", "serverService",
    function($scope, $routeParams, serverService) {
        serverService.makeGetRequest("http://localhost:8080/item", {id: $routeParams.itemId})
            .success((data) => {
                $scope.item = data.item;
                $scope.people = data.people;
            })
    }
]);