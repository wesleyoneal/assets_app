"use strict";

var m_cfg = b4w.require("config");

var SCENE_1 = APP_ASSETS_PATH + "scene.json";

var empty_name ;

var $section = $('.ig-container');
var $panzoom = $section.find('.panzoom');

$panzoom.on('panzoomzoom', function(e, panzoom, scale, options) {
  var inverseScale = 1/scale;
  if (!$panzoom.panzoom("isDisabled")) {
    $('.icon-360').css('transform', 'translateX(-50%) translateY(-50%) scale('+inverseScale+')');
  }
});

// lazy loading
function stop_rendering(m_app, m_main, m_cont, m_data, m_cfg, app_flags, scene, loading_cb, m_scs) {
  var canvas_elem = m_cont.get_canvas();
  function load_cb(data_id) {
    app_flags.data_is_loaded = true;
    check_screen_zoom();
  }
  function check_vis() {
    var coords = canvas_elem.getBoundingClientRect();
    if (coords.top > window.innerHeight || coords.bottom < 0) {
      if (app_flags.data_is_loaded) {
        m_main.pause();
      }
    } else {
      if (!app_flags.loading_is_started) {
        app_flags.loading_is_started = true;
        m_data.load(scene, load_cb, loading_cb);
      } else if (app_flags.data_is_loaded) {
        m_main.resume();
      }
    }
  }

  if (m_main.detect_mobile()) {
    $('.icon-fullscreen, .icon-zoomout, .icon-zoomin').css('display', 'none');
    $('.icon-360').on('touchstart', function( e ) { click_handle(this, e )
    });
  } else {
    $('.icon-360').on('click', function( e ) { click_handle(this, e )
    });
  }

  // window.addEventListener("scroll", check_vis, false);
  check_vis();

  function check_screen_zoom() {
    if (m_main.detect_mobile()) {
      var scale ;
      var zoom_cb = function(timeline, delta) {
        var new_scale = document.body.clientWidth / window.innerWidth;
        // console.log(new_scale);
        if (new_scale != scale) {
          scale = new_scale;
          m_cfg.set("canvas_resolution_factor", new_scale);
          // console.log(new_scale);
          m_cont.resize_to_container(true);
        }
      }
      m_main.append_loop_cb(zoom_cb);
    }
    else {
      var scale ;
      var zoom_cb = function(timeline, delta) {
        var new_scale = document.body.clientWidth / window.innerWidth;
        // console.log(new_scale);
        if (new_scale != scale) {
          scale = new_scale;
          m_cfg.set("canvas_resolution_factor", new_scale);
          // console.log(new_scale);
          m_cont.resize_to_container(true);
        }
      }
      m_main.append_loop_cb(zoom_cb);
    }
  }

  // function check_screen_zoom() {
  //   if (m_main.detect_mobile()) {
  //     var scale = document.body.clientWidth / window.innerWidth;
  //     var zoom_cb = function(timeline, delta) {
  //       var new_scale = 1;
  //       if (new_scale != scale) {
  //         scale = new_scale;
  //         m_cfg.set("canvas_resolution_factor", new_scale);
  //         m_cont.resize_to_container(true);
  //       }
  //     }
  //     m_main.append_loop_cb(zoom_cb);
  //   }
  //   else {
  //     var scale = document.body.clientWidth / window.innerWidth;
  //     var zoom_cb = function(timeline, delta) {
  //       var new_scale = 1.5;
  //       if (new_scale != scale) {
  //         scale = new_scale;
  //         m_cfg.set("canvas_resolution_factor", new_scale);
  //         m_cont.resize_to_container(true);
  //       }
  //     }
  //     m_main.append_loop_cb(zoom_cb);
  //   }
  // }
}

function ui_icon_deactivate(element, m_cam) {
  element.classList.remove('ui-icon-active');
  $section.find('.svg-bg').show();
  $panzoom.panzoom("enable");
  m_cam.target_setup(camera, {pivot: _target_pivot, use_panning: true});
}

function ui_icon_activate(element, m_cam) {
  element.classList.add('ui-icon-active');
  $section.find('.svg-bg').hide();
  $panzoom.panzoom("disable");
  empty_name = element.getAttribute('emptyName');
  m_cam.static_setup(camera);
}

function click_handle(element, e) {
  e.stopImmediatePropagation();
  if (!$panzoom.panzoom("isDisabled")) {
    ui_icon_activate(element);
  } else {
    if (!element.classList.contains('ui-icon-active')) {
      $(".icon-360").removeClass('ui-icon-active');
      ui_icon_activate(element);
      return;
    }
    ui_icon_deactivate(element);
  }
}

// Modules registration

// Scene 1

b4w.register("scene_1", function(exports, require) {

  var m_data      = require("data", "scene_1");
  var m_app       = require("app", "scene_1");
  var m_cfg       = require("config", "scene_1");
  var m_cont      = require("container", "scene_1");
  var m_main      = require("main", "scene_1");
  var m_anch      = require("anchors", "scene_1");
  var m_ctl       = require("controls", "scene_1");
  var m_geom      = require("geometry", "scene_1");
  var m_mat       = require("material", "scene_1");
  var m_scs       = require("scenes", "scene_1");
  var m_preloader = require("preloader", "scene_1");
  var m_ver       = require("version", "scene_1");
  var m_trans     = require("transform", "scene_1");
  var m_tsr       = require("tsr", "scene_1");
  var m_vec3      = require("vec3", "scene_1");
  var m_quat      = require("quat");
  var m_util      = require("util");
  var m_cam       = require("camera");

  // detect application mode
  var DEBUG = (m_ver.type() == "DEBUG");

  var _app_flags = {
    data_is_loaded : false,
    loading_is_started : false
  }

  var start_x = 0;
  var start_y = 0;
  var start_pan_x = 0;
  var start_pan_y = 0;
  var rotation_velocity = 0.005;
  var zoom_velocity = .2;

  var cam_quat = new Float32Array(4);
  var obj_quat = new Float32Array(4);
  var obj_pan = new Float32Array(3);
  var _tmp_quat = new Float32Array(4);
  var is_dragging = false;

  exports.init = function() {
    m_app.init({
      canvas_container_id: "scene_container",
      callback: init_cb,
      alpha: true,
      autoresize: true,
      pause_invisible: true,
      allow_cors: true,
      audio: false
    });
  }

  function stageload_cb(percentage) {
    if (percentage >= 100)
    m_cfg.set("animation_framerate", 24);
  }

  function init_cb(canvas_elem, success) {

    if (!success) {
      console.log("b4w init failure");
      return;
    }

    // ignore right-click on the canvas element
    canvas_elem.oncontextmenu = function(e) {
      return false;
    }

    // m_cfg.set("animation_framerate", 0);

    stop_rendering(m_app, m_main, m_cont, m_data, m_cfg, _app_flags, SCENE_1, loading_cb, m_scs);
  }

  function loading_cb(percentage) {
    var loading_el = document.getElementsByClassName('load-status-bar')[0];
    loading_el.style.width = percentage + "%";
    if (percentage == 100) {
      $('.icon-360').css('display', 'block');
      $('#scene_container').css('background-image', 'none');
      var loading_container = document.getElementsByClassName('load-status-container')[0];
      loading_container.style.display = 'none';
      window.addEventListener("touchstart", start_rot_touch, false);
      window.addEventListener("touchend", end_rot_touch, false);
      window.addEventListener("mousedown", rotate_or_pan, false);
      window.addEventListener("mouseup", end_rotation, false);
      window.addEventListener("wheel", zoom_obj, false);

      var matrix = $panzoom.panzoom("getMatrix");
      var zoomLevel = matrix[0];
      var inverseZoomLevel = 1/zoomLevel;

      $('.icon-360').css('transform', 'scale('+inverseZoomLevel+')');

    }
  }

  function load_cb() {
    var canvas = m_cont.get_canvas();
  }


  function rotate_or_pan(e) {
    if (e.button === 0) {
      start_rotation(e);
    } else if (e.button === 1 || e.button === 2){
      start_pan(e);
    }
  };

  function start_rot_touch(e) {
    if ($panzoom.panzoom("isDisabled")) {
      e.preventDefault();
      is_dragging = true;
      var touch = e.touches[0];
      start_x = touch.pageX;
      start_y = touch.pageY;

      window.addEventListener("touchmove", execute_rot_touch, false);
    }
  }

  function execute_rot_touch(e) {

    if(is_dragging) {
      e.preventDefault();
      var touch = e.touches[0];
      var dx = (touch.pageX - start_x) * rotation_velocity;
      var dy = (touch.pageY - start_y) * rotation_velocity;

      var obj = m_scs.get_object_by_name(empty_name);
      m_trans.get_rotation(obj, obj_quat);

      m_util.euler_to_quat([dy, 0, dx], _tmp_quat);
      m_quat.multiply(_tmp_quat, obj_quat, obj_quat);

      m_trans.set_rotation_v(obj, obj_quat);
    }

    var touch = e.touches[0];
    start_x = touch.pageX;
    start_y = touch.pageY;
  }

  function end_rot_touch(e) {
    is_dragging = false;
  }

  function start_pan(e) {
    if ($panzoom.panzoom("isDisabled")) {
      is_dragging = true;
      start_pan_x = e.screenX;
      start_pan_y = e.screenY;

      window.addEventListener("mousemove", execute_pan, false);
    }
  }

  function execute_pan(e) {
    if (is_dragging) {
      var dx = (e.screenX - start_pan_x) * .015;
      var dy = (e.screenY - start_pan_y) * .015;

      var obj = m_scs.get_object_by_name(empty_name);
      m_trans.get_translation(obj, obj_pan);
      var trans_x = obj_pan[0] + dx;
      var trans_y = obj_pan[1] - dy;
      var trans_z = obj_pan[2];
      m_trans.set_translation(obj, trans_x, trans_y, trans_z);
    }
    start_pan_x = e.screenX;
    start_pan_y = e.screenY;
  }

  function start_rotation(e) {
    if ($panzoom.panzoom("isDisabled")) {
      is_dragging = true;
      start_x = e.screenX;
      start_y = e.screenY;

      window.addEventListener("mousemove", execute_rotation, false);
    }
  }

  function execute_rotation(e) {

    if (is_dragging) {
      var dx = (e.screenX - start_x) * rotation_velocity;
      var dy = (e.screenY - start_y) * rotation_velocity;

      var obj = m_scs.get_object_by_name(empty_name);
      m_trans.get_rotation(obj, obj_quat);

      m_util.euler_to_quat([dy, 0, dx], _tmp_quat);
      m_quat.multiply(_tmp_quat, obj_quat, obj_quat);

      m_trans.set_rotation_v(obj, obj_quat);
    }

    start_x = e.screenX;
    start_y = e.screenY;
  }

  function end_rotation(e) {
    is_dragging = false;
    window.removeEventListener('mousemove', execute_rotation, false);
  }

  function zoom_obj(e) {
    var $panzoom = $('.panzoom');
    if ($panzoom.panzoom("isDisabled")) {
      var obj = m_scs.get_object_by_name(empty_name);
      var obj_scale = m_trans.get_scale(obj, obj_quat);
      if (obj_scale < .5) {
        obj_scale = .5;
      }

      var scale_delta = e.deltaY < 0 ? zoom_velocity : -zoom_velocity;
      if (obj_scale >= .5) {
        obj_scale += scale_delta;
        m_trans.set_scale(obj, obj_scale);
      } else {
        obj_scale = .5;
      }

    }
  }

});

document.addEventListener("DOMContentLoaded", function(){
  b4w.require("scene_1", "scene_1").init();
}, false);
