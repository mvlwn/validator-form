// @todo: add API documentation

(function($) {

  // 
  Validator = function(){

    var rules = {};

    return {
      addRule: function(name, rule){
        rules[name] = rule;
      },
      getRule: function(name){
        return rules[name];
      },
      messages: {
        required: "This field is required",
        format: "The format of the field is not correct",
        maxlength: "The contents of the field is too long",
        minlength: "The contents of the field is too short"
      }
    }
    
  };

  // 
  ValidatorRule = function(options){

    var defaults = {
      check: function(){ return true },
      errorMessage: function(){ return "This field contains an error" },
      checkCondition: function(condition){
        if (condition === undefined){
          return true;
        } else if($.type(condition) == "boolean"){
          return condition;
        } else if($.type(condition) == "function"){
          return condition.call();
        } else {
          console.error("Condition was not a valid type: " + condition );
        }
      }
    };

    var methods = $.extend({}, defaults, options);

    return {
      check: function(element, event){
        return methods.check(element, event);
      },
      msg: function(){
        if($.type(methods.errorMessage) == "function"){
          return methods.errorMessage();
        } else {
          return methods.errorMessage;
        }
      }
    }
    
  };

  ValidatorForm = function(object, options) {

    var form = this;

    this.currentForm = object;
    this.settings = $.extend(true, {}, this.defaults, options);
    this.elements = this.collectElements();
    this.groups = this.collectGroups();
    this.errors = {};
    this.save();

    // Add novalidate tag if HTML5.
  	this.currentForm.attr('novalidate', 'novalidate');

    this.currentForm.bind("submit", function(e) {
      form.settings.beforeSubmit(form, e);
      form.validate(e);
      if(!form.isValid()) {
        form.focusFirstElementWithError();
        form.settings.afterSubmitFailed(form, e);
        e.preventDefault();
      }else{
        form.settings.afterSubmitSuccess(form, e);
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
      elements: {},
      focusedElement: undefined,
      input: {},
      beforeValidate: function(form, event){},
      afterValidate: function(form, event){},
      beforeSubmit: function(form){},
      afterSubmitFailed: function(form){},
      afterSubmitSuccess: function(form){}

    },

    validate: function(e) {
      this.settings.beforeValidate(this, e);
      this.methods.validate(this, e);
      this.settings.afterValidate(this, e);
    },

    isValid: function() {
      return this.methods.isValid(this);
    },

    focusFirstElementWithError: function(){
      var form = this;
      for(var i in form.elements) {
        if(form.elements[i].valid === false){
          form.elements[i].object.focus();
          return true;
        }
      }
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
        var object = this.elements[i].object;
        object.val("").attr("checked", false);
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

    // Find element by form name
    // <input type="text" name="my_form" />
    // 
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
        if(object.length == 0){
          console.error("No objects found for: " + name);
        } else {
          if(options["validation"] !== undefined) {
           elements.push(new ValidatorElement(object, form));
          }
        }
      });
      return elements;
    },

    collectGroups: function(){
      var form = this;
      var groups = [];
      var input = this.settings.input;

      $.each(input, function(name, options) {
        if(options["group"] !== undefined) {
          var groupName = options["group"];
          if(!form.getGroup(groupName))
            var group = new ValidatorGroup(groupName, form);
            groups.push(group);
        }
      });
      return groups;
    },

    getGroup: function(name){
      var form = this;
      if(!form.groups)
        return false;
      $.each(form.groups, function(i, group){
        if(group.name == name)
          return group;
      });
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

      validate: function(form, event){
        form.errors = {};
        for(var i in form.elements){
          var element = form.elements[i];
          if(!element.validate(event)){
            form.errors[element.object.attr("name")] = element.errors;
          }
        }
      },

      isValid: function(form){
        for(var i in form.elements) {
          if(form.elements[i].valid === false){
            return false;
          }
        }
        return true;
      },

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

  ValidatorElement = function(object, form) {
    this.form = form;
    this.object = object;
    this.name = object.attr("name");
    this.type = this.inputType();
    this.valid = false;
    this.errors = [];
    this.attachEvents();
    this.container = form.container(this);
    this.input = this.form.settings.input[object.attr("name")];
    this.group = function(){ return form.getGroup(this.input.group) };
    this.settings = $.extend({}, this.defaults, form.settings.elementOptions);
    this.callHandler("afterInitialize");
  };
      
  ValidatorElement.prototype = {
    attachEvents: function(){
      this.attach("change");
      this.attach("focus");
      this.attach("keyup");
      this.attachCustomEvents(this.form.settings.events);
    },
    attach : function(event) {

      var element = this;

      if(event == "change") {
        element.object.bind("change", function(e) {
          var group = element.group();
          if(group)
            group.callEvent("change");
          return element.validate(e);
        });
      }

      if(event == "focus"){
        element.object.bind("focus", function(e){
          element.form.focusedElement = element;
          return true
        });
      }

      if(event == "keyup") {
        element.object.bind("keyup", function(e) {
          element.form.cleanElement(element);
        });
      }

    },

    attachCustomEvents: function(events){
      if(!events)
        return;
      var element = this;
      var object = element.object;
      $.each(events, function(name, action){
        object.unbind(name);
        object.bind(name, action);
      });
    },

    validate : function(e) {
      var element = this;
      var group = element.group();
      element.callHandler("beforeValidate", e);
      element.form.cleanElement(element);
      element.errors = [];
      element.errors = element.errorsFromValidation(e);
      element.valid = undefined;

      if(element.errors.length > 0) {
//        element.object.unbind("keyup");
//        element.attach("keyup");
        element.valid = false;
      } else{
        if(element.value() !== undefined && element.value().length > 0){
          element.valid = true;
        }
      }
      if(group)
        group.callEvent((element.valid ? "valid" : "invalid"));
      element.form.displayValidation(element);
      element.callHandler("afterValidate", e);
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
      var types = element.input["validation"].split(" ");
      var errors = [];
      for (var i in types) {
        var rule = $.validator.getRule(types[i]);
        try{          
          if(rule.check(element, e) === false) {
            errors.push(rule.msg());
          }
        }catch(e){          
          errors.push("No rule found for " + types[i] + '('+ i +')');
          errors.push("error: " + e);
        }
      }
      return errors;
    },

    callHandler: function(handler, event){
      var element = this;
      if($.type(element.input[handler]) == "function"){
        element.input[handler].call(element, event);
      }else if($.type(element.settings[handler]) == "function"){
        element.settings[handler].call(element, event);
      }
    }
    
  };

  ValidatorGroup = function(name, form, options){
    this.name = name;
    this.form = form;
    this.elements = this.elementsByGroupName();
    this.events = {
      "beforechange": function(){},
      "afterchange": function(){},
      "onvalid": function(){},
      "oninvalid": function(){},
      "beforevalidate": function(){},
      "aftervalidate": function(){}
    };
    if(form.settings.group)
      $.extend(this.events, form.settings.group["all"], form.settings.group[name]);
  };

  ValidatorGroup.prototype = {
    valid: function(){
      $.each(this.elements, function(i, element){
        if(element.valid === false){
          return false;
        }
      });
      return true;
    },
    callEvent: function(event){
      if(this.events[event])
        this.events.call(event);
    },
    elementsByGroupName: function(){
      var group = this;
      var elements = [];
      $.each(group.form.elements, function(i, element){
        if(element.group == group.name)
          $(elements).push(element);
      });
      return elements;
    }
  };

  /* Extend jQuery  */
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


  $.rule = function(options){
    return new ValidatorRule(options);
  };

  /* ******** RULES ********** */

  $.validator.addRule("required", $.rule({
    check: function(element, event){

      var rule = this;
      var object = element.object;
      var required = element.input["required"];

      if(rule.checkCondition(required) === false){
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
    errorMessage: function(){ return $.validator.messages.required }
  }));

  $.validator.addRule("format", $.rule({
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
    errorMessage: function(){ return $.validator.messages.format }
  }));

  $.validator.addRule("maxlength", $.rule({
    check: function(element, event){
      var object = element.object;
      var length = element.value().length;
      var maxlength = object.attr("data-maxlength");
      return (length > maxlength);
    },
    errorMessage: function(){ return $.validator.messages.maxlength }
  }));

  $.validator.addRule("minlength", $.rule({
    check: function(element, event){
      var object = element.object;
      var length = element.value().length;
      var minlength = object.attr("data-maxlength");
      return (length < minlength);
    },
    errorMessage: function(){ return $.validator.messages.minlength }
  }));
  
})(jQuery);
