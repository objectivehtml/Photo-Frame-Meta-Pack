<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MetaButton extends PhotoFrameButton {
	
	public $name = 'Meta';
	
	public $moduleName = 'photo_frame_meta_pack';
	
	public function prepSavedData($saved_data)
	{
		$saved_data = (array) $saved_data;
		
		if(isset($saved_data['exif_data']))
		{
			$saved_data['exif_string'] = $saved_data['exif_data'];
			$saved_data['exif_data']   = json_decode($saved_data['exif_data']);
		}
		
		return (object) $saved_data;
	}
	
	public function startCrop($data = array(), $settings = array())
	{ 
		return array(); 
	}
	
	public function modifyTables($tables)
	{    
		$tables['photo_frame']['exif_data'] = array(
			'type' => 'longtext'
		);
		
		return $tables;
	}
	
	public function postSave($photo, $orig_photo)
	{
		if(is_object($orig_photo['exif_data']))
		{
			$orig_photo['exif_data'] = json_encode($orig_photo['exif_data']);
		}
		
		$photo['exif_data'] = $orig_photo['exif_data'];
		
		return $photo;
	}
	
	public function css()
	{
		return array('styles');
	}
	
	public function parseVars($row)
	{
		$exif_data = new PhotoFrameExif($row['exif_data']);
		
		return $exif_data->toArray('exif:');
	}
}


class PhotoFrameExif {
	
	private $data = array();
	
	public function __construct($data = array())
	{
		if(is_string($data))
		{
			$data = json_decode($data);
		}
		
		$this->data = $data;
	}
	
	public function toArray($prefix = '')
	{
		$reserved = array('toArray', 'get');
		$return   = array();
		
		foreach(get_class_methods($this) as $method_name)
		{
			if(!in_array($method_name, $reserved))
			{
				if(!preg_match('/^_/', $method_name))
				{
					$return[$prefix . $this->_from_camel_case($method_name)] = $this->$method_name();
				}
			}
		}
		
		return $return;
	}
	
	public function filename()
	{
		return $this->get('FileName');
	}
	
	public function filesize()
	{
		if($value = $this->get('FileSize'))
		{
			return $this->_formatBytes($value);
		}
		
		return FALSE;
	}
	
	public function date()
	{
		return strtotime($this->get('DateTime'));
	}
	
	public function dateString()
	{
		return $this->get('DateTime');
	}
	
	public function artist()
	{
		return $this->get('Artist');
	}
	
	public function make()
	{
		return $this->get('Make');
	}
	
	public function model()
	{
		return $this->get('Model');
	}
	
	public function description()
	{
		return $this->get('description');
	}
	
	public function comments()
	{
		return $this->get('comments');
	}
	
	public function width()
	{
		return $this->get('ExifImageWidth');
	}
	
	public function height()
	{
		return $this->get('ExifImageLength');
	}
	
	public function length()
	{
		return $this->height();
	}
	
	public function aspectRatio()
	{
		$height = $this->height();
		$width  = $this->width();
		
		if($height || $width)
		{
			$ratio = $this->_reduce($width, $height);
		
			return $ratio[0] . ':' . $ratio[1];
		}
	}
	
	public function aperture()
	{
		if($value = $this->get('ApertureValue'))
		{
			$value = $this->_divideString($value);
			$fstop = round($value, 1);
			
			return 'F' . $fstop;
		}
		
		return FALSE;
	}
	
	public function exposureMode()
	{		
		$value = $this->get('ExposureMode');
		
		if($value !== FALSE) 
		{
			switch($value) {
				case 0: 
					$value = 'Auto';
					break;
				case 1: 
					$value = 'Manual';
					break;
				case 2:
					$value = 'Auto Bracket';
					break;
			}
			
			return $value;
		}
			
		return FALSE;
	}		
	
	public function exposureProgram()
	{		
		$mode = $this->get('ExposureProgram');
		
		if($mode !== FALSE) 
		{
			switch($mode) {
				case 0: 
					$mode = 'N/A';
					break;
				case 1: 
					$mode = 'Manual';
					break;
				case 2:
					$mode = 'Normal';
					break;
				case 3:
					$mode = 'Aperture Priority';
					break;
				case 4:
					$mode = 'Shutter Priority';
					break;
				case 5:
					$mode = 'Creative';
					break;
				case 6:
					$mode = 'Action';
					break;
				case 7:
					$mode = 'Portrait';
					break;
				case 8:
					$mode = 'Landscape';
					break;
			}
			
			return $mode;
		}
			
		return FALSE;
	}
	
	public function exposureTime()
	{
		if($value = $this->get('ExposureTime'))
		{
			return $value . ' sec';
		}
		
		return FALSE;
	}
	
	public function focalLength()
	{
		if($value = $this->get('FocalLength'))
		{
			return $this->_divideString($value) . ' mm';
		}
		
		return FALSE;
	}
	
	public function flash()
	{
		$mode = $this->get('Flash');
		
		if($mode !== FALSE) 
		{
			switch($mode) {
				case 0:
					$mode = 'Flash did not fire';
					break;
				case 1:
					$mode = 'Flash fired';
					break;
				case 7:
					$mode = 'Strobe return light detected';
					break;
				case 9:
					$mode = 'Flash fired, compulsory flash mode';
					break;
				case 13:
					$mode = 'Flash fired, compulsory flash mode, return light not detected';
					break;
				case 15:
					$mode = 'Flash fired, compulsory flash mode, return light detected';
					break;
				case 16:
					$mode = 'Flash did not fire, compulsory flash mode';
					break;
				case 24:
					$mode = 'Flash did not fire, auto mode';
					break;
				case 25:
					$mode = 'Flash fired, auto mode';
					break;
				case 29:
					$mode = 'Flash fired, auto mode, return light not detected';
					break;
				case 31:
					$mode = 'Flash fired, auto mode, return light detected';
					break;
				case 32:
					$mode = 'No flash function';
					break;
				case 65:
					$mode = 'Flash fired, red-eye reduction mode';
					break;
				case 69:
					$mode = 'Flash fired, red-eye reduction mode, return light not detected';
					break;
				case 71:
					$mode = 'Flash fired, red-eye reduction mode, return light detected';
					break;
				case 73:
					$mode = 'Flash fired, compulsory flash mode, red-eye reduction mode';
					break;
				case 77:
					$mode = 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected';
					break;
				case 79:
					$mode = 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected';
					break;
				case 89:
					$mode = 'Flash fired, auto mode, red-eye reduction mode';
					break;
				case 93:
					$mode = 'Flash fired, auto mode, return light not detected, red-eye reduction mode';
					break;
				case 95:
					$mode = 'Flash fired, auto mode, return light detected, red-eye reduction mode';
					break;
			}
				
			return $mode;
		}
		
		return FALSE;
	}
	
	public function isoSpeedRatings()
	{
		return $this->get('ISOSpeedRatings');
	}
	
	public function iso()
	{
		return $this->isoSpeedRatings();
	}
	
	public function fnumber()
	{
		return $this->aperture();
	}
	
	public function maxSperture()
	{
		if($value = $this->get('MaxApertureValue'))
		{
			$value = $this->_divideString($value);
			$fstop = round($value, 1);
			
			return 'F' . $fstop;
		}
		
		return FALSE;
	}
	
	public function meteringMode()
	{
		$mode = $this->get('MeteringMode');
		
		if($mode !== FALSE) 
		{
			switch($mode) {
				case 0: 
					$mode = 'Unknown';
					break;
				case 1: 
					$mode = 'Average';
					break;
				case 2:
					$mode = 'Center Weighted Average';
					break;
				case 3:
					$mode = 'Spot';
					break;
				case 4:
					$mode = 'Multi Spot';
					break;
				case 5:
					$mode = 'Pattern';
					break;
				case 6:
					$mode = 'Partial';
					break;
				case 255:
					$mode = 'other';
					break;
			}
				
			return $mode;
		}
		
		return FALSE;
	}
	
	public function whiteBalance()
	{
		$mode = $this->get('WhiteBalance');
		
		if($mode !== FALSE) 
		{
			switch($mode) {
				case 0: 
					$mode = 'Auto';
					break;
				case 1: 
					$mode = 'Manual';
					break;
			}
				
			return $mode;
		}
		
		return FALSE;
	}
	
	public function sensingMode()
	{
		$mode = $this->get('WhiteBalance');
		
		if($mode !== FALSE) 
		{
			switch($mode) {
				case 1: 
					$mode = 'N/A';
					break;
				case 2: 
					$mode = 'One-chip color area sensor';
					break;
				case 3: 
					$mode = 'Two-chip color area sensor';
					break;
				case 4: 
					$mode = 'Three-chip color area sensor';
					break;
				case 5: 
					$mode = 'Color sequential area sensor';
					break;
				case 7: 
					$mode = 'Trilinear sensor';
					break;
				case 8: 
					$mode = 'Color sequential linear sensor';
					break;
			}
				
			return $mode;
		}
		
		return FALSE;
	}
	
	public function shutterSpeed()
	{
		if($value = $this->get('ShutterSpeedValue'))
		{
			$value   = $this->_divideString($value);
			$shutter = pow(-$value, 2);
	 
			if($shutter == 0) return FALSE;
			
			if($shutter >= 1) 
				$value = round($shutter); 
			else
				$value = round(1 / $shutter);
			
			return '1/' . $value . ' sec';  					
		}
		
		return FALSE;
	}
	
	public function latitude()
	{
		$location = $this->_gpsLocation();
		
		return $location ? $location[0] : FALSE; 
	}
	
	public function longitude()
	{
		$location = $this->_gpsLocation();
		
		return $location ? $location[1] : FALSE; 
	}
	
	private function _gpsLocation()
	{
		$gpsLat = $this->get('GPSLatitude');
		$gpsLng = $this->get('GPSLongitude');
		
		if($gpsLat !== FALSE && $gpsLng !== FALSE)
		{
			$aLat = $this->_degreesToDecimals($gpsLat);
			$aLng = $this->_degreesToDecimals($gpsLng);
			
			$strLatRef = $this->get('GPSLatitudeRef') ? $this->get('GPSLatitudeRef') : 'N';
			$strLngRef = $this->get('GPSLongitudeRef') ? $this->get('GPSLongitudeRef') : 'W';
			
			$fLat = $aLat * ($strLatRef == 'N' ? 1 : -1);
			$fLng = $aLng * ($strLngRef == 'W' ? -1 : 1);
			
			return array($fLat, $fLng);
		}
		
		return FALSE;
	}
	
	public function get($prop)
	{
		if(isset($this->data->$prop))
		{
			return $this->data->$prop;
		}
		
		return FALSE;
	}
	
	private function _divideString($string)
	{
		$string = explode('/', $string);
		
		return $string[1] ? (float) $string[0] / (float) $string[1] : $string[0];	
	}
		
	private function _gcd($a, $b)
	{
		return ($b == 0) ? $a : $this->_gcd($b, $a%$b);
	}
	
	private function _reduce($numerator, $denominator)
	{	
		$gcd = $this->_gcd($numerator, $denominator);
		
		return array($numerator / $gcd, $denominator / $gcd);	
	}
	
	private function _signum($number)
	{
		return $number?$number<0?-1:1:0;
	}
	
	private function _degreesToDecimals($coord)
	{
		$d = $this->_divideString($coord[0]);
		$m = $this->_divideString($coord[1]);
		$s = $this->_divideString($coord[2]);
		
		return $this->_signum($d) * (abs($d) + ($m / 60.0) + ($s / 3600.0));
	}
	
	private function _from_camel_case($input) {
		preg_match_all('!([A-Z][A-Z0-9]*(?=$|[A-Z][a-z0-9])|[A-Za-z][a-z0-9]+)!', $input, $matches);
		$ret = $matches[0];
		foreach ($ret as &$match)
		{
			$match = $match == strtoupper($match) ? strtolower($match) : lcfirst($match);
		}
		return implode('_', $ret);
	}
	
	private function _formatBytes($bytes, $precision = 2) { 
	    $units = array('B', 'KB', 'MB', 'GB', 'TB'); 
	
	    $bytes = max($bytes, 0); 
	    $pow   = floor(($bytes ? log($bytes) : 0) / log(1024)); 
	    $pow   = min($pow, count($units) - 1); 
	
	    // Uncomment one of the following alternatives
	    // $bytes /= pow(1024, $pow);
	    // $bytes /= (1 << (10 * $pow)); 
	
	    return round($bytes, $precision) . ' ' . $units[$pow]; 
	} 
}