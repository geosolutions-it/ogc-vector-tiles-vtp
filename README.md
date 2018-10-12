# WMTS Vector Tiles Demo

## GeoServer setup

- Download GeoServer and Vector Tiles extension:

    - geoserver-2.15-SNAPSHOT
    - geoserver-2.15-SNAPSHOT-vectortiles-plugin
    - geoserver-2.15-SNAPSHOT-wfs3-plugin

    ```
    Tested on below version:

    GeoServer Version
    2.15-SNAPSHOT
    Git Revision
    ba3a9764076c2d325c31ba90223e8b52757af37e
    Build Date
    12-Oct-2018 08:00
    GeoTools Version
    21-SNAPSHOT (rev 9d9146290efa1e3797d7515adb1140074551883d)
    GeoWebCache Version
    1.15-SNAPSHOT (rev 6f98a7304983bcc6e89a61e58b6f5128c8046296/6f98a7304983bcc6e89a61e58b6f5128c8046296)
    ```

- Install Vector Tiles extension by adding the content of `geoserver-2.15-SNAPSHOT-vectortiles-plugin.zip` and `geoserver-2.15-SNAPSHOT-wfs3-plugin.zip` in `\webapps\geoserver\WEB-INF\lib` folder.

- Copy shapefiles from `Daraa2_Sep_06` in the folder `\data_dir\shapefiles`

- Set `GEOSERVER_DATA_DIR` env variable to be current data_dir before start GeoServer
    ```
    # Windows
    set GEOSERVER_DATA_DIR=path\to\data_dir
    ```

    ```
    # Linux
    export GEOSERVER_DATA_DIR=/path/to/data_dir
    ```

- Start GeoServer

data_dir folder is a data directory of GeoServer configured to provide shapefiles from `Daraa2_Sep_06` as a single data source named `Daraa` (layers group).

Credentials are default (no changes from standard build).

Follow the vector tiles [tutorial](http://docs.geoserver.org/latest/en/user/extensions/vectortiles/tutorial.html) to add new data or change current configuration.

## Setup demo page

Step to compile `vectortiles.js` file and generate the `/www` folder contained the static page with the demo

- change the `env.js` path for prod, they have to be absolute and directed to GeoServer, sprites folder and the source name
    ```
    // eg:
    {
        prod: {
            spritesPath: '"http://localhost:8080/geoserver/www/sprites"',
            geoserverUrl: '"http://localhost:8080/geoserver"',
            sourceName: '"Daraa"'
        },
        ...
    }
    ```
- open a terminal in `/vectortiles` folder and run:
    - `npm install`
    - `npm run compile`

- move the `vectortiles/www` folder to `data_dir/www`

- start GeoServer and open browser at `http://localhost:8080/geoserver/www/index.html` to see the demo page

## Develop demo page

- start GeoServer (default local setup `http://localhost:8080/geoserver`)

- change the `env.js` path for dev, if not default, they have to be absolute and directed to GeoServer, sprites folder and the source name
    ```
    // eg:
    {   
        ...,
        dev: {
            spritesPath: '"http://localhost:3000/sprites"',
            geoserverUrl: '"http://localhost:8080/geoserver"',
            sourceName: '"Daraa"'
        }
    }
    ```

- open a terminal in `/vectortiles` folder and run:
    - `npm install`
    - `npm start`

- open browser at `http://localhost:3000/`

---

node v7.10.1
npm v4.2.0
