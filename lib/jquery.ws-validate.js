
(function($) {
  $.extend($.fn, {
	  // http://docs.jquery.com/Plugins/Validation/validate
	  wsValidate: function( options ) {

      var rules = {
        required: {
          check: function(element){
            var value = $(element).val();
            return (value != undefined && value.length > 0);
          },
          msg: "Dit veld is verplicht"
        },
        format: {
          check: function(element){
            var pattern = $(element).attr("data-pattern");
            var value = $(element).val();
            if(pattern){
              return testPattern(value, pattern);
            }else{
              return true
            }
          },
          msg: "De inhoud van dit veld klopt niet"
        },
        maxlength: {
          check: function(element, maxlength){
            var length = $(element).val().length;
            return (length > maxlength);
          },
          msg: "Het veld bestaat uit te veel karakters"
        },
        minlength: {
          check: function(element, minlength){
            var length = $(element).val().length;
            return (length < minlength);
          },
          msg: "Het veld moet uit meer karakters bestaan"
        }
      };

      var testPattern = function(value, pattern){
        var regExp = new RegExp(pattern, "");
        return regExp.test(value);
      };

      return {
        addRule: function(name, rule){
          rules[name] = rule;
        },
        getRule: function(name){
          return rules[name];
        },
        removeRule: function(name){
          rules[name] = null;
        },
        rules: rules
      }
    }
  })
})(jQuery);

(function($) {
	// only implement if not provided by jQuery core (since 1.4)
	// TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
	if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
		$.each({
			focus: 'focusin',
			blur: 'focusout'
		}, function( original, fix ){
			$.event.special[fix] = {
				setup:function() {
					this.addEventListener( original, handler, true );
				},
				teardown:function() {
					this.removeEventListener( original, handler, true );
				},
				handler: function(e) {
					arguments[0] = $.event.fix(e);
					arguments[0].type = fix;
					return $.event.handle.apply(this, arguments);
				}
			};
			function handler(e) {
				e = $.event.fix(e);
				e.type = fix;
				return $.event.handle.call(this, e);
			}
		});
	}
	$.extend($.fn, {
		validateDelegate: function(delegate, type, handler) {
			return this.bind(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
})(jQuery);