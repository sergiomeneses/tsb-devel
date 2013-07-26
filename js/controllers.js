'use strict';

//Header
function HeaderCtrl($scope, localStorageService, $rootScope, $location, $http) {

    //vaidar sesion en el servidor
    var conexion = $http.post($rootScope.APIPath + 'system/connect', {});

    conexion.then(function(conexion){//Éxito conexion
        if (conexion.data.user.uid == 0){
            $scope.logout();
        }
    }, function(conexion){//Error Login

    });

    if(localStorageService.get('nombreUsuario')){
        $rootScope.nombreUsuario = localStorageService.get('nombreUsuario');
    }

    $scope.inicioURL = '/home';


    //Logout
    $scope.logout = function(){
        var logout = $http.post($rootScope.APIPath + 'user/logout', {});

        localStorageService.clearAll();
        $rootScope.nombreUsuario = '';
        $rootScope.usuarioInactivo = false;
        $location.path('/home');
    }

}

//Inicio
function HomeCtrl($scope, localStorageService, $location, $rootScope) {
    $scope.loginURL = '/login';
    $scope.registroURL = '/registrarse';

    if($rootScope.usuarioInactivo){
        $location.path('/verificacion');
    }else if(localStorageService.get('logged')){
        $location.path('/tiporeporte')
    }

    $scope.info = "img/home/inicio@2x.png";
}

//Login
function LoginCtrl($scope, $rootScope, localStorageService, $location, $http){
    $scope.olvidoContrasenaURL = 'http://todossomosbogota.com/user/password';

    if(localStorageService.get('logged')){
        $location.path('/tiporeporte');
    }

    $scope.loginUsuario = function (){
        $rootScope.mensajeCargando();
        var login = $http.post($rootScope.APIPath + 'user/login', $.param({username: $scope.usuario.username, password: $scope.usuario.password}));
        login.then(function(login){ //Éxito
            localStorageService.add('logged', login.data.sessid);
            localStorageService.add('nombreUsuario', login.data.user.name);
            $rootScope.nombreUsuario = login.data.user.name;
            $rootScope.idUsuario = login.data.user.uid;
            $rootScope.mensajeCargando(false);
            //Usuario inactivo
            if(login.data.user.roles[8]){
                $rootScope.usuarioInactivo = true;
                $location.path('/verificacion');
            }else{
                $location.path('/tiporeporte');
            }
        }, function(login) {  //Error
            navigator.notification.alert(login.data[0], function(){}, 'Error Login', 'Intentar de nuevo');
            $rootScope.mensajeCargando(false);
        });
    };


}

//Tipos de reporte
function TipoReporteCtrl($scope){
    $scope.DenunciaURL = '/reportedenuncia';
    $scope.AyudaURL = '/reporteayuda';
    $scope.InformeURL = '/reporteinforme';
    $scope.galeriaURL = 'http://todossomosbogota.com/galeria';
}

//Reporte Denuncia
function ReporteDenunciaCtrl($scope, $rootScope, localStorageService, $location, $http){

    $scope.tomarFoto = function(){
        navigator.camera.getPicture(
            function (imagenData) {
                $scope.$apply(function($scope){
                    alert('camara');
                    $scope.imagenReporte = "data:image/jpeg;base64," + imagenData;
                    $scope.imagenReporteAPI = imagenData;
                });
            }, function (mensaje) {
                navigator.notification.alert('Hubo un error al tomar la foto' + mensaje, function(){}, 'Error Imagen', 'Intentar de nuevo');
            }, {
                saveToPhotoAlbum: true,
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                allowEdit: true,
                sourceType : Camera.PictureSourceType.CAMERA,
                encodingType: Camera.EncodingType.JPEG
            });

    }

    $scope.cargarFoto = function(){
        navigator.camera.getPicture(
            function (imagenData) {
                $scope.$apply(function($scope){
                    alert('galeria');
                    $scope.imagenReporte = "data:image/jpeg;base64," + imagenData;
                    $scope.imagenReporteAPI = imagenData;
                });
            }, function (mensaje) {
                navigator.notification.alert('Hubo un error al cagar la foto' + mensaje, function(){}, 'Error Imagen', 'Intentar de nuevo');
            }, {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                mediaType: Camera.MediaType.PICTURE
            });
    }


    //Establecer ubicacion
    $scope.obtenerUbicacion = function(){
        navigator.geolocation.getCurrentPosition(function(pos){
            $scope.$apply(function($scope){
                $scope.center = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
            });
        });
    }

    $scope.center = {
        latitude: null,
        longitude: null
    };

    $scope.zoom = 16;
    $scope.markers = [];

    $scope.obtenerUbicacion();

    $scope.nombre = localStorageService.get('nombreUsuario');
    var fecha = new Date();
    $scope.fecha = fecha.getTime();


    //Reporta
    $scope.reportar = function(){

        $rootScope.mensajeCargando();

        //Ubicacion reporte (con o sin marcador)
        if ($scope.markers[0]){
            var marcadorLat = $scope.markers[0].latitude,
                marcadorLng = $scope.markers[0].longitude
        } else {
            var marcadorLat = $scope.center.latitude,
                marcadorLng = $scope.center.longitude
        }


        var imagen = $http.post($rootScope.APIPath + 'file', $.param({file: $scope.imagenReporteAPI, filename: $rootScope.nombreUsuario + $scope.fecha + '.jpg'}));
        imagen.then(function(imagen){  //exito imagen
            var reporte = $http.post($rootScope.APIPath + 'node', $.param({
                "node[field_descripcion_reporte][und][0][value]": $scope.reporte.descripcion,
                "node[field_ubicacion_reporte][und][0][lat]": marcadorLat,
                "node[field_ubicacion_reporte][und][0][lng]": marcadorLng,
                "node[field_imagen_reporte][und][0][fid]": imagen.data.fid,
                "node[type]": $scope.reporte.tipo,
                "node[title]": $scope.reporte.titulo,
                "node[field_categoria_reporte][und][tid]": $scope.reporte.categoria

            }));
            reporte.then(function(reporte){ //exito reporte
                navigator.notification.alert('Su reporte se ha enviado con exito', function(){}, 'Reporte Denuncia Éxitoso', 'Gracias');
                $rootScope.mensajeCargando(false);
                $location.path('/tiporeporte');
            }, function(reporte){ //error reporte
                navigator.notification.alert(reporte.data[0], function(){}, 'Error Reporte Denuncia', 'Intentar de nuevo');
                $rootScope.mensajeCargando(false);
            });
        }, function(imagen){ //error imagen
            navigator.notification.alert(imagen.data[0], function(){}, 'Error Imagen Denuncia', 'Intentar de nuevo');
            $rootScope.mensajeCargando(false);

        });
    };

}

//Reporte Informe
function ReporteInformeCtrl($scope, $rootScope, localStorageService, $location, $http){

    //Establecer ubicacion
    $scope.obtenerUbicacion = function(){
        navigator.geolocation.getCurrentPosition(function(pos){
            $scope.$apply(function($scope){
                $scope.center = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
            });
        });
    }

    $scope.center = {
        latitude: null,
        longitude: null
    };

    $scope.zoom = 16;
    $scope.markers = [];

    $scope.obtenerUbicacion();

    $scope.nombre = localStorageService.get('nombreUsuario');
    var fecha = new Date();
    $scope.fecha = fecha.getTime();

    $scope.reportar = function(){

        $rootScope.mensajeCargando();

        //Ubicacion reporte (con o sin marcador)
        if ($scope.markers[0]){
            var marcadorLat = $scope.markers[0].latitude,
                marcadorLng = $scope.markers[0].longitude
        } else {
            var marcadorLat = $scope.center.latitude,
                marcadorLng = $scope.center.longitude
        }

        var reporte = $http.post($rootScope.APIPath + 'node', $.param({
            "node[body][und][0][value]": $scope.reporte.descripcion,
            "node[field_ubicacion_reporte][und][0][lat]": marcadorLat,
            "node[field_ubicacion_reporte][und][0][lng]": marcadorLng,
            "node[type]": "reporte_yo_informo",
            "node[title]": $scope.reporte.titulo,
            "node[field_categoria_reporte][und][tid]": $scope.reporte.categoria

        }));

        reporte.then(function(reporte){//exito reporte
            navigator.notification.alert('Su reporte se ha enviado con exito', function(){}, 'Reporte Informe Éxitoso', 'Gracias');
            $rootScope.mensajeCargando(false);
            $location.path('/tiporeporte');
        }, function(reporte){//error reporte
            navigator.notification.alert(reporte.data[0], function(){}, 'Error Reporte Informe', 'Intentar de nuevo');
            $rootScope.mensajeCargando(false);
        });
    };
}

//Registro
function RegistroCtrl($scope, $filter, $location, $rootScope, $http){

    $scope.terminosCondicionesURL = 'http://todossomosbogota.com/terminos-y-condiciones';

    $scope.generoMasculino = 'img/icono_hombre_rojo.png';
    $scope.generoFemenino = 'img/icono_mujer_rojo.png';


    $scope.generoFemeninoActivo = function(){
        $scope.generoMasculino = 'img/icono_hombre_rojo.png';
        $scope.generoFemenino = 'img/icono_mujer_verde.png';
    }

    $scope.generoMasculinoActivo = function(){
        $scope.generoFemenino = 'img/icono_mujer_rojo.png';
        $scope.generoMasculino = 'img/icono_hombre_verde.png';
    }

    var filtro = $filter('barras');
    $scope.crearUsuario = function () {
        $rootScope.mensajeCargando();

        var registro = $http.post($rootScope.APIPath + 'user/register', $.param({
            name: $scope.usuario.username,
            mail: $scope.usuario.email,
            pass: $scope.usuario.password,
            "field_fecha_nacimiento[und][0][value][date]": filtro($scope.usuario.fechaNacimiento),
            "field_sexo[und][tid]": $scope.usuario.genero,
            "field_nombre_completo[und][0][value]": $scope.usuario.nombre,
            "legal_accept[und][0][value]": 1
        }));

        registro.then(function(registro){//exito registro
            navigator.notification.alert('Gracias por tu registro, te hemos enviado un correo electrónico a tu cuenta con un enlace de activación', function(){}, 'Registro Éxitoso', 'Todos Somos Bogota');
            $rootScope.mensajeCargando(false);
            $location.path('/home');
        }, function(registro){//error registro
            navigator.notification.alert(registro.data[0], function(){}, 'Error Registro', 'Intentar de nuevo');
            $rootScope.mensajeCargando(false);
        });
    }
}
