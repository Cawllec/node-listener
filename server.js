'use-strict';

const express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    {json, urlencoded} = require('body-parser'),
    multer = require('multer'),
    util = require('util'),
    yaml = require('write-yaml');

const definitionFile = process.argv[2] || 'default.json'
const def = JSON.parse(fs.readFileSync(definitionFile))
const paths = def['paths'];

app.use(json({
    'limit': '1mb'
}));
app.use(urlencoded({extended: true}));

const uploader = multer({dest: 'uploads/'})

paths.forEach(pathDef => {
    console.log(`Adding path:`);
    console.log(util.inspect(pathDef, {depth: null}));
    switch (pathDef['method']) {
        case 'POST':
        case 'post':
            method = app.post;
            break;
        case 'GET':
        case 'get':
            method = app.get;
            break;
        case 'PUT':
        case 'put':
            method = app.put;
            break;
        case 'DELETE':
        case 'delete':
            method = app.delete;
            break;
        case 'DEFAULT':
        case 'default':
        case 'ALL':
        case 'all':
        default:
            method = app.use;
    }
    if (pathDef['upload']) {
        app.use(pathDef['path'], uploader.any(), getHandler(pathDef));
    } else {
        app.use(pathDef['path'], getHandler(pathDef));
    }
});

function getHandler(pathDef) {
    return (req, res) => {
        console.log(`Interception:`)
        console.log(`   Of type:    ${req.method}`);
        console.log(`   From host:  ${req.hostname}`);
        console.log(`   To route:   ${req.originalUrl}`);
        if (pathDef['parse']) {
            parseRequest(req)
        }
        if (pathDef['response']) {
            response = pathDef['response']
            if (response.constructor == Array) {
                responseStatus = response[Math.floor(Math.random() * response.length)]
            } else if (typeof(response) === 'number') {
                responseStatus = response;
            } else {
                responseStatus = 200;
            }
        } else {
            responseStatus = 200;
        }
        if (pathDef['parse']) {
            console.log(`Responding with ${responseStatus}`);
        }
        if (pathDef['save']) {
            saveRequest(pathDef, {
                headers: req.headers,
                body: req.body,
                params: req.params
            });
        }
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Headers', '*')
        res.status(responseStatus).end();
    };
}

function saveRequest(pathDef, data) {
    filename = `${pathDef['method']}.${pathDef['path'].replace('/', '')}.${Date.now()}.${Math.floor((Math.random()*100000))}`;
    console.log(`Saving to file ${filename}`);
    if (pathDef['save'] === 'yaml') {
        yaml.sync(`output/${filename}.yaml`, data)
    } else {
        fs.writeFileSync(`output/${filename}.json`, JSON.stringify(data, null, 4));
    }
}

function parseRequest(req) {
    console.log(`   With headers:`);
    console.log(util.inspect(req.headers, {depth: null}));
    if (req.body) {
        console.log(`   With body:`);
        console.log(util.inspect(req.body, {depth: null}));
    }
    if (req.files) {
        console.log(`   With files:`)
        console.log(util.inspect(req.files, {depth: null}));
    }
    if (req.params) {
        console.log(`   With params:`);
        console.log(util.inspect(req.params, {depth: null}));
    }
    if (req.query) {
        console.log(`   With query:`);
        console.log(util.inspect(req.query, {depth: null}));
    }
}

http.createServer(app).listen(def['port'], () => {
    console.log(`HTTP server listening on port ${def['port']}`);
});

if (def['https']) {
    const httpsdef = def['https']
    const key = fs.readFileSync(httpsdef['key']);
    const cert = fs.readFileSync(httpsdef['cert']);
    https.createServer({key: key, cert: cert}, app).listen(httpsdef['port'], () => {
        console.log(`HTTPS server listening on port ${httpsdef['port']}`);
    });
}

