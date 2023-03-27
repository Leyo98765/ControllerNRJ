'use strict';

var libQ = require('kew');
var fs = require('fs-extra');
var config = new(require('v-conf'))();
var exec = require('child_process').exec;

// Define the ControllerNRJ class
module.exports = ControllerNRJ;

function ControllerNRJ(context) {
    var self = this;
    self.context = context;
    self.commandRouter = self.context.coreCommand;
    self.logger = self.commandRouter.logger;

    // Perform your initialization here
};

ControllerNRJ.prototype.onVolumioStart = function() {
    var self = this;
    var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
    config.loadFile(configFile);
    return libQ.resolve();
};

ControllerNRJ.prototype.onStart = function() {
    var self = this;
    var defer=libQ.defer();

    // Start your plugin here
    exec('/usr/bin/sudo /bin/systemctl start NRJ.service', function (error, stdout, stderr) {
        if (error !== null) {
            self.logger.info('[' + Date.now() + '] ' + 'Error starting NRJ service: ' + error);
            defer.reject();
        } else {
            self.logger.info('[' + Date.now() + '] ' + 'NRJ service started');
            defer.resolve();
        }
    });

    return defer.promise;
};

ControllerNRJ.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

    // Stop your plugin here
    exec('/usr/bin/sudo /bin/systemctl stop NRJ.service', function (error, stdout, stderr) {
        if (error !== null) {
            self.logger.info('[' + Date.now() + '] ' + 'Error stopping NRJ service: ' + error);
            defer.reject();
        } else {
            self.logger.info('[' + Date.now() + '] ' + 'NRJ service stopped');
            defer.resolve();
        }
    });

    return defer.promise;
};

ControllerNRJ.prototype.onRestart = function() {
    var self = this;
    // Optional, use if you need it
};

// Configuration Methods -----------------------------------------------------------------------------

ControllerNRJ.prototype.getUIConfig = function() {
    var defer = libQ.defer();
    var lang_code = this.commandRouter.sharedVars.get('language_code');

    this.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {
            uiconf.sections[0].content[0].value=config.get('url');

            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};

ControllerNRJ.prototype.setUIConfig = function(data) {
    var self = this;
    //Perform your installation tasks here
};

ControllerNRJ.prototype.getConf = function(varName) {
    var self = this;
    //Perform your installation tasks here
};

ControllerNRJ.prototype.setConf = function(varName, varValue) {
    var self = this;
    //Perform your installation tasks here
};
