angular.module('modules.minicolor', [])
    .provider('ColorProvider', function () {
    this.defaults = {
        theme: 'bootstrap',
        position: 'top left',
        defaultValue: '',
        animationSpeed: 50,
        animationEasing: 'swing',
        change: null,
        changeDelay: 0,
        control: 'hue',
        hide: null,
        hideSpeed: 100,
        inline: false,
        letterCase: 'lowercase',
        opacity: false,
        show: null,
        showSpeed: 100
    };

    this.$get = function() {
        return this;
    };

})
.factory('ColorFactory', function($document, $q, $rootScope) {
        var d = $q.defer();

        function onScriptLoad() {
            // Load client in the browser
            $rootScope.$apply(function() { d.resolve(); });
        }
        // Create a script tag with the gantt-javascript as the source
        // and call our onScriptLoad callback when it
        // has been loaded

        var scriptTag = $document[0].createElement('script');

        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        scriptTag.src = webPath + 'vendor/js/minicolor/jquery-minicolors.min.js';

        scriptTag.onreadystatechange = function () {
            if (this.readyState == 'complete') onScriptLoad();
        }
        scriptTag.onload = onScriptLoad;

        var s = $document[0].getElementsByTagName('body')[0];
        s.appendChild(scriptTag);

        return {
            color: function() { return d.promise; }
        };
    })
    .directive('minicolors', function (ColorProvider, ColorFactory, $timeout) {
        return {
            require: '?ngModel',
            restrict: 'A',
            priority: 1, //since we bind on an input element, we have to set a higher priority than angular-default input
            link: function(scope, element, attrs, ngModel) {

                ColorFactory.color().then(function(){
                    var inititalized = false;

                    //gets the settings object
                    var getSettings = function () {
                        var config = angular.extend({}, ColorProvider.defaults, scope.$eval(attrs.minicolors));
                        return config;
                    };

                    //what to do if the value changed
                    ngModel.$render = function () {

                        //we are in digest or apply, and therefore call a timeout function
                        $timeout(function() {
                            var color = ngModel.$viewValue;
                            element.minicolors('value', color);
                        }, 0, false);
                    };

                    //init method
                    var initMinicolors = function () {

                        if(!ngModel) {
                            return;
                        }
                        var settings = getSettings();
                        settings.change = function (hex) {
                            scope.$apply(function () {
                                ngModel.$setViewValue(hex);
                            });
                        };

                        //destroy the old colorpicker if one already exists
                        if(element.hasClass('minicolors-input')) {
                            element.minicolors('destroy');
                        }

                        // Create the new minicolors widget
                        element.minicolors(settings);

                        // are we inititalized yet ?
                        //needs to be wrapped in $timeout, to prevent $apply / $digest errors
                        //$scope.$apply will be called by $timeout, so we don't have to handle that case
                        if (!inititalized) {
                            $timeout(function() {
                                var color = ngModel.$viewValue;
                                element.minicolors('value', color);
                            }, 0);
                            inititalized = true;
                            return;
                        }
                    };

                    initMinicolors();

                    // Watch for changes to the directives options and then call init method again
                    scope.$watch(getSettings, initMinicolors, true);

                });

            }
        };
    })
;
