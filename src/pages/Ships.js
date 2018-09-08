import React, { Component } from 'react';

import './Ships.css';

import 'leaflet/dist/leaflet.css';

import { Map, TileLayer, LayerGroup, Circle } from 'react-leaflet';

import { Row, Col } from 'react-bootstrap';

import Bacon from 'baconjs';

const defaults = {
  style: {
    height: 600
  },
  center: [
    60.192059,
    24.945831
  ],
  zoom: 11
}


const getLeafletElementProperties = (element) => {
  const { _southWest, _northEast } = element.getBounds();
  return {
    center: element.getCenter(),
    distance: element.distance(_northEast, _southWest) / 2 / 1000,
    bounds: {
      _northEast,
      _southWest
    }
  }
}

class Ships extends Component {

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      ships: []
    }
    this.listeners = [];
  }

  componentDidMount() {

    // Create WebSocket connection.
    this.socket = new WebSocket('wss://meri-test.digitraffic.fi/api/v1/plain-websockets/locations');

    this.handleMoveend();

  }

  componentWillUnmount() {
    this.socket.close();
  }

  handleMoveend() {

    const { center, distance, bounds } = getLeafletElementProperties(this.myRef.current.leafletElement);

    const now = new Date();

    now.setMinutes(now.getMinutes() - 30);

    fetch(`https://meri.digitraffic.fi/api/v1/locations/latitude/${center.lat}/longitude/${center.lng}/radius/${distance}/from/${now.toISOString()}`)
      .then((response) => response.json())
      .then(({ features }) => features)
      .then(((data) => {

        return Bacon.update(data,
          [
            Bacon.fromEvent(this.socket, 'message')
              .map(({ data }) => JSON.parse(data))
              .filter(({ type }) => type === 'VESSEL_LOCATION')
              .map(({ data }) => data)
              .filter(({ geometry }) => geometry.coordinates[0] < bounds._northEast.lng && geometry.coordinates[0] > bounds._southWest.lng)
              .filter(({ geometry }) => geometry.coordinates[1] < bounds._northEast.lat && geometry.coordinates[1] > bounds._southWest.lat)
              .bufferingThrottle(20)
          ], (prev, curr) => {
            const idx = prev.findIndex(x => x.mmsi === curr.mmsi)
            if (idx > -1) {
              prev.splice(idx, 1, curr)
              return prev;
            } else {
              return prev.concat(curr)
            }
          }
        ).onValue((ships) => {
          this.setState({ ships });
        })
      }))
      .then((listener) => {
        this.listeners.forEach(dispose => { dispose() });
        this.listeners = [];
        this.listeners.push(listener)
      })
  }

  fetchVesselMetaData(mmsi) {

  }

  handleMouseDown(mmsi) {
    fetch(`https://meri.digitraffic.fi/api/v1/metadata/vessels/${mmsi}`)
      .then((response) => response.json())
      .then(console.log)
  }

  render() {
    return (
      <Row className="show-grid">
        <Col xs={12}>
          <Map {...defaults} ref={this.myRef} onMoveend={this.handleMoveend.bind(this)}>
            <TileLayer
              attribution="Map tiles by &lt;a href=&quot;http://stamen.com&quot;&gt;Stamen Design&lt;/a&gt;, under &lt;a href=&quot;http://creativecommons.org/licenses/by/3.0&quot;&gt;CC BY 3.0&lt;/a&gt;. Data by &lt;a href=&quot;http://openstreetmap.org&quot;&gt;OpenStreetMap&lt;/a&gt;, under &lt;a href=&quot;http://creativecommons.org/licenses/by-sa/3.0&quot;&gt;CC BY SA&lt;/a&gt;."
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png" />
            <LayerGroup>
              {
                this.state.ships.map(({ mmsi, geometry, properties }) => (
                  <Circle
                    key={mmsi}
                    center={geometry.coordinates.reverse()}
                    color={properties.navStat === 5 || properties.navStat === 5 ? "blue" : "green"}
                    radius={200}
                    onMouseDown={() => {
                      this.handleMouseDown(mmsi);
                    }} />
                ))
              }
            </LayerGroup>
          </Map>
        </Col>
      </Row>
    )
  }
};

export default Ships;
