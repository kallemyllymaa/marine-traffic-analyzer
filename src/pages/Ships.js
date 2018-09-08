import React, { Component } from 'react';
import './Ships.css';

import 'leaflet/dist/leaflet.css';

import { Map, TileLayer, LayerGroup, Circle } from 'react-leaflet';

import Bacon from 'baconjs';

const keyFunc = ({ mmsi }) => mmsi;

const limitFunc = (groupedStream, groupStartingEvent) => groupedStream

const defaults = {
  style: {
    height: 600
  },
  center: [
    60.192059,
    24.945831
  ],
  zoom: 10
}

class Ships extends Component {

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      ships: []
    }
  }

  componentDidMount() {
    const { leafletElement } = this.myRef.current;

    const bounds = leafletElement.getBounds();
    const center = leafletElement.getCenter();

    const now = new Date();

    now.setMinutes(now.getMinutes() - 30);

    // Create WebSocket connection.
    const socket = new WebSocket('wss://meri-test.digitraffic.fi/api/v1/plain-websockets/locations');

    Bacon.fromEvent(socket, 'open');

    const poks = Bacon
      .fromEvent(socket, 'message')
      .map(({ data }) => JSON.parse(data))
      .filter(({ type }) => type === 'VESSEL_LOCATION')
      .map(({ data }) => data)
      .groupBy(keyFunc, limitFunc);

    const naks = poks.flatMap(groupedStream => groupedStream).throttle(2);

    const riks = poks.flatMapLatest(stream =>
      stream.flatMapFirst(({ mmsi }) =>
        Bacon.later(120000, mmsi)
      )
    )

    // const raks = Bacon.interval(5000)

    fetch(`https://meri.digitraffic.fi/api/v1/locations/latitude/${center.lat}/longitude/${center.lng}/radius/${leafletElement.distance(center, bounds._southWest) / 1000}/from/${now.toISOString()}`)
      .then((response) => response.json())
      .then((json) => json.features)
      .then((myJson) => {
        Bacon.update(
          myJson,
          [naks], (prev, naks) => {
            const idx = prev.findIndex(x => x.mmsi === naks.mmsi)
            if (idx > -1) {
              prev.splice(idx, 1, naks)
              return prev;
            } else {
              return prev.concat(naks)
            }
          },
          [riks], (prev, riks) => {
            const idx = prev.findIndex(x => x.mmsi === riks)
            if (idx > -1) {
              prev.splice(idx, 1)
            }
            return prev;
          }/*,
          [raks], (prev, raks) => {
            const latest = prev.reduce((prev, curr) => curr.properties.timestampExternal > prev ? curr.properties.timestampExternal : prev, 0);
            return prev.reduce((prev, curr) => {
              if (curr.properties.timestampExternal > (latest - 5000)) {
                prev.push(curr);
              }
              return prev;
            }, [])
          }*/
        ).onValue((ships) => {
          this.setState({
            ships
          })
        })
      })
  }

  handleMoveend() {
    const { leafletElement } = this.myRef.current;
    const bounds = leafletElement.getBounds();
    const center = leafletElement.getCenter();
    const now = new Date();
    now.setMinutes(now.getMinutes() - 30);
    fetch(`https://meri.digitraffic.fi/api/v1/locations/latitude/${center.lat}/longitude/${center.lng}/radius/${leafletElement.distance(center, bounds._southWest) / 1000}/from/${now.toISOString()}`)
      .then((response) => response.json())
      .then((json) => json.features)
      .then((myJson) => { })
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
      <Map {...defaults} ref={this.myRef} onMoveend={this.handleMoveend.bind(this)}>
        <TileLayer
          attribution="Map tiles by &lt;a href=&quot;http://stamen.com&quot;&gt;Stamen Design&lt;/a&gt;, under &lt;a href=&quot;http://creativecommons.org/licenses/by/3.0&quot;&gt;CC BY 3.0&lt;/a&gt;. Data by &lt;a href=&quot;http://openstreetmap.org&quot;&gt;OpenStreetMap&lt;/a&gt;, under &lt;a href=&quot;http://creativecommons.org/licenses/by-sa/3.0&quot;&gt;CC BY SA&lt;/a&gt;."
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png" />
        <LayerGroup>
          {
            this.state.ships.map(({ mmsi, geometry }) => (
              <Circle
                key={mmsi}
                center={geometry.coordinates.reverse()}
                color="green"
                radius={200}
                onMouseDown={() => {
                  this.handleMouseDown(mmsi);
                }} />
            ))
          }
        </LayerGroup>
      </Map>
    )
  }
};

export default Ships;
