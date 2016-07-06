# marketinf-geo

  This repository is the location API of Marketinf.

## Usage

### API Routes

GET: /countries             - Returns the list of all available country codes as an array
GET: /countries/:code       - Returns the geographical information of the specified country
GET: /countries/:code/:area - Returns the geographical information of the specified area in the specified country


## Dev

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Ruby](https://www.ruby-lang.org) and then `gem install sass`
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Developing

1. Run `npm install` to install server dependencies.

2. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

### Adding new countries to DB

  Run `node ./tool/index.js Türkiye TR city town`

  Script parameters:

  1. Country name in its native language.
  2. Country code.
  3. Name of Administrative area level 1.
  4. Name of Administrative area level 2.

  * You can check the administrative area names by trying various queries in Overpass API.
  * Go to https://overpass-turbo.eu/
  * Change "city" and "town fields", try to find for the specified country

  ```
  [out:json];
  area[name="Türkiye"];
  (node[place="city"](area););
  out;
  ```

  ```
  [out:json];
  area[name="İstanbul"];
  (node[place="town"](area););
  out;
  ```
