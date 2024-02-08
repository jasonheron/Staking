import React from 'react'
import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import "./style.css"

const NavBar = () => {
  return (
    <React.Fragment>
      <Navbar expand="lg" className="navbar-container">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto d-flex align-items-center justify-content-between w-100">
            <div className='d-flex align-items-center'>
              <Nav.Link>Matches</Nav.Link>
              <Nav.Link>Staking</Nav.Link>
              <Nav.Link>Rewards</Nav.Link>
              <Nav.Link>Trade</Nav.Link>
            </div>
            <p className="nav-text">The Premier Collection</p>
            <div>
              <WalletMultiButton/>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </React.Fragment>
  )
}

export default NavBar