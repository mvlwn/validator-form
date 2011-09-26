validator-form -- Flexible jQuery Validation
============================================

## Description

ValidatorForm is inspired by the jQuery Validation Plugin (http://bassistance.de/jquery-plugins/jquery-plugin-validation/)
and the jQuery Validation From Scratch tutorial (http://webcloud.se/log/Form-validation-with-jQuery-from-scratch/)

The goal is to make a lightweight framework for form validation. It should be easy to extend for personal usage.

The script is tested with jQuery 1.6

## Usage

### Attribute conditions

  $(document).ready(function($){
    $("#myform").validatorForm();
  });

  <form id="myform" action="#" method="post" onsubmit="return false;">
   	<p>
   		<label for="name">Name</label><br/>
   		<input type="text" value="" name="name" id="name" data-validation="required format" data-pattern="^[a-zA-Z ]{1,30}$" />
   	</p>
  </form>
  
### Function conditions

  $(document).ready(function($){
    $("#myform").validatorForm({
      input: {
        "name": {
          validation: "required format",
          pattern: "^[a-zA-Z ]{1,30}$"
        }
      }
    });
  });

  <form id="myform" action="#" method="post" onsubmit="return false;">
   	<p>
   		<label for="name">Name</label><br/>
   		<input type="text" value="" name="name" id="name" />
   	</p>
  </form>

