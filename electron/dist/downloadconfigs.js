"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var httpntlm = require("httpntlm");
var fs = require("fs");
var DownloadConfigs = /** @class */ (function () {
    function DownloadConfigs(userName, password) {
        var _this = this;
        this.config = null;
        this.downloadFile = function (userLogged, companyName, configFileName, instance) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.config.download(userLogged, companyName, configFileName, instance)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this.config = new Config(userName, password);
    }
    return DownloadConfigs;
}());
var Config = /** @class */ (function () {
    function Config(userName, password) {
        var _this = this;
        this.download = function (userLogged, companyName, configFileName, instance) {
            var promise = new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, httpntlm.get({
                                url: "http://nff-v.netactica.net/" + companyName + "/" + configFileName,
                                username: this.username,
                                password: this.password,
                                workstation: '',
                                domain: '',
                                binary: true
                            }, function (err, response) {
                                if (response.statusCode === 200) {
                                    var fileToSave_1 = configFileName.replace("." + instance + ".xml", '.config');
                                    var path = "D:\\Users\\" + userLogged + "\\AppData\\Local\\Programs\\nff-cloud\\" + fileToSave_1;
                                    // TODO no olvidar comentar esta linea al publicar para produccion
                                    path = fileToSave_1;
                                    fs.writeFile(path, response.body, function (err) {
                                        if (err) {
                                            console.log(err);
                                            rej({
                                                company: companyName,
                                                fileName: configFileName,
                                                message: "Error al intentar descargar el archivo " + configFileName,
                                                error: err
                                            });
                                        }
                                        else {
                                            res({
                                                company: companyName,
                                                fileName: fileToSave_1,
                                                message: configFileName + " descargado",
                                                statusCode: 200
                                            });
                                        }
                                    });
                                }
                                else if (response.statusCode === 404) {
                                    rej({
                                        company: companyName,
                                        fileName: configFileName,
                                        message: "Error al intentar descargar el archivo " + configFileName,
                                        statusCode: 404
                                    });
                                }
                                else if (response.statusCode === 401) {
                                    rej({
                                        company: companyName,
                                        fileName: configFileName,
                                        message: "Error al intentar descargar el archivo " + configFileName,
                                        statusCode: 401
                                    });
                                }
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            return promise;
        };
        this.username = userName;
        this.password = password;
    }
    return Config;
}());
exports.Config = Config;
exports.default = DownloadConfigs;
//# sourceMappingURL=downloadconfigs.js.map