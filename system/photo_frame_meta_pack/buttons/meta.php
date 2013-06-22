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
}