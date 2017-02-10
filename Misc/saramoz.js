$(document).ready(function() {

	// ini vars area ---------------------------------------------------------------------------------------------------
	var curdir = app.GetAppPath();
	var page00 = curdir + '/saramoz.html';
	var page01 = curdir + '/Html/01.html';
	var page03 = curdir + '/Html/03.html';
	var page05 = curdir + '/Html/05.html';
	var form_main_file = curdir + '/form_main.xml';
	var f_tables = curdir + '/tables.xml';
	var fileUser = curdir + '/user.xml';
	var small_wait_gif = curdir + '/Img/small_rect__blue_load.gif';
	var server_php = 'http://sis-ma.in/sara/php/';
	var url_tables = server_php + 'sara_tables_to_xml.php';
	var url_form_field = server_php + 'sara_from_http_to_field1.php';
	var mac = app.GetMacAddress();
	var model = app.GetModel();
	var is_f_tables = app.FileExists(f_tables);
	var is_fileUser = app.FileExists(fileUser);
	var is_today_ok = compare_today_with_stored_date();
	var user_form = 0; // variable to choose user form: 0 = no user, 1 = user expired, 2 = user active
    var loc = app.CreateLocator( "GPS,Network" );
	// end vars area ---------------------------------------------------------------------------------------------------

	// ini init --------------------------------------------------------------------------------------------------------
	$('#main_page').show();
	if ( is_fileUser && is_today_ok ) { user_form = 2; }
	if ( is_fileUser && ( ! is_today_ok ) ) { user_form = 1; }
	if ( ! is_fileUser ) { user_form = 0; }
	app.SaveNumber( 'user_form', user_form );
	
	// end init --------------------------------------------------------------------------------------------------------

	// ini main menu ---------------------------------------------------------------------------------------------------
    $('#main_content').children('div').click(function(){
        ix = $(this).index();
        switch (ix) { 
	        case 0: // Entrada dados
            	if ( user_form != 2 ) {
			        alert('O usuário não é cadastrado');
			        break;
            	}
            	if ( ! is_f_tables ) {
            		app.ShowPopup('É preciso actualizar');
			        break;
            	}
				if (app.FileExists(form_main_file)) {
					$('#main_page').hide();
					$('#form_page').show();
					activate_5(form_main_file, f_tables);
			        break;
				}
				if ( confirm('Achar as coordenadas ?') ) {
					$('#main_page').hide();
					$('#coord_page').show();

//---------------------------------------------------------------------------------------------------------------------
    	var ag = '<img alt="aguarde" src="'+curdir+'/Img/small_rect__blue_load.gif" />';
        $('#lat_01').html(ag);
        $('#lon_01').html(ag);
        $('#pre_01').html(ag);
        $('#met_01').html(ag);
		loc.SetOnChange(function(data) {
	        lat = data.latitude;
    	    lon = data.longitude;
	        $('#lat_01').text(lat);
    	    $('#lon_01').text(lon);
 	       $('#pre_01').text(data.accuracy+' m.');
    	    $('#met_01').text(data.provider);
    	    $('#buttons_01 > button').show();
	        $.ajax({
    	        url: 'http://sis-ma.in/sara/php/ping.php',
        	    success: function(result){
            		var myLatLng = {lat: lat, lng: lon};
                	var map = new google.maps.Map($('#map_01')[0], {
              	  		zoom: 4,
              	      	center: myLatLng,
              	      	mapTypeId: google.maps.MapTypeId.ROADMAP,
              	      	disableDefaultUI: true
              	  	});
              	  	var marker = new google.maps.Marker({
              	  		position: myLatLng,
              		  	map: map,
               	     	title: 'Estou aqui'
               	 	});
            	},
            	error: function(result){
                	$('#map_01').html('<p>Não se pode visualizar o mapa porque não há conexão Internet</p>');
            	}
        	});

    	});
        loc.SetRate( 10 ); // seconds
        loc.Start();
//---------------------------------------------------------------------------------------------------------------------
			        break;
				} else {
					$('#main_page').hide();
					$('#form_page').show();
					activate_5(form_main_file, f_tables);
					$('#mac_02').val(mac);
					$('#model_02').val(model);
			        break;
				}
		        break;
	        case 1: // Credencial
				$('#main_page').hide();
				$('#credential_page').show();
				if (user_form == 0) { // user not registered
					$('#mac_02').val(mac);
					$('#model_02').val(model);
					$('#form_user_02').show();
					$('#form_curr_user_02').hide();
					$('#info_curr_user_02').hide();
				}
				if (user_form == 1) {// user expired
					$('#form_user_02').hide();
					$('#form_curr_user_02').show();
					$('#info_curr_user_02').hide();
				}
				if (user_form == 2) {// user active
					$('#form_user_02').hide();
					$('#form_curr_user_02').hide();
					$('#info_curr_user_02').show();
				}
		        break;
	        case 2: // Actualiza servidor
            	if ( user_form != 2 ) {
			        alert('O usuário não é cadastrado');
			        break;
            	} else {
					$('#main_page').hide();
					$('#update_page').show();
					var ajax1 = get_tables(url_tables, f_tables);
					if ( app.FileExists(form_main_file) ) {
						var ajax2 = send_form(url_form_field,form_main_file);
						$.when(ajax1, ajax2).done(function() {
							$('.voltar').prop('disabled',false);
						});
					} else {
						$('#update_page_msg2').hide();
						$.when(ajax1).done(function() {
							$('.voltar').prop('disabled',false);
						});
					}
				}

		        break;
            default:
        }
    });
	// end main menu ---------------------------------------------------------------------------------------------------

	// ini clicks ------------------------------------------------------------------------------------------------------
		//------------------------------------------------
        $('.voltar').click(function(){
            window.location.href = page00;
        });
		//------------------------------------------------
        $('#credenciar_02').click(function(){ 
			var no = $('#user_01_02').val(); // nome completo
			var em = $('#user_02_02').val(); // email
			var ce = $('#user_03_02').val(); // número celular
			var se = $('#user_04_02').val(); // senha
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) { dd='0'+dd } 
			if(mm<10) { mm='0'+mm } 
			var da = mm+dd+yyyy;
			var wo = (Math.random() + 1).toString(36).substring(2, 5);
			var url = server_php + 'sara_login.php?no='+no+'&em='+em+'&ce='+ce+'&se='+se+'&wo='+wo;
	    	$.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				beforeSend: function(a){  },
				success: function(a){
					if (isNaN(a)) { alert('Problemas com a conexão Internet, tente mais tarde.'); return; }
					var mid = parseInt(a);
					if (mid > 0) {
						var xmlUser = '<?xml version="1.0" encoding="UTF-8"?>';
						xmlUser += '<user>';
						xmlUser += '<id>'+mid+'</id>';
						xmlUser += '<name>'+no+'</name>';
						xmlUser += '<email>'+em+'</email>';
						xmlUser += '<cell>'+ce+'</cell>';
						xmlUser += '<pass>'+se+'</pass>';
						xmlUser += '<date>'+da+'</date>';
						xmlUser += '</user>';
						app.WriteFile(fileUser,xmlUser,"UTF-8");
						app.SaveNumber( 'auth', 1 );
						alert('Cadastramento efectuado com sucesso');
			            window.location.href = page00;
					} else {
						alert('O usuário não é cadastrado. Contacte o administrador de rede.');
			            window.location.href = page00;
					}
        		},
				error: function(a,b,c){ alert('Problemas com a conexão Internet, tente mais tarde.'); return; },
				complete: function(a,b){  }
			});

        });
		//------------------------------------------------
        $('#login_02').click(function(){ 
			var local_se = '';
			if (app.FileExists(fileUser)) {
				var xmlUser = app.ReadFile(fileUser,"UTF-8");
				var user = $.parseXML(xmlUser);
				local_se = $(user).children().find('pass').text();
			} else {
				alert('Login impossível. Tente cadastrar novamente.');
			    window.location.href = page00;
				return;
			}
			if ( $('#user_senha_02').val() == local_se ) {
				app.SaveNumber( 'auth', 1 );
				if ( attrib_today_date_to_user_file() != 1) {
					alert('Login impossível. Tente cadastrar novamente.');
				    window.location.href = page00;
					return;
				}
				alert('O usuário é cadastrado. Pode continuar o seu trabalho.');
			    window.location.href = page00;
			} else {
				alert('Login não correto');
			    window.location.href = page00;
			}
        });
		//------------------------------------------------
        $('#outro_02').click(function(){
			app.DeleteFile( fileUser );
			app.SaveNumber( 'user_form', 0 );
			alert('O usuário corrente foi apagado, pode cadastrar outro usuário.');
			window.location.href = page00;

        });
		//------------------------------------------------
    	$('#voltar_01').click(function(){
			loc.Stop();
			window.location.href = page00;
		});
		//------------------------------------------------
		$('#continuar_01').click(function(){
			loc.Stop();
			var inlat = $('#lat_01').text();
			var inlon = $('#lon_01').text();
			$('#coord_page').hide();
			$('#form_page').show();
			$('#mz026').val(inlat);
			$('#mz027').val(inlon);
			activate_5(form_main_file, f_tables);
		});
		//------------------------------------------------
        $('.voltar_05').click(function(){window.location.href = page00;});
		//------------------------------------------------
        $('#gravar_05').click(function(){
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
			res += '<row><id>op_id</id><value>' + local_id + '</value></row>' + "\n";
			res += '<row><id>in_date</id><value>' + mysql_today + '</value></row> + "\n"';
			var second_trs = $('#form_elements_05 > table > tbody > tr:odd');
			second_trs.each(function(){
				var ele = $(this).children().eq(0).children().eq(0);
				res += '<row><id>' + $(ele).prop('id') + '</id><value>' + $(ele).val() + '</value></row>' + "\n";
		    });
			res += '</form_main>';
			app.WriteFile(form_main_file,res,"utf-8");
			alert('O formulário foi gravado na base de dados local. Agora pode actualizar o servidor.');
    	    window.location.href = page00;
        });
		//------------------------------------------------
	// end clicks ------------------------------------------------------------------------------------------------------



	// ini funcs -------------------------------------------------------------------------------------------------------
		//------------------------------------------------
		function attrib_today_date_to_user_file() {
			var local_id = '';
			var local_no = '';
			var local_em = '';
			var local_ce = '';
			var local_se = '';
			var local_da = '';
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) { dd='0'+dd } 
			if(mm<10) { mm='0'+mm } 
			var da = mm+dd+yyyy;
			if (app.FileExists(fileUser)) {
				var xmlUser_old = app.ReadFile(fileUser,"UTF-8");
				var user = $.parseXML(xmlUser_old);
				local_id = $(user).children().find('id').text();
				local_no = $(user).children().find('name').text();
				local_em = $(user).children().find('email').text();
				local_ce = $(user).children().find('cell').text();
				local_se = $(user).children().find('pass').text();
				app.DeleteFile( fileUser );
				var xmlUser = '<?xml version="1.0" encoding="UTF-8"?>';
				xmlUser += '<user>';
				xmlUser += '<id>'+local_id+'</id>';
				xmlUser += '<name>'+local_no+'</name>';
				xmlUser += '<email>'+local_em+'</email>';
				xmlUser += '<cell>'+local_ce+'</cell>';
				xmlUser += '<pass>'+local_se+'</pass>';
				xmlUser += '<date>'+da+'</date>';
				xmlUser += '</user>';
				app.WriteFile(fileUser,xmlUser,"UTF-8");
			} else {
				return 0;
			}
			return 1;
		}
		//------------------------------------------------
		function compare_today_with_stored_date() {
			if (! app.FileExists(fileUser)) { return 0; }
			var today = new Date();
			var dd = parseInt(today.getDate());
			var mm = parseInt(today.getMonth());
			var yyyy = parseInt(today.getFullYear());
			var today_no_time = new Date(yyyy,mm,dd);
			var xmlUser = app.ReadFile(fileUser,"UTF-8");
			var user = $.parseXML(xmlUser);
			var local_date_string = $(user).children().find('date').text();
			var local_yyyy = parseInt(local_date_string.substr(4,4));
			var local_mm = parseInt(local_date_string.substr(0,2) - 1);
			var local_dd = parseInt(local_date_string.substr(2,2));
			var local_date_no_time = new Date(local_yyyy,local_mm,local_dd);
			if (local_date_no_time.getTime() != today_no_time.getTime()) { return 0; }
			return 1;
		}
		//------------------------------------------------
		function get_tables(url,file) {
			var error_msg = 'Houve problemas de conexão. As tabelas locais não foram actualizadas. Tente mais tarde.';
    		$.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				beforeSend: function(a){  },
				success: function(a){
					app.WriteFile(file,a,"utf-8");
					$('#update_page_msg1').text('Tabelas locais actualizadas').css('color','green');
        		},
				error: function(a,b,c){ 
					$('#update_page_res').append(error_msg);
				},
				complete: function(a,b){ }
			});
		}
		//------------------------------------------------
		function send_form(url,file) {
			var error_msg = 'Houve problemas de conexão. A ficha não foi enviada para o servidor. Tente mais tarde.';
			if (! app.FileExists(file)) { return false; }
			var xmlForm1 = app.ReadFile(file,"UTF-8");
			var xml = $.parseXML(xmlForm1);
			var	rows = $(xml).children().find('row');
			var data = [];
			rows.each(function(ind,ele){
				data.push($(ele).find('id').text()+'='+$(ele).find('value').text());
			});
			var datastring = '?' + data.join('&');
    		$.ajax({
				url: url + datastring,
				type: 'GET',
				dataType: 'html',
				beforeSend: function(a){  },
				success: function(a){
					if (a == '1') {
						app.DeleteFile(file);
						$('#update_page_msg2').text('Ficha enviada para o servidor').css('color','green');
					} else {
						$('#update_page_res').append(error_msg);
					}
        		},
				error: function(a,b,c){
					$('#update_page_res').append(error_msg);
				},
				complete: function(a,b){ }
			});
		}
		//------------------------------------------------
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
		//------------------------------------------------
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
		//------------------------------------------------
		function activate_5(form, fileTabsXml) {
			if (app.FileExists(form)) {
				var xmlForm1 = app.ReadFile(form,"UTF-8");
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
			}
		}
		//------------------------------------------------
		//------------------------------------------------
		//------------------------------------------------
		//------------------------------------------------
		//------------------------------------------------
		//------------------------------------------------
	// end funcs -------------------------------------------------------------------------------------------------------


});














