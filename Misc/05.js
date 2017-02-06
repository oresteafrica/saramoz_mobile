    $(document).ready(function() {
		var curdir = app.GetAppPath();
		var fileTabsXml = curdir + '/Html/tables.xml';
		var latlon_file = curdir + '/Html/latlon.xml';
		var form_main_file = curdir + '/Html/form_main.xml';
		var auth = app.LoadNumber( 'auth', 0 );
		if ( auth != 1 ) { alert('O usuário não é cadastrado'); window.location.href = "../saramoz.html"; }
		if (app.FileExists(form_main_file)) {
			var xmlForm1 = app.ReadFile(form_main_file,"UTF-8");
			var xml = $.parseXML(xmlForm1);
			var	rows = $(xml).children().find('row');
			var field;
			var value;
			rows.each(function(ind,ele){
				field = $(ele).find('id').text();
				value = $(ele).find('value').text();
				switch (field) {
					case 'mz006': // select províncias
						$('#'+field).find('option[value= "'+value+'"]').attr('selected',true);
						break;
					case 'mz012': // select
						inject_sel(fileTabsXml, 'unit_type', 'mz012', value);
						break;
					case 'mz013': // select
						inject_sel(fileTabsXml, 'unit_authority', 'mz013', value);
						break;
					case 'mz014': // select
						inject_sel(fileTabsXml, 'ministries', 'mz014', value);
						break;
					case 'mz015': // select
						inject_sel(fileTabsXml, 'unit_state', 'mz015', value);
						break;
					case 'mz023': // select
						inject_sel(fileTabsXml, 'unit_service', 'mz023', value);
						break;
					case 'mz022': // select sim/não
						$('#'+field).find('option[value= "'+value+'"]').attr('selected',true);
						break;
					default: // text, number input
						$('#'+field).val(value);
				}
			});
		} else {
			inject_sel(fileTabsXml, 'unit_type', 'mz012',1);
			inject_sel(fileTabsXml, 'unit_authority', 'mz013',1);
			inject_sel(fileTabsXml, 'ministries', 'mz014',1);
			inject_sel(fileTabsXml, 'unit_state', 'mz015',1);
			inject_sel(fileTabsXml, 'unit_service', 'mz023',1);
			if (app.FileExists(latlon_file)) { inject_latlon(latlon_file); }
		}


//----------------------------------------------------------------------------------------------------------------------
        $('.voltar').click(function(){
            window.location.href = "../saramoz.html";
        });
//----------------------------------------------------------------------------------------------------------------------
        $('#gravar').click(function(){
			var curdir = app.GetAppPath();
			var form_main_file = curdir + '/Html/form_main.xml';
			var fileUser = curdir + '/Html/user.xml';
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			var mysql_today = yyyy + '-' + mm + '-' + dd;
			if (app.FileExists(fileUser)) {
				var xmlUser = app.ReadFile(fileUser,"UTF-8");
				var user = $.parseXML(xmlUser);
				var local_id = $(user).children().find('id').text();
			} else {
				alert('O usuário não é cadastrado. Deve efectuar login.');
				return;
			}
			var res = '<?xml version="1.0" encoding="UTF-8"?><form_main>';
			res += '<row><id>op_id</id><value>' + local_id + '</value></row>';
			res += '<row><id>in_date</id><value>' + mysql_today + '</value></row>';
			var second_trs = $('#form_elements > table > tbody > tr:odd');
			second_trs.each(function(){
				var ele = $(this).children().eq(0).children().eq(0);
				res += '<row><id>' + $(ele).prop('id') + '</id><value>' + $(ele).val() + '</value></row>';
		    });
			res += '</form_main>';
			app.WriteFile(form_main_file,res,"utf-8");
			alert('O formulário foi gravado na base de dados local. Agora pode actualizar o servidor.');
    	    window.location.href = "../saramoz.html";
        });
//----------------------------------------------------------------------------------------------------------------------
		function inject_latlon(file) {
			var xml_string = app.ReadFile(file);
			var xml = $.parseXML(xml_string);
			var coor = $(xml).children();
			var lat = $(coor).find('lat').text();
			var lon = $(coor).find('lon').text();
			// valores calculados para Moçambique
			var lat_min = -28;
			var lat_max = -9;
			var lon_min = 28;
			var lon_max = 53;
			if ( lat < lat_min || lat > lat_max || lon < lon_min || lon > lon_max) {
				alert('As coordenadas são fora do território moçambicano');
			} else {
				$('#mz026').val(lat);
				$('#mz027').val(lon);
			}
		}
//----------------------------------------------------------------------------------------------------------------------
		function inject_sel(file, tabname, idsel, opt) {
			var xml_string = app.ReadFile(file);
			var xml = $.parseXML(xml_string);
			var tabs = $(xml).children();
			var options = '';
            tabs.each(function(){
				var rows = $(this).children();
	            rows.each(function(){
					if ( this.tagName == tabname ) {
						var row = $(this).children();
		            	row.each(function(){
							var id = $(this).find('id').text();
							var na = $(this).find('name').text();
							var selnormal = '<option value="' + id + '">' + na + '</option>\n';
							var selselect = '<option value="' + id + '" selected="selected">' + na + '</option>\n';
							if (opt == id) { options += selselect; } else { options += selnormal; }
				     	}); // row.each
					} // if ( this.tagName == tabname )
		     	}); // rows.each
	        }); // tabs.each
 			$('#'+idsel).html(options);
		}
//----------------------------------------------------------------------------------------------------------------------
    });