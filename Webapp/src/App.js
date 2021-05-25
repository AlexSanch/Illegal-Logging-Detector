import logo from './logo.svg';
import './App.css';
import IotReciever from "./components/iot-reciever-aws"
import MyMap from "./components/maps"
import React, { Component } from 'react';
import ReactDOM from "react-dom"
import { Card, Col, Row } from "reactstrap"
import styles from "./components/style-module"
import Alarm from "./components/Sounds/alarm.wav";
import { isMobile } from "react-device-detect"

let maps = ""

const alarmAudio = new Audio(Alarm);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coord: [-99.074787, 19.460355],
      coords: [[-99.074787, 19.460355], [-99.07, 19.4605], [-99.0837, 19.460355]],
      colors: [styles.Blue, styles.Blue, styles.Blue],
      kind: [0, 0, 0],
      temperature: "Pending",
      humidity: "Pending",
      result: "Pending",
      pressure: "Pending"
    }
    this.callBackIoT = this.callBackIoT.bind(this);
  }

  callBackIoT = (data) => {
    const temp = JSON.parse(JSON.parse(data[1]))
    if (temp["dev_id"] !== undefined && temp["payload_raw"] !== undefined) {
      if (temp["dev_id"] === "ttn-gateway-device") {
        console.log(temp["payload_raw"])
        let payload = atob(temp["payload_raw"]).replace(' ', '').split(",")
        if (payload.length > 1) {
          let temp2 = <MyMap
            coord={this.state.coord}
            coords={this.state.coords}
            colors={this.state.colors}
            kind={this.state.kind}
            zoom={14}
          />
          if (payload[0] === "2") {
            this.setState({
              temperature: payload[2],
              humidity: payload[1],
              result: "Humans",
              pressure: payload[3].substring(0, 3),
              colors: [styles.Yellow, styles.Blue, styles.Blue],
              kind: [1, 0, 0],
            })
            temp2 = <MyMap
              coord={this.state.coord}
              coords={this.state.coords}
              colors={[styles.Yellow, styles.Blue, styles.Blue]}
              kind={[1, 0, 0]}
              zoom={14}
            />
            alarmAudio.pause();
          }
          else if (payload[0] === "3") {
            this.setState({
              temperature: payload[2],
              humidity: payload[1],
              result: "Normal",
              pressure: payload[3].substring(0, 3),
              colors: [styles.Blue, styles.Blue, styles.Blue],
              kind: [0, 0, 0],
            })
            temp2 = <MyMap
              coord={this.state.coord}
              coords={this.state.coords}
              colors={this.state.colors}
              kind={this.state.kind}
              zoom={14}
            />
            alarmAudio.pause();
          }
          else if (payload[0] === "1") {
            this.setState({
              temperature: payload[2],
              humidity: payload[1],
              result: "Logging",
              pressure: payload[3].substring(0, 3),
              colors: [styles.Red, styles.Blue, styles.Blue],
              kind: [2, 0, 0],
            })
            temp2 = <MyMap
              coord={this.state.coord}
              coords={this.state.coords}
              colors={[styles.Red, styles.Blue, styles.Blue]}
              kind={[2, 0, 0]}
              zoom={14}
            />
            alarmAudio.play();
          }
          if (!(JSON.stringify(temp2) === JSON.stringify(maps))) {
            maps = temp2
            ReactDOM.unmountComponentAtNode(document.getElementById("map-zone"))
            ReactDOM.render(maps, document.getElementById("map-zone"))
          }
          console.log(payload)
        }
      }
    }
  }

  componentDidMount() {
    maps = <MyMap
      coord={this.state.coord}
      coords={this.state.coords}
      colors={this.state.colors}
      kind={this.state.kind}
      zoom={14}
    />
    ReactDOM.render(maps, document.getElementById("map-zone"))
  }

  render() {
    let tempTEMP = "Pending"
    let logos = <img src={logo} alt="logo" width="100" height="100" className="right" />
    if (this.state.temperature !== "Pending") {
      tempTEMP = Math.round(((this.state.temperature * 1.8 + 32) + Number.EPSILON) * 100) / 100
    }
    return (
      <div className="App">
        <IotReciever sub_topics={["ttn/echo"]} callback={this.callBackIoT} />
        <Col style={{ background: "#f5f4f5" }}>
          <Row md="2">
            <Col className="center">
            {
            logos
          }
            </Col>
            <Col>
            <div className="center">
          Illegal Logging Detector
          </div>
            </Col>
          </Row>
        </Col>
        <hr />
        <Card style={{ padding: "10px"}}>
          <div id="map-zone" />
        </Card>
        <hr />
        <Row md="2" style={{ color: "black", fontSize: "1.3rem" }}>
          <Col xs="6">
            <Card style={{ padding: "10px", borderTopLeftRadius: "30px", borderBottomRightRadius: "30px" }}>
              {"Temp:"}
              <br />
              {tempTEMP}{" °F"}
            </Card>
          </Col>
          <Col xs="6">
            <Card style={{ padding: "10px", borderTopLeftRadius: "30px", borderBottomRightRadius: "30px" }}>
              {"Humidity:"}
              <br />
              {this.state.humidity}{" %"}
            </Card>
          </Col>
          <br />
          <br />
          <br />
          <Col xs="6">
            <Card style={{ padding: "10px", borderTopLeftRadius: "30px", borderBottomRightRadius: "30px" }}>
              {"Pressure:"}
              <br />
              {this.state.pressure}{" mm Hg"}
            </Card>
          </Col>
          <Col xs="6">
            <Card style={{ padding: "10px", borderTopLeftRadius: "30px", borderBottomRightRadius: "30px" }}>
              {"Result:"}
              <br />
              {this.state.result}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;