import React, { Component } from 'react';
import MenuIcon from "../assets/icons/MenuIcon";

import 'normalize.css';
import '../styles/style.scss';

class Navigation extends Component {
  constructor() {
    super()
    this.items = ["flowlines", "maze"];
    this.state = {
      visible: false,
    }
  }

  toggleVisible = () => {
    this.setState({visible: !this.state.visible})
  }

  render() {
    const className = () => this.state.visible ? "nav visible" : "nav";

    return (
      <div>
        <MenuIcon click={this.toggleVisible} visible={this.state.visible}/>
        <div className={className()}>
          {this.items.map(item => {
            return (
              <div onClick={() => this.props.show(item)}>
                <h1 key={item}>{item.toUpperCase()}</h1>
              </div>
            );
          })}
        </div>
      </div>
    )
  }
}

export default Navigation;
