# Introduction

There are a lot of great node.js i18n modules around but none of them was able to serve the 
clientside aspect of translation. So you will find here the same functionality like in 
[i18next](http://jamuhl.github.com/i18next/) on the server plus it will serve all needed stuff to 
bring same resources to the client.

Mostly:

- express middleware and template support
- Usage of namespaces: split needed translation in more than one file (to share them to other projects, eg. for buttons)
- load resourcesfiles from filesystem
- save missing translations
- serve the same functionality to the clientside

What else will you find:

- support for pluralized strings
- insertion of variables into translations
- translation nesting
- translation contexts

# Installation

    npm install i18next

# Usage Sample

Add your resourcefile under /locales/en-US/translation.json.

    {
        "app": {
            "name": "i18n"
        },
        "creator": {
            "firstname": "Jan",
            "lastname": "Mühlemann"
        }
    }

Require and init the module:

    var i18next = require('i18next');
    i18next.init()  // will init i18n with default settings and set language from request

After initialisation you can use __i18next.t()__:

    var appName = i18next.t('app.name'); // -> i18n

Register the express middleware, so we can check current language settings:

    // Configuration
    app.configure(function() {
        app.use(express.bodyParser());
        app.use(i18next.handle);
        app.use(app.router);

        [...]
    });

language will be extracted from:

- querystring `?setLng=en-US`
- header
- cookie

To change the language on serverside use:

    i18next.setLng('de-DE', function(t) {
        // will load needed resources
        // and set the currentLanguage
    });

To change the language via browser:

    // querystring
    ?setLng=en-US

If no resource string is found in the specific language (en-US) it will be looked up in _en_ befor taken from fallback language. 
If the key is not in the fallback language the key or a optional defaultValue will be displayed:

    var takeDefault = t('app.type', {defaultValue: 'OpenSource'}); // -> OpenSource

### use it in express routes

By adding the middleware you could access i18next inside your routes like this:

    app.get('/', function(req, res) {
        // current language
        var currentLng = req.locale;

        // access i18n
        var i18n = req.i18n;

        // translate
        var appName = i18n.t('app.name');
        res.send(appName);
    });

### use it in you template

Register AppHelper so you can use the translate function in your template:

    i18next.registerAppHelper(app);

Now you can (depending on your template language) do something like this in you template:

    // translate sample in jade
    body
        span= t('app.name')

or grab the current language

    // get language sample in jade
    body
        span= i18n.lng()


### Basic options for init

    i18next.init({
          lng: 'en-US'                               // defaults to get from request
        , fallbackLng: 'en'                          // defaults to 'dev'
        , ns: 'myNamespace'                          // defaults to 'translation'
        , resGetPath: 'myFolder/__lng__/__ns__.json' // defaults to 'locales/__lng__/__ns__.json' where ns = translation (default)
        , resSetPath: 'myFolder/__lng__/__ns__.json' // defaults to 'locales/__lng__/__ns__.json' where ns = translation (default)
        , resStore: {...}                            // if you don't want your resources to be loaded you can provide the resources
    });


# Serve the same stuff on clientside

To serve the clientside script and needed routes for resources and missing keys:

    i18next.serveClientScript(app)        // grab i18next.js in browser
           .serveDynamicResources(app)    // route which returns all resources in on response
           .serveMissingKeyRoute(app);    // route to send missing keys

to support the dynamic route in client add options

    $.i18n.init({
        resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
        dynamicLoad: true
    });

to support posting of missing keys add option

    $.i18n.init({
        sendMissing: true
    });

now you can add the script to you page and use i18next on the client like on the server:

    script(src='i18next/i18next.js', type='text/javascript')

    $.i18n.init([options], function() { 
        $('#appname').text($.t('app.name'));
    });

for more information on clientside usage have a look at [i18next](http://jamuhl.github.com/i18next/)

# Extended Samples

In the next section you will find more options to use i18next.

### loading multiple namespaces

Set the ns option to an array on i18n init:

    i18next.init({
        lng: 'en-US',
        ns: { namespaces: ['ns.common', 'ns.special'], defaultNs: 'ns.special'}
    });

This will load __en-US__, __en__ and __dev__ resources for two namespaces ('ns.special' and 'ns.common'):

    locales
       |
       +-- en-US
       |     |
       |     +-- ns.common
       |     +-- ns.special
       |      
       +-- en
       |    |
       |    +-- ns.common
       |    +-- ns.special
       | 
       +-- dev
            |
            +-- ns.common
            +-- ns.special

    // let's asume this will load following resource strings
    {
      "en_US": {
        "ns.special": {
          "app": {
            "name": "i18n"
          }
        },
        "ns.common": {}
      },
      "en": {
        "ns.special": {
          "app": {
            "area": "Area 51"
          }
        },
        "ns.common": {}
      },
      "dev": {
        "ns.common": {
          "app": {
            "company": {
              "name": "my company"
            }
          },
          "add": "add"
        }
      }
    }


you can translate using _(i18next.)t([namespace:]key, [options])_

    t('app.name');                   // -> i18n (from 'en-US' resourcefile)
    t('app.area');                   // -> Area 51 (from 'en' resourcefile)
    t('ns.common:app.company.name'); // -> my company (from 'dev' resourcefile)
    t('ns.common:add');              // -> add (from 'dev' resourcefile)

### insert values into your translation

    // given resource
    "insert": "you are __myVar__",

    t('insert', {myVar: 'great'}); // -> you are great

### support for plurals

    // given resource
    "child": "__count__ child",
    "child_plural": "__count__ children"

    t('child', {count: 1}); // -> 1 child
    t('child', {count: 3}); // -> 3 children

You can set the _pluralSuffix_ as an option on initialisation.

### extended plural support for multiple plurals

    // given resource
    sl: { 
        translation: { 
            beer: 'Pivo',
            beer_plural_two: 'Pivi',
            beer_plural_few: 'Piva',
            beer_plural: 'stop drinking ;)'
        } 
    }

    t('beer', {count: 1});   // 'Pivo'
    t('beer', {count: 2});   // Pivi'
    t('beer', {count: 3});   // Piva'
    t('beer', {count: 4});   // Piva'
    t('beer', {count: 5});   // stop drinking ;)'

__HINT:__ For now we added only _slovenian_ to the plural rules set as a sample how to do it, but you can easily add new rules 
on runtime or feel free to fork the project and send a pull request.

    $.i18n.pluralExtensions.addRule('sl', function (n) {
        return n % 100 === 1 ? 'one' : n % 100 === 2 ? 'two' : n % 100 === 3 || n % 100 === 4 ? 'few' : 'other';
    });

    // return value 'one' will map to the singular form '[key]'
    // return value 'other' will map to the common plural form '[key]_plural'
    // return value 'two' will map to the extended plural in form '[key]_plural_two'
    // return value 'few' will map to the extended plural in form '[key]_plural_few'

You can find the plural rules on [unicode.org](http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/language_plural_rules.html).

### translation contexts

You can provide a translation key in form `[key]_[yourContext]`. By passing in _context_ through options i18next 
can choose correct form:

    // given resource
    en-US: { 
        translation: { 
            friend: 'a friend',
            friend_male: 'a boyfriend',
            friend_female: 'a girlfriend'
        } 
    }

    t('friend');                        // returns default 'a friend'
    t('friend', {context: 'male'});     // returns 'a boyfriend'
    t('friend', {context: 'female'});   // returns 'a girlfriend'

__hint:__ might be a good idea to suffix your keys using context with _\_context_.

You can even use context and plurals in combination:

    // given resource
    en-US: { 
        translation: { 
            friend: '__count__ friend',
            friend_male: '__count__ boyfriend',
            friend_female: '__count__ girlfriend'
            friend_plural: '__count__ friends',
            friend_male_plural: '__count__ boyfriends',
            friend_female_plural: '__count__ girlfriends'
        } 
    }

    t('friend', {count: 1});                        // returns '1 friend'
    t('friend', {context: 'female', count: 10});    // returns '10 girlfriends'

### nesting

    // given resource
    "app": {
      "area": "Area 51",
      "district": "District 9 is more fun than $t(app.area)"
    }

    t('app.district'); // -> District 9 is more fun than Area 51

### store missing resources to filesystem

Just init i18n with the according options (you shouldn't use this option in production):

    i18next.init({
        // ...
        saveMissing: true,
        resSetPath: 'myFolder/__lng__/__ns__.json'
    });


## Inspiration

- [express-ligua](https://github.com/akoenig/express-lingua)
- [i18n-node](https://github.com/mashpie/i18n-node)

## Release Notes

### v1.2.5

- added function to grap current language from template (i18n.lng())
- merged [pull request #15](https://github.com/jamuhl/i18next-node/pull/15) for express.js v3 support
- updated client

### v1.2.3 & v1.2.4

- updated client

### v1.2.0

- keep version in sync with clientside version
- better support to override default sync
- support for translation contexts
- fixed init without options, callback

### v0.5.0

- options saveMissing
- multiple plurals
- bug fix

### v0.0.1

- tests with mocha
- multi-namespace support
- loading files from filesystem
- clientscript support
- graceful fallback en-US -> en -> fallbackLng
- support for pluralized strings
- insertion of variables into translations
- translation nesting