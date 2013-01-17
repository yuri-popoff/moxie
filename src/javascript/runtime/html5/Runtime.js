/**
 * Runtime.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

/*jshint smarttabs:true, undef:true, unused:true, latedef:true, curly:true, bitwise:false, scripturl:true, browser:true */
/*global define:true, File:true */

define("moxie/runtime/html5/Runtime", [
	"moxie/core/utils/Basic",
	"moxie/core/Exceptions",
	"moxie/runtime/Runtime",
	//"moxie/runtime/html5/extensions",
	"moxie/runtime/html5/image/ImageInfo",
	"moxie/core/utils/Env"
], function(o, x, R, /*extensions,*/ ImageInfo, Env) {
	var type = 'html5';

	R.addConstructor(type, (function() {
		function Runtime(options) {
			var I = this,
			shim,
			// allow to extend this runtime

			// figure out the options
			defaults = {

			};
			options = typeof(options) === 'object' ? o.extend(defaults, options) : defaults;

			R.apply(this, [options, arguments[1] || type]);

			o.extend(this, {

				init : function() {
					if (!window.File) { // minimal requirement
						I.destroy();
						throw new x.RuntimeError(x.RuntimeError.NOT_INIT_ERR);
					}
					I.trigger("Init");
				},

				getShim: function() {
					return shim;
				},

				shimExec: function(component, action) {
					var args = [].slice.call(arguments, 2);
					return I.getShim().exec.call(this, this.uid, component, action, args);
				}
			});

			/*shim = o.extend((function() {
				var objpool = {};

				return {
					exec: function(uid, comp, fn, args) {
						var obj;

						if (!shim[comp]) {
							throw new x.RuntimeError(x.RuntimeError.NOT_SUPPORTED_ERR);
						}

						obj = objpool[uid];
						if (!obj) {
							obj = objpool[uid] = new shim[comp]();
						}

						if (!obj[fn]) {
							throw new x.RuntimeError(x.RuntimeError.NOT_SUPPORTED_ERR);
						}

						return obj[fn].apply(this, args);
					}
				};
			}()), extensions);*/
		}

		Runtime.can = (function() {
			var caps = o.extend({}, R.caps, {
					access_binary: !!(window.FileReader || window.File && File.getAsDataURL),
					access_image_binary: function() {
						return can('access_binary') && !!ImageInfo;
					},
					display_media: Env.can('create_canvas') || Env.can('use_data_uri_over32kb'),
					drag_and_drop: (function() {
						// this comes directly from Modernizr: http://www.modernizr.com/
						var div = document.createElement('div');
						return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
					}()),
					receive_response_type: function(responseType) {
						if (responseType === 'json') {
							return true; // we can fake this one even if it's not supported
						} else {
							return Env.can('receive_response_type', responseType);
						}
					},
					report_upload_progress: function() {
						return !!(window.XMLHttpRequest && new XMLHttpRequest().upload);
					},
					resize_image: function() {
						return can('access_binary') && Env.can('create_canvas');
					},
					select_multiple: !(Env.browser === 'Safari' && Env.os === 'Windows'),
					send_binary_string:
						!!(window.XMLHttpRequest && (new XMLHttpRequest().sendAsBinary || (window.Uint8Array && window.ArrayBuffer))),
					send_custom_headers: !!window.XMLHttpRequest,
					send_multipart: function() {
						return !!(window.XMLHttpRequest && new XMLHttpRequest().upload && window.FormData) || can('send_binary_string');
					},
					slice_blob: !!(window.File && (File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice)),
					stream_upload: function() {
						return can('slice_blob') && can('send_multipart');
					},
					summon_file_dialog: (function() { // yeah... some dirty sniffing here...
						return  (Env.browser === 'Firefox' && Env.version >= 4)	||
								(Env.browser === 'Opera' && Env.version >= 12)	||
								!!~o.inArray(Env.browser, ['Chrome', 'Safari']);
					}()),
					upload_filesize: true
				});

			function can() {
				var args = [].slice.call(arguments);
				args.unshift(caps);
				return R.can.apply(this, args);
			}
			return can;
		}());

		return Runtime;
	}()));

});
