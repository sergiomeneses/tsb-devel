angular.module('tsbFiltros', []).filter('barras', function(){
    return function(texto){
        var fecha = texto.split('-');
        return fecha[2] + '/' + fecha[1] + '/' + fecha[0];
    };
});