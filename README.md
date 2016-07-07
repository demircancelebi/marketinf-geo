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
- [Tor] sudo port install tor

### Developing

1. Run `npm install` to install server dependencies.

2. Run `grunt` to start the development server. It should automatically open the client in your browser when ready.

### Adding new countries to DB

  1. Edit /opt/local/etc/tor/torrc
  Add line MaxCircuitDirtiness 100

  2. Run tor

  3. Run `node ./tool/index.js Türkiye 2 4 6`


  Script parameters:

  1. Country name in its native language.
  2. Administrative area level of the country.
  3. Administrative area level of the cities.
  4. Administrative area level of the districts.

  * You can check the administrative area names by trying various queries in Overpass API.
  * Go to www.openstreetmap.org
  * Find the "Relation" entities and record their "admin_level"'s
