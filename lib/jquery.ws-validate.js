
(function($) {
  
  var wsValidator = function(){
    var rules = {
      required: {
        check: function(element){
          var value = element.val();
          return (value != undefined && value.length > 0);
        },
        msg: "Dit veld is verplicht"
      },
      format: {
        check: function(element){
          var pattern = element.attr("data-pattern");
          var value = element.val();
          if(pattern){
            return testPattern(value, pattern);
          }else{
            return true
          }
        },
        msg: "De inhoud van dit veld klopt niet"
      },
      maxlength: {
        check: function(element){
          var length = element.val().length;
          var maxlength = element.attr("data-maxlength");
          return (length > maxlength);
        },
        msg: "Het veld bestaat uit te veel karakters"
      },
      minlength: {
        check: function(element){
          var length = element.val().length;
          var minlength = element.attr("data-maxlength");
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
      }
    }
  }
  
  /* 
  wsForm factory 
  */
  
  var wsForm = function(form) {
    
    var elements = [];
    form.find("[data-validation]").each(function() {
      var element = $(this);
      if(element.attr('data-validation') !== undefined) {
        elements.push(new wsElement(element));
      }
    });
    this.elements = elements;
  }
  
  wsForm.prototype = {
    validate : function() {
      for(elements in this.elements) {
        this.elements[element].validate();
      }
    },
    isValid : function() {
      for(field in this.elements) {
        if(!this.elements[element].valid) {
          this.elements[element].element.focus();
          return false;
        }
      }
      return true;
    }
  }
  
  /* 
  wsElement factory 
  */
  var wsElement = function(element) {
    this.element = element;
    this.valid = false;
    this.attach("change");
  }
  
  wsElement.prototype = {
    attach : function(event) {
      var obj = this;
      if(event == "change") {
        obj.element.bind("change",function() {
          return obj.validate();
        });
      }
      if(event == "keyup") {
        obj.element.bind("keyup",function(e) {
          return obj.validate();
        });
      }
    },
    validate : function() {
      var obj = this,
        element = obj.element,
        errorClass = "errorlist",
        errorlist = $(document.createElement("ul")).addClass(errorClass),
        types = element.attr("data-validation").split(" "),
        container = element.parent(),
        errors = []; 
          
      element.next(".errorlist").remove();
      for (var type in types) {
        var rule = $.wsValidate.getRule(types[type]);
        if(!rule.check(field.val())) {
          container.addClass("error");
          errors.push(rule.msg);
        }
      }
      if(errors.length) {
        obj.element.unbind("keyup")
        obj.attach("keyup");
        field.after(errorlist.empty());
        for(error in errors) {
          errorlist.append("<li>"+ errors[error] +"</li>");
        }
        obj.valid = false;
      } 
      else {
        errorlist.remove();
        container.removeClass("error");
        obj.valid = true;
      }
    }
  }
  
  /*
      Validation extends jQuery prototype
      */
  $.extend($.fn, {
    wsValidator : function() {
      var validator = new wsForm($(this));
      $.data($(this)[0], 'validator', validator);
      $(this).bind("submit", function(e) {
        validator.validate();
        if(!validator.isValid()) {
          e.preventDefault();
        }
      });
      return this;
    },
    wsValidate : function() {
      var validator = $.data($(this)[0], 'validator');
      validator.validate();
      return validator.isValid();
    }
  });
  $.wsValidator = new wsValidator();
  
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