'use strict'; //Assure le strict mode du plugin pour éviter les erreurs de code

var libQ = require('kew');
var fs=require('fs-extra');
const path=require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

const Gpio = require('onoff').Gpio;
const io = require('socket.io-client');

//Constructeur ----------------------------------------------------------------------------------------------------------------------------------------------------
module.exports = oled1;
function Oled1(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;
}

//Configure les settings quand l'appli Volumio démarre ------------------------------------------------------------------------------------------------------------
oled1.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

    return libQ.resolve();
}


//Configure les settings quand le plugin PapyRadio démarre ------------------------------------------------------------------------------------------------------------
oled1.prototype.onStart = function() {
    	var self = this;
	var defer=libQ.defer();
	
	self.debugLogging = (self.config.get('logging')==true);
	self.status=null;
	self.loadI18nStrings();

	if (self.debugLogging) self.logger.info('[OLED1] onStart: Config loaded: ' + JSON.stringify(self.config));

	self.socket = io.connect('http://localhost:3000');
	self.socket.emit('getState');
	self.socket.on('pushState',function(data){
		self.status = data;
		self.lastTime = data.seek - Date.now();
		// if (self.debugLogging) self.logger.info('[OLED1] received Websock Status: ' + JSON.stringify(self.status));
	})

	.then(_=> {
		self.commandRouter.pushToastMessage('success',"Oled1 - successfully loaded")
		if (self.debugLogging) self.logger.info('[OLED1] onStart: Plugin successfully started.');				
		defer.resolve();				
	})
	.fail(error => {
		self.commandRouter.pushToastMessage('error',"oled", self.getI18nString('OLED1.TOAST_STOP_FAIL'))
		defer.reject();
	});
	let station = 'https://www.radio-en-ligne.fr/nrj';
	self.playRadio(station);

    return defer.promise;
};



//Configure les settings quand le plugin oled1 s'arrête ------------------------------------------------------------------------------------------------------------
oled1.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

	if (self.debugLogging) self.logger.info('[OLED1] onStop: Stopping Plugin.');

	.then(_=> {
		self.socket.off('pushState');
		self.socket.disconnect();
	})
	.then(_=>{
		self.commandRouter.pushToastMessage('success',"oled1", self.getI18nString('OLED1.TOAST_STOP_SUCCESS'))
		if (self.debugLogging) self.logger.info('[OLED1] onStop: Plugin successfully stopped.');				
		defer.resolve();	
	})
	.fail(err=>{
		self.commandRouter.pushToastMessage('success',"Oled1", self.getI18nString('OLED1.TOAST_STOP_FAIL'))
		self.logger.error('[OLED1] onStop: Failed to cleanly stop plugin.'+err);				
		defer.reject();	
	})
    return defer.promise;
};


//Configure les settings quand le plugin PapyRadio redémarre ------------------------------------------------------------------------------------------------------------
oled1.prototype.onRestart = function() {
    var self = this;
    var defer=libQ.defer();

	if (self.debugLogging) self.logger.info('[OLED1] onRestart: free resources');
};

oled1.prototype.playRadio = function(station){
    socket.emit('replaceAndPlay', {
        service:'webradio',
        type:'webradio',
        title:station,
        uri: station
    });
}


//Configuration Methods ------------------------------------------------------------------------------------------------------------------------------------------

oled1.prototype.getUIConfig = function() {
    var defer = libQ.defer();
    var self = this;

	if (self.debugLogging) self.logger.info('[OLED1] getUIConfig: starting: ');
	if (self.debugLogging) self.logger.info('[OLED1] getUIConfig: i18nStrings'+JSON.stringify(self.i18nStrings));
	if (self.debugLogging) self.logger.info('[OLED1] getUIConfig: i18nStringsDefaults'+JSON.stringify(self.i18nStringsDefaults));

    var lang_code = this.commandRouter.sharedVars.get('language_code');

	if (self.debugLogging) self.logger.info('[OLED1] getUIConfig: language code: ' + lang_code + ' dir: ' + __dirname);

    self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};

Oled1.prototype.getConfigurationFiles = function() {
	return ['config.json'];
}
