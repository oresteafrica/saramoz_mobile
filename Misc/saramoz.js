$(document).ready(function() {

	// ini vars area ---------------------------------------------------------------------------------------------------
	var curdir = app.GetAppPath();
	var small_wait_gif = curdir + '/Img/small_rect__blue_load.gif';
    var ag = '<img alt="aguarde" src="'+small_wait_gif+'" />';
	var workdir = '/sdcard/saramoz/xml';
	app.MakeFolder( workdir );

	var form_main_file = workdir + '/form_main.xml';
	var f_tables = workdir + '/tables.xml';
	var fileUser = workdir + '/user.xml';
	var f_debug = workdir + '/debug.txt';
	var server_php = 'http://sis-ma.in/sara/php/';
	var url_tables = server_php + 'sara_tables_to_xml.php';
	var url_form_field = server_php + 'sara_from_http_to_field1.php';
	var mac = app.GetMacAddress();
	var model = app.GetModel();
	var user_form = 0; // variable to choose user form: 0 = no user, 1 = user expired, 2 = user active
    var loc = app.CreateLocator( "GPS,Network" );
	// end vars area ---------------------------------------------------------------------------------------------------


	// ini debug -------------------------------------------------------------------------------------------------------
	//$('#debug').append('<p>small_wait_gif = '+small_wait_gif+'</p>');
	//$('#debug').append('<p>'+ag+'</p>');
	// ini debug -------------------------------------------------------------------------------------------------------

	// ini init --------------------------------------------------------------------------------------------------------
	$('#main_page').show();
	// end init --------------------------------------------------------------------------------------------------------

	// ini main menu ---------------------------------------------------------------------------------------------------
    $('#main_content').children('div').click(function(){
        ix = $(this).index();
        switch (ix) { 
	        case 0: // Entrada dados	<-------------------------------------------------------------------------------
            	if ( check_user_form(workdir) != 2 ) {
			        alert('O usuário não é cadastrado');
			        break;
            	}
            	if ( ! app.FileExists(f_tables) ) {
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
              	  					zoom: 8,
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
								var map_error = '<p>Não se pode visualizar o mapa porque não há conexão Internet</p>';
                				$('#map_01').html(map_error);
            				}
        				});

    				});
			        loc.SetRate( 10 ); // seconds
        			loc.Start();
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
	        case 1: // Credencial	<-----------------------------------------------------------------------------------
				user_form = check_user_form(workdir);
				$('#main_page').hide();
				$('#credential_page').show();
				if (user_form == 0) { // user not registered
					$('#mac_02').val(mac);
					$('#model_02').val(model);
					$('#form_user_02').show();
					$('#form_curr_user_02').hide();
					$('#info_curr_user_02').hide();
				} else {
					var xmlUser = app.ReadFile(fileUser,"UTF-8");
					var user = $.parseXML(xmlUser);
					var username = $(user).children().find('name').text();
					$('.curr_user_02').text(username);
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
	        case 2: // Actualiza servidor	<---------------------------------------------------------------------------
            	if ( check_user_form(workdir) != 2 ) {
			        alert('O usuário não é cadastrado');
			        break;
            	} else {
					$('#main_page').hide();
					$('#update_page').show();
					get_tables(url_tables, f_tables);
					if ( app.FileExists(form_main_file) ) {
						send_form(url_form_field,form_main_file);
					} else {
						$('#update_page_msg2').hide();
					}
				}

		        break;
            default:
        }
    });
	// end main menu ---------------------------------------------------------------------------------------------------

	// ini clicks ------------------------------------------------------------------------------------------------------
		//------------------------------------------------
        $('#voltar_from_update').click(function(){
			$('#update_page').hide();
			$('#main_page').show();
        });
		//------------------------------------------------
        $('.voltar_credential').click(function(){
			$('#credential_page').hide();
			$('#main_page').show();
        });
		//------------------------------------------------
        $('.voltar_05').click(function(){
			$('#form_page').hide();
			$('#main_page').show();
        });
		//------------------------------------------------
    	$('#voltar_01').click(function(){
			loc.Stop();
			$('#coord_page').hide();
			$('#main_page').show();
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
						$('#credential_page').hide();
						$('#main_page').show();
					} else {
						alert('O usuário não é cadastrado. Contacte o administrador de rede.');
						$('#credential_page').hide();
						$('#main_page').show();
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
				$('#credential_page').hide();
				$('#main_page').show();
				return;
			}
			if ( $('#user_senha_02').val() == local_se ) {
				app.SaveNumber( 'auth', 1 );
				if ( attrib_today_date_to_user_file() != 1) {
					alert('Login impossível. Tente cadastrar novamente.');
					$('#credential_page').hide();
					$('#main_page').show();
					return;
				}
				alert('O usuário é cadastrado. Pode continuar o seu trabalho.');
				$('#credential_page').hide();
				$('#main_page').show();
			} else {
				alert('Login não correto');
				$('#credential_page').hide();
				$('#main_page').show();
			}
        });
		//------------------------------------------------
        $('#outro_02').click(function(){
			app.DeleteFile( fileUser );
			alert('O usuário corrente foi apagado, pode cadastrar outro usuário.');
			$('#credential_page').hide();
			$('#main_page').show();
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
        $('#gravar_05').click(function(){
		//------------------------------------------------
		// save current input form to xlm file for later transmission to server
		//------------------------------------------------
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
			var res = '<?xml version="1.0" encoding="UTF-8"?>' + "\n";
			res += '<form_main>' + "\n";
			res += '<row><id>op_id</id><value>' + local_id + '</value></row>' + "\n";
			res += '<row><id>in_date</id><value>' + mysql_today + '</value></row>' + "\n";
			var second_trs = $('#form_elements_05 > table:nth-of-type(1) > tbody > tr:odd');
			second_trs.each(function(){
				var ele = $(this).children().eq(0).children().eq(0);
				var eleid = $(ele).prop('id');
				if (eleid == 'mz023_c') { return true; }  // managed separately
				res += '<row><id>' + eleid + '</id><value>' + $(ele).val() + '</value></row>' + "\n";
		    });

			// ini section mz023_c
			var checked_ids_array = [];
			$('#mz023_c > input:checked').each(function(){
				var checked_id = this.id;
				var checked_id_splitted = checked_id.split('_');
				var service_id = checked_id_splitted[2];
				checked_ids_array.push(service_id);
		    });
			var checked_ids_string = checked_ids_array.join(',');
			res += '<row><id>mz023_c</id><value>' + checked_ids_string + '</value></row>' + "\n";
			// end section mz023_c

			// ini section mz200
			var inputs_from_table_mz200 = $('#form_page table:nth-of-type(2) > tbody > tr > td > input');
			inputs_from_table_mz200.each(function(){
				var mz200_val = parseInt($(this).val());
				var mz200_id = this.id;
				if ( !isNaN(mz200_val)  && mz200_val > 0) {
					res += '<row><id>' + mz200_id + '</id><value>' + mz200_val + '</value></row>' + "\n";
				}
		    });
			// end section mz200

			res += '</form_main>';
			app.WriteFile(form_main_file,res,"utf-8");
			alert('O formulário foi gravado na base de dados local. Agora pode actualizar o servidor.');
			$('#form_page').hide();
			$('#main_page').show();
        });
		//------------------------------------------------
		$('#bu_mz003_3').click(function(){
			$('.mz003_row_select').show();
			$('.mz003_row_input').hide();
        });
		//------------------------------------------------
	// end clicks ------------------------------------------------------------------------------------------------------


	// ini changes -----------------------------------------------------------------------------------------------------
		//------------------------------------------------
			$('#mz006').change(function(){
				$('#mz007_n').html('<option value="0" select="selected">Escolhe o distrito</option>');
				dist2select(f_tables, this.value, '#mz007_n', 0);
				$('#mz007_n').show();
				$('#mz003_n').hide();
			});
		//------------------------------------------------
			$('#mz007_n').change(function(){
				$('#mz003_n').html('<option value="0" select="selected">Escolhe a unidade</option>');
				us2select(f_tables, $('#mz006').val(), this.value, '#mz003_n', 0);
				$('#mz003_n').show();
			});
		//------------------------------------------------
			$('#mz003_n').change(function(){
				if ( this.value==0 ) {
					$('.mz003_row_select').hide();
					$('.mz003_row_input').show();
				}
			});
		//------------------------------------------------
	// end changes -----------------------------------------------------------------------------------------------------


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
			$('#update_page_msg2').text('Aguarde o envio da ficha para o servidor').css('color','red');
			var xmlForm1 = app.ReadFile(file,"UTF-8");
			var xml = $.parseXML(xmlForm1);
			var	rows = $(xml).children().find('row');
			var data = [];
			var form_check = 1;
			var send_err_msg_a = [];
			var mz003; var mz003_n;
			rows.each(function(ind,ele){
				var key = $(ele).find('id').text();
				var val = $(ele).find('value').text();
				var skey = '';
		        switch (key) { 
	    		    case 'mz001':
						skey = 'Código da unidade';
						if(val.length > 16) { send_err_msg_a.push(skey+' longo \n('+val+')'); form_check =0; }
						if(val.length < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz004':
						skey = 'Nome curto da unidade';
						if(val.length > 10) { send_err_msg_a.push(skey+' longo \n('+val+')'); form_check =0; }
						if(val.length < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz005':
						skey = 'Localização da unidade';
						if(val.length > 255) { send_err_msg_a.push(skey+' longo \n('+val+')'); form_check =0; }
						if(val.length < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz006':
						skey = 'Província selecionada';
						if(val < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz007_n':
						skey = 'Distrito selecionado';
						if(val < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz008':
						skey = 'Posto Administrativo';
						if(val.length > 255) { send_err_msg_a.push(skey+' longo \n('+val+')'); form_check =0; }
						if(val.length < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz009':
						skey = 'Localidade';
						if(val.length > 255) { send_err_msg_a.push(skey+' longo \n('+val+')'); form_check =0; }
						if(val.length < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz010':
						skey = 'Endereço fisico';
						if(val.length > 255) { send_err_msg_a.push(skey+' longo \n('+val+')'); form_check =0; }
						if(val.length < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz011':
						skey = 'Informação de contacto';
						if(val.length > 255) { send_err_msg_a.push(skey+' longo \n('+val+')'); form_check =0; }
						if(val.length < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz012':
						skey = 'Tipo de unidade selecionada';
						if(val < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz013':
						skey = 'Autoridade gestora selecionada';
						if(val < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz014':
						skey = 'Ministério de tutela selecionado';
						if(val < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz015':
						skey = 'Estado operacional selecionado';
						if(val < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz016':
						skey = 'Data de construção';
						if(! valid(val)) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz017':
						skey = 'Data de ínicio';
						if(! valid(val)) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz018':
						skey = 'Data última requalificação';
						if(! valid(val)) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz019':
						skey = 'Data do último estado operacional';
						if(! valid(val)) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz020':
						skey = 'Data alteração de dados da Unidade de Saúde';
						if(! valid(val)) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz022':
						skey = 'Consultas externas apenas';
						if(val > 1 || val < 0) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz023_c':
						skey = 'Tipos de serviços prestados';
						if(val.length < 1) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz025':
						skey = 'Altitude';
						if( isNaN(val) ) { send_err_msg_a.push('Falta '+skey+' (pode ser 0)'); form_check =0; }
						break;
	    		    case 'mz026':
						skey = 'Latitude';
						if( isNaN(val) ) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
	    		    case 'mz027':
						skey = 'Longitude';
						if( isNaN(val) ) { send_err_msg_a.push('Falta '+skey); form_check =0; }
						break;
				}
				data.push(key+'='+val);

				// special cases
				if ( mz003_n == 0 && mz003.length < 1 ) {
					send_err_msg_a.push('Falta a unidade de saúde'+skey);
					form_check =0;
				}
			});
			if (form_check == 0) {
				alert(send_err_msg_a.join('\n')+'\n\nCorrigir os erros acima.');
				$('#update_page').hide();
				$('#main_page').show();				
				return false;
			}
			var datastring = '?' + data.join('&');

// debug
/*
				data.push(key+'='+val);
			if ( ! window.confirm('send\n'+datastring) ) { 
				app.WriteFile(f_debug,data.join('\n'),"utf-8");
				return false; 
			}
*/

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
		function inject_checkboxdiv(file, tabname, divid, value) {
			if (typeof(value)==='undefined') value = '';
			var xml_string = app.ReadFile(file); // where tables are stored
			var xml = $.parseXML(xml_string);
			var tabs = $(xml).children();
			var result = '';
			var chk1 = '<input type="checkbox" id="';
			var chk2 = '" />  ----- ';
			var chk3 = '<br /><hr />\n';
			var chk4 = '<input type="checkbox" checked="checked" id="';
			var array_values = (value.length > 1)?value.split(','):[];
            tabs.each(function(){
				var rows = $(this).children();
	            rows.each(function(){
					if ( this.tagName == tabname ) {
						var row = $(this).children();
		            	row.each(function(){
							var id = $(this).find('id').text();
							var na = $(this).find('name').text();
							if (value == '') {
								result += chk1 + divid + '_' + id + chk2 + na + chk3; // unchecked
							} else {
								if (array_values.indexOf(id) != -1) {
									result += chk4 + divid + '_' + id + chk2 + na + chk3; // checked
								} else {
									result += chk1 + divid + '_' + id + chk2 + na + chk3; // unchecked
								}
							}
				     	}); // row.each
					} // if ( this.tagName == tabname )
		     	}); // rows.each
	        }); // tabs.each
 			$('#'+divid).html(result);
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
				$('.mz00673').show();
				rows.each(function(ind,ele){
					field = $(ele).find('id').text();
					value = $(ele).find('value').text();
					switch (field) {
						case 'mz003_n': // select unidade de saúde
							us2select(f_tables, 0, 0, '#mz003_n', value);
							break;
						case 'mz006': // select províncias
							prov2select(f_tables, '#mz006', value);
							break;
						case 'mz007_n': // select distritos
							dist2select(f_tables, 0, '#mz007_n', value);
							break;
						case 'mz012': // select
							inject_sel(fileTabsXml, 'unit_type', field, value);
							break;
						case 'mz013': // select
							inject_sel(fileTabsXml, 'unit_authority', field, value);
							break;
						case 'mz014': // select
							inject_sel(fileTabsXml, 'ministries', field, value);
							break;
						case 'mz015': // select
							inject_sel(fileTabsXml, 'unit_state', field, value);
							break;
						case 'mz023_c': // select
							inject_checkboxdiv(fileTabsXml, 'unit_service', field, value)
							break;
						case 'mz022': // select sim/não
							$('#'+field).find('option[value= "'+value+'"]').attr('selected',true);
							break;
						default: // text, number input
							$('#'+field).val(value);
					}
				});
			} else {
				prov2select(f_tables, '#mz006', 0);
				inject_sel(fileTabsXml, 'unit_type', 'mz012',1);
				inject_sel(fileTabsXml, 'unit_authority', 'mz013',1);
				inject_sel(fileTabsXml, 'ministries', 'mz014',1);
				inject_sel(fileTabsXml, 'unit_state', 'mz015',1);
				inject_checkboxdiv(fileTabsXml, 'unit_service', 'mz023_c')
			}
		}
		//------------------------------------------------
		function valid(mysql_date) {
			var date_splitted = mysql_date.split('-');
			ret = Date.parse(date_splitted[0],date_splitted[1],date_splitted[2]);
			if (isNaN(ret)) { return false; } else { return true; }
		}
		//------------------------------------------------
		function check_user_form(workdir) {
			var form_main_file = workdir + '/form_main.xml';
			var f_tables = workdir + '/tables.xml';
			var fileUser = workdir + '/user.xml';
			var is_f_tables = app.FileExists(f_tables);
			var is_fileUser = app.FileExists(fileUser);
			var user_form;
			var is_today_ok = compare_today_with_stored_date();
			if ( is_fileUser && is_today_ok ) { user_form = 2; }
			if ( is_fileUser && ( ! is_today_ok ) ) { user_form = 1; }
			if ( ! is_fileUser ) { user_form = 0; }
			return user_form;
		}
		//------------------------------------------------
		function prov2select(urltree, id_select, toselect) {
			var optv = '<option value="';
			var opte = '</option>';
			var opse = '" selected="selected">';
			var xml_string = app.ReadFile(urltree);
			var xml = $.parseXML(xml_string);
			var	provs = $(xml).find('prov');
			provs.each(function(ind,ele){
				var rid = $(ele).attr('id');
				var rna = $(ele).attr('name');
				if (parseInt(toselect) > 0 && parseInt(toselect) == parseInt(rid)) {
					$(id_select).append( optv + rid + opse + rna + opte );
				} else {
					$(id_select).append( optv + rid + '">' + rna + opte );
				}
			});
		}
		//------------------------------------------------
		function dist2select(urltree, id_prov, id_select, toselect) {
			var optv = '<option value="';
			var opte = '</option>';
			var opse = '" selected="selected">';
			var xml_string = app.ReadFile(urltree);
			var xml = $.parseXML(xml_string);
			if (parseInt(toselect) > 0) {
				var dist = $(xml).find('dist[id="'+toselect+'"]');
				var prov = dist.parent();
			} else {
				var	prov = $(xml).find('prov[id="'+id_prov+'"]');
			}
			var	dists = $(prov).children();
			dists.each(function(ind,ele){
				var rid = $(ele).attr('id');
				var rna = $(ele).attr('name');
				if (parseInt(toselect) > 0 && parseInt(toselect) == parseInt(rid)) {
					$(id_select).append( optv + rid + opse + rna + opte );
				} else {
					$(id_select).append( optv + rid + '">' + rna + opte );
				}
			});
		}
		//------------------------------------------------
		function us2select(urltree, id_prov, id_dist, id_select, toselect) {
			var optv = '<option value="';
			var opte = '</option>';
			var opse = '" selected="selected">';
			var xml_string = app.ReadFile(urltree);
			var xml = $.parseXML(xml_string);
			if (parseInt(toselect) > 0) {
				var	dist = $(xml).find('us[id="'+toselect+'"]').parent();
			} else {
				var	prov = $(xml).find('prov[id="'+id_prov+'"]');
				var	dist = $(prov).find('dist[id="'+id_dist+'"]');
			}
			var	uss = $(dist).children();
			uss.each(function(ind,ele){
				var rid = $(ele).attr('id');
				var rna = $(ele).attr('name');
				if (parseInt(toselect) > 0 && parseInt(toselect) == parseInt(rid)) {
					$(id_select).append( optv + rid + opse + rna + opte );
				} else {
					$(id_select).append( optv + rid + '">' + rna + opte );
				}
			});
			$(id_select).append( optv + '0">A unidade não está na lista' + opte );
		}
		//------------------------------------------------
		//------------------------------------------------
		//------------------------------------------------
		//------------------------------------------------
		//------------------------------------------------
	// end funcs -------------------------------------------------------------------------------------------------------


});














