'use strict';
/* App Module */

var angulargap = angular.module("tsb",['LocalStorageModule', 'tsbFiltros', 'google-maps']);

angulargap.config( function($routeProvider, $httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

    $routeProvider.
        when('/login', {templateUrl: 'partials/login.html'}).
        when('/home', {templateUrl: 'partials/home.html', controller: HomeCtrl}).
        when('/registrarse', {templateUrl: 'partials/registrarse.html'}).
        when('/tiporeporte', {templateUrl: 'partials/tipodereporte.html'}).
        when('/reportedenuncia', {templateUrl: 'partials/reportedenuncia.html'}).
        when('/reporteayuda', {templateUrl: 'partials/reporteayuda.html'}).
        when('/reporteinforme', {templateUrl: 'partials/reporteinforme.html'}).
        when('/verificacion', {templateUrl: 'partials/verificacion.html'}).
        otherwise({redirectTo: '/home'});
});

angulargap.run(function($rootScope, $location, $window) {
    $rootScope.APIPath = 'http://www.todossomosbogota.com/api/';

    $rootScope.mensajeCargando = function(mostrar){
        if (mostrar === false){
            $('#contenedorMensajeCargando').hide(0);
        } else{
            $('#contenedorMensajeCargando').show(0);
        }
    };

    $rootScope.redireccion = function(ruta){
        $location.path(ruta);
    };

    $rootScope.redireccionExterna = function(ruta){
        $window.open(ruta, '_system', 'location=yes');
    };

    $rootScope.editarCuenta = function(){
        var ruta = 'http://todossomosbogota.com/user/' + $rootScope.idUsuario + '/edit';
        $window.open(ruta, '_system', 'location=yes');
    }
    $rootScope.exifLogo = function(){
        var orientacionLogo = $('#contenedorImagenBotonLogo img').exif('Orientation');

        return orientacionLogo();
    };
});