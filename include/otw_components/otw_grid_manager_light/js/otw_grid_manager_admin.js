'use strict';

function otw_grid_manager_object( object_name, labels, templates ){
	
	this.object_name = object_name;
	
	this.container = jQuery( '#' + this.object_name + '_container' );
	
	this.code_container = jQuery( '#' + this.object_name + '_code' );
	
	this.preview_container = jQuery( '#' + this.object_name + '_preview' );
	
	this.add_columns_title = 'Add Column';
	
	this.add_column_action = 'otw_grid_manager_column_dialog';
	
	this.rows = new Array();
	
	this.grid_size = 24;
	
	this.number_names = new Array( 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twentyone', 'twentytwo', 'twentythree', 'twentyfour');
	
	this.labels = labels;
	
	this.selected_column = new Array();
	
	this.edit_column = -1;
	
	this.edit_row_column = -1;
	
	this.add_row_dropdown_menu = '';
	
	this.add_column_dropdown_menu = '';
	
	this.templates_dropdown_menu = '';
	
	this.templates = templates;
	
	this.row_column_nodes = null;
	
	this.row_error_message = false;
	
	this.column_sizes = new Array();
	this.column_sizes[ this.column_sizes.length ] = new Array( 1, 6 );
	this.column_sizes[ this.column_sizes.length ] = new Array( 1, 4 );
	this.column_sizes[ this.column_sizes.length ] = new Array( 1, 3 );
	this.column_sizes[ this.column_sizes.length ] = new Array( 1, 2 );
	this.column_sizes[ this.column_sizes.length ] = new Array( 2, 3 );
	this.column_sizes[ this.column_sizes.length ] = new Array( 3, 4 );
	this.column_sizes[ this.column_sizes.length ] = new Array( 5, 6 );
	this.column_sizes[ this.column_sizes.length ] = new Array( 1, 1 );
	
	this.init();
};
otw_grid_manager_object.prototype.init = function(){
	
	var oSelf = this;
	
	jQuery( '#' + this.object_name + '_info_button' ).on( 'click',  function( event ){
		
		oSelf.close_dropdowns();
		jQuery( '#' + oSelf.object_name + '_info_block' ).fadeToggle();
		event.preventDefault();
		event.stopPropagation();
	} );
	
	jQuery( '#' + this.object_name + '_add_row' ).on( 'click',  function( event ){
		
		oSelf.show_add_row_menu( this );
		event.preventDefault();
		event.stopPropagation();
	} );
	
	this.load_from_json( this.code_container.val() );
};

otw_grid_manager_object.prototype.load_from_json = function( json_code ){
	
	var row_id = 0;
	if( json_code.length ){
		
		var json_object = jQuery.parseJSON( json_code );
		
		for( var json_row in json_object ){
		
			row_id = this.add_row();
			
			var column_id = 0;
			
			if( typeof( json_object[ json_row ].columns ) == 'object' ){
				for( var cC = 0; cC < json_object[ json_row ].columns.length; cC++ ){
					column_id = this.add_column( row_id, json_object[ json_row ].columns[ cC ].rows, json_object[ json_row ].columns[ cC ].from_rows, json_object[ json_row ].columns[ cC ].mobile_rows, json_object[ json_row ].columns[ cC ].mobile_from_rows );
					
					for( var cS = 0; cS < json_object[ json_row ].columns[ cC ].shortcodes.length; cS++){
						this.rows[ row_id ].columns[ column_id ].add_shortcode( json_object[ json_row ].columns[ cC ].shortcodes[ cS ] );
					};
				};
			};
		};
	};
	this.preview();
};

otw_grid_manager_object.prototype.get_label = function( label ){

	if( this.labels[ label ] ){
		return this.labels[ label ];
	};
	
	return label;
};

otw_grid_manager_object.prototype.build_templates_menu_links = function(){

	this.templates_dropdown_menu.html( '' );
	
	var links = '<ul>';
	links = links + '<li><span>' + this.get_label( 'Save' ) + '</save></li>';
	links = links + '<li><a class="otw-grid-manager-templates-dropdown-action-save">' + this.get_label( 'Save current page as Template' ) + '</a></li>';
	links = links + '<li><div></div></li>';
	if( this.templates.length ){
		links = links + '<li><span>' + this.get_label( 'Quick Load Template' ) + '</save></li>';
		
		for( var cT = 0; cT < this.templates.length; cT++ ){
			links = links + '<li><a class="otw-grid-manager-templates-dropdown-action-load a_load" data-key="' + this.templates[cT][0] + '">' + this.templates[cT][1] + '</a><a class="otw-grid-manager-templates-dropdown-action-delete a_delete" data-key="' + this.templates[cT][0] + '"></a></li>';
		}
		
		links = links + '<li><div></div></li>';
	}
	links = links + '<li><a class="otw-grid-manager-templates-dropdown-action-close">' + this.get_label( 'Close' ) + '</a></li>';
	links = links + '</ul>';
	
	this.templates_dropdown_menu.html( links );
	
	this.init_template_dropdown_actions();
};

otw_grid_manager_object.prototype.close_dropdowns = function(){

	if( this.templates_dropdown_menu ){
		this.templates_dropdown_menu.hide();
	};
	
	if( typeof( otw_shortcode_component ) != 'undefined' ){
		if( otw_shortcode_component.dropdown_menu ){
			otw_shortcode_component.dropdown_menu.hide();
		};
	};
	
	if( this.add_row_dropdown_menu ){
		this.add_row_dropdown_menu.hide();
	};
	
	if( this.add_column_dropdown_menu ){
		this.add_column_dropdown_menu.hide();
	};
};

otw_grid_manager_object.prototype.show_add_row_menu = function( append_to ){
	
	this.add_row();
	this.preview();
	
	return;
};

otw_grid_manager_object.prototype.show_add_column_menu = function( append_to, row_id ){

	this.close_dropdowns();
	
	this.add_column_dropdown_menu = jQuery( '#' + this.object_name  + '_add_column_dropdown_menu' );
	
	this.add_column_dropdown_menu.html( '' );
	
	if( !this.add_column_dropdown_menu.size() ){
		this.add_column_dropdown_menu = jQuery( '<div id=\"' + this.object_name  + '_add_column_dropdown_menu\" class=\"otw_add_column_dropdown_menu\"></div>' );
	};
	
	var column_types = new Array();
	column_types[0]  = [ [1,1] ];
	column_types[1]  = [ [1,2], [1,2] ];
	column_types[2]  = [ [1,3], [2,3] ];
	column_types[3]  = [ [1,4], [3,4] ];
	column_types[4]  = [ [1,6], [5,6] ];
	
	var links = '<div class="otw_dropdown_menu_container otw_add_column_dropdown">';
	
	
	var has_any = false;
	var col_links = '';
	for( var cT = 0; cT < column_types.length; cT++ ){
		col_links = col_links + '<div class=\"otw-row otw-add-column-selector\">';
		
		has_any = true;
		for( var cTR = 0; cTR < column_types[ cT ].length; cTR++ ){
		
			col_links = col_links + '<div class="otw-'+ this.get_column_class( column_types[ cT ][ cTR ][0], column_types[ cT ][ cTR ][1] ) +' otw-columns">';
			
			if( this.valid_column_numbers( row_id, [ column_types[ cT ][cTR] ], [] ) ){
			
				col_links = col_links + '<span class=\"active\" data-column="' + this.get_label( column_types[ cT ][ cTR ][0] + '_' + column_types[ cT ][ cTR ][1] ) + '">' + this.get_label( column_types[ cT ][ cTR ][0] + '/' + column_types[ cT ][ cTR ][1] ) + '</span>';
			}else{
				col_links = col_links + '<span>&nbsp;</span>';
			}
			
			col_links = col_links + '</div>';
		};
		col_links = col_links + '</div>';
	};
	if(  has_any ){
		links = links + col_links;
		links = links + '<div class="otw_dropdown_line"></div>';
	};
	links = links + '<div class="otw_dropdown_button"><a class="otw-grid-manager-add_column-dropdown-action-close">' + this.get_label( 'Close' ) + '</a></div>';
	links = links + '</div>';
	
	this.add_column_dropdown_menu.html( links );
	
	this.init_add_column_dropdown_actions();
	
	var oSelf = this;
	
	jQuery( document ).on( 'click',  function(){
		if( oSelf.add_column_dropdown_menu.css( 'display' ) == 'block' ){
			oSelf.add_column_dropdown_menu.hide( );
		};
	});
	
	var link = jQuery( append_to );
	
	this.add_column_dropdown_menu.insertAfter( link );
	link.parents( 'td' ).css( 'position', 'relative' );
	
	var link_height = link.outerHeight();
	var link_left   = parseInt( link.css( 'marginLeft' ) ) + link.position().left - this.add_column_dropdown_menu.width();
	
	var dropdown_bottom_postion =  jQuery( '#' + this.object_name ).position().top + link.position().top + link_height + 50 + this.add_column_dropdown_menu.height();
	
	if( dropdown_bottom_postion > jQuery(document).height() ){
		
		this.add_column_dropdown_menu.css("top", link.position().top - this.add_column_dropdown_menu.height() );
		
	}else{
		this.add_column_dropdown_menu.css("top", link.position().top + link_height );
	}
	
	var dd_width = 300;
	var dropdown_right_postion = link_left + 1 + dd_width + 20;
	
	if( ( dropdown_right_postion + 20 ) > jQuery(document).width() ){
		this.add_column_dropdown_menu.css("left", link_left - dd_width + 10 );
	}else{
		this.add_column_dropdown_menu.css("left", link_left + 1 );
	}
	this.add_column_dropdown_menu.attr( 'data-row-id', row_id );
	
	this.add_column_dropdown_menu.slideDown(100);
	this.add_column_dropdown_menu.show();
};


otw_grid_manager_object.prototype.init_add_row_dropdown_actions = function(){
	
	var oSelf = this;
	
	this.add_row_dropdown_menu.find( 'div.otw-add-row-selector' ).on( 'click',  function( event ){
		
		var all_links = jQuery( this ).find( 'span' );
			
		if( all_links.size() ){
			
			var row_id = oSelf.add_row();
			
			for( var cL = 0; cL < all_links.length; cL++ ){
				var data_column = jQuery( all_links[cL] ).attr( 'data-column' );
				
				var column_rows = false;
				
				if( column_rows = data_column.match( /^([0-9]+)\_([0-9]+)$/ ) ){
					oSelf.add_column( row_id, column_rows[1], column_rows[2], 0, 0 );
				};
			};
			
		};
		oSelf.add_row_dropdown_menu.hide();
		oSelf.preview();
	});
	
	this.add_row_dropdown_menu.find( 'a' ).on( 'click',  function( event ){
	
		var class_name = jQuery( this ).attr( 'class' );
		
		if( class_name ){
			
			var matches = false;
			if( matches = jQuery( this ).attr( 'class' ).match( /otw\-grid\-manager\-add_row\-dropdown\-action\-([a-z\_\-]+)/ ) ){
				
				switch( matches[1] ){
				
					case 'close':
							oSelf.add_row_dropdown_menu.hide();
						break;
					case 'add':
							oSelf.add_row();
							oSelf.add_row_dropdown_menu.hide();
							oSelf.preview();
						break;
					case 'insert':
							
							
							var all_links = jQuery( this ).find( 'span' );
							
							if( all_links.size() ){
								
								var row_id = oSelf.add_row();
								
								for( var cL = 0; cL < all_links.length; cL++ ){
									var data_column = jQuery( all_links[cL] ).attr( 'data-column' );
									
									var column_rows = false;
									
									if( column_rows = data_column.match( /^([0-9]+)\_([0-9]+)$/ ) ){
										oSelf.add_column( row_id, column_rows[1], column_rows[2], 0, 0 );
									};
								};
								
							};
							oSelf.add_row_dropdown_menu.hide();
							oSelf.preview();
						break;
				};
				event.preventDefault();
				event.stopPropagation();
			};
			
		};
	});
};

otw_grid_manager_object.prototype.init_add_column_dropdown_actions = function(){
	
	var oSelf = this;
	
	this.add_column_dropdown_menu.find( 'div.otw-add-column-selector span' ).on( 'click',  function( event ){
		
		var row_id = oSelf.add_column_dropdown_menu.attr( 'data-row-id' );
		
		var data_column = jQuery( this ).attr( 'data-column' );
		
		if( data_column ){
			var column_rows = false;
			
			if( column_rows = data_column.match( /^([0-9]+)\_([0-9]+)$/ ) ){
				oSelf.add_column( row_id, column_rows[1], column_rows[2], 0, 0 );
				oSelf.add_column_dropdown_menu.hide();
				oSelf.preview();
			};
		}
		event.preventDefault();
		event.stopPropagation();
	});
	
	this.add_column_dropdown_menu.find( 'a' ).on( 'click',  function( event ){
	
		var class_name = jQuery( this ).attr( 'class' );
		
		if( class_name ){
			
			var matches = false;
			if( matches = jQuery( this ).attr( 'class' ).match( /otw\-grid\-manager\-add_column\-dropdown\-action\-([a-z\_\-]+)/ ) ){
				
				switch( matches[1] ){
				
					case 'close':
							oSelf.add_column_dropdown_menu.hide();
						break;
					case 'add':
							oSelf.close_dropdowns();
							jQuery.get( 'admin-ajax.php?action='+ oSelf.add_column_action ,function(b){
								
								jQuery( "#otw-dialog").remove();
								var cont = jQuery( '<div id="otw-dialog">' + b + '</div>' );
								jQuery( "body").append( cont );
								jQuery( "#otw-dialog").hide();
								
								tb_position = function(){
									var isIE6 = typeof document.body.style.maxHeight === "undefined";
									
									var b=jQuery(window).height();
									jQuery("#TB_window").css({marginLeft: '-' + parseInt((TB_WIDTH / 2),10) + 'px', width: TB_WIDTH + 'px'});
									if ( ! isIE6 ) { // take away IE6
										jQuery("#TB_window").css({marginTop: '-' + parseInt((TB_HEIGHT / 2),10) + 'px'});
									}
									
								}
								oSelf.init_column_dialog( -1 );
								var f=jQuery(window).width();
								b=jQuery(window).height();
								f=920<f?920:f;
								f-=80;
								b=760<b?760:b;
								b-=110; 
								
								tb_show( oSelf.add_columns_title, "#TB_inline?width="+f+"&height="+b+"&inlineId=otw-dialog" );
							});
						break;
					case 'insert':
							var data_column = jQuery( this ).attr( 'data-column' );
							var row_id = oSelf.add_column_dropdown_menu.attr( 'data-row-id' );
							var insert_columns = data_column.split( '-' );
							
							for( var cI = 0; cI < insert_columns.length; cI++){
								
								var column_rows = false;
								
								if( column_rows = insert_columns[ cI ].match( /^([0-9]+)\_([0-9]+)$/ ) ){
									var new_columns_id = oSelf.add_column( row_id, column_rows[1], column_rows[2], 0, 0 );
									
									if( new_columns_id > -1 ){
										oSelf.add_column_dropdown_menu.hide();
										oSelf.preview();
									}else{
										break;
									};
								};
								
							};
							
						break;
				};
				event.preventDefault();
				event.stopPropagation();
			};
			
		};
	});
};

otw_grid_manager_object.prototype.init_template_dropdown_actions = function(){
	
	var oSelf = this;
		
	this.templates_dropdown_menu.find( 'a' ).on( 'click',  function( event ){
		
		var class_name = jQuery( this ).attr( 'class' );
		
		if( class_name ){
			
			var matches = false;
			if( matches = jQuery( this ).attr( 'class' ).match( /otw\-grid\-manager\-templates\-dropdown\-action\-([a-z]+)/ ) ){
			
				switch( matches[1] ){
				
					case 'close':
							oSelf.templates_dropdown_menu.hide();
						break;
					case 'save':
							var template_name = prompt( oSelf.get_label( 'Please type template name' ) );
							
							if( template_name ){
								
								jQuery.post( 'admin-ajax.php?action=otw_grid_manager_save_template' , { 'template_code': oSelf.code_container.val(), 'template_name': template_name, 'grid_manager': oSelf.object_name },function( result ){
									
									if( result && result != -1 ){
										oSelf.templates = jQuery.parseJSON( result );
										oSelf.build_templates_menu_links();
									}else{
										oSelf.templates_dropdown_menu.hide();
									};
								});
							};
						break;
					case 'delete':
							var key = jQuery( this ).attr( 'data-key' );
							if( key.match( /([0-9]+)/ ) && confirm( oSelf.get_label( 'Please confirm to delete this template' ) ) ){
								
								jQuery.post( 'admin-ajax.php?action=otw_grid_manager_delete_template' , { 'template_key': key, 'grid_manager': oSelf.object_name },function( result ){
									if( result && result != -1 ){
										oSelf.templates = jQuery.parseJSON( result );
										oSelf.build_templates_menu_links();
									}else{
										oSelf.templates_dropdown_menu.hide();
									};
								});
							};
						break;
					case 'load':
							var key = jQuery( this ).attr( 'data-key' );
							
							if( key.match( /([0-9]+)/ ) ){
								jQuery.post( 'admin-ajax.php?action=otw_grid_manager_load_template' , { 'template_key': key, 'grid_manager': oSelf.object_name },function( result ){
									
									if( result && result != -1 ){
										oSelf.load_from_json( result );
										oSelf.templates_dropdown_menu.hide();
									}else{
										oSelf.templates_dropdown_menu.hide();
									};
								});
							}
						break;
				};
			};
		};
		event.preventDefault();
		event.stopPropagation();
	});
};

otw_grid_manager_object.prototype.set_code = function(){
	
	var code = JSON.stringify( this.rows );
	
	this.code_container.val( code );
};

otw_grid_manager_object.prototype.preview = function(){
	
	this.set_code();
	
	var html = '';
	
	for( var cR = 0; cR < this.rows.length; cR++ ){
	
		html = html + '<div class="otw-grid-manager-row otw-row otw-row-n' + cR + '">';
			html = html + '<div class="otw-row-content">';
				html = html + '<div class="otw-row-controls">';
					html = html + '<table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"><tr>';
					html = html + '<td width=\"100%\"><div class="otw-row-control-move"><span>' + this.get_label( 'Content Row' ) + '</span></div></td>';
					html = html + '<td><a href="javascript:;" class=\"otw-row-control-add\" title="' + this.get_label( 'Add' ) + '" ></a></td>';
					html = html + '<td><a href="javascript:;" class=\"otw-row-control-delete\" title="' + this.get_label( 'Delete' ) + '"></a></td>';
					html = html + '</tr></table>';
				html = html + '</div>';
				/* check if row is full with coluns*/
				var is_full = '';
				if( this.rows[ cR ].columns.length ){
					
					if( !this.valid_column_numbers( cR, [ [ 1, 6 ] ], [] ) ){
						is_full = ' otw-full-row';
					};
				};
				var data_columns = 0;
				if( this.rows[ cR ].columns.length ){
					for( var cC = 0; cC < this.rows[ cR ].columns.length; cC++ ){
						data_columns = data_columns + ( ( this.grid_size / this.rows[cR].columns[ cC ].from_rows ) * this.rows[cR].columns[cC].rows );
					};
				};
				
				html = html + '<div class="otw-row-columns otw-row-columns-r' + cR + is_full + '" data-columns="' + data_columns + '">';
				if( this.rows[ cR ].columns.length ){
				
					for( var cC = 0; cC < this.rows[ cR ].columns.length; cC++ ){
						
						var column_class = this.get_column_class( this.rows[ cR ].columns[ cC ].rows, this.rows[cR].columns[cC].from_rows );
						var is_last = '';
						if( cC == ( this.rows[ cR ].columns.length - 1 )   ){
							is_last = ' end';
						};
						var c_type = 'big';
						
						html = html + '<div class="otw-' + column_class + ' otw-columns otw-column-r'+ cR +'-n' + cC + is_last + '" data-columns="' + ( ( this.grid_size / this.rows[cR].columns[ cC ].from_rows ) * this.rows[cR].columns[cC].rows ) + '" >';
							html = html + '<div class="otw-column-content otw-' + c_type + '-column">';
							
								html = html + '<div class="otw-column-controls">';
								
								html = html + '<div class="otw-column-control-move">';
								html = html + '<span>' + this.rows[cR].columns[ cC ].rows + '/' +  this.rows[cR].columns[cC].from_rows + '</span>';
								
								html = html + '<div class="otw-column-controls-rightalign">';
								html = html + '<a href="javascript:;" class=\"otw-column-control-add\" title="' + this.get_label( 'Add' ) + '"></a>';
								html = html + '<a href="javascript:;" class=\"otw-column-control-delete\" title="' + this.get_label( 'Delete' ) + '"></a>';
								html = html + '</div>';
                html = html + '</div>';
								
								html = html + '</div>';
								html = html + '<div class="otw-column-shortcodes otw-column-type-'+ c_type +' otw-column-shortocode-r' + cR +'-n' + cC + '">';
								if( this.rows[cR].columns[cC].shortcodes.length ){
									for( var cS = 0; cS < this.rows[cR].columns[cC].shortcodes.length; cS++ ){
										html = html + this.rows[cR].columns[cC].shortcodes[ cS ].html_code( this.object_name, cR, cC, cS, this, this.rows[cR].columns[cC].shortcodes.length );
									};
								}else{
									html = html + '<div class=\"otw-column-noshortcode\"><a href=\"javascript:;\" class="otw-column-control-add">'+ this.get_label( 'Add item' ) +'</a></div>';
								};
								html = html + '</div>';
							html = html + '</div>';
						html = html + '</div>';
					};
				}else{
					html = html + '<div class=\"otw-row-nocolumn\"><a href=\"javascript:;\" class="otw-row-control-add">'+ this.get_label( 'Add column' ) +'</a></div>';
				}
				html = html + '</div>';
			html = html + '</div>';
		html = html + '</div>';
	};
	
	this.preview_container.html( html );
	
	var oSelf = this;
	
	this.preview_container.find( '.end' ).each( function(){
		
		var elem = jQuery( this );
		var columns = elem.attr( 'data-columns' );
		
		var percent = Math.round( ( columns / oSelf.grid_size ) * 100 );
		this.style.width = ( percent - 1 ) + '%';
	} );
	
	this.inline_preview();
	
	this.init_controls();
	
	this.row_column_nodes = this.preview_container.find( 'div.otw-row-columns' );
};
otw_grid_manager_object.prototype.inline_preview = function(){
	
};
otw_grid_manager_object.prototype.init_controls = function(){
	
	var oSelf = this;
	
	this.preview_container.find( 'a.otw-row-control-add' ).on( 'click',  function( event ){
		
		oSelf.close_dropdowns();
		
		var row_id = oSelf.get_row_number_from_controls( this );
			
		if( row_id > -1 ){
			if( oSelf.valid_column_numbers( row_id, [ [1, 6] ], [] ) ){
				oSelf.show_add_column_menu( this, row_id );
				event.preventDefault();
				event.stopPropagation();
			}else{
				oSelf.row_error( row_id, oSelf.get_label( 'The row is already full.' ) );
			}
		};
	} );
	
	this.preview_container.find( 'a.otw-row-control-delete' ).on( 'click',  function(){
		
		oSelf.close_dropdowns();
		
		if( confirm( oSelf.get_label( 'Please confirm to remove the row' ) ) ){
			
			var row_id = oSelf.get_row_number_from_controls( this );
			
			if( row_id > -1 ){
				oSelf.remove_row( row_id )
			}
		};
	} );
	
	this.preview_container.find( 'a.otw-column-control-add' ).on( 'click',  function( event ){
		
		oSelf.close_dropdowns();
		
		if( typeof( otw_shortcode_component ) != 'object' ){
			alert( 'Error: Please include OTW Shortcode component' );
		}else{
			var row_id = oSelf.get_row_number_from_controls( this );
			var column_id = oSelf.get_column_number_from_controls( this );
			
			oSelf.close_dropdowns();
			
			otw_shortcode_component.open_drowpdown_menu( this );
			
			otw_shortcode_component.insert_code = function( shortcode_object ){
				
				oSelf.rows[ row_id ].columns[ column_id ].add_shortcode( shortcode_object );
				tb_remove();
				oSelf.preview();
			};
		};
		event.preventDefault();
		event.stopPropagation();
	} );
	
	this.preview_container.find( 'a.otw-column-control-delete' ).on( 'click',  function(){
		
		oSelf.close_dropdowns();
		
		if( confirm( oSelf.get_label( 'Please confirm to remove the column' ) ) ){
			
			var row_id = oSelf.get_row_number_from_controls( this );
			
			var column_id = oSelf.get_column_number_from_controls( this );
			
			if( ( row_id > -1 ) && ( column_id > -1 ) ){
				oSelf.remove_column( row_id, column_id )
			}
		};
	} );
	
	this.preview_container.find( 'a.otw-shortcode-control-delete' ).on( 'click',  function(){
		
		oSelf.close_dropdowns();
		
		if( confirm( oSelf.get_label( 'Please confirm to remove the shortcode' ) ) ){
			
			var row_id = oSelf.get_row_number_from_controls( this );
			var column_id = oSelf.get_column_number_from_controls( this );
			var shortcode_id = oSelf.get_shortcode_number_from_controls( this );
			
			if( ( row_id > -1 ) && ( column_id > -1 ) && ( shortcode_id > -1 ) ){
				oSelf.remove_shortcode( row_id, column_id, shortcode_id );
			}
		};
	} );
	
};
otw_grid_manager_object.prototype.is_target_row_full = function( target_child, item ){
	
	var full_row = target_child.parents( 'div.otw-full-row' );
	
	if( full_row.size() ){
		return true;
	};
	
	var current_columns = Number( target_child.parents( '.otw-row-columns' ).attr( 'data-columns' ) );
	var new_columns = Number( item.attr( 'data-columns' ) );
	
	if( ( current_columns + new_columns ) > this.grid_size ){
		return true;
	}
	
	return false;
};
otw_grid_manager_object.prototype.order_rows = function(){
	
	var rows_order = new Array();
	
	var h_rows = this.preview_container.find( 'div.otw-grid-manager-row' );
	
	for( var hR = 0; hR < h_rows.length; hR++ ){
		
		var matches = false;
		if( matches = jQuery( h_rows[ hR ] ).attr( 'class' ).match( /otw\-row\-n([0-9]+)/ ) ){
			rows_order[ hR ] = matches[1];
		};
	};
	
	var tmp_rows = this.rows;
	
	this.rows = new Array();
	
	for( var cR = 0; cR < rows_order.length; cR++ ){
		
		this.rows[ cR ] = tmp_rows[ rows_order[cR] ];
	};
	
	this.preview();
};
otw_grid_manager_object.prototype.order_columns = function( column_order ){
	
	var all_columns = {};
	
	for( var cR = 0; cR < this.rows.length; cR++ ){
		
		for( var cC = 0; cC < this.rows[cR].columns.length; cC++ ){
			
			all_columns[ cR + '_' + cC] = this.rows[cR].columns[ cC ];
		};
	};
	
	//need to check if all are valid number of columns
	for( var cR = 0; cR < this.rows.length; cR++ ){
	
		var html_columns = this.preview_container.find( 'div.otw-row-columns-r' + cR + ' div.otw-columns');
		
		var row_columns = new Array();
		
		for( var cS = 0; cS < html_columns.length; cS ++){
		
			var matches = false;
			if( matches = jQuery( html_columns[cS] ).attr('class').match( /otw-column-r([0-9]+)-n([0-9]+)/ ) ){
			
				row_columns[ row_columns.length ] = new Array( all_columns[ matches[1] + '_' +  matches[2] ].rows, all_columns[ matches[1] + '_' +  matches[2] ].from_rows );
			};
		};
		
		if( !this.valid_column_numbers( -1, row_columns ) ){
			
			var valid_string = this.get_label( 'Row with columns' );
			
			for( var cV = 0; cV < row_columns.length; cV++ ){
				
				valid_string = valid_string + ' ' + row_columns[ cV ][0] + '/' + row_columns[ cV ][1]
			};
			valid_string = valid_string + this.get_label( ' is not valid' );
			
			this.preview();
			this.row_error( cR, 'The row is already full.' );
			return;
		}
	};
	
	for( var cR = 0; cR < this.rows.length; cR++ ){
		
		this.rows[cR].columns = new Array();
		
		var html_columns = this.preview_container.find( 'div.otw-row-columns-r' + cR + ' div.otw-columns');
		
		for( var cS = 0; cS < html_columns.length; cS ++){
			
			var matches = false;
			if( matches = jQuery( html_columns[cS] ).attr('class').match( /otw-column-r([0-9]+)-n([0-9]+)/ ) ){
				
				this.rows[ cR ].columns[ this.rows[ cR ].columns.length ] = all_columns[ matches[1] + '_' +  matches[2] ];
			};
		};
	};
	this.preview();
};
otw_grid_manager_object.prototype.order_shortcodes = function( column_order ){
	
	var all_shortcodes = {};
	for( var cR = 0; cR < this.rows.length; cR++ ){
		
		for( var cC = 0; cC < this.rows[cR].columns.length; cC++ ){
			
			for( var cS = 0; cS < this.rows[cR].columns[cC].shortcodes.length; cS++ ){
				
				all_shortcodes[ cR + '_' + cC + '_' + cS ] = this.rows[cR].columns[cC].shortcodes[ cS ];
			};
		};
	};
	for( var cR = 0; cR < this.rows.length; cR++ ){
	
		for( var cC = 0; cC < this.rows[cR].columns.length; cC++ ){
		
			var html_shortcodes = this.preview_container.find( 'div.otw-column-shortocode-r' + cR + '-n' + cC +' div.otw-column-shortcode');
			
			this.rows[ cR ].columns[ cC ].shortcodes = new Array();
			
			for( var cS = 0; cS < html_shortcodes.length; cS ++){
			
				var matches = false;
				
				if( matches = jQuery( html_shortcodes[cS] ).attr('class').match( /otw-column-shortcode\-r([0-9]+)\-n([0-9]+)\-s([0-9]+)/ ) ){
				
					this.rows[cR].columns[ cC ].add_shortcode( all_shortcodes[ matches[1] + '_' +  matches[2] + '_' +  matches[3] ] );
				};
			};
		};
		
	};
	
	this.preview();
};

otw_grid_manager_object.prototype.remove_shortcode = function( row_id, column_id, shortcode_id ){

	var tmp_shortcodes = this.rows[ row_id ].columns[ column_id ].shortcodes;
	
	this.rows[ row_id ].columns[ column_id ].shortcodes = new Array();
	
	for( var cR = 0; cR < tmp_shortcodes.length; cR++ ){
	
		if( cR != shortcode_id ){
			this.rows[ row_id ].columns[ column_id ].shortcodes[ this.rows[ row_id ].columns[ column_id ].shortcodes.length ] = tmp_shortcodes[ cR ];
		};
	};
	
	this.preview();

};
otw_grid_manager_object.prototype.remove_row = function( row_id ){
	
	var tmp_rows = this.rows;
	
	this.rows = new Array();
	
	for( var cR = 0; cR < tmp_rows.length; cR++ ){
	
		if( cR != row_id ){
			this.rows[ this.rows.length ] = tmp_rows[ cR ];
		};
	};
	
	this.preview();
};
otw_grid_manager_object.prototype.remove_column = function( row_id, column_id ){
	
	var tmp_columns = this.rows[ row_id ].columns;
	
	this.rows[ row_id ].columns = new Array();
	
	for( var cR = 0; cR < tmp_columns.length; cR++ ){
	
		if( cR != column_id ){
			this.rows[ row_id ].columns[ this.rows[ row_id ].columns.length ] = tmp_columns[ cR ];
		};
	};
	
	this.preview();
};
otw_grid_manager_object.prototype.get_shortcode_number_from_controls = function( control ){
	
	var parentClass = jQuery( control ).parents( 'div.otw-column-shortcode').attr( 'class' );
	return this.get_shortcode_number_from_class( parentClass );
};
otw_grid_manager_object.prototype.get_column_number_from_controls = function( control ){
	
	var parentClass = jQuery( control ).parents( 'div.otw-columns').attr( 'class' );
	return this.get_column_number_from_class( parentClass );

};
otw_grid_manager_object.prototype.get_row_number_from_controls = function( control ){
	
	var parentClass = jQuery( control ).parents( 'div.otw-grid-manager-row').attr( 'class' );
	return this.get_row_number_from_class( parentClass );

};
otw_grid_manager_object.prototype.get_row_number_from_class = function( objectClass ){
	
	var matches = false;
	if( matches = objectClass.match( /otw\-row\-n([0-9]+)/ ) ){
		return Number( matches[1] );
	}

	return -1;
};
otw_grid_manager_object.prototype.get_column_number_from_class = function( objectClass ){
	
	var matches = false;
	if( matches = objectClass.match( /otw\-column\-r([0-9]+)\-n([0-9]+)/ ) ){
		return Number( matches[2] );
	}
	
	return -1;
};
otw_grid_manager_object.prototype.get_shortcode_number_from_class = function( objectClass ){
	
	var matches = false;
	if( matches = objectClass.match( /otw\-column\-shortcode\-r([0-9]+)\-n([0-9]+)\-s([0-9]+)/ ) ){
		return Number( matches[3] );
	}
	
	return -1;
};
otw_grid_manager_object.prototype.get_column_class = function( rows, from_rows ){
	
	var class_number = ( this.grid_size / from_rows ) * rows;
	
	return this.number_names[ class_number ];
};

otw_grid_manager_object.prototype.add_row = function( rows, from_rows, mobile_rows, mobile_from_rows ){

	var row_id = this.rows.length;
	
	this.rows[ row_id ] = new otw_grid_manager_row();
	
	return row_id;
};

otw_grid_manager_object.prototype.row_columns_number = function( row_id, ignore_columns ){
	
	var total_columns = 0;
	
	if( this.rows[ row_id ] ){
	
		for( var cC = 0; cC < this.rows[ row_id ].columns.length; cC++ ){
			
			var ignore_column = false;
			
			for( var cI = 0; cI < ignore_columns.length; cI++ ){
				
				if( cC == ignore_columns[ cI ] ){
					ignore_column = true;
					break;
				};
			};
			
			if( !ignore_column ){
				total_columns = total_columns + ( ( this.grid_size / this.rows[ row_id ].columns[ cC ].from_rows ) * this.rows[ row_id ].columns[ cC ].rows );
			};
		};
	};
	
	return total_columns;
};

otw_grid_manager_object.prototype.valid_column_numbers = function( row_id, new_columns, ignore_columns ){
	
	
	var current_columns_number = 0;
	
	if( row_id > -1 ){
		current_columns_number = this.row_columns_number( row_id, ignore_columns );
	};
	
	for( var cC = 0; cC < new_columns.length; cC++ ){
		current_columns_number = current_columns_number + ( ( this.grid_size / new_columns[cC][1] ) * new_columns[cC][0] );
	};
	
	if( this.grid_size < current_columns_number )
	{
		return false;
	};
	
	return true;
};

otw_grid_manager_object.prototype.row_error = function( row_id, error_string ){
	
	var oSelf = this;
	
	var row = oSelf.preview_container.find( '.otw-row-n' + row_id );
	
	row.addClass( 'otw-row-error' );
	
	if( !this.row_error_message ){
		
		this.row_error_message = jQuery( '<div id="otw-row-error-message"><div class="otw-row-error-head"><a>x</a></div><div class="otw-row-error-text">' + error_string + '</div></div>' );
		this.row_error_message.appendTo( jQuery( 'body' ) );
		this.row_error_message.find( '.otw-row-error-head a' ).on( 'click',  function(){
			oSelf.row_error_message.fadeOut();
		});
	}else{
		this.row_error_message.find( '.otw-row-error-text' ).html( error_string );
		
		try{
			clearTimeout( window.rowermsgtime );
		}catch( e ){};
	}
	
	this.row_error_message.show();
	
	this.row_error_message.css( 'top', ( row.offset().top + ( row.height() / 2 ) ) - ( this.row_error_message.height() / 2 ) );
	this.row_error_message.css( 'left', ( row.offset().left +  ( row.width() / 2 ) ) - ( this.row_error_message.width() / 2 ) );
	
	setTimeout( function(){
		row.removeClass( 'otw-row-error' );
	}, 2000 );
	
	window.rowermsgtime = setTimeout( function(){
		oSelf.row_error_message.fadeOut();
	}, 2000 );
};

otw_grid_manager_object.prototype.add_column = function( row_id, rows, from_rows, mobile_rows, mobile_from_rows ){
	
	if( this.rows[ row_id ] )
	{
		if( this.valid_column_numbers( row_id, [ [ rows, from_rows ] ], [] ) ){
			
			var column_id = this.rows[ row_id ].columns.length;
			
			this.rows[ row_id ].columns[ column_id ] = new otw_grid_manager_column( rows, from_rows, mobile_rows, mobile_from_rows );
			
			return column_id;
		}else{
			alert( this.get_label( 'Can not add column ' ) + rows + '/' + from_rows  );
		}
	};
	
	return -1;
};

function otw_grid_manager_row(){

	this.columns = new Array();
};

function otw_grid_manager_column( rows, from_rows, mobile_rows, mobile_from_rows ){
	
	this.rows = Number( rows );
	
	this.from_rows = Number( from_rows );
	
	this.mobile_rows = Number( mobile_rows );
	
	this.mobile_from_rows = Number( mobile_from_rows );
	
	this.shortcodes = new Array();
};
otw_grid_manager_column.prototype.add_shortcode = function( code ){
	
	this.shortcodes[ this.shortcodes.length ] = new otw_grid_manager_shortcode( code );
};

function otw_grid_manager_shortcode( settings ){
	
	for( var setting in settings ){
	
		this[ setting ] = settings[ setting ]
	}
}
otw_grid_manager_shortcode.prototype.html_code = function( scode_object_name, row_id, column_id, shortcode_id, parent, total_shortcodes ){
	
	var matches = false;
	var post_id = 0;
	if( matches = location.href.match( /post\=([0-9]+)/ ) ){
		post_id = matches[1];
	}
	
	var last_class = '';
	
	if( total_shortcodes  == ( shortcode_id + 1 ) ){
		last_class = ' otw-last-shortcode';
	};
	
	var html = '';
	html = html + '<div class="otw-column-shortcode otw-column-shortcode-r' + row_id + '-n' + column_id + '-s' + shortcode_id + last_class + '">';
			html = html + '<div class="otw-column-shortcode-content">';
				html = html + '<div class="otw-shortcode-controls">';
				
					//show title
					if( typeof( otw_shortcode_component.shortcodes[ this.shortcode_type ] ) != 'undefined' ){
						if( typeof( this.iname ) != 'undefined' ){
							html = html + '<div class="otw-shortcode-control-move"><span>' + otw_shortcode_component.shortcodes[ this.shortcode_type ].title  + ' - ' + this.iname + '</span>';
						}else{
							html = html + '<div class="otw-shortcode-control-move"><span>' + otw_shortcode_component.shortcodes[ this.shortcode_type ].title + '</span>';
						}
					}
					html = html + '<div class=\"otw-column-controls-rightalign\">';
					html = html + '<a href="javascript:;" class=\"otw-shortcode-control-delete\" title="' + parent.get_label( 'Delete' ) + '"></a></div>';
				html = html + '</div>';
	html = html + '</div>';
				html = html + '<div class="otw-shortcode-preview">';
				
				var post_data = {};
				for( var s_item in this ){
					
					if( typeof( this[ s_item ] ) != 'function' ){
						post_data[ s_item ] = this[ s_item ];
					};
				};
				
				var frame_id = 'otw-shortcode-preview_' + scode_object_name + '_' + row_id + '_' + column_id + '_' + shortcode_id;
				
				html = html + '<iframe width="100%" src="about:blank" scrolling="no" height="70" id="' + frame_id + '" style="height: 70px;"></iframe>';
				
				html = html + '</div>';
			html = html + '</div>';
	html = html + '</div>';
	return html;
};

otw_grid_manager_object.prototype.init_column_dialog = function( row_id, column_id ){
	
	otw_form_init_fields();
	
	if( column_id > -1 ){
		this.edit_row_column = row_id;
		this.edit_column = column_id;
		this.selected_column = [ this.rows[ row_id ].columns[ column_id ].rows,  this.rows[ row_id ].columns[ column_id ].from_rows ];
		
		if( this.rows[ row_id ].columns[ column_id ].mobile_rows > 0 && this.rows[ row_id ].columns[ column_id ].mobile_from_rows > 0 ){
			jQuery( '#otw_mobile_column_size' ).val( this.rows[ row_id ].columns[ column_id ].mobile_rows + '_' + this.rows[ row_id ].columns[ column_id ].mobile_from_rows );
			jQuery( '#otw_mobile_column_size' ).change();
		}
		
	}else{
		this.selected_column = new Array();
		this.edit_row_column = -1;
		this.edit_column = -1;
	}
	this.column_dialog_mark_selected();
	
	this.init_add_column_dialog_buttons();
	
	this.init_add_column_dialog_columns();
	
};
otw_grid_manager_object.prototype.column_dialog_mark_selected = function(){
	jQuery( '.otw_grid_manager_column_dlg_row .otw-columns' ).removeClass( 'otw-selected-column' );
	
	if( this.selected_column.length == 2 ){
		jQuery( '.otw_grid_manager_column_dlg_row .otw-column-' + this.selected_column[0] + '_' + this.selected_column[1] ).parent().addClass('otw-selected-column' );
	};
};
otw_grid_manager_object.prototype.init_add_column_dialog_buttons = function(){
	
	var oSelf = this;
	
	jQuery( '#adv_settings_mobile_container > .otw_mobile' ).on( 'click',  function(){
	
		var content = jQuery( '#adv_settings_mobile_content' );
		
		if( content.css( 'display' ) == 'none' ){
			content.fadeIn();
			jQuery( this ).addClass( 'adv_opened' );
			var matches = false;
			var img_src = jQuery( this ).find( 'img' ).attr( 'src' );
			if( matches = img_src.match( /gm\-advanced\-(up|down)\-arrow\.png/ ) ){
				jQuery( this ).find( 'img' ).attr( 'src', img_src.replace( 'gm-advanced-' + matches[1] + '-arrow.png', 'gm-advanced-up-arrow.png' ) );
			};
		}else{
			content.fadeOut();
			jQuery( this ).removeClass( 'adv_opened' );
			var matches = false;
			var img_src = jQuery( this ).find( 'img' ).attr( 'src' );
			if( matches = img_src.match( /gm\-advanced\-(up|down)\-arrow\.png/ ) ){
				jQuery( this ).find( 'img' ).attr( 'src', img_src.replace( 'gm-advanced-' + matches[1] + '-arrow.png', 'gm-advanced-down-arrow.png' ) );
			};
		};
	});
	jQuery( '#otw-shortcode-btn-cancel' ).on( 'click',  function(){
		tb_remove();
	});
	jQuery( '#otw-shortcode-btn-save' ).on( 'click',  function(){
		
		//get the mobile size;
		var mobile_size = new Array( 0 , 0 );
		var matches = '';
		if( matches = jQuery( '#otw_mobile_column_size' ).val().match( /^([0-9])\_([0-9])$/ ) ){
			mobile_size[0] = matches[1];
			mobile_size[1] = matches[2];
		}
		
		if( ( oSelf.edit_row_column > - 1 ) && ( oSelf.edit_column > -1 ) ){
			
			if( oSelf.valid_column_numbers( oSelf.edit_row_column, [ [ oSelf.selected_column[0], oSelf.selected_column[1] ] ], [ oSelf.edit_column ] ) ){
				oSelf.rows[ oSelf.edit_row_column ].columns[ oSelf.edit_column ].rows = oSelf.selected_column[0];
				oSelf.rows[ oSelf.edit_row_column ].columns[ oSelf.edit_column ].from_rows = oSelf.selected_column[1];
				oSelf.rows[ oSelf.edit_row_column ].columns[ oSelf.edit_column ].mobile_rows = mobile_size[0];
				oSelf.rows[ oSelf.edit_row_column ].columns[ oSelf.edit_column ].mobile_from_rows = mobile_size[1];
				oSelf.preview();
				tb_remove();
			}else{
				alert( oSelf.get_label( 'Can not replace ' ) + oSelf.rows[ oSelf.edit_row_column ].columns[ oSelf.edit_column ].rows + '/' + oSelf.rows[ oSelf.edit_row_column ].columns[ oSelf.edit_column ].from_rows + oSelf.get_label( ' with ' ) + oSelf.selected_column[0] + '/' + oSelf.selected_column[1] );
			}
		}else{
			var new_column_id = oSelf.add_column( oSelf.add_column_dropdown_menu.attr( 'data-row-id' ), oSelf.selected_column[0], oSelf.selected_column[1], mobile_size[0], mobile_size[1] );
			
			if( new_column_id > -1 ){
				oSelf.preview();
				tb_remove();
			};
		};
		
	});
};
otw_grid_manager_object.prototype.init_add_column_dialog_columns = function(){
	
	var oSelf = this;
	
	jQuery( '.otw_grid_manager_column_dlg_row .otw-column-content').on( 'click',  function(){
		
		var matches = false;
		if( matches = jQuery( this ).attr( 'class').match( /otw\-column\-([0-9]+)\_([0-9]+)/ ) ){
			oSelf.selected_column[ 0 ] = matches[1];
			oSelf.selected_column[ 1 ] = matches[2];
		};
		oSelf.column_dialog_mark_selected();
	} );
};
