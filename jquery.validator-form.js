
(function($) {

  Validator = function(){
    var rules = {
      required: {
        check: function(element, event){
          var object = element.object;
          var required = element.input["required"];

          if(callCondition(required) === false){
            return undefined;
          }
          
          var value = element.value();
          var length = 0;

          // could be an array for select-multiple or a string, both are fine this way
          if(element.type == "select"){
            var val = object.val();
            length = val.length;
          } else {
            length = $.trim(value).length;
          }

          if(event == undefined || event.type == "submit"){
            return length > 0;
          }
        },
        msg: "Dit veld is verplicht"
      },
      format: {
        check: function(element, event){

          var pattern = element.input["pattern"];
          var value = element.value();
          var result = undefined;

          if(value == undefined || value.length == 0)
            return;

          var testPattern = function(value, pattern){
            var regExp = new RegExp(pattern, "");
            return regExp.test(value);
          };

          if(event == undefined || event.type == "submit" || event.type == "change"){
            if(pattern){
              result = testPattern(value, pattern);
            }
          }
          
          return result;
        },
        msg: "De inhoud van dit veld klopt niet"
      },
      maxlength: {
        check: function(element, event){
          var object = element.object;
          var length = element.value().length;
          var maxlength = object.attr("data-maxlength");
          return (length > maxlength);
        },
        msg: "Het veld bestaat uit te veel karakters"
      },
      minlength: {
        check: function(element, event){
          var object = element.object;
          var length = element.value().length;
          var minlength = object.attr("data-maxlength");
          return (length < minlength);
        },
        msg: "Het veld moet uit meer karakters bestaan"
      }
    };

    var callCondition = function(condition){
      if (condition === undefined){
        return true;
      } else if($.type(condition) == "boolean"){
        return condition;
      } else if($.type(condition) == "function"){
        return condition.call();
      } else {
        console.error("Condition was not a valid type: " + condition );
      }
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

  ValidatorForm = function(object, options) {
    var form = this;
    this.currentForm = object;
    this.settings = $.extend({}, this.defaults, options);
    this.elements = this.collectElements();
    this.errors = {};
    this.save();

    // Add novalidate tag if HTML5.
  	this.currentForm.attr('novalidate', 'novalidate');

    this.currentForm.bind("submit", function(e) {
      form.validate(e);
      if(!form.isValid()) {
        e.preventDefault();
      }
    });
  };

  ValidatorForm.prototype = {

    defaults: {
      elementOptions: {},
      errorlistClass: "errorlist",
      errorContainerClass: "error",
      errorClass: "error",
      validClass: "valid",
      formGroupClass: 'form-group',
      validationAttribute: 'data-validation',
      element: {},
      input: {}
    },

    validate: function(e) {
      var form = this;
      form.errors = {};
      for(var i in this.elements) {
        var element = this.elements[i];
        if(!element.validate(e)){
          form.errors[element.object.attr("name")] = element.errors;
        }
      }
    },

    isValid: function() {
      for(var i in this.elements) {
        if(this.elements[i].valid === false) {
          this.elements[i].object.focus();
          return false;
        }
      }
      return true;
    },

    save: function(){
      $.data(this.currentForm[0], 'validatorForm', this);
    },

    destroy: function(){
      this.reset();
      $.removeData($(this.currentForm)[0], 'validatorForm');
    },

    reset: function(){
      this.settings = [];
      for(var i in this.elements) {
        this.elements[i].object.val("");
      }
      this.elements = [];
    },

    element: function(identifier){
      if($.type(identifier) == "string"){
        return this.elementByName(identifier);
      } else if($.type(identifier) == "object"){
        return this.elementByObject(identifier);
      } else{
        return undefined;
      }
    },

    elementByObject: function(object){
      var form = this;
      var htmlElement = $(object)[0];
      for(var i in form.elements) {
        if(form.elements[i].object[0] == htmlElement)
          return form.elements[i];
      }
    },

    elementByName: function(name){
      var form = this;
      for(var i in form.elements) {
        if(form.elements[i].name == name)
          return form.elements[i];
      }
    },

    findByName: function( name ) {
      var htmlForm = this.currentForm[0];
			// select by name and filter by form for performance over form.find("[name=...]")
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == htmlForm && element.name == name && element || null;
			});
		},

    collectElements: function(){
      var form = this;
      var elements = [];

      form.setupInputFromElements();
      form.setupElementsFromInput();

      var input = this.settings.input;

      $.each(input, function(name, options) {
        var object = form.findByName(name);
        if(options.validation !== undefined) {
          elements.push(new ValidatorElement(object, form));
        }
      });
      return elements;
    },

    setupElementsFromInput: function(){
      var form = this;
      if(form.settings.input){
        $.each(form.settings.input, function(name, options){
          var el = form.findByName(name);
          if(el){
            var object = $(el);
            object.attr(form.settings.validationAttribute, options["validation"]);
            object.attr("data-pattern", options["pattern"]);
          }
        })
      }
    },

    setupInputFromElements: function(){
      var form = this;
      form.currentForm.find("[" + form.settings.validationAttribute + "]").each(function() {
        var object = $(this);
        var input = {};
        $(this.attributes).each(function(i, attribute){
          if(new RegExp("data-", "").test(attribute.name))
            input[attribute.name.replace("data-", "")] = attribute.value;
        });
        form.settings.input[object.attr("name")] = input;
      });
    },

    displayValidation: function(element){
      if(element.valid === false){
        this.displayErrorlist(element, element.errors);
      } else if(element.valid === true){
        this.displayValidationSuccess(element);
      }
    },

    displayErrorlist: function(element, errors){
      if(this.settings.displayErrorlist)
        return this.settings.displayErrorlist(element, errors);
      return this.methods.displayErrorlist(element, errors);
    },

    displayValidationSuccess: function(element){
      if(this.settings.displayValidationSuccess)
        return this.settings.displayValidationSuccess(element);
      return this.methods.displayValidationSuccess(element);
    },

    errorlist: function(element, errors){
      if(this.settings.errorlist)
        return this.settings.errorlist(element, errors);
      return this.methods.errorlist(element, errors);
    },

    cleanElement: function(element){
      if(this.settings.cleanElement)
        return this.settings.cleanElement(element);
      return this.methods.cleanElement(element);
    },

    container: function(element){
      if(this.settings.container)
        return this.settings.container(element);
      return this.methods.container(element);
    },

    methods: {

      displayValidationSuccess: function(element){
        var validClass = element.form.settings.validClass;
        element.object.addClass(validClass);
//        element.container.addClass(validClass);
      },

      displayErrorlist: function(element, errors){
        var errorClass = element.form.settings.errorClass;
        var errorContainerClass = element.form.settings.errorContainerClass;
        var errorlist = element.form.errorlist(element, errors);
        element.object.addClass(errorClass);
        element.container.addClass(errorContainerClass);
        element.container.append(errorlist);
      },

      errorlist: function(element, errors){
        var errorlistClass = element.form.settings.errorlistClass;
        var errorlist = $(document.createElement("ul")).addClass(errorlistClass);
        errorlist.empty();
        for(var error in errors) {
           errorlist.append("<li>"+ errors[error] +"</li>");
        }
        return errorlist;
      },

      cleanElement: function(element){
        var validClass = element.form.settings.validClass;
        var errorClass = element.form.settings.errorClass;
        var errorContainerClass = element.form.settings.errorContainerClass;
        var errorlistClass = element.form.settings.errorlistClass;
        element.object.removeClass(errorClass).removeClass(validClass);
        element.container.removeClass(errorContainerClass).removeClass(validClass);
        element.container.find("." + errorlistClass).remove();
      },
      
      container: function(element){
        return element.object.parent();
      },

      getValue: function(element){

        var value;

        if(element.type == "radio"){
          $.each(element.object, function(i, htmlElement){
            var object = $(htmlElement);
            if(object.is(":checked")){
              value = object.val();
            }
          });
        } else if (element.type == "checkbox"){
          // if there is a hidden fallback option return that value
          if(element.object.is(":checked")){
             value = element.object.val();
          } else {
            var name = element.object.attr("name");
            var hiddenObject = element.form.currentForm.find("[type=hidden][name=" + name + "]");
            value = $(hiddenObject).val();
          }
        } else {
          value = element.object.val();
        }
        return value;
      }
    }
  };

//  Constructor ValidatorElement

  ValidatorElement = function(object, form) {
    this.form = form;
    this.object = object;
    this.name = object.attr("name");
    this.type = this.inputType();
    this.valid = false;
    this.errors = [];
    this.attach("change");
    this.container = form.container(this);
    this.input = this.form.settings.input[object.attr("name")];
    this.settings = $.extend({}, this.defaults, form.settings.elementOptions);
  };
      
  ValidatorElement.prototype = {

    attach : function(event) {

      var element = this;

      if(event == "change") {
        element.object.bind("change",function(e) {
          return element.validate(e);
        });
      }

//      if(event == "keyup") {
//        element.object.bind("keyup",function(e) {
//          return element.validate(e);
//        });
//      }

    },

    validate : function(e) {
      var element = this;
      element.errors = this.errorsFromValidation(e);
      element.valid = null;
      element.form.cleanElement(element);

      if(element.errors.length > 0) {
        element.object.unbind("keyup");
        element.attach("keyup");
        element.valid = false;
      } else{
        if(element.value() !== undefined && element.value().length > 0){
          element.valid = true;
        }
      }

      element.form.displayValidation(element);

      return element.valid;
    },

    value: function(){
      return this.form.methods.getValue(this);
    },

    checkable: function( ) {
			return /radio|checkbox/i.test(this.type);
		},

    inputType: function(){
      var object = this.object;
      switch( object[0].nodeName.toLowerCase() ) {
      case 'select':
        return "select";
      case 'textarea':
        return 'textarea';
      case 'input':
        return object.attr("type");
      }
    },
    
    errorsFromValidation: function(e){
      var element = this;
      
//      var validationAttribute = element.form.settings.validationAttribute;
//    @todo after tests, the script seems broken
//      if(!element.object.attr(validationAttribute)){
//        console.log(element.object);
//      }

      var types = element.input.validation.split(" ");
      var errors = [];
      for (var i in types) {
        var rule = $.validator.getRule(types[i]);
        var result = rule.check(element, e);
        if(result === false) {
          errors.push(rule.msg);
        }
      }
      return errors;
    }
    
  };

  $.extend($.fn, {

    validatorForm: function( options ) {
      
      // check if a validator for this form was already created
  		var validator = $.data(this[0], 'validatorForm');

      if ( validator ) {
  			return validator;
  		}

      return new ValidatorForm(this, options);
    },

    validate: function() {
      var validator = $.data(this[0], 'validatorForm');
      validator.validate();
      return validator.isValid();
    }
    
  });
  
  $.validator = new Validator();

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