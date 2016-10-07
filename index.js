/**
 * @file loader to parse the tornado template on the fly.
 * @description It's better to use this loader with fscache-loader.
 *     !! ONLY USE THIS IN DEVELOPMENT !!
 * @author Towry Wang
 * @license MIT
 */

const utils = require('loader-utils');
const request = require('request');

function tornadoLoader(source) {
	this.cacheable && this.cacheable();

	var config = getConfig(this);
	var api = config.api || 'http://0.0.0.0:34929';

	var callback = this.async();
	if (!callback) {
		return source;
	}

	// append the resource path.
	source = '<!-- resource:' + this.resource + ' -->\n' + source;
	
	request({
		url: api,
		method: 'POST',
		body: source,
		encoding: 'utf8',
	}, function requestDone(err, res, body) {
		if (err) {
			if (err.code === "ECONNREFUSED") {
				callback(new Error("[tornado-loader] can not connect to " + api));
			} else {
				callback(err);
			}
		} else {
			callback(null, body);
		}
	});
}
module.exports = tornadoLoader;

/**
 * Get the loader config.
 */
function getConfig(context) {
	var options = context.options;
	if (!options.context) {
		throw new Error("You must specific context option in webpack config.");
	}

	var query = utils.parseQuery(context.query);
	var key = query.config || "tornadoLoader";
	var config = options[key] || {};

	config.context = options.context;
	return config;
}
