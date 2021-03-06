var fs = require('fs');

var sync = module.exports = {

    fetchOne: function(lng, ns, cb) {

        var filename = this.functions.applyReplacement(this.options.resGetPath, {lng: lng, ns: ns});

        var self = this;
        fs.readFile(filename, 'utf8', function(err, data) {
            if (err) {
                cb(err);
            } else {
                self.functions.log('loaded file: ' + filename);
                cb(null, JSON.parse(data));
            }
        });
    },

    postMissing: function(lng, ns, key, defaultValue) {

        // add key to resStore
        var keys = key.split('.');
        var x = 0;
        var value = this.resStore[lng][ns];
        while (keys[x]) {
            if (x === keys.length - 1) {
                value = value[keys[x]] = defaultValue;
            } else {
                value = value[keys[x]] = value[keys[x]] || {};
            }
            x++;
        }

        var filename = this.functions.applyReplacement(this.options.resSetPath, {lng: lng, ns: ns});

        var self = this;
        fs.writeFile(filename, JSON.stringify(this.resStore[lng][ns], null, 4), function (err) {
            if (err) {
                self.functions.log('error saving missingKey `' + key + '` to: ' + filename);
            } else {
                self.functions.log('saved missingKey `' + key + '` with value `' + defaultValue + '` to: ' + filename);
            }
        });
    },

    postChange: function(lng, ns, key, newValue) {
        var self = this;
        this.load([lng], {ns: {namespaces: [ns]}}, function(err, fetched) {
            // change key in resStore
            var keys = key.split('.');
            var x = 0;
            var value = fetched[lng][ns];
            while (keys[x]) {
                if (x === keys.length - 1) {
                    value = value[keys[x]] = newValue;
                } else {
                    value = value[keys[x]] = value[keys[x]] || {};
                }
                x++;
            }

            var filename = self.functions.applyReplacement(self.options.resSetPath, {lng: lng, ns: ns});

            fs.writeFile(filename, JSON.stringify(fetched[lng][ns], null, 4), function (err) {
                if (err) {
                    self.functions.log('error updating key `' + key + '` with value `' + newValue + '` to: ' + filename);
                } else {
                    self.functions.log('updated key `' + key + '` with value `' + newValue + '` to: ' + filename);
                }
            });
        });
    },

    deleteKey: function (lngs, ns, key) {
        var self = this;
        this.load(lngs, {ns: {namespaces: [ns]}}, function (error, fetched) {
            var keys = key.split('.');
            var x = 0;
            var value = null;
            lngs.forEach(function (lng, index) {
                x = 0;
                value = fetched[lng][ns];
                while (keys[x]) {
                  if (x === keys.length - 1) {
                      delete value[keys[x]];
                  } else {
                      value = value[keys[x]] = value[keys[x]] || {};
                  }
                  x++;
                }

                var filename = self.functions.applyReplacement(self.options.resSetPath, {lng: lng, ns: ns});

                fs.writeFile(filename, JSON.stringify(fetched[lng][ns], null, 4), function (err) {
                    if (err) {
                        self.functions.log('error deleting key `' + key + '` to: ' + filename);
                    } else {
                        self.functions.log('deleted key `' + key + '` to: ' + filename);
                    }
                });
            });
        });
    }
};
