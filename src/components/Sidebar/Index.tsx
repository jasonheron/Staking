import React from 'react'
import './styles.css'
import rugby from "../../assets/images/rugby.png"
import football from "../../assets/images/football.png"
import basketball from "../../assets/images/basketball.png"
import burger from "../../assets/images/burger.png"
import dashboard from "../../assets/images/dashboard.png"
import barchart from "../../assets/images/bar-chart.png"
import logo from "../../assets/images/logo.png"

const Index = () => {
    return (
        <React.Fragment>
            <div className='sidebar-container'>
                <img src={logo} alt="logo" className='logo'/>
                <div>
                    <img src={burger} alt="burger" />
                    <img src={dashboard} alt="dashboard" />
                    <img src={barchart} alt="barchart" />
                </div>
                <div>
                    <img src={football} alt="football" />
                    <img src={rugby} alt="rugby" />
                    <img src={basketball} alt="basketball" />
                </div>
            </div>
        </React.Fragment>
    )
}

export default Index