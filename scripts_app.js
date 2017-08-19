document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});
$(document).ready(function ($) {

  // GENERAL POST/INFOGRAPHICS

  //set initial zoom based on window width

  function setZoomVarFunction(){
    var windowWidth = $(window).width();
    var igContentWidth = $('.ig-content').width();
    var setZoomVar = (windowWidth / igContentWidth);
    return setZoomVar;
  }

  //PANZOOM

  function setPanzoom() {
    var $section = $('.ig-container');
    var $panzoom = $section.find('.panzoom').panzoom({
      startTransform: 'scale(' + setZoomVarFunction() + ')',
      increment: 0.1,
      minScale: 0.1,
      maxScale: 2
    });

    //mousewheel zoom function

    $panzoom.parent().on('wheel.focal', function( e ) {
      e.preventDefault();
      var delta = e.delta || e.originalEvent.wheelDelta;
      var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
      $panzoom.panzoom('zoom', zoomOut, {
        animate: false,
        focal: e
      });
    });

  };

  setPanzoom();

  function re_render() {
    setZoomVar = setZoomVarFunction();
    $panzoom.panzoom("setMatrix", [setZoomVar, 0, 0, setZoomVar, 0, 0]);
  };

  function resize_360() {
    var matrix = $panzoom.panzoom("getMatrix");
    var zoomLevel = matrix[0];
    var inverseZoomLevel = 1/zoomLevel;
    $('.icon-360').css('transform', 'scale('+inverseZoomLevel+')');
  };

  //resize when orientation changes
  window.addEventListener("orientationchange", function() {
    re_render();
    resize_360();
  });

  //resize when browser size changes
  window.addEventListener("resize", function() {
    re_render();
    resize_360();
  });

  //fullscreen behavior

  function fs_resize(is_fs) {
    if(document.webkitIsFullScreen !== is_fs) {
      setZoomVar = setZoomVarFunction();
      $panzoom.panzoom("setMatrix", [setZoomVar, 0, 0, setZoomVar, 0, 0]);
    } else {
      window.setTimeout(function(){fs_resize(is_fs)}, 50);
    }
  }

  function fs_function() {
    var is_fs = document.fullScreenElement ||
    document.mozFullScreen ||
    document.webkitIsFullScreen
    ;
    document.fullScreenElement && null !== document.fullScreenElement || !document.mozFullScreen && !document.webkitIsFullScreen ? document.documentElement.requestFullScreen ? document.documentElement.requestFullScreen() : document.documentElement.mozRequestFullScreen ? document.documentElement.mozRequestFullScreen() : document.documentElement.webkitRequestFullScreen && document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : document.cancelFullScreen ? document.cancelFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen && document.webkitCancelFullScreen()

    fs_resize(is_fs);

  }

  $(".icon-fullscreen").on("click touchstart", fs_function);
});
