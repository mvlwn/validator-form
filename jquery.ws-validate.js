
(function($) {

  WSValidator = function(){
    var rules = {
      required: {
        check: function(obj, event){

          var element = obj.element;
          var value = obj.getValue();
          var length = 0;

          // could be an array for select-multiple or a string, both are fine this way
          if(obj.type == "select"){
            var val = element.val();
            length = val.length;
          } else {
            length = $.trim(value).length;
          }

          if(event == undefined || event.type == "submit"){
            return length > 0;
          }

          return true;

        },
        msg: "Dit veld is verplicht"
      },
      format: {
        check: function(obj, event){
          var element = obj.element;
          var pattern = element.attr("data-pattern");
          var value = obj.getValue();

          if(event == undefined || event.type == "submit" || event.type == "change"){
            if(pattern){
              return testPattern(value, pattern);
            }else{
              return true
            }
          }

          return true;
        },
        msg: "De inhoud van dit veld klopt niet"
      },
      maxlength: {
        check: function(element, event){
          var length = element.val().length;
          var maxlength = element.attr("data-maxlength");
          return (length > maxlength);
        },
        msg: "Het veld bestaat uit te veel karakters"
      },
      minlength: {
        check: function(element, event){
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
  };

  WSForm = function(form, options) {

    var obj = this;

    obj.currentForm = form;

    // setup options
    $.extend(this, options);

    obj.elements = this.collectElements();

    $.data($(form)[0], 'validator', obj);

    // Add novalidate tag if HTML5.
  	form.attr('novalidate', 'novalidate');

    $(form).bind("submit", function(e) {
      obj.validate(e);
      if(!obj.isValid()) {
        e.preventDefault();
      }
    });

  };

  WSForm.prototype = {

    validate: function(e) {
      for(var element in this.elements) {
        this.elements[element].validate(e);
      }
    },

    isValid: function() {
      for(var element in this.elements) {
        if(!this.elements[element].valid) {
          this.elements[element].element.focus();
          return false;
        }
      }
      return true;
    },

    destroy: function(){
      $.data($(this.currentForm)[0], 'validator', null);
    },

    settings: {
      formGroupClass: 'form-group',
      validationAttribute: 'data-validation',
      element: {}
    },

    findByName: function( name ) {
			// select by name and filter by form for performance over form.find("[name=...]")
			var form = this.currentForm[0];
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == form && element.name == name && element || null;
			});
		},

    collectElements: function(){
      var obj = this;
      var form = this.currentForm;
      var validationAttribute = this.settings.validationAttribute;
      var elements = [];

      this.setupElementsFromOptions();

      form.find("[" + validationAttribute + "]").each(function() {
        var element = $(this);
        if(element.attr(validationAttribute) !== undefined) {
          if(element.attr("type") == "radio"){
            var radio_buttons = obj.currentForm.find("[name="+element.attr("name")+"]");
            $.each(radio_buttons, function(){
                var radio_element = $(this);
                radio_element.attr(validationAttribute, element.attr(validationAttribute));
                elements.push(new WSElement(radio_element, obj));
            })
          }else{
            elements.push(new WSElement(element, obj));
          }
        }
      });
      return elements;
    },

    setupElementsFromOptions: function(){
      var obj = this;
      if(obj.inputElements){
        $.each(obj.inputElements, function(name, options){
          var input = obj.findByName(name);
          if(input){
            var element = $(input);
            element.attr(obj.settings.validationAttribute, options["validation"]);
            element.attr("data-pattern", options["pattern"]);
          }
        })
      }
    }
  };

  WSElement = function(element, WSForm) {
    var obj = this;
    obj.WSForm = WSForm;
    obj.element = element;
    obj.type = obj.inputType();
    obj.valid = false;
    obj.attach("onfocusin");
    obj.attach("change");

    // Extend element settings with form settings
    $.extend(obj.settings, WSForm.settings.element);

    $.data(element[0], 'element', obj);
  };

  WSElement.prototype = {

    attach : function(event) {
      var obj = this;

      if(event == "change") {
        obj.element.bind("change",function(e) {
          return obj.validate(e);
        });
      }

      if(event == "keyup") {
        obj.element.bind("keyup",function(e) {
          return obj.validate(e);
        });
      }

//      if(event == "onfocusin") {
//        obj.element.bind("onfocusin",function(e) {
//          obj.removeErrorlist();
//        });
//      }

    },

    validate : function(e) {
      var obj = this;
      var errors = this.errorsFromValidation(e);

      obj.removeErrorlist();

      if(errors.length) {
        obj.element.unbind("keyup");
        obj.attach("keyup");
        obj.displayErrorlist(errors);
        obj.valid = false;
      }
      else {
        obj.valid = true;
      }

    },

    settings: {
      errorlistClass: "errorlist",
      errorContainerClass: "error",
      errorClass: "error",
      validClass: "valid"
    },

    checkable: function( ) {
			return /radio|checkbox/i.test(this.type);
		},

    getValue: function(){
      switch(this.type){
        case "radio":
          var name = this.element.attr("name");
          var checked_element = this.WSForm.currentForm.find("[name=" + name + "]:checked");
          return checked_element.val();
        case "checkbox":
          // if there is a hidden fallback option return that value
          if(this.element.is(":checked")){
             return this.element.val();
          }else{
            var name = this.element.attr("name");
            var hidden_element = this.WSForm.currentForm.find("[type=hidden][name=" + name + "]");
            return $(hidden_element).val();
          }
        default:
          return this.element.val();
      }
    },

    inputType: function(){
      var element = this.element;
      switch( element[0].nodeName.toLowerCase() ) {
      case 'select':
        return "select";
      case 'textarea':
        return 'textarea';
      case 'input':
        return element.attr("type");
      }
    },

    displayErrorlist: function(errors){
      var errorlistClass = this.settings.errorlistClass;
      this.element.addClass(this.settings.errorClass);
      this.container().addClass(this.settings.errorContainerClass);
      this.container().append(this.errorlist(errors, errorlistClass));
    },

    errorlist: function(errors, errorlistClass){
      var errorlist = $(document.createElement("ul")).addClass(errorlistClass);
      errorlist.empty();
      for(var error in errors) {
         errorlist.append("<li>"+ errors[error] +"</li>");
      }
      return errorlist;
    },

    removeErrorlist: function(){
      this.container().removeClass(this.settings.errorClass);
      this.element.removeClass(this.settings.errorClass);
      this.container().removeClass(this.settings.errorContainerClass);
      this.container().find("." + this.settings.errorlistClass).remove();
    },

    errorsFromValidation: function(e){
      var obj = this;
      var validationAttribute = this.WSForm.settings.validationAttribute;
      var types = this.element.attr(validationAttribute).split(" ");
      var errors = [];
      for (var type in types) {
        var rule = $.WSValidator.getRule(types[type]);
        if(!rule.check(obj, e)) {
          errors.push(rule.msg);
        }
      }
      return errors;
    },

    container: function(){
      return this.element.parent();
    }
  };

  $.extend($.fn, {
    WSForm: function( options ) {

      // check if a validator for this form was already created
  		var validator = $.data(this[0], 'validator');

      if ( validator ) {
  			return validator;
  		}

      return new WSForm($(this), options);
    },
    WSElement: function(WSForm){
      var element = $.data(this[0], 'element');
      if ( element ) {
  			return element;
  		}
  		return new WSElement($(this), WSForm);
    },
    validate: function() {
      var validator = $.data($(this)[0], 'validator');
      validator.validate();
      return validator.isValid();
    }
  });
  $.WSValidator = new WSValidator();
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