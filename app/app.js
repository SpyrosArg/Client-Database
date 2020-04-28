var PobucaAdmin = (function(win, doc) {
	
	var app = {
		"welcome": {
			"header": "Welcome"
		},
		"customers": {
			"header": "Customers",
			"api_url": "http://www.json-generator.com/api/json/get/clGirwieiG?indent=2"
		},
		"products": {
			"header": "Products",
			"button": {
				"label": "Delete",
				"onclick": "PobucaAdmin.deleteProduct();"
			},
			"api_url": "http://www.json-generator.com/api/json/get/cfuYARGbZu?indent=2",
			"selectable": true,
			"allow_multiple_selection": false
		},
		"users": {
			"header": "Users",
			"api_url": "http://www.json-generator.com/api/json/get/bUKoqVniOG?indent=2",
			"button": {
				"label": "Add New",
				"onclick": "PobucaAdmin.load('add_user');"
			}
		},
		"add_user": {
			"header": "<a href=\"javascript:\" onclick=\"PobucaAdmin.load('users');\">Add new user</a>",
			"button": {
				"label": "Create",
				"onclick": "PobucaAdmin.createUser();"
			},
			"form": [
				{
					"title": "Name",
					"mandatory": true
				},
				{
					"title": "Code",
					"mandatory": true
				}
			]
		}
	}
	
	// Attach event handlers
	win.onload = init;
	
	function init() {
		
		attachEventHandlers();
		
		PobucaAdmin.load("welcome");
	}
	
	function load(section) {
		
		// reset content
		doc.getElementById("content").innerHTML = "";
		
		// get section configuration
		var config = app[section];
		
		if(config)
		{
			// set section header
			doc.getElementsByClassName("topbar__header")[0].innerHTML = config["header"];
			
			if(config["button"]) {
				var buttonHtml = '<a href="javascript:" onclick="'+ config["button"]["onclick"] +'">'+ config["button"]["label"] +'</a>';
				doc.getElementsByClassName("topbar__nav")[0].innerHTML = buttonHtml;
			}
			else {
				doc.getElementsByClassName("topbar__nav")[0].innerHTML = "";
			}
			
			if(config["api_url"])
				client(config["api_url"], config, buildTable);
			
			if(config["form"])
				buildForm(config);
		}
	}
	
	function deleteProduct() {
		var checkboxes = doc.getElementById("content").querySelectorAll("input[type=checkbox]:checked");
		
		if(checkboxes.length === 0)
			alert('Please choose one product');
		else if(checkboxes.length > 1)
			alert('Please choose only one product');
		else if (confirm('Are you sure you want to delete this product?')) {
			var productIdToDelete = checkboxes[0].value;
			
			var key = "http://www.json-generator.com/api/json/get/cfuYARGbZu?indent=2";
			var products = JSON.parse(sessionStorage.getItem(key));
			
			var filteredProducts = products.filter(function(p){
				return p.code !== productIdToDelete;
			});
			
			sessionStorage.setItem(key, JSON.stringify(filteredProducts));
			
			PobucaAdmin.load("products");
		}
	}
	
	function createUser() {
		var requiredFields = doc.getElementsByClassName("user-form")[0].querySelectorAll("input[required]");
		var errorMessage = "";
		var newUser = {};
		
		for(var field of requiredFields)
		{
			if(field.value === "")
			{
				if(errorMessage === "")
					errorMessage = field.getAttribute("error-msg");
				else
					errorMessage = "All fields are required";
			}
			else {
				newUser[field.name.toLowerCase()] = field.value;
			}
		}
		
		if (errorMessage === "") {
			var key = "http://www.json-generator.com/api/json/get/bUKoqVniOG?indent=2";
			var saved_json = JSON.parse(sessionStorage.getItem(key));
			
			saved_json.unshift(newUser);
			
			sessionStorage.setItem(key, JSON.stringify(saved_json));
			
			PobucaAdmin.load("users");
		}
		else
			alert(errorMessage);
	}
	
	function buildForm(config) {
		var buffer = [];
		
		buffer.push('<form class="user-form">')
		
		for(var field of config["form"])
		{
			buffer.push('<label>' + field["title"].toUpperCase() + '' + (field["mandatory"] ? '<span class="mandatory">*</span>' : '') + '</label><br />');
			buffer.push('<input type="text" name="'+ field["title"] +'" ' + (field["mandatory"] ? 'required error-msg="' + field["title"].toUpperCase() + ' IS REQUIRED"' : '') + ' /><br />');
		}
		
		buffer.push('</form>')
		
		// append html
		doc.getElementById("content").innerHTML = buffer.join('');
	}
	
	function oncheckChanged(chk) {
		var tr = chk.parentNode.parentNode.parentNode;
		
		if(chk.checked && !tr.classList.contains("selected"))
			tr.classList.add("selected");
		else if(!chk.checked && tr.classList.contains("selected"))
			tr.classList.remove("selected");
	}
	
	function buildTable(data, config) {
		// extract column names
		var columns = Object.keys(data[0]);
		
		var buffer = [];
		
		// append header
		buffer.push('<div class="box-table"><table><thead><tr>');
		
		if (config["selectable"])
			buffer.push('<th></th>');
		
		for(var col of columns) {
			buffer.push('<th>' + col.toUpperCase() + '</th>');
		}
		
		buffer.push('</tr></thead><tbody>');
		
		// append rows
		for(var row of data) {
			buffer.push('<tr>');
			
			if (config["selectable"]) {
				buffer.push('<td><div class="pb-checkbox">',
								'<input type="checkbox" id="'+ row["code"] +'" value="'+ row["code"] +'" onchange="PobucaAdmin.oncheckChanged(this);" />',
								'<label for="'+ row["code"] +'"></label>',
							'</div></td>');
			}

			for(var col of columns) {
				buffer.push('<td>' + row[col] + '</td>');
			}
			
			buffer.push('</tr>');
		}
		
		buffer.push('</tbody></table></div>');
		
		// append html
		doc.getElementById("content").innerHTML = buffer.join('');
	}
	
	function attachEventHandlers() {
		var sidebarLinks = doc.getElementsByClassName("sidebar")[0].querySelectorAll("a");
		
		sidebarLinks.forEach(item => {
			item.addEventListener('click', event => {
				
				var activeItem = doc.getElementsByClassName("active")[0];
				
				if(activeItem)
					activeItem.classList.remove("active");
				
				item.classList.add("active");
				
				PobucaAdmin.load(item.id);
			})
		})
	}
	
	function client(url, config, success, error) {
		'use strict';

		if(sessionStorage.getItem(url)) {
			var json = JSON.parse(sessionStorage.getItem(url));
			success(json, config);
		}
		else {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.timeout = 5000;
			xhr.onload = function(e) {
			  if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					var json = JSON.parse(xhr.responseText);
					sessionStorage.setItem(url, xhr.responseText);
					success(json, config);
				} else {
					error(xhr.responseText);
				}
			  } else {
				error(xhr.responseText);
			  }
			};
			xhr.onerror = function(e) {
				error(xhr.responseText);
			};
			xhr.ontimeout = function() {
				error('{"status_code":408,"status_message":"Request timed out"}');
			};
			xhr.send(null);
		}
	}
	
	return {
		load: load,
		deleteProduct: deleteProduct,
		createUser: createUser,
		oncheckChanged: oncheckChanged
	}
	
})(window, document);