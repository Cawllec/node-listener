# Node Listener - Manual API testing server

A simple, customisable, server for mocking/mimicing APIs while manually testing.

## Usage

1. Install:
    ```shell
    yarn install
    ```

2. Run:
    ```shell
    yarn start {scheme name}
    ```

## Schemes

Schemes customize the server setup.  A default scheme is run if none is provided.

### Options

* **port**: The port for the http server to listen on

* **https**: Options for the https server including:
  - **port**: The port for the https server to listen on
  - **key**: Key file location
  - **cert**: Cert file location

* **paths**: Definitions of paths to listen on:
  - **path**: Path to listen on
  - **method**: The method to listen for i.e. `GET`, `POST`
  - **response**: Response to return.  If this is an array of response codes then the response will be randomly selected from them.
  - **parse**: Parse and output the headers/body of received requests
