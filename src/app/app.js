"use strict";
const angular = require("angular");
require("@uirouter/angularjs");
require('angular-translate');
require('angular-translate-loader-partial');
require('ng-file-upload');

require("./components/shared/shared.module");
require("./components/index/index.module");


const global_config_factory = require("./global-config.factory");
const app_config = require("./app.config");
const http_error_interceptor_factory = require("./http-error-interceptor.factory");
const d3_factory = require("./d3.factory");
const alert_service = require("./alert-service.factory");


console.log(http_error_interceptor_factory);

angular.module("App", [
    "ui.router",
    "pascalprecht.translate",
    "SharedModule",
    "IndexModule"
    ]
)
    .factory("GlobalConfigFactory", global_config_factory)
    .factory("HttpErrorInterceptorFactory", http_error_interceptor_factory)
    .factory("AlertService", alert_service)
    .factory("d3Factory", d3_factory)
    .config(app_config);