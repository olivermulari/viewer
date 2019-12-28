import React, { Component } from 'react';
import Navigation from "./Navigation";

import Flowlines from "@olivermulari/flowlines";
import Maze from "depthmaze";
import FluidSim from "@olivermulari/fluidsim";

import 'normalize.css';
import '../styles/style.scss';

class App extends Component {
  constructor() {
    super()
    this.current = null;
    this.state = {
      showing: "",
    }
  }

  figureBackground() {
    switch (this.state.showing) {
      case "flowlines":
        this.current = new Flowlines("scene-div");
        break;
      case "maze":
        this.current = new Maze("scene-div");
        break;
      case "fluid":
      default:
        this.current = new FluidSim("scene-div");
        break;
    }
  }

  figureUrlParams() {
    const string = document.location.search.split("?b=")[1];
    this.setState({showing: string}, () => {
      this.figureBackground();
      this.current.create();
    });
  }

  showBackGround = (i) => {
    this.current.destroy();
    document.getElementById("scene-div").innerHTML = "";
    
    this.setState({showing: i}, () => {
      this.figureBackground();
      this.current.create();
    });
  }

  componentDidMount() {
    this.figureUrlParams();
  }

  componentWillUnmount() {
    this.current.destroy();
    this.current = null;
  }

  render() {
    return (
      <div id="app">
        <Navigation show={this.showBackGround} showing={this.state.showing}/>
        <div id="scene-div"></div>
      </div>
    )
  }
}

export default App;
