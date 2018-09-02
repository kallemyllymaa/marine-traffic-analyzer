import React from 'react';

import { Navbar, Nav } from 'react-bootstrap';

const Header = () => (
  <Navbar collapseOnSelect>
    <Navbar.Header>
      <Navbar.Brand>
        <a href="#home">React-Bootstrap</a>
      </Navbar.Brand>
    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>

      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default Header;