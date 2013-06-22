(function($) {
	
	PhotoFrame.Buttons.Meta = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * The meta latitude
		 */
		
		lat: false,
		
		/**
		 * The meta longitude
		 */
		
		lng: false,
		
		/**
		 * Name of the button
		 */
		
		icon: 'info-circled',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: 'photo-frame-meta-pack',	
			title: false,
			width: 350
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.name				  = PhotoFrame.Lang.meta;
			this.description		  = PhotoFrame.Lang.meta_desc;
			this.windowSettings.title = PhotoFrame.Lang.meta;
			
			this.base(buttonBar);
		},
		
		_formatUnixTime: function(value) {
		
			var components = value.split(' ');
			var date = components[0].split(':');
			var time = components[1].split(':');
			
			var meridian = 'AM';
			var hours = parseInt(time[0]);
			
			if(hours == 12) {
				meridian = 'PM';
			}
			
			if(hours > 12) {
				meridian = 'PM';
				hours -= 12;
			}
			
			var minutes = parseInt(time[1]);
			var seconds = parseInt(time[2]);
			
			return [date.join('-'), (hours.toString().length == 1 ? '0' : '') + hours + ':' + (minutes.toString().length == 1 ? '0' : '') + minutes + ':' + (seconds.toString().length == 1 ? '0' : '') + seconds + ' ' + meridian];
		},
		
		_exifDateTime: function(t) {
			var value = t.data().DateTime;
			
			if(value) {
				value = t._formatUnixTime(value);
				
				return [
					['Date', value[0]],
					['Time', value[1]]
				];
			}
			else {
				return [
					['Date', 'N/A'],
					['Time', 'N/A'],
				];
			}
		},
		
		_exifAspectRatio: function(t) {
			
			var height = t.data().ExifImageLength;
			var width  = t.data().ExifImageWidth;
			
			if(height && width) {
				var ratio = t.cropPhoto().reduce(width, height);
				
				return [
					['Aspect Ratio', ratio.join(':')]
				];
			}
			else {
				return [
					['Aspect Ratio', 'N/A']
				];
			}
			
		},	
		
		_exifExposureMode: function(t) {
			var mode = t.data().ExposureMode;
			
			if(typeof mode != "undefined") {
				switch(mode) {
					case 0: 
						mode = 'Auto';
						break;
					case 1: 
						mode = 'Manual';
						break;
					case 2:
						mode = 'Auto Bracket';
						break;
				}
				
				return [
					['Exposure Mode', mode]
				]
			}
			else {
				return [
					['Exposure Mode', 'N/A']
				];
			}				
		},
		
		_exifExposureProgram: function(t) {
			var mode = t.data().ExposureProgram;
			
			if(typeof mode != "undefined") {
				switch(mode) {
					case 0: 
						mode = 'N/A';
						break;
					case 1: 
						mode = 'Manual';
						break;
					case 2:
						mode = 'Normal';
						break;
					case 3:
						mode = 'Aperture Priority';
						break;
					case 4:
						mode = 'Shutter Priority';
						break;
					case 5:
						mode = 'Creative';
						break;
					case 6:
						mode = 'Action';
						break;
					case 7:
						mode = 'Portrait';
						break;
					case 8:
						mode = 'Landscape';
						break;
				}
				
				return [
					['Exposure Program', mode]
				]
			}
			else {
				return [
					['Exposure Program', 'N/A']
				];
			}					
		},
		
		_exifMeteringMode: function(t) {
			var mode = t.data().MeteringMode;
			
			if(typeof mode != "undefined") {
				switch(mode) {
					case 0: 
						mode = 'Unknown';
						break;
					case 1: 
						mode = 'Average';
						break;
					case 2:
						mode = 'Center Weighted Average';
						break;
					case 3:
						mode = 'Spot';
						break;
					case 4:
						mode = 'Multi Spot';
						break;
					case 5:
						mode = 'Pattern';
						break;
					case 6:
						mode = 'Partial';
						break;
					case 255:
						mode = 'other';
						break;
				}
				
				return [
					['Metering Mode', mode]
				]
			}
			else {
				return [
					['Metering Mode', 'N/A']
				];
			}				
		},
		
		_exifWhiteBalance: function(t) {
			var mode = t.data().WhiteBalance;
			
			if(typeof mode != "undefined") {
				switch(mode) {
					case 0: 
						mode = 'Auto';
						break;
					case 1: 
						mode = 'Manual';
						break;
				}
				return [
					['White Balance', mode]
				];
			}
			else {
				return [
					['White Balance', 'N/A']
				];
			}				
		},
		
		_exifSensingMode: function(t) {
			var mode = t.data().SensingMode;
			
			if(typeof mode != "undefined") {
				switch(mode) {
					case 1: 
						mode = 'N/A';
						break;
					case 2: 
						mode = 'One-chip color area sensor';
						break;
					case 3: 
						mode = 'Two-chip color area sensor';
						break;
					case 4: 
						mode = 'Three-chip color area sensor';
						break;
					case 5: 
						mode = 'Color sequential area sensor';
						break;
					case 7: 
						mode = 'Trilinear sensor';
						break;
					case 8: 
						mode = 'Color sequential linear sensor';
						break;
				}
				return [
					['Sensing Mode', mode]
				];
			}
			else {
				return [
					['Sensing Mode', 'N/A']
				];
			}				
		},
		
		_divideString: function(string) {
			string = string.split('/');			
			return string[1] ? parseFloat(string[0]) / parseFloat(string[1]) : string[0];
		},
		
		_signum: function(number) {
			return number?number<0?-1:1:0;	
		},
		
		_degreesToDecimals: function(coord) {
			var d = this._divideString(coord[0]);
			var m = this._divideString(coord[1]);
			var s = this._divideString(coord[2]);
			
			return this._signum(d) * (Math.abs(d) + (m / 60.0) + (s / 3600.0));
		},
		
		_exifAperture: function(t) {
			var _default = [
				['Aperture', 'N/A']
			];

			if(t.data().ApertureValue) {
				var value = t._divideString(t.data().ApertureValue);
				var fstop = t.cropPhoto().round(Math.pow(2, value / 2), 1);
				 
				if (fstop == 0) return _default; 
				
				return [
					['Aperture', 'F'+fstop]
				];
			}
			else {
				return _default;
			}
		},
		
		_exifMaxAperture: function(t) {
			var _default = [
				['Max Aperture', 'N/A']
			];

			if(t.data().MaxApertureValue) {
				var value = t._divideString(t.data().MaxApertureValue);
				var fstop = t.cropPhoto().round(Math.pow(2, value / 2));
				 
				if (fstop == 0) return _default; 
				
				return [
					['Max Aperture', 'F'+fstop]
				];
			}
			else {
				return _default;
			}
		},
		
		_exifShutterSpeed: function(t) {
			var _default = [
				['Shutter Speed', 'N/A']
			];
			
			var value = t.data().ShutterSpeedValue;
			
			if(t.data().ShutterSpeedValue) {
				var value   = t._divideString(t.data().ShutterSpeedValue);
				var shutter = Math.pow(2, -value);
				  
				if(shutter == 0) return _default; 
				
				if(shutter >= 1) 
					value = t.cropPhoto().round(shutter, 1); 
				else
  					value = t.cropPhoto().round(1 / shutter, 1);
  					
  				return [
  					['Shutter Speed', '1/' + value + ' sec']
  				]; 
			}
			else {
				return _default;	
			}	
		},
		
		_exifGPSLocation: function(t) { 
			if(t.data().GPSLatitude && t.data().GPSLongitude) {
				var aLat = t._degreesToDecimals(t.data().GPSLatitude);
				var aLng = t._degreesToDecimals(t.data().GPSLongitude);
			  
            	var strLatRef  = t.data().GPSLatitudeRef || "N";  
            	var strLongRef = t.data().GPSLongitudeRef || "W";
            }
              
			if(aLat && aLng) {
				var fLat = aLat * (strLatRef == "N" ? 1 : -1);  
            	var fLng = aLng * (strLongRef == "W" ? -1 : 1);
            
            	t.lat = fLat;
            	t.lng = fLng;
            	
				return [
					['Latitude', fLat],
					['Longitude', fLng]
				];       	
            }
            else {
				return [
					['Location', 'N/A']
				];
            }
		},
		
		_exifExposureTime: function(t) {
			var _default = [
				['Exposure Time', 'N/A']
			];
			
			var value = t.data().ExposureTime;
			
			if(t.data().ExposureTime) {
				var value   = t.data().ExposureTime;
				
  				return [
  					['Exposure Time', value + ' sec']
  				]; 
			}
			else {
				return _default;	
			}
		},
		
		_exifFocalLength: function(t) {
			var _default = [
				['Focal Length', 'N/A']
			];
			
			var value = t.data().FocalLength;
			
			if(t.data().FocalLength) {
				var value   = t._divideString(t.data().FocalLength);
				
  				return [
  					['Focal Length', value + ' mm']
  				]; 
			}
			else {
				return _default;	
			}
		},
		
		_exifFlash: function(t) {
			var _default = [
				['Flash', 'N/A']
			];
			
			if(t.data().Flash) {
			
				var value = t.data().Flash;
			
				switch(value) {
					case 0:
						value = 'Flash did not fire';
						break;
					case 1:
						value = 'Flash fired';
						break;
					case 7:
						value = 'Strobe return light detected';
						break;
					case 9:
						value = 'Flash fired, compulsory flash mode';
						break;
					case 13:
						value = 'Flash fired, compulsory flash mode, return light not detected';
						break;
					case 15:
						value = 'Flash fired, compulsory flash mode, return light detected';
						break;
					case 16:
						value = 'Flash did not fire, compulsory flash mode';
						break;
					case 24:
						value = 'Flash did not fire, auto mode';
						break;
					case 25:
						value = 'Flash fired, auto mode';
						break;
					case 29:
						value = 'Flash fired, auto mode, return light not detected';
						break;
					case 31:
						value = 'Flash fired, auto mode, return light detected';
						break;
					case 32:
						value = 'No flash function';
						break;
					case 65:
						value = 'Flash fired, red-eye reduction mode';
						break;
					case 69:
						value = 'Flash fired, red-eye reduction mode, return light not detected';
						break;
					case 71:
						value = 'Flash fired, red-eye reduction mode, return light detected';
						break;
					case 73:
						value = 'Flash fired, compulsory flash mode, red-eye reduction mode';
						break;
					case 77:
						value = 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected';
						break;
					case 79:
						value = 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected';
						break;
					case 89:
						value = 'Flash fired, auto mode, red-eye reduction mode';
						break;
					case 93:
						value = 'Flash fired, auto mode, return light not detected, red-eye reduction mode';
						break;
					case 95:
						value = 'Flash fired, auto mode, return light detected, red-eye reduction mode';
						break;
				}
  	
  				return [
  					['Flash', value]
  				]; 
			}
			else {
				return _default;	
			}
		},
		
		startCrop: function() {
			var t = this;
			
			this.lat = false;
			this.lng = false;
			
			t.cropPhoto().factory.trigger('metaStartCrop');
			
			var components = {
				'details': [
					'Artist', 
					t._exifDateTime, 
					'Make', 
					'Model', 
					['ImageDescription', 'Description'],
					['UserComment', 'Comments']
				],
				'advanced': [
					t._exifAspectRatio, 
					t._exifAperture,
					// ['ColorSpace', 'Color Space'],
					t._exifExposureMode,
					t._exifExposureProgram,
					t._exifExposureTime,
					t._exifFocalLength,
					t._exifFlash,
					['ISOSpeedRatings', 'ISO Speed Rating'],
					t._exifMaxAperture,
					t._exifMeteringMode,
					t._exifShutterSpeed,
					t._exifSensingMode, 
					t._exifWhiteBalance
				],
				'gps': [
					t._exifGPSLocation
				]
			};
						
			if(this.data()) {
			
				$.each(components, function(css, array) {
					$.each(array, function(i, component) {
						if(typeof component == "function") {
							var _data = component(t);
							
							if(typeof _data == "object") {
								$.each(_data, function(x, obj) {	
									t.addData(css, obj[0], obj[1]);
								});
							}
						}
						else if(typeof component == "object") {
						
							var value = t.data();
					
							if(typeof value[component[0]] != "undefined") {
								t.addData(css, component[1], value[component[0]]);
							}
							else {	
								t.addData(css, component[1], 'N/A');
							}
						} else {
							var value = t.data();
							
							if(typeof value[component] != "undefined") {
								t.addData(css, component, value[component]);
							}
							else {	
								t.addData(css, component, 'N/A');
							}
						}
					});
				});
				
				if(this.lat !== false && this.lng !== false) {
					this.cropPhoto().factory.trigger('metaLatLng', this.lat, this.lng);
				}
			}	
				
			this.cropPhoto().factory.trigger('metaStaticMap', this.window.ui.map);
		},
		
		addData: function(css, component, value) {
			this.window.ui.content.find('#'+css+' table').append([
				'<tr>',
					'<th>'+component+'</th>',
					'<td>'+value+'</td>',
				'</tr>'
			].join(''));
		},
		
		data: function() {
			return this.cropPhoto().response.exif_data;	
		},
		
		reset: function() {
			this.window.ui.content.find('table').html('');
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			var t = this;
			var html = $([
				'<ul class="photo-frame-pill-tabs clearfix">',
					'<li><a href="#details" class="active-tab">Details</a></li>',
					'<li><a href="#advanced">Advanced</a></li>',
					'<li><a href="#gps">GPS</a></li>',
				'</ul>',					
				'<div id="details" class="photo-frame-pill-tab">',
					'<table></table>',
				'</div>',
				'<div id="advanced" class="photo-frame-pill-tab">',
					'<table></table>',
				'</div>',
				'<div id="gps" class="photo-frame-pill-tab">',
					'<div class="static-map"><p>Install <a href="https://objectivehtml.com/google-maps">Google Maps for ExressionEngine</a> to see your data on a map.</div>',
					'<table></table>',
				'</div>'
			].join(''));
						
			this.window.ui.content.append(html);
			
			this.window.ui.map = this.window.ui.content.find('.static-map');
						
			this.window.ui.content.find('.photo-frame-pill-tabs a').click(function(e) {
				t.window.ui.content.find('.photo-frame-pill-tabs a').removeClass('active-tab');
				var $t = $(this);
				var id = $t.attr('href').replace('#', '');
				
				$t.addClass('active-tab');
				
				t.window.ui.content.find('.photo-frame-pill-tab').hide();
				t.window.ui.content.find('#'+id).show();
				
				
				e.preventDefault();
			});
			
			this.window.ui.content.find('.photo-frame-pill-tabs a.active-tab').click();
		}
	});

}(jQuery));