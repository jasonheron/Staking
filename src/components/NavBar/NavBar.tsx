import React from 'react'
import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import "./style.css"
import logo from "../../assets/images/logo.svg"


const NavBar = () => {
  return (
    <React.Fragment>
      <Navbar expand="lg" className="navbar-container justify-content-end navb-desktop">
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
              <WalletMultiButton />
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Navbar expand="lg" className="navbar-container justify-content-center navb-mobile">
        <div className='d-flex flex-column align-items-center gap-1 py-2'>
        <img src={logo} alt="logo" style={{width:"50px"}} />
          <p className="nav-text">The Premier Collection</p>
          <div>
            <WalletMultiButton />
          </div>
        </div>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto d-flex align-items-center justify-content-between w-100">
            <div className='d-flex align-items-center'>
              <Nav.Link>Matches</Nav.Link>
              <Nav.Link>Staking</Nav.Link>
              <Nav.Link>Rewards</Nav.Link>
              <Nav.Link>Trade</Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse> */}
      </Navbar>
    </React.Fragment>
  )
}

export default NavBar