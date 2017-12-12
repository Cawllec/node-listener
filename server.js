'use-strict';

const express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    {json, urlencoded} = require('body-parser'),
    {cleanEnv, num} = require('envalid'),
    util = require('util');

const env = cleanEnv(process.env, {
    PORT: num({default: 62000}),
    SPORT: num({default: 62443})
});

const key = fs.readFileSync('key.pem');
const cert = fs.readFileSync('cert.pem');

const definitionFile = process.argv[2] || 'default.json'
const definition = JSON.parse(fs.readFileSync(definitionFile))

app.use(json());
app.use(urlencoded({extended: true}));

definition.forEach(pathDef => {
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
    app.use(pathDef['path'], (req, res) => {
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
	console.log(`Responding with ${responseStatus}`);
        res.status(responseStatus).end()
    });
});

function parseRequest(req) {
    console.log(`Interception:`)
    console.log(`   Of type:    ${req.method}`);
    console.log(`   From host:  ${req.hostname}`);
    console.log(`   To route:   ${req.originalUrl}`);
    console.log(`   With headers:`);
    console.log(util.inspect(req.headers, {depth: null}));
    if (req.body) {
        console.log(`   With body:`);
        console.log(util.inspect(req.body, {depth: null}));
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

http.createServer(app).listen(env.PORT, () => {
    console.log(`HTTP server listening on port ${env.PORT}`);
});
https.createServer({key: key, cert: cert}, app).listen(env.SPORT, () => {
    console.log(`HTTPS server listening on port ${env.SPORT}`);
});