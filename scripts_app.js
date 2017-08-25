document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});
jQuery(document).ready(function ($) {
  var orig_zoom;
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
      increment: 0.2,
      minScale: 0.1,
      maxScale: 2
    });

    orig_zoom = $panzoom.panzoom('getMatrix')[0];

    //mousewheel zoom function

    $panzoom.parent().on('wheel.focal', function( e ) {
      e.preventDefault();
      var delta = e.delta || e.originalEvent.wheelDelta;
      var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
      $panzoom.panzoom("zoom", zoomOut, {
        animate: false,
        focal: e
      });
    });

  };

  setPanzoom();
  load_init_css();

  //buttons for zooming in and out
  $('.icon-zoomout').mousedown(function() {
    $('.icon-zoomout').addClass('ui-icon-active');
  });

  $('.icon-zoomout').mouseup(function() {
    $('.icon-zoomout').removeClass('ui-icon-active');
  });

  $('.icon-zoomin').mousedown(function() {
    $('.icon-zoomin').addClass('ui-icon-active');
  });

  $('.icon-zoomin').mouseup(function() {
    $('.icon-zoomin').removeClass('ui-icon-active');
  });

  $('.icon-zoomout').on("click", function( e ) {
    e.preventDefault();
    $panzoom.panzoom("zoom", true);
    $panzoom.panzoom('option', {
      focal: {
        clientX: $(window).width() / 2,
        clientY: $(window).height() / 2
      }
    });
  });

  $('.icon-zoomin').on("click", function( e ) {
    e.preventDefault();
    $panzoom.panzoom("zoom");
    $panzoom.panzoom('option', {
      focal: {
        clientX: $(window).width() / 2,
        clientY: $(window).height() / 2
      }
    });
  });

  //double tap functionality on mobile
  var tapped = false;
  var zoomed = false;

  $(".ig-content").on("touchstart",function(e){

    var touch = e.touches[0];
    tap_x = touch.pageX;
    tap_y = touch.pageY;

    if (e.touches.length < 2) {

      var matrix = $panzoom.panzoom("getMatrix");
      var zoomLevel = zoomed ? ( matrix[0] / orig_zoom ) - 1 : ( 1 / matrix[0] ) - 1;

      if(!tapped){
        tapped = setTimeout(function() {
          tapped = null;

        },300);
      } else {
        clearTimeout(tapped);
        tapped = null;

        $panzoom.addClass('transition');
        $panzoom.panzoom('zoom', zoomed, {
          increment: zoomLevel,
          focal: {
            clientX: tap_x,
            clientY: tap_y
          }
        });
        zoomed = !zoomed;
        window.setTimeout(function() {
          $panzoom.removeClass('transition');
        }, 400);
      }
      e.preventDefault();
    } else {
      $panzoom.panzoom("option", "increment", 0.1);
    }
  });

  function re_render() {
    setZoomVar = setZoomVarFunction();
    $panzoom.panzoom("setMatrix", [setZoomVar, 0, 0, setZoomVar, 0, 0]);
    orig_zoom = $panzoom.panzoom('getMatrix')[0];
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
      re_render();
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
      $('.icon-fullscreen').addClass('ui-icon-active');
    } else {
      if (is_relative) {
        $('.project-container').addClass('relative');
        $('.project-container').removeClass('fixed');
      }
      $('.icon-fullscreen').removeClass('ui-icon-active');
    }
  }

  function fs_function() {
    var is_fs = document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
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

    if(is_fs && document.msExitFullscreen) {
      document.msExitFullscreen();
    }

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
