'use strict';

var libQ = require('kew');
var exec = require('child_process').exec;
var config = new(require('v-conf'))();
var RadioStation = "http://your_radio_station_url_here.com/stream" //changer l'url de la radio

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
	return defer.promise;
};

//Configure les settings quand le plugin oled1 s'arrête ------------------------------------------------------------------------------------------------------------
oled1.prototype.onStop = function() {
	var self = this;
	self.logger.info("Stopping oled1");
 	var defer=libQ.defer();
	return defer.promise;
};

//Configure les settings quand le plugin PapyRadio redémarre ------------------------------------------------------------------------------------------------------------
oled1.prototype.onRestart = function() {
    	var self = this;
 	var defer=libQ.defer();
	return defer.promise;
};


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
