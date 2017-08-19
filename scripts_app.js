document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});
jQuery(document).ready(function ($) {

  // GENERAL POST/INFOGRAPHICS

  //set initial zoom based on window width

  function setZoomVarFunction(){
    var windowWidth = $('.project-container').width();
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
  load_init_css();

  $('.icon-zoomout').on("click", function( e ) {
    e.preventDefault();
    $panzoom.panzoom("zoom", true);
  });

  $('.icon-zoomin').on("click", function( e ) {
    e.preventDefault();
    $panzoom.panzoom("zoom");
  });

  function re_render() {
    setZoomVar = setZoomVarFunction();
    $panzoom.panzoom("setMatrix", [setZoomVar, 0, 0, setZoomVar, 0, 0]);
  };

  function resize_360() {
    var matrix = $panzoom.panzoom("getMatrix");
    var zoomLevel = matrix[0];
    var inverseZoomLevel = 1/zoomLevel;
    $('.icon-scalable').css('transform', 'scale('+inverseZoomLevel+')');
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

  $(".icon-fullscreen").on("click touchstart", fs_function);

  function fs_resize(is_fs) {
    if(document.fullscreenElement !== is_fs) {
      setZoomVar = setZoomVarFunction();
      $panzoom.panzoom("setMatrix", [setZoomVar, 0, 0, setZoomVar, 0, 0]);
    } else {
      window.setTimeout(function(){fs_resize(is_fs)}, 100);
    }
  }

  function load_init_css() {
    if(is_relative) {
      $('.project-container').removeClass('fixed');
      $('.project-container').addClass('relative');
    } else {
      $('.project-container').removeClass('relative');
      $('.project-container').addClass('fixed');
    }
  }

  function fs_change_css(is_fs) {
    if(is_fs) {
      $('.project-container').removeClass('relative');
      $('.project-container').addClass('fixed');
    } else {
      if (is_relative) {
        $('.project-container').addClass('relative');
        $('.project-container').removeClass('fixed');
      }
    }
  }

function fs_function() {
  var is_fs = document.mozFullScreenElement ||
  document.webkitFullscreenElement
  ;

  document.fullScreenElement && null !== document.fullScreenElement || !document.mozFullScreenElement && !document.webkitFullscreenElement ? document.documentElement.requestFullscreen ? document.getElementsByClassName('project-container')[0].requestFullscreen() :

  document.documentElement.mozRequestFullScreen ? document.getElementsByClassName('project-container')[0].mozRequestFullScreen() :

  document.documentElement.msRequestFullscreen ?
  document.getElementsByClassName('project-container')[0].msRequestFullscreen() :

  document.documentElement.webkitRequestFullScreen && document.getElementsByClassName('project-container')[0].webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) :

  document.exitFullscreen ? document.exitFullscreen() :

  document.mozCancelFullScreen ? document.mozCancelFullScreen() :

  document.msExitFullscreen ? document.msExitFullscreen() :

  document.webkitExitFullscreen && document.webkitExitFullscreen()

  fs_resize(is_fs);
  fs_change_css(!is_fs);

}

function fullscreen_change() {
  var is_fs = document.fullscreenElement ||
  document.mozFullScreenElement ||
  document.msFullscreenElement ||
  document.webkitFullscreenElement
  ;

  fs_resize(is_fs);
  fs_change_css(is_fs);
}

document.onmozfullscreenchange = function () {
  fullscreen_change();
}

document.MSFullscreenChange = function () {
  fullscreen_change();
}

document.onwebkitfullscreenchange = function() {
  fullscreen_change();
}

});
