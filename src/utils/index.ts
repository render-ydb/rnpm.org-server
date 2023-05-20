import appConfig = require("../appConfig");
import {isPrivateScopedPackage} from '../lib'

appConfig.privatePackages = appConfig.privatePackages || [];

export const isPrivatePackage = function (name) {
  if (isPrivateScopedPackage(name)) {
    return true;
  }
  if (appConfig.privatePackages.indexOf(name) >= 0) {
    return true;
  }
  return false;
};

export const CHANGE_TYPE = {
  PACKAGE_TAG_ADDED: 'PACKAGE_TAG_ADDED',
  PACKAGE_VERSION_ADDED: 'PACKAGE_VERSION_ADDED',
  PACKAGE_UNPUBLISHED: 'PACKAGE_UNPUBLISHED',
  PACKAGE_VERSION_BLOCKED: 'PACKAGE_VERSION_BLOCKED'
};
