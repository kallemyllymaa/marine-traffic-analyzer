import React from 'react';

import { Navbar, Nav, NavItem } from 'react-bootstrap';

import { Link } from 'react-router-dom';

const Header = () => (
  <Navbar collapseOnSelect>
    <Navbar.Header>
      <Navbar.Brand>
        <Link to="/">MTF</Link>
      </Navbar.Brand>
    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>
        <NavItem componentClass={Link} href="/" to="/">Home</NavItem>
        <NavItem componentClass={Link} href="ships" to="/ships">Ships</NavItem>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default Header;